const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const p = await c.newPage();
  const base = process.env.BASE_URL || "http://localhost:3000";
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  async function role(name) {
    await p.goto(base + "/login");
    await p.getByRole("button", { name: "Continue as " + name }).click();
    await p.waitForURL("**/dashboard");
  }
  await role("Restaurant");
  await p.goto(base + "/donations/new");
  await p
    .getByLabel("Food name", { exact: true })
    .fill("Community dinner bowls");
  await p.getByLabel("Quantity (meal portions)").fill("35");
  await p
    .getByLabel("Description & allergen information")
    .fill(
      "Prepared vegetable and rice bowls. Contains dairy; verify storage and ingredients at pickup.",
    );
  await p.getByLabel("I confirm").check();
  await p.getByRole("button", { name: "Publish donation" }).click();
  await p.waitForURL(base + "/donations");
  await p
    .getByRole("link")
    .filter({ has: p.getByRole("heading", { name: "Community dinner bowls" }) })
    .click();
  await p.waitForURL(/donations\/[0-9a-f-]{36}$/);
  const url = p.url();
  await role("NGO");
  await p.goto(url);
  await p.getByRole("button", { name: "Reserve this food" }).click();
  await p.getByRole("button", { name: "Confirm self-pickup" }).waitFor();
  await role("Volunteer");
  await p.goto(url);
  await p.getByRole("button", { name: "Accept pickup" }).click();
  await p.getByRole("button", { name: "Mark collected" }).click();
  await p.getByRole("button", { name: "Mark delivered" }).click();
  await p.getByRole("heading", { name: "completed", exact: true }).waitFor();
  const data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("food-rescue-v1")),
  );
  const donation = data.donations.find(
    (d) => d.food_name === "Community dinner bowls",
  );
  assert.equal(donation.status, "completed");
  assert.equal(
    data.points
      .filter(
        (x) => x.donation_id === donation.id && x.user_id === "demo-volunteer",
      )
      .reduce((s, p) => s + p.amount, 0),
    25,
  );
  assert.equal(
    data.points
      .filter(
        (x) => x.donation_id === donation.id && x.user_id === "demo-restaurant",
      )
      .reduce((s, p) => s + p.amount, 0),
    50,
  );
  await p.reload();
  await p.getByRole("heading", { name: "completed", exact: true }).waitFor();
  assert.equal(
    await p.getByRole("button", { name: "Mark delivered" }).count(),
    0,
  );
  // NGO self-pickup branch.
  await role("NGO");
  await p.goto(base + "/donations/demo-donation-1");
  await p.getByRole("button", { name: "Reserve this food" }).click();
  await p.getByRole("button", { name: "Confirm self-pickup" }).click();
  await p.getByRole("heading", { name: "completed", exact: true }).waitFor();
  // Search empty state and mobile menu.
  await p.goto(base + "/donations");
  await p
    .getByRole("textbox", { name: "Search food" })
    .fill("not-a-real-food-xyz");
  await p
    .getByRole("heading", { name: "No matching donations yet." })
    .waitFor();
  await p.getByRole("button", { name: "Open navigation" }).click();
  await p.getByRole("link", { name: "Settings", exact: true }).click();
  await p.waitForURL("**/settings");
  await p.getByLabel("Name", { exact: true }).fill("Demo Community Kitchen");
  await p.getByRole("button", { name: "Save changes" }).click();
  await p.getByRole("status").filter({ hasText: "Profile updated." }).waitFor();
  const health = await (await p.request.get(base + "/api/health")).json();
  assert.equal(health.mode, "demo");
  const api = await p.request.get(base + "/api/donations");
  assert.equal(api.status(), 503);
  const response = await p.request.post(base + "/api/analyze");
  assert.equal(response.status(), 200);
  assert.match((await response.json()).notice, /No AI analysis was performed/);
  assert.deepEqual(errors, []);
  // Independent browser starts with its own seed rather than leaking demo writes.
  const other = await b.newContext();
  const p2 = await other.newPage();
  await p2.goto(base + "/login");
  await p2.getByRole("button", { name: "Continue as NGO" }).click();
  const otherData = await p2.evaluate(() =>
    JSON.parse(localStorage.getItem("food-rescue-v1")),
  );
  assert.ok(
    !otherData.donations.some((d) => d.food_name === "Community dinner bowls"),
  );
  await other.close();
  await c.close();
  await b.close();
  console.log(
    "PASS: create → reserve → accept → collect → deliver; points; reload; NGO self-pickup; search; mobile navigation; settings; API fallback; independent device data.",
  );
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
