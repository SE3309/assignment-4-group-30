import type { UserInfo } from '$lib/server/database/Database';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageLoad, PageServerLoad } from './$types';
import { isFail } from '$lib/server/SafeSession';
import { validateEmail, validatePassword } from '$lib/server/Valid';

export const actions = {
	default: async (event) => {
		const session = event.locals.session
		const data = await event.request.formData()
		
		const email = data.get("email")?.toString()
		const password = data.get("password")?.toString()

		if (!email || !password) {
			return fail(400, { error: "Malformed: Missing required fields.", errorMessage: "Username or Password missing, check form and try again." })
		}

		const validEmail = validateEmail(email)
		if (typeof validEmail === "string") {
			return fail(403, { error: "Unauthorized: Authentication failed.", errorMessage: "Username or Password incorrect." })
		}
		const validPassword = validatePassword(password)
		if (validPassword === "too short") {
			return fail(403, { error: "Unauthorized: Authentication failed.", errorMessage: "Username or Password incorrect." })
		}

		const token = await session.constructJWT(validEmail, validPassword)

		if (isFail(token)) {
			return fail(403, { error: "Unauthorized: Authentication failed.", errorMessage: "Username or Password incorrect." })
		}

		event.cookies.set("auth", token, {
			httpOnly: true,
			path: '/',
			secure: true,
			sameSite: true,
			maxAge: 60 * 60 * 24 * 14
		})

		redirect(303, "/")
	}
} satisfies Actions;

export const load: PageServerLoad = async (event) => {
	if (event.locals.session.isAuthenticated()) {
		return redirect(307, "/");
	}
}