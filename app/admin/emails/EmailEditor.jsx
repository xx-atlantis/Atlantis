"use client";
import { useState } from "react";
import { updateEmailTemplate } from "@/app/actions/emailTemplates";

// 1. CUSTOMER RECEIPT HTML GENERATOR (Now includes {{calendlyBlock}})
const generateCustomerEmail = (data, settings) => `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: 'Helvetica Neue', Helvetica, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
    <tr><td style="padding: 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="6" width="33.33%" style="background-color: ${settings.primaryColor};"></td><td height="6" width="33.33%" style="background-color: ${settings.accentColor};"></td><td height="6" width="33.33%" style="background-color: ${settings.highlightColor};"></td></tr></table></td></tr>
    <tr><td align="center" style="background-color: #ffffff; padding: 45px 20px 20px 20px;"><img src="${settings.logoUrl}" alt="Atlantis Logo" width="130" style="display: block; max-width: 100%; margin: 0 auto;"></td></tr>
    <tr><td align="center" style="padding: 0 40px;"><div style="height: 1px; background-color: #f3f4f6; width: 100%;"></div></td></tr>
    <tr>
      <td style="padding: 35px 40px; color: #374151; line-height: 1.6;">
        <h1 style="margin: 0 0 20px 0; font-size: 24px; color: ${settings.primaryColor};">${data.heading}</h1>
        <div style="margin: 0 0 20px 0; white-space: pre-wrap;">${data.message}</div>
        
        {{calendlyBlock}}

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid ${settings.accentColor}; margin: 30px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
                <tr><td style="padding-bottom: 8px; color: #6b7280;">Order ID:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 500;">{{orderId}}</td></tr>
                <tr><td style="padding-bottom: 8px; color: #6b7280;">Order Type:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 500; text-transform: capitalize;">{{orderType}}</td></tr>
                <tr><td style="padding-bottom: 8px; color: #6b7280;">Payment Method:</td><td style="padding-bottom: 8px; text-align: right; font-weight: 500; text-transform: capitalize;">{{paymentMethod}}</td></tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px;"></td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;">Subtotal:</td><td style="padding: 8px 0; text-align: right;">SAR {{subtotal}}</td></tr>
                <tr><td style="padding-bottom: 8px; color: #6b7280;">VAT (15%):</td><td style="padding-bottom: 8px; text-align: right;">SAR {{vat}}</td></tr>
                <tr><td style="padding-top: 8px; color: ${settings.primaryColor}; font-weight: bold;">Total Amount:</td><td style="padding-top: 8px; text-align: right; font-weight: bold; color: ${settings.primaryColor};">SAR {{totalAmount}}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;"><p style="margin: 0 0 10px 0; font-size: 13px; color: #9ca3af;">Atlantis Interior Design Platform | Saudi Arabia</p><p style="margin: 0; font-size: 12px; color: #d1d5db;">CR: 4030528247 | VAT: 310112048500003</p></td></tr>
  </table>
</body>
</html>
`;

// 2. ADMIN NOTIFICATION HTML GENERATOR (Unchanged)
const generateAdminEmail = (data, settings) => `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: 'Helvetica Neue', Helvetica, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
    <tr><td style="padding: 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="6" width="33.33%" style="background-color: ${settings.primaryColor};"></td><td height="6" width="33.33%" style="background-color: ${settings.accentColor};"></td><td height="6" width="33.33%" style="background-color: ${settings.highlightColor};"></td></tr></table></td></tr>
    <tr>
      <td style="padding: 35px 40px; color: #374151; line-height: 1.6;">
        <h1 style="margin: 0 0 20px 0; font-size: 22px; color: #dc2626;">🚨 ${data.heading}</h1>
        <div style="margin: 0 0 20px 0; white-space: pre-wrap; font-size: 15px;">${data.message}</div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #1e3a8a; text-transform: uppercase; font-weight: bold;">Customer Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <tr><td style="padding-bottom: 6px; color: #4b5563; width: 80px;">Name:</td><td style="padding-bottom: 6px; font-weight: 500;">{{customerName}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Email:</td><td style="padding-bottom: 6px; font-weight: 500;">{{customerEmail}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Phone:</td><td style="padding-bottom: 6px; font-weight: 500;">{{customerPhone}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Address:</td><td style="padding-bottom: 6px; font-weight: 500;">{{address}}</td></tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid ${settings.primaryColor}; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Order Overview</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Order ID:</td><td style="padding-bottom: 6px; text-align: right; font-weight: 500;">{{orderId}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Order Type:</td><td style="padding-bottom: 6px; text-align: right; font-weight: 500;">{{orderType}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Payment Method:</td><td style="padding-bottom: 6px; text-align: right; font-weight: 500;">{{paymentMethod}}</td></tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 6px;"></td></tr>
                <tr><td style="padding-top: 6px; color: ${settings.primaryColor}; font-weight: bold;">Total Paid:</td><td style="padding-top: 6px; text-align: right; font-weight: bold; color: ${settings.primaryColor};">SAR {{totalAmount}}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default function EmailEditor({ templates, stats }) {
  const [activeTab, setActiveTab] = useState("SETTINGS");
  const [saving, setSaving] = useState(false);

  const custDb = templates.find(t => t.triggerName === "NEW_ORDER_CUSTOMER") || {};
  const adminDb = templates.find(t => t.triggerName === "NEW_ORDER_ADMIN") || {};
  
  // ADDED calendlyUrl to the global state
  const [settings, setSettings] = useState({
    logoUrl: adminDb.editorState?.logoUrl || custDb.editorState?.logoUrl || "https://atlantis.sa/logo.jpg",
    primaryColor: adminDb.editorState?.primaryColor || "#2C3654",
    accentColor: adminDb.editorState?.accentColor || "#679796",
    highlightColor: adminDb.editorState?.highlightColor || "#F3C358",
    internalRecipients: adminDb.editorState?.internalRecipients || "admin@atlantis.sa",
    calendlyUrl: adminDb.editorState?.calendlyUrl || "https://calendly.com/your-username"
  });

  const [customerTpl, setCustomerTpl] = useState({
    subject: custDb.subject || "Your Atlantis Order",
    heading: custDb.editorState?.heading || "Thank you for your order, {{customerName}}.",
    message: custDb.editorState?.message || "We have successfully received your request. Our team of expert designers will begin reviewing your project details shortly.",
    isActive: custDb.isActive ?? true
  });

  const [adminTpl, setAdminTpl] = useState({
    subject: adminDb.subject || "Action Required: New Order Placed",
    heading: adminDb.editorState?.heading || "New Action Required",
    message: adminDb.editorState?.message || "A new order has been placed on the website. Please review the details below to begin processing.",
    isActive: adminDb.isActive ?? true
  });

  const handleSave = async () => {
    setSaving(true);
    
    if (activeTab === "SETTINGS") {
      await updateEmailTemplate({
        triggerName: "NEW_ORDER_CUSTOMER",
        subject: customerTpl.subject,
        isActive: customerTpl.isActive,
        bodyHtml: generateCustomerEmail(customerTpl, settings),
        editorState: { ...customerTpl, ...settings }
      });
      await updateEmailTemplate({
        triggerName: "NEW_ORDER_ADMIN",
        subject: adminTpl.subject,
        isActive: adminTpl.isActive,
        bodyHtml: generateAdminEmail(adminTpl, settings),
        editorState: { ...adminTpl, ...settings }
      });
      alert("Global Settings applied to all templates!");

    } else if (activeTab === "NEW_ORDER_CUSTOMER") {
      await updateEmailTemplate({
        triggerName: "NEW_ORDER_CUSTOMER",
        subject: customerTpl.subject,
        isActive: customerTpl.isActive,
        bodyHtml: generateCustomerEmail(customerTpl, settings),
        editorState: { ...customerTpl, ...settings }
      });
      alert("Customer template saved!");

    } else if (activeTab === "NEW_ORDER_ADMIN") {
      await updateEmailTemplate({
        triggerName: "NEW_ORDER_ADMIN",
        subject: adminTpl.subject,
        isActive: adminTpl.isActive,
        bodyHtml: generateAdminEmail(adminTpl, settings),
        editorState: { ...adminTpl, ...settings }
      });
      alert("Admin template saved!");
    }
    
    setSaving(false);
  };

  // MOCK PREVIEW LOGIC: Replaces the tag with the actual HTML button just for the live preview screen
  const getPreviewHtml = () => {
    if (activeTab === "NEW_ORDER_ADMIN") {
      return generateAdminEmail(adminTpl, settings);
    }
    
    // Show a mock of the Calendly block for the preview
    const mockCalendlyBlock = `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
        <tr>
          <td align="center" style="padding: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: ${settings.primaryColor};">Schedule Your Design Consultation</h2>
            <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563;">Please select a time that works best for you to kick off your project.</p>
            <a href="${settings.calendlyUrl}" style="display: inline-block; background-color: ${settings.primaryColor}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">Book Meeting on Calendly</a>
          </td>
        </tr>
      </table>
    `;
    
    return generateCustomerEmail(customerTpl, settings).replace('{{calendlyBlock}}', mockCalendlyBlock);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Stats Dashboard */}
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

      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'SETTINGS', label: '⚙️ Global Settings' },
          { id: 'NEW_ORDER_CUSTOMER', label: 'Customer Receipt' },
          { id: 'NEW_ORDER_ADMIN', label: 'Admin Notification' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
          {/* --- SETTINGS TAB --- */}
          {activeTab === 'SETTINGS' && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Admin Routing</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-900 mb-1">Send Admin Notifications To:</label>
                  <input 
                    type="text" 
                    value={settings.internalRecipients} 
                    onChange={e => setSettings({...settings, internalRecipients: e.target.value})} 
                    placeholder="admin@atlantis.sa, sales@atlantis.sa"
                    className="w-full border-blue-200 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                  />
                  <p className="text-xs text-blue-600 mt-1">Add multiple emails separated by a comma.</p>
                </div>
              </div>

              {/* 🔥 NEW CALENDLY SETTING 🔥 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-6">Integrations</h2>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Calendly Scheduling Link</label>
                  <input 
                    type="url" 
                    value={settings.calendlyUrl} 
                    onChange={e => setSettings({...settings, calendlyUrl: e.target.value})} 
                    placeholder="https://calendly.com/your-username"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                  />
                  <p className="text-xs text-gray-500 mt-1">This button will <strong>only</strong> appear on receipts if the customer bought a design package.</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-6">Global Brand Identity</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image URL</label>
                    <input type="url" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Navy (Primary)</label>
                      <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="h-8 w-full border-0 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Teal (Accent)</label>
                      <input type="color" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className="h-8 w-full border-0 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Yellow (Highlight)</label>
                      <input type="color" value={settings.highlightColor} onChange={e => setSettings({...settings, highlightColor: e.target.value})} className="h-8 w-full border-0 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- CUSTOMER TAB --- */}
          {activeTab === 'NEW_ORDER_CUSTOMER' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Customer Email Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={customerTpl.isActive} onChange={e => setCustomerTpl({...customerTpl, isActive: e.target.value === 'true'})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500">
                    <option value="true">Active (Sending)</option>
                    <option value="false">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                  <input type="text" value={customerTpl.subject} onChange={e => setCustomerTpl({...customerTpl, subject: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                  <input type="text" value={customerTpl.heading} onChange={e => setCustomerTpl({...customerTpl, heading: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
                  <textarea rows="5" value={customerTpl.message} onChange={e => setCustomerTpl({...customerTpl, message: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                  <p className="text-xs text-gray-500 mt-2">Variables: {`{{customerName}}, {{orderId}}, {{orderType}}, {{paymentMethod}}, {{subtotal}}, {{vat}}, {{totalAmount}}`}</p>
                </div>
              </div>
            </>
          )}

          {/* --- ADMIN TAB --- */}
          {activeTab === 'NEW_ORDER_ADMIN' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Internal Notification Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={adminTpl.isActive} onChange={e => setAdminTpl({...adminTpl, isActive: e.target.value === 'true'})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500">
                    <option value="true">Active (Sending)</option>
                    <option value="false">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                  <input type="text" value={adminTpl.subject} onChange={e => setAdminTpl({...adminTpl, subject: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                  <input type="text" value={adminTpl.heading} onChange={e => setAdminTpl({...adminTpl, heading: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
                  <textarea rows="5" value={adminTpl.message} onChange={e => setAdminTpl({...adminTpl, message: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
                  <p className="text-xs text-gray-500 mt-2">Variables: {`{{customerName}}, {{customerEmail}}, {{customerPhone}}, {{address}}, {{orderId}}, {{totalAmount}}`}</p>
                </div>
              </div>
            </>
          )}

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all mt-6">
            {saving ? 'Saving...' : activeTab === 'SETTINGS' ? 'Save Global Settings' : 'Save Template'}
          </button>
        </div>

        {/* RIGHT PANEL: Live Visual Preview */}
        <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="flex-grow bg-white rounded-lg shadow-inner overflow-hidden border border-gray-300">
            <iframe 
              srcDoc={getPreviewHtml()} 
              className="w-full h-full min-h-[600px]"
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}