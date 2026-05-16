import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, RefreshCw, Plus } from "lucide-react";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";


/* =========================================================
	PRODUCT MODAL (CREATE + EDIT)
========================================================= */
export function ProductModal({ editing, setEditing, onSave, onClose }) {
	const [tab, setTab] = useState("en");
	const [categories, setCategories] = useState([]);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [materials, setMaterials] = useState({ en: [], ar: [] });

	/* ---------------- Fetch Categories ---------------- */
	const fetchCategories = async (locale = "en") => {
		try {
			setLoadingCategories(true);
			const res = await fetch(`/api/categories?locale=${locale}`);
			const data = await res.json();
			if (data.success) {
				setCategories(data.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch categories:", error);
		} finally {
			setLoadingCategories(false);
		}
	};

	/* ---------------- Fetch Materials (both locales once) ---------------- */
	const fetchMaterials = async () => {
		try {
			const [en, ar] = await Promise.all([
				fetch("/api/materials?locale=en").then((r) => r.json()),
				fetch("/api/materials?locale=ar").then((r) => r.json()),
			]);
			setMaterials({
				en: (en.data || []).map((m) => m.name),
				ar: (ar.data || []).map((m) => m.name),
			});
		} catch {
			// materials dropdown is optional — fail silently
		}
	};

	/* ---------------- Load on Mount & Tab Change ---------------- */
	useEffect(() => {
		fetchCategories(tab);
	}, [tab]);

	useEffect(() => {
		fetchMaterials();
	}, []);

	/* ---------------- Helper ---------------- */
	const update = (path, value) => {
		const clone = structuredClone(editing);
		let ref = clone;
		const keys = path.split(".");
		for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
		ref[keys.at(-1)] = value;
		setEditing(clone);
	};

	/* ---------------- Validation ---------------- */
	const canSave = () => {
		return (
			editing.categoryId &&
			editing.price > 0 &&
			editing.coverImage &&
			editing.en.name &&
			editing.ar.name
		);
	};

	/* ---------------- Quill Modules Configuration ---------------- */
	const quillModules = {
		toolbar: [
			[{ 'header': [1, 2, 3, false] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'color': [] }, { 'background': [] }],
			['link'],
			['clean']
		]
	};

	/* ========================================================= */
	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">

				{/* HEADER */}
				<div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
					<div>
						<h2 className="text-xl font-bold text-gray-900">
							{editing.id ? "Edit Product" : "Create New Product"}
						</h2>
						<p className="text-sm text-gray-500 mt-1">
							{editing.id ? "Update product information" : "Add a new product to your catalog"}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-white/80 transition text-gray-500 hover:text-gray-900"
					>
						<X size={20} />
					</button>
				</div>

				{/* BODY */}
				<div className="p-6 overflow-y-auto flex-1">
					<div className="space-y-6">

						{/* LANGUAGE TABS */}
						<div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
							<button
								className={`px-6 py-2.5 rounded-md font-medium transition-all ${tab === "en"
									? "bg-black shadow-sm text-white"
									: "text-gray-600 hover:text-gray-900"
									}`}
								onClick={() => setTab("en")}
							>
								English
							</button>
							<button
								className={`px-6 py-2.5 rounded-md font-medium transition-all ${tab === "ar"
									? "bg-black shadow-sm text-white"
									: "text-gray-600 hover:text-gray-900"
									}`}
								onClick={() => setTab("ar")}
							>
								Arabic
							</button>
						</div>

						{/* TRANSLATION SECTION */}
						<div className="bg-gradient-to-br from-gray-50/50 to-gray-100 rounded-xl p-5 border border-blue-100 space-y-5">
							<h3 className="font-semibold text-gray-900 flex items-center gap-2">
								<span className="w-1 h-5 bg-blue-500 rounded"></span>
								{tab === "en" ? "English" : "Arabic"} Translation
							</h3>

							{/* NAME */}
							<div>
								<label className="text-sm font-medium text-gray-700 mb-2 block">
									Product Name *
								</label>
								<input
									className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
									placeholder={tab === "en" ? "Enter product name" : "أدخل اسم المنتج"}
									value={editing[tab].name || ""}
									onChange={(e) => update(`${tab}.name`, e.target.value)}
								/>
							</div>

							{/* DESCRIPTION - RICH TEXT EDITOR */}
							<div>
								<label className="text-sm font-medium text-gray-700 mb-2 block">
									Short Description
								</label>
								<div className="rich-text-editor">
									<RichTextEditor
										value={editing[tab].short_description}
										onChange={(html) =>
											update(`${tab}.short_description`, html)
										}
										placeholder={
											tab === "en" ? "Describe your product..." : "وصف المنتج..."
										}
										direction={tab === "ar" ? "rtl" : "ltr"}
									/>

								</div>
							</div>

						</div>

						{/* BASIC INFO */}
						<div className="bg-gray-50 rounded-xl p-5 border space-y-5">
							<h3 className="font-semibold text-gray-900 flex items-center gap-2">
								<span className="w-1 h-5 bg-green-500 rounded"></span>
								Product Details
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								{/* PRICE */}
								<div>
									<label className="text-sm font-medium text-gray-700 mb-2 block">
										Price *
									</label>
									<input
										type="number"
										min="0"
										step="0.01"
										className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
										placeholder="0.00"
										value={editing.price || ""}
										onChange={(e) =>
											update("price", Number(e.target.value))
										}
									/>
								</div>

								{/* STOCK */}
								<div>
									<label className="text-sm font-medium text-gray-700 mb-2 block">
										Stock Status *
									</label>
									<select
										className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
										value={editing.inStock}
										onChange={(e) =>
											update("inStock", e.target.value === "true")
										}
									>
										<option value="true">✓ In Stock</option>
										<option value="false">✗ Out of Stock</option>
									</select>
								</div>

								{/* SHOW IN SHOP */}
								<div className="md:col-span-2">
									<label className="text-sm font-medium text-gray-700 mb-2 block">
										Shop Visibility
									</label>
									<div
										className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
											editing.showInShop !== false
												? "bg-green-50 border-green-200"
												: "bg-gray-50 border-gray-200"
										}`}
										onClick={() => update("showInShop", editing.showInShop === false ? true : false)}
									>
										<div className="flex items-center gap-2">
											<span className={`text-sm font-semibold ${editing.showInShop !== false ? "text-green-700" : "text-gray-500"}`}>
												{editing.showInShop !== false ? "✓ Visible in Shop" : "✗ Hidden from Shop"}
											</span>
											<span className="text-xs text-gray-400">
												{editing.showInShop !== false
													? "Customers can see and buy this product"
													: "This product won't appear on the shop page"}
											</span>
										</div>
										<div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${editing.showInShop !== false ? "bg-green-500" : "bg-gray-300"}`}>
											<span className={`absolute top-1 start-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.showInShop !== false ? "translate-x-5" : ""}`} />
										</div>
									</div>
								</div>

								{/* SKU */}
								<div>
									<label className="text-sm font-medium text-gray-700 mb-2 block">
										SKU
									</label>
									<input
										type="text"
										className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
										placeholder="e.g. SKU-RED-XL"
										value={editing.sku || ""}
										onChange={(e) => update("sku", e.target.value)}
									/>
									<p className="text-xs text-gray-500 mt-1 font-mono">
										SKU is same for all languages.
									</p>
								</div>

								{/* CATEGORY */}
								<div className="">
									<label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
										<span>Category *</span>
										<button
											type="button"
											onClick={() => fetchCategories(tab)}
											className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
											disabled={loadingCategories}
										>
											<RefreshCw size={12} className={loadingCategories ? "animate-spin" : ""} />
											Refresh
										</button>
									</label>
									{loadingCategories ? (
										<div className="w-full border border-gray-300 rounded-lg p-3 flex items-center justify-center text-sm text-gray-500">
											<RefreshCw size={16} className="animate-spin mr-2" />
											Loading categories...
										</div>
									) : categories.length === 0 ? (
										<div className="w-full border border-amber-300 bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
											No categories available. Please create a category first.
										</div>
									) : (
										<select
											className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
											value={editing.categoryId || ""}
											onChange={(e) => update("categoryId", e.target.value)}
										>
											<option value="">
												{tab === "en" ? "Select a category" : "اختر فئة"}
											</option>
											{categories.map((cat) => (
												<option key={cat.id} value={cat.id}>
													{cat.name}
												</option>
											))}
										</select>
									)}
									{editing.categoryId && (
										<p className="text-xs text-gray-500 mt-1 font-mono">
											ID: {editing.categoryId}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* SIZES SECTION */}
						<SizesEditor editing={editing} update={update} />

						{/* MATERIALS SECTION */}
						<MaterialsEditor editing={editing} update={update} tab={tab} predefined={materials[tab]} />

						{/* IMAGES SECTION */}
						<div className="bg-gradient-to-br from-gray-50/50 to-gray-100 rounded-xl p-5 border border-purple-100 space-y-5">
							<h3 className="font-semibold text-gray-900 flex items-center gap-2">
								<span className="w-1 h-5 bg-purple-500 rounded"></span>
								Product Images
							</h3>

							{/* COVER IMAGE */}
							<div>
								<ImageUploader
									label="Cover Image *"
									value={editing.coverImage}
									onChange={(url) => update("coverImage", url)}
								/>
							</div>

							{/* GALLERY IMAGES */}
							<div>
								<label className="text-sm font-medium text-gray-700 mb-3 block">
									Gallery Images (Optional)
								</label>

								{/* Display existing gallery images */}
								{editing.images && editing.images.length > 0 && (
									<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
										{editing.images.map((img, i) => (
											<div key={i} className="relative group">
												<img
													src={img}
													className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
													alt={`Gallery ${i + 1}`}
												/>
												<button
													className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
													onClick={() =>
														update(
															"images",
															editing.images.filter((_, idx) => idx !== i)
														)
													}
												>
													<X size={14} />
												</button>
											</div>
										))}
									</div>
								)}

								{/* Add new gallery image */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
									<ImageUploader
										label="Add Gallery Image"
										value=""
										onChange={(url) => {
											const newImages = [...(editing.images || []), url];
											update("images", newImages);
										}}
									/>
								</div>
							</div>
						</div>

						{/* VALIDATION WARNING */}
						{!canSave() && (
							<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
								<p className="text-sm text-amber-800">
									⚠️ Please fill in all required fields: Category, Price, Cover Image, and Names in both languages.
								</p>
							</div>
						)}
					</div>
				</div>

				{/* FOOTER */}
				<div className="p-5 border-t bg-gray-50 flex justify-between items-center gap-3">
					<p className="text-xs text-gray-500">
						* Required fields
					</p>
					<div className="flex gap-3">
						<Button variant="outline" onClick={onClose} className="px-6">
							Cancel
						</Button>
						<Button
							onClick={onSave}
							disabled={!canSave()}
							className="px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{editing.id ? "Update Product" : "Create Product"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ── Sizes editor (language-agnostic, stored in en.variant.sizes) ── */
function SizesEditor({ editing, update }) {
	const [input, setInput] = useState("");
	const inputRef = useRef(null);

	const sizes = editing?.en?.variant?.sizes || [];

	const addSize = () => {
		const val = input.trim();
		if (!val || sizes.includes(val)) { setInput(""); return; }
		const next = [...sizes, val];
		update("en.variant", { ...(editing.en.variant || {}), sizes: next });
		update("ar.variant", { ...(editing.ar.variant || {}), sizes: next });
		setInput("");
		inputRef.current?.focus();
	};

	const removeSize = (s) => {
		const next = sizes.filter((x) => x !== s);
		update("en.variant", { ...(editing.en.variant || {}), sizes: next });
		update("ar.variant", { ...(editing.ar.variant || {}), sizes: next });
	};

	return (
		<div className="bg-gray-50 rounded-xl p-5 border space-y-4">
			<h3 className="font-semibold text-gray-900 flex items-center gap-2">
				<span className="w-1 h-5 bg-orange-400 rounded"></span>
				Product Sizes
				<span className="text-xs font-normal text-gray-400">(optional — e.g. Single, Queen, King, 180×200)</span>
			</h3>

			{sizes.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{sizes.map((s) => (
						<span
							key={s}
							className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg shadow-sm"
						>
							{s}
							<button
								type="button"
								onClick={() => removeSize(s)}
								className="text-gray-400 hover:text-red-500 transition"
							>
								<X size={12} />
							</button>
						</span>
					))}
				</div>
			)}

			<div className="flex gap-2">
				<input
					ref={inputRef}
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
					placeholder="e.g. Single, Double, Queen, 90×200 cm…"
					className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
				/>
				<button
					type="button"
					onClick={addSize}
					disabled={!input.trim()}
					className="flex items-center gap-1.5 bg-gray-800 hover:bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Plus size={14} />
					Add
				</button>
			</div>
			<p className="text-xs text-gray-400">Press Enter or click Add. Sizes apply to all languages.</p>
		</div>
	);
}

/* ── Materials editor (per-language, stored in variant.materials + material string) ── */
function MaterialsEditor({ editing, update, tab, predefined = [] }) {
	const [input, setInput] = useState("");
	const inputRef = useRef(null);

	const mats = editing?.[tab]?.variant?.materials || [];

	const syncMaterial = (next, locale) => {
		update(`${locale}.variant`, { ...(editing[locale].variant || {}), materials: next });
		update(`${locale}.material`, next.join(", "));
	};

	const addMaterial = () => {
		const val = input.trim();
		if (!val || mats.includes(val)) { setInput(""); return; }
		syncMaterial([...mats, val], tab);
		setInput("");
		inputRef.current?.focus();
	};

	const removeMaterial = (m) => {
		syncMaterial(mats.filter((x) => x !== m), tab);
	};

	const listId = `mat-predefined-${tab}`;

	return (
		<div className="bg-gray-50 rounded-xl p-5 border space-y-4">
			<h3 className="font-semibold text-gray-900 flex items-center gap-2">
				<span className="w-1 h-5 bg-teal-500 rounded"></span>
				Materials
				<span className="text-xs font-normal text-gray-400">
					({tab === "en" ? "English" : "Arabic"} — optional, e.g. Wood, Velvet, Marble)
				</span>
			</h3>

			{mats.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{mats.map((m) => (
						<span
							key={m}
							className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-sm px-3 py-1.5 rounded-lg shadow-sm"
						>
							{m}
							<button
								type="button"
								onClick={() => removeMaterial(m)}
								className="text-teal-400 hover:text-red-500 transition"
							>
								<X size={12} />
							</button>
						</span>
					))}
				</div>
			)}

			<div className="flex gap-2" dir={tab === "ar" ? "rtl" : "ltr"}>
				<input
					ref={inputRef}
					type="text"
					list={listId}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMaterial(); } }}
					placeholder={tab === "en" ? "e.g. Oak Wood, Velvet, Marble…" : "مثال: خشب، مخمل، رخام…"}
					className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
				/>
				{predefined.length > 0 && (
					<datalist id={listId}>
						{predefined.map((name) => (
							<option key={name} value={name} />
						))}
					</datalist>
				)}
				<button
					type="button"
					onClick={addMaterial}
					disabled={!input.trim()}
					className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Plus size={14} />
					Add
				</button>
			</div>
			<p className="text-xs text-gray-400">Press Enter or click Add. Each language has its own material labels.</p>
		</div>
	);
}
