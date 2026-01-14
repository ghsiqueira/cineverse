import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import styled from 'styled-components';
import api from '../services/api';

const Home = () => {
  const [topMovies, setTopMovies] = useState([]);

  const getTopRatedMovies = async () => {
    try {
      const response = await api.get("movie/top_rated");
      setTopMovies(response.data.results);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    getTopRatedMovies();
  }, []);

  return (
    <Container>
      <h2 className="title">Best Movies</h2>
      <div className="movies-container">
        {topMovies.length === 0 && <p>Loading...</p>}
        {topMovies.length > 0 && 
          topMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
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

  .title span {
    color: var(--primary);
  }

  .movies-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media(max-width: 768px) {
    .movies-container {
      justify-content: center;
    }
  }
`;

export default Home;