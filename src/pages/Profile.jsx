import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { BiUserCircle, BiTimeFive, BiMovie, BiTv, BiPieChartAlt2, BiTrophy } from "react-icons/bi";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const Profile = () => {
  const { language } = useContext(LanguageContext);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalSeries: 0,
    totalEpisodes: 0,
    topGenres: []
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const favs = JSON.parse(localStorage.getItem('cineverse_favorites')) || [];
    const watchlist = JSON.parse(localStorage.getItem('cineverse_watchlist')) || [];
    const progress = JSON.parse(localStorage.getItem('cineverse_progress')) || {};

    const allSavedMedia = [...favs, ...watchlist];
    const uniqueMedia = Array.from(new Map(allSavedMedia.map(item => [item.id, item])).values());

    const movies = uniqueMedia.filter(m => m.title && !m.name);
    
    const seriesFromLists = uniqueMedia.filter(m => m.name || m.first_air_date);
    const seriesIdsInTracker = Object.keys(progress).map(Number);
    
    const allSeriesIds = new Set([...seriesFromLists.map(s => s.id), ...seriesIdsInTracker]);
    const totalSeriesCount = allSeriesIds.size;

    let episodesCount = 0;
    Object.values(progress).forEach(episodes => {
        if(Array.isArray(episodes)) {
             episodesCount += episodes.length;
        }
    });

    const genreCounts = {};
    favs.forEach(item => {
        if (item.genres) {
            item.genres.forEach(g => {
                genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
            });
        } else if (item.genre_ids) {
        }
    });

    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count, percent: Math.round((count / favs.length) * 100) || 0 }));

    setStats({
        totalMovies: movies.length,
        totalSeries: totalSeriesCount,
        totalEpisodes: episodesCount,
        topGenres: sortedGenres
    });
  };

  return (
    <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
      <Header>
        <div className="avatar">
            <BiUserCircle />
        </div>
        <div className="info">
            <h1>{language === 'pt-BR' ? 'Meu Perfil' : 'My Profile'}</h1>
            <p>{language === 'pt-BR' ? 'Estatísticas do CineVerse' : 'CineVerse Stats'}</p>
        </div>
      </Header>

      <StatsGrid>
        <StatCard delay={0.1}>
            <div className="icon movies"><BiMovie /></div>
            <div className="data">
                <h3>{stats.totalMovies}</h3>
                <p>{language === 'pt-BR' ? 'Filmes Salvos' : 'Saved Movies'}</p>
            </div>
        </StatCard>

        <StatCard delay={0.2}>
            <div className="icon series"><BiTv /></div>
            <div className="data">
                <h3>{stats.totalSeries}</h3>
                <p>{language === 'pt-BR' ? 'Séries Acompanhando' : 'Series Following'}</p>
            </div>
        </StatCard>

        <StatCard delay={0.3}>
            <div className="icon episodes"><BiTimeFive /></div>
            <div className="data">
                <h3>{stats.totalEpisodes}</h3>
                <p>{language === 'pt-BR' ? 'Episódios Vistos' : 'Episodes Watched'}</p>
            </div>
        </StatCard>
      </StatsGrid>

      <Section>
        <h2><BiPieChartAlt2 /> {language === 'pt-BR' ? 'Gêneros Favoritos' : 'Top Genres'}</h2>
        <GenresChart>
            {stats.topGenres.length > 0 ? stats.topGenres.map((g, i) => (
                <div key={i} className="genre-bar">
                    <div className="label">
                        <span>{g.name}</span>
                        <span>{g.count}</span>
                    </div>
                    <div className="bar-bg">
                        <motion.div 
                            className="bar-fill" 
                            initial={{ width: 0 }}
                            animate={{ width: `${g.percent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>
            )) : (
                <p style={{color: '#888', textAlign: 'center'}}>
                    {language === 'pt-BR' ? 'Adicione favoritos para gerar o gráfico.' : 'Add favorites to generate chart.'}
                </p>
            )}
        </GenresChart>
      </Section>

      <Section>
        <h2><BiTrophy /> {language === 'pt-BR' ? 'Conquistas' : 'Achievements'}</h2>
        <AchievementsList>
            <Achievement $unlocked={stats.totalEpisodes > 0}>
                <div className="icon">🍿</div>
                <div className="text">
                    <h4>{language === 'pt-BR' ? 'O Início' : 'The Beginning'}</h4>
                    <p>{language === 'pt-BR' ? 'Marcou 1º episódio.' : 'Marked 1st episode.'}</p>
                </div>
            </Achievement>
            <Achievement $unlocked={stats.totalMovies >= 10}>
                <div className="icon">🎬</div>
                <div className="text">
                    <h4>{language === 'pt-BR' ? 'Cinéfilo' : 'Cinephile'}</h4>
                    <p>{language === 'pt-BR' ? 'Salvou 10 filmes.' : 'Saved 10 movies.'}</p>
                </div>
            </Achievement>
            <Achievement $unlocked={stats.totalEpisodes >= 20}>
                <div className="icon">📺</div>
                <div className="text">
                    <h4>{language === 'pt-BR' ? 'Maratonista' : 'Binger'}</h4>
                    <p>{language === 'pt-BR' ? 'Viu 20 episódios.' : 'Watched 20 episodes.'}</p>
                </div>
            </Achievement>
        </AchievementsList>
      </Section>
    </Container>
  );
};

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: var(--text-white);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);

  .avatar {
      font-size: 5rem;
      color: var(--primary);
      display: flex;
  }

  .info h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
  }
  .info p {
      color: var(--text-gray);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: var(--surface);
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255,255,255,0.05);
  animation: popIn 0.5s ease backwards;
  animation-delay: ${props => props.delay}s;

  .icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      
      &.movies { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
      &.series { background: rgba(16, 185, 129, 0.2); color: #10b981; }
      &.episodes { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  }

  .data h3 { font-size: 1.8rem; margin: 0; }
  .data p { color: var(--text-gray); font-size: 0.9rem; margin: 0; }

  @keyframes popIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
  }
`;

const Section = styled.div`
  margin-bottom: 3rem;
  h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      color: var(--secondary);
  }
`;

const GenresChart = styled.div`
  background: var(--surface);
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .genre-bar {
      .label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-weight: bold;
      }
      .bar-bg {
          height: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 5px;
          overflow: hidden;
      }
      .bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 5px;
      }
  }
`;

const AchievementsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const Achievement = styled.div`
  background: ${props => props.$unlocked ? 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))' : 'var(--surface)'};
  border: 1px solid ${props => props.$unlocked ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};
  opacity: ${props => props.$unlocked ? 1 : 0.5};
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  filter: ${props => props.$unlocked ? 'none' : 'grayscale(100%)'};

  .icon { font-size: 2rem; }
  
  .text h4 { margin: 0 0 0.2rem 0; color: ${props => props.$unlocked ? 'white' : '#888'}; }
  .text p { margin: 0; font-size: 0.85rem; color: #888; }
`;

export default Profile;