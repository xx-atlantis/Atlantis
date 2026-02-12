"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Trash2, Eye, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, UserCheck, UserX, Mail, Phone, ShoppingCart, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CustomersAdmin() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // States for API triggers
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [orderSort, setOrderSort] = useState(""); // 'asc', 'desc', or ''
  const [page, setPage] = useState(1);

  /* ================= FETCH ALL CUSTOMERS (API 1) ================= */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/customers?page=${page}&limit=10&search=${search}`;
      if (verifiedFilter !== "all") url += `&verified=${verifiedFilter}`;
      if (orderSort) url += `&orderSort=${orderSort}`;

      const res = await fetch(url);
      const json = await res.json();
      setData(json.customers);
      setMeta(json.pagination);
    } catch (err) {
      console.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, search, verifiedFilter, orderSort]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 400); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  /* ================= DELETE CUSTOMER (API 2) ================= */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will not delete their order history but will unlink them.")) return;

    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (res.ok) fetchCustomers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ================= TOGGLE ORDER SORT ================= */
  const toggleOrderSort = () => {
    if (orderSort === "") setOrderSort("desc");
    else if (orderSort === "desc") setOrderSort("asc");
    else setOrderSort("");
  };

  /* ================= STATS CARDS ================= */
  const stats = {
    total: meta.total,
    verified: data.filter(c => c.verified).length,
    withOrders: data.filter(c => c._count.orders > 0).length,
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Customer Management</h1>
              <p className="text-gray-600">Manage users, track orders, and monitor verification status</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="px-4 py-2 bg-blue-50 rounded-lg">
                <span className="font-bold text-blue-600">{meta.total}</span> Total
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Shoppers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.withOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name, email or phone..."
                className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select
              className="h-11 border border-gray-200 rounded-lg px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={verifiedFilter}
              onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="true">✓ Verified Only</option>
              <option value="false">⊘ Unverified</option>
            </select>

            <Button
              variant="outline"
              className="h-11 gap-2 border-gray-200"
              onClick={toggleOrderSort}
            >
              {orderSort === "" && <ArrowUpDown size={16} />}
              {orderSort === "desc" && <ArrowDown size={16} className="text-blue-600" />}
              {orderSort === "asc" && <ArrowUp size={16} className="text-blue-600" />}
              Sort by Orders
              {orderSort && <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">{orderSort === "desc" ? "High→Low" : "Low→High"}</Badge>}
            </Button>
          </div>
        </div>

        {/* Table Data */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Orders</TableHead>
                <TableHead className="font-semibold">Last Order</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500">Loading customers...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-5xl mb-2">🔍</div>
                      <p className="text-gray-600 font-medium">No customers found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2D3247] to-[#495170] text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {customer.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name || "Unnamed User"}</p>
                        <p className="text-xs text-gray-400">ID: {customer.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={13} className="text-gray-400" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={13} className="text-gray-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {customer.verified ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        <UserCheck size={12} className="mr-1" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                        <UserX size={12} className="mr-1" /> Pending
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        {customer._count.orders}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer._count.orders === 1 ? "order" : "orders"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {customer.orders[0] ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 font-medium">
                          {new Date(customer.orders[0].createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs font-semibold text-blue-600">
                          SAR {customer.orders[0].total.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No orders yet</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold text-gray-900">{meta.page}</span> of <span className="font-semibold text-gray-900">{meta.totalPages}</span>
            <span className="ml-2 text-gray-400">({meta.total} total)</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="gap-1"
            >
              <ChevronLeft size={16} /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="gap-1"
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}