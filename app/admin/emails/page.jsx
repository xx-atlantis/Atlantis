// app/admin/emails/page.jsx
import { getEmailTemplates, updateEmailTemplate } from "@/app/actions/emailTemplates";

export default async function EmailManagerPage() {
  // Fetch templates directly in the server component
  const templates = await getEmailTemplates();

  // If database is empty, we can provide a default list to start with
  const displayTemplates = templates.length > 0 ? templates : [
    { id: "", triggerName: "NEW_ORDER_CUSTOMER", subject: "Order Received!", bodyHtml: "<h1>Thanks {{customerName}}!</h1>", isActive: true },
    { id: "", triggerName: "NEW_ORDER_ADMIN", subject: "New Order Placed", bodyHtml: "<h1>Order #{{orderId}} was placed.</h1>", isActive: true }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Email Notification Templates</h1>
      <p className="mb-8 text-gray-600">
        Manage the automated emails sent by Atlantis. Use placeholders like <code>{`{{customerName}}`}</code> and <code>{`{{orderId}}`}</code> in the subject or body.
      </p>

      <div className="space-y-8">
        {displayTemplates.map((template) => (
          <div key={template.triggerName} className="p-6 bg-white rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">{template.triggerName}</h2>
            
            <form action={updateEmailTemplate} className="space-y-4">
              {/* Hidden fields to pass the ID and Trigger Name securely */}
              <input type="hidden" name="id" value={template.id} />
              <input type="hidden" name="triggerName" value={template.triggerName} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="isActive" 
                  defaultValue={template.isActive}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Active (Sending)</option>
                  <option value="false">Inactive (Paused)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  defaultValue={template.subject} 
                  required
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Body (HTML)</label>
                <textarea 
                  name="bodyHtml" 
                  defaultValue={template.bodyHtml} 
                  rows={6}
                  required
                  className="w-full border border-gray-300 p-2 rounded font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}