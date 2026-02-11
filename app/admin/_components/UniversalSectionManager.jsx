import React, { useState } from 'react';
import FieldRenderer from './FieldRenderer';

const UniversalSectionManager = ({ sectionData, onSave, sectionTitle }) => {
  const [formData, setFormData] = useState(sectionData);
  const [activeTab, setActiveTab] = useState('en'); // 'en' or 'ar'

  const handleChange = (path, value) => {
    const updatedData = { ...formData };
    let current = updatedData;
    
    // Navigate to the nested property to update it
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setFormData(updatedData);
  };

  const handleSave = () => {
    onSave(formData);
    alert(`${sectionTitle} updated successfully!`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">{sectionTitle}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('en')}
            className={`px-4 py-2 rounded ${activeTab === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
          <button 
            onClick={() => setActiveTab('ar')}
            className={`px-4 py-2 rounded ${activeTab === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            العربية
          </button>
        </div>
      </div>

      <div className="p-6" dir={activeTab === 'ar' ? 'rtl' : 'ltr'}>
        <FieldRenderer 
          data={formData[activeTab]} 
          path={[activeTab]} 
          onChange={handleChange} 
        />
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button 
          onClick={() => setFormData(sectionData)}
          className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Reset
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default UniversalSectionManager;