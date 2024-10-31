import React, { useEffect, useState } from 'react';
import dllogo from "../images/dllogo.png";
import dllogo2 from "../images/dllogo2.png";

interface NavProps {
  authToken: string | null;
  minimal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
  setIsSignUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const Nav: React.FC<NavProps> = ({ authToken, minimal, setShowModal, showModal, setIsSignUp }) => {
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsTransparent(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    setShowModal(true);
    setIsSignUp(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center py-4 px-6 shadow-md transition-opacity duration-500"
      style={{
        backgroundColor: '#2f3e83',
        opacity: isTransparent ? 0.7 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <div className="logo-container">
        <img className="h-12" src={minimal ? dllogo : dllogo2} alt="logo" />
      </div>

      {!authToken && !minimal && (
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150"
          onClick={handleClick}
          disabled={showModal}
        >
          Log in
        </button>
      )}
    </nav>
  );
};

export default Nav;

