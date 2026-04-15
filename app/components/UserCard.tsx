import Link from "next/link";

interface UserCardProps {
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
    _count?: {
      media: number;
    };
  };
}

export default function UserCard({ user }: UserCardProps) {
  const displayName = user.name || user.username || "Usuário";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <Link
      href={`/user/${user.username}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-900 transition-all group"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
        {user.image ? (
          <img
            src={user.image}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 font-semibold">
            {initials}
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-white font-semibold truncate group-hover:text-white transition-colors">
          {user.name || user.username}
        </h3>
        <p className="text-zinc-500 text-sm truncate">@{user.username}</p>
      </div>

      {user._count !== undefined && (
        <div className="flex flex-col items-end">
          <span className="text-white font-bold">{user._count.media}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter font-bold">Vistos</span>
        </div>
      )}
    </Link>
  );
}
