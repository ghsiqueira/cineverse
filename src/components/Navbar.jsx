import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiCameraMovie, BiSearchAlt2, BiMenu, BiX } from 'react-icons/bi';
import styled from 'styled-components';
import api from '../services/api';

const imageUrl = import.meta.env.VITE_IMG || "https://image.tmdb.org/t/p/w500/";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Novo estado para o Menu Mobile
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length > 2) {
        try {
          const response = await api.get(`search/movie?query=${search}`);
          setSuggestions(response.data.results.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    navigate(`/search?q=${search}`);
    setSearch("");
    setShowSuggestions(false);
    setIsMenuOpen(false); // Fecha o menu ao buscar
  };

  const handleSuggestionClick = (id) => {
    navigate(`/movie/${id}`);
    setSearch("");
    setShowSuggestions(false);
    setIsMenuOpen(false);
  };

  return (
    <Nav>
      <div className="nav-header">
        <h2>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <BiCameraMovie /> CineVerse
            </Link>
        </h2>
        {/* Botão do Menu Mobile */}
        <button className="mobile-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <BiX /> : <BiMenu />}
        </button>
      </div>

      <div className={`nav-content ${isMenuOpen ? "open" : ""}`}>
        <Link to="/favorites" className="fav-link" onClick={() => setIsMenuOpen(false)}>
            Favorites
        </Link>
        
        <div className="search-container">
            <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Search for a movie..." 
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => search.length > 2 && setShowSuggestions(true)}
            />
            <button type="submit" className="search-btn">
                <BiSearchAlt2 />
            </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
                {suggestions.map((movie) => (
                <li key={movie.id} onClick={() => handleSuggestionClick(movie.id)}>
                    <img 
                    src={movie.poster_path ? imageUrl + movie.poster_path : "https://via.placeholder.com/50x75?text=Img"} 
                    alt={movie.title} 
                    />
                    <div className="suggestion-info">
                        <span className="suggestion-title">{movie.title}</span>
                        <span className="suggestion-year">
                        {movie.release_date ? movie.release_date.split('-')[0] : "-"}
                        </span>
                    </div>
                </li>
                ))}
            </ul>
            )}
        </div>
      </div>
    </Nav>
  );
};

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--surface);
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  position: relative;
  z-index: 10;

  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: auto;
  }

  h2 a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary);
    font-size: 1.5rem;
    font-weight: bold;
    transition: 0.3s;
  }

  h2 a:hover {
    color: var(--secondary);
  }

  .mobile-btn {
    display: none;
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--text-white);
    cursor: pointer;
  }

  .nav-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex: 1;
    justify-content: flex-end;
  }

  .fav-link {
    font-weight: bold;
    color: var(--text-white);
    transition: 0.3s;
  }
  
  .fav-link:hover {
    color: var(--secondary);
  }

  .search-container {
    position: relative;
  }

  form {
    display: flex;
    gap: 0.5rem;
  }

  input {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    background-color: var(--background);
    color: var(--text-white);
    outline: none;
    font-size: 1rem;
    border: 1px solid transparent;
    transition: 0.3s;
    width: 300px;
  }

  input:focus {
    border-color: var(--secondary);
  }

  .search-btn {
    background-color: var(--primary);
    border: 2px solid var(--primary);
    border-radius: 4px;
    color: #fff;
    padding: 0.3rem 0.8rem;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: 0.4s;
  }

  .search-btn:hover {
    background-color: transparent;
    color: var(--primary);
  }

  .suggestions-list {
    position: absolute;
    top: 110%;
    left: 0;
    width: 100%;
    background-color: var(--surface);
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    list-style: none;
    overflow: hidden;
    z-index: 20;
    border: 1px solid var(--primary);
  }

  .suggestions-list li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    transition: 0.2s;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .suggestions-list li:last-child {
    border-bottom: none;
  }

  .suggestions-list li:hover {
    background-color: var(--primary);
  }

  .suggestions-list img {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .suggestion-info {
    display: flex;
    flex-direction: column;
  }

  .suggestion-title {
    font-weight: bold;
    font-size: 0.9rem;
    color: var(--text-white);
  }

  .suggestion-year {
    font-size: 0.8rem;
    color: var(--text-gray);
  }

  /* MEDIA QUERIES PARA MOBILE */
  @media(max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;

    .nav-header {
      width: 100%;
      justify-content: space-between;
    }

    .mobile-btn {
      display: block;
    }

    .nav-content {
      display: none;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-top: 1rem;
      gap: 1.5rem;
    }

    /* Classe ativada pelo JS */
    .nav-content.open {
      display: flex;
      animation: slideDown 0.3s ease;
    }

    input {
      width: 100%;
    }
    
    .search-container {
      width: 100%;
    }
    
    form {
      width: 100%;
    }
    
    input {
      flex: 1;
    }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default Navbar;