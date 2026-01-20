import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movie from './pages/Movie';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Actor from './pages/Actor';
import NotFound from './pages/NotFound';
import Series from './pages/Series';
import Season from './pages/Season';
import AIRecommendations from './pages/AIRecommendations';
import Profile from './pages/Profile';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<Movie />} />
        <Route path="/tv/:id" element={<Series />} />
        <Route path="/tv/:seriesId/season/:seasonNumber" element={<Season />} />
        <Route path="/search" element={<Search />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/actor/:id" element={<Actor />} />
        <Route path="/ai-recommendations" element={<AIRecommendations />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;