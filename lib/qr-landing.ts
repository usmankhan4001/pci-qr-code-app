import { contentSchemas } from "@/lib/qr-content";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function page(title: string, body: string): string {
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 420px; margin: 10vh auto; padding: 0 1.5rem; color: #171717; }
  .card { border: 1px solid #e5e5e5; border-radius: 12px; padding: 1.5rem; }
  h1 { font-size: 1.1rem; margin: 0 0 1rem; }
  dt { color: #737373; font-size: 0.85rem; }
  dd { margin: 0 0 0.75rem; font-size: 1rem; }
  button { border: 1px solid #171717; background: #171717; color: white; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.9rem; }
  pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; }
</style>
<div class="card">${body}</div>`;
}

// Web pages can't trigger the OS's native "join this Wi-Fi network" prompt —
// that only fires when a camera app scans a raw WIFI: string directly. Since
// this QR routes through a tracking redirect instead (so it stays dynamic
// and trackable), we show the credentials with a copy button as the next
// best thing.
export function renderWifiLanding(contentConfig: unknown): string {
  const { ssid, password, encryption } = contentSchemas.WIFI.parse(contentConfig);
  return page(
    ssid,
    `<h1>Wi-Fi network</h1>
     <dl>
       <dt>Network name</dt><dd>${escapeHtml(ssid)}</dd>
       ${
         encryption === "nopass"
           ? "<dt>Security</dt><dd>Open (no password)</dd>"
           : `<dt>Password</dt><dd id="pw">${escapeHtml(password ?? "")}</dd>`
       }
     </dl>
     ${
       encryption === "nopass"
         ? ""
         : `<button onclick="navigator.clipboard.writeText(document.getElementById('pw').textContent);this.textContent='Copied!'">Copy password</button>`
     }`
  );
}

export function renderTextLanding(text: string): string {
  return page("Message", `<pre>${escapeHtml(text)}</pre>`);
}
