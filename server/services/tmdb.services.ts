export interface RecommendedMovie {
  title: string;
  releaseYear: number | string;
  justification: string;
  imageUrl?: string | null;
}

interface TmdbMovieResult {
  poster_path: string | null;
  title: string;
  release_date?: string;
}

interface TmdbSearchResponse {
  results: TmdbMovieResult[];
}

/**
 * Searches TMDB for each recommended movie and appends the poster image URL.
 * Executes all searches concurrently
 */
export const enrichMoviesWithImages = async (
  movies: RecommendedMovie[]
): Promise<RecommendedMovie[]> => {
  const tmdbApiKey = process.env.VITE_TMDB_API_KEY;

  if (!tmdbApiKey) {
    console.warn('VITE_TMDB_API_KEY is missing from environment variables.');
    return movies.map((movie) => ({ ...movie, imageUrl: null }));
  }

  const enrichedMovies = await Promise.all(
    movies.map(async (movie): Promise<RecommendedMovie> => {
      try {
        const searchUrl = new URL('https://api.themoviedb.org/3/search/movie');
        searchUrl.searchParams.append('api_key', tmdbApiKey);
        searchUrl.searchParams.append('query', movie.title);

        if (movie.releaseYear) {
          searchUrl.searchParams.append(
            'primary_release_year',
            String(movie.releaseYear)
          );
        }

        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
          return { ...movie, imageUrl: null };
        }

        const data = (await response.json()) as TmdbSearchResponse;
        const topResult = data.results[0];

        // Construct full image URL
        const imageUrl = topResult?.poster_path
          ? `https://image.tmdb.org/t/p/w500${topResult.poster_path}`
          : null;

        return {
          ...movie,
          imageUrl,
        };
      } catch (error) {
        console.error(`Failed to fetch TMDB image for "${movie.title}":`, error);
        return { ...movie, imageUrl: null };
      }
    })
  );

  return enrichedMovies;
};