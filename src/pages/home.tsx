import React, { useState } from 'react';
import AuthModal from './../components/AuthModal';
import { useCookies } from 'react-cookie';
import Nav from './../components/homeNav';

const Home: React.FC = () => {
  const [cookies, , removeCookie] = useCookies(['UserId', 'AuthToken']);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(true);

  const authToken = cookies.AuthToken;

  const handleClick = () => {
    if (authToken) {
      removeCookie('UserId', { path: '/' });
      removeCookie('AuthToken', { path: '/' });
      window.location.reload();
      return;
    }
    setShowModal(true);
    setIsSignUp(true);
  };

  return (
    <div className="overlay min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#2f3e83' }}>
      <Nav
        authToken={authToken}
        minimal={false}
        setShowModal={setShowModal}
        showModal={showModal}
        setIsSignUp={setIsSignUp}
      />
      <div className="home w-full max-w-lg bg-white rounded-lg shadow-lg p-8 text-center mt-6">
        <h1 className="text-4xl font-semibold text-gray-800 mb-6">DoorLoop Command Bridge</h1>
        <p className="text-gray-600 mb-8">Sign in to access the dashboard and manage your team effectively.</p>

        {/* Conditionally render the Create Account button based on showModal */}
        {!showModal && (
          <button
            className="bg-[#ff4998] hover:bg-[#ff3b8a] text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
            onClick={handleClick}
          >
            {authToken ? 'Sign Out' : 'Create Account'}
          </button>
        )}

        {showModal && <AuthModal setShowModal={setShowModal} isSignUp={isSignUp} />}
      </div>
    </div>
  );
};

export default Home;


