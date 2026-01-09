export interface NormalizedMedia {
  uniqueId: string;
  type: "filme" | "serie" | "livro";
  title: string;
  releaseYear: string;
  posterUrl?: string;
  authors?: string[];

  status?: "VISTO" | "EM_PROGRESSO" | "QUERO_VER";
}