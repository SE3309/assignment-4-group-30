<script lang="ts">
    import bezier from "bezier-easing";
    import icon from './funny icon.svg'

	const { message, top }: {
		message: string | null | undefined,
		top: boolean
	} = $props()

	function bubble(element: HTMLElement, params: undefined, {direction}: {direction: 'in' | 'out' | 'both' }){
		const height = element.clientHeight
		return {
			duration: direction==='in'? 300 : 200,
			easing: direction==='in'? bezier(0,1.44,.55,1) : bezier(1,0,.55,1),
			css: (t: number, u: number) => top? `margin-top: -${t*2}em;
			margin-bottom:${10 + u*10}px;
			height:${Math.max(t*height, 0.1)}px;
			padding: ${t*10}px 20px;` 
			: 
			`margin: ${u*-5 + t*10}px 0px;
			height:${Math.max(t*height, 0.1)}px;
			padding: ${t*10}px 20px;`
			,
		}
	}
</script>

{#if message}
	<div class="error-bubble" class:top in:bubble out:bubble>
		<img src={icon} alt="">
		<p>{message}</p>
	</div>
{/if}

<style>
	.error-bubble {
		position: relative;
		padding: 10px 20px;
		border-radius: 20px;
		margin: 10px 0px;
		/* margin-bottom: 10px; */
		/* margin-top: -2em; */
		box-sizing: border-box;
		color: white;
		overflow: hidden;
		text-align: center;
	}
	.error-bubble.top {
		margin-bottom: 10px;
		margin-top: -2em;
	}
	.error-bubble::before {
		z-index: -1;
		content: '';
		display: block;
		position: absolute;
		inset: 0;
		border-radius: 20px;
		background: radial-gradient(226.81% 100% at 50% 0%, #FF4A4A 0%, #FF3A3A 10.23%, #D01818 45.5%, #FF2929 100%);
		mix-blend-mode: hard-light;
		backdrop-filter: blur(3px);
		box-shadow: 0px 0px 0px 2px rgba(180, 0, 0, 0.75) inset;
	}
	img {
		position: absolute;
		height: 125px;
		top: calc(-25px + var(--haha-funny-down, 0px));
		left: -0px;
		opacity: 0.08;
		/* filter: brightness(0); */
	}
	p {
		position: relative;
		z-index: 2;
	}
</style>