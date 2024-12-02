<script lang="ts">
	import { invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
	
	const { data } = $props()

	$effect(()=>{
		(async ()=>{
			await fetch("/sign-out", { method: "POST" })
			invalidateAll()
		})()
	})
</script>

<div class="generic-center outside-text-style">
	{#if data.userInfo}
		<h1>Just a moment...</h1>
		<p>You're being signed out. Yes, this genuinely takes a moment.</p>
	{:else}
		<h1>See you later</h1>
		<p>You've been signed out. If you'd like, you can <a href="/sign-in">sign in again</a></p>
	{/if}
</div>