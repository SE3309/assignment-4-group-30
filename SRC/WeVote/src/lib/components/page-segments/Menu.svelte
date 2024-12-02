<script lang="ts">
    import type { UserInfo } from "$lib/server/database/Database";

	const { userInfo }: {
		userInfo: UserInfo | null
	} = $props()

	let pointsPadding = $derived(userInfo? "0".repeat(9 - userInfo.points.toString().length) : "")
</script>

<menu>
	<p><a href="/" style="color: inherit;">WeVote</a> Minimum Viable Product Beta</p>
	<div class="fill"></div>
	{#if userInfo}
		<p>
			<a href="/">polls</a>
			<span style="padding: 0px 10px;"></span>
			<a href="/leaderboard">leaderboard</a>
			<span style="padding: 0px 10px;"></span>
			<a href="/user/{userInfo.id}" style="color: inherit;">Hello, {userInfo.displayName}</a>
			<span style="padding: 0px 3px;"></span>
			<a class="points" href="/store">
				<span class="padding">{pointsPadding}</span><span class="real">{userInfo.points}</span><span class="suffix">pts</span>
			</a>
		</p>
	{:else}
		<p>
			<a href="/sign-up">sign up</a><span style="padding: 0px 10px;"> </span><a href="/sign-in">sign in</a> 
		</p>
	{/if}
</menu>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&family=Michroma&family=Playpen+Sans:wght@100..800&display=swap" rel="stylesheet">
</svelte:head>

<style>

	.fill {
		flex-grow: 1;
		min-width: 10px;
	}

	menu {
		background-color: white;
		display: flex;
		justify-content: end;
		align-items: center;
		margin: 0px;
		height: 3em;
		padding: 0px 10px;
	}
	p {
		margin: 0px;
	}
	.points {
		font-weight: bold;
		text-decoration-color: hsl(180, 100%, 30%);
	}
	.points .padding {
		/* opacity: 0.2; */
		/* color: hsl(180, 100%, 30%); */
		color: transparent;
		background: linear-gradient(hsl(180, 100%, 50%, 0.2), hsl(180, 100%, 24%, 0.2));
		background-clip: text;

		
	}
	.points .real {
		color: transparent;
		background: linear-gradient(hsl(180, 100%, 50%), hsl(180, 100%, 24%));
		background-clip: text;
	}
	.points .suffix {
		color: hsl(180, 100%, 30%);
	}
</style>