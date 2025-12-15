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

  try {
    // 4. Buscar apenas o nome e email do usuário no banco de dados.
    // Nunca retorne senhas ou hashes de senha nesta rota!
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true, // Se o seu modelo tiver um campo 'name'
        createdAt: true,
      },
    });

    if (!user) {
      // Isso teoricamente não deve acontecer se o JWT for válido
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
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
    console.error('Erro ao recuperar dados do usuário:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar dados.' }, { status: 500 });
  }
}