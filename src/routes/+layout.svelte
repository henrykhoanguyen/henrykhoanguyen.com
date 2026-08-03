<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';

	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!--
	Keyboard users land here first. Hidden until focused, then pinned top-left so
	it is actually visible at the moment it matters.
-->
<a
	href="#main"
	class="sr-only rounded-sm bg-phosphor px-3 py-2 text-xs text-phosphor-bg focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
>
	Skip to content
</a>

<div class="mx-auto min-h-dvh max-w-2xl px-5 py-10 sm:px-8">
	<SiteHeader />
	<main id="main">
		{@render children()}
	</main>
	<SiteFooter links={data.links} />
</div>

<CommandPalette items={data.palette} />
