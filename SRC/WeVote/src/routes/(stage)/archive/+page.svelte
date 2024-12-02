<script lang="ts">
    import type { PollInfoForUser } from "$lib/server/database/Database.js";

    const { data } = $props();

    function formatWinnerText(poll, votedA: boolean): string {
        return votedA ? poll.options.a : poll.options.b;
    }
</script>

{#if data.polls}
    <div class="generic-center-wide archive-text-style">
        {#each data.polls as entry (entry.poll.id)}
            <div class="panel">
                <div class="content">
                    <h1>{entry.poll.title}</h1>
                    <p class="options">
                        <span
                            class="option a"
                            class:winner={entry.poll.winner === "A"}
                            >{entry.poll.options.a}</span
                        >
                        vs
                        <span
                            class="option b"
                            class:winner={entry.poll.winner === "B"}
                            >{entry.poll.options.b}</span
                        >
                    </p>
                    <p class="totals">
                        {entry.poll.totalSubmissions} total votes
                    </p>
                    {#if entry.submission}
                        <p class="user-vote">
                            You voted for:
                            <span
                                class="voted-for"
                                class:a={entry.submission.votedA}
                                class:b={!entry.submission.votedA}
                            >
                                {formatWinnerText(
                                    entry.poll,
                                    entry.submission.votedA,
                                )}
                            </span>
                        </p>
                        <p class="user-prediction">
                            Your prediction:
                            <span
                                class="voted-for"
                                class:a={entry.submission.predictedA}
                                class:b={!entry.submission.predictedA}
                            >
                                {formatWinnerText(
                                    entry.poll,
                                    entry.submission.predictedA,
                                )}
                            </span>
                        </p>
                    {:else}
                        <p><em>You did not participate in this poll.</em></p>
                    {/if}
                    <p class="description">Description: {entry.poll.description}</p>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .option.winner {
    font-weight: bold;
    text-decoration: underline;
}

.option:not(.winner) {
    font-weight: normal;
    text-decoration: none;
}
    .archive-text-style {
        padding: 20px;
        margin-top: -23vh; /* Pushes the content down by 10% of the viewport height */
    }

    .poll-entry {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas: "content";
        text-decoration: none;
        margin: 10px 0;
        background: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 15px;
    }

    .poll-entry .content {
        grid-area: content;
    }

    .poll-entry h1 {
        margin: 0 0 10px;
        font-size: 1.5rem;
    }

    .poll-entry .options {
        margin: 5px 0;
        font-weight: bold;
    }

    .poll-entry .totals,
    .poll-entry .user-vote,
    .poll-entry .user-prediction {
        margin: 5px 0;
        font-size: 0.9rem;
        color: #555;
    }

    .poll-entry .voted-for.a {
        color: hsl(309, 100%, 44%);
    }

    .poll-entry .voted-for.b {
        color: hsl(133, 100%, 44%);
    }

    .poll-entry .description {
        margin: 10px 0 0;
        font-size: 0.9rem;
        color: #777;
    }

    .poll-entry:hover {
        background: #f9f9f9;
    }
</style>
