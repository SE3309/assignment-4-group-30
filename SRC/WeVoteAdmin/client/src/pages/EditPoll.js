import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditPoll.css';

const EditPoll = () => {
  const { id } = useParams(); // Get poll ID from the URL
  const navigate = useNavigate();

  const [poll, setPoll] = useState({
    title: '',
    description: '',
    options: {
      a: '',
      b: '',
    },
    closed: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch poll details when the component loads
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found, please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/auth/polls/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPoll(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Please log in again.');
          localStorage.removeItem('token'); // Optional: Clear invalid token
        } else {
          setError('Failed to fetch poll details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the input belongs to options.a or options.b
    if (name === 'options.a' || name === 'options.b') {
      const optionKey = name.split('.')[1]; // Extract 'a' or 'b'
      setPoll((prevPoll) => ({
        ...prevPoll,
        options: {
          ...prevPoll.options,
          [optionKey]: value,
        },
      }));
    } else {
      setPoll((prevPoll) => ({
        ...prevPoll,
        [name]: name === 'closed' ? e.target.checked : value,
      }));
    }
  };

  // Handle form submission to save changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in again.');
        return;
      }

      await axios.put(`http://localhost:5000/api/auth/polls/${id}`, poll, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/dashboard'); // Redirect to dashboard after saving changes
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  return (
    <div className="edit-poll">
      <h1>Edit Poll</h1>
      {loading ? (
        <p>Loading poll details...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={poll.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              name="description"
              value={poll.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Option A:</label>
            <input
              type="text"
              name="options.a"
              value={poll.options.a}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Option B:</label>
            <input
              type="text"
              name="options.b"
              value={poll.options.b}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="closed"
                checked={poll.closed}
                onChange={handleChange}
              />
              Closed
            </label>
          </div>
          <button type="submit">Save Changes</button>
        </form>
      )}
    </div>
  );
};

export default EditPoll;
