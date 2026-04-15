import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@lib/jwt'; 

// Esta função injeta o userId no objeto de requisição (não nativo do Next, 
// mas usaremos um objeto simples para manter o userId na requisição para a rota).

interface AuthenticatedRequest extends NextRequest {
  userId?: string;
}

/**
 * Middleware para autenticar requisições usando JWT.
 * * @param req A requisição recebida.
 * @returns A requisição com o userId injetado ou uma resposta de erro (401).
 */
export function authMiddleware(req: NextRequest): NextResponse | AuthenticatedRequest {
  // 1. Pular a autenticação APENAS para as rotas públicas de auth
  const publicRoutes = ['/api/auth/login', '/api/auth/register'];
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return req as AuthenticatedRequest;
  }

  // 2. Extrair o Token do cabeçalho
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  console.log("Token extraído:", token ? `${token.substring(0, 10)}...` : "Nenhum");

  if (!token) {
    return NextResponse.json({ message: 'Acesso negado. Token não fornecido.' }, { status: 401 });
  }

  // 3. Verificar o Token
  const payload = verifyToken(token);
  console.log("User ID decodificado:", payload?.userId || "Falha na decodificação");

  if (!payload) {
    return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
  }

  // 4. Injetar o userId na requisição
  const authenticatedReq = req as AuthenticatedRequest;
  authenticatedReq.userId = payload.userId;

  return authenticatedReq;
}