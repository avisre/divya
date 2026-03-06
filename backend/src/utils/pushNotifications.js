import { JWT } from "google-auth-library";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
let authClient = null;
let projectId = null;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function initializeFcmAuthIfNeeded() {
  if (authClient && projectId) {
    return true;
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    return false;
  }

  const privateKey = String(serviceAccount.private_key).replace(/\\n/g, "\n");
  authClient = new JWT({
    email: serviceAccount.client_email,
    key: privateKey,
    scopes: [FCM_SCOPE]
  });
  projectId = process.env.FCM_PROJECT_ID || serviceAccount.project_id || null;
  return Boolean(projectId);
}

async function getAccessToken() {
  if (!authClient && !initializeFcmAuthIfNeeded()) {
    return null;
  }
  const token = await authClient.getAccessToken();
  return token?.token || token || null;
}

function stringifyData(data = {}) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    acc[key] = typeof value === "string" ? value : JSON.stringify(value);
    return acc;
  }, {});
}

function buildMessagePayload({ token, title, body, deepLink, data }) {
  return {
    message: {
      token,
      notification: { title, body },
      data: stringifyData({
        deepLink,
        ...data
      }),
      android: {
        priority: "HIGH",
        notification: {
          channel_id: "divya_updates"
        }
      },
      apns: {
        payload: {
          aps: { sound: "default" }
        }
      }
    }
  };
}

async function sendToDevice({ token, title, body, deepLink, data, accessToken }) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(buildMessagePayload({ token, title, body, deepLink, data }))
    }
  );

  if (!response.ok) {
    const text = await response.text();
    return {
      ok: false,
      status: response.status,
      error: text || "Unknown FCM error"
    };
  }

  return {
    ok: true
  };
}

export async function queuePushNotification({ user, title, body, deepLink, data = {} }) {
  const deviceTokens = (user?.deviceTokens || [])
    .map((entry) => entry?.token)
    .filter((token) => typeof token === "string" && token.trim().length > 0);

  if (!deviceTokens.length) {
    return {
      delivered: false,
      reason: "No registered device tokens",
      targetDevices: 0,
      payload: { title, body, deepLink, data }
    };
  }

  if (!initializeFcmAuthIfNeeded()) {
    return {
      delivered: false,
      reason: "Push transport not configured",
      targetDevices: deviceTokens.length,
      payload: { title, body, deepLink, data }
    };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      delivered: false,
      reason: "Push transport auth failed",
      targetDevices: deviceTokens.length,
      payload: { title, body, deepLink, data }
    };
  }

  const responses = await Promise.all(
    deviceTokens.map((token) =>
      sendToDevice({
        token,
        title,
        body,
        deepLink,
        data,
        accessToken
      })
    )
  );
  const successCount = responses.filter((item) => item.ok).length;
  const failureCount = responses.length - successCount;
  const firstError = responses.find((item) => !item.ok)?.error || null;

  return {
    delivered: successCount > 0,
    reason: successCount > 0 ? null : firstError || "Push delivery failed",
    targetDevices: deviceTokens.length,
    successCount,
    failureCount,
    payload: { title, body, deepLink, data }
  };
}
