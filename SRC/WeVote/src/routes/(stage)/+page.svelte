<script lang="ts">
    import GraphRender from "$lib/components/graph/GraphRender.svelte";
    import PollStyledGraph from "$lib/components/graph/PollStyledGraph.svelte";
    import type { PollInfo, PollInfoForUser } from "$lib/server/database/Database.js";

	const {data} = $props();


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


{#if data.polls}
	<div class="generic-center-wide outside-text-style">
		{#each data.polls as entry}
			<a class="poll-entry panel" href="/poll/{entry.poll.id}">
				<div class="graph">
					{#if typeof entry.poll.votes !== "string" && entry.submission}
						<PollStyledGraph 
							percentage={getPercent(entry.poll.votes, entry.submission.votedA)}
							closed={entry.poll.closed}
							id={entry.poll.id.toString()}
						/>
					{:else if typeof entry.poll.predictions !== "string" && entry.submission}
						<PollStyledGraph 
							percentage={getPercent(entry.poll.predictions, entry.submission.predictedA)}
							closed={entry.poll.closed}
							id={entry.poll.id.toString()}
						/>
					{:else}
						<PollStyledGraph 
							percentage={0.5}
							closed={entry.poll.closed}
							id={entry.poll.id.toString()}
						/>
					{/if}
				</div>
				<div class="content">
					<h1>{entry.poll.title}</h1>
					{#if typeof entry.poll.votes !== "string" && entry.submission}
					<p class="options"><span class="option a" class:winner={entry.poll.winner==="A"}>{entry.poll.options.a} <span class="vote-amount">({entry.poll.votes.a} votes)</span></span> vs <span class="option b" class:winner={entry.poll.winner==="B"}>{entry.poll.votes.b} <span class="vote-amount">({entry.poll.votes.b} votes)</span></span></p>
					<p class="totals">{entry.poll.totalSubmissions} total votes • You voted for <span class="voted-for" class:a={entry.submission.votedA} class:b={!entry.submission.votedA}>{entry.submission.votedA? entry.poll.options.a : entry.poll.options.b}</span></p>
					<p class="prediction-results">You predicted <span class="voted-for" class:a={entry.submission.predictedA} class:b={!entry.submission.predictedA}>{entry.submission.predictedA? entry.poll.options.a : entry.poll.options.b}</span>, which was <span>{entry.submission.predictedA? "A" : "B" === entry.poll.winner? "correct!" : "incorrect."}</span></p>
					{:else if typeof entry.poll.predictions !== "string" && entry.submission}
					<p class="options"><span class="option a">{entry.poll.options.a} <span class="prediction">({entry.poll.predictions.a} predict)</span></span> vs <span class="option b">{entry.poll.options.b} <span class="prediction">({entry.poll.predictions.b} predict)</span></span></p>
					<p class="totals">{entry.poll.totalSubmissions} total predictions • You voted for <span class="voted-for" class:a={entry.submission.votedA} class:b={!entry.submission.votedA}>{entry.submission.votedA? entry.poll.options.a : entry.poll.options.b}</span></p>
					<p class="prediction-state">You predict <span class="voted-for" class:a={entry.submission.predictedA} class:b={!entry.submission.predictedA}>{entry.submission.predictedA? entry.poll.options.a : entry.poll.options.b}</span> will win.</p>
					{:else}
						<p class="options"><span class="option a">{entry.poll.options.a}</span> vs <span class="option b">{entry.poll.options.b}</span></p>
						<p class="totals">{entry.poll.totalSubmissions} submissions • Vote to see predictions</p>
					{/if}
					<p class="description">{entry.poll.description}</p>
				</div>
			</a>
		{/each}


		<p>See more closed polls in <a href="/archive">the archive</a></p>
	</div>
{/if}


<style>
	.poll-entry {
		display: grid;
		grid-template-columns: 200px 1fr;
		grid-template-areas: 
		"graph content"
		;
		text-decoration-color: inherit;
		text-decoration: none;
		margin: 10px 0;
	}
	.poll-entry .graph {
		grid-area: graph;
		z-index: 1;

		position: relative;
	}
	.poll-entry .content {
		text-align: left;
		padding: 5px 20px;
		grid-area: content;
		text-decoration: none;
		z-index: 1;
		color: hsl(180, 40%, 20%);
	}
	.poll-entry .content h1 {
		margin: 0.1em 0em;
		margin-bottom: 0px;
	}
	.poll-entry .content .options {
		margin: 0px;
		/* margin-bottom: 0.5em; */
		font-size: 1.1em;
	}
	.poll-entry .content .options .option {
		font-weight: bold;
		font-size: 1.3em;
	}
	.poll-entry .content .options .option.a {
		color: hsl(309, 100%, 44%);
	}
	.poll-entry .content .options .option.b {
		color: hsl(133, 100%, 44%);
	}
	.poll-entry .content .totals {
		margin: 0px;
	}

	.poll-entry .content .prediction {
		opacity: 0.5;
		font-size: 0.8em;
	}

	.poll-entry .content .prediction {
		opacity: 0.5;
		font-size: 0.8em;
	}

	.poll-entry .content .options .winner {
		font-size: 1.8em;
	}
	.poll-entry .content .vote-amount {
		opacity: 0.8;
		font-size: 0.7em;
	}

	.poll-entry .content .voted-for.a {
		font-weight: bold;
		color: hsl(309, 100%, 44%);
	}
	.poll-entry .content .voted-for.b {
		font-weight: bold;
		color: hsl(133, 100%, 44%);
	}

	.poll-entry .content .prediction-results {
		margin: 0;
		font-style: italic;
	}
	.poll-entry .content .prediction-state {
		margin: 0;
	}


	.poll-entry:nth-child(1) {
		margin-top: -235px;
	}
</style>
