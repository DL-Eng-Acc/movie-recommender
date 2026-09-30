import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enrichMoviesWithImages, RecommendedMovie } from './tmdb.services';

describe('enrichMoviesWithImages Service', () => {
  const originalEnv = process.env;

  const mockMovies: RecommendedMovie[] = [
    {
      title: 'Inception',
      releaseYear: 2010,
      justification: 'Mind-bending sci-fi thriller.',
    },
    {
      title: 'Interstellar',
      releaseYear: 2014,
      justification: 'Epic space exploration.',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    // Set a mock TMDB_API_KEY environment variable for test cases
    process.env = { ...originalEnv, VITE_TMDB_API_KEY: 'mock-tmdb-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Success Cases', () => {
    it('appends poster URLs when TMDB API returns valid matching movies', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              results: [{ poster_path: '/inception-poster.jpg', id: 603 }],
            }),
            { status: 200 }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              results: [{ poster_path: '/interstellar-poster.jpg', id: 157336 }],
            }),
            { status: 200 }
          )
        );

      const result = await enrichMoviesWithImages(mockMovies);

      expect(fetch).toHaveBeenCalledTimes(2);

      // Verify the query URL constructed for the first movie
      const firstCallUrl = new URL((fetch as any).mock.calls[0][0]);
      expect(firstCallUrl.origin + firstCallUrl.pathname).toBe(
        'https://api.themoviedb.org/3/search/movie'
      );
      expect(firstCallUrl.searchParams.get('api_key')).toBe('mock-tmdb-api-key');
      expect(firstCallUrl.searchParams.get('query')).toBe('Inception');
      expect(firstCallUrl.searchParams.get('primary_release_year')).toBe('2010');

      // Verify enriched output
      expect(result).toEqual([
        {
          title: 'Inception',
          releaseYear: 2010,
          justification: 'Mind-bending sci-fi thriller.',
          imageUrl: 'https://image.tmdb.org/t/p/w500/inception-poster.jpg',
          movieId: '603'
        },
        {
          title: 'Interstellar',
          releaseYear: 2014,
          justification: 'Epic space exploration.',
          imageUrl: 'https://image.tmdb.org/t/p/w500/interstellar-poster.jpg',
          movieId: '157336'
        },
      ]);
    });

    it('handles movies missing a releaseYear by querying without primary_release_year', async () => {
      const movieWithoutYear: RecommendedMovie[] = [
        { title: 'The Matrix', releaseYear: '', justification: 'Classic action.' },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [{ poster_path: '/matrix-poster.jpg' }],
          }),
          { status: 200 }
        )
      );

      const result = await enrichMoviesWithImages(movieWithoutYear);

      const calledUrl = new URL((fetch as any).mock.calls[0][0]);
      expect(calledUrl.searchParams.has('primary_release_year')).toBe(false);
      expect(result[0].imageUrl).toBe(
        'https://image.tmdb.org/t/p/w500/matrix-poster.jpg'
      );
    });
  });

  describe('Edge & Missing Data Cases', () => {
    it('returns imageUrl as null when TMDB_API_KEY is not configured', async () => {
      delete process.env.VITE_TMDB_API_KEY;
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const result = await enrichMoviesWithImages(mockMovies);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result).toEqual([
        { ...mockMovies[0], imageUrl: null, movieId: "" },
        { ...mockMovies[1], imageUrl: null, movieId: "" },
      ]);
    });

    it('returns imageUrl as null when TMDB search yields no results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ results: [] }), { status: 200 })
      );

      const result = await enrichMoviesWithImages(mockMovies);

      expect(result[0].imageUrl).toBeNull();
      expect(result[1].imageUrl).toBeNull();
    });

    it('returns imageUrl as null when the top result has poster_path set to null', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [{ poster_path: null }],
          }),
          { status: 200 }
        )
      );

      const result = await enrichMoviesWithImages(mockMovies);

      expect(result[0].imageUrl).toBeNull();
    });
  });

  describe('Error Cases', () => {
    it('returns imageUrl as null when TMDB returns an HTTP error status code (e.g. 401, 500)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ status_message: 'Invalid API key' }), {
          status: 401,
        })
      );

      const result = await enrichMoviesWithImages(mockMovies);

      expect(result[0].imageUrl).toBeNull();
      expect(result[1].imageUrl).toBeNull();
    });

    it('returns imageUrl as null when fetch throws a network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new TypeError('Failed to fetch / Network connection lost')
      );

      const result = await enrichMoviesWithImages(mockMovies);

      expect(result[0].imageUrl).toBeNull();
      expect(result[1].imageUrl).toBeNull();
    });
  });
});