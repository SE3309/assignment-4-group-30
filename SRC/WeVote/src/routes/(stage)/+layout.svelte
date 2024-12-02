<script lang="ts">
	import './global.css'
	import { page } from '$app/stores'
	import Menu from "$lib/components/page-segments/Menu.svelte";
	import Viewport from "$lib/components/page-segments/Viewport.svelte";
    import TestDisplay from '$lib/components/header-displays/TestDisplay.svelte';
    import DefaultDisplay from '$lib/components/header-displays/DefaultDisplay.svelte';

	const { children, data } = $props()
</script>

<main>
	<Menu userInfo={data.userInfo}/>
	<Viewport Display={$page.data.viewportDisplay? $page.data.viewportDisplay : DefaultDisplay}/>
	<div class="page-fold"></div>

	{@render children()}

	<div class="expand"></div>
	<footer>
		<div class="footer-lines"></div>
		<div class="generic-center">
			<p>Minimum Viable Product Build - not for public use.</p>
			<p>Visuals are temporary and liable to change.</p>
			<p><a href="/about">about</a> {#if data.userInfo} • <a href="/sign-out">sign out</a>{/if}</p>
		</div>
	</footer>
</main>



<style>
	:global(html) {
		min-height: 100%;
	}
	:global(body) {
		--gradient-color-a: hsl(180, 100%, 94%);
		--gradient-color-b: hsl(180, 60%, 90%);
		background: 
		repeating-linear-gradient(var(--gradient-color-a) 0px, var(--gradient-color-a) 5px, var(--gradient-color-b) 7px, var(--gradient-color-b) 7px, var(--gradient-color-a) 8px);
		/* background: repeating-linear-gradient(red, blue); */
	}

	main {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		justify-content: start;

		overflow-x: clip;
	}

	.page-fold {
		position: relative;
		height: 0px;
	}
	.page-fold::after {
		content: '';
		display: block;
		position: absolute;
		z-index: -1;
		left: 0;
		right: 0;
		height: 70px;
		background: linear-gradient(#293a3a48 0px, transparent 2px, transparent 3px, #293a3a48 6px, #293a3a2a 7px, transparent)
	}

	:global(.outside-text-style) {
		text-align: center;
		color: hsl(180deg 100% 15.75%);
	}
	:global(.outside-text-style a){
		
	}

	:global(.panel) {
		position: relative;
		border: 2px solid hsla(180, 29%, 54%, 0.3);
		background-color: var(--g-bg);
		--g-c: 180, 100%, 100%;
		--g-bg: hsla(180, 100%, 95%, 0.2);
		background: 
			repeating-linear-gradient(120deg, 
				transparent 100px,
				hsla(var(--g-c), 0.3) 110px,
				hsla(var(--g-c), 0.5) 115px,
				hsla(var(--g-c), 0.3) 300px,
				transparent 310px,
				transparent 500px,
				hsla(var(--g-c), 0.3) 510px,
				hsla(var(--g-c), 0.5) 515px,
				hsla(var(--g-c), 0.3) 650px,
				transparent 660px,
				transparent 800px,
				hsla(var(--g-c), 0.3) 810px,
				hsla(var(--g-c), 0.5) 815px,
				hsla(var(--g-c), 0.2) 1080px,
				transparent 1090px,
				transparent 1150px,
				hsla(var(--g-c), 0.3) 1160px,
				hsla(var(--g-c), 0.5) 1165px,
				hsla(var(--g-c), 0.2) 1450px,
				transparent 1460px,
				transparent 1500px
				),
			linear-gradient(var(--g-bg), var(--g-bg))
		;
		background-attachment: fixed;
		/* box-shadow: 12px 20px 7px -5px hsla(180, 100%, 23%, 0.15) inset, 0px 0px 10px 5px white inset; */
		padding: 5px 20px;
		border-radius: 10px;
		/* backdrop-filter: blur(2px); */
		color: hsl(180, 40%, 20%);
		margin: 10px 0px;
	}
	:global(.panel::before) {
		content: '';
		position: absolute;
		display: block;
		inset: 0px;
		border-radius: 8px;
		z-index: -1;
		backdrop-filter: blur(2px);
	}
	.page-fold + :global(.generic-center) > :global(.panel):nth-child(1) {
		margin-top: 20px;
	}

	.expand {
		flex-grow: 1;
	}
	footer {
		margin-top: 100px;
		position: relative;
		box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.175);
		color: hsla(180, 40%, 20%, 0.90)
	}
	footer::before {
		z-index: -1;
		pointer-events: none;
		content: '';
		position: absolute;
		inset: 0px;
		opacity: 0.7;
		background: linear-gradient(hsla(180, 100%, 100%, 0.90), hsla(180, 100%, 90%, 0.80));
		/* background: radial-gradient(110% 90% at 100% 100%, black 90%, transparent); */
		mask-image: radial-gradient(110% 90% at 100% 100%, transparent 90%, black);
		/* mix-blend-mode: color-dodge; */
	}
	footer::after {
		z-index: -3;
		content: '';
		position: absolute;
		inset: 0px;
		background: linear-gradient(hsla(180, 100%, 62%, 0.14), hsla(180, 100%, 10%, 0.14));
		/* background-color: rgba(0, 0, 0, 0.1); */
		backdrop-filter: blur(2px);
	}
	.footer-lines {
		z-index: -2;
		content: '';
		position: absolute;
		inset: 0px;
		--g-c: 180, 100%, 100%;
		--g-bg: hsla(180, 100%, 95%, 0.2);
		background: 
			repeating-linear-gradient(120deg, 
					transparent 100px,
					hsla(var(--g-c), 0.3) 110px,
					hsla(var(--g-c), 0.5) 115px,
					hsla(var(--g-c), 0.3) 300px,
					transparent 310px,
					transparent 500px,
					hsla(var(--g-c), 0.3) 510px,
					hsla(var(--g-c), 0.5) 515px,
					hsla(var(--g-c), 0.3) 650px,
					transparent 660px,
					transparent 800px,
					hsla(var(--g-c), 0.3) 810px,
					hsla(var(--g-c), 0.5) 815px,
					hsla(var(--g-c), 0.2) 1080px,
					transparent 1090px,
					transparent 1150px,
					hsla(var(--g-c), 0.3) 1160px,
					hsla(var(--g-c), 0.5) 1165px,
					hsla(var(--g-c), 0.2) 1450px,
					transparent 1460px,
					transparent 1500px
				)
		;
		background-attachment: fixed;
	}

	:global(a) {
		color: hsl(274, 100%, 40%);
	}
</style>