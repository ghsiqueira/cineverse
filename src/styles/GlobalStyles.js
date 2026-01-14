import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  :root {
    /* "Verse" Theme Palette */
    --primary: #8B5CF6;       /* Violeta Vibrante (Primary) */
    --secondary: #06B6D4;     /* Ciano (Detalhes/Hover) */
    --background: #0F172A;    /* Azul Slate Muito Escuro (Fundo) */
    --surface: #1E293B;       /* Azul um pouco mais claro (Cards/Navbar) */
    --text-white: #F8FAFC;    /* Branco Off-white (Leitura melhor) */
    --text-gray: #94A3B8;     /* Cinza azulado (Subtextos) */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', 'Helvetica Neue', sans-serif; /* Fonte limpa */
  }

  body {
    background-color: var(--background);
    color: var(--text-white);
    -webkit-font-smoothing: antialiased; /* Deixa a fonte mais nítida */
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: 0.3s;
  }

  a:hover {
    color: var(--secondary);
  }

  ul {
    list-style: none;
  }
  
  button {
    cursor: pointer;
  }
`;