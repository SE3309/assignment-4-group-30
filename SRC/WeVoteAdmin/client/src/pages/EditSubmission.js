import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditPoll.css'; // Reuse the same CSS for consistent styling

const EditSubmission = () => {
  const { id } = useParams(); // Get submission ID from the URL
  const navigate = useNavigate();

  const [submission, setSubmission] = useState({
    title: '',
    description: '',
    optionA: '',
    optionB: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch submission details when the component loads
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found, please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/auth/suggestions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSubmission({
          title: response.data.Title,
          description: response.data.Description,
          optionA: response.data.OptionA,
          optionB: response.data.OptionB,
        });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Please log in again.');
          localStorage.removeItem('token'); // Optional: Clear invalid token
        } else {
          setError('Failed to fetch submission details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmission((prevSubmission) => ({
      ...prevSubmission,
      [name]: value,
    }));
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

      await axios.put(`http://localhost:5000/api/auth/suggestions/${id}`, submission, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/submissions'); // Redirect to submissions page after saving changes
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  return (
    <div className="edit-poll">
      <h1>Edit Submission</h1>
      {loading ? (
        <p>Loading submission details...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title" // Lowercase to match state key
              value={submission.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              name="description" // Lowercase to match state key
              value={submission.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Option A:</label>
            <input
              type="text"
              name="optionA" // Lowercase to match state key
              value={submission.optionA}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Option B:</label>
            <input
              type="text"
              name="optionB" // Lowercase to match state key
              value={submission.optionB}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      )}
    </div>
  );
};

export default EditSubmission;
