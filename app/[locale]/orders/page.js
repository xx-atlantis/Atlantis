"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { 
  Package, MapPin, Calendar, ChevronRight, ArrowLeft, Tag, ShoppingBag, 
  Loader2, Search, Filter, X, Clock, CheckCircle, XCircle, Truck,
  CreditCard, FileText, Download, RefreshCw
} from "lucide-react";

export default function MyOrders() {
  const { locale } = useLocale();
  const { data: cmsData } = usePageContent();
  const isRTL = locale === "ar";

  // --- State Management ---
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // --- Filter & Search State ---
  const [activeTab, setActiveTab] = useState("all"); // all, shop, package
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // --- Fetch Orders Function ---
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);

      const tRes = await fetch("/api/customer-token");
      const tData = await tRes.json();
      if (!tData.success) return;

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(activeTab !== "all" && { orderType: activeTab }),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { orderStatus: statusFilter }),
        ...(paymentFilter !== "all" && { paymentStatus: paymentFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      });

      const res = await fetch(`/api/customer-orders?${params}`, {
        headers: { Authorization: `Bearer ${tData.token}` },
      });

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchOrders(1);
  }, [activeTab, statusFilter, paymentFilter, dateRange]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || searchQuery === "") {
        fetchOrders(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- CMS Content ---
  const content = cmsData?.ordersContent || {
    titles: {
      main: isRTL ? "طلباتي" : "My Orders",
      sub: isRTL ? "إدارة مشتريات الأثاث وباقات الترميم الخاصة بك" : "Track and manage all your orders in one place",
    },
    tabs: {
      all: isRTL ? "الكل" : "All Orders",
      shop: isRTL ? "المتجر" : "Shop",
      package: isRTL ? "الباقات" : "Packages",
    },
    filters: {
      search: isRTL ? "البحث بالرقم أو المنتج..." : "Search by ID or product...",
      status: isRTL ? "حالة الطلب" : "Order Status",
      payment: isRTL ? "حالة الدفع" : "Payment Status",
      dateRange: isRTL ? "نطاق التاريخ" : "Date Range",
      apply: isRTL ? "تطبيق" : "Apply Filters",
      clear: isRTL ? "مسح" : "Clear All",
    },
    labels: {
      orderId: isRTL ? "رقم الطلب" : "Order ID",
      date: isRTL ? "التاريخ" : "Date",
      status: isRTL ? "الحالة" : "Status",
      total: isRTL ? "الإجمالي" : "Total",
      backBtn: isRTL ? "العودة للطلبات" : "Back to Orders",
      summary: isRTL ? "ملخص الطلب" : "Order Summary",
      address: isRTL ? "عنوان التوصيل" : "Shipping Address",
      qty: isRTL ? "الكمية" : "Qty",
      items: isRTL ? "عنصر" : "items",
      noOrders: isRTL ? "لا توجد طلبات" : "No orders found",
      noOrdersSub: isRTL ? "جرب تعديل الفلاتر أو البحث" : "Try adjusting your filters or search",
    },
    statuses: {
      pending: isRTL ? "قيد الانتظار" : "Pending",
      processing: isRTL ? "قيد المعالجة" : "Processing",
      shipped: isRTL ? "تم الشحن" : "Shipped",
      delivered: isRTL ? "تم التوصيل" : "Delivered",
      cancelled: isRTL ? "ملغي" : "Cancelled",
      paid: isRTL ? "مدفوع" : "Paid",
      unpaid: isRTL ? "غير مدفوع" : "Unpaid",
    }
  };

  // --- Helper Functions ---
  const formatPrice = (val) => `${val.toLocaleString()} ${isRTL ? "ر.س" : "SAR"}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: "bg-amber-50", text: "text-amber-600", icon: Clock },
      processing: { bg: "bg-blue-50", text: "text-blue-600", icon: RefreshCw },
      shipped: { bg: "bg-purple-50", text: "text-purple-600", icon: Truck },
      delivered: { bg: "bg-green-50", text: "text-green-600", icon: CheckCircle },
      cancelled: { bg: "bg-red-50", text: "text-red-600", icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRange({ start: "", end: "" });
    setActiveTab("all");
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {!selectedOrderId ? (
          /* ===== ORDERS LIST VIEW ===== */
          <>
            {/* Header */}
            <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
              <h1 className="text-3xl sm:text-4xl font-black text-[#2D3247] mb-2 tracking-tight">
                {content.titles.main}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base font-medium">{content.titles.sub}</p>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 font-bold text-[#2D3247]">
                  {pagination.total} {content.labels.items}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex flex-wrap gap-3">
              {["all", "shop", "package"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-[#2D3247] text-white shadow-lg shadow-[#2D3247]/30"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {tab === "all" && <ShoppingBag className="inline w-4 h-4 mr-2" />}
                  {tab === "shop" && <Tag className="inline w-4 h-4 mr-2" />}
                  {tab === "package" && <Package className="inline w-4 h-4 mr-2" />}
                  {content.tabs[tab]}
                </button>
              ))}
            </div>

            {/* Search & Filters Bar */}
            <div className="mb-6 bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-4" : "left-4"} text-gray-400`} size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={content.filters.search}
                    className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-2xl border-2 border-gray-200 focus:border-[#2D3247] outline-none transition-colors font-medium`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-4" : "right-4"} text-gray-400 hover:text-gray-600`}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 transition-colors"
                >
                  <Filter size={20} />
                  {content.filters.status}
                  {(statusFilter !== "all" || paymentFilter !== "all" || dateRange.start) && (
                    <span className="w-2 h-2 bg-[#2D3247] rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{content.filters.status}</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2D3247] outline-none font-medium"
                    >
                      <option value="all">{content.tabs.all}</option>
                      <option value="pending">{content.statuses.pending}</option>
                      <option value="processing">{content.statuses.processing}</option>
                      <option value="shipped">{content.statuses.shipped}</option>
                      <option value="delivered">{content.statuses.delivered}</option>
                      <option value="cancelled">{content.statuses.cancelled}</option>
                    </select>
                  </div>

                  {/* Payment Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{content.filters.payment}</label>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2D3247] outline-none font-medium"
                    >
                      <option value="all">{content.tabs.all}</option>
                      <option value="paid">{content.statuses.paid}</option>
                      <option value="pending">{content.statuses.unpaid}</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{content.filters.dateRange}</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="flex-1 px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2D3247] outline-none text-sm"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="flex-1 px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2D3247] outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(statusFilter !== "all" || paymentFilter !== "all" || dateRange.start) && (
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X size={16} />
                        {content.filters.clear}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#2D3247] mb-4" size={48} />
                <p className="text-gray-500 font-medium">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100">
                <Package className="text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-700 mb-2">{content.labels.noOrders}</h3>
                <p className="text-gray-500 text-sm">{content.labels.noOrdersSub}</p>
              </div>
            ) : (
              <div className="grid gap-5">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div 
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-[#2D3247]/20 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left Section */}
                        <div className="flex items-start gap-5 flex-1">
                          {/* Icon */}
                          <div className="w-16 h-16 bg-gradient-to-br from-[#2D3247] to-[#3d4357] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#2D3247]/30 flex-shrink-0">
                            {order.orderType === "shop" ? <ShoppingBag size={28} /> : <Package size={28} />}
                          </div>

                          {/* Order Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-black text-[#2D3247] text-lg">
                                #{order.id.slice(-8).toUpperCase()}
                              </h4>
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase">
                                {order.orderType}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Calendar size={14} className="text-gray-400"/>
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="flex items-center gap-1.5 font-medium">
                                <Package size={14} className="text-gray-400"/>
                                {order.items.length} {content.labels.items}
                              </span>
                            </div>

                            {/* First Item Preview */}
                            {order.items[0] && (
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img 
                                    src={order.items[0].coverImage} 
                                    alt={order.items[0].name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-sm text-gray-600 font-medium truncate">
                                  {order.items[0].name}
                                  {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 lg:gap-8">
                          {/* Status */}
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">
                              {content.labels.status}
                            </p>
                            <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                              <StatusIcon size={14} />
                              {content.statuses[order.orderStatus] || order.orderStatus}
                            </span>
                          </div>

                          {/* Total */}
                          <div className={isRTL ? "text-right" : "text-left lg:text-right"}>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">
                              {content.labels.total}
                            </p>
                            <p className="text-[#2D3247] font-black text-xl">
                              {formatPrice(order.total)}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight 
                            className={`text-gray-300 group-hover:text-[#2D3247] transition-all flex-shrink-0 ${
                              isRTL ? "rotate-180" : "group-hover:translate-x-1"
                            }`} 
                            size={24}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-10 gap-2">
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {isRTL ? "التالي" : "Prev"}
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first 2, last 2, and current ±1
                  if (
                    pageNum === 1 || 
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => fetchOrders(pageNum)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                          pagination.page === pageNum
                            ? 'bg-[#2D3247] text-white shadow-lg shadow-[#2D3247]/30'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={i} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {isRTL ? "السابق" : "Next"}
                </button>
              </div>
            )}
          </>
        ) : (
          /* ===== ORDER DETAILS VIEW ===== */
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setSelectedOrderId(null)}
              className="group flex items-center text-[#2D3247] mb-8 hover:gap-3 transition-all font-bold text-lg"
            >
              <ArrowLeft className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 ml-2 group-hover:translate-x-1" : "mr-2 group-hover:-translate-x-1"}`} /> 
              {content.labels.backBtn}
            </button>

            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-300/50 border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2D3247] to-[#3d4357] p-8 sm:p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold border border-white/20 mb-4">
                      <FileText size={16} />
                      {selectedOrder.orderType === "shop" ? content.tabs.shop : content.tabs.package}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black mb-3">{content.labels.summary}</h2>
                    <p className="opacity-90 font-medium text-lg">
                      {content.labels.orderId}: <span className="font-mono">#{selectedOrder.id.slice(-12).toUpperCase()}</span>
                    </p>
                    <p className="opacity-80 font-medium mt-1 flex items-center gap-2">
                      <Calendar size={16} />
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const statusConfig = getStatusConfig(selectedOrder.orderStatus);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <span className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl font-bold border border-white/30 text-lg">
                          <StatusIcon size={20} />
                          {content.statuses[selectedOrder.orderStatus] || selectedOrder.orderStatus}
                        </span>
                      );
                    })()}
                    
                    <span className={`flex items-center gap-2 px-6 py-3 backdrop-blur-md rounded-2xl font-bold border text-sm ${
                      selectedOrder.paymentStatus === 'paid' 
                        ? 'bg-green-400/20 border-green-300/50 text-green-100' 
                        : 'bg-amber-400/20 border-amber-300/50 text-amber-100'
                    }`}>
                      <CreditCard size={16} />
                      {selectedOrder.paymentStatus === 'paid' ? content.statuses.paid : content.statuses.unpaid}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 sm:p-12 space-y-10">
                {/* Shipping Address */}
                <div className="flex gap-5 items-start bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="p-4 bg-white rounded-2xl text-[#2D3247] shadow-sm">
                    <MapPin size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-[#2D3247] text-xl mb-2">{content.labels.address}</h3>
                    <p className="text-gray-600 font-medium text-lg">{selectedOrder.address}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="px-3 py-1 bg-white rounded-full font-medium text-gray-600 border border-gray-200">
                        {selectedOrder.customerName}
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full font-medium text-gray-600 border border-gray-200">
                        {selectedOrder.customerPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-black text-[#2D3247] text-2xl mb-6">Order Items ({selectedOrder.items.length})</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-2 border-gray-100 rounded-3xl gap-6 hover:border-[#2D3247]/20 hover:shadow-lg transition-all bg-white"
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                            <img src={item.coverImage} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-[#2D3247] text-lg sm:text-xl mb-2">{item.name}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-bold">
                                {content.labels.qty}: {item.quantity}
                              </span>
                              {item.variant?.value && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold">
                                  {item.variant.value}
                                </span>
                              )}
                              {item.material && (
                                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full font-bold">
                                  {item.material}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={isRTL ? "text-right" : "text-left sm:text-right"}>
                            <p className="text-sm text-gray-400 font-bold mb-1">Unit Price</p>
                            <p className="font-black text-[#2D3247] text-2xl whitespace-nowrap">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border border-gray-200">
                  <h3 className="font-black text-[#2D3247] text-xl mb-6">Payment Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-800">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600 font-medium">Shipping</span>
                      <span className="font-bold text-gray-800">{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600 font-medium">VAT ({(selectedOrder.vat * 100).toFixed(0)}%)</span>
                      <span className="font-bold text-gray-800">{formatPrice(selectedOrder.subtotal * selectedOrder.vat)}</span>
                    </div>
                    <div className="h-px bg-gray-300 my-4"></div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-2xl font-black text-[#2D3247]">{content.labels.total}</span>
                      <span className="text-3xl font-black text-[#2D3247]">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Payment Method</span>
                      <span className="px-4 py-2 bg-white rounded-xl font-bold text-gray-800 border border-gray-200 uppercase">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}