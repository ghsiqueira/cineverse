import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import styled from 'styled-components';
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const Watchlist = () => {
  const [movies, setMovies] = useState([]);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem('cineverse_watchlist')) || [];
    setMovies(savedMovies);
  }, []);

  return (
    <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
      <h2 className="title">{language === 'pt-BR' ? 'Minha Lista (Quero Ver)' : 'My Watchlist'}</h2>
      <div className="movies-container">
        {movies.length === 0 && (
          <div className="empty-state">
            <p>{language === 'pt-BR' ? 'Sua lista está vazia.' : 'Your watchlist is empty.'}</p>
            <Link to="/" className="back-link">
                {language === 'pt-BR' ? 'Ir para o Início' : 'Go to Home'}
            </Link>
          </div>
        )}
        
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

  .movies-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .empty-state {
    width: 100%;
    text-align: center;
    margin-top: 3rem;
    grid-column: 1 / -1;
  }

  .empty-state p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: var(--text-gray);
  }

  .back-link {
    color: var(--primary);
    font-weight: bold;
    font-size: 1.1rem;
    text-decoration: underline;
  }
`;

export default Watchlist;