"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Mail, Phone, MapPin, 
  Package, ShoppingBag, X, ChevronRight, 
  ArrowUpRight, Plus, Save, Trash2, Loader2 
} from "lucide-react";
import { useAdminAuth } from "@/app/context/AdminAuthContext"; // Integrated Auth Context

export default function AdminCustomersPage() {
  const { permissions } = useAdminAuth(); // Permission check (optional)
  
  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", status: "Active", notes: ""
  });

  // --- 1. FETCH & AGGREGATE DATA ---
  useEffect(() => {
    const fetchCustomersFromOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/order");
        const data = await res.json();
        
        // Handle different API response structures
        const ordersArray = Array.isArray(data) ? data : data.orders || data.data || [];

        // --- AGGREGATION LOGIC ---
        // We group orders by Email to create unique "Customer" profiles
        const customerMap = {};

        ordersArray.forEach((order) => {
            const email = order.customerEmail;
            if (!email) return;

            // If customer doesn't exist in map yet, initialize them
            if (!customerMap[email]) {
                customerMap[email] = {
                    id: order.customerId || order.id, // Fallback if no customerId
                    name: order.customerName || "Unknown",
                    email: order.customerEmail,
                    phone: order.customerPhone || "N/A",
                    address: order.address || "N/A",
                    joinDate: new Date(order.createdAt).toISOString().split('T')[0],
                    status: "Active",
                    totalSpent: 0,
                    ordersCount: 0,
                    notes: order.notes || "",
                    orders: []
                };
            }

            // Update Aggregates
            customerMap[email].totalSpent += parseFloat(order.total || 0);
            customerMap[email].ordersCount += 1;
            
            // Add to detailed order history
            customerMap[email].orders.push({
                id: order.id,
                date: new Date(order.createdAt).toLocaleDateString(),
                type: order.orderType || "shop", // Assumes 'orderType' exists or defaults
                status: order.orderStatus,
                total: parseFloat(order.total || 0),
                items: order.packageDetails?.title || `Order #${order.id.slice(-4)}` // Fallback title
            });
            
            // Update phone/address if the new order has better data
            if(order.customerPhone && (!customerMap[email].phone || customerMap[email].phone === "N/A")) {
                customerMap[email].phone = order.customerPhone;
            }
            if(order.address && (!customerMap[email].address || customerMap[email].address === "N/A")) {
                customerMap[email].address = order.address;
            }
        });

        // Convert Map to Array
        setCustomers(Object.values(customerMap));

      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersFromOrders();
  }, []);

  // --- 2. FILTER LOGIC ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  // --- 3. HANDLERS ---

  const handleOpenAdd = () => {
    setFormData({ name: "", email: "", phone: "", address: "", status: "Active", notes: "" });
    setIsAddModalOpen(true);
  };

  const handleSaveNew = async () => {
    setIsSaving(true);
    // Mimic API delay
    setTimeout(() => {
      const newCustomer = {
        ...formData,
        id: `cust_${Math.floor(Math.random() * 1000)}`,
        joinDate: new Date().toISOString().split('T')[0],
        totalSpent: 0,
        ordersCount: 0,
        orders: []
      };
      setCustomers([newCustomer, ...customers]); 
      setIsAddModalOpen(false);
      setIsSaving(false);
    }, 800);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData({
      name: selectedCustomer.name,
      email: selectedCustomer.email,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address,
      status: selectedCustomer.status,
      notes: selectedCustomer.notes
    });
  };

  const handleUpdateCustomer = async () => {
    setIsSaving(true);
    setTimeout(() => {
      const updatedList = customers.map(c => 
        c.email === selectedCustomer.email ? { ...c, ...formData } : c
      );
      setCustomers(updatedList);
      setSelectedCustomer({ ...selectedCustomer, ...formData });
      setIsEditing(false);
      setIsSaving(false);
    }, 800);
  };

  const handleDeleteCustomer = () => {
    if(!confirm("Are you sure you want to delete this customer?")) return;
    const updatedList = customers.filter(c => c.email !== selectedCustomer.email);
    setCustomers(updatedList);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-[#2D3247]" dir="ltr">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3247]">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your client base ({customers.length} total)</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
             <Filter size={16} /> Filter
          </button>
          <button 
            onClick={handleOpenAdd}
            className="bg-[#2D3247] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1e2231] flex items-center gap-2 transition-colors"
          >
             <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm flex items-center gap-3 focus-within:ring-1 focus-within:ring-[#2D3247]">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, or phone..." 
          className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
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
            {loading ? (
                <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400 text-sm">
                        <div className="flex justify-center items-center gap-2">
                             <Loader2 className="animate-spin" size={20} /> Loading customer data...
                        </div>
                    </td>
                </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500 text-sm">
                  No customers found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
                filteredCustomers.map((customer) => (
                <tr 
                    key={customer.email} // Using email as key since it's unique
                    onClick={() => { setSelectedCustomer(customer); setIsEditing(false); }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                    <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5e7e7d]/10 text-[#5e7e7d] flex items-center justify-center font-bold text-sm">
                        {(customer.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                        <p className="font-bold text-sm text-[#2D3247]">{customer.name}</p>
                        <p className="text-xs text-gray-400">Since: {customer.joinDate}</p>
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
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD CUSTOMER MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#2D3247]">Add New Customer</h3>
                <button onClick={() => setIsAddModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
             </div>
             <div className="space-y-4">
                <input 
                  className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-[#2D3247]" 
                  placeholder="Full Name"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-[#2D3247]" 
                  placeholder="Email Address"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-[#2D3247]" 
                  placeholder="Phone Number"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <input 
                  className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-[#2D3247]" 
                  placeholder="Location / Address"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <button 
                  onClick={handleSaveNew}
                  disabled={isSaving}
                  className="w-full bg-[#2D3247] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#1e2231] flex justify-center items-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Create Customer"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- DETAIL DRAWER (VIEW & EDIT) --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}></div>

          <div className="relative w-full md:w-[480px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h2 className="text-lg font-bold text-[#2D3247]">
                 {isEditing ? "Edit Customer" : "Customer Details"}
               </h2>
               <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                 <X size={20} className="text-gray-500" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* EDIT MODE FORM */}
              {isEditing ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                     <input className="w-full border p-2 rounded text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                        <input className="w-full border p-2 rounded text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone</label>
                        <input className="w-full border p-2 rounded text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Address</label>
                     <input className="w-full border p-2 rounded text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status</label>
                     <select className="w-full border p-2 rounded text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes</label>
                     <textarea className="w-full border p-2 rounded text-sm h-24" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                   </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-2xl font-bold">
                      {(selectedCustomer.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#2D3247]">{selectedCustomer.name}</h3>
                      <p className="text-sm text-gray-500">Joined {selectedCustomer.joinDate}</p>
                      <div className="flex gap-2 mt-3">
                        <a 
                          href={`mailto:${selectedCustomer.email}`}
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-gray-700"
                        >
                           <Mail size={12} /> Email
                        </a>
                        <a 
                          href={`tel:${selectedCustomer.phone}`}
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-gray-700"
                        >
                           <Phone size={12} /> Call
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
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

                  {/* Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2">Details</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3"><Mail size={16} className="text-[#5e7e7d]"/> <span>{selectedCustomer.email}</span></div>
                        <div className="flex items-center gap-3"><Phone size={16} className="text-[#5e7e7d]"/> <span dir="ltr">{selectedCustomer.phone}</span></div>
                        <div className="flex items-center gap-3"><MapPin size={16} className="text-[#5e7e7d]"/> <span>{selectedCustomer.address || "No address provided"}</span></div>
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="space-y-4">
                     <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2">Order History</h4>
                     <div className="space-y-3">
                       {selectedCustomer.orders.map((order, idx) => (
                         <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#5e7e7d] transition-colors bg-white group cursor-pointer">
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

                  {/* Notes */}
                  {selectedCustomer.notes && (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm">
                      <p className="text-amber-800 font-bold mb-1 text-xs uppercase">Notes</p>
                      <p className="text-amber-900/80 leading-relaxed">{selectedCustomer.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
               {isEditing ? (
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateCustomer}
                      disabled={isSaving}
                      className="flex-1 py-3 bg-[#5e7e7d] text-white rounded-lg font-bold text-sm hover:bg-[#4d6b6a] flex justify-center items-center gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16}/> Save Changes</>}
                    </button>
                 </div>
               ) : (
                 <div className="flex gap-3">
                   <button 
                     onClick={handleDeleteCustomer}
                     className="px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 flex items-center justify-center"
                   >
                     <Trash2 size={18} />
                   </button>
                   <button 
                     onClick={handleEditClick}
                     className="flex-1 py-3 bg-[#2D3247] text-white rounded-lg font-bold text-sm hover:bg-[#1e2231]"
                   >
                     Edit Customer Profile
                   </button>
                 </div>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}