import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { BiCalendar, BiMap, BiLeftArrowAlt } from "react-icons/bi";
import MovieCard from "../components/MovieCard";
import { Skeleton } from "../components/Skeleton";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const profileUrl = "https://image.tmdb.org/t/p/original/";

const Actor = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    const getActorData = async () => {
      try {
        const personRes = await api.get(`person/${id}`);
        setPerson(personRes.data);

        const creditsRes = await api.get(`person/${id}/movie_credits`);
        const sortedCredits = creditsRes.data.cast
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 20); 
        
        setCredits(sortedCredits);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getActorData();
  }, [id, language]);

  if (loading) {
      return (
          <Container>
              <Skeleton height="400px" mb="2rem" />
              <div className="grid">
                 {Array(5).fill(0).map((_, i) => <Skeleton key={i} height="300px" />)}
              </div>
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
      {person && (
        <>
            <div className="actor-header">
                <div className="img-wrapper">
                    <img 
                        src={person.profile_path ? profileUrl + person.profile_path : "https://via.placeholder.com/300x450?text=No+Img"} 
                        alt={person.name} 
                    />
                </div>
                <div className="actor-info">
                    <h1>{person.name}</h1>
                    
                    <div className="meta-info">
                        {person.birthday && (
                            <span><BiCalendar /> {person.birthday.split('-').reverse().join('/')}</span>
                        )}
                        {person.place_of_birth && (
                            <span><BiMap /> {person.place_of_birth}</span>
                        )}
                    </div>

                    <div className="biography">
                        <h3>{language === 'pt-BR' ? "Biografia" : "Biography"}</h3>
                        <p>
                            {person.biography 
                                ? person.biography 
                                : (language === 'pt-BR' ? "Biografia não disponível." : "Biography not available.")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="filmography">
                <h2>{language === 'pt-BR' ? "Conhecido por" : "Known For"}</h2>
                <div className="movies-grid">
                    {credits.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
                {credits.length === 0 && <p className="empty-msg">Nenhum filme encontrado.</p>}
            </div>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: var(--text-white);

  .actor-header {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 3rem;
      
      @media(min-width: 768px) {
          flex-direction: row;
          align-items: flex-start;
      }
  }

  .img-wrapper img {
      width: 100%;
      max-width: 300px;
      border-radius: 1rem;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  }

  .actor-info {
      flex: 1;
  }

  .actor-info h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: var(--primary);
  }

  .meta-info {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      color: var(--text-gray);
      font-size: 1rem;

      span { display: flex; align-items: center; gap: 0.5rem; }
  }

  .biography h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid var(--secondary);
      padding-left: 1rem;
  }

  .biography p {
      line-height: 1.8;
      font-size: 1.05rem;
      text-align: justify;
      color: #e0e0e0;
      white-space: pre-line;
  }

  .filmography h2 {
      font-size: 2rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--surface);
      padding-bottom: 1rem;
  }

  .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 2rem;
  }
  
  .empty-msg { text-align: center; color: var(--text-gray); }
`;

export default Actor;