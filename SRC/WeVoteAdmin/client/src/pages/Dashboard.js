import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch polls when the component loads
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found, please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/polls', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPolls(response.data.polls);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Please log in again.');
          localStorage.removeItem('token'); // Optional: Clear invalid token
        } else {
          setError('Failed to fetch polls');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handleDeletePoll = async (pollId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in again.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/auth/polls/${pollId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
    } catch (err) {
      setError('Failed to delete poll');
    }
  };
  const handleReverifyVotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in again.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/auth/polls/reverify',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
    } catch (err) {
      setError('Failed to reverify votes');
    }
  };
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* Navigation Links */}
      <div className="nav-links">
        <button onClick={() => navigate('/dashboard')}>Manage Polls</button>
        <button onClick={() => navigate('/users')}>Manage Users</button>
        <button onClick={() => navigate('/submissions')}>Review Submissions</button>
        <button onClick={() => navigate('/comments')}>Manage Comments</button>
      </div>

      {/* Poll Management Section */}
      <div className="poll-management">
        <h2>Manage Polls</h2>
        <button className="reverify-button" onClick={handleReverifyVotes}>          
        Reverify Votes
        </button>
        <button className="reverify-button" onClick={() => navigate('/createPoll')}>     
        Create Poll
        </button>

        {loading ? (
          <p>Loading polls...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Winning</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {polls.map((poll) => (
                <tr key={poll.id}>
                  <td>{poll.id}</td>
                  <td>{poll.title}</td>
                  <td>{poll.winningVotes}</td>
                  <td>{poll.closed ? 'Closed' : 'Open'}</td>
                  <td>
                    <button onClick={() => navigate(`/polls/edit/${poll.id}`)}>Edit</button>
                    <button onClick={() => handleDeletePoll(poll.id)}>Delete</button>
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
export default Dashboard;
