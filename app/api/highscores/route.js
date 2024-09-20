import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { userId, score, difficulty } = await req.json();
  
  const highScore = await prisma.highScore.create({
    data: {
      userId,
      score,
      difficulty,
    },
  });

  return NextResponse.json(highScore);
}

export async function GET() {
  const highScores = await prisma.highScore.findMany({
    orderBy: {
      score: 'desc',
    },
    take: 10,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(highScores);
}
