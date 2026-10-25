/* Run with a production server: npm start. Requires Playwright and Chromium installed separately.
   npm install --no-save playwright && npx playwright install chromium
   CHROMIUM_PATH=/usr/bin/chromium node scripts/screenshot-audit.cjs */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const out = process.env.SHOT_DIR || path.join(process.cwd(), "artifacts");
  fs.mkdirSync(out, { recursive: true });
  const report = [];
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1050 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    async function capture(route, name) {
      await page.goto(
        (process.env.BASE_URL || "http://localhost:3000") + route,
      );
      await page.waitForTimeout(550);
      await page.locator("img").evaluateAll((imgs) =>
        Promise.all(
          imgs.map((i) =>
            i.complete
              ? Promise.resolve()
              : new Promise((r) => {
                  i.onload = r;
                  i.onerror = r;
                  setTimeout(r, 6000);
                }),
          ),
        ),
      );
      await page.screenshot({
        path: path.join(out, `${width}-${name}.png`),
        fullPage: true,
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      report.push({ width, name, overflow, errors: [...errors] });
      if (overflow) console.error("OVERFLOW", width, name);
    }
    for (const route of ["/", "/about", "/login", "/signup"])
      await capture(route, route === "/" ? "landing" : route.slice(1));
    for (const role of ["Restaurant", "NGO", "Volunteer"]) {
      await page.goto(
        (process.env.BASE_URL || "http://localhost:3000") + "/login",
      );
      await page
        .getByRole("button", { name: `Continue as ${role}`, exact: false })
        .click();
      await page.waitForURL("**/dashboard");
      for (const route of [
        "/dashboard",
        "/donations",
        "/donations/demo-donation-0",
        "/impact",
        "/leaderboard",
        "/settings",
        ...(role === "Restaurant" ? ["/donations/new"] : []),
      ])
        await capture(
          route,
          role.toLowerCase() + "-" + route.slice(1).replaceAll("/", "-"),
        );
    }
    if (width === 390) {
      await page.goto(
        (process.env.BASE_URL || "http://localhost:3000") + "/dashboard",
      );
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.screenshot({
        path: path.join(out, "390-mobile-menu.png"),
        fullPage: true,
      });
    }
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(
    path.join(out, "audit.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        screens: report.length,
        overflow: report.filter((r) => r.overflow),
        errors: report.filter((r) => r.errors.length),
      },
      null,
      2,
    ),
  );
  process.exit(report.some((r) => r.overflow || r.errors.length) ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
