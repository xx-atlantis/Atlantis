import os from 'os';

interface LicenseConfig {
  licenseKey: string;
  domain: string;
  hubUrl: string;
}

export class MGLicenseManager {
  private config: LicenseConfig;

  constructor(config: LicenseConfig) {
    this.config = config;
  }

  /**
   * Verifies the license and sends VPS telemetry.
   * Call this server-side (e.g., in Middleware or a Root Layout).
   */
  public async verifyAndReportHealth(): Promise<boolean> {
    const payload = this.gatherSystemMetrics();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

      const response = await fetch(this.config.hubUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) return true; // Fail open if your server is just temporarily down

      const data = await response.json();

      // Strict enforcement: If the DB says anything other than active, block access.
      if (data && data.status && data.status !== 'active') {
        return false;
      }

      return true;

    } catch (error) {
      // If fetch fails (timeout/network error), allow the app to run so your clients don't crash
      return true;
    }
  }

  /**
   * Sends caught Next.js errors to your central PHP dashboard.
   */
  public async logError(errorMessage: string, file: string, line: number = 0) {
    try {
      await fetch(this.config.hubUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_error',
          license_key: this.config.licenseKey,
          error_message: errorMessage,
          file: file,
          line: line
        })
      });
    } catch (e) {
      // Silently fail if logging fails
    }
  }

  /**
   * Uses Node.js 'os' module to grab real-time VPS specs
   */
  private gatherSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPct = Math.round((usedMem / totalMem) * 100);
    
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || 'Unknown CPU';
    
    // Node.js loadavg returns 1, 5, and 15 minute load averages.
    // Divide by core count * 100 to get a rough CPU percentage.
    const loadAvg = os.loadavg()[0];
    const cpuPct = Math.min(100, Math.round((loadAvg / cpus.length) * 100));

    return {
      action: 'verify',
      license_key: this.config.licenseKey,
      domain_name: this.config.domain,
      os: `${os.type()} ${os.release()}`,
      php: `Node ${process.version}`, // We repurpose the 'php_version' column to show the Node version
      cpu_name: cpuModel,
      cpu: cpuPct,
      ram_pct: ramPct,
      ram: `${this.formatBytes(usedMem)} / ${this.formatBytes(totalMem)}`,
      // IP and Disk require heavier async operations in Node, so we let the PHP server detect IP via $_SERVER['REMOTE_ADDR']
      disk: 'Managed by Host' 
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}