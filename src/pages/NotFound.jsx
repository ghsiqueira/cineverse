import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BiErrorCircle } from 'react-icons/bi';
import { motion } from "framer-motion";

const NotFound = () => {
  const messages = [
    "Houston, we have a problem.",
    "I think we're not in Kansas anymore.",
    "This is not the page you are looking for.",
    "Hasta la vista, page.",
    "My precious... page is missing!",
    "I see dead links...",
    "Oops! It seems like you're lost in the multiverse.",
    "E.T. phone home... but this page didn't answer.",
    "May the 404 be with you.",
    "There's no place like home (click the button below)."
  ];

  const randomMessage = useMemo(() => {
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  return (
    <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
      <div className="content">
        <BiErrorCircle className="icon" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>"{randomMessage}"</p>
        <Link to="/" className="back-btn">Go Back Home</Link>
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  color: var(--text-white);
  padding: 0 1rem;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    animation: float 3s ease-in-out infinite;
  }

  .icon {
    font-size: 5rem;
    color: var(--primary);
  }

  h1 {
    font-size: 6rem;
    font-weight: 900;
    margin: 0;
    line-height: 1;
    background: linear-gradient(to right, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-gray);
    font-size: 1.5rem;
    font-style: italic;
    margin-bottom: 2rem;
    max-width: 600px;
  }

  .back-btn {
    background-color: var(--primary);
    color: white;
    padding: 1rem 2rem;
    border-radius: 30px;
    font-weight: bold;
    font-size: 1.1rem;
    transition: 0.3s;
    border: 2px solid var(--primary);
  }

  .back-btn:hover {
    background-color: transparent;
    color: var(--primary);
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
`;

export default NotFound;