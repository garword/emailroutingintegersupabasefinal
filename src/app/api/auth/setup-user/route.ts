import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', 'windaa')
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User windaa already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("cantik", 10);

    // Create new user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        username: "windaa",
        password: hashedPassword,
        email: "windaa@q0083aacahe1-d.space.z.ai",
        name: "Windaa User",
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "User windaa created successfully",
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