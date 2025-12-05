import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Generate random salt for password hashing
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Enhanced password hashing with salt
async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const saltRounds = 12; // Higher rounds for better security
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function POST(request: NextRequest) {
  try {
    // Check if default user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "Default user already exists"
      });
    }

    // Hash password with enhanced security
    const hashedPassword = await hashPassword("admin123");

    // Create default user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        username: "admin",
        password: hashedPassword,
        email: "admin@emailkuy.com",
        name: "Administrator",
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Default user created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
