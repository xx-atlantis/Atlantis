"use client";

import { useEffect, useState } from "react";
import {
	Plus,
	Trash,
	Pencil,
	Shield,
	X,
	Loader2,
	User,
	Mail,
	Lock,
	ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* =====================================================
	MODAL COMPONENT
===================================================== */

function UserModal({ open, onClose, onSave, roles, user }) {
	const isEdit = !!user;

	const resetState = () => {
		setEmail("");
		setPassword("");
		setSelectedRoles([]);
		setSaving(false);
	};


	const [email, setEmail] = useState(user?.email || "");
	const [password, setPassword] = useState("");
	const [selectedRoles, setSelectedRoles] = useState(
		user?.roles?.map((r) => r.id) || []
	);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open) {
			if (user) {
				setEmail(user.email);
				setSelectedRoles(user.roles?.map((r) => r.id) || []);
				setPassword(""); // never prefill password
			} else {
				setEmail("");
				setPassword("");
				setSelectedRoles([]);
			}
		} else {
			// ✅ modal closed → clear everything
			resetState();
		}
	}, [open, user]);


	if (!open) return null;

	const toggleRole = (id) => {
		setSelectedRoles((prev) =>
			prev.includes(id)
				? prev.filter((r) => r !== id)
				: [...prev, id]
		);
	};

	const selectAllRoles = () => {
		if (selectedRoles.length === roles.length) {
			setSelectedRoles([]);
		} else {
			setSelectedRoles(roles.map(r => r.id));
		}
	};

	async function handleSubmit() {
		if (!email.trim()) return;
		if (!isEdit && !password.trim()) return;

		setSaving(true);
		await onSave({
			email,
			password,
			roleIds: selectedRoles,
		});
		setSaving(false);

		resetState();  // ✅ clear modal
		onClose();     // ✅ close modal
	}


	const allSelected = selectedRoles.length === roles.length;

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<User className="w-6 h-6 text-blue-600" />
						{isEdit ? "Edit Admin User" : "Create Admin User"}
					</h2>
					<button
						onClick={onClose}
						className="hover:bg-gray-100 p-1 rounded transition"
					>
						<X className="w-5 h-5 text-gray-400" />
					</button>
				</div>

				<div className="space-y-5">
					{/* Email Input */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email Address
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<Input
								type="email"
								placeholder="admin@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Password Input - Only for new users */}
					{!isEdit && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<Input
									type="password"
									placeholder="Enter secure password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
					)}

					{/* Roles Selection */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
								<Shield className="w-4 h-4" />
								Assign Roles
							</label>
							<button
								onClick={selectAllRoles}
								className="text-xs text-blue-600 hover:text-blue-800 font-medium"
							>
								{allSelected ? 'Deselect All' : 'Select All'}
							</button>
						</div>

						<div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
							{roles.length === 0 ? (
								<p className="text-sm text-gray-400 text-center py-4">
									No roles available
								</p>
							) : (
								<div className="space-y-2">
									{roles.map((role) => {
										const isChecked = selectedRoles.includes(role.id);
										return (
											<label
												key={role.id}
												className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isChecked
														? 'bg-blue-50 border border-blue-200'
														: 'bg-white border border-gray-200 hover:bg-gray-50'
													}`}
											>
												<input
													type="checkbox"
													checked={isChecked}
													onChange={() => toggleRole(role.id)}
													className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
												/>
												<div className="flex-1">
													<div className={`text-sm font-medium ${isChecked ? 'text-blue-900' : 'text-gray-700'
														}`}>
														{role.name}
													</div>
													{role.permissions && (
														<div className="text-xs text-gray-500 mt-0.5">
															{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
														</div>
													)}
												</div>
												{isChecked && (
													<ShieldCheck className="w-5 h-5 text-blue-600" />
												)}
											</label>
										);
									})}
								</div>
							)}
						</div>

						{selectedRoles.length > 0 && (
							<p className="text-xs text-gray-500 mt-2">
								{selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
							</p>
						)}
					</div>
				</div>

				<div className="flex justify-end gap-3 mt-6 pt-6 border-t">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={saving || !email.trim() || (!isEdit && !password.trim())}
					>
						{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						{isEdit ? 'Update User' : 'Create User'}
					</Button>
				</div>
			</div>
		</div>
	);
}

/* =====================================================
	MAIN PAGE
===================================================== */

export default function AdminUsersPage() {
	const { permissions } = useAdminAuth();

	const canRead = permissions.includes("user.read");
	const canCreate = permissions.includes("user.create");
	const canUpdate = permissions.includes("user.update");
	const canDelete = permissions.includes("user.delete");

	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(true);

	const [modalOpen, setModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);

	/* ---------------- Fetch Data ---------------- */

	async function fetchData() {
		setLoading(true);
		try {
			const [uRes, rRes] = await Promise.all([
				fetch("/api/admin/users"),
				fetch("/api/roles"),
			]);
			const usersData = await uRes.json();
			const rolesData = await rRes.json();
			setUsers(usersData);
			setRoles(rolesData);
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
			if (editingUser) {
				await fetch(`/api/admin/users/${editingUser.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
			} else {
				await fetch("/api/admin/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
			}

			setModalOpen(false);
			setEditingUser(null);
			fetchData();
		} catch (error) {
			console.error("Error saving user:", error);
		}
	}

	async function handleDelete(id) {
		if (!confirm("Are you sure you want to delete this admin user?")) return;

		try {
			await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
			fetchData();
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	}

	/* ---------------- Permission Guard ---------------- */

	if (!canRead) {
		return (
			<div className="p-10 text-center">
				<User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
				<h2 className="text-xl font-semibold text-gray-700 mb-2">
					Access Denied
				</h2>
				<p className="text-gray-500">
					You don't have permission to view admin users.
				</p>
			</div>
		);
	}

	/* ---------------- Render ---------------- */

	return (
		<div className="p-8 max-w-6xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Admin Users</h1>
					<p className="text-gray-500 text-sm mt-1">
						Manage admin users and assign roles
					</p>
				</div>

				{canCreate && (
					<Button
						onClick={() => {
							setEditingUser(null);
							setModalOpen(true);
						}}
					>
						<Plus className="w-4 h-4 mr-2" />
						New Admin
					</Button>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-blue-600 font-medium">Total Admins</p>
							<p className="text-2xl font-bold text-blue-900 mt-1">
								{users.length}
							</p>
						</div>
						<div className="bg-blue-200 p-3 rounded-lg">
							<User className="w-6 h-6 text-blue-700" />
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-purple-600 font-medium">Total Roles</p>
							<p className="text-2xl font-bold text-purple-900 mt-1">
								{roles.length}
							</p>
						</div>
						<div className="bg-purple-200 p-3 rounded-lg">
							<Shield className="w-6 h-6 text-purple-700" />
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-green-600 font-medium">Active Users</p>
							<p className="text-2xl font-bold text-green-900 mt-1">
								{users.filter(u => u.roles?.length > 0).length}
							</p>
						</div>
						<div className="bg-green-200 p-3 rounded-lg">
							<ShieldCheck className="w-6 h-6 text-green-700" />
						</div>
					</div>
				</div>
			</div>

			{/* Users Table */}
			<div className="bg-white border rounded-xl shadow-sm overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 border-b">
						<tr>
							<th className="px-6 py-3 text-left font-semibold text-gray-700">
								Admin User
							</th>
							<th className="px-6 py-3 text-left font-semibold text-gray-700">
								Assigned Roles
							</th>
							{(canUpdate || canDelete) && (
								<th className="px-6 py-3 text-right font-semibold text-gray-700">
									Actions
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={3} className="py-12 text-center text-gray-400">
									<Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-600" />
									<p>Loading admin users...</p>
								</td>
							</tr>
						) : users.length === 0 ? (
							<tr>
								<td colSpan={3} className="py-12 text-center text-gray-400">
									<User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
									<p className="font-medium">No admin users found</p>
									{canCreate && (
										<p className="text-xs mt-1">Click "New Admin" to create one</p>
									)}
								</td>
							</tr>
						) : (
							users.map((user) => (
								<tr
									key={user.id}
									className="border-t hover:bg-gray-50 transition"
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-lg">
												<User className="w-5 h-5 text-blue-700" />
											</div>
											<div>
												<p className="font-medium text-gray-900">{user.email}</p>
												<p className="text-xs text-gray-500">
													{user.roles?.length || 0} role{user.roles?.length !== 1 ? 's' : ''} assigned
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-wrap gap-2">
											{user.roles && user.roles.length > 0 ? (
												<>
													{user.roles.slice(0, 3).map((r) => (
														<span
															key={r.id}
															className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"
														>
															<Shield className="w-3 h-3" />
															{r.name}
														</span>
													))}
													{user.roles.length > 3 && (
														<span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200">
															+{user.roles.length - 3} more
														</span>
													)}
												</>
											) : (
												<span className="text-xs text-gray-400 italic">
													No roles assigned
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
															setEditingUser(user);
															setModalOpen(true);
														}}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
														title="Edit user"
													>
														<Pencil className="w-4 h-4" />
													</button>
												)}

												{canDelete && (
													<button
														onClick={() => handleDelete(user.id)}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
														title="Delete user"
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

			<UserModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setEditingUser(null);
				}}
				onSave={handleSave}
				roles={roles}
				user={editingUser}
			/>
		</div>
	);
}