import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type User = Session["user"];

export async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Wymagane zalogowanie" },
      { status: 401 }
    );
  }
  return user;
}

export async function requirePermission(permission: "canEditParameters" | "canViewAllConfigs") {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { message: "Wymagane zalogowanie" },
      { status: 401 }
    );
  }

  const user = session.user;

  if (!user[permission] && user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Brak uprawnień" },
      { status: 403 }
    );
  }
  return user;
}

export function canViewConfig(user: User | null, configUserId: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN" || user.canViewAllConfigs) return true;
  return user.id === configUserId;
}

export function canEditConfig(user: User | null, configUserId: string): boolean {
  if (!user) return false;
  return user.id === configUserId || user.role === "ADMIN";
}

