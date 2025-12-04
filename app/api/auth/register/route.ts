import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/db'; // <-- Agora usando '@/lib/db'
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    // 1. Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email já registrado.' }, { status: 409 });
    }

    // 2. Hash da senha (Segurança!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ user: newUser, message: 'Cadastro bem-sucedido!' }, { status: 201 });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}