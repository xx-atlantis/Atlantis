"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import Link from "next/link";

export default function AdminLogin() {
	const router = useRouter();
	const { setAdminSession } = useAdminAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPass, setShowPass] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// ⭐ Press Enter to Login
	useEffect(() => {
		const handleEnter = (e) => {
			if (e.key === "Enter") handleLogin();
		};
		window.addEventListener("keydown", handleEnter);
		return () => window.removeEventListener("keydown", handleEnter);
	});

async function handleLogin() {
	try {
		setError("");
		setLoading(true);

		const res = await fetch("/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await res.json();
		setLoading(false);

		if (data.error) {
			setError(data.error);

			const formEl = document.getElementById("login-card");
			formEl.classList.add("animate-shake");
			setTimeout(() => formEl.classList.remove("animate-shake"), 600);
			return;
		}

		// ✅ STORE ADMIN, ROLES & PERMISSIONS IN CONTEXT
		setAdminSession(data.admin);

		router.push("/admin/wellcome");
	} catch (err) {
		setLoading(false);
		setError("Something went wrong. Try again.");
	}
}


	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
			<div
				id="login-card"
				className="w-full max-w-md bg-white/60 backdrop-blur-md 
                   shadow-xl rounded-2xl p-8 space-y-6 border border-white/40"
			>
				{/* Logo */}
				<div className="flex justify-center">
					<Image src="/logo.png" width={70} height={70} alt="Admin Logo" />
				</div>

				{/* Title */}
				<div className="text-center space-y-1">
					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
						Admin Login
					</h1>
					<p className="text-sm text-gray-600">
						Enter your credentials to continue
					</p>
				</div>

				{/* Error */}
				{error && (
					<p className="text-red-600 text-sm bg-red-100 p-2 rounded border border-red-300 text-center">
						{error}
					</p>
				)}

				{/* Form */}
				<div className="space-y-4">
					{/* Email */}
					<div>
						<label className="text-sm font-medium text-gray-800 mb-1 block">
							Email
						</label>
						<Input
							type="email"
							placeholder="admin@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-12 rounded-lg"
						/>
					</div>

					{/* Password */}
					<div>
						<label className="text-sm font-medium text-gray-800 mb-1 block">
							Password
						</label>

						<div className="relative">
							<Input
								type={showPass ? "text" : "password"}
								placeholder="Enter Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-12 pr-12 rounded-lg"
							/>

							<button
								type="button"
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
								onClick={() => setShowPass(!showPass)}
							>
								{showPass ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					{/* Login Button */}
					<Button
						className="w-full h-12 text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
						disabled={loading}
						onClick={handleLogin}
					>
						{loading ? <Loader2 size={18} className="animate-spin" /> : "Login"}
					</Button>
					<div className="justify-center text-center mt-4">
						<Link href="/" className="text-sm text-gray-700 hover:underline">
							Go back to Site
						</Link>
					</div>
				</div>
			</div>

			{/* Tailwind animation */}
			<style>{`
				.animate-shake {
					animation: shake 0.4s ease-in-out;
				}
				@keyframes shake {
					10%, 90% { transform: translateX(-2px); }
					20%, 80% { transform: translateX(4px); }
					30%, 50%, 70% { transform: translateX(-8px); }
					40%, 60% { transform: translateX(8px); }
				}
			`}</style>
		</div>
	);
}
