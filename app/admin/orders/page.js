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
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
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

/* -------------------- Badges -------------------- */

function StatusBadge({ status }) {
	const styles = {
		pending: "bg-amber-100 text-amber-700 border-amber-200",
		paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
		failed: "bg-rose-100 text-rose-700 border-rose-200",
		refunded: "bg-slate-100 text-slate-700 border-slate-200",
	};

	return (
		<span
			className={`px-2.5 py-0.5 text-xs border rounded-full font-semibold capitalize ${
				styles[status] || "bg-gray-100 text-gray-600"
			}`}
		>
			{status}
		</span>
	);
}

function OrderStatusBadge({ status }) {
	const styles = {
		pending: "bg-orange-50 text-orange-600 border-orange-100",
		processing: "bg-blue-50 text-blue-600 border-blue-100",
		completed: "bg-green-50 text-green-600 border-green-100",
		cancelled: "bg-red-50 text-red-600 border-red-100",
	};

	return (
		<span
			className={`px-2.5 py-0.5 text-xs border rounded-full font-semibold capitalize ${
				styles[status] || "bg-gray-100 text-gray-600"
			}`}
		>
			{status}
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

	// Filters & Pagination
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	/* -------------------- Fetch Orders (RBAC guarded) -------------------- */

	useEffect(() => {

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
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
		}, []);

	/* -------------------- Filtering & Pagination -------------------- */

	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			const matchesSearch =
				order.customerName
					?.toLowerCase()
					.includes(search.toLowerCase()) ||
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
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Orders</h1>
					<p className="text-gray-500 text-sm">
						Manage and track your customer transactions.
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
				<div className="relative w-full sm:w-96">
					<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<Input
						placeholder="Search by Order ID or Customer..."
						className="pl-10 h-10"
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
						className="text-sm border rounded-md h-10 px-3 outline-none focus:ring-2 ring-blue-500"
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
			<div className="bg-white border rounded-xl shadow-sm overflow-hidden">
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
									Loading orders...
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
								<TableRow key={order.id} className="hover:bg-gray-50/50">
									<TableCell className="font-mono text-sm font-medium text-blue-600">
										#{order.id.slice(-6).toUpperCase()}
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium text-gray-900">
												{order.customerName}
											</span>
											<span className="text-xs text-gray-500">
												{order.customerEmail}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-sm text-gray-600">
										{new Date(order.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<OrderStatusBadge status={order.orderStatus} />
									</TableCell>
									<TableCell>
										<StatusBadge status={order.paymentStatus} />
									</TableCell>
									<TableCell className="font-bold">
										{order.total}{" "}
										<span className="text-[10px] text-gray-400">SAR</span>
									</TableCell>
									<TableCell className="text-right">
										<ActionMenu
											canUpdate={canUpdate}
											canDelete={canDelete}
											onView={() =>
												router.push(`/admin/orders/${order.id}`)
											}
											onDelete={() => {}}
										/>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				{/* Pagination */}
				<div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30">
					<p className="text-sm text-gray-500">
						Showing{" "}
						<span className="font-medium">
							{(currentPage - 1) * itemsPerPage + 1}
						</span>{" "}
						to{" "}
						<span className="font-medium">
							{Math.min(
								currentPage * itemsPerPage,
								filteredOrders.length
							)}
						</span>{" "}
						of{" "}
						<span className="font-medium">{filteredOrders.length}</span>
					</p>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>

						<Button
							variant="outline"
							size="icon"
							onClick={() =>
								setCurrentPage((p) => Math.min(totalPages, p + 1))
							}
							disabled={currentPage === totalPages}
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

function ActionMenu({ onView, onDelete, canUpdate, canDelete }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<MoreVertical className="w-4 h-4 text-gray-500" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={onView}>
					<Eye className="w-4 h-4 mr-2" /> View Details
				</DropdownMenuItem>

				{canUpdate && (
					<DropdownMenuItem>
						<Ellipsis className="w-4 h-4 mr-2" /> Mark as Processed
					</DropdownMenuItem>
				)}

				{canDelete && (
					<>
						<hr className="my-1" />
						<DropdownMenuItem
							onClick={onDelete}
							className="text-red-600 focus:text-red-600 focus:bg-red-50"
						>
							<Trash className="w-4 h-4 mr-2" /> Delete Order
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
