import type { Actions, PageServerLoad } from "./$types";
import Database from "$lib/server/database/current";

export const load: PageServerLoad = async ({ params }) => {
    const userId = params.id;

    // Fetch user info
    const userInfo = await Database.getUserInfo(userId);
    if (!userInfo) {
        throw new Error("User not found");
    }

    // Fetch owned cosmetics
    const ownedCosmetics = await Database.getOwnedCosmeticsForUser(userId);

    return {
        userInfo,
        ownedCosmetics,
    };
};

export const actions: Actions = {
    equip: async ({ request }) => {
        try {
            const formData = await request.formData();
            const userId = formData.get("userId");
            const cosmeticId = formData.get("cosmeticId");
            const category = formData.get("category");

            if (!userId || !cosmeticId || !category) {
                return {
                    type: "error",
                    status: 400,
                    error: "Missing required fields",
                };
            }

            const success = await Database.equipCosmetic(
                userId.toString(),
                parseInt(cosmeticId.toString(), 10),
                category.toString()
            );

            if (!success) {
                return {
                    type: "error",
                    status: 500,
                    error: "Failed to equip cosmetic",
                };
            }

            // Fetch updated user info
            const updatedUserInfo = await Database.getUserInfo(userId.toString());

            const result = [updatedUserInfo.frontDisplayed, updatedUserInfo.middleDisplayed, updatedUserInfo.backDisplayed];
            console.log("Returning Result:", result);
            return result;
            
        } catch (error) {
            console.error("Equip action failed:", error);
            return {
                type: "error",
                status: 500,
                error: "Internal server error",
            };
        }
    },
};
