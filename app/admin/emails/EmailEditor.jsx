"use client";
import { useState } from "react";
import { updateEmailTemplate } from "@/app/actions/emailTemplates";

// 1. THE CUSTOMER RECEIPT TEMPLATE
const generateCustomerEmail = (heading, message, logoUrl, primaryColor, accentColor, highlightColor) => `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: 'Helvetica Neue', Helvetica, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
    <tr><td style="padding: 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="6" width="33.33%" style="background-color: ${primaryColor};"></td><td height="6" width="33.33%" style="background-color: ${accentColor};"></td><td height="6" width="33.33%" style="background-color: ${highlightColor};"></td></tr></table></td></tr>
    <tr><td align="center" style="background-color: #ffffff; padding: 45px 20px 20px 20px;"><img src="${logoUrl}" alt="Atlantis Logo" width="130" style="display: block; max-width: 100%; margin: 0 auto;"></td></tr>
    <tr><td align="center" style="padding: 0 40px;"><div style="height: 1px; background-color: #f3f4f6; width: 100%;"></div></td></tr>
    <tr>
      <td style="padding: 35px 40px; color: #374151; line-height: 1.6;">
        <h1 style="margin: 0 0 20px 0; font-size: 24px; color: ${primaryColor};">${heading}</h1>
        <div style="margin: 0 0 20px 0; white-space: pre-wrap;">${message}</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid ${accentColor}; margin: 30px 0;">
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
                <tr><td style="padding-top: 8px; color: ${primaryColor}; font-weight: bold;">Total Amount:</td><td style="padding-top: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">SAR {{totalAmount}}</td></tr>
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

// 2. THE ADMIN NOTIFICATION TEMPLATE
const generateAdminEmail = (heading, message, logoUrl, primaryColor, accentColor, highlightColor) => `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: 'Helvetica Neue', Helvetica, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
    <tr><td style="padding: 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="6" width="33.33%" style="background-color: ${primaryColor};"></td><td height="6" width="33.33%" style="background-color: ${accentColor};"></td><td height="6" width="33.33%" style="background-color: ${highlightColor};"></td></tr></table></td></tr>
    <tr>
      <td style="padding: 35px 40px; color: #374151; line-height: 1.6;">
        <h1 style="margin: 0 0 20px 0; font-size: 22px; color: #dc2626;">🚨 ${heading}</h1>
        <div style="margin: 0 0 20px 0; white-space: pre-wrap; font-size: 15px;">${message}</div>
        
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

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid ${primaryColor}; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Order Overview</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Order ID:</td><td style="padding-bottom: 6px; text-align: right; font-weight: 500;">{{orderId}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Order Type:</td><td style="padding-bottom: 6px; text-align: right; font-weight: 500;">{{orderType}}</td></tr>
                <tr><td style="padding-bottom: 6px; color: #4b5563;">Payment Method:</td><td style="padding-bottom: 6px; text-align: right; font-weight: 500;">{{paymentMethod}}</td></tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 6px;"></td></tr>
                <tr><td style="padding-top: 6px; color: ${primaryColor}; font-weight: bold;">Total Paid:</td><td style="padding-top: 6px; text-align: right; font-weight: bold; color: ${primaryColor};">SAR {{totalAmount}}</td></tr>
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
  const [activeTab, setActiveTab] = useState("NEW_ORDER_CUSTOMER");
  const [saving, setSaving] = useState(false);

  const currentTemplate = templates.find(t => t.triggerName === activeTab) || {};
  
  const defaultHeading = activeTab === "NEW_ORDER_ADMIN" ? "New Action Required" : "Thank you for your order, {{customerName}}.";
  const defaultMessage = activeTab === "NEW_ORDER_ADMIN" ? "A new order has been placed on the website. Please review the details below to begin processing." : "We have successfully received your request. Our team of expert designers will begin reviewing your project details shortly.";

  const defaultState = currentTemplate.editorState || { 
    heading: defaultHeading, 
    message: defaultMessage,
    logoUrl: "https://atlantis.sa/logo.jpg", 
    primaryColor: "#2C3654",
    accentColor: "#679796",
    highlightColor: "#F3C358",
    internalRecipients: "admin@atlantis.sa" // <-- NEW DEFAULT
  };

  const [subject, setSubject] = useState(currentTemplate.subject || (activeTab === "NEW_ORDER_ADMIN" ? "Action Required: New Order Placed" : "Your Atlantis Order"));
  const [heading, setHeading] = useState(defaultState.heading);
  const [message, setMessage] = useState(defaultState.message);
  const [logoUrl, setLogoUrl] = useState(defaultState.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(defaultState.primaryColor);
  const [accentColor, setAccentColor] = useState(defaultState.accentColor);
  const [highlightColor, setHighlightColor] = useState(defaultState.highlightColor);
  const [internalRecipients, setInternalRecipients] = useState(defaultState.internalRecipients); // <-- NEW STATE
  const [isActive, setIsActive] = useState(currentTemplate.isActive ?? true);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    const newTemplate = templates.find(t => t.triggerName === tab) || {};
    const newState = newTemplate.editorState || {
      heading: tab === "NEW_ORDER_ADMIN" ? "New Action Required" : "Thank you for your order, {{customerName}}.", 
      message: tab === "NEW_ORDER_ADMIN" ? "A new order has been placed. Please review the details." : "We have successfully received your request.",
      logoUrl: logoUrl, 
      primaryColor: primaryColor,
      accentColor: accentColor,
      highlightColor: highlightColor,
      internalRecipients: "admin@atlantis.sa"
    };
    setSubject(newTemplate.subject || (tab === "NEW_ORDER_ADMIN" ? "Action Required: New Order" : "Your Atlantis Order"));
    setHeading(newState.heading);
    setMessage(newState.message);
    setInternalRecipients(newState.internalRecipients || "admin@atlantis.sa");
    setIsActive(newTemplate.isActive ?? true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const finalHtml = activeTab === "NEW_ORDER_ADMIN" 
      ? generateAdminEmail(heading, message, logoUrl, primaryColor, accentColor, highlightColor)
      : generateCustomerEmail(heading, message, logoUrl, primaryColor, accentColor, highlightColor);
    
    // Only save the internal recipients if we are on the Admin tab
    const editorStateToSave = { heading, message, logoUrl, primaryColor, accentColor, highlightColor };
    if (activeTab === "NEW_ORDER_ADMIN") {
      editorStateToSave.internalRecipients = internalRecipients;
    }

    await updateEmailTemplate({
      triggerName: activeTab,
      subject,
      isActive,
      bodyHtml: finalHtml,
      editorState: editorStateToSave
    });
    
    setSaving(false);
    alert("Template saved perfectly!");
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
        {['NEW_ORDER_CUSTOMER', 'NEW_ORDER_ADMIN'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabSwitch(tab)}
            className={`py-3 px-6 font-medium text-sm transition-colors ${
              activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'NEW_ORDER_CUSTOMER' ? 'Customer Receipt' : 'Admin Notification'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">1. Brand Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image URL</label>
                <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Navy (Primary)</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-8 w-8 border-0 rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teal (Accent)</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-8 w-8 border-0 rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Yellow (Highlight)</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={highlightColor} onChange={e => setHighlightColor(e.target.value)} className="h-8 w-8 border-0 rounded cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">2. Email Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={isActive} onChange={e => setIsActive(e.target.value === 'true')} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border">
                  <option value="true">Active (Sending)</option>
                  <option value="false">Paused</option>
                </select>
              </div>

              {/* 🔥 NEW: Recipient Email routing (Only shows for Admin Tab) */}
              {activeTab === 'NEW_ORDER_ADMIN' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-900 mb-1">Send Notifications To:</label>
                  <input 
                    type="text" 
                    value={internalRecipients} 
                    onChange={e => setInternalRecipients(e.target.value)} 
                    placeholder="admin@atlantis.sa, sales@atlantis.sa"
                    className="w-full border-blue-200 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                  />
                  <p className="text-xs text-blue-600 mt-1">You can add multiple emails separated by a comma.</p>
                </div>
              )}

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
                
                <p className="text-xs text-gray-500 mt-2">
                  {activeTab === 'NEW_ORDER_ADMIN' 
                    ? `Admin Variables: {{customerName}}, {{customerEmail}}, {{customerPhone}}, {{address}}, {{orderId}}, {{totalAmount}}`
                    : `Customer Variables: {{customerName}}, {{orderId}}, {{orderType}}, {{paymentMethod}}, {{subtotal}}, {{vat}}, {{totalAmount}}`}
                </p>
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all mt-6">
            {saving ? 'Saving...' : 'Save & Compile Template'}
          </button>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="flex-grow bg-white rounded-lg shadow-inner overflow-hidden border border-gray-300">
            <iframe 
              srcDoc={activeTab === "NEW_ORDER_ADMIN" ? generateAdminEmail(heading, message, logoUrl, primaryColor, accentColor, highlightColor) : generateCustomerEmail(heading, message, logoUrl, primaryColor, accentColor, highlightColor)} 
              className="w-full h-full min-h-[600px]"
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}