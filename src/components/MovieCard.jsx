import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import styled from 'styled-components';
import { Skeleton } from './Skeleton'; 
import { LanguageContext } from '../context/LanguageContext';

const imageUrl = import.meta.env.VITE_IMG || "https://image.tmdb.org/t/p/w500/";

const MovieCard = ({ movie, showLink = true }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { language } = useContext(LanguageContext);

  const isSeries = movie.name && !movie.title; 
  const title = movie.title || movie.name;
  const linkPath = isSeries ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <Card>
      <div className="img-container">
        {!imageLoaded && <Skeleton height="330px" mb="1rem" />}
        
        <img 
          src={movie.poster_path ? imageUrl + movie.poster_path : "https://via.placeholder.com/500x750?text=No+Img"} 
          alt={title} 
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>

      <h2>{title}</h2>
      
      <p>
        <FaStar /> {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
      </p>
      
      {showLink && (
        <Link to={linkPath}>
            {language === 'pt-BR' ? 'Detalhes' : 'Details'}
        </Link>
      )}
    </Card>
  );
};

const Card = styled.div`
  width: 100%;
  color: var(--text-white);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--surface);
  padding: 1rem;
  border-radius: 1rem;
  transition: transform 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  height: 100%;

  &:hover {
    transform: scale(1.03);
    border: 1px solid var(--primary);
  }

  .img-container {
    min-height: 300px; 
    margin-bottom: 1rem;
  }

  img {
    width: 100%;
    border-radius: 1rem;
    object-fit: cover;
    animation: fadeIn 0.5s;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  p {
    margin-bottom: 1rem;
    color: var(--secondary);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: bold;
  }

  a {
    background-color: var(--primary);
    border: 2px solid var(--primary);
    border-radius: 4px;
    color: #fff;
    padding: 1rem 0.5rem;
    text-align: center;
    font-weight: bold;
    transition: 0.3s;
    margin-top: auto;
  }

  a:hover {
    background-color: transparent;
    color: var(--primary);
  }
`;

export default MovieCard;