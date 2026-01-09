import { NextRequest, NextResponse } from 'next/server';
import { NormalizedMedia } from '@/app/types/media';

// 1. CHAVES DE API
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; 

if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não está configurada nas variáveis de ambiente.');
}
if (!GOOGLE_BOOKS_API_KEY) {
    throw new Error('GOOGLE_BOOKS_API_KEY não está configurada nas variáveis de ambiente.');
}


// ===============================================
// 2. INTERFACES DE DADOS E NORMALIZAÇÃO
// ===============================================

// Formato de saída unificado para todas as mídias (o que retorna para o frontend)

// Tipagem mínima para itens de Filmes/Séries do TMDB
interface TMDBItem {
    id: number;
    // Filmes usam 'title', Séries usam 'name'
    title?: string;
    name?: string; 
    // Filmes usam 'release_date', Séries usam 'first_air_date'
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
    popularity?: number; // 🚨 ESSENCIAL PARA A FILTRAGEM
}

// Tipagem mínima para Volumes do Google Books
interface GoogleBooksVolume {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publishedDate?: string;
        imageLinks?: {
            thumbnail?: string;
        };
    };
}


// ===============================================
// LÓGICA TMDB (Filmes e Séries)
// ===============================================

/**
 * Normaliza o resultado de uma busca do TMDB (movie ou tv).
 */
const normalizeTMDB = (item: TMDBItem, mediaType: 'filme' | 'serie'): NormalizedMedia => {
    const isMovie = mediaType === 'filme';
    
    // Acesso seguro aos campos tipados
    const title = isMovie ? item.title : item.name;
    const date = isMovie ? item.release_date : item.first_air_date;
    const releaseYear = date ? date.split('-')[0] : 'N/A';

    // ID único: "TMDB:movie:ID" ou "TMDB:tv:ID"
    const uniqueId = `TMDB:${isMovie ? 'movie' : 'tv'}:${item.id}`;

    return {
        uniqueId,
        type: mediaType,
        title: title || 'Título Desconhecido',
        releaseYear,
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://placehold.co/200x300/CCCCCC/000000?text=Sem+Poster',
    };
};

/**
 * Faz a busca real no TMDB.
 */
const fetchTMDB = async (query: string, mediaType: 'movie' | 'tv'): Promise<NormalizedMedia[]> => {
    // TMDB é simples: usa a chave como API Key ou no header de Autorização (Bearer Token)
    const url = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erro ao buscar no TMDB: ${response.statusText}`);
    }
    
    // O tipo de 'data' agora considera 'popularity'
    const data: { results: TMDBItem[] } = await response.json();
    
    let itemsToProcess = data.results;

    // 🚨 APLICAÇÃO DO FILTRO TIPO LETTERBOXD (apenas para 'movie'/'filme')
    if (mediaType === 'movie') {
        const MIN_POPULARITY = 3.0; // Limite para filtrar conteúdo de baixa relevância

        itemsToProcess = data.results.filter((item) => {
            // 1. Deve ter um poster
            const hasPoster = !!item.poster_path;
            
            // 2. Deve ter popularidade acima do limite
            const isPopularEnough = (item.popularity ?? 0) >= MIN_POPULARITY;
            
            return hasPoster && isPopularEnough;
        });
        
        
    }


    // Mapeia e normaliza os resultados
    return itemsToProcess.map((item) => normalizeTMDB(item, mediaType === 'movie' ? 'filme' : 'serie'));
};


// ===============================================
// LÓGICA GOOGLE BOOKS (Livros)
// ===============================================

/**
 * Normaliza o resultado de uma busca do Google Books (volume).
 */
const normalizeGoogleBooks = (item: GoogleBooksVolume): NormalizedMedia => {
    const info = item.volumeInfo;
    
    // ID único: "GB:ID_DO_LIVRO"
    const uniqueId = `GB:${item.id}`;

    const date = info.publishedDate;
    const releaseYear = date ? date.split('-')[0] : 'N/A';
    
    // O Google Books oferece diferentes tamanhos, 'thumbnail' é bom para busca.
    const imageUrl = info.imageLinks?.thumbnail 
        ? info.imageLinks.thumbnail.replace('http:', 'https:') // Garante HTTPS
        : 'https://placehold.co/100x150/000000/FFFFFF?text=Sem+Capa';

    return {
        uniqueId,
        type: 'livro',
        title: info.title || 'Título Desconhecido',
        releaseYear,
        posterUrl: imageUrl,
        authors: info.authors || [], // Lista de autores
    };
};

/**
 * Faz a busca real no Google Books API.
 */
const fetchBooksAPI = async (query: string): Promise<NormalizedMedia[]> => {
    // CORREÇÃO: Removido '&langRestrict=pt' que estava a causar o 400 'Bad Request'
    // Adicionado '&printType=books' para refinar os resultados.
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books`;
    
    if (GOOGLE_BOOKS_API_KEY) {
        // Adiciona a chave da API apenas se estiver configurada
        url += `&key=${GOOGLE_BOOKS_API_KEY}`;
    }
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            // Tentativa de obter detalhes do erro da API externa
            const errorBody = await response.text();
            let errorMessage = `Erro ao buscar no Google Books: Status ${response.status} - ${response.statusText}`;
            
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.error?.message) {
                    errorMessage = `Erro ao buscar no Google Books: ${errorJson.error.message}`;
                }
            } catch (e) {
                // Se não for um JSON, a mensagem padrão é usada
            }

            // Lança um erro com a mensagem detalhada
            throw new Error(errorMessage);
        }

        const data: { items?: GoogleBooksVolume[] } = await response.json();

        if (!data.items) {
            return []; // Retorna array vazio se não houver resultados
        }

        // Mapeia e normaliza apenas os resultados que possuem volumeInfo
        return data.items
            .filter((item) => item.volumeInfo)
            .map((item) => normalizeGoogleBooks(item));
            
    } catch (error) {
        // Loga e relança o erro para que a função GET o trate
        console.error("Erro detalhado em fetchBooksAPI:", error);
        throw error;
    }
};


// ===============================================
// ✅ FUNÇÃO GET: Rota de Busca principal
// Uso: /api/search?query=termo&type=filme | serie | livro
// ===============================================
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type');

    if (!query || !type) {
        return NextResponse.json({ message: 'Os parâmetros "query" e "type" são obrigatórios.' }, { status: 400 });
    }
    
    const supportedTypes = ['filme', 'serie', 'livro'];
    if (!supportedTypes.includes(type)) {
        return NextResponse.json({ message: 'Tipo de mídia inválido. Use: filme, serie ou livro.' }, { status: 400 });
    }

    let normalizedResults: NormalizedMedia[] = [];

    try {
        switch (type as 'filme' | 'serie' | 'livro') {
            case 'filme':
                normalizedResults = await fetchTMDB(query, 'movie');
                break;
            case 'serie':
                normalizedResults = await fetchTMDB(query, 'tv');
                break;
            case 'livro':
                normalizedResults = await fetchBooksAPI(query);
                break;
        }
        
        // Retorna o resultado normalizado
        return NextResponse.json({ 
            message: `Busca por ${type} concluída.`,
            data: normalizedResults 
        }, { status: 200 });

    } catch (error) {
        // Tratamento de erro robusto
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na API externa.';
        console.error(`Erro ao buscar ${type}:`, error);
        // Retorna o status 500, mas com uma mensagem de erro mais útil
        return NextResponse.json({ message: `Erro: ${errorMessage}` }, { status: 500 });
    }
}