<script lang="ts">
    import bezier from "bezier-easing";
    import type { Snippet } from "svelte";


	const {alignment, children, position, rotation, blur = 1, delay = 0}: {
		alignment: "center",
		children: Snippet,
		position: {x:number, y:number, z:number},
		rotation: {x:number, y:number, z:number},
		blur?: number,
		delay?: number
	} = $props()

	function flipIn(element: HTMLElement, {delay}: {delay: number}) {
		return {
			delay,
			duration: 1000,
			easing: bezier(.32,0,.15,1),
			css: (t: number, u: number) => {
				const flipAmount = 180 - t * 3 * 180
				const flippedForward = (flipAmount < 0)
				return `transform: translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)
				rotateY(${rotation.y - flipAmount}deg);
				backface-visibility: ${flippedForward? "visible" : "hidden"};
				filter: blur(${-position.z / 15 * blur}px);`
			}
		}
	}

	function flipOut(element: HTMLElement, {delay}: {delay: number}) {
		return {
			delay,
			duration: 300,
			easing: bezier(.32,0,.15,1),
			css: (t: number, u: number) => {
				const flipAmount = 180 - t * 1 * 180
				const flippedForward = (flipAmount < 0)
				return `transform: translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)
				rotateY(${rotation.y + flipAmount}deg);
				backface-visibility: ${flippedForward? "visible" : "hidden"};
				filter: blur(${-position.z / 15 * blur}px);`
			}
		}
	} 

</script>

<div class="figment"
	class:center={alignment==="center"}
	>
	<div style="transform: translate3d({position.x}px, {position.y}px, {position.z}px) rotateX({rotation.x}deg) rotateZ({rotation.z}deg) rotateY({rotation.y}deg); filter: blur({-position.z / 15 * blur}px);"
		in:flipIn={{delay: delay}} out:flipOut={{delay: 0}}
		>
		{@render children()}
	</div>
</div>

<style>
	.center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>