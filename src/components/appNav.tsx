import dllogo from '../images/dllogo.png';
import dllogo2 from '../images/dllogo2.png';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

interface AppNavProps {
  authToken: string | null;
  minimal: boolean;
  onSignOut: () => void;
}

const AppNav: React.FC<AppNavProps> = ({ authToken, minimal, onSignOut }) => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['AuthToken']);
  const userId = cookies.AuthToken;

  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsTransparent(window.scrollY > 50); 
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = (route: string) => {
    navigate(route);
  };

  const handleSignOut = async () => {
    try {
      removeCookie('AuthToken');
      await removeCookie('AuthToken');
      onSignOut();
      navigate('/');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 shadow-md transition-opacity duration-500"
      style={{
        backgroundColor: '#2f3e83',
        opacity: isTransparent ? 0.7 : 1,
        transition: 'opacity 0.5s ease-in-out', 
      }}
    >
      <div className="logo-container">
        <img className="w-24 h-auto" src={minimal ? dllogo : dllogo2} alt="logo" />
      </div>

      {authToken && !minimal && (
        <div className="flex space-x-4">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleClick('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleClick('/admin')}
          >
            Admin
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default AppNav;

