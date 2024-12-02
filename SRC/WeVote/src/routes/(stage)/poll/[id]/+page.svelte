<script lang="ts">
    import { enhance } from "$app/forms";
    import PollStyledGraph from "$lib/components/graph/PollStyledGraph.svelte";
    import ErrorBubble from "$lib/components/info-bubbles/ErrorBubble.svelte";

    const { data, form } = $props();

    function getPercent(
		votes: {a: number;
			b: number;
			percentA: number;
			percentB: number;
		}, 
		a: boolean
	): number {
		return !a? votes.percentA : votes.percentB
	}
</script>

<div class="graphContainer">
    <div class="graph">
        <PollStyledGraph
            percentage={(data.userHasVoted) ? getPercent(data.poll.poll.predictions, data.poll.submission.predictedA) : 0.5}
            closed={data.poll.poll.closed}
            id={data.poll.poll.id.toString()}
        />
    </div>
</div>

<main class="generic-center-wide">
    <!-- Poll Title and Description -->
    <h1>{data.poll.poll.title}</h1>
    <p>{data.poll.poll.description}</p>

    <!-- Voting Form -->

    <form use:enhance method="POST" action="?/vote" class="styled-form">
        <fieldset>
            <label>
                <input
                    type="radio"
                    name="voteChoice"
                    value="true"
                    checked={data?.poll.submission?.votedA === 1}
                    disabled={data.userHasVoted}
                    required
                />
                {data.poll.poll.options.a}
            </label>
            <label>
                <input
                    type="radio"
                    name="voteChoice"
                    value="false"
                    checked={data?.poll.submission?.votedA === 0}
                    disabled={data.userHasVoted}
                />
                {data.poll.poll.options.b}
            </label>
            <label>
                Predict Winner:
                <input
                    type="checkbox"
                    name="predictionChoice"
                    checked={
                        data?.poll?.submission?.votedA !== undefined
                            ? data.poll.submission.predictedA === 1
                            : false
                    }
                    disabled={data.userHasVoted}
                />
            </label>
            <button type="submit" disabled={data.userHasVoted}>
                Submit Vote
            </button>
        </fieldset>
    </form>

    <!-- Show Graph and Comments only if user has voted -->
    {#if data.userHasVoted}


        <!-- Comments Section -->
        <section>
            <h2>Comments</h2>
            <!-- Comment Form -->
            <form use:enhance method="POST" action="?/comment" class="styled-form">
                <textarea
                    name="content"
                    placeholder="Add a comment..."
                    required
                ></textarea>
                <button type="submit">Submit Comment</button>
            </form>

            {#each data.comments as comment}
                <div class="comment">
                    <p><strong>{comment.author}</strong>: {comment.Content}</p>
                    <small
                        >Posted at {new Date(
                            comment.CommentTimeSubmitted,
                        ).toLocaleString()}</small
                    >

                    <!-- Reply Form -->
                    <form
                        use:enhance
                        method="POST"
                        action="?/reply"
                        class="styled-form"
                    >
                        <input
                            type="hidden"
                            name="commentId"
                            value={comment.CommentID}
                        />
                        <textarea
                            name="content"
                            placeholder="Reply to this comment..."
                            required
                        ></textarea>
                        <button type="submit">Submit Reply</button>
                    </form>

                    <!-- Replies -->
                    {#each comment.replies as reply}
                        <div class="reply">
                            <p><strong>{reply.author}</strong>: {reply.Content}</p>
                            <small
                                >Posted at {new Date(
                                    reply.CommentTimeSubmitted,
                                ).toLocaleString()}</small
                            >
                        </div>
                    {/each}
                </div>
            {/each}
        </section>
    {/if}
</main>
<style>
    .styled-form {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    textarea {
        resize: vertical;
        min-height: 50px;
        padding: 10px;
        font-size: 14px;
    }

    button {
        padding: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }

    main {
        padding: 20px;
    }

    h1 {
        text-align: center;
    }

    .graphContainer {
        position: absolute;
        top: 100px;
        display: flex; /* Enable flexbox */
        height: 200px; /* Adjust height to better center the graph */
        width: 100vw; /* Full width of the viewport */
        align-items: center; /* Center content vertically */
        justify-content: center; /* Center content horizontally */
    }

    .graph {
        height: 300px; /* Adjust the graph size */
        width: 300px; /* Adjust the graph size */
    }

    .voting-section {
        margin-bottom: 30px;
    }

    .voting-section label {
        display: block;
        margin-bottom: 10px;
    }

    .comments-section {
        margin-top: 30px;
    }

    .comment,
    .reply {
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .reply {
        margin-left: 20px;
    }

    textarea {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
    }

    button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }
    button:disabled {
        background-color: #cccccc; /* Light gray to indicate disabled state */
        color: #666666; /* Gray text for better contrast */
        cursor: not-allowed; /* Show not-allowed cursor to indicate disabled */
        opacity: 0.6; /* Slightly transparent */
        border: 1px solid #999999; /* Subtle border for better visibility */
    }
</style>
