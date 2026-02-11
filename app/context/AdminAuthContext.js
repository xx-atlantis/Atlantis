"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
	const pathname = usePathname();

	const [admin, setAdmin] = useState(null);
	const [roles, setRoles] = useState([]);
	const [permissions, setPermissions] = useState([]);
	const [loading, setLoading] = useState(true);

	function setAdminSession(adminData) {
		console.log("✅ Admin session restored:", adminData);
		setAdmin(adminData);
		setRoles(adminData.roles || []);
		setPermissions(adminData.permissions || []);
	}

	function clearAdminSession() {
		setAdmin(null);
		setRoles([]);
		setPermissions([]);
	}

	useEffect(() => {
		// 🚫 Not an admin route → skip API call
		if (!pathname.startsWith("/admin")) {
			setLoading(false);
			return;
		}

		async function restoreSession() {
			try {
				const res = await fetch("/api/admin/me");

				if (!res.ok) {
					clearAdminSession();
					return;
				}

				const data = await res.json();

				if (data.success && data.admin) {
					setAdminSession(data.admin);
				} else {
					clearAdminSession();
				}
			} catch (err) {
				console.error("Session restore failed:", err);
				clearAdminSession();
			} finally {
				setLoading(false);
			}
		}

		restoreSession();
	}, [pathname]);

	return (
		<AdminAuthContext.Provider
			value={{
				admin,
				roles,
				permissions,
				loading,
				isAuthenticated: !!admin,
				setAdminSession,
				clearAdminSession,
			}}
		>
			{!loading && children}
		</AdminAuthContext.Provider>
	);
}

// Custom hook
export function useAdminAuth() {
	const ctx = useContext(AdminAuthContext);
	if (!ctx) {
		throw new Error("useAdminAuth must be used inside AdminAuthProvider");
	}
	return ctx;
}
