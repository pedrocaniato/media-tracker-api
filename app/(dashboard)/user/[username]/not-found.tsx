import Link from 'next/link';
import { UserX, Search } from 'lucide-react';

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-6 group transition-all hover:border-red-500/50">
        <UserX size={32} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-3">
        Usuário não encontrado
      </h1>
      
      <p className="text-zinc-500 max-w-sm mb-10 leading-relaxed text-sm">
        O perfil que você está procurando não existe ou foi removido. 
        Verifique o @username e tente novamente.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/search"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-100 text-zinc-950 font-medium hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          <Search size={18} />
          Voltar para a Busca
        </Link>
        
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-900 text-zinc-300 font-medium border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95"
        >
          Ir para Página Inicial
        </Link>
      </div>
    </div>
  );
}
