import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@lib/authMiddleware';
import { prisma } from '@lib/db';

// Adicionar um item (filme/livro/série) à lista do usuário
export async function POST(req: NextRequest) {
  // 1. Aplicar o Middleware
  const authResult = authMiddleware(req);

  // 2. Se o resultado for uma NextResponse, é um erro de autenticação (401)
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // 3. Se passou pela autenticação, o userId está injetado na requisição.
  const userId = authResult.userId; // <-- ID do usuário autenticado!

  try {
    const { mediaId, status, rating, review } = await req.json();

    if (!mediaId || !status) {
      return NextResponse.json({ message: 'ID da mídia e Status são obrigatórios.' }, { status: 400 });
    }

    // A lógica de criação de UserMedia (marcar o item na lista do usuário)
    const userMedia = await prisma.userMedia.upsert({
      where: {
        // Este argumento 'userId_mediaId' AGORA EXISTIRÁ porque restauramos o @@unique no schema.prisma
        userId_mediaId: {
          userId: userId!, // Usamos o userId do token
          mediaId: mediaId,
        },
      },
      update: { status, rating, review },
      create: { userId: userId!, mediaId, status, rating, review },
    });

    return NextResponse.json({ message: 'Mídia adicionada/atualizada com sucesso!', data: userMedia }, { status: 201 });

  } catch (error) {
    console.error('Erro ao adicionar mídia:', error);
    // Para depuração, o erro P2003 original não deve mais ocorrer
    return NextResponse.json({ message: 'Erro interno ao processar a mídia.' }, { status: 500 });
  }
}