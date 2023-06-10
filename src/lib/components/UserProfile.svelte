<script lang="ts">
	import { userStore } from '$lib/stores';
	import { auth } from '$lib/db/setup';
	import { getAuth, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

	let modalOpen = false;

	let user = userStore(auth);

	$: console.log('current user: ', user);

	const signIn = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				// const credential = GoogleAuthProvider.credentialFromResult(result);
				// const token = credential.accessToken;
				// The signed-in user info.
				const user = result.user;
				console.log('signed in: ', user);
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.customData.email;

				console.log('Error: ', errorCode, errorMessage, email);
			});
	};

	const signOutFunc = () => {
		signOut(auth)
			.then(() => {
				console.log('Signed out');
			})
			.catch((error) => {
				console.log('Error when signing out', error);
			});
	};
</script>

<div class="container">
	<button on:click={() => (modalOpen = !modalOpen)}>
		{#if $user}
			<img src={$user.photoURL} alt="" />
		{:else}
			<span class="material-icons-outlined"> person </span>
		{/if}
	</button>

	{#if modalOpen}
		<div class="modal">
			{#if $user}
				<button class="signoutBtn" on:click={signOutFunc}>
					Sign out
					<span>{$user.email}</span>
				</button>
			{:else}
				<h2>Get Started</h2>
				<button class="googleSigninBtn" on:click={signIn}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"
						><path
							fill="#fbc02d"
							d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
						/><path
							fill="#e53935"
							d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
						/><path
							fill="#4caf50"
							d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
						/><path
							fill="#1565c0"
							d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
						/></svg
					>
					Sign in with Google</button
				>
			{/if}
		</div>
	{/if}
</div>

<style>
	.container {
		position: fixed;
		top: 0.5rem;
		right: 1rem;

		border: 1px solid white;

		z-index: 100;

		border-radius: 50%;

		display: flex;
		align-items: center;
		justify-content: center;

		width: 36px;
		height: 36px;
	}

	.container > button {
		background: none;
		outline: none;
		border: none;
		display: flex;

		padding: 0;

		justify-content: center;

		width: 32px;
		height: 32px;
	}

	img {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
	}

	span {
		font-size: 2rem;
	}

	.modal {
		position: absolute;
		top: calc(100% + 1rem);
		right: 0;

		padding: 1rem;

		box-shadow: #ddd 0px 1px 4px;
		border: 1px solid #ddd;
		background: white;
		border-radius: 0.5rem;

		display: flex;
		flex-direction: column;
	}

	.modal h2 {
		text-align: center;
	}

	.modal button {
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: 1px solid #ddd;
	}

	.modal button:hover {
		border-color: #ccc;
	}

	.signoutBtn {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 0.5rem;
		white-space: nowrap;
		background: none;
		font-size: 1rem;

		border-color: transparent !important;
	}

	.signoutBtn span {
		font-size: 12px;
		color: grey;
	}

	.googleSigninBtn {
		border-radius: 2rem;
		background: none;
		outline: none;

		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;

		margin-bottom: 1rem;

		font-size: 13px;
		white-space: nowrap;
	}

	.googleSigninBtn svg {
		width: 32px;
		height: 32px;
	}
</style>
