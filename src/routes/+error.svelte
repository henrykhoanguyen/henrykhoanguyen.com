<script lang="ts">
	import { page } from '$app/state';
	import NotFound from '$lib/components/NotFound.svelte';

	/*
		Shown when a navigation fails after the app has booted. The prerendered
		/404 route covers the other case — a URL the host never had a file for.

		A 404 gets the not-found screen verbatim, so both routes into it look
		identical. Anything else is a real fault and says so, because "no such
		file or directory" would be a lie about a 500.
	*/
</script>

<svelte:head>
	<title>{page.status} — not found</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if page.status === 404}
	<NotFound />
{:else}
	<section class="py-6">
		<p class="text-sm text-phosphor">
			<span aria-hidden="true">$&nbsp;</span>cd {page.url.pathname}
		</p>
		<p class="mt-2 text-sm text-phosphor-dim">
			zsh: {page.status}: {page.error?.message ?? 'something went wrong'}
		</p>
	</section>
{/if}
