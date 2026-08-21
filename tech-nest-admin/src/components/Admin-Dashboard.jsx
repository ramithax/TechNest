function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#09090b] p-8 text-white">

      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Welcome back to your TechNest admin panel.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">

        {/* Total Sales */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">
            Total Sales
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            $24,580
          </h2>

          <p className="mt-2 text-xs text-emerald-400">
            +12.5% from last month
          </p>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">
            Orders
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            1,248
          </h2>

          <p className="mt-2 text-xs text-emerald-400">
            +8.2% from last month
          </p>
        </div>

        {/* Customers */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">
            Customers
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            3,842
          </h2>

          <p className="mt-2 text-xs text-emerald-400">
            +5.7% from last month
          </p>
        </div>

        {/* Repairs */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">
            Repairs
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            86
          </h2>

          <p className="mt-2 text-xs text-amber-400">
            14 pending
          </p>
        </div>

      </div>

      {/* Main Dashboard Area */}
      <div className="mt-6 grid grid-cols-3 gap-6">

        {/* Sales Overview */}
        <div className="col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium">
                Sales Overview
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your sales performance over the last 30 days
              </p>
            </div>

            <button className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white">
              Last 30 days
            </button>
          </div>

          {/* Chart Placeholder */}
          <div className="mt-6 flex h-[280px] items-center justify-center rounded-lg border border-dashed border-zinc-800">
            <span className="text-sm text-zinc-600">
              Sales chart
            </span>
          </div>

        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">

          <h2 className="text-base font-medium">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Latest activity in your store
          </p>

          <div className="mt-6 space-y-5">

            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-800 text-xs">
                +
              </div>

              <div>
                <p className="text-sm">
                  New order received
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Order #TN-1048
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-800 text-xs">
                ⚒
              </div>

              <div>
                <p className="text-sm">
                  Repair request submitted
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Dell Inspiron 15
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-800 text-xs">
                ✦
              </div>

              <div>
                <p className="text-sm">
                  AI recommendation approved
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  PC Builder Agent
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Recent Orders */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium">
              Recent Orders
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Latest orders from your customers
            </p>
          </div>

          <button className="text-xs text-zinc-400 hover:text-white">
            View all →
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800">

          <div className="grid grid-cols-5 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs text-zinc-500">
            <span>Order</span>
            <span>Customer</span>
            <span>Product</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="grid grid-cols-5 px-4 py-4 text-sm">
            <span>#TN-1048</span>
            <span className="text-zinc-400">John Silva</span>
            <span className="text-zinc-400">RTX 4070 Super</span>
            <span className="text-emerald-400">Completed</span>
            <span className="text-right">$1,249</span>
          </div>

          <div className="grid grid-cols-5 border-t border-zinc-800 px-4 py-4 text-sm">
            <span>#TN-1047</span>
            <span className="text-zinc-400">Kasun Perera</span>
            <span className="text-zinc-400">Gaming PC Build</span>
            <span className="text-amber-400">Processing</span>
            <span className="text-right">$2,180</span>
          </div>

          <div className="grid grid-cols-5 border-t border-zinc-800 px-4 py-4 text-sm">
            <span>#TN-1046</span>
            <span className="text-zinc-400">Nimal Fernando</span>
            <span className="text-zinc-400">Mechanical Keyboard</span>
            <span className="text-emerald-400">Completed</span>
            <span className="text-right">$145</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;