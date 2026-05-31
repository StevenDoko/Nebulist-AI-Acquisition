import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase";

// GET current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Query user from Supabase
    const { data: user, error } = await supabase
      .from("auth_users")
      .select("*")
      .eq("id", session.userId)
      .eq("is_active", true)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        email: user.email,
        role: user.role,
        active: user.is_active,
        createdAt: user.created_at,
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, role } = body;

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updates.full_name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;

    // Update user in Supabase
    const { data: updatedUser, error } = await supabase
      .from("auth_users")
      .update(updates)
      .eq("id", session.userId)
      .select()
      .single();

    if (error || !updatedUser) {
      console.error("Update user error:", error);
      return NextResponse.json(
        { message: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        active: updatedUser.is_active,
        createdAt: updatedUser.created_at,
      },
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
