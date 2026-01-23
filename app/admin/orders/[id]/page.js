"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Pencil,
  Save,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

function minutesToHoursString(minutes) {
  if (!minutes || isNaN(minutes)) return "0h 0m";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return "0.00 SAR";
  return `${Number(value).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} SAR`;
}

export default function OrderView() {
  const { id } = useParams(); // /admin/orders/[id]
  const { permissions, loading: authLoading } = useAdminAuth();

  const canUpdate = permissions.includes("order.update");
  const canDelete = permissions.includes("order.delete");

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(null); // UI state
  const [rawOrder, setRawOrder] = useState(null); // original API order
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Map API order to the UI shape your component expects
  const mapApiOrderToUi = (order) => {
    const isPackage = order.orderType === "package";

    return {
      id: order.id,
      createdAt: order.createdAt
        ? new Date(order.createdAt).toISOString().slice(0, 16) // for datetime-local
        : "",
      
      // --- FIX IS HERE: Convert to lowercase to match SelectItem values ---
      orderStatus: (order.orderStatus || "pending").toLowerCase(),
      paymentStatus: (order.paymentStatus || "pending").toLowerCase(),
      // ------------------------------------------------------------------

      paymentMethod: order.paymentMethod || "-",
      orderType: order.orderType || "shop",

      billing: {
        name: order.customerName || "",
        email: order.customerEmail || "",
        phone: order.customerPhone || "",
        address: order.address || "",
      },

      shipping: {
        address: order.address || "",
      },

      items: isPackage
        ? [
            {
              name: order.packageDetails?.title || "Design Package",
              price: formatCurrency(order.subtotal),
              qty: 1,
              total: formatCurrency(order.total),
            },
          ]
        : (order.items || []).map((item) => ({
            name: item.name,
            price: formatCurrency(item.price),
            qty: item.quantity,
            total: formatCurrency(item.price * item.quantity),
            coverImage: item.coverImage,
            variant: item.variant,
          })),

      subtotal: formatCurrency(order.subtotal),
      shippingAmount: formatCurrency(order.shipping),
      vatAmount: formatCurrency(order.vat),
      total: formatCurrency(order.total),

      packageDetails: order.packageDetails || null,
      projectSteps: order.projectSteps || null,
    };
  };

  // Fetch order from API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/order", {
          method: "GET",
        });
        const json = await res.json();
        console.log("Order API response:", json);

        const ordersArray = Array.isArray(json)
          ? json
          : Array.isArray(json.orders)
          ? json.orders
          : [];

        const found = ordersArray.find((o) => o.id === id);

        if (!found) {
          console.warn("Order not found for id:", id);
          setNotFound(true);
          return;
        }

        setRawOrder(found);
        setData(mapApiOrderToUi(found));
      } catch (err) {
        console.error("Error fetching order:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const update = (field, value) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const orderTypeLabel = useMemo(() => {
    if (!data) return "";
    if (data.orderType === "package") return "Design Package Order";
    if (data.orderType === "shop") return "Store Order";
    return data.orderType;
  }, [data]);

  const orderTypeColor = useMemo(() => {
    if (!data) return "bg-gray-100 text-gray-700";
    if (data.orderType === "package") return "bg-purple-100 text-purple-700";
    if (data.orderType === "shop") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  }, [data]);

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Order detail</h1>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <p className="text-gray-500">Loading order…</p>
        </div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Order detail</h1>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <p className="text-red-500 font-medium">
            Order not found or failed to load.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Order detail</h1>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${orderTypeColor}`}
          >
            {orderTypeLabel}
          </span>
          <span className="text-xs text-gray-500">
            Order ID: <span className="font-mono">{data.id}</span>
          </span>
        </div>
      </div>

    <div className="space-y-6 p-0">

      {/* ============================
          TOP SUMMARY CARD
      ============================= */}
      <Card className="shadow-sm border">
        <CardContent className="py-6 grid md:grid-cols-4 gap-6">
          {/* Customer Info */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{data.billing.name || "—"}</p>
            <p className="text-sm">{data.billing.email || "—"}</p>
            <p className="text-sm">{data.billing.phone || "—"}</p>
          </div>

          {/* Order Status */}
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              disabled={!editing}
              value={data.orderStatus}
              onValueChange={(v) => update("orderStatus", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {/* Ensure values are lowercase */}
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-1">
            <Label>Payment Status</Label>
            <Select
              disabled={!editing}
              value={data.paymentStatus}
              onValueChange={(v) => update("paymentStatus", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                {/* Ensure values are lowercase */}
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs text-gray-500 mt-1">
              Method: <span className="font-medium">{data.paymentMethod}</span>
            </div>
          </div>

          {/* Buttons */}
          {canUpdate && (
          <div className="flex justify-end items-start">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="secondary">
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // TODO: call update API here later if needed
                  setEditing(false);
                  console.log("Updated order data (local only):", data);
                }}
              >
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* ============================
          BILLING + SHIPPING + GENERAL
      ============================= */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-4">
            <Field
              label="Name"
              disabled={!editing}
              value={data.billing.name}
              onChange={(v) =>
                update("billing", { ...data.billing, name: v })
              }
            />

            <Field
              label="Email"
              disabled={!editing}
              value={data.billing.email}
              onChange={(v) =>
                update("billing", { ...data.billing, email: v })
              }
            />

            <Field
              label="Phone"
              disabled={!editing}
              value={data.billing.phone}
              onChange={(v) =>
                update("billing", { ...data.billing, phone: v })
              }
            />

            <Label>Address</Label>
            <Textarea
              disabled={!editing}
              value={data.billing.address}
              onChange={(e) =>
                update("billing", {
                  ...data.billing,
                  address: e.target.value,
                })
              }
            />
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-4">
            <Label>Address</Label>
            <Textarea
              disabled={!editing}
              value={data.shipping.address}
              onChange={(e) =>
                update("shipping", {
                  ...data.shipping,
                  address: e.target.value,
                })
              }
            />
          </CardContent>
        </Card>

        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            <Field
              label="Date Created"
              type="datetime-local"
              disabled={!editing}
              value={data.createdAt}
              onChange={(v) => update("createdAt", v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* ============================
          PACKAGE DETAILS (for orderType=package)
      ============================= */}
      {data.orderType === "package" && data.packageDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-lg">
                  {data.packageDetails.title}
                </p>
                <p className="text-sm text-gray-500">
                  Payment Method: {data.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-700">
                  {data.packageDetails.price}
                </p>
                {data.packageDetails.oldPrice && (
                  <p className="text-xs line-through text-gray-400">
                    {data.packageDetails.oldPrice}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {data.packageDetails.features?.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 bg-gray-50"
                >
                  {f.included ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span
                    className={
                      f.included ? "text-gray-800" : "text-gray-400 line-through"
                    }
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================
          PROJECT STEPS (for orderType=package)
      ============================= */}
      {data.orderType === "package" && data.projectSteps && (
        <Card>
          <CardHeader>
            <CardTitle>Project Preferences</CardTitle>
          </CardHeader>
          <CardContent className="py-4 grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Room / Space</p>
              <p className="font-medium">
                {data.projectSteps.style?.cardTitle || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Specific Focus</p>
              <p className="font-medium">
                {data.projectSteps.specified?.cardTitle || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Room Size</p>
              <p className="font-medium">
                {data.projectSteps.size?.cardTitle || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Timeline</p>
              <p className="font-medium">
                {data.projectSteps.timeline?.cardTitle ||
                  data.projectSteps["When do you want this done?"]?.label ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Budget</p>
              <p className="font-medium">
                {data.projectSteps.budget?.cardTitle ||
                  data.projectSteps["What is your budget?"]?.label ||
                  "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================
          ORDER ITEMS LIST
      ============================= */}
      <Card>
        <CardHeader>
          <CardTitle>
            {data.orderType === "package" ? "Order Summary" : "Order Items"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 py-6">
          {data.items.length === 0 && (
            <p className="text-sm text-gray-500">No items in this order.</p>
          )}

          {data.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border rounded p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.price} × {item.qty}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-semibold">{item.total}</p>

                {editing && (
                  <Trash2
                    className="text-red-500 cursor-pointer"
                    onClick={() => {
                      const updated = [...data.items];
                      updated.splice(index, 1);
                      update("items", updated);
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {editing && data.orderType === "shop" && (
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ============================
          TOTAL + REFUND
      ============================= */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="text-right space-y-1 text-sm">
            <p>
              Subtotal: <strong>{data.subtotal}</strong>
            </p>
            <p>
              Shipping: <strong>{data.shippingAmount}</strong>
            </p>
            <p>
              VAT: <strong>{data.vatAmount}</strong>
            </p>
            <p className="text-base">
              Total: <strong>{data.total}</strong>
            </p>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            disabled={!editing}
          >
            Refund Order
          </Button>
        </CardContent>
      </Card>
    </div>
    </main>
  );
}

/* Reusable field component */
function Field({ label, value, onChange, disabled, type = "text" }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        disabled={disabled}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}