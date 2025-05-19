import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
} 