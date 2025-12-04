import jwt from 'jsonwebtoken'; // Esta deve ser a ÚNICA importação

// Defina a chave secreta. 
// EM PRODUÇÃO, esta chave deve ser uma STRING LONGA, COMPLEXA e salva em uma
// VARIÁVEL DE AMBIENTE (ex: JWT_SECRET) na Vercel!
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-super-insegura-dev';

interface TokenPayload {
  userId: string;
}

export function signToken(payload: TokenPayload): string {
  // O token expira em 7 dias (7d)
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload;
  } catch (error) {
    return null;
  }
}