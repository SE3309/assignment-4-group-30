import type { PageServerLoad } from './$types';
import Database from '$lib/server/database/current'; // Adjust based on your directory structure

export const load = (async ({ locals }) => {
    const session = locals.session;

    if (!session.isAuthenticated()) {
        return { leaderboards: null };
    }

    // Fetch leaderboard data
    const topStreakUsers = await Database.getTopStreakUsersThisMonth(3);
    const topPointUsers = await Database.getTopLifetimePointUsers(3);
    const topCosmeticUsers = await Database.getTopCosmeticPurchases(3);

    return {
        leaderboards: {
            streak: topStreakUsers,
            points: topPointUsers,
            cosmetics: topCosmeticUsers,
        },
    };
}) satisfies PageServerLoad;
