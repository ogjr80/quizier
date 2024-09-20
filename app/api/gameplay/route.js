import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { userId, score, difficulty, totalAnswered, achievements } = await req.json();
  
  const gamePlay = await prisma.gamePlay.create({
    data: {
      userId,
      score,
      difficulty,
      totalAnswered,
    },
  });

  // Save achievements
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: {
        userId,
        name: achievement,
      },
    });
  }

  // Check if this is a new high score
  const existingHighScore = await prisma.highScore.findFirst({
    where: {
      userId,
      difficulty,
    },
    orderBy: {
      score: 'desc',
    },
  });

  if (!existingHighScore || score > existingHighScore.score) {
    await prisma.highScore.create({
      data: {
        userId,
        score,
        difficulty,
      },
    });
  }

  return NextResponse.json(gamePlay);
}
