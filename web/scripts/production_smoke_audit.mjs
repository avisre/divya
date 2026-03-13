const base = process.argv[2] || "https://divya-xbza.onrender.com";
const unique = Date.now();
const email = `audit+${unique}@example.com`;
const password = "Audit#2026!";

const report = {
  base,
  generatedAt: new Date().toISOString(),
  testUser: { email },
  checks: []
};

function add(name, ok, detail = {}) {
  report.checks.push({ name, ok, ...detail });
}

function cookieHeaderFrom(response) {
  const raw =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);
  return raw.map((entry) => entry.split(";")[0]).join("; ");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { response, payload };
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

async function main() {
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/prayers",
    "/temple",
    "/calendar",
    "/pujas",
    "/contact-us",
    "/privacy",
    "/terms",
    "/sitemap"
  ];

  for (const route of publicRoutes) {
    const { response, text } = await fetchText(base + route, { redirect: "manual" });
    add(`public route ${route}`, response.status === 200, {
      status: response.status,
      hasHtml: /<html/i.test(text)
    });
  }

  const prayers = await fetchJson(base + "/api/prayers?limit=1");
  const firstPrayer = Array.isArray(prayers.payload) ? prayers.payload[0] : null;
  add("api prayers sample", prayers.response.ok && !!firstPrayer, {
    status: prayers.response.status,
    prayerId: firstPrayer?._id || null,
    prayerSlug: firstPrayer?.slug || null
  });

  const pujas = await fetchJson(base + "/api/pujas?currency=USD");
  const firstPuja = Array.isArray(pujas.payload) ? pujas.payload[0] : null;
  add("api pujas sample", pujas.response.ok && !!firstPuja, {
    status: pujas.response.status,
    pujaId: firstPuja?._id || null
  });

  const deities = await fetchJson(base + "/api/deities");
  const firstDeity = Array.isArray(deities.payload) ? deities.payload[0] : null;
  add("api deities sample", deities.response.ok && !!firstDeity, {
    status: deities.response.status,
    deityId: firstDeity?._id || null
  });

  const festivals = await fetchJson(base + "/api/festivals/upcoming?days=7");
  add("api festivals sample", festivals.response.ok && Array.isArray(festivals.payload), {
    status: festivals.response.status,
    count: Array.isArray(festivals.payload) ? festivals.payload.length : null
  });

  const panchang = await fetchJson(base + "/api/panchang/today?timezone=Asia%2FKolkata");
  add("api panchang today", panchang.response.ok && !!panchang.payload?.tithi?.name, {
    status: panchang.response.status,
    tithi: panchang.payload?.tithi?.name || null
  });

  if (firstPrayer?.slug) {
    const { response, text } = await fetchText(base + `/prayers/${firstPrayer.slug}`);
    add("prayer detail route", response.status === 200 && text.includes(firstPrayer.title.en), {
      status: response.status
    });
  }

  if (firstPuja?._id) {
    const { response, text } = await fetchText(base + `/pujas/${firstPuja._id}`);
    add("puja detail route", response.status === 200 && text.includes(firstPuja.name.en), {
      status: response.status
    });
  }

  if (firstDeity?._id) {
    const { response, text } = await fetchText(base + `/deities/${firstDeity._id}`);
    add("deity detail route", response.status === 200 && text.includes(firstDeity.name.en), {
      status: response.status
    });
  }

  const registerPayload = {
    name: "Production Audit User",
    email,
    password,
    country: "US",
    timezone: "America/New_York"
  };

  const register = await fetchJson(base + "/api/web-auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(registerPayload)
  });
  const registerCookie = cookieHeaderFrom(register.response);
  add("register new user", register.response.ok && register.payload?.user?.email === email, {
    status: register.response.status,
    hasCookie: Boolean(registerCookie)
  });

  const sessionAfterRegister = await fetchJson(base + "/api/web-auth/session", {
    headers: registerCookie ? { cookie: registerCookie } : {}
  });
  add(
    "session after register",
    sessionAfterRegister.response.ok && sessionAfterRegister.payload?.user?.email === email,
    {
      status: sessionAfterRegister.response.status,
      sessionEmail: sessionAfterRegister.payload?.user?.email || null
    }
  );

  const logout = await fetchJson(base + "/api/web-auth/logout", {
    method: "POST",
    headers: registerCookie ? { cookie: registerCookie } : {}
  });
  add("logout", logout.response.ok, { status: logout.response.status });

  const sessionAfterLogout = await fetchJson(base + "/api/web-auth/session", {
    headers: registerCookie ? { cookie: registerCookie } : {}
  });
  add("session cleared after logout", sessionAfterLogout.response.ok && sessionAfterLogout.payload?.user === null, {
    status: sessionAfterLogout.response.status
  });

  const login = await fetchJson(base + "/api/web-auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const loginCookie = cookieHeaderFrom(login.response);
  add("login existing user", login.response.ok && login.payload?.user?.email === email, {
    status: login.response.status,
    hasCookie: Boolean(loginCookie)
  });

  const authCookie = loginCookie || registerCookie;
  const sessionAfterLogin = await fetchJson(base + "/api/web-auth/session", {
    headers: authCookie ? { cookie: authCookie } : {}
  });
  add(
    "session after login",
    sessionAfterLogin.response.ok && sessionAfterLogin.payload?.user?.email === email,
    {
      status: sessionAfterLogin.response.status,
      sessionEmail: sessionAfterLogin.payload?.user?.email || null
    }
  );

  const protectedRoutes = ["/home", "/profile", "/bookings", "/contact", "/shared-prayer/create"];
  for (const route of protectedRoutes) {
    const { response, text } = await fetchText(base + route, {
      headers: authCookie ? { cookie: authCookie } : {},
      redirect: "manual"
    });
    add(`protected route ${route}`, response.status === 200, {
      status: response.status,
      redirectedTo: response.headers.get("location") || null,
      hasHtml: /<html/i.test(text)
    });
  }

  if (firstDeity?._id) {
    const learnPage = await fetchText(base + `/deities/${firstDeity._id}/learn`, {
      headers: authCookie ? { cookie: authCookie } : {},
      redirect: "manual"
    });
    add("deity learn route", learnPage.response.status === 200, {
      status: learnPage.response.status
    });
  }

  const profileUpdate = await fetchJson(base + "/api/backend/users/profile", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      ...(authCookie ? { cookie: authCookie } : {})
    },
    body: JSON.stringify({
      preferredLanguage: "english",
      country: "US",
      timezone: "America/Chicago",
      prayerReminders: {
        morningTime: "06:30",
        eveningTime: "19:30"
      }
    })
  });
  add("profile update", profileUpdate.response.ok, {
    status: profileUpdate.response.status
  });

  if (firstPrayer?._id) {
    const favorite = await fetchJson(base + `/api/backend/prayers/${firstPrayer._id}/favorite`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(authCookie ? { cookie: authCookie } : {})
      }
    });
    add("favorite prayer toggle", favorite.response.ok, {
      status: favorite.response.status
    });
  }

  const gothramSuggest = await fetchJson(base + "/api/backend/bookings/gothram-suggest", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authCookie ? { cookie: authCookie } : {})
    },
    body: JSON.stringify({
      devoteeName: "Production Audit User",
      surnameCommunity: "Nair",
      familyRegion: "Kerala",
      knownFamilyGothram: ""
    })
  });
  add("gothram suggest", gothramSuggest.response.ok, {
    status: gothramSuggest.response.status,
    gothram: gothramSuggest.payload?.gothram || null
  });

  const supportFormPage = await fetchText(base + "/contact-us", {
    redirect: "manual"
  });
  add("public support page content", supportFormPage.response.status === 200 && /Submit request|Category|Message/i.test(supportFormPage.text), {
    status: supportFormPage.response.status
  });

  const sharedPrayerPage = await fetchText(base + "/shared-prayer/create", {
    headers: authCookie ? { cookie: authCookie } : {},
    redirect: "manual"
  });
  add("shared prayer page content", sharedPrayerPage.response.status === 200 && /Create session|Repetitions|Prayer/i.test(sharedPrayerPage.text), {
    status: sharedPrayerPage.response.status
  });

  report.summary = {
    passed: report.checks.filter((check) => check.ok).length,
    failed: report.checks.filter((check) => !check.ok).length
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ fatal: String(error) }, null, 2));
  process.exit(1);
});
