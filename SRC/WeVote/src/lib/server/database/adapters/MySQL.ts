import type Database from "../Database";
import mysql, { type QueryResult, type RowDataPacket } from 'mysql2/promise';
import { env } from '$env/dynamic/private';
import type { PollInfo, PollInfoForUser, UserInfo } from "../Database";
import { randomUserID } from "$lib/server/Util";

const pool = mysql.createPool({
	host:     env.DB_HOST,
	user:     env.DB_USER,
	password: env.DB_PASS,
	database: env.DB_NAME,
	connectionLimit: 10
});

async function transaction<T>(transaction: (connection: mysql.PoolConnection)=>Promise<T>): Promise<T> {
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

async function retry<T>(amount: number, block: ()=>Promise<T>): Promise<T> {
	for (let i = 1; i<=amount; i++) {
		try {
			return await block()
		} catch (error) {
			if (i===amount) {
				throw error;
			}
		}
	}
	throw new Error("how did you get here")
}

export const MySQL: Database = {
	insertNewUser: async function (displayName: string, email: string, passwordHash: string, bio: string): Promise<string | null> {
		try {
			return await retry(3, async () => {
				return transaction(async (connection) => {
					const idMaybe = randomUserID();
					connection.execute(`-- sql
						INSERT INTO User (UserID, Username, Email, Password, ProfileBio, FrontDisplayed, MiddleDisplayed, BackDisplayed)
						VALUES (?, ?, ?, ?, ?, 1, 1, 1);`, [idMaybe, displayName, email, passwordHash, bio]);
					return idMaybe;
				});
			});
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	userExists: async function (id: string): Promise<boolean | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`-- sql
				SELECT UserID FROM User WHERE UserID = ?;`, [id]);
			if (result[0].length === 0) {
				return false;
			} else {
				return true;
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	userExistsByEmail: async function (email: string): Promise<boolean | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`-- sql
				SELECT UserID FROM User WHERE Email = ?;`, [email]);
			if (result[0].length === 0) {
				return false;
			} else {
				return true;
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	getUserAuthDetails: async function (email: string): Promise<{ hash: string; id: string; } | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`-- sql
			SELECT UserID, Password FROM User WHERE Email = ?;`, [email]);
			if (result[0].length === 0) {
				return null;
			} else {
				return {
					hash: result[0][0].Password,
					id: result[0][0].UserID
				};
			}
		}
		catch (error) {
			console.error(error);
			return null;
		}
	},
	getUserInfo: async function (id: string): Promise<UserInfo | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`
				SELECT 
					Username, 
					ProfileBio, 
					Points, 
					LifetimePoints, 
					Streak, 
					PredictionAccuracy,
					FrontDisplayed, 
					MiddleDisplayed, 
					BackDisplayed
				FROM User 
				WHERE UserID = ?;
			`, [id]);
	
			if (result[0].length === 0) {
				return null;
			} else {
				return {
					id: id,
					displayName: result[0][0].Username,
					bio: result[0][0].ProfileBio,
					points: result[0][0].Points,
					lifetimePoints: result[0][0].LifetimePoints,
					streak: result[0][0].Streak,
					predictionAccuracy: result[0][0].PredictionAccuracy,
					frontDisplayed: result[0][0].FrontDisplayed,
					middleDisplayed: result[0][0].MiddleDisplayed,
					backDisplayed: result[0][0].BackDisplayed,
				};
			}
		} catch (error) {
			console.error("Error fetching user info:", error);
			return null;
		}
	},	
	updateBioForUser: async function (id: string, newBio: string): Promise<boolean | null> {
		throw new Error("Function not implemented.");
	},
	getAllOpenPollsInfoForUser: async function (id: string): Promise<PollInfoForUser[] | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`-- sql
				SELECT Poll.PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, PercentageVotesA, TotalVotes, WinningVotes, PredictionsA, PredictionsB, PercentagePredictionsA, PercentagePredictionsB, Closed, CreationDate, ClosesAt, SuggestedBy, VoteChoiceA, PredictionChoiceA FROM Poll
				LEFT JOIN Submission ON Poll.PollID=Submission.PollID AND Submission.UserID=?
				WHERE Poll.Closed = FALSE
				ORDER BY (VoteChoiceA IS NULL) DESC, ClosesAt ASC`, 
				[id]);
			const results = result[0];
			return results.map((poll) => {
				return {
					poll: {
						id: poll.PollID,
						title: poll.Title,
						description: poll.Description,
						options: {
							a: poll.OptionA,
							b: poll.OptionB
						},
						votes: {
							a: poll.VotesA,
							b: poll.VotesB,
							percentA: poll.PercentageVotesA,
							percentB: 1-poll.PercentageVotesA
						},
						totalSubmissions: poll.TotalVotes,
						winner: !poll.Closed? "open" : poll.WinningVotes,
						predictions: {
							a: poll.PredictionsA,
							b: poll.PredictionsB,
							percentA: poll.PercentagePredictionsA,
							percentB: 1-poll.PercentagePredictionsA
						},
						suggestedBy: poll.SuggestedBy,
						closed: poll.Closed,
						creationDate: poll.CreationDate,
						endDate: poll.ClosesAt
					},
					submission: poll.VoteChoiceA!=null? {votedA: poll.VoteChoiceA, predictedA: poll.PredictionChoiceA} : null
				}
			})
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	getLimitedClosedPollsInfoForUser: async function (id: string, amount: number): Promise<PollInfoForUser[] | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`-- sql
				SELECT Poll.PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, PercentageVotesA, TotalVotes, WinningVotes, PredictionsA, PredictionsB, PercentagePredictionsA, PercentagePredictionsB, Closed, CreationDate, ClosesAt, SuggestedBy, VoteChoiceA, PredictionChoiceA FROM Poll
				LEFT JOIN Submission ON Poll.PollID=Submission.PollID AND Submission.UserID=?
				WHERE Poll.Closed = TRUE
				ORDER BY ClosesAt ASC
				LIMIT ${amount.toString()}`, 
				[id]);
			const results = result[0];
			return results.map((poll) => {
				return {
					poll: {
						id: poll.PollID,
						title: poll.Title,
						description: poll.Description,
						options: {
							a: poll.OptionA,
							b: poll.OptionB
						},
						votes: {
							a: poll.VotesA,
							b: poll.VotesB,
							percentA: poll.PercentageVotesA,
							percentB: 1-poll.PercentageVotesA
						},
						totalSubmissions: poll.TotalVotes,
						winner: !poll.Closed? "open" : poll.WinningVotes,
						predictions: {
							a: poll.PredictionsA,
							b: poll.PredictionsB,
							percentA: poll.PercentagePredictionsA,
							percentB: 1-poll.PercentagePredictionsA
						},
						suggestedBy: poll.SuggestedBy,
						closed: poll.Closed,
						creationDate: poll.CreationDate,
						endDate: poll.ClosesAt
					},
					submission: poll.VoteChoiceA!=null? {votedA: poll.VoteChoiceA, predictedA: poll.PredictionChoiceA} : null
				}
			})
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	getPollInfoForUser: async function (id: string, pollID: number): Promise<PollInfoForUser | null> {
		try {
			const result = await pool.execute<RowDataPacket[]>(`-- sql
				SELECT Poll.PollID, Title, Description, OptionA, OptionB, VotesA, VotesB, PercentageVotesA, TotalVotes, WinningVotes, PredictionsA, PredictionsB, PercentagePredictionsA, PercentagePredictionsB, Closed, CreationDate, ClosesAt, SuggestedBy, VoteChoiceA, PredictionChoiceA FROM Poll
				LEFT JOIN Submission ON Poll.PollID=Submission.PollID AND Submission.UserID=?
				WHERE Poll.PollID = ?
				ORDER BY Closed ASC, ClosesAt ASC`,
				[id, pollID]);
			if (result[0].length === 0) {
				return null;
			}
			const poll = result[0][0];
			return {
				poll: {
					id: poll.PollID,
					title: poll.Title,
					description: poll.Description,
					options: {
						a: poll.OptionA,
						b: poll.OptionB
					},
					votes: {
						a: poll.VotesA,
						b: poll.VotesB,
						percentA: poll.PercentageVotesA,
						percentB: 1-poll.PercentageVotesA
					},
					totalSubmissions: poll.TotalVotes,
					winner: !poll.Closed? "open" : poll.WinningVotes,
					predictions: {
						a: poll.PredictionsA,
						b: poll.PredictionsB,
						percentA: poll.PercentagePredictionsA,
						percentB: 1-poll.PercentagePredictionsA
					},
					suggestedBy: poll.SuggestedBy,
					closed: poll.Closed,
					creationDate: poll.CreationDate,
					endDate: poll.ClosesAt
				},
				submission: poll.VoteChoiceA!=null? {votedA: poll.VoteChoiceA, predictedA: poll.PredictionChoiceA} : null
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	async getCommentsForPoll(pollId: number): Promise<Comment[]> {
		const comments = await pool.query<RowDataPacket[]>(`
			SELECT c.CommentID, c.Content, c.CommentTimeSubmitted, u.Username AS author
			FROM Comment c
			JOIN User u ON c.UserID = u.UserID
			WHERE c.PollID = ?
			ORDER BY c.CommentTimeSubmitted ASC
		`, [pollId]);
	
		for (const comment of comments[0]) {
			const replies = await pool.query<RowDataPacket[]>(`
				SELECT r.ReplyID, r.Content, r.CommentTimeSubmitted, u.Username AS author
				FROM Reply r
				JOIN User u ON r.UserID = u.UserID
				WHERE r.ReplyTo = ?
				ORDER BY r.CommentTimeSubmitted ASC
			`, [comment.CommentID]);
			comment.replies = replies[0];
		}
	
		return comments[0];
	},
	async addComment(pollId: number, userId: string, content: string): Promise<void> {
		await pool.query(`
			INSERT INTO Comment (PollID, UserID, Content, PollClosedAtPost, CommentTimeSubmitted)
			VALUES (?, ?, ?, false, NOW())
		`, [pollId, userId, content]);
	},
	async addReply(commentId: number, userId: string, content: string): Promise<void> {
		await pool.query(`
			INSERT INTO Reply (ReplyTo, UserID, Content, PollClosedAtPost, CommentTimeSubmitted)
			VALUES (?, ?, ?, false, NOW())
		`, [commentId, userId, content]);
	},
	async submitVote(pollId: number, userId: string, voteChoice: boolean, predictionChoice: boolean): Promise<void> {
		const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
	
		await pool.query(
			`INSERT INTO Submission (PollID, UserID, VoteChoiceA, PredictionChoiceA, TimeSubmitted)
			 VALUES (?, ?, ?, ?, ?)
			 ON DUPLICATE KEY UPDATE
			 VoteChoiceA = VALUES(VoteChoiceA),
			 PredictionChoiceA = VALUES(PredictionChoiceA),
			 TimeSubmitted = VALUES(TimeSubmitted)`,
			[pollId, userId, voteChoice, predictionChoice, currentTime]
		);
	},
	async getAllClosedPollsInfoForUser(userId: string): Promise<PollInfoForUser[] | null> {
		try {
			const results = await pool.query<RowDataPacket[]>(`
				SELECT 
					p.PollID AS id,
					p.Title AS title,
					p.Description AS description,
					p.OptionA AS options_a,
					p.OptionB AS options_b,
					p.Closed AS closed,
					p.WinningVotes AS winner,
					COUNT(s.PollID) AS totalSubmissions,
					v.VoteChoiceA AS votedA,
					v.PredictionChoiceA AS predictedA
				FROM Poll p
				LEFT JOIN Submission s ON p.PollID = s.PollID
				LEFT JOIN (
					SELECT 
						PollID, 
						VoteChoiceA, 
						PredictionChoiceA
					FROM Submission
					WHERE UserID = ?
				) v ON p.PollID = v.PollID
				WHERE p.Closed = 1
				GROUP BY p.PollID
				ORDER BY p.Title ASC
			`, [userId]);
	
			if (results[0].length === 0) {
				return [];
			}
	
			return results[0].map((row) => ({
				poll: {
					id: row.id,
					title: row.title,
					description: row.description,
					options: {
						a: row.options_a,
						b: row.options_b,
					},
					closed: !!row.closed,
					winner: row.winner,
					totalSubmissions: row.totalSubmissions,
				},
				submission: row.votedA !== null
					? {
						votedA: !!row.votedA,
						predictedA: !!row.predictedA,
					}
					: null,
			}));
		} catch (error) {
			console.error("Error fetching closed polls:", error);
			return null;
		}
	},
	async  getTopStreakUsersThisMonth(limit: number): Promise<{ username: string; streak: number }[] | null> {
		try {
			const results = await pool.query<RowDataPacket[]>(`-- sql
				SELECT Username AS username, Streak AS streak
				FROM User
				ORDER BY Streak DESC
				LIMIT ?
			`, [limit]);
			return results[0].map((row) => ({
				username: row.username,
				streak: row.streak,
			}));
		} catch (error) {
			console.error("Error fetching top streak users:", error);
			return null;
		}
	},
	
	async  getTopLifetimePointUsers(limit: number): Promise<{ username: string; lifetimePoints: number }[] | null> {
		try {
			const results = await pool.query<RowDataPacket[]>(`-- sql
				SELECT Username AS username, LifetimePoints AS lifetimePoints
				FROM User
				ORDER BY LifetimePoints DESC
				LIMIT ?
			`, [limit]);
			return results[0].map((row) => ({
				username: row.username,
				lifetimePoints: row.lifetimePoints,
			}));
		} catch (error) {
			console.error("Error fetching top lifetime point users:", error);
			return null;
		}
	},
	
	async getTopCosmeticPurchases(limit: number): Promise<{ username: string; totalPurchases: number }[] | null> {
		try {
			const results = await pool.query<RowDataPacket[]>(`-- sql
				SELECT 
					u.Username AS username, 
					(
						SELECT COUNT(*) FROM OwnedFrontCosmetic WHERE UserID = u.UserID
					) + (
						SELECT COUNT(*) FROM OwnedMiddleCosmetic WHERE UserID = u.UserID
					) + (
						SELECT COUNT(*) FROM OwnedBackCosmetic WHERE UserID = u.UserID
					) AS totalPurchases
				FROM User u
				ORDER BY totalPurchases DESC
				LIMIT ?
			`, [limit]);
			return results[0].map((row) => ({
				username: row.username,
				totalPurchases: row.totalPurchases,
			}));
		} catch (error) {
			console.error("Error fetching top cosmetic purchasers:", error);
			return null;
		}
	},
	async getAvailableCosmeticsForUser(userId: string): Promise<any | null> {
		try {
			const [frontCosmetics] = await pool.query(
				`SELECT 
					fc.FrontCosmeticID AS id, 
					fc.Cost, 
					fc.Src, 
					(SELECT COUNT(*) 
					 FROM OwnedFrontCosmetic ofc 
					 WHERE ofc.FrontCosmeticID = fc.FrontCosmeticID) AS Purchases
				 FROM FrontCosmetic fc
				 LEFT JOIN OwnedFrontCosmetic ofc 
				 ON fc.FrontCosmeticID = ofc.FrontCosmeticID AND ofc.UserID = ?
				 WHERE ofc.FrontCosmeticID IS NULL`,
				[userId]
			);
	
			const [middleCosmetics] = await pool.query(
				`SELECT 
					mc.MiddleCosmeticID AS id, 
					mc.Cost, 
					mc.Src, 
					(SELECT COUNT(*) 
					 FROM OwnedMiddleCosmetic omc 
					 WHERE omc.MiddleCosmeticID = mc.MiddleCosmeticID) AS Purchases
				 FROM MiddleCosmetic mc
				 LEFT JOIN OwnedMiddleCosmetic omc 
				 ON mc.MiddleCosmeticID = omc.MiddleCosmeticID AND omc.UserID = ?
				 WHERE omc.MiddleCosmeticID IS NULL`,
				[userId]
			);
	
			const [backCosmetics] = await pool.query(
				`SELECT 
					bc.BackCosmeticID AS id, 
					bc.Cost, 
					bc.Src, 
					(SELECT COUNT(*) 
					 FROM OwnedBackCosmetic obc 
					 WHERE obc.BackCosmeticID = bc.BackCosmeticID) AS Purchases
				 FROM BackCosmetic bc
				 LEFT JOIN OwnedBackCosmetic obc 
				 ON bc.BackCosmeticID = obc.BackCosmeticID AND obc.UserID = ?
				 WHERE obc.BackCosmeticID IS NULL`,
				[userId]
			);
	
			return {
				front: frontCosmetics,
				middle: middleCosmetics,
				back: backCosmetics,
			};
		} catch (error) {
			console.error("Error fetching cosmetics:", error);
			return null;
		}
	},
	

    // Handle purchase transaction
    async purchaseCosmetic(userId: string, cosmeticId: number, category: string): Promise<boolean> {
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            let table, ownershipTable, displayedColumn;

            switch (category) {
                case "front":
                    table = "FrontCosmetic";
                    ownershipTable = "OwnedFrontCosmetic";
                    displayedColumn = "FrontDisplayed";
                    break;
                case "middle":
                    table = "MiddleCosmetic";
                    ownershipTable = "OwnedMiddleCosmetic";
                    displayedColumn = "MiddleDisplayed";
                    break;
                case "back":
                    table = "BackCosmetic";
                    ownershipTable = "OwnedBackCosmetic";
                    displayedColumn = "BackDisplayed";
                    break;
                default:
                    throw new Error("Invalid category");
            }

            const [cosmetic] = await connection.query(
                `SELECT Cost FROM ${table} WHERE ${table}ID = ?`,
                [cosmeticId]
            );

            if (!cosmetic[0]) throw new Error("Cosmetic not found");

            const cost = cosmetic[0].Cost;

            const [user] = await connection.query(
                `SELECT Points FROM User WHERE UserID = ?`,
                [userId]
            );

            if (!user[0] || user[0].Points < cost) throw new Error("Insufficient points");

            // Deduct points
            await connection.query(
                `UPDATE User SET Points = Points - ? WHERE UserID = ?`,
                [cost, userId]
            );

            // Insert into ownership
            await connection.query(
                `INSERT INTO ${ownershipTable} (UserID, ${table}ID) VALUES (?, ?)`,
                [userId, cosmeticId]
            );

            // Log transaction
            await connection.query(
                `INSERT INTO PointTransaction (TransactionDate, PointValueDelta, Reason, UserID)
                 VALUES (NOW(), ?, 'Purchased cosmetic', ?)`,
                [-cost, userId]
            );

            await connection.commit();
            connection.release();

            return true;
        } catch (error) {
            console.error("Error purchasing cosmetic:", error);
            return false;
        }
    },
	async getOwnedCosmeticsForUser(userId: string): Promise<any | null> {
		try {
			// Query for owned front cosmetics
			const [ownedFrontCosmetics] = await pool.query(
				`SELECT 
					ofc.FrontCosmeticID AS id, 
					fc.Cost, 
					fc.Src 
				 FROM OwnedFrontCosmetic ofc
				 JOIN FrontCosmetic fc ON ofc.FrontCosmeticID = fc.FrontCosmeticID
				 WHERE ofc.UserID = ?`,
				[userId]
			);
	
			// Query for owned middle cosmetics
			const [ownedMiddleCosmetics] = await pool.query(
				`SELECT 
					omc.MiddleCosmeticID AS id, 
					mc.Cost, 
					mc.Src 
				 FROM OwnedMiddleCosmetic omc
				 JOIN MiddleCosmetic mc ON omc.MiddleCosmeticID = mc.MiddleCosmeticID
				 WHERE omc.UserID = ?`,
				[userId]
			);
	
			// Query for owned back cosmetics
			const [ownedBackCosmetics] = await pool.query(
				`SELECT 
					obc.BackCosmeticID AS id, 
					bc.Cost, 
					bc.Src 
				 FROM OwnedBackCosmetic obc
				 JOIN BackCosmetic bc ON obc.BackCosmeticID = bc.BackCosmeticID
				 WHERE obc.UserID = ?`,
				[userId]
			);
	
			// Return grouped results
			return {
				front: ownedFrontCosmetics,
				middle: ownedMiddleCosmetics,
				back: ownedBackCosmetics,
			};
		} catch (error) {
			console.error("Error fetching owned cosmetics:", error);
			return null;
		}
	},
	async equipCosmetic(userId: string, cosmeticId: number, category: string): Promise<boolean> {
		try {
			let displayedColumn;
	
			switch (category) {
				case 'front':
					displayedColumn = 'FrontDisplayed';
					break;
				case 'middle':
					displayedColumn = 'MiddleDisplayed';
					break;
				case 'back':
					displayedColumn = 'BackDisplayed';
					break;
				default:
					throw new Error('Invalid category');
			}
	
			const [result] = await pool.query(
				`UPDATE User SET ${displayedColumn} = ? WHERE UserID = ?`,
				[cosmeticId, userId]
			);
	
			return result.affectedRows > 0;
		} catch (error) {
			console.error('Error equipping cosmetic:', error);
			return false;
		}
	}
	
}