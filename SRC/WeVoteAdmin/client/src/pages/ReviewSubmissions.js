import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReviewSubmissions.css';

const ReviewSubmissions = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch submissions when the component loads
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token found, please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/auth/suggestions', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSubmissions(response.data.suggestions);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized: Please log in again.');
                    localStorage.removeItem('token'); // Optional: Clear invalid token
                } else {
                    setError('Failed to fetch submissions');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    // Handle approving a suggestion
    const handleApprove = async (suggestionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found, please log in again.');
                return;
            }

            await axios.post(
                `http://localhost:5000/api/auth/suggestions/${suggestionId}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSubmissions((prevSubmissions) =>
                prevSubmissions.filter((submission) => submission.SuggestionID !== suggestionId)
            );
        } catch (err) {
            setError('Failed to approve suggestion');
        }
    };

    // Handle dismissing a suggestion
    const handleDismiss = async (suggestionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found, please log in again.');
                return;
            }

            await axios.post(
                `http://localhost:5000/api/auth/suggestions/${suggestionId}/dismiss`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSubmissions((prevSubmissions) =>
                prevSubmissions.filter((submission) => submission.SuggestionID !== suggestionId)
            );
        } catch (err) {
            setError('Failed to dismiss suggestion');
        }
    };

    // Navigate to EditSubmission.js
    const handleEdit = (suggestionId) => {
        navigate(`/submissions/edit/${suggestionId}`);
    };

    return (
        <div className="review-submissions">
            <h1>Admin Dashboard</h1>

            {/* Navigation Links */}
            <div className="nav-links">
                <button onClick={() => navigate('/dashboard')}>Manage Polls</button>
                <button onClick={() => navigate('/users')}>Manage Users</button>
                <button onClick={() => navigate('/submissions')}>Review Submissions</button>
                <button onClick={() => navigate('/comments')}>Manage Comments</button>
            </div>

            <div className="submissions-section">
                <h2>Review Submissions</h2>
                {loading ? (
                    <p>Loading submissions...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : submissions.length === 0 ? (
                    <p>No submissions to review.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Option A</th>
                                <th>Option B</th>
                                <th>Submitted By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.SuggestionID}>
                                    <td>{submission.SuggestionID}</td>
                                    <td>{submission.Title}</td>
                                    <td>{submission.Description}</td>
                                    <td>{submission.OptionA}</td>
                                    <td>{submission.OptionB}</td>
                                    <td>{submission.SuggesterID}</td>
                                    <td>
                                        <button onClick={() => handleApprove(submission.SuggestionID)}>
                                            Approve
                                        </button>
                                        <button
                                            className="grey-button"
                                            onClick={() => handleDismiss(submission.SuggestionID)}
                                        >
                                            Dismiss
                                        </button>
                                        <button className="grey-button" onClick={() => handleEdit(submission.SuggestionID)}>
                                            
                                            Edit
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

export default ReviewSubmissions;
