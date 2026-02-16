"use client";

import { useEffect, useState } from "react";
import {
  Plus, Search, Edit, Trash2, Copy, Check, Calendar, Percent, DollarSign,
  Tag, TrendingUp, X, Save, AlertCircle, Clock, Users, ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  // Form state
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  /* ================= FETCH COUPONS ================= */
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupon");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ================= CREATE/UPDATE COUPON ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: form.code.toUpperCase(),
      description: form.description || null,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : null,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      isActive: form.isActive,
    };

    try {
      const res = await fetch(
        editingCoupon ? `/api/admin/coupon/${editingCoupon.id}` : "/api/admin/coupon",
        {
          method: editingCoupon ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      toast.success(editingCoupon ? "Coupon updated!" : "Coupon created!");
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to save coupon");
    }
  };

  /* ================= DELETE COUPON ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon permanently?")) return;

    try {
      const res = await fetch(`/api/admin/coupon/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  /* ================= TOGGLE ACTIVE STATUS ================= */
  const toggleActive = async (coupon) => {
    try {
      const res = await fetch(`/api/admin/coupon/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...coupon, isActive: !coupon.isActive }),
      });

      if (!res.ok) throw new Error();

      toast.success(coupon.isActive ? "Coupon disabled" : "Coupon enabled");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderValue: "",
      maxDiscount: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      usageLimit: "",
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderValue: coupon.minOrderValue?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : "",
      usageLimit: coupon.usageLimit?.toString() || "",
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isUsageLimitReached = (coupon) => {
    if (!coupon.usageLimit) return false;
    return coupon.usedCount >= coupon.usageLimit;
  };

  /* ================= FILTERED COUPONS ================= */
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= STATS ================= */
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive && !isExpired(c.endDate)).length,
    expired: coupons.filter(c => isExpired(c.endDate)).length,
    totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Coupon Management</h1>
              <p className="text-gray-600">Create and manage discount codes for your store</p>
            </div>
            <Button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-sky-700 hover:to-blue-700 gap-2"
            >
              <Plus size={18} />
              Create Coupon
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Coupons</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Coupons</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Uses</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search coupons by code or description..."
              className="pl-10 h-11 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading coupons...</p>
            </div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Try adjusting your search" : "Create your first coupon to get started"}
            </p>
            {!searchTerm && (
              <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700">
                <Plus size={18} className="mr-2" />
                Create First Coupon
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => {
              const expired = isExpired(coupon.endDate);
              const limitReached = isUsageLimitReached(coupon);
              const isInactive = !coupon.isActive || expired || limitReached;

              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-2xl border-2 p-6 shadow-sm hover:shadow-lg transition-all ${
                    isInactive ? "border-gray-200 opacity-75" : "border-blue-200"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-wide">
                          {coupon.code}
                        </h3>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          {copiedCode === coupon.code ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-600">{coupon.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => toggleActive(coupon)}
                      className="ml-3"
                      title={coupon.isActive ? "Disable coupon" : "Enable coupon"}
                    >
                      {coupon.isActive ? (
                        <ToggleRight size={32} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={32} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  {/* Discount Info */}
                  <div className="bg-gradient-to-r from-slate-500 to-gray-400 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      {coupon.discountType === "PERCENTAGE" ? (
                        <>
                          <Percent className="text-gray-100" size={24} />
                          <span className="text-3xl font-bold text-gray-100">
                            {coupon.discountValue}%
                          </span>
                          <span className="text-sm text-gray-100">OFF</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="text-blue-600" size={24} />
                          <span className="text-3xl font-bold text-blue-600">
                            {coupon.discountValue}
                          </span>
                          <span className="text-sm text-gray-600">SAR OFF</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {coupon.minOrderValue && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Min. Order</p>
                        <p className="font-semibold text-gray-900">SAR {coupon.minOrderValue}</p>
                      </div>
                    )}
                    {coupon.maxDiscount && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Max Discount</p>
                        <p className="font-semibold text-gray-900">SAR {coupon.maxDiscount}</p>
                      </div>
                    )}
                    {coupon.usageLimit && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Usage</p>
                        <p className="font-semibold text-gray-900">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </p>
                      </div>
                    )}
                    {coupon.endDate && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Expires</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(coupon.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {coupon.isActive && !expired && !limitReached && (
                      <Badge className="bg-green-100 text-green-700 border-none">
                        Active
                      </Badge>
                    )}
                    {!coupon.isActive && (
                      <Badge className="bg-gray-100 text-gray-700 border-none">
                        Disabled
                      </Badge>
                    )}
                    {expired && (
                      <Badge className="bg-red-100 text-red-700 border-none">
                        Expired
                      </Badge>
                    )}
                    {limitReached && (
                      <Badge className="bg-orange-100 text-orange-700 border-none">
                        Limit Reached
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {coupon.discountType}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => openEditModal(coupon)}
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  required
                  className="font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summer sale discount"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (SAR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "PERCENTAGE" ? "10" : "50"}
                    required
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Order Value (SAR)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Discount (SAR)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="50.00"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit
                </label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="Unlimited if empty"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Activate coupon immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 gap-2"
                >
                  <Save size={18} />
                  {editingCoupon ? "Update" : "Create"} Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}