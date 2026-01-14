import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import styled from 'styled-components';

const imageUrl = import.meta.env.VITE_IMG || "https://image.tmdb.org/t/p/w500/";

const MovieCard = ({ movie, showLink = true }) => {
  return (
    <Card>
      <img src={imageUrl + movie.poster_path} alt={movie.title} />
      <h2>{movie.title}</h2>
      <p>
        <FaStar /> {movie.vote_average}
      </p>
      {showLink && <Link to={`/movie/${movie.id}`}>Details</Link>}
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

  img {
    width: 100%;
    max-width: 100%;
    border-radius: 1rem;
    margin-bottom: 1rem;
    object-fit: cover;
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
    justify-content: flex-start;
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