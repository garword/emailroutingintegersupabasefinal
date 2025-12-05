import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Input validation
function validateInput(username: string, password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!username || username.length < 3) {
    errors.push("Username minimal 3 karakter");
  }
  if (username.length > 20) {
    errors.push("Username maksimal 20 karakter");
  }
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    errors.push("Username hanya boleh huruf dan angka");
  }
  
  if (!password || password.length < 8) {
    errors.push("Password minimal 8 karakter");
  }
  if (password.length > 20) {
    errors.push("Password maksimal 20 karakter");
  }
  if (!password.match(/[A-Z]/) || !password.match(/[a-z]/) || !password.match(/[0-9]/)) {
    errors.push("Password harus mengandung: huruf besar, angka, dan spesial");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();

    // Get client IP for rate limiting
    const clientIP = request.ip || 'unknown';
    const now = Date.now();

    // Check rate limiting
    const userAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
    
    // Check if user is locked out
    if (userAttempts.count >= MAX_ATTEMPTS && (now - userAttempts.lastAttempt) < LOCKOUT_DURATION) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((LOCKOUT_DURATION - (now - userAttempts.lastAttempt)) / 60000)} menit.`,
          lockoutTime: Math.ceil((LOCKOUT_DURATION - (now - userAttempts.lastAttempt)) / 60000)
        },
        { status: 429 }
      );
    }

    // Enhanced input validation
    const validation = validateInput(username, password);
    if (!validation.isValid) {
      loginAttempts.set(clientIP, {
        count: userAttempts.count + 1,
        lastAttempt: now
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: validation.errors.join(', '),
          remainingAttempts: MAX_ATTEMPTS - userAttempts.count
        },
        { status: 400 }
      );
    }

    // Find user in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      loginAttempts.set(clientIP, {
        count: userAttempts.count + 1,
        lastAttempt: now
      });
      
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      loginAttempts.set(clientIP, {
        count: userAttempts.count + 1,
        lastAttempt: now
      });
      
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: "Akun tidak aktif" },
        { status: 401 }
      );
    }

    // Successful login - clear rate limit
    loginAttempts.delete(clientIP);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        rememberMe: rememberMe || false,
        ip: clientIP,
        timestamp: now
      },
      JWT_SECRET,
      { 
        expiresIn: rememberMe ? '1d' : '1h'
      }
    );

    // Set cookie with proper expiration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    let cookieValue = `auth_token=${token}`;
    
    if (rememberMe) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      cookieValue += `; Expires=${expires.toUTCString()}; Max-Age=86400`;
    } else {
      cookieValue += `; Max-Age=3600`;
    }
    
    const cookie = serialize('auth_token', token, cookieOptions);

    // Prepare user data for response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
      token,
      user: userWithoutPassword,
      rememberMe,
      expiresIn: rememberMe ? '1 hari' : '1 jam'
    });

    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Terjadi kesalahan server" 
      },
      { status: 500 }
    );
  }
}