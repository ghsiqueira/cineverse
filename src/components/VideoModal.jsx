import styled from "styled-components";
import { BiX } from "react-icons/bi";

const VideoModal = ({ trailerKey, onClose }) => {
  if (!trailerKey) return null;

  return (
    <Overlay onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
            <BiX />
        </button>
        <div className="video-wrapper">
            <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title="Trailer"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            ></iframe>
        </div>
      </div>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  .modal-content {
    width: 100%;
    max-width: 900px;
    background: #000;
    border-radius: 8px;
    position: relative;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }

  .close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: transparent;
    border: none;
    color: white;
    font-size: 2.5rem;
    cursor: pointer;
  }

  .video-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
  }

  .video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }
`;

export default VideoModal;