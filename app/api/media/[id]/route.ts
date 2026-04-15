import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@lib/authMiddleware";
import { prisma } from "@lib/db";
import { Prisma } from "@prisma/client";

/**
 * GET /api/media/[id]
 * Busca uma mídia específica do usuário
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult as { userId: string };
  const uniqueId = params.id;

  const media = await prisma.userMedia.findUnique({
    where: {
      userId_uniqueId: {
        userId,
        uniqueId,
      },
    },
  });

  if (!media) {
    return NextResponse.json(
      { message: "Mídia não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ media });
}

/**
 * POST /api/media/[id]
 * Cria ou atualiza mídia
 */
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
      { message: "Campos obrigatórios ausentes." },
      { status: 400 }
    );
  }

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

/**
 * DELETE /api/media/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult as { userId: string };
  const uniqueId = params.id;

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
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Mídia não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Erro ao remover mídia." },
      { status: 500 }
    );
  }
}
