import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import GlobalStyles from './styles/GlobalStyles';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <GlobalStyles />
        <Navbar />
        
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<h2>Home Page Placeholder</h2>} />
            <Route path="/movie/:id" element={<h2>Movie Details Placeholder</h2>} />
            <Route path="/search" element={<h2>Search Results Placeholder</h2>} />
          </Routes>
        </div>

      </BrowserRouter>
    </div>
  );
}

export default App;