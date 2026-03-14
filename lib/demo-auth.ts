import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getRequiredServerEnvironment } from "@/lib/env";

const DEMO_SESSION_COOKIE = "industrium_demo_session";
const DEMO_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type DemoSessionPayload = {
  userId: string;
  expiresAt: number;
};

function signPayload(payload: string) {
  return createHmac("sha256", getRequiredServerEnvironment().SUPABASE_SERVICE_ROLE_KEY)
    .update(payload)
    .digest("base64url");
}

function encodePayload(payload: DemoSessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string): DemoSessionPayload | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as DemoSessionPayload;
  } catch {
    return null;
  }
}

export async function setDemoSessionCookie(userId: string) {
  const payload: DemoSessionPayload = {
    userId,
    expiresAt: Date.now() + DEMO_SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = encodePayload(payload);
  const token = `${encodedPayload}.${signPayload(encodedPayload)}`;
  const cookieStore = await cookies();

  cookieStore.set(DEMO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: DEMO_SESSION_TTL_SECONDS,
  });
}

export async function clearDemoSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
}

export async function readDemoSessionCookie(): Promise<DemoSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = decodePayload(encodedPayload);

  if (!payload || !payload.userId || payload.expiresAt <= Date.now()) {
    return null;
  }

  return payload;
}
