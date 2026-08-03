<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	// In character, but still useful: it says what went wrong and where to go.
	const command = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>{page.status} — not found</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="py-6">
	<p class="text-sm text-phosphor-text">
		<span class="text-phosphor" aria-hidden="true">$ </span>cd {command}
	</p>
	<p class="mt-2 text-sm text-phosphor-dim">
		{#if page.status === 404}
			zsh: no such file or directory: {command}
		{:else}
			zsh: {page.status}: {page.error?.message ?? 'something went wrong'}
		{/if}
	</p>

	<p class="mt-8 text-xs text-phosphor-dim">try one of these:</p>
	<ul class="mt-1.5 list-none space-y-1 p-0 text-xs">
		<li><a href={resolve('/')}>cd ~</a></li>
		<li><a href={resolve('/projects')}>ls ./projects</a></li>
		<li><a href={resolve('/about')}>cat ./about.md</a></li>
	</ul>
</section>
