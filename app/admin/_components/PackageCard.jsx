"use client";

import { useState } from "react";
import { Check, X, Plus, Trash2, Save } from "lucide-react";

// --- 1. The Child Component: Individual Category Editor ---
function CategoryEditorCard({ categoryData, onUpdate, locale = "en" }) {
  const isAr = locale === "ar";

  // Helper to update top-level fields (Price, Unit)
  const handleChange = (field, value) => {
    onUpdate({ ...categoryData, [field]: value });
  };

  // Helper to update a specific feature's text
  const handleFeatureTextChange = (index, newText) => {
    const newFeatures = [...categoryData.features];
    newFeatures[index].text = newText;
    handleChange("features", newFeatures);
  };

  // Helper to toggle if a feature is included (Green Check) or excluded (Red X)
  const toggleFeatureStatus = (index) => {
    const newFeatures = [...categoryData.features];
    newFeatures[index].included = !newFeatures[index].included;
    handleChange("features", newFeatures);
  };

  // Helper to DELETE a feature row
  const deleteFeature = (index) => {
    const newFeatures = categoryData.features.filter((_, i) => i !== index);
    handleChange("features", newFeatures);
  };

  // Helper to ADD a new empty feature row
  const addFeature = () => {
    const newFeatures = [...categoryData.features, { text: "", included: true }];
    handleChange("features", newFeatures);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Category Name (Fixed) */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          {categoryData.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Edit details for {categoryData.name} packages
        </p>
      </div>

      {/* Inputs: Price & Unit */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Price (SAR)
          </label>
          <input
            type="number"
            value={categoryData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Unit Label
          </label>
          <input
            type="text"
            value={categoryData.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder="e.g. / Room"
          />
        </div>
      </div>

      {/* Features List Editor */}
      <div className="flex-1 space-y-3">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">
          Features List
        </label>
        
        {categoryData.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            {/* Toggle Status Button */}
            <button
              type="button"
              onClick={() => toggleFeatureStatus(idx)}
              title={feature.included ? "Mark as Excluded" : "Mark as Included"}
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                feature.included 
                  ? "bg-green-100 text-green-600 border border-green-200" 
                  : "bg-red-50 text-red-400 border border-red-100"
              }`}
            >
              {feature.included ? <Check size={16} /> : <X size={16} />}
            </button>

            {/* Feature Text Input */}
            <input
              value={feature.text}
              onChange={(e) => handleFeatureTextChange(idx, e.target.value)}
              className="flex-1 p-2 text-sm border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Feature description..."
            />

            {/* Delete Button (Only shows on hover for cleaner UI) */}
            <button
              onClick={() => deleteFeature(idx)}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity"
              title="Remove Feature"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Add New Feature Button */}
        <button
          onClick={addFeature}
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-dashed border-blue-200"
        >
          <Plus size={16} />
          Add Feature Row
        </button>
      </div>
    </div>
  );
}

// --- 2. The Parent Component: Main Admin View ---
export default function PricingAdmin() {
  // Initial Data State: 3 Categories, 1 Package each
  const [categories, setCategories] = useState([
    {
      id: "room",
      name: "Room", // Category Name
      price: "50",
      unit: "/ Room",
      features: [
        { text: "Deep Cleaning", included: true },
        { text: "Sanitization", included: true },
        { text: "Furniture Moving", included: false },
      ],
    },
    {
      id: "apartment",
      name: "Apartment", // Category Name
      price: "250",
      unit: "/ Flat",
      features: [
        { text: "Deep Cleaning", included: true },
        { text: "Kitchen & Bath", included: true },
        { text: "Balcony Cleaning", included: true },
      ],
    },
    {
      id: "villa",
      name: "Villa", // Category Name
      price: "800",
      unit: "/ Villa",
      features: [
        { text: "Full Deep Clean", included: true },
        { text: "Garden Maintenance", included: true },
        { text: "Water Tank Cleaning", included: true },
        { text: "Roof Cleaning", included: false },
      ],
    },
  ]);

  // Handler to update a specific category in the state
  const handleUpdateCategory = (id, updatedData) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updatedData : cat))
    );
  };

  // Mock Save Function
  const handleSaveAll = () => {
    console.log("Saving to Database:", categories);
    alert("Packages saved! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Manager</h1>
            <p className="text-slate-500">Manage packages for Room, Apartment, and Villa</p>
          </div>
          <button 
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        {/* The 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryEditorCard
              key={category.id}
              categoryData={category}
              onUpdate={(newData) => handleUpdateCategory(category.id, newData)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}