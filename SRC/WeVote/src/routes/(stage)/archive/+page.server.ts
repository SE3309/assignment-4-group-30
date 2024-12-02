import { isFail } from '$lib/server/SafeSession';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const session = event.locals.session;

    if (!session.isAuthenticated()) {
        return {};
    }

    // Fetch only closed polls
    const polls = await session.getClosedPollInfos();
    if (isFail(polls)) {
        return {};
    }

    return { polls };
}) satisfies PageServerLoad;
