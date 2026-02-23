'use server';

export async function logErrorToHub(errorMessage, stackTrace) {
  const LICENSE_HUB_KEY = process.env.LICENSE_HUB_KEY;
  const API_URL = 'https://license.themgdev.com/index.php';

  if (!LICENSE_HUB_KEY) return;

  try {
    // Attempt to extract the file name and line number from the stack trace
    let file = 'Unknown Server File';
    let line = 0;
    
    if (stackTrace) {
       // A standard regex to pull the file path and line number from a Node.js stack trace
       const match = stackTrace.match(/at\s+(.*):(\d+):(\d+)/);
       if (match) {
         // Keep only the file name so we don't expose your server's full folder structure
         file = match[1].split('/').pop(); 
         line = parseInt(match[2], 10);
       }
    }

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_error',
        license_key: LICENSE_HUB_KEY,
        error_message: errorMessage,
        file: file,
        line: line
      }),
      signal: AbortSignal.timeout(2000) // Don't hold up the server if the PHP hub is slow
    });
  } catch (error) {
     // Fail silently. If logging the error causes an error, we don't want an infinite loop.
     console.error("Telemetry Logging Failed");
  }
}