import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { BiFilterAlt, BiX, BiInfoCircle, BiPlay, BiSortAlt2, BiCalendar, BiStar } from "react-icons/bi";
import MovieCard from "../components/MovieCard";
import { Skeleton } from "../components/Skeleton";
import VideoModal from "../components/VideoModal"; 
import styled from "styled-components";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';

const imageUrl = import.meta.env.VITE_IMG || "https://image.tmdb.org/t/p/w500/";
const backdropUrl = "https://image.tmdb.org/t/p/original/";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroTrailer, setHeroTrailer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("vote_average.desc");

  const [year, setYear] = useState("");
  
  const [minRating, setMinRating] = useState(0); 
  const [displayRating, setDisplayRating] = useState(0); 

  const { language } = useContext(LanguageContext);
  const observerTarget = useRef(null);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await api.get("genre/movie/list");
        setGenres(response.data.genres);
      } catch (error) { console.error(error); }
    };
    loadGenres();
  }, [language]);

  const fetchHeroExtras = async (movieId) => {
    try {
        const videosRes = await api.get(`movie/${movieId}/videos`);
        const trailer = videosRes.data.results.find(
            (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
        );
        setHeroTrailer(trailer ? trailer.key : null);
    } catch (e) { console.error(e); }
  };

  const fetchMovies = async (pageNumber, genreId = null, sort = "vote_average.desc", yearFilter = "", ratingFilter = 0) => {
    setLoading(true);

    try {
      let endpoint = "discover/movie";
      let params = { 
        page: pageNumber, 
        sort_by: sort,
        "vote_count.gte": 200,
        "vote_average.gte": ratingFilter,
      };

      if (yearFilter) {
          params.primary_release_year = yearFilter;
      }

      if (genreId) {
        params.with_genres = genreId;
      }

      const response = await api.get(endpoint, { params });
      const results = response.data.results;

      if (pageNumber === 1) {
        setMovies(results);
        if (!heroMovie && results.length > 0) {
            const random = results[Math.floor(Math.random() * results.length)];
            setHeroMovie(random);
            fetchHeroExtras(random.id);
        }
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
    setHeroMovie(null); 
    setPage(1);
    fetchMovies(1, selectedGenre, sortBy, year, minRating);
  }, [sortBy, selectedGenre, language, year, minRating]); 

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchMovies(nextPage, selectedGenre, sortBy, year, minRating);
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
  }, [loading, selectedGenre, sortBy, language, year, minRating]); 

  const handleGenreClick = (genreId) => {
    setSelectedGenre(selectedGenre === genreId ? null : genreId);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleRatingCommit = () => {
      setMinRating(displayRating);
  };

  return (
    <Container>
      {showModal && heroTrailer && (
        <VideoModal trailerKey={heroTrailer} onClose={() => setShowModal(false)} />
      )}

      {heroMovie && (
        <HeroSection background={backdropUrl + heroMovie.backdrop_path}>
          <div className="hero-content">
            <h1>{heroMovie.title}</h1>
            <p className="overview">{heroMovie.overview}</p>
            
            <div className="buttons">
              <button onClick={() => setShowModal(true)} className="btn-secondary">
                <BiPlay /> {language === 'pt-BR' ? 'Trailer' : 'Trailer'}
              </button>

              <Link to={`/movie/${heroMovie.id}`} className="btn-outline">
                <BiInfoCircle /> {language === 'pt-BR' ? 'Mais Detalhes' : 'More Info'}
              </Link>
            </div>
          </div>
          <div className="hero-fade"></div>
        </HeroSection>
      )}

      <MainContent>
        <div className="header-toolbar">
          <div className="header-left">
            <h2 className="section-title">
                {selectedGenre 
                ? genres.find(g => g.id === selectedGenre)?.name 
                : (language === 'pt-BR' ? "Explorar Filmes" : "Explore Movies")}
            </h2>
          </div>

          <div className="header-actions">
            <div className="sort-container">
                <BiSortAlt2 className="sort-icon"/>
                <select value={sortBy} onChange={handleSortChange}>
                    <option value="popularity.desc">{language === 'pt-BR' ? "Mais Populares" : "Most Popular"}</option>
                    <option value="vote_average.desc">{language === 'pt-BR' ? "Melhores Avaliados" : "Top Rated"}</option>
                    <option value="primary_release_date.desc">{language === 'pt-BR' ? "Lançamentos" : "Newest"}</option>
                </select>
            </div>

            <button 
                className="filter-btn" 
                onClick={() => setShowFilters(!showFilters)}
            >
                {showFilters ? <BiX /> : <BiFilterAlt />} {language === 'pt-BR' ? "Filtrar" : "Filter"}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel fade-in">
             <div className="advanced-filters">
                <div className="filter-group">
                    <label><BiCalendar /> {language === 'pt-BR' ? "Ano:" : "Year:"}</label>
                    <input 
                        type="number" 
                        placeholder="Ex: 2023"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label><BiStar /> {language === 'pt-BR' ? `Nota Mínima: ${displayRating}` : `Min Rating: ${displayRating}`}</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={displayRating}
                        onChange={(e) => setDisplayRating(e.target.value)}
                        onMouseUp={handleRatingCommit} 
                        onTouchEnd={handleRatingCommit} 
                    />
                </div>
             </div>

             <div className="genres-list">
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
  height: 85vh;
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
    flex-wrap: wrap;
  }

  button, a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 2rem;
    border-radius: 50px;
    font-weight: bold;
    font-size: 1.1rem;
    transition: 0.3s;
    cursor: pointer;
    border: none;
    text-decoration: none;
    color: white;
  }

  .btn-secondary {
    background-color: white;
    color: black;
  }
  .btn-secondary:hover { transform: scale(1.05); }

  .btn-outline {
    background-color: rgba(0, 0, 0, 0.6);
    border: 1px solid white;
  }
  .btn-outline:hover { background-color: white; color: black; }

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
    height: 70vh;
    h1 { font-size: 2.5rem; }
    .overview { font-size: 1rem; }
    .buttons { gap: 0.5rem; }
    button, a { padding: 0.6rem 1rem; font-size: 0.9rem; }
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  position: relative;
  z-index: 2;

  .header-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem 0;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-title {
    font-size: 2rem;
    color: var(--text-white);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .sort-container {
    display: flex;
    align-items: center;
    background-color: var(--surface);
    border-radius: 20px;
    padding: 0.3rem 1rem;
    border: 1px solid var(--text-gray);
  }

  .sort-icon {
    font-size: 1.2rem;
    color: var(--primary);
    margin-right: 0.5rem;
  }

  select {
    background: transparent;
    border: none;
    color: var(--text-white);
    font-size: 0.9rem;
    outline: none;
    cursor: pointer;
  }

  select option {
    background-color: var(--surface);
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

  .filters-panel {
    background-color: var(--surface);
    padding: 1.5rem;
    border-radius: 1rem;
    margin-bottom: 2rem;
    border: 1px solid var(--primary);
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  .advanced-filters {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }

  .filter-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: bold;
      color: var(--primary);
  }

  .filter-group input[type="number"] {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--text-gray);
      background: var(--background);
      color: white;
      width: 120px;
  }

  .filter-group input[type="range"] {
      accent-color: var(--primary);
      width: 200px;
      cursor: pointer;
  }

  .genres-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
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
  
  @media(max-width: 600px) {
    .header-toolbar {
        flex-direction: column;
        align-items: flex-start;
    }
    .header-actions {
        width: 100%;
        justify-content: space-between;
    }
    .advanced-filters {
        flex-direction: column;
        gap: 1rem;
    }
    .filter-group input[type="range"] { width: 100%; }
  }
`;

export default Home;