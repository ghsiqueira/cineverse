import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import styled from "styled-components";
import api from "../services/api";

const profileUrl = "https://image.tmdb.org/t/p/w500/"; 

const Actor = () => {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const getActorData = async () => {
      try {
        const actorRes = await api.get(`person/${id}`);
        setActor(actorRes.data);

        const creditsRes = await api.get(`person/${id}/movie_credits`);
        const sortedMovies = creditsRes.data.cast
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 20);
        setMovies(sortedMovies);
      } catch (error) {
        console.error(error);
      }
    };

    getActorData();
  }, [id]);

  if (!actor) return <p style={{color: "white", padding: "2rem"}}>Loading...</p>;

  return (
    <Container>
      <div className="actor-header">
        <img 
          src={actor.profile_path ? profileUrl + actor.profile_path : "https://via.placeholder.com/300x450?text=No+Image"} 
          alt={actor.name} 
        />
        <div className="actor-info">
            <h1>{actor.name}</h1>
            <p className="bio">{actor.biography || "No biography available."}</p>
            <div className="details">
                <p><strong>Birthday:</strong> {actor.birthday || "Unknown"}</p>
                <p><strong>Place of Birth:</strong> {actor.place_of_birth || "Unknown"}</p>
            </div>
        </div>
      </div>

      <h2 className="section-title">Known For</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
            movie.poster_path && <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
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
    align-items: center;

    @media(min-width: 768px) {
        flex-direction: row;
        align-items: flex-start;
    }
  }

  .actor-header img {
    width: 300px;
    border-radius: 1rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }

  .actor-info {
    flex: 1;
  }

  .actor-info h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--primary);
  }

  .bio {
    margin-bottom: 1.5rem;
    line-height: 1.6;
    font-size: 1rem;
    text-align: justify;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 1rem;
    
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 4px; }
    &::-webkit-scrollbar-track { background-color: var(--surface); }
  }

  .details p {
    margin-bottom: 0.5rem;
    color: var(--text-gray);
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 2rem;
    border-left: 5px solid var(--secondary);
    padding-left: 1rem;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
  }
`;

export default Actor;