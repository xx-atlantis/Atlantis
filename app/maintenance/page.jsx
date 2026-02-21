export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#33ff33] font-mono p-6 sm:p-12 text-xs sm:text-sm selection:bg-green-500 selection:text-black">
      <div className="max-w-3xl mx-auto border border-gray-800 p-4 sm:p-8 rounded shadow-2xl bg-black">
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        <p className="mb-2 font-bold">[  0.000000] Initializing CGROUP v2</p>
        <p className="mb-2">[  0.004122] Memory: 16284K/32768K available</p>
        <p className="mb-2">[  0.102391] checking generic x86 support... OK</p>
        <p className="mb-2">[  0.501120] vps_init: checking storage nodes...</p>
        
        <div className="my-6 p-4 border border-red-900 bg-red-950/20 text-red-500 rounded">
          <p className="font-bold">CRITICAL: VFS_MOUNT_ERROR</p>
          <p>The VPS instance at (atlantis.sa) failed to initialize block device /dev/vda1.</p>
          <p className="mt-2 text-white italic underline">ERROR_CODE: 0x000412_RESOURCE_UNAVAILABLE</p>
        </div>

        <p className="mb-2 animate-pulse text-white">&gt; _ SYSTEM HALTED.</p>
        <p className="opacity-50 mt-10">--------------------------------------------------</p>
        <p className="text-gray-500 italic text-[10px]">
          Note: This is a system-level infrastructure error. Please check hypervisor logs via SSH or contact your hosting provider.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div className="px-3 py-1 bg-green-900/30 border border-green-500/50 rounded text-[10px] text-green-400">
            KERNEL_VER: 6.1.0-21-AMD64
          </div>
          <div className="px-3 py-1 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-400">
            INSTANCE_ID: ATL-SA-91
          </div>
        </div>
      </div>
    </div>
  );
}