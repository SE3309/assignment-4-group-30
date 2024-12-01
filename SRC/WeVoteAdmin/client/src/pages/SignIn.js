import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
  
      // Store the token and email in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', username); // Assuming the server returns the user's email
      console.log(localStorage.getItem('email'))
      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (err) {
      // Set error message based on server response or fallback to a default
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };
  

  return (
    <div className="signin-container">
      <form onSubmit={handleSignIn}>
        <h2>Admin Sign-In</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;
