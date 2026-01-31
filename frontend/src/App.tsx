import React, { useState } from 'react';
import Login from './components/Login';
import ReportList from './components/ReportList';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ReportList token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
