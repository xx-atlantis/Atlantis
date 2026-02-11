"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  ShoppingBag, 
  X,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";

// --- MOCK DATA (Replace with your API fetch) ---
const MOCK_CUSTOMERS = [
  {
    id: "cust_01",
    name: "Murtaza Ghani",
    email: "murtaza.ghani91@gmail.com",
    phone: "+966537878794",
    joinDate: "2025-09-25",
    status: "Active",
    address: "Riyadh, Saudi Arabia",
    totalSpent: 12500,
    ordersCount: 3,
    notes: "Client prefers communication via WhatsApp.",
    orders: [
      { id: "ord_882", date: "2026-02-10", type: "package", status: "In Progress", total: 8500, items: "Villa Design Package" },
      { id: "ord_881", date: "2026-01-15", type: "shop", status: "Delivered", total: 4000, items: "Modern Chandeliers (x2)" },
    ]
  },
  {
    id: "cust_02",
    name: "Sarah Ahmed",
    email: "sarah.des@example.com",
    phone: "+966501234567",
    joinDate: "2026-01-05",
    status: "Active",
    address: "Jeddah, Al-Rawdah Dist.",
    totalSpent: 450,
    ordersCount: 1,
    notes: "Gate code is 1234.",
    orders: [
      { id: "ord_901", date: "2026-02-01", type: "shop", status: "Processing", total: 450, items: "Decorative Vases" },
    ]
  },
  // Add more mock users...
];

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Filter Logic
  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-[#2D3247]" dir="ltr">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3247]">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your client base and view their history.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
             <Filter size={16} /> Filter
          </button>
          <button className="bg-[#2D3247] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1e2231] flex items-center gap-2">
             + Add Customer
          </button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, or phone..." 
          className="w-full outline-none text-sm text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- CUSTOMERS TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="p-4">Customer</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Orders</th>
              <th className="p-4 text-right">Total Spent</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className="hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5e7e7d]/10 text-[#5e7e7d] flex items-center justify-center font-bold text-sm">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#2D3247]">{customer.name}</p>
                      <p className="text-xs text-gray-400">ID: {customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                   <div className="flex flex-col gap-1">
                     <span className="flex items-center gap-2"><Mail size={12} className="text-gray-400"/> {customer.email}</span>
                     <span className="flex items-center gap-2"><Phone size={12} className="text-gray-400"/> {customer.phone}</span>
                   </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    customer.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-500"
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="p-4 text-right text-sm font-medium">{customer.ordersCount}</td>
                <td className="p-4 text-right text-sm font-bold text-[#2D3247]">{customer.totalSpent.toLocaleString()} SAR</td>
                <td className="p-4 text-center">
                  <button className="text-gray-400 hover:text-[#5e7e7d] p-2 rounded-full hover:bg-[#5e7e7d]/10 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">
                  No customers found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- DETAIL DRAWER (Slide Over) --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          ></div>

          {/* Panel */}
          <div className="relative w-full md:w-[480px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h2 className="text-lg font-bold text-[#2D3247]">Customer Details</h2>
               <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                 <X size={20} className="text-gray-500" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Profile Card */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-2xl font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2D3247]">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">Member since {selectedCustomer.joinDate}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2">
                       <Mail size={12} /> Email
                    </button>
                    <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2">
                       <Phone size={12} /> Call
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Spent</p>
                   <p className="text-lg font-bold text-[#5e7e7d]">{selectedCustomer.totalSpent.toLocaleString()} SAR</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Orders</p>
                   <p className="text-lg font-bold text-[#2D3247]">{selectedCustomer.ordersCount}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2">Contact Information</h4>
                 <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-[#5e7e7d]" />
                      <span className="text-gray-700">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-[#5e7e7d]" />
                      <span className="text-gray-700" dir="ltr">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-[#5e7e7d] mt-0.5" />
                      <span className="text-gray-700">{selectedCustomer.address}</span>
                    </div>
                 </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm">
                   <p className="text-amber-800 font-bold mb-1 text-xs uppercase">Notes</p>
                   <p className="text-amber-900/80 leading-relaxed">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Order History */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2">Recent Orders</h4>
                 <div className="space-y-3">
                   {selectedCustomer.orders.map((order) => (
                     <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#5e7e7d] transition-colors bg-white group cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.type === 'package' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              {order.type === 'package' ? <Package size={14} /> : <ShoppingBag size={14} />}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-[#2D3247]">{order.items}</p>
                              <p className="text-xs text-gray-500">{order.date} • {order.status}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold">{order.total.toLocaleString()} SAR</p>
                           <ArrowUpRight size={14} className="ml-auto text-gray-300 group-hover:text-[#5e7e7d]" />
                        </div>
                     </div>
                   ))}
                 </div>
              </div>

            </div>
            
            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
               <button className="w-full py-3 bg-[#2D3247] text-white rounded-lg font-bold text-sm hover:bg-[#1e2231]">
                 Edit Customer Profile
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}