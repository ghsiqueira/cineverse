import styled from "styled-components";
import { BiX, BiCalendar, BiStar, BiChevronRight } from "react-icons/bi";
import { Link } from "react-router-dom";

const imageUrl = "https://image.tmdb.org/t/p/w300/";
const backdropUrl = "https://image.tmdb.org/t/p/original/";

const CollectionModal = ({ collection, collectionInfo, onClose }) => {
  if (!collection) return null;

  const sortedCollection = [...collection].sort((a, b) => 
    new Date(a.release_date) - new Date(b.release_date)
  );

  return (
    <Overlay onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div 
            className="modal-header" 
            style={{backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), var(--surface)), url(${backdropUrl + collectionInfo.backdrop_path})`}}
        >
            <button className="close-btn" onClick={onClose}>
                <BiX />
            </button>
            <div className="header-info">
                <h2>{collectionInfo.name}</h2>
                <p>{collection.length} filmes nesta coleção</p>
            </div>
        </div>
        
        <div className="movies-list">
            {sortedCollection.map((movie) => (
                <Link 
                    to={`/movie/${movie.id}`} 
                    key={movie.id} 
                    onClick={onClose}
                    className="movie-link"
                >
                    <div className="movie-row">
                        <img 
                            src={movie.poster_path ? imageUrl + movie.poster_path : "https://via.placeholder.com/100x150?text=No+Img"} 
                            alt={movie.title} 
                            className="poster"
                        />
                        <div className="movie-details">
                            <div className="title-row">
                                <h3>{movie.title}</h3>
                                {movie.vote_average > 0 && (
                                    <span className="rating"><BiStar /> {movie.vote_average.toFixed(1)}</span>
                                )}
                            </div>
                            <span className="release-date">
                                <BiCalendar /> {movie.release_date ? movie.release_date.split('-')[0] : "TBA"}
                            </span>
                            <p className="overview">
                                {movie.overview 
                                    ? (movie.overview.length > 150 ? movie.overview.substring(0, 150) + "..." : movie.overview) 
                                    : "Sem sinopse disponível."}
                            </p>
                        </div>
                        <div className="arrow-action">
                            <BiChevronRight />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease;

  .modal-content {
    width: 100%;
    max-width: 800px;
    height: 85vh;
    background: var(--surface);
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .modal-header {
    height: 250px;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 2rem;
    flex-shrink: 0;
  }

  .header-info h2 {
    font-size: 2.5rem;
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    color: white;
    margin-bottom: 0.5rem;
  }

  .header-info p {
    color: rgba(255,255,255,0.8);
    font-size: 1rem;
    font-weight: 500;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0,0,0,0.5);
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
  }
  
  .close-btn:hover { background: var(--primary); transform: rotate(90deg); }

  .movies-list {
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    &::-webkit-scrollbar { width: 8px; }
    &::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 4px; }
    &::-webkit-scrollbar-track { background-color: var(--background); }
  }

  .movie-link {
      text-decoration: none;
      color: inherit;
  }

  .movie-row {
      display: flex;
      gap: 1.5rem;
      background: rgba(255,255,255,0.03);
      padding: 1rem;
      border-radius: 12px;
      transition: 0.3s;
      border: 1px solid transparent;
      align-items: center;
  }

  .movie-row:hover {
      background: rgba(255,255,255,0.08);
      border-color: var(--primary);
      transform: translateX(5px);
  }

  .poster {
      width: 80px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  .movie-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
  }

  .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
  }

  .title-row h3 {
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
  }

  .release-date {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-gray);
      font-size: 0.9rem;
      margin-bottom: 0.8rem;
  }

  .overview {
      font-size: 0.9rem;
      color: #ccc;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
  }

  .arrow-action {
      font-size: 2rem;
      color: var(--text-gray);
      transition: 0.3s;
  }

  .movie-row:hover .arrow-action {
      color: var(--primary);
      transform: translateX(5px);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media(max-width: 600px) {
      .modal-header { height: 180px; padding: 1.5rem; }
      .header-info h2 { font-size: 1.5rem; }
      
      .movie-row { gap: 1rem; padding: 0.8rem; }
      .poster { width: 60px; height: 90px; }
      .title-row h3 { font-size: 1rem; }
      .overview { display: none; }
      .arrow-action { font-size: 1.5rem; }
  }
`;

export default CollectionModal;