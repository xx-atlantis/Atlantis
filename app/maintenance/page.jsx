export default function Maintenance() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8 text-sm md:text-base selection:bg-green-900 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-2">
        <p className="text-white font-bold">[ CRITICAL SYSTEM FAILURE ]</p>
        <p className="opacity-70">Timestamp: {new Date().toISOString()}</p>
        <p className="mt-4">Checking hardware status... <span className="text-white">OK</span></p>
        <p>Verifying storage partitions... <span className="text-white">OK</span></p>
        <p>Loading kernel modules... <span className="text-white">OK</span></p>
        <p className="text-yellow-500 animate-pulse">Mounting root filesystem... [ FAILED ]</p>
        
        <div className="bg-red-900/20 border-l-4 border-red-600 p-4 my-6 text-red-400">
          <p className="font-bold">FATAL ERROR: VPS INSTANCE NOT AVAILABLE</p>
          <p>Reason: Resource initialization failed on block device (vda1)</p>
          <p>Action: SYSTEM HALTED. Check pm2 logs or contact infrastructure provider.</p>
        </div>

        <p className="mt-4 opacity-50">---------------------------------------------------------</p>
        <p className="text-blue-400">Initiating emergency shell dump...</p>
        <p className="opacity-70 font-bold mt-2">
          $ journalctl -xe | grep "vps_init" <br />
          &gt; No response from daemon. <br />
          &gt; Heartbeat lost. <br />
          &gt; Shutting down virtual CPUs...
        </p>
        
        <div className="pt-10 flex items-center gap-2">
          <span className="w-2 h-5 bg-green-500 animate-pulse inline-block"></span>
          <span className="text-xs opacity-40 uppercase tracking-widest">Connection Terminated</span>
        </div>
      </div>
    </div>
  );
}