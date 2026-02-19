"use client";
import { useState } from "react";
import { updateEmailTemplate } from "@/app/actions/emailTemplates";

// Replace the top generateAtlantisEmail function with this:
const generateAtlantisEmail = (heading, message) => `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: 'Helvetica Neue', Helvetica, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <table width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
    <tr>
      <td align="center" style="background-color: #111827; padding: 40px 20px;">
        <img src="https://atlantis.sa/logo-white.png" alt="Atlantis" width="160" style="display: block;">
      </td>
    </tr>
    <tr>
      <td style="padding: 40px; color: #374151; line-height: 1.6;">
        <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #111827;">${heading}</h1>
        <div style="margin: 0 0 20px 0; white-space: pre-wrap;">${message}</div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid #111827; margin: 30px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Order Summary</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
                <tr>
                  <td style="padding-bottom: 8px; color: #6b7280;">Order ID:</td>
                  <td style="padding-bottom: 8px; text-align: right; font-weight: 500;">{{orderId}}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px; color: #6b7280;">Order Type:</td>
                  <td style="padding-bottom: 8px; text-align: right; font-weight: 500; text-transform: capitalize;">{{orderType}}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px; color: #6b7280;">Payment Method:</td>
                  <td style="padding-bottom: 8px; text-align: right; font-weight: 500; text-transform: capitalize;">{{paymentMethod}}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px;"></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right;">SAR {{subtotal}}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px; color: #6b7280;">VAT (15%):</td>
                  <td style="padding-bottom: 8px; text-align: right;">SAR {{vat}}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; color: #111827; font-weight: bold;">Total Amount:</td>
                  <td style="padding-top: 8px; text-align: right; font-weight: bold; color: #111827;">SAR {{totalAmount}}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #9ca3af;">Atlantis Interior Design Platform | Saudi Arabia</p>
        <p style="margin: 0; font-size: 12px; color: #d1d5db;">CR: 4030528247 | VAT: 310112048500003</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default function EmailEditor({ templates, stats }) {
  const [activeTab, setActiveTab] = useState("NEW_ORDER_CUSTOMER");
  const [saving, setSaving] = useState(false);

  // Find current template or use defaults
  const currentTemplate = templates.find(t => t.triggerName === activeTab) || {};
  const defaultState = currentTemplate.editorState || { 
    heading: "Thank you for your order, {{customerName}}.", 
    message: "We have successfully received your request. Our team of expert designers will begin reviewing your project details shortly."
  };

  const [subject, setSubject] = useState(currentTemplate.subject || "Your Atlantis Order");
  const [heading, setHeading] = useState(defaultState.heading);
  const [message, setMessage] = useState(defaultState.message);
  const [isActive, setIsActive] = useState(currentTemplate.isActive ?? true);

  const handleSave = async () => {
    setSaving(true);
    const finalHtml = generateAtlantisEmail(heading, message);
    
    await updateEmailTemplate({
      triggerName: activeTab,
      subject,
      isActive,
      bodyHtml: finalHtml,
      editorState: { heading, message }
    });
    
    setSaving(false);
    alert("Template saved perfectly!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Modern Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Emails Processed</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
          <p className="text-sm font-medium text-green-600">Successfully Sent</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.sent}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm font-medium text-red-600">Failed / Bounced</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.failed}</p>
        </div>
      </div>

      {/* 2. Template Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['NEW_ORDER_CUSTOMER', 'NEW_ORDER_ADMIN'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 font-medium text-sm transition-colors ${
              activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* 3. Split Screen Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Form Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Edit Content</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={isActive} onChange={e => setIsActive(e.target.value === 'true')} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border">
              <option value="true">Active (Sending)</option>
              <option value="false">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
            <input type="text" value={heading} onChange={e => setHeading(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
            <textarea rows="5" value={message} onChange={e => setMessage(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
            <p className="text-xs text-gray-500 mt-2">Available variables: {`{{customerName}}, {{orderId}}, {{totalAmount}}`}</p>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all">
            {saving ? 'Saving...' : 'Save & Compile Template'}
          </button>
        </div>

        {/* Right Side: Live Visual Preview */}
        <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="flex-grow bg-white rounded-lg shadow-inner overflow-hidden border border-gray-300">
            {/* We render the generated HTML directly into a secure iframe */}
            <iframe 
              srcDoc={generateAtlantisEmail(heading, message)} 
              className="w-full h-full min-h-[500px]"
              title="Email Preview"
            />
          </div>
        </div>

      </div>
    </div>
  );
}