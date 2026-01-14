import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiCameraMovie, BiSearchAlt2 } from 'react-icons/bi';
import styled from 'styled-components';
import api from '../services/api';

const imageUrl = import.meta.env.VITE_IMG || "https://image.tmdb.org/t/p/w500/";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  };

  const handleSuggestionClick = (id) => {
    navigate(`/movie/${id}`);
    setSearch("");
    setShowSuggestions(false);
  };

  return (
    <Nav>
      <h2>
        <Link to="/">
          <BiCameraMovie /> CineVerse
        </Link>
      </h2>
      <Link to="/favorites" className="fav-link">
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
          <button type="submit">
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

  .fav-link {
    margin-right: auto; 
    margin-left: 2rem;
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

  button {
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

  button:hover {
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

  @media(max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    
    .fav-link {
        margin: 0;
    }

    input {
        width: 100%;
    }
    
    .search-container {
        width: 100%;
    }
  }
`;

export default Navbar;