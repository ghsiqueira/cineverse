import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

export const Skeleton = styled.div`
  background: #1f2937; 
  background-image: linear-gradient(
    to right,
    #1f2937 0%,
    #374151 20%, 
    #1f2937 40%,
    #1f2937 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear forwards;
  border-radius: 1rem;
  
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100%'};
  margin-bottom: ${props => props.mb || '0'};
`;