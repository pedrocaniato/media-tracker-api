import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // <-- Agora usando '@/lib/db'
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt'; 

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Geração do Token JWT
    const tokenPayload = { userId: user.id };
    const token = signToken(tokenPayload);

    // Remove a senha do objeto de retorno por segurança
    const { password: _, ...userWithoutPassword } = user;

    // Resposta de sucesso com o token
    return NextResponse.json({ 
      user: userWithoutPassword, 
      token: token, 
      message: 'Login bem-sucedido!' 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}