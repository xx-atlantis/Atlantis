'use client';

import { ShieldX, Home, ArrowLeft, Mail, Lock, UserRoundCog } from 'lucide-react';
import Link from 'next/link';

export default function Forbidden403() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex items-center justify-center">
			<div className="relative w-full">
				{/* Card */}
				<div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border-gray-200 overflow-hidden">

					{/* ===== Top Section ===== */}
					<div className="relative px-8 md:px-14 pt-16 pb-14 bg-gradient-to-br from-slate-50 to-gray-100">
						{/* Logo */}
						<div className="flex items-center gap-3 mb-10">
							<div className="flex gap-1 relative">
								<img src="/logo.png" width={40} height={40} alt="Atlantis" />
							</div>
							<span className="text-xl font-bold tracking-wide text-slate-800">
								Atlantis
							</span>
						</div>

						{/* Icon */}
						<div className="flex justify-center mb-10">
							<div className="relative">
								<div className="absolute inset-0 rounded-3xl bg-red-500/25 blur-3xl"></div>
								<div className="relative bg-white p-7 rounded-3xl border border-red-100 shadow-xl">
									<ShieldX className="w-16 h-16 text-red-500 animate-pulse " strokeWidth={1.4} />
								</div>
							</div>
						</div>

						{/* Text */}
						<div className="text-center">
							<h1 className="text-[5.5rem] md:text-[6.5rem] font-black tracking-tight text-slate-800 leading-none">
								403
							</h1>
							<h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">
								Access Forbidden
							</h2>
							<p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
								You don’t have permission to access this page. 
								If you believe this is a mistake, please contact your system administrator.
							</p>
						</div>
					</div>

					{/* ===== Bottom Section ===== */}
					<div className="px-8 md:px-14 py-12">
						{/* Info Cards */}
						<div className="grid md:grid-cols-2 gap-6 mb-10">
							<div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
								<div className="flex gap-4">
									<div className="bg-slate-700 p-3 rounded-xl">
										<Lock className="w-5 h-5 text-white" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											Restricted Area
										</h3>
										<p className="mt-1 text-sm text-gray-600">
											This page requires elevated permissions.
										</p>
									</div>
								</div>
							</div>

							<div className="group bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
								<div className="flex gap-4">
									<div className="bg-amber-400 p-3 rounded-xl">
										<Mail className="w-5 h-5 text-slate-800" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											Need Access?
										</h3>
										<p className="mt-1 text-sm text-gray-600">
											Reach out to your administrator for assistance.
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex flex-col  sm:flex-row gap-5 justify-center">
							<Link
								href="/admin/welcome"
								className="w-1/2 px-8 py-3 rounded-md bg-slate-800 text-white font-semibold hover:bg-slate-900 shadow-lg transition flex items-center gap-2 justify-center"
							>
								<UserRoundCog className="w-5 h-5" />
								Go Back to Admin
							</Link>
						</div>

						{/* Footer */}
						<div className="mt-12 pt-6 border-t border-gray-200 text-center">
							<p className="text-sm text-gray-500">
								Error Code:{' '}
								<span className="font-mono font-semibold text-slate-700">
									ERR_FORBIDDEN_403
								</span>
							</p>

							<p className="mt-4 text-sm text-gray-600">
								Still having trouble? Contact{' '}
								<a
									href="mailto:support@atlantis.com"
									className="font-semibold text-slate-800 hover:underline"
								>
									support@atlantis.com
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
