<script lang="ts">
    const { data } = $props();
</script>

{#if data.leaderboards}
    <div class="leaderboards-container panel">
        <h1 class="page-title">Leaderboard</h1>

        <!-- Top 3 Users by Streak -->
        <section class="leaderboard-section">
            <h2>🏆 Top 3 Users by Streak</h2>
            <ul class="leaderboard-list">
                {#each data.leaderboards.streak as user, index}
                    <li class="leaderboard-item">
                        <span class="rank">{index + 1}</span>
                        <span class="username">{user.username}</span>
                        <span class="score">{user.streak} poll streak</span>
                    </li>
                {/each}
            </ul>
        </section>

        <!-- Top 3 Users by Lifetime Points -->
        <section class="leaderboard-section">
            <h2>💎 Top 3 Users by Lifetime Points</h2>
            <ul class="leaderboard-list">
                {#each data.leaderboards.points as user, index}
                    <li class="leaderboard-item">
                        <span class="rank">{index + 1}</span>
                        <span class="username">{user.username}</span>
                        <span class="score">{user.lifetimePoints} points</span>
                    </li>
                {/each}
            </ul>
        </section>

        <!-- Top 3 Users by Cosmetic Purchases -->
        <section class="leaderboard-section">
            <h2>🎨 Top 3 Users by Cosmetic Purchases</h2>
            <ul class="leaderboard-list">
                {#each data.leaderboards.cosmetics as user, index}
                    <li class="leaderboard-item ">
                        <span class="rank">{index + 1}</span>
                        <span class="username">{user.username}</span>
                        <span class="score">{user.totalPurchases} cosmetics</span>
                    </li>
                {/each}
            </ul>
        </section>
    </div>
{:else}
    <p class="no-data">No leaderboard data available at this time.</p>
{/if}

<style>
    .leaderboards-container {
        margin: 30px auto;
        margin-top: -15rem;
        max-width: 800px;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .page-title {
        text-align: center;
        font-size: 2rem;
        margin-bottom: 20px;
        color: hsl(209, 100%, 44%);
    }

    .leaderboard-section {
        margin-bottom: 30px;
    }

    h2 {
        font-size: 1.8rem;
        margin-bottom: 15px;
        color: hsl(209, 70%, 34%);
    }

    .leaderboard-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .leaderboard-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .leaderboard-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }

    .rank {
        font-size: 1.2rem;
        font-weight: bold;
        color: hsl(209, 80%, 44%);
        margin-right: 10px;
    }

    .username {
        font-size: 1.1rem;
        flex-grow: 1;
        color: hsl(209, 40%, 30%);
    }

    .score {
        font-size: 1rem;
        font-weight: bold;
        color: hsl(209, 70%, 34%);
    }

    .no-data {
        text-align: center;
        font-size: 1.2rem;
        color: #777;
    }
</style>
