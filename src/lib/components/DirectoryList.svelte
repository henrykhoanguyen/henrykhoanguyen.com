<!--
	Rows carry hrefs from content data: an internal case study path or an
	external repo URL. Callers resolve internal paths before passing them in,
	and resolve() cannot take a value that may already be absolute.
-->
<script lang="ts">
	import type { DirectoryRow } from './directory.js';

	/**
	 * The listing that gives the site its shape: a flat three-column grid of
	 * gutter, title, and right-aligned metadata, with no cards and no row
	 * borders. Modelled on rauchg.com.
	 *
	 * Chosen over a card grid because it stays scannable at fifteen projects,
	 * where cards become a wall. It also degrades well — stripped of styling it
	 * is still a list of links.
	 *
	 * Deliberately dumb. It knows nothing about projects, dates, or grouping;
	 * callers compute the gutter and pass rows already ordered. That keeps it
	 * reusable for both projects and experience.
	 */
	let { items, ariaLabel }: { items: DirectoryRow[]; ariaLabel: string } = $props();

	const isExternal = (href?: string) => !!href && /^https?:\/\//.test(href);

	/*
		The gutter is wide enough for `May 2024`, not just a year, so the projects
		and experience listings share one column grid and align down the page. The
		trailing column is `auto`, so it collapses to nothing on rows that carry no
		metadata.
	*/
	const ROW =
		'grid grid-cols-[4.75rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-1.5 transition-opacity';
</script>

<!--
	The row interior, shared by the linked and unlinked branches so the two can
	never drift apart.
-->
{#snippet cells(item: DirectoryRow, interactive: boolean)}
	<span class="text-xs whitespace-nowrap text-phosphor-dim tabular-nums">{item.gutter ?? ''}</span>

	<span class="min-w-0">
		<span
			class="text-phosphor-text"
			class:group-hover:text-phosphor={interactive}
			class:group-hover:underline={interactive}
		>
			{item.title}
		</span>

		{#if item.summary}
			<span class="block text-xs leading-relaxed text-phosphor-dim">{item.summary}</span>
		{/if}

		{#if item.details?.length}
			<ul class="mt-1 mb-1 list-none space-y-1 p-0 text-xs leading-relaxed text-phosphor-dim">
				{#each item.details as detail (detail)}
					<li class="flex gap-2">
						<!-- The dash is a bullet, and the list already announces itself. -->
						<span class="shrink-0 text-phosphor" aria-hidden="true">-</span>
						<span>{detail}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</span>

	<span class="text-xs whitespace-nowrap text-phosphor-dim">{item.meta ?? ''}</span>
{/snippet}

<!--
	A real <ul>. The grid is presentation only — a screen reader still hears
	"list, N items", which is the point of using a listing layout at all.
-->
<ul class="m-0 list-none p-0" aria-label={ariaLabel}>
	{#each items as item (item.title)}
		<li>
			{#if item.href}
				<a
					href={item.href}
					class="{ROW} group no-underline"
					class:opacity-30={item.dimmed}
					target={isExternal(item.href) ? '_blank' : undefined}
					rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
				>
					{@render cells(item, true)}
				</a>
			{:else}
				<div class={ROW} class:opacity-30={item.dimmed}>
					{@render cells(item, false)}
				</div>
			{/if}
		</li>
	{/each}
</ul>
