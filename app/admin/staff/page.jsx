'use client'
import { useState, useEffect } from 'react';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');

  // Load the staff list from your API
  const fetchStaff = async () => {
    const res = await fetch('/api/admin/staff/list');
    const data = await res.json();
    setStaff(data);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddStaff = async () => {
    await fetch('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify({ email, role, action: 'ADD_STAFF' }),
    });
    fetchStaff(); // Refresh list
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Staff Access Control</h1>
      
      {/* Add New Staff Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 flex gap-4">
        <input 
          type="email" placeholder="Staff Email" 
          className="border p-2 rounded flex-1"
          onChange={(e) => setEmail(e.target.value)}
        />
        <select className="border p-2 rounded" onChange={(e) => setRole(e.target.value)}>
          <option value="EDITOR">Editor (Blogs Only)</option>
          <option value="DEVELOPER">Developer</option>
          <option value="ADMIN">Full Admin</option>
        </select>
        <button onClick={handleAddStaff} className="bg-black text-white px-4 py-2 rounded">
          Grant Access
        </button>
      </div>

      {/* Staff List Table */}
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-4">{s.email}</td>
              <td className="p-4 font-mono text-sm">{s.role}</td>
              <td className="p-4">
                <span className={s.isActive ? "text-green-600" : "text-red-600"}>
                  {s.isActive ? "● Active" : "● No Access"}
                </span>
              </td>
              <td className="p-4">
                <button className="text-red-500 hover:underline">Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}