<script lang="ts">
    import { enhance } from "$app/forms";
    import ErrorBubble from "$lib/components/info-bubbles/ErrorBubble.svelte";
    import FormCommunicationCover, { FormState } from "$lib/components/loading/FormCommunicationCover.svelte";
	import '$lib/css/form.css'

	const { data, form } = $props()
	const formState = new FormState()
</script>

<div class="generic-center outside-text-style">
	
	<ErrorBubble message={form?.errorMessage} top={true}/>
	
	{#if data.userInfo}
		<h1>Hello, {data.userInfo.displayName}</h1>
		<p>Bio:{data.userInfo.bio}</p>
	{:else}
		<h1>Welcome Back</h1>
	{/if}

	<div class="panel">
		<form use:enhance={formState.use()} method="post" class="styled-form">
			<fieldset disabled={formState.busy}>
				<label>
					Email
					<input required type="email" name="email" placeholder="you@uwo.ca">
				</label>
				<label>
					Password
					<input required type="password" name="password" placeholder="Hunter2">
				</label>
				<button type="submit">Sign In</button>
			</fieldset>
			
		</form>
		<FormCommunicationCover {formState}/>
	</div>

	<p>New here? <a href="/sign-up">Sign Up</a></p>
</div>