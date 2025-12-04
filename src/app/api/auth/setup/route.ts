import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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
    // Create default user if it doesn't exist
    const existingUser = await db.users.findUnique({
      where: { username: "admin" }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "Default user already exists"
      });
    }

    // Hash password with enhanced security
    const hashedPassword = await hashPassword("admin123");

    // Create default user
    const user = await db.users.create({
      data: {
        username: "admin",
        password: hashedPassword,
        email: "admin@emailkuy.com",
        name: "Administrator",
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Default user created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isActive: user.isActive
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
