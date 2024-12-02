<script lang="ts">
    import { writable } from "svelte/store";

    // Props from server
    export let data;

    let userInfo = data.userInfo;
    let ownedCosmetics = data.ownedCosmetics;

    // Stores to manage currently equipped cosmetics
    let equippedFront = writable(userInfo?.frontDisplayed || null);
    let equippedMiddle = writable(userInfo?.middleDisplayed || null);
    let equippedBack = writable(userInfo?.backDisplayed || null);

    async function equipCosmetic(cosmeticId: number, category: string) {
    const formData = new FormData();
    formData.append("userId", userInfo.id);
    formData.append("cosmeticId", cosmeticId.toString());
    formData.append("category", category);

    try {
        console.log("Sending equip request:", { userId: userInfo.id, cosmeticId, category });

        const response = await fetch("?/equip", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            console.error("Failed to equip cosmetic:", await response.text());
            return;
        }

        const result = await response.text(); // Parse the response
        console.log("Server response:", result);

        // Reload the page to reflect the changes
        window.location.reload();
    } catch (error) {
        console.error("Error equipping cosmetic:", error);
    }
}

</script>

<main class="profile-page">
    <section class="panel user-info">
        <h1>{userInfo.displayName}'s Profile</h1>
        <p>Points: <span>{userInfo.points}</span></p>
        <p>Lifetime Points: <span>{userInfo.lifetimePoints}</span></p>
        <p>Streak: <span>{userInfo.streak}</span></p>
        <p>Prediction Accuracy: <span>{userInfo.predictionAccuracy}%</span></p>
        <p>Bio: <span>{userInfo.bio}</span></p>
    </section>

    <section class="panel cosmetics">
        <h2>Equip Your Cosmetics</h2>

        <div class="cosmetic-category">
            <h3>Front Cosmetics</h3>
            <ul class="cosmetic-list">
                {#each ownedCosmetics.front as cosmetic}
                    <li class="panel cosmetic-item">
                        <img src="/default_shop_img.png" alt="Cosmetic Image" />
                        <button
                            on:click={() => equipCosmetic(cosmetic.id, "front")}
                            disabled={$equippedFront === cosmetic.id}
                        >
                            {#if $equippedFront === cosmetic.id}
                                Equipped
                            {:else}
                                Equip
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="cosmetic-category">
            <h3>Middle Cosmetics</h3>
            <ul class="cosmetic-list">
                {#each ownedCosmetics.middle as cosmetic}
                    <li class="panel cosmetic-item">
                        <img src="/default_shop_img.png" alt="Cosmetic Image" />
                        <button
                            on:click={() =>
                                equipCosmetic(cosmetic.id, "middle")}
                            disabled={$equippedMiddle === cosmetic.id}
                        >
                            {#if $equippedMiddle === cosmetic.id}
                                Equipped
                            {:else}
                                Equip
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="cosmetic-category">
            <h3>Back Cosmetics</h3>
            <ul class="cosmetic-list">
                {#each ownedCosmetics.back as cosmetic}
                    <li class="panel cosmetic-item">
                        <img src="/default_shop_img.png" alt="Cosmetic Image" />
                        <button
                            on:click={() => equipCosmetic(cosmetic.id, "back")}
                            disabled={$equippedBack === cosmetic.id}
                        >
                            {#if $equippedBack === cosmetic.id}
                                Equipped
                            {:else}
                                Equip
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </section>
</main>

<style>
    .profile-page {
        margin: 20px;
        margin-top: -19.4rem;
    }

    .user-info h1 {
        font-size: 2rem;
    }

    .cosmetic-category {
        margin-top: 20px;
    }

    .cosmetic-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }

    .cosmetic-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 150px;
    }

    .cosmetic-item img {
        width: 100px;
        height: 100px;
        margin-bottom: 10px;
    }

    .cosmetic-item button {
        padding: 5px 10px;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }

    .cosmetic-item button:disabled {
        background-color: #cccccc;
        color: #666666;
        cursor: not-allowed;
    }
</style>
