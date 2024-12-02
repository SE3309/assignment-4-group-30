import type { UserInfo } from '$lib/server/database/Database';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	let userInfo: UserInfo | null = null
	if (event.locals.session.isAuthenticated()) {
		userInfo = await event.locals.session.currentUser.getInfo()
	}
	return {
		userInfo
	}
}