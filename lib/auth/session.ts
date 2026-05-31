import { cookies } from "next/headers";

export interface SessionUser {
  userId: string;
  username: string;
  name: string;
  role: "admin" | "manager" | "staff";
  timestamp: number;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nebulist_session");

    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    // Check if session is expired (7 days)
    const sessionAge = Date.now() - sessionData.timestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (sessionAge > maxAge) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
