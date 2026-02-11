"use client";

import { useState } from "react";
import { 
  Check, X, Plus, Trash2, Star, 
  LayoutGrid, Building, Home, Save 
} from "lucide-react";

// --- 1. The Individual Package Card (Editable) ---
function PackageCard({ pkg, onUpdate, onDelete, onToggleRecommended }) {
  
  // Update a top-level field (title, price, unit)
  const handleFieldChange = (field, value) => {
    onUpdate({ ...pkg, [field]: value });
  };

  // Feature: Update Text
  const handleFeatureText = (index, text) => {
    const newFeatures = [...pkg.features];
    newFeatures[index].text = text;
    handleFieldChange("features", newFeatures);
  };

  // Feature: Toggle Included/Excluded
  const toggleFeatureStatus = (index) => {
    const newFeatures = [...pkg.features];
    newFeatures[index].included = !newFeatures[index].included;
    handleFieldChange("features", newFeatures);
  };

  // Feature: Add New Row
  const addFeature = () => {
    const newFeatures = [...pkg.features, { text: "", included: true }];
    handleFieldChange("features", newFeatures);
  };

  // Feature: Delete Row
  const removeFeature = (index) => {
    const newFeatures = pkg.features.filter((_, i) => i !== index);
    handleFieldChange("features", newFeatures);
  };

  return (
    <div className={`relative flex flex-col p-5 bg-white rounded-2xl border-2 transition-all ${
      pkg.isRecommended ? "border-blue-600 shadow-lg ring-1 ring-blue-100" : "border-slate-200"
    }`}>
      
      {/* Top Actions: Recommended Badge & Delete */}
      <div className="flex justify-between items-start mb-4">
        <button
          onClick={onToggleRecommended}
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-colors ${
            pkg.isRecommended 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-slate-50 text-slate-400 border-slate-200 hover:border-blue-300"
          }`}
        >
          <Star size={12} fill={pkg.isRecommended ? "currentColor" : "none"} />
          {pkg.isRecommended ? "Recommended" : "Set Recommended"}
        </button>

        <button 
          onClick={onDelete}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete this package"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Package Title & Price Inputs */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Package Title</label>
          <input
            value={pkg.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="w-full p-2 text-lg font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Standard"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Price</label>
            <input
              type="number"
              value={pkg.price}
              onChange={(e) => handleFieldChange("price", e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
          </div>
          <div className="w-1/3">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Unit</label>
            <input
              value={pkg.unit}
              onChange={(e) => handleFieldChange("unit", e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-500"
              placeholder="/ Room"
            />
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="flex-1 space-y-2">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">Features</label>
        {pkg.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <button
              onClick={() => toggleFeatureStatus(idx)}
              className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                feature.included ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-300 text-slate-300"
              }`}
            >
              {feature.included ? <Check size={14} /> : <X size={14} />}
            </button>
            
            <input
              value={feature.text}
              onChange={(e) => handleFeatureText(idx, e.target.value)}
              className="flex-1 p-1 text-sm border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none bg-transparent"
              placeholder="Feature description"
            />

            <button 
              onClick={() => removeFeature(idx)}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        <button
          onClick={addFeature}
          className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
        >
          <Plus size={12} /> Add Feature
        </button>
      </div>
    </div>
  );
}

// --- 2. Main Manager Component with Tabs ---
export default function PricingManager() {
  const [activeTab, setActiveTab] = useState("room");

  // Initial Data State
  const [data, setData] = useState({
    room: [
      { id: 1, title: "Standard Clean", price: "50", unit: "/ Room", isRecommended: false, features: [{ text: "Dusting", included: true }, { text: "Mopping", included: true }] },
      { id: 2, title: "Deep Clean", price: "120", unit: "/ Room", isRecommended: true, features: [{ text: "Dusting", included: true }, { text: "Deep Scrub", included: true }] },
    ],
    apartment: [
      { id: 1, title: "Studio", price: "200", unit: "/ Flat", isRecommended: true, features: [{ text: "Full Clean", included: true }] },
    ],
    villa: [
      { id: 1, title: "Small Villa", price: "500", unit: "/ Villa", isRecommended: false, features: [{ text: "Interior & Exterior", included: true }] },
    ],
  });

  // --- Actions ---

  const handleUpdatePackage = (pkgId, newPkgData) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(pkg => pkg.id === pkgId ? newPkgData : pkg)
    }));
  };

  const handleAddPackage = () => {
    const newPkg = {
      id: Date.now(), // simple unique ID
      title: "New Package",
      price: "",
      unit: activeTab === 'room' ? '/ Room' : (activeTab === 'apartment' ? '/ Flat' : '/ Villa'),
      isRecommended: false,
      features: [{ text: "Basic Service", included: true }, { text: "Premium Add-on", included: false }]
    };

    setData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newPkg]
    }));
  };

  const handleDeletePackage = (pkgId) => {
    if(!window.confirm("Are you sure you want to delete this package?")) return;
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(pkg => pkg.id !== pkgId)
    }));
  };

  const handleSetRecommended = (pkgId) => {
    // Logic: Only one recommended package allowed per category? 
    // If yes, set all others to false. If no, just toggle. 
    // Let's assume you want only 1 recommended, so we reset others.
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(pkg => ({
        ...pkg,
        isRecommended: pkg.id === pkgId ? !pkg.isRecommended : false
      }))
    }));
  };

  // --- Render Helpers ---
  const tabs = [
    { id: "room", label: "Room Packages", icon: LayoutGrid },
    { id: "apartment", label: "Apartment Packages", icon: Building },
    { id: "villa", label: "Villa Packages", icon: Home },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
            <p className="text-slate-500">Add, edit, or remove packages for each category.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-shadow shadow-lg">
            <Save size={18} /> Save Changes
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 mb-8 w-full md:w-fit shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab} Packages ({data[activeTab].length})
            </h2>
            <button 
              onClick={handleAddPackage}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <Plus size={16} /> Add New Package
            </button>
          </div>

          {/* Grid of Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Map through the packages of the ACTIVE tab */}
            {data[activeTab].map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg}
                onUpdate={(newData) => handleUpdatePackage(pkg.id, newData)}
                onDelete={() => handleDeletePackage(pkg.id)}
                onToggleRecommended={() => handleSetRecommended(pkg.id)}
              />
            ))}

            {/* Empty State Helper */}
            {data[activeTab].length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <LayoutGrid size={48} className="mb-4 opacity-20" />
                <p>No packages found for {activeTab}.</p>
                <button 
                  onClick={handleAddPackage}
                  className="mt-2 text-blue-600 font-semibold hover:underline"
                >
                  Create your first package
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}