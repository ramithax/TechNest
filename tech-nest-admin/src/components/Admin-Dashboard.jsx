import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Wrench,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowUpRight,
  Clock,
  Package,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2
} from "lucide-react";
import api from "@/lib/axios";

// Format number as currency string
const formatMoney = (value) => {
  const numeric = Number(value ?? 0);
  const formattedString = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(numeric) ? numeric : 0);
  
  return `Rs. ${formattedString}`;
};

// Format relative time for display
const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Just now";

  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

// Build sales chart data from orders
const buildSalesChart = (orders) => {
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setHours(date.getHours() - (11 - index));
    date.setMinutes(0, 0, 0);

    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sales: 0
    };
  });

  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;

    const hourIndex = buckets.findIndex((bucket) => {
      const bucketDate = new Date();
      const [hour, minute] = bucket.time.split(":");
      const normalized = bucket.time.includes("PM") ? "PM" : "AM";
      const parsed = Number(hour);
      const bucketHour = normalized === "PM" && parsed !== 12 ? parsed + 12 : parsed;
      const bucketMinutes = Number(minute);

      bucketDate.setHours(bucketHour, bucketMinutes, 0, 0);
      return Math.abs(bucketDate.getTime() - createdAt.getTime()) < 60 * 60 * 1000;
    });

    if (hourIndex >= 0) {
      buckets[hourIndex].sales += Number(order.totalAmount ?? 0);
    }
  });

  return buckets;
};

// Build recent activity feed data
const buildRecentActivity = (orders, repairs, users) => {
  const activities = [
    ...orders.slice(0, 4).map((order) => ({
      id: `order-${order.id}`,
      title: "New order received",
      subtitle: `${order.customerName || "Customer"} • ${formatMoney(order.totalAmount)}`,
      time: formatRelativeTime(order.createdAt),
      createdAt: order.createdAt,
      icon: ShoppingBag,
      iconColor: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20",
      badge: "Order"
    })),
    ...repairs.slice(0, 3).map((repair) => ({
      id: `repair-${repair.id}`,
      title: "Repair request submitted",
      subtitle: `${repair.deviceModel || "Device"} • ${repair.status || "Pending"}`,
      time: formatRelativeTime(repair.createdAt),
      createdAt: repair.createdAt,
      icon: Wrench,
      iconColor: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/20",
      badge: "Repair"
    })),
    ...users.slice(0, 2).map((user) => ({
      id: `user-${user.id}`,
      title: "Customer registration",
      subtitle: `${user.name || "New customer"} joined TechNest`,
      time: formatRelativeTime(user.createdAt),
      createdAt: user.createdAt,
      icon: Users,
      iconColor: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/20",
      badge: "User"
    }))
  ];

  return activities
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
};

// Custom Tooltip component for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/95 text-zinc-900 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 dark:text-white">
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <Clock className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
          <span>{label}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Sales:</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function AdminDashboard() {
  // -------------------------------------------------------------
  // 1. Live Sales Chart Data State & 1.5s Interval Hook
  // -------------------------------------------------------------
  const [chartData, setChartData] = useState(() => {
    const initialData = [];
    const now = Date.now();
    let currentVal = 2400;

    for (let i = 13; i >= 0; i--) {
      const timeStr = new Date(now - i * 1500).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      currentVal = Math.max(1200, Math.min(3800, currentVal + Math.floor(Math.random() * 300 - 140)));
      initialData.push({ time: timeStr, sales: currentVal });
    }
    return initialData;
  });

  const [liveSalesTotal, setLiveSalesTotal] = useState(0);
  const [liveOrdersCount, setLiveOrdersCount] = useState(0);
  const [liveCustomersCount, setLiveCustomersCount] = useState(0);
  const [liveRepairsCount, setLiveRepairsCount] = useState(0);
  const [pendingRepairs, setPendingRepairs] = useState(0);

  // -------------------------------------------------------------
  // 2. Live Activity Feed State & 4s Interval Hook
  // -------------------------------------------------------------
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from backend API
  const fetchDashboardData = async () => {
    try {
      const [ordersResponse, repairsResponse, usersResponse] = await Promise.all([
        api.get("/Order/admin", { params: { page: 1, pageSize: 100 } }),
        api.get("/Repair"),
        api.get("/Auth/users")
      ]);

      const orders = ordersResponse?.data?.items || [];
      const repairs = repairsResponse?.data || [];
      const users = usersResponse?.data || [];

      const totalSales = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount ?? 0),
        0
      );

      const pending = repairs.filter((repair) => {
        const status = String(repair.status || "").toLowerCase();
        return !["completed", "cancelled", "resolved"].includes(status);
      }).length;

      setLiveSalesTotal(totalSales);
      setLiveOrdersCount(orders.length);
      setLiveCustomersCount(users.length);
      setLiveRepairsCount(repairs.length);
      setPendingRepairs(pending);
      setChartData(buildSalesChart(orders));
      setActivities(buildRecentActivity(orders, repairs, users));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setLiveSalesTotal(0);
      setLiveOrdersCount(0);
      setLiveCustomersCount(0);
      setLiveRepairsCount(0);
      setPendingRepairs(0);
      setChartData([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const timer = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-white p-6 md:p-8 overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-[130px]" />

      <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:bg-gradient-to-r dark:from-white dark:via-zinc-200 dark:to-zinc-400 dark:bg-clip-text dark:text-transparent">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE STREAM
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back to your TechNest anti-gravity command center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 px-3 py-1.5 text-xs font-medium backdrop-blur-md shadow-sm">
            <Activity className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span>{loading ? "Syncing live data..." : "System Telemetry: Optimal"}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ANTI-GRAVITY STAT CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Sales Card */}
        <div className="group relative rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white hover:border-emerald-500/50 shadow-lg shadow-zinc-200/50 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 dark:hover:border-emerald-500/40 dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Sales
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-transform duration-300 group-hover:scale-110">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {formatMoney(liveSalesTotal)}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Live revenue from orders</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="group relative rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white hover:border-blue-500/50 shadow-lg shadow-zinc-200/50 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 dark:hover:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Orders
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-transform duration-300 group-hover:scale-110">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {liveOrdersCount.toLocaleString()}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Fetched from backend</span>
          </div>
        </div>

        {/* Customers Card */}
        <div className="group relative rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white hover:border-purple-500/50 shadow-lg shadow-zinc-200/50 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 dark:hover:border-purple-500/40 dark:shadow-[0_0_20px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Customers
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-transform duration-300 group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {liveCustomersCount.toLocaleString()}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Registered users</span>
          </div>
        </div>

        {/* Repairs Card */}
        <div className="group relative rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white hover:border-amber-500/50 shadow-lg shadow-zinc-200/50 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 dark:hover:border-amber-500/40 dark:shadow-[0_0_20px_rgba(245,158,11,0.1)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Repairs
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-transform duration-300 group-hover:scale-110">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {liveRepairsCount.toLocaleString()}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{pendingRepairs} pending diagnostics</span>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2 & 3. LIVE SALES CHART & LIVE ACTIVITY FEED GRID */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2. LIVE SALES CHART COMPONENT */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-white/20 shadow-lg shadow-zinc-200/50 dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Sales Overview
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Syncing live data
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Real-time financial telemetry & active stream data
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white px-3 py-1.5 text-xs font-medium transition-colors">
                Live Feed
              </button>
              <button className="rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white px-3 py-1.5 text-xs font-medium transition-colors">
                Last 12 Hours
              </button>
            </div>
          </div>

          {/* Recharts AreaChart Container */}
          <div className="mt-6 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length ? chartData : [{ time: "No data", sales: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="antiGravitySalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272a]" vertical={false} />
                
                <XAxis
                  dataKey="time"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e4e4e7" }}
                  dy={5}
                />
                
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rs. ${val}`}
                />

                <Tooltip content={<CustomChartTooltip />} />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#antiGravitySalesGradient)"
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* 3. LIVE ACTIVITY FEED */}
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-white/20 shadow-lg shadow-zinc-200/50 dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Recent Activity
                </h2>
                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-bounce" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                Fetched live
              </span>
            </div>
            
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Live store activity & real-time events stream
            </p>

            {/* Framer-Motion Animated List */}
            <div className="mt-6 space-y-3">
              <AnimatePresence initial={false} mode="popLayout">
                {activities.length > 0 ? activities.map((item, index) => {
                  const Icon = item.icon;
                  const isLatest = index === 0;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -25, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: 15 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative flex items-start gap-3.5 rounded-xl border p-3.5 backdrop-blur-md transition-all duration-200 ${
                        isLatest
                          ? "border-emerald-500/40 bg-emerald-500/10 text-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:border-emerald-500/30 dark:bg-emerald-500/[0.04]"
                          : "border-zinc-200/80 bg-zinc-50/80 hover:bg-zinc-100 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:hover:border-white/10"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>

                      {isLatest && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      )}
                    </motion.div>
                  );
                }) : (
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400">
                    No recent activity available.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Feed Connected
            </span>
            <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              View Log &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;