import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Fail, isFail, User } from '$lib/server/SafeSession';
import { validateDisplayName, validateEmail, validatePassword } from '$lib/server/Valid';

export const actions = {
	default: async (event) => {
		const session = event.locals.session
		if (session.isAuthenticated()) {
			//A signed-in user shouldn't be making an account!
			return fail(403, {error:"Disallowed: Sign out before creating another account.",errorMessage:"Disallowed: Sign out before creating another account."})
		}
		const data = await event.request.formData()
		const displayName = data.get("displayName")?.toString()
		const email = data.get("email")?.toString()
		const password = data.get("password")?.toString()

		if ( !displayName || !password || !email ) {
			return fail(400, {error:"Malformed: Missing required fields.",errorMessage:"Required field missing, check form and try again."})
		}

		const validEmail = validateEmail(email)
		if (validEmail==="malformed"){
			return fail(400, {error:"Malformed: Invalid email",errorMessage:"Something's wrong with that mail address. check form and try again."})
		}
		if (validEmail==="disallowed"){
			return fail(403, {error:"Disallowed: Email restriction in affect.",errorMessage:"Sorry, you can't use that email. You must sign up with an @uwo.ca email address at the moment."})
		}
		const validPassword = validatePassword(password)
		if (validPassword === "too short") {
			return fail(403, {error:"Disallowed: Password too short.",errorMessage:"Your password needs to be at least 4 letters long. Respect yourself."})
		}
		const validDisplayName = validateDisplayName(displayName)
		if (validDisplayName === "profanity") {
			return fail(403, {error:"Disallowed: Invalid display name.",errorMessage:"Cannot accept that display name. Please try another."})
		}

		const newUser = await session.createNewUser(validDisplayName, validEmail, validPassword)
		if (isFail(newUser)) {
			switch (newUser.error) { //Don't send any information on what actually happened (for now, pending consideration), as it could be used to gain information (eg. what user's emails are registered)
				case Fail.Unauthorized:
					return fail(403, {error:"Disallowed: User creation rejected.",errorMessage:"User creation rejected. A user with that email may already exist, or something else may have gone wrong. Check fields, or try again later."})
				case Fail.Conflict:
					return fail(403, {error:"Disallowed: User creation rejected.",errorMessage:"User creation rejected. A user with that email may already exist, or something else may have gone wrong. Check fields, or try again later."})
				case Fail.DatabaseFault:
					return fail(403, {error:"Disallowed: User creation rejected.",errorMessage:"User creation rejected. A user with that email may already exist, or something else may have gone wrong. Check fields, or try again later."})
			}
			
		}

		return {success: true}
	},
} satisfies Actions;


export const load: PageServerLoad = async (event) => {
	if (event.locals.session.isAuthenticated()) {
		return redirect(307, "/");
	}
}