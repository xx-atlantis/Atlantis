"use client";

import { useEffect, useState, useMemo } from "react";
import {
    MoreVertical,
    Eye,
    Trash,
    Ellipsis,
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { toast, ToastContainer } from "react-toastify"; // Assuming you use react-toastify based on your checkout page
import "react-toastify/dist/ReactToastify.css";

/* -------------------- Badges -------------------- */

function StatusBadge({ status }) {
    const statusLower = status?.toLowerCase() || 'pending';
    const styles = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        pending_payment: "bg-amber-100 text-amber-700 border-amber-200",
        paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
        failed: "bg-rose-100 text-rose-700 border-rose-200",
        refunded: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <span
            className={`px-2.5 py-0.5 text-[11px] border rounded-full font-bold uppercase tracking-wider ${
                styles[statusLower] || "bg-gray-100 text-gray-600"
            }`}
        >
            {statusLower.replace('_', ' ')}
        </span>
    );
}

function OrderStatusBadge({ status }) {
    const statusLower = status?.toLowerCase() || 'pending';
    const styles = {
        pending: "bg-orange-50 text-orange-600 border-orange-100",
        processing: "bg-blue-50 text-blue-600 border-blue-100",
        completed: "bg-green-50 text-green-600 border-green-100",
        cancelled: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <span
            className={`px-2.5 py-0.5 text-[11px] border rounded-full font-bold uppercase tracking-wider ${
                styles[statusLower] || "bg-gray-100 text-gray-600"
            }`}
        >
            {statusLower}
        </span>
    );
}

function PaymentMethodBadge({ method }) {
    const methodLower = method?.toLowerCase() || 'unknown';
    const displayNames = {
        paytabs: "PayTabs",
        tabby: "Tabby",
        tamara: "Tamara",
        bank_transfer: "Bank Transfer",
    };

    return (
        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {displayNames[methodLower] || method}
        </span>
    );
}

/* -------------------- Main Component -------------------- */

export default function OrdersTable() {
    const router = useRouter();
    const { permissions, loading: authLoading } = useAdminAuth();

    const canRead = permissions.includes("order.read");
    const canUpdate = permissions.includes("order.update");
    const canDelete = permissions.includes("order.delete");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Filters & Pagination
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    /* -------------------- Fetch Orders (RBAC guarded) -------------------- */
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/order");
            const data = await res.json();
            const ordersArray = Array.isArray(data)
                ? data
                : data.orders || data.data || [];
            setOrders(ordersArray);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* -------------------- Mark as Processed -------------------- */
    const handleMarkProcessed = async (orderId) => {
        if (!confirm("Mark this order as Processing?")) return;

        setActionLoadingId(orderId);
        try {
            const res = await fetch(`/api/order/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderStatus: "PROCESSING" }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Order marked as Processing!");
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === orderId ? { ...o, orderStatus: "PROCESSING" } : o
                    )
                );
            } else {
                toast.error(data.error || "Failed to update order");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setActionLoadingId(null);
        }
    };

    /* -------------------- Bank Transfer Approval -------------------- */
    const handleApproveBankTransfer = async (orderId) => {
        if (!confirm("Are you sure you want to approve this bank transfer? This will immediately send confirmation emails to the customer and admin.")) {
            return;
        }

        setActionLoadingId(orderId);
        try {
            const res = await fetch('/api/admin/orders/confirm-bank-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            
            const data = await res.json();
            
            if (data.success) {
                toast.success('Order approved and confirmation emails dispatched!');
                // Refresh the table silently
                const refreshRes = await fetch("/api/order");
                const refreshData = await refreshRes.json();
                setOrders(Array.isArray(refreshData) ? refreshData : refreshData.orders || []);
            } else {
                toast.error(data.error || 'Failed to approve order');
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while approving the order");
        } finally {
            setActionLoadingId(null);
        }
    };

    /* -------------------- Filtering & Pagination -------------------- */

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                order.id.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || order.orderStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    /* -------------------- Render -------------------- */

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-6">
            <ToastContainer position="top-right" />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#2D3247]">Orders</h1>
                    <p className="text-gray-500 text-sm">
                        Manage and track your customer transactions.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by Order ID or Customer..."
                        className="pl-10 h-10 border-gray-200 focus-visible:ring-[#2D3247]"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400 mr-1" />
                    <select
                        className="text-sm border border-gray-200 rounded-md h-10 px-3 outline-none focus:ring-2 ring-[#2D3247]/20 focus:border-[#2D3247]"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#2D3247]" />
                                        <span>Loading orders...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-gray-500">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-mono text-sm font-bold text-[#2D3247]">
                                        #{order.id.slice(-6).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">
                                                {order.customerName || "Guest"}
                                            </span>
                                            <span className="text-[11px] text-gray-500">
                                                {order.customerEmail || "No Email"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <OrderStatusBadge status={order.orderStatus} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-1">
                                            <StatusBadge status={order.paymentStatus} />
                                            <PaymentMethodBadge method={order.paymentMethod} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-gray-900">
                                        {order.total}{" "}
                                        <span className="text-[10px] text-gray-400 font-normal">SAR</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionMenu
                                            order={order}
                                            canUpdate={canUpdate}
                                            canDelete={canDelete}
                                            isActionLoading={actionLoadingId === order.id}
                                            onView={() => router.push(`/admin/orders/${order.id}`)}
                                            onMarkProcessed={() => handleMarkProcessed(order.id)}
                                            onApproveBankTransfer={() => handleApproveBankTransfer(order.id)}
                                            onDelete={() => {}}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-bold text-gray-700">
                            {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-gray-700">
                            {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-gray-700">{filteredOrders.length}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || filteredOrders.length === 0}
                            className="border-gray-200"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || filteredOrders.length === 0}
                            className="border-gray-200"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* -------------------- Action Menu -------------------- */

function ActionMenu({ order, onView, onMarkProcessed, onApproveBankTransfer, onDelete, canUpdate, canDelete, isActionLoading }) {
    const isPendingBankTransfer = 
        order.paymentMethod?.toLowerCase() === 'bank_transfer' && 
        order.paymentStatus?.toLowerCase() !== 'paid';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                    {isActionLoading ? (
                        <Loader2 className="w-4 h-4 text-[#2D3247] animate-spin" />
                    ) : (
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 font-medium">
                <DropdownMenuItem onClick={onView} className="cursor-pointer py-2">
                    <Eye className="w-4 h-4 mr-2 text-gray-500" /> View Details
                </DropdownMenuItem>

                {/* 🔥 NEW: Approve Bank Transfer Button 🔥 */}
                {canUpdate && isPendingBankTransfer && (
                    <DropdownMenuItem 
                        onClick={onApproveBankTransfer}
                        className="cursor-pointer py-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> 
                        Approve Bank Transfer
                    </DropdownMenuItem>
                )}

                {canUpdate && (
                    <DropdownMenuItem onClick={onMarkProcessed} className="cursor-pointer py-2">
                        <Ellipsis className="w-4 h-4 mr-2 text-gray-500" /> Mark as Processed
                    </DropdownMenuItem>
                )}

                {canDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="cursor-pointer py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                        >
                            <Trash className="w-4 h-4 mr-2" /> Delete Order
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}