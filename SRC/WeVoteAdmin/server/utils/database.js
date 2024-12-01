const mysql = require('mysql2/promise');
const { randomUserID } = require('./Util');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});
console.log('DB Host:', process.env.DB_HOST);
console.log('DB User:', process.env.DB_USER);
console.log('DB Password:', process.env.DB_PASS ? '********' : 'Not Set');
console.log('DB Name:', process.env.DB_NAME);


async function transaction(transaction) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await transaction(connection);
    await connection.commit();
    connection.release();
    return result;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

async function retry(amount, block) {
  for (let i = 1; i <= amount; i++) {
    try {
      return await block();
    } catch (error) {
      if (i === amount) {
        throw error;
      }
    }
  }
  throw new Error('Retry logic reached an unexpected state');
}

const MySQL = {
  pool,
  insertNewUser: async function (displayName, email, passwordHash, bio) {
    try {
      return await retry(3, async () => {
        return transaction(async (connection) => {
          const idMaybe = randomUserID();
          await connection.execute(
            `INSERT INTO User (UserID, Username, Email, Password, ProfileBio, FrontDisplayed, MiddleDisplayed, BackDisplayed)
             VALUES (?, ?, ?, ?, ?, 1, 1, 1);`,
            [idMaybe, displayName, email, passwordHash, bio]
          );
          return idMaybe;
        });
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  userExists: async function (id) {
    try {
      const [rows] = await pool.execute(
        `SELECT UserID FROM User WHERE UserID = ?;`,
        [id]
      );
      return rows.length > 0;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  userExistsByEmail: async function (email) {
    try {
      const [rows] = await pool.execute(
        `SELECT UserID FROM User WHERE Email = ?;`,
        [email]
      );
      return rows.length > 0;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getUserAuthDetails: async function (email) {
    try {
      const [rows] = await pool.execute(
        `SELECT UserID, Password FROM User WHERE Email = ?;`,
        [email]
      );
      if (rows.length === 0) {
        return null;
      }
      return {
        hash: rows[0].Password,
        id: rows[0].UserID,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getUserInfo: async function (id) {
    try {
      const [rows] = await pool.execute(
        `SELECT Username, ProfileBio, Points, LifetimePoints, Streak, PredictionAccuracy 
         FROM User WHERE UserID = ?;`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return {
        id,
        displayName: rows[0].Username,
        bio: rows[0].ProfileBio,
        points: rows[0].Points,
        lifetimePoints: rows[0].LifetimePoints,
        streak: rows[0].Streak,
        predictionAccuracy: rows[0].PredictionAccuracy,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  updateBioForUser: async function (id, newBio) {
    throw new Error('Function not implemented.');
  },

  getAllOpenPollsInfoForUser: async function (id) {
    try {
      const [rows] = await pool.execute(
        `SELECT Poll.PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, PercentageVotesA, TotalVotes, 
                WinningVotes, PredictionsA, PredictionsB, PercentagePredictionsA, PercentagePredictionsB, 
                Closed, CreationDate, ClosesAt, SuggestedBy, VoteChoiceA, PredictionChoiceA 
         FROM Poll
         LEFT JOIN Submission ON Poll.PollID = Submission.PollID AND Submission.UserID = ?
         WHERE Poll.Closed = FALSE
         ORDER BY (VoteChoiceA IS NULL) DESC, ClosesAt ASC`,
        [id]
      );
      return rows.map((poll) => ({
        poll: {
          id: poll.PollID,
          title: poll.Title,
          description: poll.Description,
          options: {
            a: poll.OptionA,
            b: poll.OptionB,
          },
          votes: {
            a: poll.VotesA,
            b: poll.VotesB,
            percentA: poll.PercentageVotesA,
            percentB: 1 - poll.PercentageVotesA,
          },
          totalSubmissions: poll.TotalVotes,
          winner: !poll.Closed ? 'open' : poll.WinningVotes,
          predictions: {
            a: poll.PredictionsA,
            b: poll.PredictionsB,
            percentA: poll.PercentagePredictionsA,
            percentB: 1 - poll.PercentagePredictionsA,
          },
          suggestedBy: poll.SuggestedBy,
          closed: poll.Closed,
          creationDate: poll.CreationDate,
          endDate: poll.ClosesAt,
        },
        submission:
          poll.VoteChoiceA != null
            ? { votedA: poll.VoteChoiceA, predictedA: poll.PredictionChoiceA }
            : null,
      }));
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getLimitedClosedPollsInfoForUser: async function (id, amount) {
    try {
      const [rows] = await pool.execute(
        `SELECT Poll.PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, PercentageVotesA, TotalVotes, 
                WinningVotes, PredictionsA, PredictionsB, PercentagePredictionsA, PercentagePredictionsB, 
                Closed, CreationDate, ClosesAt, SuggestedBy, VoteChoiceA, PredictionChoiceA 
         FROM Poll
         LEFT JOIN Submission ON Poll.PollID = Submission.PollID AND Submission.UserID = ?
         WHERE Poll.Closed = TRUE
         ORDER BY ClosesAt ASC
         LIMIT ?`,
        [id, amount]
      );
      return rows.map((poll) => ({
        poll: {
          id: poll.PollID,
          title: poll.Title,
          description: poll.Description,
          options: {
            a: poll.OptionA,
            b: poll.OptionB,
          },
          votes: {
            a: poll.VotesA,
            b: poll.VotesB,
            percentA: poll.PercentageVotesA,
            percentB: 1 - poll.PercentageVotesA,
          },
          totalSubmissions: poll.TotalVotes,
          winner: !poll.Closed ? 'open' : poll.WinningVotes,
          predictions: {
            a: poll.PredictionsA,
            b: poll.PredictionsB,
            percentA: poll.PercentagePredictionsA,
            percentB: 1 - poll.PercentagePredictionsA,
          },
          suggestedBy: poll.SuggestedBy,
          closed: poll.Closed,
          creationDate: poll.CreationDate,
          endDate: poll.ClosesAt,
        },
        submission:
          poll.VoteChoiceA != null
            ? { votedA: poll.VoteChoiceA, predictedA: poll.PredictionChoiceA }
            : null,
      }));
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getPollInfoForUser: async function (id, pollID) {
    try {
      const [rows] = await pool.execute(
        `SELECT Poll.PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, PercentageVotesA, TotalVotes, 
                WinningVotes, PredictionsA, PredictionsB, PercentagePredictionsA, PercentagePredictionsB, 
                Closed, CreationDate, ClosesAt, SuggestedBy, VoteChoiceA, PredictionChoiceA 
         FROM Poll
         LEFT JOIN Submission ON Poll.PollID = Submission.PollID AND Submission.UserID = ?
         WHERE Poll.PollID = ?
         ORDER BY Closed ASC, ClosesAt ASC`,
        [id, pollID]
      );
      if (rows.length === 0) {
        return null;
      }
      const poll = rows[0];
      return {
        poll: {
          id: poll.PollID,
          title: poll.Title,
          description: poll.Description,
          options: {
            a: poll.OptionA,
            b: poll.OptionB,
          },
          votes: {
            a: poll.VotesA,
            b: poll.VotesB,
            percentA: poll.PercentageVotesA,
            percentB: 1 - poll.PercentageVotesA,
          },
          totalSubmissions: poll.TotalVotes,
          winner: !poll.Closed ? 'open' : poll.WinningVotes,
          predictions: {
            a: poll.PredictionsA,
            b: poll.PredictionsB,
            percentA: poll.PercentagePredictionsA,
            percentB: 1 - poll.PercentagePredictionsA,
          },
          suggestedBy: poll.SuggestedBy,
          closed: poll.Closed,
          creationDate: poll.CreationDate,
          endDate: poll.ClosesAt,
        },
        submission:
          poll.VoteChoiceA != null
            ? { votedA: poll.VoteChoiceA, predictedA: poll.PredictionChoiceA }
            : null,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  getPolls: async function () {
    try {
      const [rows] = await pool.execute(
        `SELECT PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, Closed, CreationDate, ClosesAt 
         FROM Poll`
      );
      return rows.map((poll) => ({
        id: poll.PollID,
        title: poll.Title,
        description: poll.Description,
        options: {
          a: poll.OptionA,
          b: poll.OptionB,
        },
        votes: {
          a: poll.VotesA,
          b: poll.VotesB,
        },
        closed: poll.Closed,
        creationDate: poll.CreationDate,
        closesAt: poll.ClosesAt,
      }));
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  deletePoll: async function (pollId) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM Poll WHERE PollID = ?;`,
        [pollId]
      );
      return result; // Contains affectedRows and other metadata
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  },
  updatePoll: async function (id, title, description, optionA, optionB, closed) {
    try {
      const query = `
        UPDATE Poll
        SET 
          Title = ?, 
          Description = ?, 
          OptionA = ?, 
          OptionB = ?, 
          Closed = ?
        WHERE PollID = ?
      `;
  
      const [result] = await pool.execute(query, [
        title ?? null,
        description ?? null,
        optionA ?? null,
        optionB ?? null,
        closed ?? null,
        id ?? null,
      ]);
  
      // If the poll is closed, ensure points are awarded
      if (closed) {
        console.log('Closing poll and awarding points...');
        const [poll] = await pool.execute(`SELECT * FROM Poll WHERE PollID = ?`, [id]);
  
        if (poll && poll.length > 0) {
          const closesAt = poll[0].ClosesAt;
          const now = new Date();
          if (new Date(closesAt) <= now) {
            console.log('Poll has reached its closing time. Executing award logic...');
            await this.closePollsAndAwardPoints();
          } else {
            console.log('Poll closed manually before scheduled time. Awarding points directly...');
            await this.closePollManuallyAndAward(id);
          }
        }
      }
  
      return result;
    } catch (error) {
      console.error('Error executing updatePoll:', error);
      throw error;
    }
  },
  closePollManuallyAndAward: async function (pollId) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
  
        // Mark poll as closed
        await connection.execute(`UPDATE Poll SET Closed = TRUE WHERE PollID = ?`, [pollId]);
  
        // Award points to users and update streaks
        await connection.execute(`CALL AwardPointsWithoutClosing();`);
  
        await connection.commit();
        console.log('Poll closed and points awarded successfully.');
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error manually closing poll and awarding points:', error);
      throw error;
    }
  },
  
  getPollById: async function (pollId) {
    try {
      const [rows] = await pool.execute(
        `SELECT PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, Closed, CreationDate, ClosesAt 
         FROM Poll
         WHERE PollID = ?`,
        [pollId]
      );
  
      if (rows.length === 0) {
        return null; // Return null if no poll is found
      }
  
      const poll = rows[0];
      return {
        id: poll.PollID,
        title: poll.Title,
        description: poll.Description,
        options: {
          a: poll.OptionA,
          b: poll.OptionB,
        },
        votes: {
          a: poll.VotesA,
          b: poll.VotesB,
        },
        closed: poll.Closed,
        creationDate: poll.CreationDate,
        closesAt: poll.ClosesAt,
      };
    } catch (error) {
      console.error('Error fetching poll by ID:', error);
      throw error; // Rethrow error for the route to handle
    }
  },getAllUsers: async function () {
    try {
      const [rows] = await pool.execute(
        `SELECT UserID, Username, Email, ProfileBio, Points, LifetimePoints, Streak, PredictionAccuracy, FrontDisplayed, MiddleDisplayed, BackDisplayed 
         FROM User`
      );
      return rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  deleteUser: async function (userId) {
    try {
      const [result] = await pool.execute(`DELETE FROM User WHERE UserID = ?`, [userId]);
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  getSuggestions: async function () {
    try {
      const [rows] = await pool.execute('SELECT * FROM Suggestion WHERE Dismissed = FALSE');
      return rows;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },
  getSuggestionById: async function (id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM Suggestion WHERE SuggestionID = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching suggestion by ID:', error);
      throw error;
    }
  },
  createPollFromSuggestion: async function (suggestion) {
    try {
      const query = `
        INSERT INTO Poll (Title, Description, OptionA, OptionB, CreationDate, ClosesAt, SuggestedBy)
        VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), ?)
      `;
      await pool.execute(query, [
        suggestion.Title,
        suggestion.Description,
        suggestion.OptionA,
        suggestion.OptionB,
        suggestion.SuggesterID,
      ]);
    } catch (error) {
      console.error('Error creating poll from suggestion:', error);
      throw error;
    }
  },
  dismissSuggestion: async function (id) {
    try {
      const query = 'UPDATE Suggestion SET Dismissed = TRUE WHERE SuggestionID = ?';
      const [result] = await pool.execute(query, [id]);
      return result;
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      throw error;
    }
  },
  deleteSuggestion: async function (id) {
    try {
      const query = 'DELETE FROM Suggestion WHERE SuggestionID = ?';
      const [result] = await pool.execute(query, [id]);
      return result;
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      throw error;
    }
  },getCommentsWithReplies: async function () {
    try {
      const [comments] = await pool.execute(`
        SELECT c.CommentID, c.Content, c.CommentTimeSubmitted, u.Username, c.PollID
        FROM Comment c
        INNER JOIN User u ON c.UserID = u.UserID
      `);
  
      const [replies] = await pool.execute(`
        SELECT r.ReplyID, r.Content, r.CommentTimeSubmitted, u.Username, r.ReplyTo
        FROM Reply r
        INNER JOIN User u ON r.UserID = u.UserID
      `);
  
      // Nest replies under their corresponding comments
      const commentMap = comments.map((comment) => ({
        ...comment,
        Replies: replies.filter((reply) => reply.ReplyTo === comment.CommentID),
      }));
  
      return commentMap;
    } catch (error) {
      console.error('Error fetching comments and replies:', error);
      throw error;
    }
  },
  deleteComment: async function (commentId) {
    try {
      // Delete all replies for the comment
      await pool.execute('DELETE FROM Reply WHERE ReplyTo = ?', [commentId]);
  
      // Delete the comment
      const [result] = await pool.execute('DELETE FROM Comment WHERE CommentID = ?', [commentId]);
  
      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  deleteReply: async function (replyId) {
    try {
      const query = 'DELETE FROM Reply WHERE ReplyID = ?';
      const [result] = await pool.execute(query, [replyId]);
      return result;
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  },
  reverifyVotes: async function () {
    try {
      return await transaction(async (connection) => {
        // Fetch all polls
        const [polls] = await connection.execute(`SELECT PollID FROM Poll`);

        let affectedPolls = 0;

        for (const poll of polls) {
          const pollId = poll.PollID;

          // Count votes for Option A and Option B based on submissions
          const [[votes]] = await connection.execute(
            `SELECT
               SUM(CASE WHEN VoteChoiceA = TRUE THEN 1 ELSE 0 END) AS VotesA,
               SUM(CASE WHEN VoteChoiceA = FALSE THEN 1 ELSE 0 END) AS VotesB
             FROM Submission
             WHERE PollID = ?`,
            [pollId]
          );

          // Update the poll with recalculated votes
          const [updateResult] = await connection.execute(
            `UPDATE Poll
             SET VotesA = ?, VotesB = ?
             WHERE PollID = ?`,
            [votes.VotesA || 0, votes.VotesB || 0, pollId]
          );

          if (updateResult.affectedRows > 0) {
            affectedPolls++;
          }
        }

        return { affectedPolls };
      });
    } catch (error) {
      console.error('Error re-verifying votes:', error);
      throw error;
    }
  },
  closePollsAndAwardPoints: async function () {
    try {
      const [result] = await pool.execute(`CALL ClosePollsAndAwardPoints();`);
      return result; // Return the result of the procedure execution
    } catch (error) {
      console.error('Error executing ClosePollsAndAwardPoints:', error);
      throw error; // Propagate the error for the caller to handle
    }
  },
  reverifyTotalPoints: async function () {
    try {
      console.log('Running reverifyTotalPoints');
      const [result] = await pool.execute(`CALL ReverifyTotalPoints();`);
      console.log('Reverification completed successfully:', result);
      return result; // Return the result of the procedure execution
    } catch (error) {
      console.error('Error executing ReverifyTotalPoints:', error);
      throw error; // Propagate the error for the caller to handle
    }
  },
  
};



module.exports = MySQL;
