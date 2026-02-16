'use client';
import { useState, useEffect } from 'react';
import {
	Sparkles,
	Calendar,
	Clock,
	ArrowRight,
	LayoutDashboard,
	Users,
	ShoppingBag,
	Settings,
	FileText,
	TrendingUp,
	Shield,
	Star,
	Zap,
} from 'lucide-react';

export default function AdminWelcome() {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [greeting, setGreeting] = useState('');
	const adminName = "Admin";

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);

		const hour = new Date().getHours();
		if (hour < 12) setGreeting('Good Morning');
		else if (hour < 18) setGreeting('Good Afternoon');
		else setGreeting('Good Evening');

		return () => clearInterval(timer);
	}, []);

	const quickLinks = [
		{ 
			title: 'Manage Users', 
			description: 'Add, edit, or remove users from the system',
			icon: Users, 
			color: 'blue',
			gradient: 'from-blue-500 to-blue-600'
		},
		{ 
			title: 'Content Management', 
			description: 'Create and manage your website content',
			icon: FileText, 
			color: 'purple',
			gradient: 'from-purple-500 to-purple-600'
		},
		{ 
			title: 'Orders & Sales', 
			description: 'View and manage customer orders',
			icon: ShoppingBag, 
			color: 'emerald',
			gradient: 'from-emerald-500 to-emerald-600'
		},
		{ 
			title: 'Reports & Analytics', 
			description: 'View detailed business insights',
			icon: TrendingUp, 
			color: 'amber',
			gradient: 'from-amber-500 to-amber-600'
		},
		{ 
			title: 'Roles & Permissions', 
			description: 'Manage user roles and access control',
			icon: Shield, 
			color: 'indigo',
			gradient: 'from-indigo-500 to-indigo-600'
		},
		{ 
			title: 'System Settings', 
			description: 'Configure your system preferences',
			icon: Settings, 
			color: 'slate',
			gradient: 'from-slate-500 to-slate-600'
		},
	];

	const recentUpdates = [
		{ title: 'New Dashboard Features', date: 'Jan 15, 2026', badge: 'New' },
		{ title: 'Security Updates Available', date: 'Jan 14, 2026', badge: 'Important' },
		{ title: 'Performance Improvements', date: 'Jan 13, 2026', badge: 'Update' },
	];

	return (
		<div className="min-h-screen p-4 md:p-8">
			<div className="max-w-7xl mx-auto space-y-8">

				{/* Hero Header */}
				<div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
					<div className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 md:px-10 py-10 md:py-16">
						{/* Background Pattern */}
						<div className="absolute inset-0 opacity-10">
							<div className="absolute top-0 left-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
							<div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
						</div>

						<div className="relative">
							<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
								<div className="flex items-start gap-4 md:gap-6">
									{/* Logo */}
									<div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-2xl border border-white/20 flex-shrink-0">
										<div className="flex gap-1">
											<img src="/logo.png" width={60} height={60} alt="Atlantis" />
										</div>
									</div>

									<div>
										<h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-start gap-3 flex-wrap">
											{greeting}, {adminName}! 
											<Sparkles className="w-8 h-8 md:w-10 md:h-10 text-amber-400 mt-1" />
										</h1>
										<p className="text-slate-300 text-base md:text-xl mb-4">
											Welcome to your Atlantis Admin Dashboard
										</p>
										<p className="text-slate-400 text-sm md:text-base">
											Manage your business operations from one central location
										</p>
									</div>
								</div>

								<div className="flex flex-col items-start lg:items-end gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
									<div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
										<Calendar className="w-5 h-5" />
										<span className="font-medium">
											{currentTime.toLocaleDateString('en-US', { 
												weekday: 'long',
												month: 'long', 
												day: 'numeric',
												year: 'numeric'
											})}
										</span>
									</div>
									<div className="flex items-center gap-2 text-amber-400">
										<Clock className="w-5 h-5" />
										<span className="font-mono text-2xl md:text-3xl font-bold">
											{currentTime.toLocaleTimeString('en-US', { 
												hour: '2-digit', 
												minute: '2-digit',
												second: '2-digit'
											})}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Welcome Message */}
				<div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 md:p-8 text-white">
					<div className="flex items-start gap-4">
						<div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-shrink-0">
							<LayoutDashboard className="w-6 h-6 md:w-8 md:h-8 text-white" />
						</div>
						<div>
							<h2 className="text-xl md:text-2xl font-bold mb-2">Get Started with Your Dashboard</h2>
							<p className="text-blue-100 text-sm md:text-base leading-relaxed">
								Your admin panel is ready to use. Select any option below to begin managing your platform. 
								Each section has been designed to give you complete control over your business operations.
							</p>
						</div>
					</div>
				</div>
				{/* Recent Updates Section */}
				<div className="grid md:grid-cols-2 gap-6">
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
								<Star className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900">Recent Updates</h3>
						</div>
						<div className="space-y-4">
							{recentUpdates.map((update, index) => (
								<div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
									<div className="flex items-start justify-between gap-3 mb-2">
										<h4 className="font-semibold text-gray-900 text-sm">{update.title}</h4>
										<span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
											update.badge === 'New' 
												? 'bg-green-100 text-green-700' 
												: update.badge === 'Important'
												? 'bg-red-100 text-red-700'
												: 'bg-blue-100 text-blue-700'
										}`}>
											{update.badge}
										</span>
									</div>
									<p className="text-xs text-gray-500">{update.date}</p>
								</div>
							))}
						</div>
					</div>

					{/* Resources Section */}
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl">
								<FileText className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900">Helpful Resources</h3>
						</div>
						<div className="space-y-3">
							<button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
								<span className="font-medium text-gray-700 text-sm">Documentation</span>
								<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
							</button>
							<button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
								<span className="font-medium text-gray-700 text-sm">Video Tutorials</span>
								<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
							</button>
							<button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
								<span className="font-medium text-gray-700 text-sm">Support Center</span>
								<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
							</button>
							<button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
								<span className="font-medium text-gray-700 text-sm">Contact Support</span>
								<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
							</button>
						</div>
					</div>
				</div>

				{/* Bottom CTA Banner */}
				<div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
					</div>
					<div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
						<div>
							<h3 className="text-2xl md:text-3xl font-bold mb-2">Need Help Getting Started?</h3>
							<p className="text-slate-300 text-sm md:text-base">
								Our support team is here to assist you with any questions or concerns.
							</p>
						</div>
						<button className="w-full md:w-auto bg-amber-400 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-amber-300 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap">
							Get Support
							<ArrowRight className="w-5 h-5" />
						</button>
					</div>
				</div>

			</div>
		</div>
	);
}
