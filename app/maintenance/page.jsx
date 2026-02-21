export default function Maintenance() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-semibold border-r border-gray-300 pr-4 italic tracking-tighter">
            500
          </h1>
          <p className="text-sm text-gray-600">
            Internal Server Error.
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-lg p-6 font-mono text-sm shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="font-bold text-red-700 underline decoration-red-300 underline-offset-4">
              Unhandled Runtime Error
            </span>
          </div>
          
          <p className="text-red-800 font-bold mb-2 uppercase tracking-tight">
            Error: Failed to initialize database connection pool (Next.js App Router)
          </p>
          
          <div className="text-gray-500 space-y-1 overflow-x-auto whitespace-pre">
            <p>at initializeData (./lib/db/connection.js:42:12)</p>
            <p>at async RootLayout (./app/layout.js:15:3)</p>
            <p className="text-red-400">--- stack trace truncated ---</p>
            <p className="mt-4 text-[10px] text-gray-400">
              Source: Vercel Edge Runtime (iad1)
              Request ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            This error occurred during the execution of your application. <br />
            If you are the developer, check your server logs for more information.
          </p>
        </div>
      </div>
    </div>
  );
}