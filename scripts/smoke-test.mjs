const base = String(process.env.SMOKE_BASE_URL ?? process.argv[2] ?? "").replace(/\/$/, "");
if (!base) throw new Error("Set SMOKE_BASE_URL or pass the deployed base URL as the first argument.");

const checks = [
  ["/api/health/live", 200],
  ["/api/health/ready", 200],
  ["/", 200],
  ["/robots.txt", 200],
  ["/sitemap.xml", 200],
  ["/__priority10_missing_route__", 404],
];
let failures = 0;
for (const [pathname, expected] of checks) {
  const response = await fetch(`${base}${pathname}`, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  const hsts = response.headers.get("strict-transport-security");
  const csp = response.headers.get("content-security-policy");
  const ok = response.status === expected;
  console.log(`${ok ? "PASS" : "FAIL"} ${pathname} -> ${response.status} (expected ${expected})`);
  if (!ok) failures++;
  if (pathname === "/") {
    if (!hsts && base.startsWith("https://")) { console.error("FAIL homepage missing HSTS"); failures++; }
    if (!csp) { console.error("FAIL homepage missing CSP"); failures++; }
  }
}
if (failures) process.exit(1);
console.log("Production smoke test passed.");
