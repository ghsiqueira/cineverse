import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BsGraphUp,
  BsWallet2,
  BsHourglassSplit,
  BsFillFileEarmarkTextFill,
  BsBookmarkPlus,
  BsBookmarkCheckFill,
  BsPlayBtn,
  BsFillChatQuoteFill
} from "react-icons/bs";
import MovieCard from "../components/MovieCard";
import styled from "styled-components";
import api from "../services/api";

const profileUrl = "https://image.tmdb.org/t/p/w185/";

const ReviewItem = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 300;
  
  const isLong = review.content.length > maxChars;
  
  const contentToShow = expanded || !isLong 
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
        <p className="review-content">{contentToShow}</p>
        {isLong && (
            <button className="read-more-btn" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Read Less" : "Read More"}
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
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const getMovieData = async () => {
      try {
        const movieRes = await api.get(`movie/${id}`);
        setMovie(movieRes.data);
        checkFavorite(movieRes.data.id);

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

      } catch (error) {
        console.error(error);
      }
    };

    getMovieData();
  }, [id]);

  const checkFavorite = (movieId) => {
    const savedMovies = JSON.parse(localStorage.getItem("cineverse_favorites")) || [];
    const hasMovie = savedMovies.find((movie) => movie.id === movieId);
    if (hasMovie) setIsFavorite(true);
    else setIsFavorite(false);
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

  const formatCurrency = (number) => {
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  return (
    <Container>
      {movie && (
        <>
          <div className="card-column">
            <MovieCard movie={movie} showLink={false} />
            <Button onClick={handleFavorite} $isFavorite={isFavorite}>
              {isFavorite ? (
                <><BsBookmarkCheckFill /> Saved</>
              ) : (
                <><BsBookmarkPlus /> Add to Favorites</>
              )}
            </Button>
          </div>

          <div className="info-grid">
            <p className="tagline">{movie.tagline}</p>

            <div className="stats-row">
              <div className="info">
                <h3><BsWallet2 /> Budget:</h3>
                <p>{formatCurrency(movie.budget)}</p>
              </div>
              <div className="info">
                <h3><BsGraphUp /> Revenue:</h3>
                <p>{formatCurrency(movie.revenue)}</p>
              </div>
              <div className="info">
                <h3><BsHourglassSplit /> Runtime:</h3>
                <p>{movie.runtime} min</p>
              </div>
            </div>

            <div className="info description">
              <h3><BsFillFileEarmarkTextFill /> Overview:</h3>
              <p>{movie.overview}</p>
            </div>

            {cast.length > 0 && (
              <div className="cast-section">
                <h3>Top Cast</h3>
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
                <h3><BsPlayBtn /> Watch Trailer</h3>
                <div className="video-responsive">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            
            {reviews.length > 0 && (
                <div className="reviews-section">
                    <h3><BsFillChatQuoteFill /> User Reviews</h3>
                    <div className="reviews-list">
                        {reviews.slice(0, 3).map((review) => ( 
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </div>
                </div>
            )}

            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>You Might Also Like</h3>
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

  .trailer-container { margin-top: 2rem; }
  .trailer-container h3 {
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .video-responsive {
    overflow: hidden;
    padding-bottom: 56.25%;
    position: relative;
    height: 0;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    background-color: #000;
  }
  .video-responsive iframe {
    left: 0; top: 0; height: 100%; width: 100%; position: absolute;
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
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: 0.3s;
  background-color: ${props => props.$isFavorite ? '#ffffff' : 'var(--primary)'};
  color: ${props => props.$isFavorite ? '#000000' : '#ffffff'};
  
  svg {
    fill: ${props => props.$isFavorite ? '#000000' : '#ffffff'};
  }

  &:hover {
    opacity: 0.8;
  }
`;

export default Movie;