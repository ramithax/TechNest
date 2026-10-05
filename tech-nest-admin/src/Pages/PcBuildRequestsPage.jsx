import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  X,
  RefreshCw,
  Cpu,
  User,
  MessageSquare,
  Package,
  Workflow,
  DollarSign,
  CalendarDays,
  Clock,
  CreditCard,
} from "lucide-react";
import api from "@/lib/axios";

export function PcBuildRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const normalizeStatus = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "number") {
      const statuses = [
        "PendingApproval",
        "Approved",
        "Rejected",
        "PaymentPending",
        "Paid",
      ];

      return statuses[value] || "";
    }

    return String(value);
  };

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/PcBuildRequest/admin"
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load PC build requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    try {
      setRefreshing(true);

      const response = await api.get(
        "/PcBuildRequest/admin"
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      toast.success("Requests refreshed.");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to refresh requests."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const openRequest = async (id) => {
    try {
      setLoadingDetails(true);

      const response = await api.get(
        `/PcBuildRequest/admin/${id}`
      );

      const request = response.data;

      setSelectedRequest(request);

      setComment(
        request?.adminComment || ""
      );

      setStatus(
        normalizeStatus(request?.status)
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load request details."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setSelectedRequest(null);
    setComment("");
    setStatus("");
  };

  const updateLocalRequest = (updatedRequest) => {
    if (!updatedRequest) {
      return;
    }

    const normalizedUpdatedRequest = {
      ...updatedRequest,
      status: normalizeStatus(
        updatedRequest.status
      ),
    };

    setSelectedRequest((current) => ({
      ...current,
      ...normalizedUpdatedRequest,
    }));

    setRequests((current) =>
      current.map((request) =>
        request.id === normalizedUpdatedRequest.id
          ? {
              ...request,
              ...normalizedUpdatedRequest,
            }
          : request
      )
    );

    if (normalizedUpdatedRequest.status) {
      setStatus(
        normalizedUpdatedRequest.status
      );
    }

    if (
      normalizedUpdatedRequest.adminComment !==
      undefined
    ) {
      setComment(
        normalizedUpdatedRequest.adminComment || ""
      );
    }
  };

  const changeStatus = async () => {
    if (!selectedRequest) {
      return;
    }

    if (!status) {
      toast.error("Please select a status.");
      return;
    }

    const currentStatus = normalizeStatus(
      selectedRequest.status
    );

    if (status === currentStatus) {
      toast.error(
        "Please select a different status."
      );
      return;
    }

    if (
      status === "Rejected" &&
      !comment.trim()
    ) {
      toast.error(
        "Please enter an admin comment before rejecting."
      );
      return;
    }

    try {
      setActionLoading(true);

      let response;

      // APPROVE
      // Uses the dedicated backend approve endpoint.
      // Backend changes status to PaymentPending.
      if (status === "Approved") {
        response = await api.put(
          `/PcBuildRequest/${selectedRequest.id}/approve`,
          {
            adminComment:
              comment.trim() || null,
          }
        );
      }

      // REJECT
      // Uses the dedicated backend reject endpoint.
      else if (status === "Rejected") {
        response = await api.put(
          `/PcBuildRequest/${selectedRequest.id}/reject`,
          {
            adminComment: comment.trim(),
          }
        );
      }

      // OTHER STATUS CHANGES
      else {
        response = await api.put(
          `/PcBuildRequest/${selectedRequest.id}/status`,
          {
            status,
            adminComment:
              comment.trim() || null,
          }
        );
      }

      updateLocalRequest(response.data);

      if (status === "Approved") {
        toast.success(
          "PC build approved. Payment is now pending."
        );
      } else if (status === "Rejected") {
        toast.success(
          "PC build request rejected."
        );
      } else {
        toast.success(
          "Request status updated."
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update request status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatStatus = (value) => {
    const normalizedStatus =
      normalizeStatus(value);

    if (!normalizedStatus) {
      return "Unknown";
    }

    return normalizedStatus
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  const formatCurrency = (amount) => {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "LKR 0.00";
    }

    return `LKR ${Number(amount).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getCustomerName = (request) => {
    return (
      request?.customer?.name ||
      request?.customer?.Name ||
      request?.user?.name ||
      request?.user?.Name ||
      request?.customerName ||
      request?.userName ||
      "Unknown Customer"
    );
  };

  const getCustomerEmail = (request) => {
    return (
      request?.customer?.email ||
      request?.customer?.Email ||
      request?.user?.email ||
      request?.user?.Email ||
      request?.customerEmail ||
      request?.userEmail ||
      "—"
    );
  };

  const getProductName = (item) => {
    return (
      item?.productName ||
      item?.product?.name ||
      item?.product?.Name ||
      item?.name ||
      "Unknown Product"
    );
  };

  const totalRequests = requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        normalizeStatus(request.status) ===
        "PendingApproval"
    ).length;

  const paymentPendingRequests =
    requests.filter(
      (request) =>
        normalizeStatus(request.status) ===
        "PaymentPending"
    ).length;

  const paidRequests =
    requests.filter(
      (request) =>
        normalizeStatus(request.status) ===
        "Paid"
    ).length;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              PC Build Requests
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Review AI-generated PC builds and manage customer requests.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshRequests}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Requests"
            value={totalRequests}
            icon={Cpu}
          />

          <SummaryCard
            label="Pending Approval"
            value={pendingRequests}
            icon={Clock}
          />

          <SummaryCard
            label="Payment Pending"
            value={paymentPendingRequests}
            icon={CreditCard}
          />

          <SummaryCard
            label="Paid"
            value={paidRequests}
            icon={DollarSign}
          />
        </div>

        {/* REQUEST TABLE */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Loading PC build requests...
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                <Cpu className="h-6 w-6 text-zinc-500" />
              </div>

              <h3 className="text-sm font-semibold text-zinc-900">
                No PC build requests
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Customer PC build requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <TableHeader>
                      Request
                    </TableHeader>

                    <TableHeader>
                      Customer
                    </TableHeader>

                    <TableHeader>
                      Budget
                    </TableHeader>

                    <TableHeader>
                      Total
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-zinc-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-zinc-900">
                          Request #{request.id}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                          <Workflow className="h-3.5 w-3.5" />

                          {request.workflowId || "—"}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                          <CalendarDays className="h-3.5 w-3.5" />

                          {formatDate(
                            request.createdAt
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                            <User className="h-4 w-4 text-zinc-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {getCustomerName(
                                request
                              )}
                            </p>

                            <p className="truncate text-xs text-zinc-500">
                              {getCustomerEmail(
                                request
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-zinc-900">
                          {formatCurrency(
                            request.budget
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-zinc-900">
                          {formatCurrency(
                            request.totalAmount
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={request.status}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openRequest(
                              request.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* LOADING DETAILS */}
      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-6 py-5 shadow-xl">
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading request details...
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                  <Cpu className="h-5 w-5 text-zinc-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    PC Build Request #
                    {selectedRequest.id}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(
                      selectedRequest.createdAt
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto px-6 py-6">
              {/* CUSTOMER / BUDGET / WORKFLOW */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <InfoCard
                  icon={User}
                  label="Customer"
                  value={getCustomerName(
                    selectedRequest
                  )}
                  secondary={getCustomerEmail(
                    selectedRequest
                  )}
                />

                <InfoCard
                  icon={DollarSign}
                  label="Budget"
                  value={formatCurrency(
                    selectedRequest.budget
                  )}
                />

                <InfoCard
                  icon={Workflow}
                  label="Workflow"
                  value={
                    selectedRequest.workflowId ||
                    "—"
                  }
                />
              </div>

              {/* CURRENT STATUS */}
              <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Current Request Status
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        status={
                          selectedRequest.status
                        }
                        large
                      />
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs text-zinc-500">
                      Total Build Cost
                    </p>

                    <p className="mt-1 text-xl font-semibold text-zinc-900">
                      {formatCurrency(
                        selectedRequest.totalAmount
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* CHANGE STATUS */}
              <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Change Request Status
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Approving the request automatically moves it to Payment Pending.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value
                      )
                    }
                    disabled={actionLoading}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
                  >
                    <option value="PendingApproval">
                      Pending Approval
                    </option>

                    <option value="Approved">
                      Approve
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                    <option value="Paid">
                      Paid
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={changeStatus}
                    disabled={
                      actionLoading ||
                      status ===
                        normalizeStatus(
                          selectedRequest.status
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}

                    {!actionLoading &&
                      "Update Status"}

                    {actionLoading &&
                      "Updating..."}
                  </button>
                </div>
              </div>

              {/* ADMIN COMMENT */}
              <div className="mb-6">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <MessageSquare className="h-4 w-4 text-zinc-500" />
                  Admin Comment
                </label>

                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  rows={4}
                  disabled={actionLoading}
                  placeholder="Add a comment for the customer..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
                />

                <p className="mt-2 text-xs text-zinc-400">
                  A comment is required when changing the status to Rejected.
                </p>
              </div>

              {/* COMPONENTS */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-zinc-500" />

                    <h3 className="text-sm font-semibold text-zinc-900">
                      Recommended Components
                    </h3>
                  </div>

                  <span className="text-xs text-zinc-500">
                    {selectedRequest.items
                      ?.length || 0}{" "}
                    items
                  </span>
                </div>

                {!selectedRequest.items ||
                selectedRequest.items.length ===
                  0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
                    <p className="text-sm text-zinc-500">
                      No components found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-zinc-200">
                    <table className="w-full text-left">
                      <thead className="border-b border-zinc-200 bg-zinc-50">
                        <tr>
                          <TableHeader>
                            Product
                          </TableHeader>

                          <TableHeader>
                            Quantity
                          </TableHeader>

                          <TableHeader>
                            Unit Price
                          </TableHeader>

                          <TableHeader>
                            Total
                          </TableHeader>

                          <TableHeader>
                            Reason
                          </TableHeader>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-100">
                        {selectedRequest.items.map(
                          (item) => {
                            const itemTotal =
                              Number(
                                item.unitPrice ||
                                  0
                              ) *
                              Number(
                                item.quantity ||
                                  0
                              );

                            return (
                              <tr
                                key={
                                  item.id ||
                                  `${item.productId}-${item.quantity}`
                                }
                                className="hover:bg-zinc-50"
                              >
                                <td className="px-4 py-4">
                                  <p className="text-sm font-medium text-zinc-900">
                                    {getProductName(
                                      item
                                    )}
                                  </p>
                                </td>

                                <td className="px-4 py-4 text-sm text-zinc-700">
                                  {item.quantity}
                                </td>

                                <td className="px-4 py-4 text-sm text-zinc-700">
                                  {formatCurrency(
                                    item.unitPrice
                                  )}
                                </td>

                                <td className="px-4 py-4 text-sm font-medium text-zinc-900">
                                  {formatCurrency(
                                    itemTotal
                                  )}
                                </td>

                                <td className="max-w-[280px] px-4 py-4">
                                  <p className="text-sm leading-5 text-zinc-500">
                                    {item.reason ||
                                      "—"}
                                  </p>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* CUSTOMER NOTE */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <MessageSquare className="h-4 w-4 text-zinc-500" />
                  Customer Note
                </h3>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                    {selectedRequest.customerNote ||
                      "No customer note was provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
              <div className="text-xs text-zinc-500">
                {selectedRequest.approvedAt && (
                  <span>
                    Approved:{" "}
                    {formatDate(
                      selectedRequest.approvedAt
                    )}
                  </span>
                )}

                {selectedRequest.paidAt && (
                  <span className="ml-4">
                    Paid:{" "}
                    {formatDate(
                      selectedRequest.paidAt
                    )}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  large = false,
}) {
  const normalizeStatus = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    if (typeof value === "number") {
      const statuses = [
        "PendingApproval",
        "Approved",
        "Rejected",
        "PaymentPending",
        "Paid",
      ];

      return statuses[value] || "";
    }

    return String(value);
  };

  const normalizedStatus =
    normalizeStatus(status);

  const getStatusStyle = () => {
    switch (normalizedStatus) {
      case "PendingApproval":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "PaymentPending":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Paid":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
    }
  };

  const getDotStyle = () => {
    switch (normalizedStatus) {
      case "PendingApproval":
        return "bg-amber-500";

      case "Approved":
        return "bg-emerald-500";

      case "PaymentPending":
        return "bg-blue-500";

      case "Paid":
        return "bg-purple-500";

      case "Rejected":
        return "bg-red-500";

      default:
        return "bg-zinc-400";
    }
  };

  const displayStatus = normalizedStatus
    ? normalizedStatus
        .replace(/([A-Z])/g, " $1")
        .trim()
    : "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        large
          ? "px-3 py-1.5 text-xs"
          : "px-2.5 py-1 text-xs"
      } font-medium ${getStatusStyle()}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${getDotStyle()}`}
      />

      {displayStatus}
    </span>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {children}
    </th>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
          <Icon className="h-5 w-5 text-zinc-600" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  secondary,
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
          <Icon className="h-4 w-4 text-zinc-600" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-zinc-500">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-medium text-zinc-900">
            {value}
          </p>

          {secondary && (
            <p className="mt-1 truncate text-xs text-zinc-500">
              {secondary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}