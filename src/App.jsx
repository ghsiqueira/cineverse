import { BrowserRouter } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <h1>CineVerse Setup Ready</h1>
    </BrowserRouter>
  );
}

export default App;