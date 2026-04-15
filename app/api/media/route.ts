import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@lib/authMiddleware";
import { prisma } from "@lib/db";

/**
 * GET /api/media
 * Retorna todas as mídias salvas pelo usuário autenticado.
 */
export async function GET(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult as { userId: string };

  const media = await prisma.userMedia.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: media });
}

/**
 * POST /api/media
 * Cria ou atualiza (upsert) a entrada de uma mídia para o usuário autenticado.
 * Body: { uniqueId, type, title, posterUrl?, releaseYear?, status, rating?, review?, isFavorite? }
 */
export async function POST(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult as { userId: string };

  const body = await req.json();
  const { uniqueId, type, title, posterUrl, releaseYear, status, rating, review, isFavorite } = body;

  if (!uniqueId || !type || !title || !status) {
    return NextResponse.json(
      { message: "Campos obrigatórios ausentes: uniqueId, type, title, status." },
      { status: 400 }
    );
  }

  const releaseYearInt =
    releaseYear !== undefined && releaseYear !== null ? Number(releaseYear) : null;

  const userMedia = await prisma.userMedia.upsert({
    where: { userId_uniqueId: { userId, uniqueId } },
    update: {
      status,
      rating: rating !== undefined ? rating : undefined,
      review: review !== undefined ? review : undefined,
      isFavorite: isFavorite !== undefined ? isFavorite : undefined,
    },
    create: {
      userId,
      uniqueId,
      type,
      title,
      posterUrl: posterUrl ?? null,
      releaseYear: releaseYearInt,
      status,
      rating: rating ?? null,
      review: review ?? null,
      isFavorite: isFavorite ?? false,
    },
  });

  return NextResponse.json({ data: userMedia }, { status: 201 });
}
