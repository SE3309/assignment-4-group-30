import type { UserInfo } from "../Database"
import type Database from "../Database"

const users: {[key:string]: {
	email: string,
	displayName: string,
	bio: string,
	passwordHash: string
}} = {}

/**
 * An inefficient in-memory database adapter for development. Used to emulate a real database before one is available.
 */
export const InMemory: Database = {
	insertNewUser: async function (displayName: string, email: string, passwordHash: string, bio: string) {
		users[displayName] = { displayName, passwordHash, bio, email }
		return displayName
	},
	userExists: async function (id: string) {
		return users[id] !== undefined
	},
	userExistsByEmail: async function (email: string) {
		for (const id in users) {
			const user = users[id]
			if (user.email === email) {
				return true
			}
		}
		return false
	},
	getUserInfo: async function (id: string) {
		if (await this.userExists(id)) {
			return {
				displayName: users[id].displayName,
				bio: users[id].bio
			}
		}
		return null
	},
	updateBioForUser: async function (id: string, newBio: string) {
		if (await this.userExists(id)) {
			users[id].bio = newBio
			return true
		}
		return false
	},
	getUserAuthDetails: async function (email: string): Promise<{ hash: string, id: string } | null> {
		for (const id in users) {
			const user = users[id]
			if (user.email === email) {
				return {hash: user.passwordHash, id}
			}
		}
		return null
	}
}