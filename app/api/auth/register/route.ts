import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, confirmPassword } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        budget: {
          create: {
            monthlyLimit: 200.0,
            currentMonthlySpent: 0.0,
            singleTxLimit: 25.0,
            dailyLimit: 50.0,
            weeklyLimit: 100.0,
            emergencyFreeze: false,
            currency: 'USD',
          },
        },
        spendingPolicy: {
          create: {
            requireApprovalAbove: 25.0,
            blockUnapprovedCategories: true,
            blockNonWhitelistedMerchants: false,
            whitelistedCategoriesJson: JSON.stringify([
              'developer tools',
              'github dependencies',
              'cloud hosting',
              'api credits',
              'open-source tipping',
              'infrastructure',
              'saas subscription',
            ]),
          },
        },
        merchantWhitelist: {
          create: [
            { merchantName: 'GitHub Inc.', domain: 'github.com', category: 'developer tools' },
            { merchantName: 'Vercel Inc.', domain: 'vercel.com', category: 'cloud hosting' },
            { merchantName: 'AWS Cloud Services', domain: 'aws.amazon.com', category: 'cloud hosting' },
            { merchantName: 'Tailwind Labs', domain: 'tailwindcss.com', category: 'open-source tipping' },
          ],
        },
        integrations: {
          create: [
            { provider: 'PAYPAL_SANDBOX', status: 'CONNECTED', configJson: JSON.stringify({ mode: 'sandbox' }) },
            { provider: 'OPENAI', status: 'CONNECTED', configJson: JSON.stringify({ model: 'gpt-4o-mini' }) },
            { provider: 'DATABASE', status: 'CONNECTED', configJson: JSON.stringify({ engine: 'SQLite / Prisma' }) },
          ],
        },
        auditLogs: {
          create: {
            action: 'USER_REGISTERED',
            entityType: 'AUTH',
            detail: `Registered new account ${normalizedEmail}`,
          },
        },
        notifications: {
          create: {
            type: 'SECURITY',
            title: 'Welcome to TrustAgent',
            message: 'Your autonomous budget-governed commerce account is ready.',
          },
        },
      },
      include: {
        budget: true,
        spendingPolicy: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        budget: user.budget,
        spendingPolicy: user.spendingPolicy,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[API /auth/register] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register account.' },
      { status: 500 }
    );
  }
}

