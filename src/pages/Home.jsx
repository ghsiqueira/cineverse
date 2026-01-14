import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import styled from 'styled-components';
import api from '../services/api';

const Home = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [page, setPage] = useState(1); 
  const [loading, setLoading] = useState(false); 

  const getTopRatedMovies = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await api.get(`movie/top_rated?page=${pageNumber}`);
      
      if (pageNumber === 1) {
        setTopMovies(response.data.results);
      } else {
        setTopMovies((prevMovies) => [...prevMovies, ...response.data.results]);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getTopRatedMovies(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getTopRatedMovies(nextPage);
  };

  return (
    <Container>
      <h2 className="title">Best Movies</h2>
      
      <div className="movies-container">
        {topMovies.length === 0 && <p>Loading...</p>}
        {topMovies.length > 0 && 
          topMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>

      {topMovies.length > 0 && (
        <div className="button-container">
          <button onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
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

  .movies-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .button-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  button {
    background-color: var(--primary);
    border: 2px solid var(--primary);
    border-radius: 30px; /* Botão arredondado */
    color: #fff;
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
  }

  button:hover:not(:disabled) {
    background-color: transparent;
    color: var(--primary);
    transform: scale(1.05);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Home;