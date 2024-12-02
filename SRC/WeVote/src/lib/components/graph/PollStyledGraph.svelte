<script lang="ts">
    import { spring } from "svelte/motion";
import GraphRender from "./GraphRender.svelte";

	let { percentage, closed, id }: {
		id: string,
		percentage: number,
		closed: boolean
	} = $props()

	let percentageSpring = spring(percentage, {
		stiffness: 0.05,
		damping: 0.3,
		precision: 0.001
	})
	$effect(()=>{
		percentageSpring.set(percentage)
	})
</script>

<div class="poll-graph" class:closed class:open={!closed}>
	<GraphRender percentage={$percentageSpring} inset={50} gap={3} {id} />
	<svg style="visibility: hidden;position: absolute;pointer-events: none;">



		<linearGradient id="pink-gradient" gradientTransform="rotate(90)">
			<stop offset="50%" stop-color="hsl(309, 80%, 64%)" />
			<stop offset="55%" stop-color="hsl(309, 100%, 54%)" />
		</linearGradient>
		<linearGradient id="pink-gradient-edge" gradientTransform="rotate(90)">
			<stop offset="60%" stop-color="hsl(309, 80%, 74%)" />
			<stop offset="65%" stop-color="hsl(309, 100%, 64%)" />
		</linearGradient>

		<linearGradient id="green-gradient" gradientTransform="rotate(90)">
			<stop offset="50%" stop-color="hsl(133, 80%, 64%)" />
			<stop offset="55%" stop-color="hsl(133, 100%, 54%)" />
		</linearGradient>
		<linearGradient id="green-gradient-edge" gradientTransform="rotate(90)">
			<stop offset="60%" stop-color="hsl(133, 80%, 74%)" />
			<stop offset="65%" stop-color="hsl(133, 100%, 64%)" />
		</linearGradient>




		<linearGradient id="pink-gradient-open" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="hsla(309, 80%, 64%, 0.1)" />
			<stop offset="100%" stop-color="hsla(309, 100%, 54%, 0.2)" />
		</linearGradient>
		<linearGradient id="pink-gradient-edge-open" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="hsla(309, 80%, 74%, 0)" />
			<stop offset="100%" stop-color="hsla(309, 100%, 64%, 0.7)" />
		</linearGradient>

		<linearGradient id="green-gradient-open" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="hsla(133, 80%, 64%, 0.1)" />
			<stop offset="100%" stop-color="hsla(133, 100%, 54%, 0.2)" />
		</linearGradient>
		<linearGradient id="green-gradient-edge-open" gradientTransform="rotate(90)">
			<stop offset="0%" stop-color="hsla(133, 80%, 74%, 0)" />
			<stop offset="100%" stop-color="hsla(133, 100%, 64%, 0.7)" />
		</linearGradient>
		


	</svg>
</div>
<style>
	.poll-graph {
		transform: perspective(500px) rotateX(50deg);
	}


	.poll-graph.closed :global(.pie-chart-left-fill) {
		fill: url(#pink-gradient);
	}
	.poll-graph.closed :global(.pie-chart-left-stroke) {
		stroke-width: 5px;
	}
	.poll-graph.closed :global(.pie-chart-left-stroke-fill) {
		fill: url(#pink-gradient-edge);
	}

	.poll-graph.closed :global(.pie-chart-right-fill) {
		fill: url(#green-gradient);
	}
	.poll-graph.closed :global(.pie-chart-right-stroke) {
		stroke-width: 5px;
	}
	.poll-graph.closed :global(.pie-chart-right-stroke-fill) {
		fill: url(#green-gradient-edge);
	}


	.poll-graph.open :global(.pie-chart-left-fill) {
		fill: url(#pink-gradient-open);
	}
	.poll-graph.open :global(.pie-chart-left-stroke) {
		stroke-width: 5px;
	}
	.poll-graph.open :global(.pie-chart-left-stroke-fill) {
		fill: url(#pink-gradient-edge-open);
	}

	.poll-graph.open :global(.pie-chart-right-fill) {
		fill: url(#green-gradient-open);
	}
	.poll-graph.open :global(.pie-chart-right-stroke) {
		stroke-width: 5px;
	}
	.poll-graph.open :global(.pie-chart-right-stroke-fill) {
		fill: url(#green-gradient-edge-open);
	}
</style>