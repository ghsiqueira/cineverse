import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BsGraphUp,
  BsFillFileEarmarkTextFill,
  BsBookmarkPlus,
  BsBookmarkCheckFill,
  BsPlayBtn,
  BsTv,
  BsShareFill,
  BsCalendarCheck
} from "react-icons/bs";
import MovieCard from "../components/MovieCard";
import VideoModal from "../components/VideoModal";
import { Skeleton } from "../components/Skeleton"; 
import styled from "styled-components";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const profileUrl = "https://image.tmdb.org/t/p/w185/";
const logoUrl = "https://image.tmdb.org/t/p/original/";
const backdropUrl = "https://image.tmdb.org/t/p/original/";

const Series = () => {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [providers, setProviders] = useState(null); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const getSeriesData = async () => {
      try {
        const res = await api.get(`tv/${id}`);
        setSerie(res.data);
        checkFavorite(res.data.id);

        const videoRes = await api.get(`tv/${id}/videos`);
        const trailer = videoRes.data.results.find(
          (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
        );
        if (trailer) setTrailerKey(trailer.key);

        const creditsRes = await api.get(`tv/${id}/credits`);
        setCast(creditsRes.data.cast.slice(0, 15));

        const recomRes = await api.get(`tv/${id}/recommendations`);
        setRecommendations(recomRes.data.results.slice(0, 6));

        const providerRes = await api.get(`tv/${id}/watch/providers`);
        if (providerRes.data.results && providerRes.data.results.BR) {
            setProviders(providerRes.data.results.BR);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getSeriesData();
  }, [id, language]);

  const checkFavorite = (serieId) => {
    const saved = JSON.parse(localStorage.getItem("cineverse_favorites")) || [];
    const has = saved.find((item) => item.id === serieId);
    setIsFavorite(!!has);
  };

  const handleFavorite = () => {
    const saved = JSON.parse(localStorage.getItem("cineverse_favorites")) || [];
    if (isFavorite) {
      const newFiles = saved.filter((m) => m.id !== serie.id);
      localStorage.setItem("cineverse_favorites", JSON.stringify(newFiles));
      setIsFavorite(false);
    } else {
      saved.push(serie);
      localStorage.setItem("cineverse_favorites", JSON.stringify(saved));
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: serie.name,
          text: `Check out ${serie.name} on CineVerse!`,
          url: window.location.href,
        });
      } catch (error) { console.log(error); }
    } else { alert("Sharing not supported"); }
  };

  if (loading) {
    return (
      <Container>
        <Skeleton height="500px" />
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

      {serie && (
        <>
          <div className="card-column">
            <MovieCard movie={serie} showLink={false} />
            <div className="action-buttons">
                <Button onClick={handleFavorite} $active={isFavorite}>
                    {isFavorite ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />}
                    <span>{isFavorite ? (language === 'pt-BR' ? "Salvo" : "Saved") : (language === 'pt-BR' ? "Favoritos" : "Favorites")}</span>
                </Button>
                <ShareButton onClick={handleShare}>
                    <BsShareFill />
                </ShareButton>
            </div>
          </div>

          <div className="info-grid">
            <p className="tagline">{serie.tagline}</p>

            <div className="stats-row">
              <div className="info">
                <h3><BsCalendarCheck /> {language === 'pt-BR' ? "Estréia:" : "First Air:"}</h3>
                <p>{serie.first_air_date ? serie.first_air_date.split('-').reverse().join('/') : 'N/A'}</p>
              </div>
              <div className="info">
                <h3><BsGraphUp /> Seasons:</h3>
                <p>{serie.number_of_seasons} ({serie.number_of_episodes} eps)</p>
              </div>
              <div className="info">
                <h3><BsTv /> Status:</h3>
                <p>{serie.status}</p>
              </div>
            </div>

            <div className="info description">
              <h3><BsFillFileEarmarkTextFill /> {language === 'pt-BR' ? "Sinopse:" : "Overview:"}</h3>
              <p>{serie.overview}</p>
            </div>

            {providers && providers.flatrate && (
                <div className="providers-section">
                    <h3><BsTv /> {language === 'pt-BR' ? "Onde Assistir:" : "Where to Watch:"}</h3>
                    <div className="providers-list">
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

            <div className="seasons-section">
                <h3>{language === 'pt-BR' ? "Temporadas" : "Seasons"}</h3>
                <div className="seasons-list">
                    {serie.seasons.filter(s => s.season_number > 0).map(season => (
                        <div key={season.id} className="season-card">
                            <img 
                                src={season.poster_path ? profileUrl + season.poster_path : "https://via.placeholder.com/100x150?text=S"} 
                                alt={season.name} 
                            />
                            <p>{season.name}</p>
                            <span>{season.episode_count} eps</span>
                        </div>
                    ))}
                </div>
            </div>

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

            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>{language === 'pt-BR' ? "Similares" : "Similar"}</h3>
                <div className="recommendations-grid">
                  {recommendations.map((item) => (
                    <MovieCard key={item.id} movie={item} />
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
  
  .card-column > div { width: 100%; }

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

  .providers-section h3, .cast-section h3, .seasons-section h3 {
    color: var(--primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .providers-list { display: flex; gap: 1rem; }
  .providers-list img { width: 50px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); }

  .seasons-list, .cast-list {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    &::-webkit-scrollbar { height: 8px; }
    &::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 4px; }
    &::-webkit-scrollbar-track { background-color: var(--surface); }
  }

  .season-card, .actor-card {
    min-width: 100px;
    max-width: 100px;
    text-align: center;
    font-size: 0.9rem;
  }

  .season-card img, .actor-card img {
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
  .trailer-btn:hover { background-color: var(--secondary); }

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
  
  background-color: ${props => props.$active ? '#ffffff' : 'var(--primary)'};
  color: ${props => props.$active ? '#000000' : '#ffffff'};
  
  svg {
    font-size: 1.2rem;
    fill: ${props => props.$active ? '#000000' : '#ffffff'};
  }

  &:hover { opacity: 0.8; }
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
  &:hover { background-color: var(--primary); color: white; }
`;

export default Series;