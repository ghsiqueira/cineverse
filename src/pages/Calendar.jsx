import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { BiCalendar, BiTime, BiTv, BiMovie, BiChevronRight, BiLoaderAlt } from "react-icons/bi";
import styled from "styled-components";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const imageUrl = "https://image.tmdb.org/t/p/w500/";

const Calendar = () => {
  const { language } = useContext(LanguageContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcoming();
  }, [language]);

  const fetchUpcoming = async () => {
    setLoading(true);
    const watchlist = JSON.parse(localStorage.getItem('cineverse_watchlist')) || [];
    
    const uniqueItems = Array.from(new Map(watchlist.map(item => [item.id, item])).values());
    const upcomingEvents = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    await Promise.all(uniqueItems.map(async (item) => {
        try {
            if (item.title) { 
                const releaseDate = new Date(item.release_date);
                if (releaseDate >= today) {
                    upcomingEvents.push({
                        id: item.id,
                        title: item.title,
                        date: releaseDate,
                        image: item.backdrop_path || item.poster_path,
                        type: 'movie',
                        overview: item.overview
                    });
                }
            } else {
                const res = await api.get(`tv/${item.id}`);
                const nextEp = res.data.next_episode_to_air;

                if (nextEp) {
                    const airDate = new Date(nextEp.air_date);
                    if (airDate >= today) {
                        upcomingEvents.push({
                            id: item.id,
                            title: res.data.name,
                            date: airDate,
                            image: res.data.backdrop_path || res.data.poster_path,
                            type: 'tv',
                            episode: nextEp, 
                            network: res.data.networks?.[0]?.name
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao buscar detalhes para calendário:", item.id);
        }
    }));

    upcomingEvents.sort((a, b) => a.date - b.date);
    setEvents(upcomingEvents);
    setLoading(false);
  };

  const groupedEvents = events.reduce((acc, event) => {
      const monthYear = event.date.toLocaleDateString(language, { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(event);
      return acc;
  }, {});

  const formatDate = (date) => {
      return date.toLocaleDateString(language, { day: '2-digit', month: 'short', weekday: 'short' });
  };

  const getDaysUntil = (date) => {
      const diff = date - new Date();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return language === 'pt-BR' ? 'Hoje!' : 'Today!';
      if (days === 1) return language === 'pt-BR' ? 'Amanhã' : 'Tomorrow';
      return language === 'pt-BR' ? `Em ${days} dias` : `In ${days} days`;
  };

  if (loading) {
      return (
          <Container>
              <div className="loading"><BiLoaderAlt className="spin"/> {language === 'pt-BR' ? 'Buscando lançamentos...' : 'Checking release dates...'}</div>
          </Container>
      )
  }

  return (
    <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
      <Header>
          <h1><BiCalendar /> {language === 'pt-BR' ? 'Calendário de Lançamentos' : 'Release Calendar'}</h1>
          <p>{language === 'pt-BR' 
            ? 'Datas dos próximos episódios e filmes da sua Watchlist.' 
            : 'Upcoming episodes and movie releases from your Watchlist.'}
          </p>
      </Header>

      {events.length === 0 ? (
          <EmptyState>
              <BiTime />
              <h3>{language === 'pt-BR' ? 'Nada por enquanto...' : 'Nothing coming up...'}</h3>
              <p>{language === 'pt-BR' 
                ? 'Adicione séries em andamento ou filmes futuros à sua Watchlist!' 
                : 'Add ongoing series or upcoming movies to your Watchlist!'}
              </p>
              <Link to="/" className="btn-home">{language === 'pt-BR' ? 'Explorar' : 'Explore'}</Link>
          </EmptyState>
      ) : (
          <Timeline>
              {Object.keys(groupedEvents).map(month => (
                  <div key={month} className="month-group">
                      <h3 className="month-title">{month}</h3>
                      <div className="events-list">
                          {groupedEvents[month].map(event => (
                              <EventCard key={`${event.type}-${event.id}`} to={`/${event.type}/${event.id}`}>
                                  <div className="date-box">
                                      <span className="day">{event.date.getDate()}</span>
                                      <span className="weekday">{event.date.toLocaleDateString(language, { weekday: 'short' }).replace('.', '')}</span>
                                  </div>
                                  
                                  <div className="poster">
                                      <img src={event.image ? imageUrl + event.image : 'https://via.placeholder.com/150'} alt="" />
                                  </div>

                                  <div className="info">
                                      <div className="tags">
                                          <span className={`tag ${event.type}`}>
                                              {event.type === 'tv' ? <BiTv /> : <BiMovie />} 
                                              {event.type === 'tv' ? (language === 'pt-BR' ? 'Série' : 'TV Show') : (language === 'pt-BR' ? 'Filme' : 'Movie')}
                                          </span>
                                          <span className="tag countdown">{getDaysUntil(event.date)}</span>
                                      </div>
                                      
                                      <h2>{event.title}</h2>
                                      
                                      {event.type === 'tv' && event.episode && (
                                          <div className="episode-detail">
                                              <strong>S{event.episode.season_number} : E{event.episode.episode_number}</strong> 
                                              <span> - "{event.episode.name}"</span>
                                          </div>
                                      )}
                                      
                                      {event.network && <p className="network">{language === 'pt-BR' ? 'Em:' : 'On:'} {event.network}</p>}
                                  </div>
                                  
                                  <div className="arrow"><BiChevronRight /></div>
                              </EventCard>
                          ))}
                      </div>
                  </div>
              ))}
          </Timeline>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: var(--text-white);

  .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50vh;
      font-size: 1.5rem;
      gap: 1rem;
      color: var(--primary);
      .spin { animation: spin 1s infinite linear; }
  }

  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  h1 { font-size: 2.5rem; display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 0.5rem; }
  p { color: var(--text-gray); }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  background: var(--surface);
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.05);

  svg { font-size: 4rem; color: var(--text-gray); margin-bottom: 1rem; }
  h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  p { color: var(--text-gray); margin-bottom: 2rem; }
  
  .btn-home {
      background: var(--primary);
      color: white;
      padding: 0.8rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      transition: 0.3s;
      &:hover { background: var(--secondary); }
  }
`;

const Timeline = styled.div`
  position: relative;
  
  &::before {
      content: '';
      position: absolute;
      top: 0; bottom: 0; left: 35px;
      width: 2px;
      background: rgba(255,255,255,0.1);
      @media(max-width: 500px) { display: none; }
  }

  .month-group { margin-bottom: 3rem; }
  
  .month-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: var(--primary);
      text-transform: capitalize;
      padding-left: 5rem;
      @media(max-width: 500px) { padding-left: 0; text-align: center; }
  }

  .events-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }
`;

const EventCard = styled(Link)`
  display: flex;
  align-items: center;
  background: var(--surface);
  border-radius: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: 0.3s;
  border: 1px solid transparent;
  gap: 1.5rem;
  position: relative;
  z-index: 1;

  &:hover {
      transform: translateX(10px);
      border-color: var(--primary);
      background: rgba(30, 41, 59, 0.8);
  }

  .date-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 70px;
      
      .day { font-size: 2rem; font-weight: 800; line-height: 1; }
      .weekday { color: var(--primary); text-transform: uppercase; font-size: 0.8rem; font-weight: bold; }
  }

  .poster {
      width: 120px;
      height: 70px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      
      img { width: 100%; height: 100%; object-fit: cover; }
  }

  .info {
      flex: 1;
      
      .tags { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
      
      .tag { 
          font-size: 0.7rem; 
          padding: 2px 8px; 
          border-radius: 4px; 
          font-weight: bold; 
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          
          &.tv { background: rgba(16, 185, 129, 0.2); color: #10b981; }
          &.movie { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
          &.countdown { background: rgba(255,255,255,0.1); color: #ccc; }
      }

      h2 { font-size: 1.2rem; margin-bottom: 0.3rem; }
      
      .episode-detail {
          font-size: 0.95rem;
          color: #e0e0e0;
          strong { color: var(--secondary); }
      }
      
      .network { font-size: 0.8rem; color: #888; margin-top: 0.3rem; }
  }

  .arrow { color: var(--primary); font-size: 1.5rem; }

  @media(max-width: 500px) {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
      
      .date-box { flex-direction: row; gap: 0.5rem; align-items: baseline; }
      .day { font-size: 1.5rem; }
      .poster { width: 100%; height: 150px; }
      .info { width: 100%; }
      .tags { justify-content: center; }
      .arrow { display: none; }
  }
`;

export default Calendar;