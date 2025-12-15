import { redirect } from 'next/navigation';

/**
 * Componente da Página Inicial (Rota /).
 * Numa aplicação focada em autenticação, esta rota
 * simplesmente redireciona o utilizador para a página de Login.
 */
export default function HomePage() {
  // 1. Redireciona o utilizador para a página de Login
  // Em aplicações reais, aqui faria uma verificação de sessão antes do redirecionamento.
  redirect('/login');
  
  // O componente nunca chegará a este ponto, mas precisamos retornar JSX
  // para satisfazer o TypeScript/React, caso o redirecionamento falhe.
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p>Redirecionando para Login...</p>
    </div>
  );
}