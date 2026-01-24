"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { Edit, Trash2, Plus, Search, Filter, SaudiRiyal } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductModal } from "../_components/ProductModal";

/* ======================================================
	API HELPERS
====================================================== */
const API = "/api/shop/product";

async function api(url, options = {}) {
	const res = await fetch(url, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || "Request failed");
	return json;
}

/* ======================================================
	ADMIN SHOP PAGE
====================================================== */
export default function AdminShopPage() {
	const { permissions } = useAdminAuth();
	const canCreate = permissions.includes("product.create");
	const canUpdate = permissions.includes("product.update");
	const canDelete = permissions.includes("product.delete");

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [stockFilter, setStockFilter] = useState("all");

	/* ---------------- Fetch Products ---------------- */
	const loadProducts = async () => {
		try {
			setLoading(true);
			const res = await api(`${API}?locale=en`);
			setProducts(res.data || []);
		} catch (e) {
			toast.error(e.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProducts();
	}, []);

	/* ---------------- Filter Products ---------------- */
	const filteredProducts = products.filter((p) => {
		const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStock = stockFilter === "all" || 
			(stockFilter === "inStock" && p.inStock) || 
			(stockFilter === "outOfStock" && !p.inStock);
		return matchesSearch && matchesStock;
	});

	/* ---------------- CRUD ---------------- */
	const openNew = () => {
		setEditing({
			categoryId: "",
			price: 0,
			inStock: true,
			coverImage: "",
			images: [],
			en: { name: "", short_description: "", material: "", variant: {} },
			ar: { name: "", short_description: "", material: "", variant: {} },
		});
		setModalOpen(true);
	};

	const openEdit = async (p) => {
		try {
			// Fetch full product data with both translations
			const resEn = await api(`${API}/${p.id}?locale=en`);
			const resAr = await api(`${API}/${p.id}?locale=ar`);

			setEditing({
				id: p.id,
				categoryId: resEn.data.categoryId || p.categoryId,
				price: resEn.data.price,
				inStock: resEn.data.inStock,
				sku: resEn.data.sku || "",
				coverImage: resEn.data.coverImage,
				images: resEn.data.images || [],
				en: {
					name: resEn.data.name || "",
					short_description: resEn.data.short_description || "",
					material: resEn.data.material || "",
					variant: resEn.data.variant || {},
				},
				ar: {
					name: resAr.data.name || "",
					short_description: resAr.data.short_description || "",
					material: resAr.data.material || "",
					variant: resAr.data.variant || {},
				},
			});
			setModalOpen(true);
		} catch (e) {
			toast.error("Failed to load product details");
		}
	};

	const saveProduct = async () => {
		try {
			const payload = {
				categoryId: editing.categoryId,
				price: Number(editing.price),
				sku: editing.sku || null,
				inStock: editing.inStock,
				coverImage: editing.coverImage,
				images: editing.images,
				en: editing.en,
				ar: editing.ar,
			};

			const promise = editing.id
				? api(`${API}/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) })
				: api(API, { method: "POST", body: JSON.stringify(payload) });

			toast.promise(promise, {
				pending: editing.id ? "Updating product..." : "Creating product...",
				success: "Product saved successfully ✓",
				error: "Failed to save product",
			});

			await promise;
			setModalOpen(false);
			loadProducts();
		} catch (e) {
			toast.error(e.message);
		}
	};

	const deleteProduct = async (id) => {
		if (!confirm("Delete this product permanently?")) return;

		try {
			const promise = api(`${API}/${id}`, { method: "DELETE" });

			toast.promise(promise, {
				pending: "Deleting product...",
				success: "Product deleted ✓",
				error: "Delete failed",
			});

			await promise;
			loadProducts();
		} catch (e) {
			toast.error(e.message);
		}
	};

	/* ======================================================
		RENDER
	======================================================= */
	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
			<ToastContainer position="top-right" autoClose={3000} />

			<div className="max-w-7xl mx-auto space-y-6">
				{/* HEADER */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Products</h1>
						<p className="text-sm text-gray-500 mt-1">
							Manage your product catalog
						</p>
					</div>
					{canCreate && (
						<Button 
							onClick={openNew} 
							className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
						>
							<Plus size={18} /> Add Product
						</Button>
					)}
				</div>

				{/* FILTERS BAR */}
				<div className="bg-white rounded-xl shadow-sm border p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* SEARCH */}
						<div className="flex-1 relative">
							<Search 
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
								size={18} 
							/>
							<input
								type="text"
								placeholder="Search products..."
								className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* STOCK FILTER */}
						<div className="flex items-center gap-2">
							<Filter size={18} className="text-gray-400" />
							<select
								className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
								value={stockFilter}
								onChange={(e) => setStockFilter(e.target.value)}
							>
								<option value="all">All Products</option>
								<option value="inStock">In Stock</option>
								<option value="outOfStock">Out of Stock</option>
							</select>
						</div>
					</div>

					{/* STATS */}
					<div className="flex gap-6 mt-4 pt-4 border-t">
						<div className="text-sm">
							<span className="text-gray-500">Total:</span>{" "}
							<span className="font-semibold text-gray-900">{products.length}</span>
						</div>
						<div className="text-sm">
							<span className="text-gray-500">In Stock:</span>{" "}
							<span className="font-semibold text-green-600">
								{products.filter(p => p.inStock).length}
							</span>
						</div>
						<div className="text-sm">
							<span className="text-gray-500">Out of Stock:</span>{" "}
							<span className="font-semibold text-red-600">
								{products.filter(p => !p.inStock).length}
							</span>
						</div>
					</div>
				</div>

				{/* GRID */}
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-sm text-gray-500">Loading products...</p>
						</div>
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="bg-white rounded-xl border p-12 text-center">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="text-gray-400" size={24} />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							No products found
						</h3>
						<p className="text-sm text-gray-500">
							{searchTerm || stockFilter !== "all"
								? "Try adjusting your filters"
								: "Get started by adding your first product"}
						</p>
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProducts.map((p) => (
							<div
								key={p.id}
								className="group rounded-xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
							>
								{/* IMAGE */}
								<div className="relative h-56 overflow-hidden bg-gray-100">
									<img
										src={p.coverImage}
										alt={p.name}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

									<span
										className={`absolute top-3 left-3 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg ${
											p.inStock
												? "bg-green-500/90 text-white"
												: "bg-red-500/90 text-white"
										}`}
									>
										{p.inStock ? "In Stock" : "Out of Stock"}
									</span>
								</div>

								{/* CONTENT */}
								<div className="p-4 space-y-3">
									<div>
										<h3 className="font-semibold text-gray-900 line-clamp-1 text-lg">
											{p.name}
										</h3>
										<p
		className="text-sm text-gray-500 mt-1 min-h-[2.5rem] line-clamp-2 tiptap-content"
		dangerouslySetInnerHTML={{
			__html: p.short_description || "No description",
		}}
/>

	</div>

	{p.material && (
		<div className="flex items-center gap-2 text-xs text-gray-600">
			<span className="px-2 py-1 bg-gray-100 rounded">
				{p.material}
			</span>
		</div>
	)}

	<div className="flex justify-between items-center pt-3 border-t">
		<div>
			<p className="text-xs text-gray-500">Price</p>
			<span className="flex items-center text-xl font-bold text-gray-900">
				<SaudiRiyal size={16} /> {p.price.toLocaleString()}
			</span>
		</div>

		<div className="flex gap-2">
			{canUpdate && (
				<button
					onClick={() => openEdit(p)}
					className="p-2.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
					title="Edit product"
				>
					<Edit size={18} />
				</button>
			)}
			{canDelete && (
				<button
					onClick={() => deleteProduct(p.id)}
					className="p-2.5 rounded-lg hover:bg-red-50 text-red-600 transition"
					title="Delete product"
				>
					<Trash2 size={18} />
				</button>
			)}
		</div>
	</div>
	</div>
	</div>
	))}
	</div>
	)}
	</div>

	{/* MODAL */}
	{modalOpen && editing && (
		<ProductModal
			editing={editing}
			setEditing={setEditing}
			onSave={saveProduct}
			onClose={() => setModalOpen(false)}
		/>
	)}
	</main>
	);
}
