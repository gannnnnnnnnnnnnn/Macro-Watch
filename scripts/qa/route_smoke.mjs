const baseUrl = process.env.MACROWATCH_BASE_URL ?? "http://localhost:3000";

const routes = [
  "/",
  "/markets",
  "/assets/SPY",
  "/assets/NVDA",
  "/assets/BTC-USD",
  "/indicators/DGS10",
  "/indicators/cpi-yoy",
  "/macro",
  "/stress",
  "/library",
  "/data-lab",
];

let failed = false;

for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = response.status >= 200 && response.status < 400;
    console.log(`${ok ? "ok" : "fail"} ${response.status} ${route}`);
    if (!ok) failed = true;
  } catch (error) {
    failed = true;
    console.log(`fail ${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) process.exit(1);
