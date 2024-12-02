import { isFail } from '$lib/server/SafeSession';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const session = event.locals.session

    if (!session.isAuthenticated()) {
        return {};
    }

    const polls = await session.getHomepagePollInfos();
    if (isFail(polls)) {
        return {};
    }
    return {polls};
}) satisfies PageServerLoad;