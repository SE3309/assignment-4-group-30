<script lang="ts">
    import type { Component } from "svelte";


	const { Display }: {
		Display: Component
	} = $props(); 

	let perspectivePercentage = $state(50)

	let height: number = $state(350);

	function updatePerspectiveShift() {
		perspectivePercentage = (window.scrollY/height)*100 + 50
	}
</script>

<svelte:document onscroll={updatePerspectiveShift} /> 

<div class="viewport" bind:clientHeight={height} style:perspective-origin={`50% ${perspectivePercentage}%`}>
	<div class="viewport-cover"></div>
	<!-- <h1 style="color: #5a8c8b; margin: 0px; font-size: 5em;" class="center-based-figment">
		<span style="display: inline-block; filter: blur(10px); transform: translateZ(-100px) translate(-50px, -30px) rotateY(50deg) rotateZ(-10deg)">T</span>
		<span style="display: inline-block; filter: blur(5px); transform: translateZ(-50px) translate(0px, 40px) rotateZ(30deg) rotateY(-30deg) rotateX(35deg)">e</span>
		<span style="display: inline-block; filter: blur(0px); transform: translateZ(0px) translate(0px, -20px) rotateZ(-20deg) rotateY(-30deg) rotateX(-34deg)">s</span>
		<span style="display: inline-block; filter: blur(0px); transform: translateZ(0px) translate(50px, 20px) rotateZ(0deg) rotateY(-80deg) rotateX(30deg)">t</span>
	</h1> -->
	<Display />
</div>

<style>
	.viewport {
		z-index: -1;
		height: 350px;
		position: relative;
		background: linear-gradient(#e2fffe, #62fffa);

		perspective: 400px;
		overflow: clip;
	}
	.viewport > :global(*:not(.viewport-cover)) {
		transform-style: preserve-3d;
	}
	.viewport-cover {
		position: absolute;
		inset: 0;
		/* --gradient-color-a: #00fff7; */
		--gradient-color-a: #00fff700;
		--gradient-color-b: #bafffdb6;
		background: 
		repeating-linear-gradient(var(--gradient-color-a) 0px, var(--gradient-color-b) 2px, var(--gradient-color-b) 4px, var(--gradient-color-a) 6px);
		z-index: 1;

		box-shadow: 0px 0px 100px 20px inset #8bfffb;

		backdrop-filter: blur(2px);
	}
</style>