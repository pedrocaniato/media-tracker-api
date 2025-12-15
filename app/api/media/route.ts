import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@lib/authMiddleware';
import { prisma } from '@lib/db';
import { Prisma } from '@prisma/client'; // Importação correta para acessar PrismaClientKnownRequestError

export async function GET(req: NextRequest) {
  const authResult = authMiddleware(req);

  if (authResult instanceof NextResponse) {
    return authResult; // Erro de autenticação (401)
  }

  const userId = (authResult as { userId: string }).userId;

  try {
    const userMediaList = await prisma.userMedia.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      }
    });

    return NextResponse.json(
      { 
        message: 'Lista de mídia recuperada com sucesso!', 
        data: userMediaList 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao recuperar a lista de mídia:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar dados.' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  const authResult = authMiddleware(req);

  if (authResult instanceof NextResponse) {
    return authResult; // Erro de autenticação (401)
  }

  const userId = (authResult as { userId: string }).userId;

  try {
    const { mediaId, status, rating, review } = await req.json();

    if (!mediaId || !status) {
      return NextResponse.json({ message: 'ID da mídia e Status são obrigatórios.' }, { status: 400 });
    }

    const userMedia = await prisma.userMedia.upsert({
      where: {
        userId_mediaId: {
          userId: userId,
          mediaId: mediaId,
        },
      },
      update: {
        status: status,
        rating: rating,
        review: review,
      },
      create: {
        userId: userId,
        mediaId: mediaId,
        status: status,
        rating: rating,
        review: review,
      },
    });

    return NextResponse.json(
      { 
        message: 'Mídia adicionada/atualizada com sucesso!', 
        data: userMedia 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao adicionar/atualizar mídia:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  const authResult = authMiddleware(req);

  if (authResult instanceof NextResponse) {
    return authResult; // Erro de autenticação (401)
  }

  const userId = (authResult as { userId: string }).userId;
  
  const { searchParams } = new URL(req.url);
  const mediaId = searchParams.get('mediaId');

  if (!mediaId) {
    return NextResponse.json({ message: 'O ID da mídia (mediaId) é obrigatório nos parâmetros de busca.' }, { status: 400 });
  }

  try {

    await prisma.userMedia.delete({
      where: {
        userId_mediaId: {
          userId: userId,
          mediaId: mediaId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Item de mídia não encontrado para este usuário.' }, { status: 404 });
      }
    }

    console.error('Erro ao deletar mídia:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao deletar dados.' }, { status: 500 });
  }
}