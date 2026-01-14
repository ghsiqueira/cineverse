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
      console.error(error);
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

  .movies-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
`;

export default Home;