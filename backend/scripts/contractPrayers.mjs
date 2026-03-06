const BASE_URL = process.env.CONTRACT_BASE_URL || "http://localhost:5000/api";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "content-type": "application/json" }
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function run() {
  const listRes = await request("/prayers?limit=3");
  assert(listRes.status === 200, `GET /prayers expected 200 got ${listRes.status}`);
  assert(Array.isArray(listRes.body), "GET /prayers response must be array");
  assert(listRes.body.length > 0, "GET /prayers returned empty list");
  const first = listRes.body[0];
  const prayerId = first.id || first._id;
  assert(typeof prayerId === "string" && prayerId.length > 0, "Prayer item missing id");

  const detailRes = await request(`/prayers/${prayerId}`);
  assert(detailRes.status === 200, `GET /prayers/:id expected 200 got ${detailRes.status}`);
  assert((detailRes.body.id || detailRes.body._id) === prayerId, "Detail endpoint returned mismatched prayer");

  const audioRes = await request(`/prayers/${prayerId}/audio`);
  assert([200, 402, 404].includes(audioRes.status), `GET /prayers/:id/audio unexpected status ${audioRes.status}`);
  if (audioRes.status === 200 || audioRes.status === 402) {
    const metadata = audioRes.status === 402 ? audioRes.body.metadata : audioRes.body;
    assert(metadata && typeof metadata === "object", "Audio metadata response missing object");
    assert(typeof metadata.requiredTier === "string", "Audio metadata missing requiredTier");
  }

  const versionRes = await request("/prayers/catalog/version");
  assert(versionRes.status === 200, `GET /prayers/catalog/version expected 200 got ${versionRes.status}`);
  assert(typeof versionRes.body.totalPrayers === "number", "Catalog version missing totalPrayers");

  const availabilityRes = await request("/prayers/availability?country=US&language=english");
  assert(availabilityRes.status === 200, `GET /prayers/availability expected 200 got ${availabilityRes.status}`);
  assert(typeof availabilityRes.body.totalPrayers === "number", "Availability missing totalPrayers");

  const entitlementRes = await request("/prayers/entitlements");
  assert(entitlementRes.status === 200, `GET /prayers/entitlements expected 200 got ${entitlementRes.status}`);
  assert(Array.isArray(entitlementRes.body.entitlements), "Entitlements response missing entitlements[]");

  console.log("Prayer contract checks passed.");
}

run().catch((error) => {
  console.error("[contractPrayers] failed:", error.message);
  process.exit(1);
});

