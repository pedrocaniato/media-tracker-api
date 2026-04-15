import { prisma } from "@lib/db";
import { notFound } from "next/navigation";
import ProfileHeader from "./components/ProfileHeader";
import ProfileContent from "./components/ProfileContent";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  // 1. Tentar buscar primeiro pelo username
  let user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      media: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  // 2. Se não encontrar pelo username, tentar pelo ID
  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        id: username,
      },
      include: {
        media: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });
  }

  if (!user) {
    return notFound();
  }

  // Cálculos rápidos de estatísticas para o Header
  const stats = {
    watched: user.media.filter((m) => m.status === "VISTO").length,
    favorites: user.media.filter((m) => m.isFavorite).length,
    reviews: user.media.filter((m) => m.review !== null && m.review !== "").length,
  };

  const userWithStats = {
    ...user,
    stats,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <ProfileHeader user={userWithStats} />
        <ProfileContent media={user.media} />
      </main>
    </div>
  );
}
