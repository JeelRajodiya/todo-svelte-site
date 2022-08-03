<script>
	import SvelteIcon from '$lib/assets/SvelteIcon.svelte';
	import WindowsLogo from '$lib/assets/Windows.svelte';
	import AndroidLogo from '$lib/assets/Android.svelte';
</script>

<main class="flex justify-center align-middle flex-col ">
	<h1 class="my-10">
		To Do app made with
		<svelte:component this={SvelteIcon} data-tip="svelte" />
	</h1>
	<div class="card bg-neutral w-full m-5 p-10 max-w-xl">
		<h2 class="card-title justify-center p-5">
			<svelte:component this={AndroidLogo} />
			Download for Android
		</h2>

		<button class=" btn btn-primary card-action"> Download .apk </button>
	</div>

	<div class="card bg-neutral m-5 w-full p-10 max-w-xl">
		<h2 class="card-title justify-center p-5">
			<svelte:component this={WindowsLogo} />
			Download for Windows <b>64bit</b>
		</h2>

		<button class=" btn btn-primary card-action"> Download .exe installer </button>
	</div>

	<div class="card bg-neutral m-5 w-full p-10 max-w-xl">
		<h2 class="card-title justify-center p-5">
			<svelte:component this={WindowsLogo} />
			Download for Windows <b>32bit</b>
		</h2>

		<button class=" btn btn-primary card-action"> Download .exe installer </button>
	</div>
</main>

<style>
	main {
		margin: 15px 0;
		align-items: center;
		height: 100%;
	}
	h1 {
		font-size: 2rem;
	}
</style>
