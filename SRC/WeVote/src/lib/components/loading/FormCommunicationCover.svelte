<script lang="ts" module>
	export class FormState {
		busy = $state(false)

		use() {
			return ()=>{
				this.busy = true
				return async({result, update}) => {
					this.busy = false
					update()
				}
			}
		}
	}
</script>
<script lang="ts">
    import bezier from "bezier-easing";

	const { formState }: {
		formState: FormState
	} = $props()

	function fade(element: HTMLElement) {
		return {
			duration: 300,
			easing: bezier(0,1,1,1),
			css: (t: number, u: number) => `
			backdrop-filter: blur(${t*3}px);
			color: hsla(180, 9%, 21%, ${t*0.832});
			`,
			tick: (t: number, u: number) => {
				element.style.setProperty("--t", t)
			}
		}
	}


	const letters = "Communicating...".split("")
</script>

{#if formState.busy}
	<div class="cover" transition:fade>
		<p class="animated-text">{#each letters as letter, i}
			<span style="animation-delay: -{(letters.length-i)*0.03}s;">{letter}</span>
		{/each}</p>
	</div>
{/if}

<style>
	.cover {
		position: absolute;
		--t: 1;
		background: repeating-linear-gradient(-45deg, 
			hsla(180, 8%, 20%, calc(var(--t) * 0.223)) 0px,
			hsla(180, 8%, 20%, calc(var(--t) * 0.223)) 100px,
			hsla(180, 8%, 0%, calc(var(--t) * 0.25)) 110px,
			hsla(180, 8%, 0%, calc(var(--t) * 0.25)) 210px,
			hsla(180, 8%, 20%, calc(var(--t) * 0.223)) 220px
		);
		backdrop-filter: blur(3px);
		inset: 0;
		border-radius: 8px;
		background-size: 200% 100%;
		background-position: calc((var(--slide) * -310px)) center;
		animation: slide infinite 2s linear reverse;

		display: flex;
		justify-content: center;
		align-items: center;

		color: hsla(180, 9%, 21%, 0.832);
	}
	@property --slide {
		syntax: "<number>";
		inherits: true;
		initial-value: 0;
	}
	@keyframes slide {
		from {
			--slide: 0;
		}
		to {
			--slide: 1;
		}
	}

	.animated-text {
		margin: 0px;
		font-size: 1.2em;
	}
	.animated-text > span {
		display: inline-block;
		--wiggle-amount: 3px;
		animation: wiggle 1s linear infinite;
	}
	/* .animated-text > span:nth-child(2n) {
		animation-delay: -0.5s;
	} */
	@keyframes wiggle {
		0% {
			transform: translateY(var(--wiggle-amount));
		}
		10% {
			transform: translateY(var(--wiggle-amount));
		}
		20% {
			transform: translateY(var(--wiggle-amount));
		}
		30% {
			transform: translateY(calc(-0.5 * var(--wiggle-amount)));
		}
		40% {
			transform: translateY(calc(-0.9 * var(--wiggle-amount)));
		}
		50% {
			transform: translateY(calc(-1 * var(--wiggle-amount)));
		}
		60% {
			transform: translateY(calc(-1 * var(--wiggle-amount)));
		}
		70% {
			transform: translateY(calc(-0.5 * var(--wiggle-amount)));
		}
		80% {
			transform: translateY(var(--wiggle-amount));
		}
		90% {
			transform: translateY(calc(0.5 * var(--wiggle-amount)));
		}
		100% {
			transform: translateY(var(--wiggle-amount));
		}
	}
</style>
