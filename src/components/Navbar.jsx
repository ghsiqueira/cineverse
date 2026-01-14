import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiCameraMovie, BiSearchAlt2 } from 'react-icons/bi';
import styled from 'styled-components';

const Navbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    navigate(`/search?q=${search}`);
    setSearch("");
  };

  return (
    <Nav>
      <h2>
        <Link to="/">
          <BiCameraMovie /> CineVerse
        </Link>
      </h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Search for a movie..." 
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <button type="submit">
          <BiSearchAlt2 />
        </button>
      </form>
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

  h2 a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary); /* Violeta do nosso tema */
    font-size: 1.5rem;
    font-weight: bold;
    transition: 0.3s;
  }

  h2 a:hover {
    color: var(--secondary);
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
`;

export default Navbar;