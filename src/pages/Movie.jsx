import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BsGraphUp,
  BsWallet2,
  BsHourglassSplit,
  BsFillFileEarmarkTextFill,
  BsBookmarkPlus,
  BsBookmarkCheckFill,
  BsPlayBtn
} from 'react-icons/bs';
import MovieCard from '../components/MovieCard';
import styled from 'styled-components';
import api from '../services/api';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const getMovieData = async () => {
      try {
        const movieRes = await api.get(`movie/${id}`);
        setMovie(movieRes.data);
        checkFavorite(movieRes.data.id);

        const videoRes = await api.get(`movie/${id}/videos`);
        const videos = videoRes.data.results;
        
        const trailer = videos.find(
          (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
        );

        if (trailer) {
          setTrailerKey(trailer.key);
        }

      } catch (error) {
        console.error(error);
      }
    };
    getMovieData();
  }, [id]);

  const checkFavorite = (movieId) => {
    const savedMovies = JSON.parse(localStorage.getItem('cineverse_favorites')) || [];
    const hasMovie = savedMovies.find((movie) => movie.id === movieId);
    if (hasMovie) setIsFavorite(true);
  };

  const handleFavorite = () => {
    const savedMovies = JSON.parse(localStorage.getItem('cineverse_favorites')) || [];

    if (isFavorite) {
      const newFiles = savedMovies.filter((m) => m.id !== movie.id);
      localStorage.setItem('cineverse_favorites', JSON.stringify(newFiles));
      setIsFavorite(false);
    } else {
      savedMovies.push(movie);
      localStorage.setItem('cineverse_favorites', JSON.stringify(savedMovies));
      setIsFavorite(true);
    }
  };

  const formatCurrency = (number) => {
    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <Container>
      {movie && (
        <>
          <div className="card-column">
            <MovieCard movie={movie} showLink={false} />
            <Button onClick={handleFavorite} $isFavorite={isFavorite}>
               {isFavorite ? <><BsBookmarkCheckFill /> Saved</> : <><BsBookmarkPlus /> Add to Favorites</>}
            </Button>
          </div>
          
          <div className="info-grid">
            <p className="tagline">{movie.tagline}</p>
            
            <div className="info">
              <h3><BsWallet2 /> Budget:</h3>
              <p>{formatCurrency(movie.budget)}</p>
            </div>

            <div className="info">
              <h3><BsGraphUp /> Revenue:</h3>
              <p>{formatCurrency(movie.revenue)}</p>
            </div>

            <div className="info">
              <h3><BsHourglassSplit /> Runtime:</h3>
              <p>{movie.runtime} minutes</p>
            </div>

            <div className="info description">
              <h3><BsFillFileEarmarkTextFill /> Overview:</h3>
              <p>{movie.overview}</p>
            </div>

            {trailerKey && (
              <div className="trailer-container">
                <h3><BsPlayBtn /> Watch Trailer:</h3>
                <div className="video-responsive">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
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
  max-width: 900px; /* Aumentei um pouco a largura */
  margin: 2rem auto;
  padding: 0 1rem;

  .card-column {
    width: 400px;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  @media(max-width: 500px) {
    .card-column {
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
    color: var(--primary);
  }

  .description {
    margin-top: 1rem;
    line-height: 1.6;
    text-align: justify;
  }

  /* CSS do Trailer Responsivo */
  .trailer-container {
    margin-top: 2rem;
  }

  .trailer-container h3 {
    margin-bottom: 1rem;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .video-responsive {
    overflow: hidden;
    padding-bottom: 56.25%; /* Proporção 16:9 */
    position: relative;
    height: 0;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    background-color: #000;
  }

  .video-responsive iframe {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    position: absolute;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: 0.3s;
  background-color: ${props => props.$isFavorite ? '#ffffff' : 'var(--primary)'};
  color: ${props => props.$isFavorite ? '#000000' : '#ffffff'};
  
  &:hover {
    opacity: 0.8;
  }
`;

export default Movie;