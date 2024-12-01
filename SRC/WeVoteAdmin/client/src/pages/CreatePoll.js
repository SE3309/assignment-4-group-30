import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditPoll.css';

const CreatePoll = () => {
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

  // Handle form submission to create a poll
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in again.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/auth/polls',
        {
          title: poll.title,
          description: poll.description,
          optionA: poll.options.a,
          optionB: poll.options.b,
          closed: poll.closed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/dashboard'); // Redirect to dashboard after poll creation
    } catch (err) {
      setError('Failed to create poll');
    }
  };

  return (
    <div className="edit-poll">
      <h1>Create Poll</h1>
      {error && <p className="error">{error}</p>}
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
        <button type="submit">Create Poll</button>
      </form>
    </div>
  );
};

export default CreatePoll;
