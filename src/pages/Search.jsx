import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import styled from "styled-components";
import api from "../services/api";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const query = searchParams.get("q");

  const getSearchedMovies = async (url) => {
    try {
      const response = await api.get(url);
      setMovies(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const searchWithQueryURL = `search/movie?query=${query}`;
    getSearchedMovies(searchWithQueryURL);
  }, [query]);

  return (
    <Container>
      <h2 className="title">
        Results for: <span className="query-text">{query}</span>
      </h2>
      <div className="movies-container">
        {movies.length === 0 && <p>Loading...</p>}
        {movies.length > 0 &&
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </Container>
  );
};

const Container = styled.div`
  .title {
    font-size: 2.5rem;
    text-align: center;
    margin: 2rem 0 1rem;
    color: var(--text-white);
  }

  .query-text {
    color: var(--primary);
    text-transform: uppercase;
  }

  .movies-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
`;

export default Search;