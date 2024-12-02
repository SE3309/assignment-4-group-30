import { isFail } from "$lib/server/SafeSession";
import type { PageServerLoad, Actions } from "./$types";
import Database from '$lib/server/database/current'; // Adjust based on your directory structure

export const load: PageServerLoad = async ({ locals }) => {
    const session = locals.session;

    if (!session.isAuthenticated()) {
        return {};
    }

    const userId = session.currentUser?.id;
    if (!userId) {
        return { error: "User not authenticated." };
    }

    const cosmetics = await Database.getAvailableCosmeticsForUser(userId);
    const ownedCosmetics = await Database.getOwnedCosmeticsForUser(userId);

    if (isFail(cosmetics) || isFail(ownedCosmetics)) {
        return { error: "Failed to load cosmetics or ownership data." };
    }

    return { cosmetics, ownedCosmetics };
};

export const actions: Actions = {
    purchase: async ({ locals, request }) => {
        const session = locals.session;

        if (!session.isAuthenticated()) {
            return { error: "You must be logged in to purchase cosmetics." };
        }

        const formData = await request.formData();
        const cosmeticId = formData.get("cosmeticId");
        const cosmeticCost = formData.get("cosmeticCost");
        const category = formData.get("category"); // front, middle, or back

        if (!cosmeticId || !category) {
            return { error: "Invalid cosmetic selection." };
        }

        const userId = session.currentUser?.id;

        const result = await Database.purchaseCosmetic(userId, Number(cosmeticId), category.toString());

        if (isFail(result)) {
            return { error: "Purchase failed. Insufficient points or already owned." };
        }

        return { success: true };
    },
};
