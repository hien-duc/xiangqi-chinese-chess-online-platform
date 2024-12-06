// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/db-connect";
import User from "@/lib/db/models/user.model";
import { createPlayerProfile } from "@/lib/db/models/player.model";
import { SignupFormSchema } from "@/lib/zod";

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { name, email, password } = SignupFormSchema.parse(body);
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email,
      hashedPassword,
      emailVerified: null,
      image: null,
    });

    // Create player profile
    await createPlayerProfile(newUser._id.toString(), name);

    return NextResponse.json(
      {
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
