"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Plus,
	Trash,
	Pencil,
	X,
	Loader2,
	ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

/* =====================================================
	ROLE MODAL (CREATE / EDIT)
===================================================== */

function RoleModal({ open, onClose, onSave, role, permissions }) {
	const isEdit = !!role;


	const resetState = () => {
		setName("");
		setSelected(["content.read"]);
		setSaving(false);
	};

	const [name, setName] = useState(role?.name || "");
	const [selected, setSelected] = useState(role?.permissions || ["content.read"]);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open) {
			if (role) {
				setName(role.name);

				const rolePermissions = [...(role.permissions || [])];
				if (!rolePermissions.includes("content.read")) {
					rolePermissions.push("content.read");
				}

				setSelected(rolePermissions);
			} else {
				setName("");
				setSelected(["content.read"]);
			}
		} else {
			// ✅ modal closed → reset everything
			resetState();
		}
	}, [open, role]);


	// Move useMemo BEFORE the early return
	const groupedPermissions = useMemo(() => {
		const groups = {};
		permissions.forEach((p) => {
			if (!groups[p.group]) groups[p.group] = [];
			groups[p.group].push(p);
		});

		// Sort permissions within each group by action (create, read, update, delete)
		const actionOrder = { create: 0, read: 1, update: 2, delete: 3 };
		Object.keys(groups).forEach(group => {
			groups[group].sort((a, b) => {
				return (actionOrder[a.action] || 99) - (actionOrder[b.action] || 99);
			});
		});

		return groups;
	}, [permissions]);

	if (!open) return null;

	const togglePermission = (key) => {
		// Prevent deselecting content.read
		if (key === "content.read") return;

		setSelected((prev) =>
			prev.includes(key)
				? prev.filter((p) => p !== key)
				: [...prev, key]
		);
	};

	const toggleAllInGroup = (groupPerms) => {
		const groupKeys = groupPerms.map(p => p.key);
		const allSelected = groupKeys.every(key => selected.includes(key));

		if (allSelected) {
			// When deselecting all, keep content.read
			setSelected(prev => prev.filter(p => !groupKeys.includes(p) || p === "content.read"));
		} else {
			setSelected(prev => [...new Set([...prev, ...groupKeys])]);
		}
	};

	async function handleSubmit() {
		if (!name.trim()) return;

		setSaving(true);
		await onSave({ name, permissionKeys: selected });
		setSaving(false);

		resetState();   // ✅ clear modal
		onClose();      // ✅ close modal
	}

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-xl w-full max-w-4xl p-6 shadow-xl max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<ShieldCheck className="w-5 h-5 text-blue-600" />
						{isEdit ? "Edit Role" : "Create Role"}
					</h2>
					<button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				<div className="space-y-4 flex-1 overflow-hidden flex flex-col">
					<Input
						placeholder="Role name (e.g. Content Manager)"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="flex-shrink-0"
					/>

					{/* Permission Matrix */}
					<div className="border rounded-xl p-4 overflow-y-auto flex-1">
						<div className="flex items-center justify-between mb-4">
							<p className="text-sm font-medium">
								Assign Permissions ({selected.length} selected)
							</p>
						</div>

						<div className="space-y-6">
							{Object.keys(groupedPermissions).sort().map((group) => {
								const groupPerms = groupedPermissions[group];
								const allSelected = groupPerms.every(p => selected.includes(p.key));
								const someSelected = groupPerms.some(p => selected.includes(p.key));

								return (
									<div key={group} className="bg-gray-50 rounded-lg p-4">
										<div className="flex items-center justify-between mb-3">
											<h4 className="text-sm font-semibold uppercase text-gray-700">
												{group}
											</h4>
											<button
												onClick={() => toggleAllInGroup(groupPerms)}
												className="text-xs text-blue-600 hover:text-blue-800 font-medium"
											>
												{allSelected ? 'Deselect All' : 'Select All'}
											</button>
										</div>

										<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
											{groupPerms.map((p) => {
												const isChecked = selected.includes(p.key);
												const isContentRead = p.key === "content.read";

												return (
													<label
														key={p.key}
														className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2.5 transition-all ${isContentRead
																? 'bg-green-50 border-green-300 cursor-not-allowed'
																: isChecked
																	? 'bg-blue-50 border-blue-300 shadow-sm cursor-pointer'
																	: 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
															}`}
														title={isContentRead ? "This permission is required and cannot be removed" : ""}
													>
														<input
															type="checkbox"
															checked={isChecked}
															onChange={() => togglePermission(p.key)}
															disabled={isContentRead}
															className={`w-4 h-4 rounded focus:ring-2 ${isContentRead
																	? 'text-green-600 cursor-not-allowed'
																	: 'text-blue-600 focus:ring-blue-500'
																}`}
														/>
														<span className={`capitalize font-medium ${isContentRead
																? 'text-green-900'
																: isChecked
																	? 'text-blue-900'
																	: 'text-gray-700'
															}`}>
															{p.action}
															{isContentRead && (
																<span className="text-[10px] ml-1 text-green-600">(Required)</span>
															)}
														</span>
													</label>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 mt-6 pt-4 border-t">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={saving || !name.trim()}>
						{saving && (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						)}
						Save Role
					</Button>
				</div>
			</div>
		</div>
	);
}

/* =====================================================
	MAIN PAGE
===================================================== */

export default function RolesPage() {
	const { permissions: myPermissions } = useAdminAuth();

	const canRead = myPermissions.includes("role.read");
	const canCreate = myPermissions.includes("role.create");
	const canUpdate = myPermissions.includes("role.update");
	const canDelete = myPermissions.includes("role.delete");

	const [roles, setRoles] = useState([]);
	const [permissions, setPermissions] = useState([]);
	const [loading, setLoading] = useState(true);

	const [modalOpen, setModalOpen] = useState(false);
	const [editingRole, setEditingRole] = useState(null);

	/* ---------------- Fetch Data ---------------- */

	async function fetchData() {
		setLoading(true);
		try {
			const [rRes, pRes] = await Promise.all([
				fetch("/api/roles"),
				fetch("/api/permissions"),
			]);

			const rolesData = await rRes.json();
			const permsData = await pRes.json();

			setRoles(rolesData);
			setPermissions(permsData);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (canRead) fetchData();
	}, [canRead]);

	/* ---------------- CRUD Handlers ---------------- */

	async function handleSave(data) {
		try {
			if (editingRole) {
				await fetch(`/api/roles/${editingRole.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
			} else {
				await fetch("/api/roles", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
			}

			setModalOpen(false);
			setEditingRole(null);
			fetchData();
		} catch (error) {
			console.error("Error saving role:", error);
		}
	}

	async function handleDelete(id) {
		if (!confirm("Are you sure you want to delete this role?")) return;
		try {
			await fetch(`/api/roles/${id}`, { method: "DELETE" });
			fetchData();
		} catch (error) {
			console.error("Error deleting role:", error);
		}
	}

	/* ---------------- Permission Guard ---------------- */

	if (!canRead) {
		return (
			<div className="p-10 text-center">
				<ShieldCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
				<h2 className="text-xl font-semibold text-gray-700 mb-2">
					Access Denied
				</h2>
				<p className="text-gray-500">
					You don't have permission to view roles.
				</p>
			</div>
		);
	}

	/* ---------------- Render ---------------- */

	return (
		<div className="p-8 max-w-6xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Roles & Permissions</h1>
					<p className="text-gray-500 text-sm mt-1">
						Create and manage roles and their permissions
					</p>
				</div>

				{canCreate && (
					<Button
						onClick={() => {
							setEditingRole(null);
							setModalOpen(true);
						}}
					>
						<Plus className="w-4 h-4 mr-2" />
						New Role
					</Button>
				)}
			</div>

			<div className="bg-white border rounded-xl shadow-sm overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 border-b">
						<tr>
							<th className="px-6 py-3 text-left font-semibold">Role</th>
							<th className="px-6 py-3 text-left font-semibold">Permissions</th>
							{(canUpdate || canDelete) && (
								<th className="px-6 py-3 text-right font-semibold">Actions</th>
							)}
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td
									colSpan={3}
									className="py-12 text-center text-gray-400"
								>
									<Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
									<p>Loading roles...</p>
								</td>
							</tr>
						) : roles.length === 0 ? (
							<tr>
								<td
									colSpan={3}
									className="py-12 text-center text-gray-400"
								>
									<ShieldCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
									<p>No roles found</p>
									{canCreate && (
										<p className="text-xs mt-1">Click "New Role" to create one</p>
									)}
								</td>
							</tr>
						) : (
							roles.map((role) => (
								<tr
									key={role.id}
									className="border-t hover:bg-gray-50 transition"
								>
									<td className="px-6 py-4 font-medium">
										<div className="flex items-center gap-2">
											<ShieldCheck className="w-4 h-4 text-blue-600" />
											{role.name}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-wrap gap-1">
											{role.permissions.slice(0, 6).map((p) => (
												<span
													key={p}
													className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200"
												>
													{p}
												</span>
											))}
											{role.permissions.length > 6 && (
												<span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md">
													+{role.permissions.length - 6} more
												</span>
											)}
										</div>
									</td>
									{(canUpdate || canDelete) && (
										<td className="px-6 py-4 text-right">
											<div className="inline-flex gap-2">
												{canUpdate && (
													<button
														onClick={() => {
															setEditingRole(role);
															setModalOpen(true);
														}}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
														title="Edit role"
													>
														<Pencil className="w-4 h-4" />
													</button>
												)}
												{canDelete && (
													<button
														onClick={() => handleDelete(role.id)}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
														title="Delete role"
													>
														<Trash className="w-4 h-4" />
													</button>
												)}
											</div>
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<RoleModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setEditingRole(null);
				}}
				onSave={handleSave}
				role={editingRole}
				permissions={permissions}
			/>
		</div>
	);
}