import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@lib/authMiddleware';
import { prisma } from '@lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult as { userId: string };

  const media = await prisma.userMedia.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ data: media });
}

export async function POST(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult as { userId: string };
  const body = await req.json();

  const {
    uniqueId,
    type,
    title,
    posterUrl,
    releaseYear,
    status,
    rating,
    review,
  } = body;

  if (!uniqueId || !type || !title || !status) {
    return NextResponse.json(
      { message: 'Campos obrigatórios ausentes.' },
      { status: 400 }
    );
  }

  // ✅ NORMALIZAÇÃO
  const releaseYearInt =
    releaseYear !== undefined && releaseYear !== null
      ? Number(releaseYear)
      : null;

  const userMedia = await prisma.userMedia.upsert({
    where: {
      userId_uniqueId: {
        userId,
        uniqueId,
      },
    },
    update: {
      status,
      rating: rating ?? null,
      review: review ?? null,
    },
    create: {
      userId,
      uniqueId,
      type,
      title,
      posterUrl,
      releaseYear: releaseYearInt,
      status,
      rating: rating ?? null,
      review: review ?? null,
    },
  });

  return NextResponse.json({ data: userMedia }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult as { userId: string };
  const { searchParams } = new URL(req.url);
  const uniqueId = searchParams.get('uniqueId');

  if (!uniqueId) {
    return NextResponse.json(
      { message: 'uniqueId é obrigatório.' },
      { status: 400 }
    );
  }

  try {
    await prisma.userMedia.delete({
      where: {
        userId_uniqueId: {
          userId,
          uniqueId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { message: 'Mídia não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Erro ao remover mídia.' },
      { status: 500 }
    );
  }
}
