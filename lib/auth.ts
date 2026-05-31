import { User } from "@/types";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

// Session storage (in-memory for now)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createSession(userId: string, rememberMe: boolean): string {
  const sessionId = Math.random().toString(36).substring(2);
  const expiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000); // 30 days or 1 day
  sessions.set(sessionId, { userId, expiresAt });
  return sessionId;
}

export function getSession(sessionId: string): { userId: string } | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return { userId: session.userId };
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export async function validateCredentials(username: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("id, username, password_hash, full_name, email, role, department, is_active, created_at")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      console.error("User not found:", error);
      return null;
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, data.password_hash);
    if (!isValidPassword) {
      console.error("Invalid password");
      return null;
    }

    // Return user without password
    return {
      id: data.id,
      username: data.username,
      name: data.full_name,
      email: data.email,
      role: data.role,
      department: data.department || "",
      active: data.is_active,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Validate credentials error:", error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("id, username, full_name, email, role, department, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get all users error:", error);
      return [];
    }

    return data.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      active: user.is_active,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error("Get all users error:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("id, username, full_name, email, role, department, is_active, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Get user by ID error:", error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      name: data.full_name,
      email: data.email,
      role: data.role,
      department: data.department || "",
      active: data.is_active,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Get user by ID error:", error);
    return null;
  }
}

export async function createUser(userData: Omit<User, "id"> & { password: string; username: string }): Promise<User | null> {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { data, error } = await supabase
      .from("auth_users")
      .insert({
        username: userData.username,
        password_hash: hashedPassword,
        full_name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        is_active: userData.active,
      })
      .select("id, username, full_name, email, role, department, is_active, created_at")
      .single();

    if (error || !data) {
      console.error("Create user error:", error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      name: data.full_name,
      email: data.email,
      role: data.role,
      department: data.department || "",
      active: data.is_active,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Create user error:", error);
    return null;
  }
}

export async function updateUser(id: string, updates: Partial<User & { password?: string; username?: string }>): Promise<User | null> {
  try {
    const updateData: any = {};

    if (updates.username) updateData.username = updates.username;
    if (updates.name) updateData.full_name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.active !== undefined) updateData.is_active = updates.active;
    
    // Hash password if provided
    if (updates.password) {
      updateData.password_hash = await bcrypt.hash(updates.password, 10);
    }

    const { data, error } = await supabase
      .from("auth_users")
      .update(updateData)
      .eq("id", id)
      .select("id, username, full_name, email, role, department, is_active, created_at")
      .single();

    if (error || !data) {
      console.error("Update user error:", error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      name: data.full_name,
      email: data.email,
      role: data.role,
      department: data.department || "",
      active: data.is_active,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Update user error:", error);
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("auth_users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete user error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete user error:", error);
    return false;
  }
}
