import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { userId, achievement } = await req.json();
  
  const existingAchievement = await prisma.achievement.findFirst({
    where: {
      userId,
      name: achievement,
    },
  });

  if (!existingAchievement) {
    const newAchievement = await prisma.achievement.create({
      data: {
        userId,
        name: achievement,
      },
    });
    return NextResponse.json(newAchievement);
  }

  return NextResponse.json(existingAchievement);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const achievements = await prisma.achievement.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(achievements);
}
