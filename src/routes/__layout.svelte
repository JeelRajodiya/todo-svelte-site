<script>
	import '../app.css';
	import DownloadIcon from '$lib/assets/icons8-download-24.png';
</script>

<svelte:head>
	<title>Svelte To Do</title>
</svelte:head>

<main>
	<div class="flex justify-center">
		<div class="navbar bg-neutral flex justify-center rounded-xl max-w-xl">
			<div>
				<a href="/" class="btn btn-ghost normal-case text-xl">Svelte To Do</a>
			</div>
		</div>
	</div>
	<slot />
</main>

<style global>
	body {
		padding: 15px;
		height: 100%;
	}
	html {
		height: 100%;
	}
</style>
