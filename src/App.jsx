import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movie from './pages/Movie'; 

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <GlobalStyles />
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/search" element={<h2>Search Results Placeholder</h2>} />
        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;