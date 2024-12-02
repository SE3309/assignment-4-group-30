/**
 * "Actual" database operations. Calling these runs queries directly on the database, without any safety checks. Prefer SafeSession objects, unless this happens to be SafeSession code, in which case you'll need to handle safety.
 */
export default interface Database {
	//Add a new entry for literally any type of operation you might want to do. This includes compositions that could be combined into one query.


	//User

	async insertNewUser(displayName: string, email: string,  passwordHash: string, bio: string): Promise<string | null>

	async userExists(id: string): Promise<boolean | null>

	async userExistsByEmail(email: string): Promise<boolean | null>

	async getUserAuthDetails(email: string): Promise<{hash: string, id: string}| null>

	async getUserInfo(id: string): Promise<UserInfo| null>

	async updateBioForUser(id: string, newBio: string): Promise<boolean| null>

	async getAllOpenPollsInfoForUser(id: string): Promise<PollInfoForUser[]| null>

	async getLimitedClosedPollsInfoForUser(id: string, amount: number): Promise<PollInfoForUser[]| null>

	async getPollInfoForUser(id: string, pollID: number): Promise<PollInfoForUser| null>

	async getCommentsForPoll(pollId: number): Promise <Comment[]>

	async addComment(pollId: number, userId: string, content: string): Promise<void> 

	async addReply(commentId: number, userId: string, content: string): Promise<void> 

	async submitVote(
		pollId: number,
		userId: string,
		voteChoice: boolean,
		predictionChoice: boolean
	): Promise<void>

	async getAllClosedPollsInfoForUser(userId: string): Promise<PollInfoForUser[] | null>
	async getTopStreakUsersThisMonth(limit: number): Promise<{ username: string; streak: number }[] | null> 
	async getTopLifetimePointUsers(limit: number): Promise<{ username: string; lifetimePoints: number }[] | null> 
	async getTopCosmeticPurchases(limit: number): Promise<{ username: string; totalPurchases: number }[] | null> 
	async getAvailableCosmeticsForUser(userId: string): Promise<any | null>
	async purchaseCosmetic(userId: string, cosmeticId: number, category: string): Promise<boolean>
	async getOwnedCosmeticsForUser(userId: string): Promise<any | null>
	async equipCosmetic(userId: string, cosmeticId: number, category: string): Promise<boolean>
}
export type UserInfo = {
	id: string,
	displayName: string,
	bio: string,
	points: number,
	lifetimePoints: number,
	streak: number,
	predictionAccuracy: number
}
export type PollInfo = {
	id: number,
	title: string,
	description: string,
	options: {
		a: string,
		b: string
	}
	votes: {
		a: number,
		b: number,
		percentA: number,
		percentB: number
	} | "unfetched" | "inaccessible" | "open",
	totalSubmissions: number,
	winner: "A" | "B" | "Tie" | "unfetched" | "inaccessible" | "open",
	predictions: {
		a: number,
		b: number,
		percentA: number,
		percentB: number
	} | "unfetched" | "inaccessible",
	closed: boolean,
	creationDate: Date,
	endDate: Date,
	suggestedBy: string | null
}
export type PollInfoForUser = {
	poll: PollInfo,
	submission: {votedA: boolean, predictedA: boolean} | null
}
