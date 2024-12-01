const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MySQL = require('../utils/database'); // Import the database utility

const router = express.Router();

const HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION =
  '5c7d5ca376c201cb8c9963944d6dc7ecfaa305eeafe114e2132f46e1db3f0714154dc00f826a1509a767852f58fb632e5c839484582d70f4893ca61c80e2f902';

// Middleware to verify the JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(
    token,
    HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION,
    (err, user) => {
      if (err) return res.status(403).json({ error: 'Unauthorized: Invalid token' });
      req.user = user;
      next();
    }
  );
};

// Route: Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const userAuthDetails = await MySQL.getUserAuthDetails(username);

    if (!userAuthDetails) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordCorrect = await bcrypt.compare(password, userAuthDetails.hash);
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: userAuthDetails.id },
      HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION,
      { expiresIn: '14d' }
    );

    return res.json({ message: 'Signed in', token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch Polls
router.get('/polls', authenticateToken, async (req, res) => {
  try {
    const polls = await MySQL.getPolls();

    if (!polls || polls.length === 0) {
      return res.status(404).json({ message: 'No polls found' });
    }

    return res.json({ polls });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Delete Poll
router.delete('/polls/:id', authenticateToken, async (req, res) => {
  const pollId = req.params.id;

  try {
    // Step 1: Delete submissions associated with the poll
    await MySQL.pool.execute('DELETE FROM Submission WHERE PollID = ?', [pollId]);

    // Step 2: Delete replies associated with comments on the poll
    const [comments] = await MySQL.pool.execute('SELECT CommentID FROM Comment WHERE PollID = ?', [pollId]);
    const commentIds = comments.map(comment => comment.CommentID);

    if (commentIds.length > 0) {
      await MySQL.pool.execute(`DELETE FROM Reply WHERE ReplyTo IN (${commentIds.join(',')})`);
    }

    // Step 3: Delete comments associated with the poll
    await MySQL.pool.execute('DELETE FROM Comment WHERE PollID = ?', [pollId]);

    // Step 4: Delete the poll
    const [result] = await MySQL.pool.execute('DELETE FROM Poll WHERE PollID = ?', [pollId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    return res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Update Poll
router.put('/polls/:id', authenticateToken, async (req, res) => {
  const pollId = req.params.id;
  const { title, description, closed, options } = req.body;

  if (!pollId || !title || !description || !options || typeof closed === 'undefined') {
    return res.status(400).json({ error: 'All fields (pollId, title, description, options, closed) are required' });
  }

  try {
    const result = await MySQL.updatePoll(
      pollId,
      title,
      description,
      options.a,
      options.b,
      closed
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    return res.json({ message: 'Poll updated successfully' });
  } catch (error) {
    console.error('Error updating poll:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get Poll by ID
router.get('/polls/:id', authenticateToken, async (req, res) => {
  const pollId = req.params.id;

  try {
    const poll = await MySQL.getPollById(pollId);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    return res.json(poll);
  } catch (error) {
    console.error('Error fetching poll details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch All Users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await MySQL.getAllUsers();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Delete a User
router.delete('/users/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    // Step 1: Delete replies authored by the user
    await MySQL.pool.execute('DELETE FROM Reply WHERE UserID = ?', [userId]);

    // Step 2: Delete replies referencing the user's comments
    const [comments] = await MySQL.pool.execute('SELECT CommentID FROM Comment WHERE UserID = ?', [userId]);
    const commentIds = comments.map(comment => comment.CommentID);

    if (commentIds.length > 0) {
      await MySQL.pool.execute(`DELETE FROM Reply WHERE ReplyTo IN (${commentIds.join(',')})`);
    }

    // Step 3: Delete the user's comments
    await MySQL.pool.execute('DELETE FROM Comment WHERE UserID = ?', [userId]);

    // Step 4: Delete submissions associated with the user
    await MySQL.pool.execute('DELETE FROM Submission WHERE UserID = ?', [userId]);

    // Step 5: Delete suggestions made by the user
    await MySQL.pool.execute('DELETE FROM Suggestion WHERE SuggesterID = ?', [userId]);

    // Step 6: Delete the user
    const [result] = await MySQL.pool.execute('DELETE FROM User WHERE UserID = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions = await MySQL.getSuggestions();
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/suggestions/:id/approve', authenticateToken, async (req, res) => {
  const suggestionId = req.params.id;
  try {
    const suggestion = await MySQL.getSuggestionById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    await MySQL.createPollFromSuggestion(suggestion);
    await MySQL.deleteSuggestion(suggestionId);

    res.json({ message: 'Suggestion approved and poll created.' });
  } catch (error) {
    console.error('Error approving suggestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/suggestions/:id/dismiss', authenticateToken, async (req, res) => {
  const suggestionId = req.params.id;
  try {
    const result = await MySQL.dismissSuggestion(suggestionId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ message: 'Suggestion dismissed.' });
  } catch (error) {
    console.error('Error dismissing suggestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await MySQL.getCommentsWithReplies();
    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MySQL.deleteComment(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});


router.delete('/replies/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MySQL.deleteReply(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});
router.post('/polls/reverify', authenticateToken, async (req, res) => {
  try {
    // Call a method from MySQL utility to reverify votes
    const result = await MySQL.reverifyVotes();

    if (!result || result.affectedPolls === 0) {
      return res.status(404).json({ message: 'No polls required re-verification' });
    }

    res.json({ message: 'Vote verification completed successfully', details: result });
  } catch (error) {
    console.error('Error during vote re-verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/polls', authenticateToken, async (req, res) => {
  const { title, description, optionA, optionB, closed } = req.body;

  if (!title || !description || !optionA || !optionB) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const query = `
      INSERT INTO Poll (Title, Description, OptionA, OptionB, Closed, CreationDate, ClosesAt)
      VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
    `;
    const [result] = await MySQL.pool.execute(query, [
      title,
      description,
      optionA,
      optionB,
      closed || false,
    ]);

    res.status(201).json({ message: 'Poll created successfully', pollId: result.insertId });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/suggestions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, optionA, optionB } = req.body;

  if (!title || !description || !optionA || !optionB) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const query = `
      UPDATE Suggestion
      SET Title = ?, Description = ?, OptionA = ?, OptionB = ?
      WHERE SuggestionID = ?
    `;
    const [result] = await MySQL.pool.execute(query, [
      title,
      description,
      optionA,
      optionB,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.status(200).json({ message: 'Submission updated successfully' });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/suggestions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await MySQL.pool.execute('SELECT * FROM Suggestion WHERE SuggestionID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route: Reverify Total Points
router.post('/users/reverify-points', authenticateToken, async (req, res) => {
  try {
    console.log('Reverifying total points...');
    const result = await MySQL.reverifyTotalPoints();

    // Respond with success message and details
    res.status(200).json({
      message: 'Reverified total points successfully',
      details: result,
    });
  } catch (error) {
    console.error('Error during reverifyTotalPoints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;