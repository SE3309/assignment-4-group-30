import { Session, UnauthenticatedSession } from "$lib/server/SafeSession";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({event, resolve}) => { //Does authentication stuff, adding the correct session type to all event handlers. //TODO: re-issue a new JWT if the old one is going to expire
	const token = event.cookies.get("auth")
	if (token) {
		const session = await Session.fromJWT(token)
		if (session) {
			event.locals.session = session
		} else {
			event.cookies.delete("auth", {path: "/"})
			event.locals.session = new UnauthenticatedSession()
		}
	} else {
		event.locals.session = new UnauthenticatedSession()
	}
	return await resolve(event)
}