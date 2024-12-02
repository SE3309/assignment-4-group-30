//A set of wrapper objects acting as a source-of-truth for various rules. Similar to and used with SafeSessions
const ValidPrivate: unique symbol = Symbol("Valid Private Symbol")

abstract class Valid<T> {
	#value
	constructor(value: T, symbol: typeof ValidPrivate) {
		if (symbol !== ValidPrivate) {
			throw new TypeError("Attempt to construct Valid without correct symbol")
		}
		this.#value = value
	}
	get value() {
		return this.#value
	}
}

export class ValidEmail extends Valid<string> {}
export function validateEmail(email: string): ValidEmail | "malformed" | "disallowed" {
	const split = email.split("@")
	if (!split[1]) {
		return "malformed"
	}
	if (split[1] !== "uwo.ca" ) {
		return "disallowed"
	}
	return new ValidEmail(email, ValidPrivate)
}

export class ValidDisplayName extends Valid<string> {}
export function validateDisplayName(displayName: string): ValidDisplayName | "profanity" { //TODO: profanity
	return new ValidDisplayName(displayName, ValidPrivate)
}

export class ValidPassword extends Valid<string> {}
export function validatePassword(password: string): ValidPassword | "too short" {
	if (password.length < 4) {
		return "too short"
	}
	return new ValidPassword(password, ValidPrivate)
}