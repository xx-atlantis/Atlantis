"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import {
	Edit, Trash2, Plus, Search, Filter, SaudiRiyal,
	CheckSquare, Square, Eye, EyeOff, X, Layers, Link2, Check, ShoppingCart,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductModal } from "../_components/ProductModal";

/* ======================================================
	API HELPERS
====================================================== */
const API = "/api/shop/product";
const BULK_API = "/api/shop/product/bulk";

async function api(url, options = {}) {
	const res = await fetch(url, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || "Request failed");
	return json;
}

/* if variant.materials not yet set, seed it from old comma string */
function migrateVariantMaterials(variant, materialStr) {
	const v = variant || {};
	if (Array.isArray(v.materials) && v.materials.length > 0) return v;
	const mats = (materialStr || "").split(",").map((m) => m.trim()).filter(Boolean);
	return mats.length > 0 ? { ...v, materials: mats } : v;
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
	const [visibilityFilter, setVisibilityFilter] = useState("all");

	const [copiedId, setCopiedId] = useState(null);
	const [copiedCheckoutId, setCopiedCheckoutId] = useState(null);

	/* ── Bulk selection state ── */
	const [selectMode, setSelectMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState(new Set());
	const [bulkLoading, setBulkLoading] = useState(false);

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
		const matchesStock =
			stockFilter === "all" ||
			(stockFilter === "inStock" && p.inStock) ||
			(stockFilter === "outOfStock" && !p.inStock);
		const matchesVisibility =
			visibilityFilter === "all" ||
			(visibilityFilter === "visible" && p.showInShop !== false) ||
			(visibilityFilter === "hidden" && p.showInShop === false);
		return matchesSearch && matchesStock && matchesVisibility;
	});

	/* ---------------- Selection helpers ---------------- */
	const toggleSelectMode = () => {
		setSelectMode((v) => !v);
		setSelectedIds(new Set());
	};

	const toggleSelect = (id) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const isAllSelected =
		filteredProducts.length > 0 &&
		filteredProducts.every((p) => selectedIds.has(p.id));

	const toggleSelectAll = () => {
		if (isAllSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
		}
	};

	/* ---------------- Bulk update ---------------- */
	const bulkUpdate = async (updatePayload, label) => {
		if (selectedIds.size === 0) return;
		setBulkLoading(true);
		try {
			const res = await fetch(BULK_API, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids: [...selectedIds], update: updatePayload }),
			});
			const json = await res.json();
			if (!json.success) throw new Error(json.error);
			toast.success(`${label} — ${json.updated} product${json.updated !== 1 ? "s" : ""} updated ✓`);
			setSelectedIds(new Set());
			loadProducts();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setBulkLoading(false);
		}
	};

	/* ---------------- CRUD ---------------- */
	const openNew = () => {
		setEditing({
			categoryId: "",
			price: 0,
			inStock: true,
			showInShop: true,
			coverImage: "",
			images: [],
			en: { name: "", short_description: "", material: "", variant: {} },
			ar: { name: "", short_description: "", material: "", variant: {} },
		});
		setModalOpen(true);
	};

	const openEdit = async (p) => {
		if (selectMode) { toggleSelect(p.id); return; }
		try {
			const resEn = await api(`${API}/${p.id}?locale=en`);
			const resAr = await api(`${API}/${p.id}?locale=ar`);
			setEditing({
				id: p.id,
				categoryId: resEn.data.categoryId || p.categoryId,
				price: resEn.data.price,
				inStock: resEn.data.inStock,
				showInShop: resEn.data.showInShop !== false,
				sku: resEn.data.sku || "",
				coverImage: resEn.data.coverImage,
				images: resEn.data.images || [],
				en: {
					name: resEn.data.name || "",
					short_description: resEn.data.short_description || "",
					material: resEn.data.material || "",
					variant: migrateVariantMaterials(resEn.data.variant, resEn.data.material),
				},
				ar: {
					name: resAr.data.name || "",
					short_description: resAr.data.short_description || "",
					material: resAr.data.material || "",
					variant: migrateVariantMaterials(resAr.data.variant, resAr.data.material),
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
				showInShop: editing.showInShop,
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

	const copyProductLink = (e, id) => {
		e.stopPropagation();
		const url = `${window.location.origin}/en/shop/${id}`;
		navigator.clipboard.writeText(url);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const copyCheckoutLink = (e, id) => {
		e.stopPropagation();
		const url = `${window.location.origin}/en/quick-checkout/${id}`;
		navigator.clipboard.writeText(url);
		setCopiedCheckoutId(id);
		setTimeout(() => setCopiedCheckoutId(null), 2000);
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

			<div className="max-w-7xl mx-auto space-y-4">

				{/* HEADER */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Products</h1>
						<p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
					</div>
					<div className="flex items-center gap-3">
						{canUpdate && (
							<button
								onClick={toggleSelectMode}
								className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition ${
									selectMode
										? "bg-[#2D3247] text-white border-[#2D3247]"
										: "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
								}`}
							>
								<Layers size={16} />
								{selectMode ? "Exit Select" : "Select"}
							</button>
						)}
						{canCreate && !selectMode && (
							<Button
								onClick={openNew}
								className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
							>
								<Plus size={18} /> Add Product
							</Button>
						)}
					</div>
				</div>

				{/* BULK ACTION BAR — only when items are selected */}
				{selectMode && (
					<div className={`rounded-2xl border px-5 py-4 flex flex-wrap items-center gap-3 transition-all ${
						selectedIds.size > 0
							? "bg-[#2D3247] border-[#2D3247] shadow-lg"
							: "bg-white border-gray-200"
					}`}>
						{/* Select all */}
						<button
							onClick={toggleSelectAll}
							className={`flex items-center gap-2 text-sm font-semibold transition shrink-0 ${
								selectedIds.size > 0 ? "text-white" : "text-gray-600"
							}`}
						>
							{isAllSelected
								? <CheckSquare size={18} className="text-[#C9A96E]" />
								: <Square size={18} />}
							{isAllSelected ? "Deselect All" : `Select All (${filteredProducts.length})`}
						</button>

						{selectedIds.size > 0 && (
							<>
								<span className="text-white/60 text-sm shrink-0">
									{selectedIds.size} selected
								</span>

								<div className="flex-1" />

								{/* Bulk actions */}
								<button
									disabled={bulkLoading}
									onClick={() => bulkUpdate({ showInShop: true }, "Show in Shop")}
									className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
								>
									<Eye size={15} />
									Show in Shop
								</button>

								<button
									disabled={bulkLoading}
									onClick={() => bulkUpdate({ showInShop: false }, "Hide from Shop")}
									className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
								>
									<EyeOff size={15} />
									Hide from Shop
								</button>

								<div className="w-px h-6 bg-white/20 shrink-0" />

								<button
									disabled={bulkLoading}
									onClick={() => bulkUpdate({ inStock: true }, "Mark In Stock")}
									className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-3 py-2 rounded-xl transition disabled:opacity-50"
								>
									Mark In Stock
								</button>

								<button
									disabled={bulkLoading}
									onClick={() => bulkUpdate({ inStock: false }, "Mark Out of Stock")}
									className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-3 py-2 rounded-xl transition disabled:opacity-50"
								>
									Mark Out of Stock
								</button>

								<button
									onClick={() => setSelectedIds(new Set())}
									className="text-white/60 hover:text-white text-sm transition shrink-0"
								>
									<X size={16} />
								</button>
							</>
						)}

						{selectedIds.size === 0 && (
							<p className="text-sm text-gray-400 ms-2">
								Click on product cards to select them
							</p>
						)}
					</div>
				)}

				{/* FILTERS BAR */}
				<div className="bg-white rounded-xl shadow-sm border p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* SEARCH */}
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
							<Filter size={18} className="text-gray-400 shrink-0" />
							<select
								className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-sm"
								value={stockFilter}
								onChange={(e) => setStockFilter(e.target.value)}
							>
								<option value="all">All Stock</option>
								<option value="inStock">In Stock</option>
								<option value="outOfStock">Out of Stock</option>
							</select>
						</div>

						{/* VISIBILITY FILTER */}
						<div className="flex items-center gap-2">
							<Eye size={18} className="text-gray-400 shrink-0" />
							<select
								className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-sm"
								value={visibilityFilter}
								onChange={(e) => setVisibilityFilter(e.target.value)}
							>
								<option value="all">All Visibility</option>
								<option value="visible">Visible in Shop</option>
								<option value="hidden">Hidden from Shop</option>
							</select>
						</div>
					</div>

					{/* STATS */}
					<div className="flex flex-wrap gap-6 mt-4 pt-4 border-t">
						<div className="text-sm">
							<span className="text-gray-500">Total:</span>{" "}
							<span className="font-semibold text-gray-900">{products.length}</span>
						</div>
						<div className="text-sm">
							<span className="text-gray-500">In Stock:</span>{" "}
							<span className="font-semibold text-green-600">{products.filter(p => p.inStock).length}</span>
						</div>
						<div className="text-sm">
							<span className="text-gray-500">Out of Stock:</span>{" "}
							<span className="font-semibold text-red-600">{products.filter(p => !p.inStock).length}</span>
						</div>
						<div className="text-sm">
							<span className="text-gray-500">Visible in Shop:</span>{" "}
							<span className="font-semibold text-blue-600">{products.filter(p => p.showInShop !== false).length}</span>
						</div>
						<div className="text-sm">
							<span className="text-gray-500">Hidden from Shop:</span>{" "}
							<span className="font-semibold text-gray-500">{products.filter(p => p.showInShop === false).length}</span>
						</div>
						{filteredProducts.length !== products.length && (
							<div className="text-sm">
								<span className="text-gray-500">Showing:</span>{" "}
								<span className="font-semibold text-gray-900">{filteredProducts.length}</span>
							</div>
						)}
					</div>
				</div>

				{/* GRID */}
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
							<p className="text-sm text-gray-500">Loading products...</p>
						</div>
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="bg-white rounded-xl border p-12 text-center">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="text-gray-400" size={24} />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
						<p className="text-sm text-gray-500">
							{searchTerm || stockFilter !== "all" || visibilityFilter !== "all"
								? "Try adjusting your filters"
								: "Get started by adding your first product"}
						</p>
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProducts.map((p) => {
							const isSelected = selectedIds.has(p.id);
							return (
								<div
									key={p.id}
									onClick={() => selectMode && toggleSelect(p.id)}
									className={`group rounded-xl border bg-white shadow-sm transition-all duration-200 overflow-hidden ${
										selectMode
											? "cursor-pointer"
											: "hover:shadow-xl"
									} ${isSelected ? "ring-2 ring-[#2D3247] shadow-lg" : ""}`}
								>
									{/* IMAGE */}
									<div className="relative h-56 overflow-hidden bg-gray-100">
										<img
											src={p.coverImage}
											alt={p.name}
											className={`w-full h-full object-cover transition-transform duration-500 ${selectMode ? "" : "group-hover:scale-110"}`}
										/>

										{/* Selection overlay */}
										{selectMode && (
											<div className={`absolute inset-0 transition-colors ${
												isSelected ? "bg-[#2D3247]/30" : "bg-transparent group-hover:bg-black/5"
											}`}>
												<div className={`absolute top-3 left-3 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
													isSelected
														? "bg-[#2D3247] border-[#2D3247]"
														: "bg-white/90 border-gray-300"
												}`}>
													{isSelected && (
														<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
															<path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														</svg>
													)}
												</div>
											</div>
										)}

										{/* Stock badge */}
										<span className={`absolute ${selectMode ? "top-3 right-3" : "top-3 left-3"} text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg ${
											p.inStock ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
										}`}>
											{p.inStock ? "In Stock" : "Out of Stock"}
										</span>

										{/* Hidden badge */}
										{p.showInShop === false && !selectMode && (
											<span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-900/80 text-white backdrop-blur-sm shadow flex items-center gap-1">
												<EyeOff size={10} /> Hidden
											</span>
										)}
									</div>

									{/* CONTENT */}
									<div className="p-4 space-y-3">
										<div>
											<h3 className="font-semibold text-gray-900 line-clamp-1 text-lg">{p.name}</h3>
											<p
												className="text-sm text-gray-500 mt-1 min-h-[2.5rem] line-clamp-2 tiptap-content"
												dangerouslySetInnerHTML={{ __html: p.short_description || "No description" }}
											/>
										</div>

										{p.material && (
											<div className="flex items-center gap-2 text-xs text-gray-600">
												<span className="px-2 py-1 bg-gray-100 rounded">{p.material}</span>
											</div>
										)}

										<div className="flex justify-between items-center pt-3 border-t">
											<div>
												<p className="text-xs text-gray-500">Price</p>
												<span className="flex items-center text-xl font-bold text-gray-900">
													<SaudiRiyal size={16} /> {p.price.toLocaleString()}
												</span>
											</div>

											{!selectMode && (
												<div className="flex gap-2">
													<button
														onClick={(e) => copyProductLink(e, p.id)}
														className={`p-2.5 rounded-lg transition ${copiedId === p.id ? "bg-green-50 text-green-600" : "hover:bg-gray-50 text-gray-400 hover:text-gray-600"}`}
														title="Copy product page link"
													>
														{copiedId === p.id ? <Check size={18} /> : <Link2 size={18} />}
													</button>
													<button
														onClick={(e) => copyCheckoutLink(e, p.id)}
														className={`p-2.5 rounded-lg transition ${copiedCheckoutId === p.id ? "bg-orange-50 text-orange-600" : "hover:bg-orange-50 text-orange-400 hover:text-orange-600"}`}
														title="Copy direct checkout link"
													>
														{copiedCheckoutId === p.id ? <Check size={18} /> : <ShoppingCart size={18} />}
													</button>
													{canUpdate && (
														<button
															onClick={(e) => { e.stopPropagation(); openEdit(p); }}
															className="p-2.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
															title="Edit product"
														>
															<Edit size={18} />
														</button>
													)}
													{canDelete && (
														<button
															onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }}
															className="p-2.5 rounded-lg hover:bg-red-50 text-red-600 transition"
															title="Delete product"
														>
															<Trash2 size={18} />
														</button>
													)}
												</div>
											)}

											{selectMode && (
												<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
													isSelected
														? "bg-[#2D3247] text-white"
														: "bg-gray-100 text-gray-400"
												}`}>
													{isSelected ? "Selected" : "Click to select"}
												</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
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
