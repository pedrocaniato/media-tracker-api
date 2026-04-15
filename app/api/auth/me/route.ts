import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@lib/authMiddleware';
import { prisma } from '@lib/db';

export async function GET(req: NextRequest) {
  const authResult = authMiddleware(req);

  if (authResult instanceof NextResponse) {
    return authResult; 
  }

  // 3. O usuário está autenticado, extraímos o userId
  const userId = (authResult as { userId: string }).userId;

  if (!userId) {
    return NextResponse.json({ message: 'Não autorizado. ID do usuário ausente.' }, { status: 401 });
  }

  try {
    // 4. Buscar dados do usuário no banco de dados.
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado no banco de dados.' }, { status: 404 });
    }

    // 5. Retorna os dados do usuário
    return NextResponse.json(
      { 
        message: 'Dados do usuário recuperados com sucesso.', 
        data: user 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Erro crítico ao recuperar dados do usuário:', error);
    return NextResponse.json({ 
      message: 'Erro interno do servidor ao buscar dados.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}