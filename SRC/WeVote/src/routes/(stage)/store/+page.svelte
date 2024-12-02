<script lang="ts">
    import { writable, derived } from "svelte/store";

    // Props from server
    const { data } = $props();

    let userPoints = data.userInfo?.points; // User's current points
    const ownedCosmetics = data.ownedCosmetics; // Owned cosmetics data

    // Reactive stores for category, sorting, and pagination
    let currentPage = writable(1);
    let itemsPerPage = 8; // Number of items per page
    let selectedCategory = writable("front");
    let sortBy = writable("cost"); // Options: "cost" or "popularity"

    // Derived store to get cosmetics based on selected category
    const cosmeticsForCategory = derived(
        selectedCategory,
        ($selectedCategory) => {
            return mergedCosmetics[$selectedCategory] || [];
        },
    );

    const mergedCosmetics = {};

for (const key of Object.keys(data.cosmetics)) {
    mergedCosmetics[key] = [
        ...(ownedCosmetics[key] || []),
        ...(data.cosmetics[key] || []),
    ];
}

console.log(mergedCosmetics);
    // Derived store to apply sorting
    const sortedCosmetics = derived(
        [cosmeticsForCategory, sortBy],
        ([$cosmeticsForCategory, $sortBy]) => {
            if ($sortBy === "cost") {
                return [...$cosmeticsForCategory].sort(
                    (a, b) => a.Cost - b.Cost,
                );
            } else if ($sortBy === "cost2") {
                return [...$cosmeticsForCategory].sort(
                    (a, b) => b.Cost - a.Cost,
                );
            }else if ($sortBy === "popularity") {
                return [...$cosmeticsForCategory].sort(
                    (a, b) => (b.Purchases || 0) - (a.Purchases || 0),
                );
            }
            return $cosmeticsForCategory;
        },
    );

    // Derived store to handle pagination
    const paginatedCosmetics = derived(
        [sortedCosmetics, currentPage],
        ([$sortedCosmetics, $currentPage]) => {
            const start = ($currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            return $sortedCosmetics.slice(start, end);
        },
    );

    // Change the current page
    function changePage(page: number) {
        currentPage.set(page);
    }

    function isOwned(category: string, cosmeticId: number): boolean {
        return ownedCosmetics[category]?.some((owned) => owned.id === cosmeticId);
    }
</script>

{#if data.cosmetics}
    <div class="store">
        <h1>Cosmetic Store</h1>

        <!-- Category Selector -->
        <div class="category-selector">
            {#each Object.keys(mergedCosmetics) as category}
                <button
                    class:selected={$selectedCategory === category}
                    on:click={() => {
                        selectedCategory.set(category);
                        currentPage.set(1); // Reset to first page on category change
                    }}
                >
                    {category.charAt(0).toUpperCase() + category.slice(1)} Cosmetics
                </button>
            {/each}
        </div>

        <!-- Sorting Options -->
        <div class="sorting-options">
            <label>
                Sort by:
                <select bind:value={$sortBy}>
                    <option value="cost">Least to Most Expensive</option>
                    <option value="cost2">Most to Least Expensive</option>
                    <option value="popularity">Most Popular</option>
                </select>
            </label>
        </div>

        <!-- Paginated Items -->
        <ul class="cosmetic-list">
            {#each $paginatedCosmetics as cosmetic}
                <li class="panel cosmetic-item">
                    <img
                        src="/default_shop_img.png"
                        alt="Cosmetic preview"
                        class="cosmetic-image"
                    />
                    <p class="cost">
                        Cost: <span>{cosmetic.Cost}</span> points
                    </p>
                    <p class="popularity">
                        Purchases: <span>{cosmetic.Purchases || 0}</span>
                    </p>
                    <form
                        method="POST"
                        action="?/purchase"
                        class="purchase-form"
                    >
                        <input
                            type="hidden"
                            name="cosmeticId"
                            value={cosmetic.id}
                        />
                        <input
                            type="hidden"
                            name="category"
                            value={$selectedCategory}
                        />
                        <button
                            type="submit"
                            disabled={isOwned($selectedCategory, cosmetic.id) || userPoints < cosmetic.Cost}
                            class:disabled={isOwned($selectedCategory, cosmetic.id) || userPoints < cosmetic.Cost}
                        >
                            {#if isOwned($selectedCategory, cosmetic.id)}
                                Owned
                            {:else if userPoints < cosmetic.Cost}
                                Insufficient Points
                            {:else}
                                Purchase
                            {/if}
                        </button>
                    </form>
                </li>
            {/each}
        </ul>

        <!-- Pagination Controls -->
        <div class="pagination">
            {#each Array(Math.ceil($cosmeticsForCategory.length / itemsPerPage)).fill(0) as _, index}
                <button
                    class:active={index + 1 === $currentPage}
                    on:click={() => changePage(index + 1)}
                >
                    {index + 1}
                </button>
            {/each}
        </div>
    </div>
{:else}
    <p>No cosmetics available for purchase.</p>
{/if}

<style>
    .store {
        margin: 20px;
        margin-top: -13rem;
        text-align: center;
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 20px;
    }

    .category-selector {
        margin-bottom: 20px;
    }

    .category-selector button {
        margin: 5px;
        padding: 10px 15px;
        background-color: #eaeaea;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .category-selector button.selected {
        background-color: #007bff;
        color: white;
    }

    .sorting-options {
        margin: 20px 0;
    }

    .sorting-options select {
        padding: 5px;
        font-size: 1rem;
    }

    .cosmetic-list {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 20px;
        list-style: none;
        padding: 0;
    }

    .cosmetic-item {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 10px;
        text-align: center;
        width: 200px;
        transition: transform 0.3s;
    }

    .cosmetic-item:hover {
        transform: scale(1.05);
    }

    .cosmetic-image {
        max-width: 100%;
        height: auto;
        margin-bottom: 10px;
        border-radius: 5px;
    }

    .cost,
    .popularity {
        font-size: 1rem;
        margin: 5px 0;
    }

    .purchase-form button {
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
    }

    .purchase-form button:hover {
        background-color: #0056b3;
    }

    .pagination {
        margin-top: 20px;
    }

    .pagination button {
        margin: 0 5px;
        padding: 10px 15px;
        border: none;
        background-color: #eaeaea;
        border-radius: 5px;
        cursor: pointer;
    }

    .pagination button.active {
        background-color: #007bff;
        color: white;
    }
    button:disabled {
    background-color: #cccccc; /* Light gray background */
    color: #666666; /* Gray text */
    cursor: not-allowed; /* Not-allowed cursor */
    opacity: 0.7; /* Slightly transparent */
    }
    button:hover:disabled {
    background-color: #cccccc; /* Light gray background */
    color: #666666; /* Gray text */
    cursor: not-allowed; /* Not-allowed cursor */
    opacity: 0.7; /* Slightly transparent */
    }
</style>
