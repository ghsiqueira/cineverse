import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { BiJoystick, BiTrophy, BiPlay, BiRefresh, BiXCircle, BiCheckCircle } from "react-icons/bi";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion, AnimatePresence } from "framer-motion";

const backdropUrl = "https://image.tmdb.org/t/p/original/";

const Quiz = () => {
  const { language } = useContext(LanguageContext);
  
  const [gameState, setGameState] = useState('menu'); 
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const savedHigh = localStorage.getItem('cineverse_highscore');
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
    loadQuestion();
  };

  const loadQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);

    try {
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const res = await api.get('movie/popular', { params: { page: randomPage } });
        const movies = res.data.results.filter(m => m.backdrop_path); 

        if (movies.length < 4) {
            loadQuestion(); 
            return;
        }

        const correctIndex = Math.floor(Math.random() * movies.length);
        const correctMovie = movies[correctIndex];

        const distractors = movies
            .filter(m => m.id !== correctMovie.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const options = [...distractors, correctMovie].sort(() => 0.5 - Math.random());

        setQuestion({
            image: correctMovie.backdrop_path,
            correctId: correctMovie.id,
            options: options
        });

    } catch (error) {
        console.error("Erro ao carregar quiz", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAnswer = (movie) => {
      if (selectedOption) return; 

      setSelectedOption(movie.id);
      
      if (movie.id === question.correctId) {
          setIsCorrect(true);
          setTimeout(() => {
              setScore(prev => prev + 1);
              loadQuestion();
          }, 1500);
      } else {
          setIsCorrect(false);
          if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('cineverse_highscore', score);
          }
          setTimeout(() => {
              setGameState('gameover');
          }, 1500);
      }
  };

  return (
    <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
      <GameArea>
        {gameState === 'menu' && (
            <MenuCard>
                <div className="icon-bounce"><BiJoystick /></div>
                <h1>CineVerse Quiz</h1>
                <p>{language === 'pt-BR' ? 'Teste seus conhecimentos cinematográficos!' : 'Test your movie knowledge!'}</p>
                
                <div className="highscore">
                    <BiTrophy /> 
                    <span>Recorde: {highScore}</span>
                </div>

                <Button onClick={startGame}>
                    <BiPlay /> {language === 'pt-BR' ? 'Jogar Agora' : 'Play Now'}
                </Button>
            </MenuCard>
        )}

        {gameState === 'playing' && (
            <QuestionCard>
                <div className="header-game">
                    <span className="score-badge">Score: {score}</span>
                </div>

                {loading ? (
                    <div className="loading-box">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="image-container">
                            <img src={backdropUrl + question?.image} alt="Guess the movie" />
                            <div className="overlay-text">
                                {language === 'pt-BR' ? 'Qual é esse filme?' : 'Which movie is this?'}
                            </div>
                        </div>

                        <div className="options-grid">
                            {question?.options.map(opt => {
                                let statusClass = "";
                                if (selectedOption) {
                                    if (opt.id === question.correctId) statusClass = "correct";
                                    else if (opt.id === selectedOption) statusClass = "wrong";
                                    else statusClass = "disabled";
                                }

                                return (
                                    <OptionButton 
                                        key={opt.id} 
                                        onClick={() => handleAnswer(opt)}
                                        className={statusClass}
                                        disabled={!!selectedOption}
                                    >
                                        {opt.title}
                                        {statusClass === "correct" && <BiCheckCircle className="status-icon"/>}
                                        {statusClass === "wrong" && <BiXCircle className="status-icon"/>}
                                    </OptionButton>
                                )
                            })}
                        </div>
                    </>
                )}
            </QuestionCard>
        )}

        {gameState === 'gameover' && (
            <MenuCard>
                <h1 style={{color: '#ef4444'}}>Game Over!</h1>
                <div className="final-score">
                    <p>{language === 'pt-BR' ? 'Você acertou' : 'You got'}</p>
                    <h2>{score}</h2>
                    <p>{language === 'pt-BR' ? 'filmes seguidos!' : 'movies in a row!'}</p>
                </div>

                {score >= highScore && score > 0 && (
                    <div className="new-record">
                        <BiTrophy /> {language === 'pt-BR' ? 'Novo Recorde!' : 'New High Score!'}
                    </div>
                )}

                <Button onClick={startGame}>
                    <BiRefresh /> {language === 'pt-BR' ? 'Tentar Novamente' : 'Try Again'}
                </Button>
                <Button className="secondary" onClick={() => setGameState('menu')}>
                    {language === 'pt-BR' ? 'Voltar ao Menu' : 'Back to Menu'}
                </Button>
            </MenuCard>
        )}
      </GameArea>
    </Container>
  );
};

const Container = styled.div`
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
`;

const GameArea = styled.div`
    width: 100%;
    max-width: 600px;
`;

const MenuCard = styled.div`
    background: var(--surface);
    padding: 3rem 2rem;
    border-radius: 1.5rem;
    text-align: center;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);

    .icon-bounce {
        font-size: 4rem;
        color: var(--primary);
        margin-bottom: 1rem;
        animation: bounce 2s infinite;
    }

    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: white; }
    p { color: var(--text-gray); margin-bottom: 2rem; font-size: 1.1rem; }

    .highscore {
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-weight: bold;
        margin-bottom: 2rem;
        border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .final-score {
        margin: 2rem 0;
        h2 { font-size: 4rem; color: var(--primary); margin: 0; line-height: 1; }
    }

    .new-record {
        color: #fbbf24;
        font-weight: bold;
        font-size: 1.2rem;
        margin-bottom: 2rem;
        animation: pulse 1s infinite;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
        40% {transform: translateY(-20px);}
        60% {transform: translateY(-10px);}
    }
    @keyframes pulse { 50% { opacity: 0.5; } }
`;

const QuestionCard = styled.div`
    background: var(--surface);
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.1);

    .header-game {
        padding: 1rem;
        display: flex;
        justify-content: flex-end;
        background: rgba(0,0,0,0.2);
    }

    .score-badge {
        background: var(--primary);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 8px;
        font-weight: bold;
    }

    .image-container {
        width: 100%;
        height: 250px;
        position: relative;
        background: #000;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }

        .overlay-text {
            position: absolute;
            bottom: 1rem;
            left: 0;
            width: 100%;
            text-align: center;
            font-weight: bold;
            font-size: 1.2rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            color: rgba(255,255,255,0.9);
        }
    }

    .options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding: 1.5rem;
    }

    .loading-box {
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        .spinner {
            width: 40px; height: 40px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
`;

const Button = styled.button`
    background: var(--primary);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 1rem;
    transition: 0.3s;

    &:hover { transform: scale(1.05); filter: brightness(1.1); }

    &.secondary {
        background: transparent;
        border: 2px solid var(--text-gray);
        color: var(--text-gray);
        &:hover { border-color: white; color: white; }
    }
`;

const OptionButton = styled.button`
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 1rem;
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 70px;

    &:hover:not(:disabled) {
        background: rgba(255,255,255,0.1);
        border-color: var(--primary);
    }

    &.correct {
        background: #10b981 !important;
        border-color: #10b981 !important;
        color: white;
        animation: pulseGreen 0.5s;
    }

    &.wrong {
        background: #ef4444 !important;
        border-color: #ef4444 !important;
        color: white;
        animation: shake 0.4s;
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .status-icon { font-size: 1.2rem; }

    @keyframes pulseGreen { 0% {transform: scale(1);} 50% {transform: scale(1.05);} 100% {transform: scale(1);} }
    @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-5px);} 75% {transform: translateX(5px);} }
`;

export default Quiz;