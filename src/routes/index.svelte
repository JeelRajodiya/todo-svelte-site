<script>
    import SvelteIcon from "$lib/assets/SvelteIcon.svelte";
    
</script>

<main class="flex justify-center align-middle flex-col">
    
    <h1 class="my-10">
        To Do app made with 
        <svelte:component this={SvelteIcon} />
    </h1>
<a href="/download">
<button class=" btn btn-primary">
    Download
</button>
</a>
</main>

<style>
    main{
        margin:15px 0 ;
        align-items: center;
        height: 100%;
    }
    h1{
        font-size: 2rem;
    }
</style>
