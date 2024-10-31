import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Dashboard from './pages//Dashboard';
import Admin from './pages/admin'; 
import { useCookies } from 'react-cookie';

const App: React.FC = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['AuthToken', 'UserId']);
  const [authToken, setAuthToken] = useState<string | null>(cookies.AuthToken || null);

  useEffect(() => {
    setAuthToken(cookies.AuthToken || null);
  }, [cookies.AuthToken]);

  const handleSignOut = () => {
    removeCookie('AuthToken', { path: '/' });
    removeCookie('UserId', { path: '/' });
    setAuthToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={authToken ? <Navigate to="/dashboard" /> : <Home />}
        />
        <Route 
          path="/dashboard" 
          element={authToken ? <Dashboard onSignOut={handleSignOut} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin" 
          element={authToken ? <Admin onSignOut={handleSignOut} /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
