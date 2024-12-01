import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageComments.css';

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        weekday: 'short', // Optional: Shows abbreviated weekday
        year: 'numeric',
        month: 'short', // Optional: Shows abbreviated month
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // Ensures AM/PM format
    });
};

const ManageComments = () => {
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token found, please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/auth/comments', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setComments(response.data.comments);
            } catch (err) {
                setError('Failed to fetch comments');
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found, please log in again.');
                return;
            }

            await axios.delete(`http://localhost:5000/api/auth/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setComments((prevComments) => prevComments.filter((comment) => comment.CommentID !== commentId));
        } catch (err) {
            setError('Failed to delete comment');
        }
    };

    const handleDeleteReply = async (replyId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found, please log in again.');
                return;
            }

            await axios.delete(`http://localhost:5000/api/auth/replies/${replyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setComments((prevComments) =>
                prevComments.map((comment) => ({
                    ...comment,
                    Replies: comment.Replies.filter((reply) => reply.ReplyID !== replyId),
                }))
            );
        } catch (err) {
            setError('Failed to delete reply');
        }
    };

    return (
        <div className="manage-comments">
            <h1>Admin Dashboard</h1>

            {/* Navigation Links */}
            <div className="nav-links">
                <button onClick={() => navigate('/dashboard')}>Manage Polls</button>
                <button onClick={() => navigate('/users')}>Manage Users</button>
                <button onClick={() => navigate('/submissions')}>Review Submissions</button>
                <button onClick={() => navigate('/comments')}>Manage Comments</button>
            </div>

            {/* Comments Management Section */}
            <div className="comments-section">
                <h2>Manage Comments</h2>
                {loading ? (
                    <p>Loading comments...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <div className="comments-container">
                        {comments.map((comment) => (
                            <div key={comment.CommentID} className="comment-item">
                                <div className="comment-header">
                                    <p>
                                        <strong>{comment.Username}</strong> ({formatDateTime(comment.CommentTimeSubmitted)}): {comment.Content}
                                    </p>
                                    <button onClick={() => handleDeleteComment(comment.CommentID)}>Delete Comment</button>
                                </div>
                                {comment.Replies && comment.Replies.length > 0 && (
                                    <div className="replies-container">
                                        <h4>Replies</h4>
                                        {comment.Replies.map((reply) => (
                                            <div key={reply.ReplyID} className="reply-item">
                                                <p>
                                                    <strong>{reply.Username}</strong> ({formatDateTime(reply.CommentTimeSubmitted)}): {reply.Content}
                                                </p>
                                                <button onClick={() => handleDeleteReply(reply.ReplyID)}>Delete Reply</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageComments;
