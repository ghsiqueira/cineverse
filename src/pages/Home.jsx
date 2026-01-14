import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiFilterAlt, BiX, BiInfoCircle, BiPlay } from "react-icons/bi";
import MovieCard from "../components/MovieCard";
import { Skeleton } from "../components/Skeleton";
import styled from "styled-components";
import api from "../services/api";

const imageUrl = import.meta.env.VITE_IMG || "https://image.tmdb.org/t/p/w500/";
const backdropUrl = "https://image.tmdb.org/t/p/original/";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const observerTarget = useRef(null);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await api.get("genre/movie/list");
        setGenres(response.data.genres);
      } catch (error) { console.error(error); }
    };
    loadGenres();
  }, []);

  const fetchMovies = async (pageNumber, genreId = null) => {
    setLoading(true);

    try {
      let endpoint = "movie/top_rated";
      let params = { page: pageNumber };

      if (genreId) {
        endpoint = "discover/movie";
        params = { page: pageNumber, with_genres: genreId, sort_by: "popularity.desc" };
      }

      const response = await api.get(endpoint, { params });
      const results = response.data.results;

      if (pageNumber === 1) {
        setMovies(results);
        const random = results[Math.floor(Math.random() * results.length)];
        setHeroMovie(random);
      } else {
        setMovies((prev) => {
          const newMovies = results.filter(movie => !prev.some(p => p.id === movie.id));
          return [...prev, ...newMovies];
        });
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies(1, null);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchMovies(nextPage, selectedGenre);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, selectedGenre]); 

  const handleGenreClick = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      setPage(1);
      fetchMovies(1, null);
    } else {
      setSelectedGenre(genreId);
      setPage(1);
      fetchMovies(1, genreId);
    }
  };

  return (
    <Container>
      {heroMovie && (
        <HeroSection background={backdropUrl + heroMovie.backdrop_path}>
          <div className="hero-content">
            <h1>{heroMovie.title}</h1>
            <p className="overview">{heroMovie.overview}</p>
            <div className="buttons">
              <Link to={`/movie/${heroMovie.id}`} className="btn-primary">
                <BiPlay /> Watch Now
              </Link>
              <Link to={`/movie/${heroMovie.id}`} className="btn-secondary">
                <BiInfoCircle /> More Info
              </Link>
            </div>
          </div>
          <div className="hero-fade"></div>
        </HeroSection>
      )}

      <MainContent>
        <div className="header-filter">
          <h2 className="section-title">
            {selectedGenre 
              ? genres.find(g => g.id === selectedGenre)?.name 
              : "Trending Now"}
          </h2>
          
          <button 
            className="filter-btn" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <BiX /> : <BiFilterAlt />} Filter
          </button>
        </div>

        {showFilters && (
          <div className="genres-list fade-in">
            {genres.map((genre) => (
              <button 
                key={genre.id} 
                onClick={() => handleGenreClick(genre.id)}
                className={selectedGenre === genre.id ? "active" : ""}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        <div className="movies-container">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}

          {loading && Array(4).fill(0).map((_, index) => (
             <div key={index} style={{ height: '450px', background: 'var(--surface)', borderRadius: '1rem', padding: '1rem' }}>
                <Skeleton height="300px" mb="1rem" />
                <Skeleton height="30px" mb="1rem" />
                <Skeleton height="20px" width="50%" />
             </div>
          ))}
        </div>

        <div ref={observerTarget} style={{ height: '20px', margin: '1rem 0' }}></div>
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeroSection = styled.div`
  height: 80vh;
  width: 100%;
  background-image: url(${props => props.background});
  background-size: cover;
  background-position: center top;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 5%;

  .hero-content {
    z-index: 2;
    max-width: 600px;
    animation: slideUp 1s ease;
  }

  h1 {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 5px rgba(0,0,0,0.8);
  }

  .overview {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .buttons {
    display: flex;
    gap: 1rem;
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 2rem;
    border-radius: 4px;
    font-weight: bold;
    font-size: 1.2rem;
    transition: 0.3s;
  }

  .btn-primary {
    background-color: var(--primary);
    color: white;
  }
  .btn-primary:hover { background-color: var(--secondary); }

  .btn-secondary {
    background-color: rgba(100, 100, 100, 0.7);
    color: white;
  }
  .btn-secondary:hover { background-color: rgba(100, 100, 100, 0.9); }

  .hero-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(transparent, var(--background));
    z-index: 1;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media(max-width: 768px) {
    height: 60vh;
    h1 { font-size: 2.5rem; }
    .overview { font-size: 1rem; }
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  position: relative;
  z-index: 2;

  .header-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem 0;
  }

  .section-title {
    font-size: 2rem;
    color: var(--text-white);
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid var(--text-gray);
    color: var(--text-white);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: 0.3s;
  }

  .filter-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .genres-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: var(--surface);
    border-radius: 1rem;
  }
  
  .fade-in { animation: fadeIn 0.5s ease-in; }

  .genres-list button {
    background-color: var(--background);
    color: var(--text-white);
    border: 1px solid var(--text-gray);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    transition: 0.3s;
  }

  .genres-list button:hover, .genres-list button.active {
    background-color: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }

  .movies-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
    padding-bottom: 2rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default Home;