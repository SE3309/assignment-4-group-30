import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageUsers.css';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUserEmail = localStorage.getItem('email'); // Retrieve current user's email

  // Fetch users when the component loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found, please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data.users);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Please log in again.');
          localStorage.removeItem('token'); // Optional: Clear invalid token
        } else {
          setError('Failed to fetch users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle deleting a user
  const handleDeleteUser = async (userId, email) => {
    if (email === currentUserEmail) {
      alert('You cannot delete your own account.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in again.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user.UserID !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="manage-users">
      <h1>Admin Dashboard</h1>

      {/* Navigation Links */}
      <div className="nav-links">
        <button onClick={() => navigate('/dashboard')}>Manage Polls</button>
        <button onClick={() => navigate('/users')}>Manage Users</button>
        <button onClick={() => navigate('/submissions')}>Review Submissions</button>
        <button onClick={() => navigate('/comments')}>Manage Comments</button>
      </div>

      {/* User Management Section */}
      <div className="user-management">
        <h2>Manage Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Bio</th>
                <th>Points</th>
                <th>Lifetime Points</th>
                <th>Streak</th>
                <th>Prediction Accuracy</th>
                <th>Front Displayed</th>
                <th>Middle Displayed</th>
                <th>Back Displayed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.UserID}>
                  <td>{user.UserID}</td>
                  <td>{user.Username}</td>
                  <td>{user.Email}</td>
                  <td>{user.ProfileBio}</td>
                  <td>{user.Points}</td>
                  <td>{user.LifetimePoints}</td>
                  <td>{user.Streak}</td>
                  <td>{(user.PredictionAccuracy * 100).toFixed(2)}%</td>
                  <td>{user.FrontDisplayed}</td>
                  <td>{user.MiddleDisplayed}</td>
                  <td>{user.BackDisplayed}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user.UserID, user.Email)}
                      disabled={user.Email === currentUserEmail} // Disable delete for self
                    >
                      {user.Email === currentUserEmail ? 'You' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
