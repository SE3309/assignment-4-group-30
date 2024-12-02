<script lang="ts">
	let { id, percentage, inset, gap }: {
		id: string,
		percentage: number, 
		inset: number,
		gap: number
	} = $props()

	function bound(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max)
	}

	let effectivePercentage = $derived(bound(percentage, 0.001, 0.999))

	let d = $derived(effectivePercentage*2*Math.PI + Math.PI/2)
	let o = $derived({x: Math.cos(d)*99, y: Math.sin(d)*99})
	let i = $derived({x: Math.cos(d)*(99-inset), y: Math.sin(d)*(99-inset)})

	let distanceToEdge = $derived(Math.min(effectivePercentage, 1-effectivePercentage))
	let maxSeparatorWidth = $derived(distanceToEdge * Math.max(gap, 100))
	let separatorWidth = $derived(Math.min(gap, maxSeparatorWidth))
	let tangent = $derived({x: (-Math.sin(d))*separatorWidth, y: Math.cos(d)*separatorWidth})

	function normalizedToRadius(p: {x: number, y: number}, r: number) {
		const length = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2))
		return {
			x: p.x / length * r,
			y: p.y / length * r
		}
	}

	let outerForward = $derived(normalizedToRadius({x: o.x + tangent.x, y: o.y + tangent.y}, 99))
	let innerForward = $derived(normalizedToRadius({x: i.x + tangent.x, y: i.y + tangent.y}, 99-inset))
	let outerBackward = $derived(normalizedToRadius({x: o.x - tangent.x, y: o.y - tangent.y}, 99))
	let innerBackward = $derived(normalizedToRadius({x: i.x - tangent.x, y: i.y - tangent.y}, 99-inset))
	
</script>

<svg viewBox="-100 -100 200 200" >
	<defs>

		<path d="
			M 0 -99
			A 99 99 0 {outerForward.x < 0 ? 1 : 0} 1 {outerForward.x} {-outerForward.y}
			L {innerForward.x} {-innerForward.y}
			A {99-inset} {99-inset} 0 {innerForward.x < 0 ? 1 : 0} 0 0 {-(99-inset)}
			Z
		" id="right-{id}"></path>
		<path d="
			M 0 -99
			A 99 99 0 {outerBackward.x < 0 ? 0 : 1} 0 {outerBackward.x} {-outerBackward.y}
			L {innerBackward.x} {-innerBackward.y}
			A {99-inset} {99-inset} 0 {innerBackward.x < 0 ? 0 : 1} 1 0 {-(99-inset)}
			Z
		" id="left-{id}"></path>
		
		<clipPath id="rightClip-{id}">
			<use xlink:href="#right-{id}" />
		</clipPath>
		<clipPath id="leftClip-{id}">
			<use xlink:href="#left-{id}" />
		</clipPath>

		<use xlink:href="#right-{id}" id="rightStroke-{id}" class="pie-chart-right-stroke" clip-path="url(#rightClip-{id})" stroke="white" fill="transparent" />
		<use xlink:href="#left-{id}" id="leftStroke-{id}" class="pie-chart-left-stroke" clip-path="url(#leftClip-{id})" stroke="white" fill="transparent" />

		<mask id="rightStrokeClip-{id}">
			<use xlink:href="#rightStroke-{id}" />
		</mask>
		<mask id="leftStrokeClip-{id}">
			<use xlink:href="#leftStroke-{id}" />
		</mask>
	</defs>
	
	<rect x="-100" y="-100" width="200" height="200" clip-path="url(#rightClip-{id})" class="pie-chart-right-fill" />
	<rect x="-100" y="-100" width="200" height="200" clip-path="url(#leftClip-{id})" class="pie-chart-left-fill" />

	<rect x="-100" y="-100" width="200" height="200" mask="url(#rightStrokeClip-{id})" class="pie-chart-right-stroke-fill" />
	<rect x="-100" y="-100" width="200" height="200" mask="url(#leftStrokeClip-{id})" class="pie-chart-left-stroke-fill" />
</svg>