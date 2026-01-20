import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { BiCalendar, BiStar, BiLeftArrowAlt } from "react-icons/bi";
import styled from "styled-components";
import { Skeleton } from "../components/Skeleton";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const backdropUrl = "https://image.tmdb.org/t/p/original/";
const stillUrl = "https://image.tmdb.org/t/p/w300/";

const Season = () => {
  const { seriesId, seasonNumber } = useParams();
  const [season, setSeason] = useState(null);
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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

    getSeasonData();
  }, [seriesId, seasonNumber, language]);

  if (loading) {
    return (
      <Container>
        <Skeleton height="300px" mb="2rem" />
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} height="150px" mb="1rem" />)}
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
      {season && seriesInfo && (
        <>
          <SeasonHeader background={backdropUrl + (season.poster_path || seriesInfo.backdrop_path)}>
            <div className="header-content">
              <Link to={`/tv/${seriesId}`} className="back-btn">
                <BiLeftArrowAlt /> {language === 'pt-BR' ? 'Voltar' : 'Back'}
              </Link>
              <h1>{seriesInfo.name}</h1>
              <h2>{season.name}</h2>
              <div className="meta">
                <span><BiCalendar /> {season.air_date ? season.air_date.split('-')[0] : 'TBA'}</span>
                <span>{season.episodes.length} {language === 'pt-BR' ? 'episódios' : 'episodes'}</span>
              </div>
              {season.overview && <p className="overview">{season.overview}</p>}
            </div>
            <div className="header-fade"></div>
          </SeasonHeader>

          <EpisodesSection>
            <h3>{language === 'pt-BR' ? 'Episódios' : 'Episodes'}</h3>
            <div className="episodes-list">
              {season.episodes.map((episode) => (
                <EpisodeCard key={episode.id}>
                  <div className="episode-image">
                    {episode.still_path ? (
                      <img src={stillUrl + episode.still_path} alt={episode.name} />
                    ) : (
                      <div className="no-image">
                        <span>EP {episode.episode_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="episode-info">
                    <div className="episode-header">
                      <h4>
                        {episode.episode_number}. {episode.name}
                      </h4>
                      {episode.vote_average > 0 && (
                        <span className="rating">
                          <BiStar /> {episode.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="air-date">
                      <BiCalendar /> {episode.air_date ? episode.air_date.split('-').reverse().join('/') : 'TBA'}
                    </p>
                    {episode.runtime && (
                      <p className="runtime">{episode.runtime} min</p>
                    )}
                    {episode.overview && (
                      <p className="overview">{episode.overview}</p>
                    )}
                  </div>
                </EpisodeCard>
              ))}
            </div>
          </EpisodesSection>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  color: var(--text-white);
`;

const SeasonHeader = styled.div`
  height: 400px;
  width: 100%;
  background-image: linear-gradient(to bottom, rgba(0,0,0,0.3), var(--background)), url(${props => props.background});
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  margin: 0 -1rem 3rem;
  padding: 0 2rem 2rem;

  .header-content {
    z-index: 2;
    max-width: 800px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0,0,0,0.6);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    margin-bottom: 1rem;
    transition: 0.3s;
    font-size: 1rem;
    border: 1px solid transparent;
  }

  .back-btn:hover {
    background: var(--primary);
    border-color: var(--primary);
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }

  h2 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }

  .meta {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    
    span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .overview {
    font-size: 1.1rem;
    line-height: 1.6;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .header-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(transparent, var(--background));
    z-index: 1;
  }

  @media(max-width: 768px) {
    height: 300px;
    padding: 0 1rem 1.5rem;

    h1 { font-size: 1.5rem; }
    h2 { font-size: 2rem; }
    .meta { font-size: 0.9rem; gap: 1rem; }
    .overview { font-size: 0.95rem; }
  }
`;

const EpisodesSection = styled.div`
  h3 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--primary);
  }

  .episodes-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const EpisodeCard = styled.div`
  display: flex;
  gap: 1.5rem;
  background: var(--surface);
  border-radius: 1rem;
  overflow: hidden;
  transition: 0.3s;
  border: 1px solid transparent;

  &:hover {
    border-color: var(--primary);
    transform: translateX(5px);
  }

  .episode-image {
    width: 200px;
    min-width: 200px;
    height: 112px;
    flex-shrink: 0;
    background: var(--background);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--text-gray);
    }
  }

  .episode-info {
    padding: 1rem 1rem 1rem 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .episode-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    gap: 1rem;

    h4 {
      font-size: 1.2rem;
      color: var(--text-white);
      margin: 0;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: #fbbf24;
      font-weight: bold;
      font-size: 0.9rem;
      flex-shrink: 0;
    }
  }

  .air-date {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-gray);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .runtime {
    color: var(--secondary);
    font-size: 0.85rem;
    margin-bottom: 0.8rem;
  }

  .overview {
    font-size: 0.95rem;
    line-height: 1.5;
    color: #ccc;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media(max-width: 600px) {
    flex-direction: column;

    .episode-image {
      width: 100%;
      height: 180px;
    }

    .episode-info {
      padding: 1rem;
    }

    .episode-header {
      flex-direction: column;
      gap: 0.5rem;

      h4 { font-size: 1.1rem; }
    }
  }
`;

export default Season;