'use client'; 

import { useEffect } from 'react';
export default function GlobalError({ error, reset }) {
  
  useEffect(() => {
    console.error("Atlantis Critical Error:", error);
    
    // Beam the error to the API route in the background
    fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            errorMessage: error.message || "Global System Fault",
            stackTrace: error.stack || "Unknown File"
        })
    }).catch(e => console.error("Failed to send error", e));

  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '400px', backdropFilter: 'blur(12px)' }}>
            
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: '24px' }}>
              <svg style={{ width: '32px', height: '32px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.05em' }}>System Fault Detected</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
              An unexpected process exception occurred. Our infrastructure team has been notified via automated telemetry.
            </p>
            
            <button 
              onClick={() => reset()} 
              style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
            >
              Attempt Recovery
            </button>
            
          </div>
        </div>
      </body>
    </html>
  );
}