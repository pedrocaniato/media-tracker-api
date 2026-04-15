import { NextRequest, NextResponse } from 'next/server';
import { NormalizedMedia } from '@/app/types/media';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  popularity?: number;
  vote_average?: number;
  overview?: string;
  media_type?: string;
}

const normalizeTMDB = (
  item: TMDBItem,
  mediaType: 'filme' | 'serie'
): NormalizedMedia => {
  const isMovie = mediaType === 'filme';
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;
  const releaseYear = date ? date.split('-')[0] : 'N/A';
  const uniqueId = `TMDB:${isMovie ? 'movie' : 'tv'}:${item.id}`;

  return {
    uniqueId,
    type: mediaType,
    title: title || 'Título Desconhecido',
    releaseYear,
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
      : undefined,
  };
};

export async function GET(req: NextRequest) {
  if (!TMDB_API_KEY) {
    return NextResponse.json({ message: 'TMDB_API_KEY não configurada.' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'now_playing';

  try {
    let url = '';

    switch (section) {
      case 'now_playing':
        url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
        break;
      case 'popular':
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
        break;
      case 'trending':
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=pt-BR`;
        break;
      case 'top_rated':
        url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
        break;
      case 'tv_popular':
        url = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
        break;
      default:
        url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
    }

    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`TMDB retornou ${response.status}`);
    }

    const data: { results: TMDBItem[] } = await response.json();
    const mediaType = section === 'tv_popular' ? 'serie' : 'filme';

    const results = data.results
      .filter((item) => !!item.poster_path)
      .slice(0, 20)
      .map((item) => normalizeTMDB(item, mediaType));

    return NextResponse.json({ data: results }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
