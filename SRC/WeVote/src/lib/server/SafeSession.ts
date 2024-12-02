//SafeSession, a set of helper objects to ensure safe database use and enforce access policies. Prefer working with these objects instead of manual database operations. Also, don't type-assert these!
import Database from "./database/current"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import type { PollInfo, PollInfoForUser, UserInfo } from "./database/Database";
import type { ValidDisplayName, ValidEmail, ValidPassword } from "./Valid";


const HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION = "5c7d5ca376c201cb8c9963944d6dc7ecfaa305eeafe114e2132f46e1db3f0714154dc00f826a1509a767852f58fb632e5c839484582d70f4893ca61c80e2f902"

/**
 * A unique symbol only SafeSession owns. Code requiring this as a paramater can only be run from within SafeSession, and should be considered internal. If you're trying to directly construct an object, use the correct methods from SafeSession.
 */
const SafeSessionPrivate: unique symbol = Symbol("SafeSession Private Symbol")

/**
 * Encapsulates possible errors or error messages returned from an operation. Check return values with isFail to disambiguate.
 */
export class Fail<T> {
	#error
	#message
	constructor(error: T, message?: string) {
		this.#error = error
		this.#message = message
	}
	get error() {
		return this.#error
	}
	get message() {
		return this.#message
	}

	static readonly Unauthorized: unique symbol = Symbol("Unauthorized")
	static readonly Nonexistent: unique symbol = Symbol("Nonexistent")
	static readonly Conflict: unique symbol = Symbol("Conflict")
	static readonly DatabaseFault: unique symbol = Symbol("DatabaseFault")
}
export type Unauthorized = typeof Fail.Unauthorized
export type Nonexistent = typeof Fail.Nonexistent
export type Conflict = typeof Fail.Conflict
export type DatabaseFault = typeof Fail.DatabaseFault
export function isFail<T>(e: any): e is Fail<T> {
	return e instanceof Fail
}

/**
 * A class with queries anyone can perform. You're free to construct these whenever you need to query something that signed-out users can query.
 */
export class UnauthenticatedSession {
	isAuthenticated(): this is Session { return this instanceof Session }

	/**
	 * Mark a string as representing a user's ID. You can check if the user actually exists later, if required.
	 * @param id A string representing the user's ID
	 * @returns A PossibleUser, marking the string as semantically an ID.
	 * @see getRealUser
	 */
	user(id: string) {
		return new PossibleUser(SafeSessionPrivate, id)
	}

	/**
	 * Shortcut to mark a string as an ID and check if the corresponding user exists right now in one function. Users are not guaranteed to not be deleted immediately after, so this should only be used if a lot of behavior (eg, the layout of a page and what subsequent queries to make) is determined by the existence of a user. From an authenticated session, you can directly compare the result with `currentUser` (they are the same object if the IDs match).
	 * @param id A string representing the user's ID to query
	 * @returns A User if it existed at least once, or a null if the user doesn't exist.
	 */
	async getRealUser(id: string): Promise<User | null> {
		if (await Database.userExists(id)) {
			return new User(SafeSessionPrivate, id)
		} else {
			return null
		}
	}

	/**
	 * Create a new user in the database.
	 * @param displayName The new user's new display name
	 * @param email The new user's email
	 * @param newPassword The new user's new password
	 * @returns A User object holding the new user's ID, or a Fail.
	 */
	async createNewUser(displayName: ValidDisplayName, email: ValidEmail, newPassword: ValidPassword): Promise<User | Fail<Conflict | DatabaseFault | Unauthorized>> { //TODO: profanity and content sanitization
		if (await Database.userExistsByEmail(email.value)) {
			return new Fail(Fail.Conflict)
		}
		const passwordHash = await bcrypt.hash(newPassword.value, 10)
		const result = await Database.insertNewUser(displayName.value, email.value, passwordHash, "GENERIC DEFAULT BIO")
		if (!result) {
			return new Fail(Fail.DatabaseFault, "Could not insert user to database, another user may exist with the same Email.")
		}
		return new User(SafeSessionPrivate, result)
	}

	/**
	 * Sign a user in, constructing a JWT for them to authenticate with.
	 * @param email The user's email
	 * @param password The password the user is attempting to sign in with
	 * @returns A JWT the user can use to sign in (valid for 14 days), or Unauthorized 
	 */
	async constructJWT(email: ValidEmail, password: ValidPassword): Promise<string | Fail<Unauthorized>> { //TODO: JWT issueing minimum time for deauth
		const authDetails = await Database.getUserAuthDetails(email.value)
		if (!authDetails) {
			return new Fail(Fail.Unauthorized)
		}
		const passwordCorrect = await bcrypt.compare(password.value, authDetails.hash)
		if (!passwordCorrect) {
			return new Fail(Fail.Unauthorized)
		}
		return jwt.sign({
			id: authDetails.id
		}, HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION, {
			expiresIn: "14d"
		})
	}
}

//The main entry class for this system:
/**
 * An authenticated user's session. Must be created with await Session.fromJWT(jwt).
 */
export class Session extends UnauthenticatedSession {
	#currentUser
	constructor(symbol: typeof SafeSessionPrivate, sessionUserID: string) {
		if (symbol != SafeSessionPrivate) { throw new TypeError("Incorrect symbol. Attempt to construct SafeSession object externally?") }
		super()
		this.#currentUser = new CurrentUser(SafeSessionPrivate, sessionUserID)
	}
	/**
	 * Construct a session from a valid signed-in JWT
	 * @param token The JWT the user holds
	 * @returns A Session if the token is valid, or null.
	 */
	static async fromJWT(token: string): Promise<Session | null> {//TODO: JWT issueing minimum time for deauth
		try {
			const decoded = jwt.verify(token, HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION)
			if (typeof decoded === "string") {
				//huh?
				return null
			}
			if (await Database.userExists(decoded.id)) { //TODO: optimize?
				return new Session(SafeSessionPrivate, decoded.id)
			} else {
				return null
			}
		} catch {
			return null
		}
	}

	/**
	 * The user this authenticated session belongs to.
	 */
	get currentUser() {
		return this.#currentUser
	}


	/**
	 * Shortcut to mark a string as an ID and check if the corresponding user exists right now in one function. Users are not guaranteed to not be deleted immediately after, so this should only be used if a lot of behavior (eg, the layout of a page and what subsequent queries to make) is determined by the existence of a user. From an authenticated session, you can directly compare the result with `currentUser` (they are the same object if the IDs match).
	 * @param id A string representing the user's ID to query
	 * @returns A User if it existed at least once, the session's CurrentUser if the ID queried is the same, or null.
	 */
	async getRealUser(id: string): Promise<User | CurrentUser | null> {
		if (id === this.#currentUser.id) {
			return this.#currentUser
		}
		if (await Database.userExists(id)) {
			return new User(SafeSessionPrivate, id)
		} else {
			return null
		}
	}

	/**
	 * Create a new user. This is not possible from an already authenticated session. Will always return null.
	 * @param displayName discarded
	 * @param newPassword also discarded
	 * @returns null, always.
	 */
	async createNewUser(displayName: ValidDisplayName, newPassword: ValidPassword): Promise<Fail<Conflict | DatabaseFault | Unauthorized>> {
		return new Fail(Fail.Unauthorized, "Already signed in. Sign out before creating a new user.")
	}


	async getPollInfo(id: number): Promise<PollInfoForUser | Fail<DatabaseFault>> {
		const info = await Database.getPollInfoForUser(this.#currentUser.id, id)
		if (info == null) {
			return new Fail(Fail.DatabaseFault)
		}
		const userHasSubmitted = info.submission != null
		const pollClosed = info.poll.closed
		if (!pollClosed) { //Strip private information based on the user's state.
			info.poll.votes = "open"
			info.poll.winner = "open"
		}
		if (!userHasSubmitted && !pollClosed) {
			info.poll.votes = "inaccessible"
			info.poll.predictions = "inaccessible"
		}
		return info
	}

	async getHomepagePollInfos(): Promise<PollInfoForUser[] | Fail<DatabaseFault>> {
		const [open, closed] = await Promise.all([Database.getAllOpenPollsInfoForUser(this.#currentUser.id), Database.getLimitedClosedPollsInfoForUser(this.#currentUser.id, 3)])
		if (open === null || closed === null) {
			return new Fail(Fail.DatabaseFault)
		}
		const infos = [...open, ...closed]
		for (const info of infos) {
			const userHasSubmitted = info.submission != null
			const pollClosed = info.poll.closed
			if (!pollClosed) { //Strip private information based on the user's state.
				info.poll.votes = "open"
				info.poll.winner = "open"
			}
			if (!userHasSubmitted && !pollClosed) {
				info.poll.votes = "inaccessible"
				info.poll.predictions = "inaccessible"
			}
		}
		return infos
	}

	/**
 * Add a comment to a poll
 */
	async addComment(pollId: number, content: string): Promise<void | Fail<Unauthorized>> {
		if (!content.trim()) {
			throw new Fail(Fail.Unauthorized, "Comment content cannot be empty.");
		}
		await Database.addComment(pollId, this.#currentUser.id, content);
	}

	/**
	 * Add a reply to a comment
	 */
	async addReply(commentId: number, content: string): Promise<void | Fail<Unauthorized>> {
		if (!content.trim()) {
			throw new Fail(Fail.Unauthorized, "Reply content cannot be empty.");
		}
		await Database.addReply(commentId, this.#currentUser.id, content);
	}

	/**
	 * Get all comments and their replies for a poll
	 */
	async getCommentsForPoll(pollId: number): Promise<Comment[] | Fail<DatabaseFault>> {
		const comments = await Database.getCommentsForPoll(pollId);
		if (!comments) {
			return new Fail(Fail.DatabaseFault, "Failed to fetch comments for the poll.");
		}
		return comments;
	}

	/**
	 * Submit a vote and prediction for a poll
	 */
	async submitVote(
		pollId: number,
		voteChoice: boolean,
		predictionChoice: boolean
	): Promise<void | Fail<Unauthorized | DatabaseFault>> {
		if (!pollId) {
			throw new Fail(Fail.Unauthorized, "Poll ID is required to submit a vote.");
		}

		try {
			await Database.submitVote(pollId, this.#currentUser.id, voteChoice, predictionChoice);
		} catch (error) {
			throw new Fail(Fail.DatabaseFault, "Failed to submit vote. Try again later.");
		}
	}

	async getClosedPollInfos(): Promise<PollInfoForUser[] | Fail<DatabaseFault>> {
		try {
			// Fetch closed polls from the database
			const closedPolls = await Database.getAllClosedPollsInfoForUser(this.#currentUser.id);
	
			if (!closedPolls) {
				return new Fail(Fail.DatabaseFault, "Failed to fetch closed polls.");
			}
	
			// Process and return poll information
			return closedPolls.map((poll) => {
				const userHasSubmitted = poll.submission !== null;
				if (!userHasSubmitted) {
					// Remove private information for users who haven't participated
					poll.votes = "inaccessible";
					poll.predictions = "inaccessible";
				}
				return poll;
			});
		} catch (error) {
			console.error("Error fetching closed polls:", error);
			return new Fail(Fail.DatabaseFault, "Failed to fetch closed polls.");
		}
	}
}

/**
 * A string marked as representing a user's ID through a session.
 */
export class PossibleUser {
	#id: string
	constructor(symbol: typeof SafeSessionPrivate, id: string) {
		if (symbol != SafeSessionPrivate) { throw new TypeError("Incorrect symbol. Attempt to construct SafeSession object externally?") }
		this.#id = id
	}

	get id() {
		return this.#id
	}
	toString() {
		return this.#id
	}

	/**
	 * Check if the user is real in the database right now. Users are not guaranteed to not be deleted immediately after, so this should only be used if a lot of behavior (eg, the layout of a page and what subsequent queries to make) is determined by the existence of a user.
	 * @returns A User if it existed at least once, or null.
	 */
	async toRealUser(): Promise<User | null> {
		if (await Database.userExists(this.#id)) {
			return new User(SafeSessionPrivate, this.#id)
		} else {
			return null
		}
	}
}
/**
 * Represents a user ID that did at least exist at some point. It's impossible to guarantee they continue to exist between calls, technically, so any request for information could still fail.
 */
export class User extends PossibleUser {
	/**
	 * This user has already been checked, and should be assumed to exist. Returns `this` immediately. Operations still assume possible failure, so it's safe to continue assuming the user exists.
	 * @returns this
	 */
	async toRealUser() {
		return this
	}

	async getInfo(): Promise<UserInfo | null> {
		return Database.getUserInfo(this.id)
	}
}
/**
 * Represents the current user. They probably exist. Requests can still fail, but it's unlikely.
 */
export class CurrentUser extends User {

}