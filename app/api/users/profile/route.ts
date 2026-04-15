import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@lib/authMiddleware";
import { prisma } from "@lib/db";

/**
 * GET /api/users/profile
 * Retorna os dados do perfil do usuário autenticado.
 */
export async function GET(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult as { userId: string };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

/**
 * PATCH /api/users/profile
 * Atualiza os dados do perfil do usuário autenticado.
 * Body: { name?, username?, bio?, image? }
 */
export async function PATCH(req: NextRequest) {
  const authResult = authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult as { userId: string };

  try {
    const body = await req.json();
    const { name, username, bio, image } = body;

    // Se o username for alterado, verificar se já existe
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: "Este nome de usuário já está em uso." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        username: username !== undefined ? username : undefined,
        bio: bio !== undefined ? bio : undefined,
        image: image !== undefined ? image : undefined,
      },
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ message: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
