# 🎬 CineVerse - AI Powered Movie Explorer

![Status](https://img.shields.io/badge/status-live-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/vite-4.4.5-646CFF?logo=vite)

> **CineVerse** é uma plataforma moderna e imersiva para descoberta de filmes e séries, potencializada por Inteligência Artificial. Mais do que um catálogo, é uma ferramenta completa para cinéfilos acompanharem lançamentos, gerenciarem suas listas e testarem seus conhecimentos.

---

## 🖼️ Preview

[🔗 **Clique aqui para acessar a demonstração online**](https://cineverse-weld.vercel.app/)

---

## 🚀 Funcionalidades Principais

### 🧠 Inteligência Artificial (CineVerse AI)
- Chatbot integrado utilizando a **Google Gemini API**
- Recomendações personalizadas baseadas no humor, gênero ou filmes anteriores do usuário
- Interação natural em múltiplos idiomas

### 📺 Séries & Tracker de Progresso
- **Gerenciamento de Episódios:** Marque episódios assistidos e visualize seu progresso em barras percentuais
- **Temporadas Completas:** Navegação detalhada por temporadas com sinopses, avaliações e elenco
- **Continuidade:** O sistema lembra onde você parou (dados salvos localmente)

### 📅 Organização & Utilitários
- **Calendário de Lançamentos:** Uma timeline inteligente que varre sua Watchlist e mostra exatamente quando saem os próximos episódios ou filmes
- **Onde Assistir:** Integração com dados de streaming para mostrar onde o conteúdo está disponível no Brasil (Netflix, Prime, Disney+, etc.)
- **Listas Pessoais:** Sistema de "Favoritos" e "Watchlist" (Quero Ver) persistentes via LocalStorage

### 🎮 Gamification & Perfil
- **Dashboard do Usuário:** Estatísticas de horas assistidas, gêneros favoritos e total de títulos acompanhados
- **Conquistas:** Badges desbloqueáveis conforme o uso da plataforma
- **CineVerse Quiz:** Um mini-game integrado para testar conhecimentos sobre cinema e bater recordes (High Score)

### 💎 UX/UI Premium
- Design totalmente responsivo (Mobile First)
- Animações fluidas com Framer Motion
- Tratamento de formatação de texto (Markdown) nas críticas de usuários
- Busca instantânea com sugestões em tempo real

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido com as melhores práticas do ecossistema React moderno:

- **Core:** [React.js](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização:** [Styled Components](https://styled-components.com/) (CSS-in-JS)
- **Roteamento:** [React Router DOM](https://reactrouter.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [React Icons](https://react-icons.github.io/react-icons/)
- **Consumo de API:** [Axios](https://axios-http.com/)
- **APIs Externas:**
  - [TMDB API](https://www.themoviedb.org/documentation/api) (Dados de filmes/séries)
  - [Google Gemini API](https://ai.google.dev/) (Inteligência Artificial)

---

## 📂 Estrutura do Projeto

```bash
src/
├── components/      # Componentes reutilizáveis (Navbar, Cards, Modais, Skeleton)
├── context/         # Context API (Gerenciamento de Idioma Global)
├── pages/           # Páginas da aplicação
│   ├── Home.jsx
│   ├── Movie.jsx
│   ├── Series.jsx
│   ├── Season.jsx
│   ├── Profile.jsx
│   ├── Calendar.jsx
│   ├── Quiz.jsx
│   └── ...
├── services/        # Configuração do Axios e chamadas de API
├── styles/          # Estilos globais e variáveis CSS
└── main.jsx         # Ponto de entrada
```

---

## ⚙️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clone o repositório

```bash
git clone https://github.com/ghsiqueira/cineverse.git
cd cineverse
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado nas chaves que você obteve no TMDB e Google AI Studio):

```env
VITE_API_KEY=sua_chave_tmdb_aqui
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
VITE_API_URL=https://api.themoviedb.org/3/
VITE_IMG=https://image.tmdb.org/t/p/w500/
```

### 4. Rode o servidor de desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

---

## 📦 Build para Produção

Para gerar a versão otimizada para produção:

```bash
npm run build
```

Para visualizar o build de produção localmente:

```bash
npm run preview
```

---

## 🎯 Como Usar

1. **Navegue** pelos filmes e séries
2. **Busque** por títulos específicos usando a barra de pesquisa
3. **Adicione** filmes e séries à sua Watchlist ou Favoritos
4. **Acompanhe** seu progresso nas séries episódio por episódio
5. **Converse** com a IA para receber recomendações personalizadas
6. **Teste** seus conhecimentos no CineVerse Quiz
7. **Visualize** seu calendário de lançamentos personalizados

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir Issues ou enviar Pull Requests.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3. Faça o Commit (`git commit -m 'feat: Adicionando nova feature'`)
4. Faça o Push (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com 💜 por **Gabriel Siqueira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gabriel-siqueira-524614164/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ghsiqueira)

---

## 🙏 Agradecimentos

- [TMDB](https://www.themoviedb.org/) pela API de filmes e séries
- [Google](https://ai.google.dev/) pela API Gemini
- Toda a comunidade React por tornar este projeto possível

---

⭐ Se você gostou deste projeto, não esqueça de dar uma estrela no repositório!
