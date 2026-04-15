import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ source: string; type: string; id: string }>;
  }
) {
  try {
    const { source, type, id } = await context.params;

    if (!source || !type || !id) {
      return NextResponse.json(
        { message: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const sourceNormalized = source.toUpperCase();
    const typeNormalized = type.toLowerCase();

    if (sourceNormalized !== "TMDB") {
      return NextResponse.json(
        { message: "Fonte inválida" },
        { status: 400 }
      );
    }

    if (typeNormalized !== "movie" && typeNormalized !== "tv") {
      return NextResponse.json(
        { message: "Tipo inválido" },
        { status: 400 }
      );
    }

    const TMDB_KEY = process.env.TMDB_API_KEY;

    if (!TMDB_KEY) {
      return NextResponse.json(
        { message: "TMDB_API_KEY não configurada" },
        { status: 500 }
      );
    }

    // 🔥 BUSCA DETALHES
    const detailsRes = await fetch(
      `https://api.themoviedb.org/3/${typeNormalized}/${id}?api_key=${TMDB_KEY}&language=pt-BR`
    );

    if (!detailsRes.ok) {
      return NextResponse.json(
        { message: "Erro ao buscar na TMDB" },
        { status: 500 }
      );
    }

    const data = await detailsRes.json();

    // 🔥 BUSCA CAST
    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/${typeNormalized}/${id}/credits?api_key=${TMDB_KEY}&language=pt-BR`
    );

    const creditsData = await creditsRes.json();

    const cast =
      creditsData?.cast?.slice(0, 12).map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileUrl: actor.profile_path
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : null,
      })) || [];

    return NextResponse.json({
      media: {
        uniqueId: `TMDB:${typeNormalized}:${id}`,
        type: typeNormalized,
        title: data.title || data.name,
        releaseYear: (data.release_date || data.first_air_date)?.split("-")[0],
        overview: data.overview,
        posterUrl: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : null,
        backdropUrl: data.backdrop_path
          ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
          : null,
        cast,
      },
    });
  } catch (error) {
    console.error("Erro na rota pública:", error);
    return NextResponse.json(
      { message: "Erro interno" },
      { status: 500 }
    );
  }
}
