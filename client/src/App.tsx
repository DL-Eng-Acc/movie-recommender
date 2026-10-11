import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import SearchBar from "./components/SearchBar.tsx";
import SearchResultsList from "./components/SearchResultsList.tsx";
import FilterPanel from "./components/FilterPanel.tsx";
import { useMovieResults } from "./hooks/useMovieResults.ts";
import type { Movie } from "./types/movie.ts";
import type { DiscoverFilters } from "./api/discoverMovies";
import RandomButton from "./components/RandomButton.tsx";
import { CURRENT_YEAR, MIN_YEAR } from "./constants/filters";
import {
  readStoredFilters,
  readStoredQuery,
  writeStoredFilters,
  writeStoredQuery,
} from "./utils/searchStorage";

function App() {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>(() => readStoredQuery());
  const [filters, setFilters] = useState<DiscoverFilters>(() => readStoredFilters());

  const { movies, isLoading, hasSearched, hasMore, loadMore } = useMovieResults(
    query,
    filters,
  );

  useEffect(() => {
    writeStoredQuery(query);
  }, [query]);

  useEffect(() => {
    writeStoredFilters(filters);
  }, [filters]);

  const handleMovieClick = (movie: Movie) => {
    void navigate(`/movie/${movie.id}`);
  };

  const hasActiveFilters =
    filters.genre !== undefined ||
    filters.ratingMin !== undefined ||
    filters.castId !== undefined ||
    (filters.yearFrom !== undefined && filters.yearFrom !== MIN_YEAR) ||
    (filters.yearTo !== undefined && filters.yearTo !== CURRENT_YEAR);

  return (
    <section id="search-page">
      <SearchBar
        onQueryChange={setQuery}
        isLoading={isLoading}
        initialValue={query}
      />
      <RandomButton />
      <button
        type="button"
        className="filter-toggle"
        onClick={() => setShowFilters((v) => !v)}
        aria-expanded={showFilters}
      >
        <span
          className="filter-toggle__icon"
          style={{ transform: showFilters ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
        Filters
        {hasActiveFilters && (
          <span className="filter-toggle__dot" aria-label="Filters active" />
        )}
      </button>

      <div
        className={`filter-panel-wrap ${showFilters ? "filter-panel-wrap--open" : ""}`}
      >
        <FilterPanel
          onFiltersChange={setFilters}
          searchActive={query.length > 0}
        />
      </div>

      <SearchResultsList
        movies={movies}
        isLoading={isLoading}
        hasSearched={hasSearched}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onMovieClick={handleMovieClick}
      />
    </section>
  );
}

export default App;
