import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

interface AuthModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  isSignUp: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ setShowModal, isSignUp }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [cookies, setCookie] = useCookies(['AuthToken', 'UserId']);
  const [active, setActive] = useState<boolean>(false);  

  const navigate = useNavigate();

  useEffect(() => {
    setActive(true);  
  }, []);

  const handleClick = () => {
    setActive(false);  
    setTimeout(() => setShowModal(false), 500);  
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isSignUp && password !== confirmPassword) {
        setError('Passwords need to match.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/${isSignUp ? 'api/auth/signup' : 'api/auth/login'}`,
        { email, password }
      );

      const success = response.status === 201 || response.status === 200;

      if (isSignUp && response.data.pendingApproval) {
        setError('Your account is pending approval. Please wait for a Supervisor.');
        return;
      }

      setCookie('AuthToken', response.data.token, { path: '/' });
      setCookie('UserId', response.data.userId, { path: '/' });

      if (success) navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      console.log(error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div
      className={`auth-modal bg-gray-100 p-6 rounded-lg shadow-lg transition-opacity duration-500 ${
        active ? 'fade-in' : 'fade-out'
      }`}
    >
      <div className="close-icon text-right mb-4 cursor-pointer text-xl" onClick={handleClick}>
        ⓧ
      </div>

      <h2 className="text-2xl font-bold mb-4">{isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}</h2>
      <p className="mb-6 text-gray-700">
        {isSignUp
          ? 'Welcome to the DoorLoop Command Bridge. You will need to be approved before you can login.'
          : 'Welcome to the DoorLoop Command Bridge.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          id="email"
          name="email"
          placeholder="email"
          required
          onChange={(e) => setEmail(e.target.value as string)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="password"
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
        {isSignUp && (
          <input
            type="password"
            id="password-check"
            name="password-check"
            placeholder="confirm password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        )}
        <input
          type="submit"
          value={isSignUp ? 'Create Account' : 'Log In'}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
        />
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <hr className="my-6" />
    </div>
  );
};

export default AuthModal;
