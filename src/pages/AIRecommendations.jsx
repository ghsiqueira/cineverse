import { useState, useEffect, useContext, useRef } from "react";
import { BiSend, BiX, BiSearch, BiBot, BiUser, BiLoaderAlt } from "react-icons/bi";
import styled from "styled-components";
import MovieCard from "../components/MovieCard";
import { Skeleton } from "../components/Skeleton";
import api from "../services/api";
import { LanguageContext } from '../context/LanguageContext';
import { motion } from "framer-motion";

const imageUrl = "https://image.tmdb.org/t/p/w185/";

const AIRecommendations = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(() => {
    const saved = localStorage.getItem('ai_selected_media');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState(() => {
    const saved = localStorage.getItem('ai_recommendations');
    return saved ? JSON.parse(saved) : [];
  });
  const { language } = useContext(LanguageContext);
  const chatEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const [myFavorites, setMyFavorites] = useState(() => {
    const possibleKeys = ['cineverse_favorites', 'favorites', 'favoriteMovies', 'myFavorites', 'saved_favorites'];
    for (let key of possibleKeys) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`✅ Favoritos encontrados em: "${key}"`, parsed.length, 'filmes');
            return parsed;
          }
        } catch (e) {
          console.error(`Erro ao parsear ${key}:`, e);
        }
      }
    }
    console.log('❌ Nenhum favorito encontrado');
    return [];
  });

  const [myWatchlist, setMyWatchlist] = useState(() => {
    const possibleKeys = ['cineverse_watchlist', 'watchlist', 'watchlistMovies', 'myWatchlist', 'saved_watchlist'];
    for (let key of possibleKeys) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`✅ Watchlist encontrada em: "${key}"`, parsed.length, 'filmes');
            return parsed;
          }
        } catch (e) {
          console.error(`Erro ao parsear ${key}:`, e);
        }
      }
    }
    console.log('❌ Nenhuma watchlist encontrada');
    return [];
  });

  const [quickActionFilter, setQuickActionFilter] = useState('favorites'); 

  useEffect(() => {
    const loadFavoritesAndWatchlist = () => {
      const favKeys = ['cineverse_favorites', 'favorites', 'favoriteMovies', 'myFavorites', 'saved_favorites'];
      let foundFavorites = false;
      
      for (let key of favKeys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`✅ Favoritos recarregados de: "${key}"`, parsed.length, 'filmes');
              setMyFavorites(parsed);
              foundFavorites = true;
              break;
            }
          } catch (e) {}
        }
      }
      
      if (!foundFavorites) {
        console.log('❌ Nenhum favorito encontrado no reload');
      }
      
      const watchKeys = ['cineverse_watchlist', 'watchlist', 'watchlistMovies', 'myWatchlist', 'saved_watchlist'];
      let foundWatchlist = false;
      
      for (let key of watchKeys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`✅ Watchlist recarregada de: "${key}"`, parsed.length, 'filmes');
              setMyWatchlist(parsed);
              foundWatchlist = true;
              break;
            }
          } catch (e) {}
        }
      }
      
      if (!foundWatchlist) {
        console.log('❌ Nenhuma watchlist encontrada no reload');
      }
    };

    loadFavoritesAndWatchlist();

    window.addEventListener('focus', loadFavoritesAndWatchlist);
    
    window.addEventListener('storage', loadFavoritesAndWatchlist);

    return () => {
      window.removeEventListener('focus', loadFavoritesAndWatchlist);
      window.removeEventListener('storage', loadFavoritesAndWatchlist);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (recommendations.length > 0) {
      localStorage.setItem('ai_recommendations', JSON.stringify(recommendations));
    }
  }, [recommendations]);

  useEffect(() => {
    if (selectedMedia.length > 0) {
      localStorage.setItem('ai_selected_media', JSON.stringify(selectedMedia));
    }
  }, [selectedMedia]);

  const clearHistory = () => {
    setMessages([]);
    setRecommendations([]);
    setSelectedMedia([]);
    localStorage.removeItem('ai_chat_messages');
    localStorage.removeItem('ai_recommendations');
    localStorage.removeItem('ai_selected_media');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await api.get(`search/multi?query=${searchQuery}`);
          const filtered = response.data.results.filter(
            item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
          );
          setSearchResults(filtered.slice(0, 10));
        } catch (error) {
          console.error(error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToSelected = (media) => {
    if (selectedMedia.find(m => m.id === media.id)) {
      setSelectedMedia(selectedMedia.filter(m => m.id !== media.id));
    } else if (selectedMedia.length < 5) {
      setSelectedMedia([...selectedMedia, media]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFromSelected = (id) => {
    setSelectedMedia(selectedMedia.filter(m => m.id !== id));
  };

  const generatePrompt = (userMessage) => {
    const selectedTitles = selectedMedia.map(m => m.title || m.name).join(", ");
    
    const languageInstructions = language === 'pt-BR' 
      ? 'português brasileiro' 
      : 'English';
    
    const titleInstructions = language === 'pt-BR'
      ? 'Use os títulos em PORTUGUÊS como aparecem no Brasil (ex: "As Crônicas de Nárnia", não "The Chronicles of Narnia")'
      : 'Use the EXACT English titles as they appear in TMDB';
    
    let basePrompt = `Você é o CineVerse AI, um especialista em recomendações de filmes, séries e animes.

`;
    
    if (selectedMedia.length > 0) {
      basePrompt += `CONTEXTO: O usuário gosta de: ${selectedTitles}\n\n`;
    }
    
    basePrompt += `PERGUNTA DO USUÁRIO: ${userMessage}\n\n`;
    
    basePrompt += `INSTRUÇÕES DE FORMATAÇÃO (IMPORTANTE):

Responda em ${languageInstructions} seguindo EXATAMENTE este formato:

[1-2 frases de introdução amigável e empolgante]

1. [Título Exato] ([Ano])
Razão: [1 frase curta e direta explicando por que é perfeito para o usuário]

2. [Título Exato] ([Ano])
Razão: [1 frase curta e direta explicando por que é perfeito para o usuário]

3. [Título Exato] ([Ano])
Razão: [1 frase curta e direta explicando por que é perfeito para o usuário]

4. [Título Exato] ([Ano])
Razão: [1 frase curta e direta explicando por que é perfeito para o usuário]

5. [Título Exato] ([Ano])
Razão: [1 frase curta e direta explicando por que é perfeito para o usuário]

REGRAS IMPORTANTES:
- ${titleInstructions}
- Ano entre parênteses logo após o título
- Razão: sempre começa com "Razão:" 
- Seja entusiasmado e pessoal (você, seu, sua)
- Razões devem ter 15-25 palavras
- NÃO use asteriscos, hashes ou markdown
- NÃO adicione informações extras fora do formato
- Forneça EXATAMENTE 5 recomendações`;

    return basePrompt;
  };

  const searchTMDB = async (title, year) => {
    try {
      const response = await api.get(`search/multi`, {
        params: { 
          query: title, 
          year: year,
          language: language 
        }
      });
      
      const results = response.data.results.filter(
        item => (item.media_type === 'movie' || item.media_type === 'tv')
      );

      return results[0] || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const formatAIResponse = (text, tmdbRecommendations = []) => {
    if (!text) return '';
    
    text = text.replace(/^\*+\s*$/gm, '');
    text = text.replace(/^###\s*/gm, '');
    text = text.replace(/\*\*/g, '');
    
    let lines = text.split('\n').filter(line => line.trim());
    let formattedHTML = '';
    let inRecommendation = false;
    let currentCard = '';
    let recommendationIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      const recommendationMatch = line.match(/^(?:#+)?\s*(\d+)\.\s*(.+?)(?:\s*\((\d{4})\))?$/);
      
      if (recommendationMatch) {
        if (currentCard) {
          formattedHTML += `${currentCard}</div></div>`;
          currentCard = '';
        }
        
        const number = recommendationMatch[1];
        const title = recommendationMatch[2].trim();
        const year = recommendationMatch[3] || '';
        
        const tmdbData = tmdbRecommendations[recommendationIndex];
        const posterUrl = tmdbData?.poster_path 
          ? `https://image.tmdb.org/t/p/w185${tmdbData.poster_path}`
          : null;
        
        recommendationIndex++;
        
        currentCard = `
          <div style="margin: 1.2rem 0; padding: 1rem; background: rgba(139, 92, 246, 0.1); border-left: 4px solid var(--primary); border-radius: 8px; display: flex; gap: 1rem; align-items: flex-start;">
        `;
        
        if (posterUrl) {
          currentCard += `
            <img 
              src="${posterUrl}" 
              alt="${title}"
              style="width: 100px; height: 150px; border-radius: 6px; object-fit: cover; box-shadow: 0 4px 8px rgba(0,0,0,0.3); flex-shrink: 0;"
            />
          `;
        }
        
        currentCard += `
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem;">
              <span style="background: var(--primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0;">${number}</span>
        `;
        
        if (tmdbData) {
          const isSeries = tmdbData.name && !tmdbData.title;
          const linkPath = isSeries ? `/tv/${tmdbData.id}` : `/movie/${tmdbData.id}`;
          currentCard += `<a href="${linkPath}" style="text-decoration: none; color: var(--text-white); transition: color 0.3s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-white)'"><strong style="font-size: 1.1rem;">${title}</strong></a>`;
        } else {
          currentCard += `<strong style="font-size: 1.1rem; color: var(--text-white);">${title}</strong>`;
        }
        
        if (year) {
          currentCard += ` <span style="color: #bbb; font-size: 0.95rem;">(${year})</span>`;
        }
        
        currentCard += `</div>`;
        
        inRecommendation = true;
        continue;
      }
      
      if (inRecommendation) {
        const yearLineMatch = line.match(/^\*\s*Ano:\s*(\d{4})$/i);
        if (yearLineMatch) {
          currentCard += `<div style="color: #bbb; font-size: 0.9rem; margin-bottom: 0.5rem;">📅 ${yearLineMatch[1]}</div>`;
          continue;
        }
        
        const reasonMatch = line.match(/^\*\s*Razão:\s*(.+)$/i);
        if (reasonMatch) {
          const cleanReason = reasonMatch[1].replace(/\*\*/g, '');
          currentCard += `<div style="color: #aaa; font-style: italic; margin-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.8rem;">💡 ${cleanReason}</div>`;
          continue;
        }
        
        if (line && !line.match(/^#+\s*\d+\./)) {
          const cleanLine = line.replace(/^\*\s*/, '');
          currentCard += `<div style="color: #e0e0e0; line-height: 1.6; margin-top: 0.3rem;">${cleanLine}</div>`;
        }
      } else {
        if (line) {
          const cleanLine = line.replace(/^#+\s*/, '');
          formattedHTML += `<div style="margin: 0.5rem 0; color: #ddd; line-height: 1.6;">${cleanLine}</div>`;
        }
      }
    }
    
    if (currentCard) {
      formattedHTML += `${currentCard}</div></div>`;
    }
    
    return formattedHTML;
  };

  const extractRecommendationsFromText = async (text) => {
    const recommendations = [];
    const titleRegex = /(?:^|\n)\s*(?:#+)?\s*\d+\.\s*(.+?)(?:\s*\((\d{4})\))?$/gm;
    
    let match;
    while ((match = titleRegex.exec(text)) !== null && recommendations.length < 5) {
      let title = match[1].trim();
      const year = match[2];
      
      title = title.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      
      console.log(`🔍 Buscando no TMDB: "${title}" (${year || 'sem ano'})`);
      
      const tmdbResult = await searchTMDB(title, year);
      if (tmdbResult) {
        console.log(`✅ Encontrado: ${tmdbResult.title || tmdbResult.name}`);
        recommendations.push(tmdbResult);
      } else {
        console.log(`❌ Não encontrado: ${title}`);
      }
    }

    return recommendations;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!GEMINI_API_KEY) {
      const errorMessage = {
        role: 'assistant',
        content: language === 'pt-BR' 
          ? 'Erro: Chave da API do Gemini não configurada. Por favor, adicione VITE_GEMINI_API_KEY no arquivo .env'
          : 'Error: Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const prompt = generatePrompt(input);
      
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Resposta inesperada da API:', data);
        throw new Error('Formato de resposta inválido da API');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      
      const extractedRecs = await extractRecommendationsFromText(aiResponse);
      
      setRecommendations(prev => {
        const newRecs = extractedRecs.filter(newRec => 
          !prev.some(existingRec => existingRec.id === newRec.id)
        );
        return [...prev, ...newRecs];
      });
      
      const aiMessage = { 
        role: 'assistant', 
        content: aiResponse,
        recommendations: extractedRecs
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Erro detalhado:', error);
      const errorMessage = {
        role: 'assistant',
        content: language === 'pt-BR' 
          ? `Desculpe, ocorreu um erro ao gerar recomendações.\n\nDetalhes: ${error.message}\n\nDica: Verifique se sua chave da API do Gemini é válida em https://aistudio.google.com/`
          : `Sorry, an error occurred while generating recommendations.\n\nDetails: ${error.message}\n\nTip: Check if your Gemini API key is valid at https://aistudio.google.com/`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const starterQuestions = language === 'pt-BR' ? [
    "Quero um filme triste de ficção científica",
    "Sugira uma série de comédia leve",
    "Filmes de ação com reviravoltas",
    "Animes de aventura e fantasia"
  ] : [
    "I want a sad sci-fi movie",
    "Suggest a light comedy series",
    "Action movies with plot twists",
    "Adventure and fantasy anime"
  ];

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1><BiBot /> CineVerse AI</h1>
            <p>{language === 'pt-BR' 
              ? 'Encontre sua próxima obsessão com recomendações personalizadas' 
              : 'Find your next obsession with personalized recommendations'}</p>
          </div>
          {messages.length > 0 && (
            <button 
              onClick={clearHistory}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                color: '#ef4444',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#ef4444';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.color = '#ef4444';
              }}
              title={language === 'pt-BR' ? 'Limpar histórico' : 'Clear history'}
            >
              <BiX size={20} />
              {language === 'pt-BR' ? 'Limpar' : 'Clear'}
            </button>
          )}
        </div>
      </Header>

      <MainContent>
        <ChatSection>
          <MediaSelector>            
            {(myFavorites.length > 0 || myWatchlist.length > 0) && (
              <QuickActions>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>{language === 'pt-BR' ? 'Ação Rápida' : 'Quick Actions'}</h3>
                
                  <QuickActionTabs>
                    <button 
                      onClick={() => setQuickActionFilter('favorites')}
                      className={quickActionFilter === 'favorites' ? 'active' : ''}
                      disabled={myFavorites.length === 0}
                    >
                      ❤️ {language === 'pt-BR' ? 'Favoritos' : 'Favorites'}
                      {myFavorites.length > 0 && <span className="count">{myFavorites.length}</span>}
                    </button>
                    <button 
                      onClick={() => setQuickActionFilter('watchlist')}
                      className={quickActionFilter === 'watchlist' ? 'active' : ''}
                      disabled={myWatchlist.length === 0}
                    >
                      📋 {language === 'pt-BR' ? 'Quero Ver' : 'Watchlist'}
                      {myWatchlist.length > 0 && <span className="count">{myWatchlist.length}</span>}
                    </button>
                  </QuickActionTabs>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem' }}>
                  {language === 'pt-BR' 
                    ? 'Clique para adicionar aos filmes que você gosta abaixo:' 
                    : 'Click to add to movies you like below:'}
                </p>
                
                <QuickActionsGrid>
                  {quickActionFilter === 'favorites' && myFavorites.slice(0, 12).map(movie => (
                    <QuickActionCard
                      key={`fav-${movie.id}`}
                      onClick={() => addToSelected(movie)}
                      $isSelected={selectedMedia.find(m => m.id === movie.id)}
                    >
                      <img 
                        src={movie.poster_path 
                          ? imageUrl + movie.poster_path 
                          : 'https://via.placeholder.com/185x278/1e293b/8b5cf6?text=No+Image'
                        } 
                        alt={movie.title || movie.name} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/185x278/1e293b/8b5cf6?text=No+Image';
                        }}
                      />
                      <span>{movie.title || movie.name}</span>
                      <div className="badge">❤️</div>
                    </QuickActionCard>
                  ))}
                  
                  {quickActionFilter === 'watchlist' && myWatchlist.slice(0, 12).map(movie => (
                    <QuickActionCard
                      key={`watch-${movie.id}`}
                      onClick={() => addToSelected(movie)}
                      $isSelected={selectedMedia.find(m => m.id === movie.id)}
                    >
                      <img 
                        src={movie.poster_path 
                          ? imageUrl + movie.poster_path 
                          : 'https://via.placeholder.com/185x278/1e293b/8b5cf6?text=No+Image'
                        } 
                        alt={movie.title || movie.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/185x278/1e293b/8b5cf6?text=No+Image';
                        }}
                      />
                      <span>{movie.title || movie.name}</span>
                      <div className="badge">📋</div>
                    </QuickActionCard>
                  ))}
                </QuickActionsGrid>
              </QuickActions>
            )}

            <h3>{language === 'pt-BR' ? 'Filmes/Séries que você gosta (opcional):' : 'Movies/Series you like (optional):'}</h3>
            
            <SearchBox>
              <BiSearch />
              <input
                type="text"
                placeholder={language === 'pt-BR' ? "Buscar para adicionar..." : "Search to add..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBox>

            {searchResults.length > 0 && (
              <SearchResults>
                {searchResults.map(item => (
                  <SearchItem 
                    key={item.id} 
                    onClick={() => addToSelected(item)}
                    $isSelected={selectedMedia.find(m => m.id === item.id)}
                  >
                    <img 
                      src={imageUrl + item.poster_path} 
                      alt={item.title || item.name} 
                    />
                    <span>{item.title || item.name}</span>
                  </SearchItem>
                ))}
              </SearchResults>
            )}

            {selectedMedia.length > 0 && (
              <SelectedList>
                {selectedMedia.map(media => (
                  <SelectedItem key={media.id}>
                    <img src={imageUrl + media.poster_path} alt={media.title || media.name} />
                    <span>{media.title || media.name}</span>
                    <button onClick={() => removeFromSelected(media.id)}>
                      <BiX />
                    </button>
                  </SelectedItem>
                ))}
              </SelectedList>
            )}
          </MediaSelector>

          <ChatBox>
            <MessagesArea>
              {messages.length === 0 && (
                <WelcomeMessage>
                  <BiBot />
                  <h2>{language === 'pt-BR' ? 'Olá! Como posso ajudar?' : 'Hello! How can I help?'}</h2>
                  <p>{language === 'pt-BR' 
                    ? 'Descreva o tipo de filme ou série que você quer assistir, ou selecione alguns favoritos acima!'
                    : 'Describe what you want to watch, or select some favorites above!'}</p>
                  
                  <StarterButtons>
                    {starterQuestions.map((q, i) => (
                      <button key={i} onClick={() => setInput(q)}>
                        {q}
                      </button>
                    ))}
                  </StarterButtons>
                </WelcomeMessage>
              )}

              {messages.map((msg, index) => (
                <Message key={index} $isUser={msg.role === 'user'}>
                  <div className="icon">
                    {msg.role === 'user' ? <BiUser /> : <BiBot />}
                  </div>
                  <div 
                    className="content"
                    dangerouslySetInnerHTML={{ 
                      __html: msg.role === 'assistant' 
                        ? formatAIResponse(msg.content, msg.recommendations || []) 
                        : msg.content 
                    }}
                  />
                </Message>
              ))}

              {loading && (
                <Message $isUser={false}>
                  <div className="icon"><BiBot /></div>
                  <div className="content">
                    <BiLoaderAlt className="spinner" /> {language === 'pt-BR' ? 'Pensando...' : 'Thinking...'}
                  </div>
                </Message>
              )}

              <div ref={chatEndRef} />
            </MessagesArea>

            <InputArea>
              <input
                type="text"
                placeholder={language === 'pt-BR' 
                  ? "Descreva o que você quer assistir..." 
                  : "Describe what you want to watch..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}>
                <BiSend />
              </button>
            </InputArea>
          </ChatBox>
        </ChatSection>

        {recommendations.length > 0 && (
          <RecommendationsGrid>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>
                {language === 'pt-BR' ? 'Recomendações' : 'Recommendations'} 
                <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>({recommendations.length})</span>
              </h2>
              <button
                onClick={() => setRecommendations([])}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid #ef4444',
                  color: '#ef4444',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#ef4444';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.color = '#ef4444';
                }}
                title={language === 'pt-BR' ? 'Limpar todas as recomendações' : 'Clear all recommendations'}
              >
                {language === 'pt-BR' ? 'Limpar Tudo' : 'Clear All'}
              </button>
            </div>
            <div className="grid">
              {recommendations.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </RecommendationsGrid>
        )}
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: var(--text-white);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.2rem;
    color: var(--text-gray);
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const ChatSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;

  @media(max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MediaSelector = styled.div`
  h3 {
    margin-bottom: 1rem;
    color: var(--primary);
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;

  svg {
    font-size: 1.5rem;
    color: var(--text-gray);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-white);
    font-size: 1rem;
  }
`;

const SearchResults = styled.div`
  background: var(--surface);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
`;

const SearchItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  cursor: pointer;
  transition: 0.2s;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: ${props => props.$isSelected ? 'var(--primary)' : 'transparent'};

  &:hover {
    background: ${props => props.$isSelected ? 'var(--primary)' : 'rgba(139, 92, 246, 0.2)'};
  }

  img {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  span {
    flex: 1;
    font-size: 0.9rem;
  }
`;

const SelectedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary);
  padding: 0.3rem 0.3rem 0.3rem 0.5rem;
  border-radius: 20px;
  font-size: 0.85rem;

  img {
    width: 30px;
    height: 45px;
    object-fit: cover;
    border-radius: 4px;
  }

  button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    padding: 0.2rem;
    transition: 0.2s;

    &:hover { transform: scale(1.2); }
  }
`;

const ChatBox = styled.div`
  background: var(--surface);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid rgba(139, 92, 246, 0.3);
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 2rem;

  svg {
    font-size: 4rem;
    color: var(--primary);
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-gray);
    margin-bottom: 2rem;
  }
`;

const StarterButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;

  button {
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid var(--primary);
    color: var(--text-white);
    padding: 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
    font-size: 0.9rem;

    &:hover {
      background: var(--primary);
    }
  }
`;

const Message = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};

  .icon {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: ${props => props.$isUser ? 'var(--secondary)' : 'var(--primary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg { font-size: 1.2rem; }
  }

  .content {
    flex: 1;
    background: ${props => props.$isUser ? 'rgba(6, 182, 212, 0.2)' : 'rgba(139, 92, 246, 0.2)'};
    padding: 1rem;
    border-radius: 12px;
    line-height: 1.6;
    white-space: pre-line;
  }
`;

const InputArea = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);

  input {
    flex: 1;
    background: var(--background);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 0.8rem 1rem;
    color: var(--text-white);
    outline: none;
    font-size: 0.95rem;

    &:focus {
      border-color: var(--primary);
    }
  }

  button {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: var(--primary);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.3s;
    font-size: 1.3rem;

    &:hover:not(:disabled) {
      background: var(--secondary);
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const RecommendationsGrid = styled.div`
  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--secondary);
    text-align: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
  }
`;

const QuickActions = styled.div`
  background: rgba(6, 182, 212, 0.1);
  border: 2px solid rgba(6, 182, 212, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;

  h3 {
    font-size: 1.2rem;
    color: var(--secondary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const QuickActionTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.3rem;
  border-radius: 8px;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #aaa;
    font-weight: bold;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    &.active {
      background: var(--secondary);
      color: white;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
    }

    .count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
      font-size: 0.75rem;
      min-width: 20px;
      text-align: center;
    }

    &.active .count {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  @media (max-width: 768px) {
    button {
      font-size: 0.75rem;
      padding: 0.4rem 0.7rem;
    }
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
`;

const QuickActionCard = styled.div`
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 2px solid ${props => props.$isSelected ? 'var(--secondary)' : 'transparent'};
  opacity: ${props => props.$isSelected ? 0.5 : 1};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    border-color: var(--secondary);
  }

  img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    display: block;
  }

  span {
    display: block;
    padding: 0.5rem;
    background: rgba(0,0,0,0.8);
    color: white;
    font-size: 0.75rem;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0,0,0,0.8);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  ${props => props.$isSelected && `
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--secondary);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
    }
  `}
`;

export default AIRecommendations;