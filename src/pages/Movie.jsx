import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BsGraphUp,
  BsWallet2,
  BsHourglassSplit,
  BsFillFileEarmarkTextFill,
  BsBookmarkPlus,
  BsBookmarkCheckFill,
  BsPlayBtn,
  BsFillChatQuoteFill,
  BsTv,
  BsShareFill,
  BsCollectionPlay,
  BsListCheck,
  BsEye,
  BsClockHistory,
  BsCheckCircle
} from "react-icons/bs";
import MovieCard from "../components/MovieCard";
import VideoModal from "../components/VideoModal";
import CollectionModal from "../components/CollectionModal";
import { Skeleton } from "../components/Skeleton"; 
import styled from "styled-components";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const profileUrl = "https://image.tmdb.org/t/p/w185/";
const logoUrl = "https://image.tmdb.org/t/p/original/";
const backdropUrl = "https://image.tmdb.org/t/p/original/";

const ReviewItem = ({ review, language }) => {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 300;
  
  const formatContent = (text) => {
    if (!text) return "";
    
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  const isLong = review.content.length > maxChars;
  const rawContent = expanded || !isLong 
    ? review.content 
    : review.content.substring(0, maxChars) + "...";

  return (
    <div className="review-card">
        <div className="review-header">
            {review.author_details?.avatar_path ? (
                 <img 
                    src={review.author_details.avatar_path.startsWith('/http') 
                        ? review.author_details.avatar_path.substring(1) 
                        : profileUrl + review.author_details.avatar_path} 
                    alt={review.author}
                    onError={(e) => {e.target.style.display='none'}} 
                 />
            ) : (
                <div className="avatar-placeholder">{review.author.charAt(0)}</div>
            )}
            <h4>{review.author}</h4>
        </div>
        
        <p 
            className="review-content" 
            dangerouslySetInnerHTML={{ __html: formatContent(rawContent) }}
        />

        {isLong && (
            <button className="read-more-btn" onClick={() => setExpanded(!expanded)}>
                {expanded ? (language === 'pt-BR' ? "Ler menos" : "Read Less") : (language === 'pt-BR' ? "Ler mais" : "Read More")}
            </button>
        )}
    </div>
  );
};

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState(null); 
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionParts, setCollectionParts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const getMovieData = async () => {
      try {
        const movieRes = await api.get(`movie/${id}`);
        setMovie(movieRes.data);
        checkLists(movieRes.data.id); 

        const videoRes = await api.get(`movie/${id}/videos`);
        const videos = videoRes.data.results;
        const trailer = videos.find(
          (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
        );
        if (trailer) setTrailerKey(trailer.key);
        else setTrailerKey(null);

        const creditsRes = await api.get(`movie/${id}/credits`);
        setCast(creditsRes.data.cast.slice(0, 10));

        const recomRes = await api.get(`movie/${id}/recommendations`);
        setRecommendations(recomRes.data.results.slice(0, 6));

        const reviewsRes = await api.get(`movie/${id}/reviews`);
        setReviews(reviewsRes.data.results);

        const providerRes = await api.get(`movie/${id}/watch/providers`);
        if (providerRes.data.results && providerRes.data.results.BR) {
            setProviders(providerRes.data.results.BR);
        } else {
            setProviders(null);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMovieData();
  }, [id, language]);

  const checkLists = (movieId) => {
    const savedFavs = JSON.parse(localStorage.getItem("cineverse_favorites")) || [];
    const hasFav = savedFavs.find((movie) => movie.id === movieId);
    setIsFavorite(!!hasFav);

    const savedWatch = JSON.parse(localStorage.getItem("cineverse_watchlist")) || [];
    const hasWatch = savedWatch.find((movie) => movie.id === movieId);
    setIsWatchlist(!!hasWatch);
  };

  const handleFavorite = () => {
    const savedMovies = JSON.parse(localStorage.getItem("cineverse_favorites")) || [];
    if (isFavorite) {
      const newFiles = savedMovies.filter((m) => m.id !== movie.id);
      localStorage.setItem("cineverse_favorites", JSON.stringify(newFiles));
      setIsFavorite(false);
    } else {
      savedMovies.push(movie);
      localStorage.setItem("cineverse_favorites", JSON.stringify(savedMovies));
      setIsFavorite(true);
    }
  };

  const handleWatchlist = () => {
    const savedMovies = JSON.parse(localStorage.getItem("cineverse_watchlist")) || [];
    if (isWatchlist) {
      const newFiles = savedMovies.filter((m) => m.id !== movie.id);
      localStorage.setItem("cineverse_watchlist", JSON.stringify(newFiles));
      setIsWatchlist(false);
    } else {
      savedMovies.push(movie);
      localStorage.setItem("cineverse_watchlist", JSON.stringify(savedMovies));
      setIsWatchlist(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on CineVerse!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const fetchCollection = async () => {
      if (!movie.belongs_to_collection) return;
      try {
          const res = await api.get(`collection/${movie.belongs_to_collection.id}`);
          setCollectionParts(res.data.parts);
          return res.data.parts;
      } catch (error) {
          console.error(error);
          return [];
      }
  };

  const openCollectionModal = async () => {
      await fetchCollection();
      setShowCollectionModal(true);
  };

  const addCollectionToFavorites = async () => {
      const parts = await fetchCollection();
      if(parts.length === 0) return;

      const savedMovies = JSON.parse(localStorage.getItem("cineverse_favorites")) || [];
      let addedCount = 0;

      parts.forEach(part => {
          const exists = savedMovies.find(m => m.id === part.id);
          if(!exists) {
              savedMovies.push(part);
              addedCount++;
          }
      });

      localStorage.setItem("cineverse_favorites", JSON.stringify(savedMovies));
      alert(language === 'pt-BR' 
        ? `${addedCount} filmes adicionados aos Favoritos!` 
        : `${addedCount} movies added to Favorites!`);
      
      checkLists(movie.id); 
  };

  const formatCurrency = (number) => {
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  if (loading) {
    return (
      <Container>
        <div className="card-column">
             <Skeleton height="500px" mb="1rem" />
             <Skeleton height="50px" />
        </div>
        <div className="info-grid">
             <Skeleton height="40px" width="60%" mb="2rem" />
             <div className="stats-row">
                 <Skeleton height="60px" width="100px" />
                 <Skeleton height="60px" width="100px" />
                 <Skeleton height="60px" width="100px" />
             </div>
             <Skeleton height="150px" mb="2rem" />
             <Skeleton height="200px" />
        </div>
      </Container>
    );
  }

  return (
    <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
      {showTrailerModal && trailerKey && (
        <VideoModal trailerKey={trailerKey} onClose={() => setShowTrailerModal(false)} />
      )}

      {showCollectionModal && (
          <CollectionModal 
            collection={collectionParts} 
            collectionInfo={movie.belongs_to_collection} 
            onClose={() => setShowCollectionModal(false)} 
          />
      )}

      {movie && (
        <>
          <div className="card-column">
            <MovieCard movie={movie} showLink={false} />
            <div className="action-buttons">
                <Button onClick={handleFavorite} $active={isFavorite} $type="fav">
                    {isFavorite ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />}
                    <span>{isFavorite ? (language === 'pt-BR' ? "Salvo" : "Saved") : (language === 'pt-BR' ? "Favoritos" : "Favorites")}</span>
                </Button>

                <Button onClick={handleWatchlist} $active={isWatchlist} $type="watch">
                    {isWatchlist ? <BsCheckCircle /> : <BsClockHistory />}
                    <span>{isWatchlist ? (language === 'pt-BR' ? "Na Lista" : "On List") : (language === 'pt-BR' ? "Quero Ver" : "Watchlist")}</span>
                </Button>

                <ShareButton onClick={handleShare}>
                    <BsShareFill />
                </ShareButton>
            </div>
          </div>

          <div className="info-grid">
            <p className="tagline">{movie.tagline}</p>

            <div className="stats-row">
              <div className="info">
                <h3><BsWallet2 /> {language === 'pt-BR' ? "Orçamento:" : "Budget:"}</h3>
                <p>{formatCurrency(movie.budget)}</p>
              </div>
              <div className="info">
                <h3><BsGraphUp /> {language === 'pt-BR' ? "Receita:" : "Revenue:"}</h3>
                <p>{formatCurrency(movie.revenue)}</p>
              </div>
              <div className="info">
                <h3><BsHourglassSplit /> {language === 'pt-BR' ? "Duração:" : "Runtime:"}</h3>
                <p>{movie.runtime} min</p>
              </div>
            </div>

            <div className="info description">
              <h3><BsFillFileEarmarkTextFill /> {language === 'pt-BR' ? "Sinopse:" : "Overview:"}</h3>
              <p>{movie.overview}</p>
            </div>
            
            {movie.belongs_to_collection && (
                <CollectionBanner background={backdropUrl + movie.belongs_to_collection.backdrop_path}>
                    <div className="collection-info">
                        <h3><BsCollectionPlay /> {language === 'pt-BR' ? "Parte da Coleção" : "Part of the Collection"}</h3>
                        <h2>{movie.belongs_to_collection.name}</h2>
                    </div>
                    <div className="collection-actions">
                        <button className="col-btn view" onClick={openCollectionModal}>
                            <BsEye /> {language === 'pt-BR' ? "Ver Coleção" : "View All"}
                        </button>
                        <button className="col-btn add" onClick={addCollectionToFavorites}>
                            <BsListCheck /> {language === 'pt-BR' ? "Add Todos" : "Add All"}
                        </button>
                    </div>
                </CollectionBanner>
            )}

            {providers && (
                <div className="providers-section">
                    <h3><BsTv /> {language === 'pt-BR' ? "Disponível em (BR):" : "Available on (BR):"}</h3>
                    
                    <div className="providers-container">
                        {providers.flatrate && (
                            <div className="provider-group">
                                <span>Stream:</span>
                                <div className="icons">
                                    {providers.flatrate.map((prov) => (
                                        <img 
                                            key={prov.provider_id} 
                                            src={logoUrl + prov.logo_path} 
                                            alt={prov.provider_name}
                                            title={prov.provider_name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {providers.rent && (
                            <div className="provider-group">
                                <span>{language === 'pt-BR' ? "Alugar:" : "Rent:"}</span>
                                <div className="icons">
                                    {providers.rent.map((prov) => (
                                        <img 
                                            key={prov.provider_id} 
                                            src={logoUrl + prov.logo_path} 
                                            alt={prov.provider_name}
                                            title={prov.provider_name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {!providers.flatrate && !providers.rent && (
                            <p style={{color: '#888'}}>{language === 'pt-BR' ? 'Não disponível para streaming no momento.' : 'Not available for streaming right now.'}</p>
                        )}
                    </div>
                </div>
            )}

            {cast.length > 0 && (
              <div className="cast-section">
                <h3>{language === 'pt-BR' ? "Elenco Principal" : "Top Cast"}</h3>
                <div className="cast-list">
                  {cast.map((actor) => (
                    <Link key={actor.id} to={`/actor/${actor.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                      <div className="actor-card">
                        <img 
                          src={actor.profile_path ? profileUrl + actor.profile_path : "https://via.placeholder.com/100x150?text=No+Img"} 
                          alt={actor.name} 
                        />
                        <p className="actor-name">{actor.name}</p>
                        <p className="character-name">{actor.character}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {trailerKey && (
              <div className="trailer-container">
                <button className="trailer-btn" onClick={() => setShowTrailerModal(true)}>
                    <BsPlayBtn /> {language === 'pt-BR' ? "Assistir Trailer" : "Watch Trailer"}
                </button>
              </div>
            )}
            
            {reviews.length > 0 && (
                <div className="reviews-section">
                    <h3><BsFillChatQuoteFill /> {language === 'pt-BR' ? "Comentários" : "Reviews"}</h3>
                    <div className="reviews-list">
                        {reviews.slice(0, 3).map((review) => (
                            <ReviewItem key={review.id} review={review} language={language} />
                        ))}
                    </div>
                </div>
            )}

            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>{language === 'pt-BR' ? "Você também pode gostar" : "You Might Also Like"}</h3>
                <div className="recommendations-grid">
                  {recommendations.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
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
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;

  @media(min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 3rem;
  }

  .card-column {
    width: 100%;
    max-width: 400px;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    flex-shrink: 0;
  }
  
  .card-column > div {
    width: 100%; 
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .tagline {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: var(--secondary);
    font-style: italic;
    text-align: center;
  }

  .info-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
  }

  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .info h3 {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary);
  }

  .description {
    line-height: 1.6;
    text-align: justify;
  }

  .providers-section h3 {
    color: var(--primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .providers-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--surface);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.05);
  }

  .provider-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      span { font-weight: bold; color: var(--text-gray); min-width: 60px; }
      
      .icons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          
          img {
            width: 45px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            transition: transform 0.2s;
            &:hover { transform: scale(1.1); }
          }
      }
  }

  .cast-section h3 {
    color: var(--primary);
    margin-bottom: 1rem;
  }
  
  .cast-list {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    &::-webkit-scrollbar { height: 8px; }
    &::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 4px; }
    &::-webkit-scrollbar-track { background-color: var(--surface); }
  }

  .actor-card {
    min-width: 100px;
    max-width: 100px;
    text-align: center;
    font-size: 0.9rem;
  }

  .actor-card img {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .actor-name {
    font-weight: bold;
    margin-bottom: 0.2rem;
  }
  
  .character-name {
    color: var(--text-gray);
    font-size: 0.8rem;
  }

  .trailer-container { margin-top: 1rem; }
  
  .trailer-btn {
    background-color: var(--primary);
    border: none;
    border-radius: 4px;
    color: #fff;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: 0.3s;
    font-weight: bold;
  }

  .trailer-btn:hover {
    background-color: var(--secondary);
  }

  .reviews-section { margin-top: 2rem; }
  .reviews-section h3 { color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
  
  .review-card {
    background-color: var(--surface);
    padding: 1.5rem;
    border-radius: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .review-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .review-header img, .avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    background-color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .review-content {
    font-style: italic;
    color: #ccc;
    line-height: 1.5;
    
    strong { color: white; font-weight: bold; }
    em { color: var(--secondary); }
  }

  .read-more-btn {
    background: none;
    border: none;
    color: var(--secondary);
    cursor: pointer;
    font-weight: bold;
    margin-top: 0.5rem;
    padding: 0;
    font-size: 0.9rem;
  }

  .recommendations-section {
    margin-top: 2rem;
    border-top: 1px solid var(--surface);
    padding-top: 2rem;
  }
  .recommendations-section h3 { margin-bottom: 1.5rem; color: var(--secondary); }
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .collection-info h3 {
    color: var(--primary);
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .collection-info h2 {
    font-size: 2rem;
    font-weight: 800;
  }

  .collection-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }

  .col-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      border: none;
      transition: 0.3s;
      width: 140px;
      justify-content: center;
  }

  .col-btn.view {
      background-color: transparent;
      border: 1px solid white;
      color: white;
  }
  .col-btn.view:hover { background-color: white; color: black; }

  .col-btn.add {
      background-color: var(--primary);
      color: white;
  }
  .col-btn.add:hover { background-color: var(--secondary); }

  @media(max-width: 600px) {
      .collection-info h3 { justify-content: center; }
      .collection-actions { flex-direction: row; }
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.8rem;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: 0.3s;
  
  background-color: ${props => props.$active ? '#ffffff' : (props.$type === 'fav' ? 'var(--primary)' : 'var(--surface)')};
  color: ${props => props.$active ? '#000000' : '#ffffff'};
  border: ${props => props.$type === 'watch' && !props.$active ? '1px solid white' : 'none'};
  
  svg {
    font-size: 1.2rem;
    fill: ${props => props.$active ? '#000000' : '#ffffff'};
  }

  &:hover {
    opacity: 0.8;
  }
`;

const ShareButton = styled.button`
  width: 50px;
  background-color: var(--surface);
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: var(--primary);
    color: white;
  }
`;

const CollectionBanner = styled.div`
  width: 100%;
  height: 150px;
  background-image: linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.4)), url(${props => props.background});
  background-size: cover;
  background-position: center;
  border-radius: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  border: 1px solid var(--primary);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);

  @media(max-width: 600px) {
      flex-direction: column;
      height: auto;
      padding: 1.5rem;
      gap: 1rem;
      text-align: center;
  }
`;

export default Movie;