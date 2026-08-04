<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import LoginBanner from '$lib/components/LoginBanner.svelte';
	import { boot } from '$lib/components/boot-state.svelte.js';
	import LogoutScreen from '$lib/components/LogoutScreen.svelte';
	import { session } from '$lib/components/exit-state.svelte.js';
	import { page } from '$app/state';
	import { absolute } from '$lib/site.js';

	let { children, data } = $props();

	/*
		Pages set their own title and description; these are the site-wide facts
		that would otherwise be repeated in every <svelte:head>.

		Canonical is emitted once, here. A route that should point elsewhere —
		the stack filter pages, which are all views of /projects — returns a
		`canonical` path from its load rather than adding a second tag of its own.
	*/
	const canonical = $derived(absolute(page.data.canonical ?? page.url.pathname));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="canonical" href={canonical} />
	<meta property="og:site_name" content={data.name} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
	<meta name="author" content={data.name} />
</svelte:head>

<!--
	Keyboard users land here first. Hidden until focused, then pinned top-left so
	it is actually visible at the moment it matters.
-->
{#if session.exited}
	<!--
		Everything is gone on purpose: nav, banner, footer, palette. A logout screen
		that still had chrome around it would not read as a closed session.
	-->
	<LogoutScreen />
{:else}
	<a
		href="#main"
		class="sr-only rounded-sm bg-phosphor px-3 py-2 text-xs text-phosphor-bg focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
	>
		Skip to content
	</a>

	<div class="mx-auto min-h-dvh max-w-2xl px-5 py-10 sm:px-8">
		<!--
		The session banner precedes the prompt it belongs to, which is why it sits
		above the nav rather than inside the page. Only the home page animates, so
		only there does it carry the skip hint.
	-->
		<LoginBanner showSkipHint={boot.animating} />
		<SiteHeader />
		<main id="main">
			{@render children()}
		</main>
		<SiteFooter links={data.links} />
	</div>

	<CommandPalette items={data.palette} />
{/if}
