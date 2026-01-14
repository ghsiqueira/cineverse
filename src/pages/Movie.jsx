import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BsGraphUp,
  BsWallet2,
  BsHourglassSplit,
  BsFillFileEarmarkTextFill,
} from 'react-icons/bs';
import MovieCard from '../components/MovieCard';
import styled from 'styled-components';
import api from '../services/api';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  const getMovie = async (url) => {
    try {
      const response = await api.get(url);
      setMovie(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (number) => {
    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  useEffect(() => {
    const movieUrl = `movie/${id}`;
    getMovie(movieUrl);
  }, [id]);

  return (
    <Container>
      {movie && (
        <>
          <MovieCard movie={movie} showLink={false} />
          
          <div className="info-grid">
            <p className="tagline">{movie.tagline}</p>
            
            <div className="info">
              <h3>
                <BsWallet2 /> Budget:
              </h3>
              <p>{formatCurrency(movie.budget)}</p>
            </div>

            <div className="info">
              <h3>
                <BsGraphUp /> Revenue:
              </h3>
              <p>{formatCurrency(movie.revenue)}</p>
            </div>

            <div className="info">
              <h3>
                <BsHourglassSplit /> Runtime:
              </h3>
              <p>{movie.runtime} minutes</p>
            </div>

            <div className="info description">
              <h3>
                <BsFillFileEarmarkTextFill /> Overview:
              </h3>
              <p>{movie.overview}</p>
            </div>
          </div>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  color: var(--text-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;

  /* Estiliza o Card reutilizado para ficar maior nesta tela */
  div:first-child {
    width: 400px;
    margin-bottom: 2rem;
  }
  
  @media(max-width: 500px) {
    div:first-child {
      width: 100%;
    }
  }

  .tagline {
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: var(--secondary);
    font-style: italic;
  }

  .info-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .info h3 {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary); /* Violeta */
  }

  .description {
    margin-top: 1rem;
    line-height: 1.6;
    text-align: justify;
  }
`;

export default Movie;