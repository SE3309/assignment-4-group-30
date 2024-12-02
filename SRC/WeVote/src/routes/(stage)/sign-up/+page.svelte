<script lang="ts">
    import { enhance } from "$app/forms";
    import ErrorBubble from "$lib/components/info-bubbles/ErrorBubble.svelte";
    import type { ActionData } from "./$types";
	import '$lib/css/form.css';
	import FormCommunicationCover, { FormState } from "$lib/components/loading/FormCommunicationCover.svelte";

	const { form }: {
		form: ActionData
	} = $props()
	const formState = new FormState()
</script>

<div class="generic-center outside-text-style">

	<ErrorBubble message={form?.errorMessage} top={true}/>

	<h1>Welcome Aboard</h1>

	<p>You'll need an <strong>@uwo.ca email address</strong> to sign up, for now.</p>

	<div class="panel">
		<form use:enhance={formState.use()} method="post" class="styled-form">
			<fieldset disabled={formState.busy}>
				<label>
					Display Name <span class="l">(what do we call you?)</span>
					<input required type="text" name="displayName" placeholder="John Apple">
				</label>
				<label>
					Email Address <span class="l">(you'll sign in with this)</span>
					<input required type="email" name="email" placeholder="you@uwo.ca">
				</label>
				<p class="up l">Emails are not displayed publicly.</p>
				<label>
					Password
					<input required type="password" name="password" placeholder="Don't be stupid, put something secure.">	
				</label>
				<p class="up l">Passwords are hashed and never stored.</p>
				<button type="submit">Create Account</button>
				{#if form?.success}
					<div>
						<p>Success!</p>
					</div>
				{/if}
			</fieldset>
			<FormCommunicationCover {formState}/>
		</form>
	</div>

	<p>Already have an account? <a href="/sign-in">Sign In</a></p>
</div>

<style>
	.l {
		font-style: italic;
		opacity: 0.8;
	}
	.up {
		margin: 0;
		margin-top: -7px;
	}
</style>