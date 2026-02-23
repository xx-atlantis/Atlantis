import os from 'os';

export async function sendServerTelemetry() {
  const LICENSE_HUB_KEY = process.env.LICENSE_HUB_KEY;
  const API_URL = 'https://license.themgdev.com/index.php';

  if (!LICENSE_HUB_KEY) return;

  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPct = Math.round((usedMem / totalMem) * 100);
    
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || 'Unknown CPU';
    const loadAvg = os.loadavg()[0];
    const cpuPct = Math.min(100, Math.round((loadAvg / cpus.length) * 100));

    // Format bytes to MB/GB
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const payload = {
      action: 'heartbeat',
      license_key: LICENSE_HUB_KEY,
      domain_name: 'atlantis.sa',
      os: `${os.type()} ${os.release()}`,
      php: `Node ${process.version}`, 
      cpu_name: cpuModel,
      cpu: cpuPct,
      ram_pct: ramPct,
      ram: `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Don't wait around for this to finish, fire and forget
      signal: AbortSignal.timeout(2000) 
    });

  } catch (error) {
    // Fail silently - we don't want telemetry issues crashing Atlantis
    console.error("Telemetry silent fail");
  }
}