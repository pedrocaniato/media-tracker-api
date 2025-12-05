import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@lib/authMiddleware';
import { prisma } from '@lib/db';

// A interface AuthenticatedRequest foi removida daqui, pois o TS/ESLint
// reclamava que ela não era usada diretamente nas funções GET/POST.
// O tipo é inferido através da função authMiddleware.

// ===============================================
// ✅ FUNÇÃO GET: Listar todos os itens de mídia do usuário
// ===============================================
export async function GET(req: NextRequest) {
  // 1. Aplicar o Middleware de Autenticação
  const authResult = authMiddleware(req);

  // 2. Se o resultado for uma NextResponse, é um erro de autenticação (401)
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // 3. O usuário está autenticado, extraímos o userId
  // Nota: O TypeScript agora confia que authResult tem a propriedade userId,
  // pois o authMiddleware garante isso ou retorna uma NextResponse.
  const userId = (authResult as { userId: string }).userId;

  try {
    // 4. Buscar todos os registros de UserMedia para este usuário
    const userMediaList = await prisma.userMedia.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc', // Mostra os itens atualizados mais recentemente primeiro
      }
    });

    // 5. Retorna a lista de mídias rastreadas
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


// ===============================================
// FUNÇÃO POST: Adicionar ou atualizar um item na lista do usuário
// ===============================================
export async function POST(req: NextRequest) {
  // 1. Aplicar o Middleware
  const authResult = authMiddleware(req);

  // 2. Se o resultado for uma NextResponse, é um erro de autenticação (401)
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // 3. Se passou pela autenticação, o userId é injetado na requisição.
  const userId = (authResult as { userId: string }).userId;

  try {
    const { mediaId, status, rating, review } = await req.json();

    if (!mediaId || !status) {
      return NextResponse.json({ message: 'ID da mídia e Status são obrigatórios.' }, { status: 400 });
    }

    // A lógica de criação de UserMedia (marcar o item na lista do usuário)
    const userMedia = await prisma.userMedia.upsert({
      where: {
        // Usa a restrição unique composta que criamos no schema.prisma
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