import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { BiCalendar, BiStar, BiLeftArrowAlt, BiTime, BiCheck, BiCheckCircle } from "react-icons/bi";
import styled from "styled-components";
import { Skeleton } from "../components/Skeleton";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const backdropUrl = "https://image.tmdb.org/t/p/original/";
const stillUrl = "https://image.tmdb.org/t/p/w500/"; 

const Season = () => {
  const { seriesId, seasonNumber } = useParams();
  const [season, setSeason] = useState(null);
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    const getSeasonData = async () => {
      try {
        const seasonRes = await api.get(`tv/${seriesId}/season/${seasonNumber}`);
        setSeason(seasonRes.data);

        const seriesRes = await api.get(`tv/${seriesId}`);
        setSeriesInfo(seriesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const savedProgress = JSON.parse(localStorage.getItem('cineverse_progress')) || {};
    if (savedProgress[seriesId]) {
        setWatchedEpisodes(savedProgress[seriesId]);
    }

    getSeasonData();
  }, [seriesId, seasonNumber, language]);

  const toggleEpisode = (episodeId) => {
      let newWatched;
      if (watchedEpisodes.includes(episodeId)) {
          newWatched = watchedEpisodes.filter(id => id !== episodeId);
      } else {
          newWatched = [...watchedEpisodes, episodeId];
      }
      
      setWatchedEpisodes(newWatched);
      const savedProgress = JSON.parse(localStorage.getItem('cineverse_progress')) || {};
      savedProgress[seriesId] = newWatched;
      localStorage.setItem('cineverse_progress', JSON.stringify(savedProgress));
  };

  if (loading) {
    return (
      <Container>
        <Skeleton height="400px" width="100%" mb="2rem" />
        <Skeleton height="150px" width="100%" mb="1rem" />
        <Skeleton height="150px" width="100%" mb="1rem" />
      </Container>
    );
  }

  return (
    <Wrapper
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {season && seriesInfo && (
        <>
          <SeasonHeader background={backdropUrl + (season.poster_path || seriesInfo.backdrop_path)}>
            <div className="header-overlay">
                <div className="header-content">
                    <Link to={`/tv/${seriesId}`} className="back-btn">
                        <BiLeftArrowAlt /> {language === 'pt-BR' ? 'Voltar para a Série' : 'Back to Series'}
                    </Link>
                    <h1>{seriesInfo.name}</h1>
                    <div className="season-title-row">
                        <h2>{season.name}</h2>
                        <span className="ep-badge">{season.episodes.length} {language === 'pt-BR' ? 'EPS' : 'EPS'}</span>
                    </div>
                    
                    <div className="meta">
                        <span><BiCalendar /> {season.air_date ? season.air_date.split('-')[0] : 'TBA'}</span>
                    </div>
                    {season.overview && <p className="overview">{season.overview}</p>}
                </div>
            </div>
          </SeasonHeader>

          <Container>
            <EpisodesSection>
              <div className="episodes-list">
                {season.episodes.map((episode) => {
                  const isWatched = watchedEpisodes.includes(episode.id);
                  return (
                      <EpisodeCard key={episode.id} $isWatched={isWatched}>
                        <div className="episode-image">
                            {episode.still_path ? (
                            <img src={stillUrl + episode.still_path} alt={episode.name} />
                            ) : (
                            <div className="no-image">
                                <span>{episode.episode_number}</span>
                            </div>
                            )}
                            <div className="img-overlay">
                                <button 
                                    className="check-btn-overlay"
                                    onClick={() => toggleEpisode(episode.id)}
                                >
                                    {isWatched ? <BiCheckCircle /> : <BiCheck />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="episode-info">
                            <div className="top-row">
                                <h4>
                                    <span className="ep-number">{episode.episode_number}.</span> {episode.name}
                                </h4>
                                {episode.vote_average > 0 && (
                                    <span className="rating">
                                        <BiStar /> {episode.vote_average.toFixed(1)}
                                    </span>
                                )}
                            </div>
                            
                            <div className="meta-row">
                                <span className="date">{episode.air_date ? episode.air_date.split('-').reverse().join('/') : '-'}</span>
                                {episode.runtime && <span className="runtime">• {episode.runtime} min</span>}
                            </div>

                            <p className="overview">
                                {episode.overview 
                                    ? episode.overview 
                                    : (language === 'pt-BR' ? "Sem descrição." : "No description.")}
                            </p>
                        </div>
                      </EpisodeCard>
                  );
                })}
              </div>
            </EpisodesSection>
          </Container>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
    width: 100%;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  color: var(--text-white);
  position: relative;
  z-index: 2;
  margin-top: -60px;  
`;

const SeasonHeader = styled.div`
  height: 60vh;
  min-height: 450px;
  width: 100%;
  background-image: url(${props => props.background});
  background-size: cover;
  background-position: center 20%;
  position: relative;

  .header-overlay {
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, var(--background) 5%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.7) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 2rem;
  }

  .header-content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255,255,255,0.7);
    font-weight: bold;
    margin-bottom: 1.5rem;
    transition: 0.3s;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    
    &:hover { color: var(--primary); }
  }

  h1 {
    font-size: 1.5rem;
    color: var(--secondary);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }

  .season-title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
  }

  h2 {
    font-size: 4rem;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }

  .ep-badge {
      background: var(--primary);
      color: white;
      padding: 0.2rem 0.8rem;
      border-radius: 4px;
      font-weight: bold;
      font-size: 1rem;
  }

  .meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
      color: rgba(255,255,255,0.8);
  }

  .overview {
    font-size: 1.1rem;
    line-height: 1.6;
    color: rgba(255,255,255,0.9);
    max-width: 600px;
    margin-bottom: 2rem;
  }

  @media(max-width: 768px) {
    height: auto;
    padding-bottom: 4rem;
    .header-overlay { padding: 4rem 1rem 6rem; }
    h2 { font-size: 2.5rem; }
    .season-title-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  }
`;

const EpisodesSection = styled.div`
  .episodes-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const EpisodeCard = styled.div`
  display: flex;
  background-color: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  transition: 0.3s;
  border: 1px solid ${props => props.$isWatched ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)'};
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
  position: relative;

  ${props => props.$isWatched && `
    &::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(16, 185, 129, 0.05);
        pointer-events: none;
    }
  `}

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.4);
    z-index: 5;
  }

  .episode-image {
    width: 280px;
    min-width: 280px;
    position: relative;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: 0.3s;
      filter: ${props => props.$isWatched ? 'grayscale(0.5)' : 'none'};
    }

    .no-image {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      color: var(--text-gray);
    }

    .img-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: 0.3s;
    }

    &:hover .img-overlay { opacity: 1; }

    .check-btn-overlay {
        background: rgba(0,0,0,0.6);
        border: 2px solid white;
        color: white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: 0.2s;

        &:hover { background: var(--primary); border-color: var(--primary); transform: scale(1.1); }
    }
  }

  .episode-info {
    padding: 1.5rem 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;

      h4 {
          font-size: 1.3rem;
          margin: 0;
          color: white;
          font-weight: 700;
          
          .ep-number { 
              color: ${props => props.$isWatched ? '#10b981' : 'var(--primary)'}; 
              font-family: monospace; 
              margin-right: 0.5rem; 
          }
      }

      .rating {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #fbbf24;
          font-weight: bold;
          font-size: 0.95rem;
      }
  }

  .meta-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--text-gray);
      font-weight: 500;
  }

  .overview {
      font-size: 1rem;
      color: #ccc;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
  }

  @media(max-width: 800px) {
    flex-direction: column;
    
    .episode-image {
        width: 100%;
        height: 200px;
        
        .img-overlay { opacity: 1; background: transparent; justify-content: flex-end; align-items: flex-start; padding: 1rem; }
    }
    
    .episode-info { padding: 1.5rem; }
  }
`;

export default Season;