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
</script>

<!--
	A real <ul>. The grid is presentation only — a screen reader still hears
	"list, N items", which is the point of using a listing layout at all.
-->
<ul class="m-0 list-none p-0" aria-label={ariaLabel}>
	{#each items as item (item.title)}
		{@const row =
			'grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-1.5 transition-opacity'}
		<li>
			{#if item.href}
				<a
					href={item.href}
					class="{row} group no-underline"
					class:opacity-30={item.dimmed}
					target={isExternal(item.href) ? '_blank' : undefined}
					rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
				>
					<span class="text-xs text-phosphor-dim tabular-nums">{item.gutter ?? ''}</span>
					<span class="min-w-0">
						<span class="text-phosphor-text group-hover:text-phosphor group-hover:underline">
							{item.title}
						</span>
						{#if item.summary}
							<span class="block text-xs leading-relaxed text-phosphor-dim">{item.summary}</span>
						{/if}
					</span>
					<span class="text-xs whitespace-nowrap text-phosphor-dim">{item.meta ?? ''}</span>
				</a>
			{:else}
				<div class={row} class:opacity-30={item.dimmed}>
					<span class="text-xs text-phosphor-dim tabular-nums">{item.gutter ?? ''}</span>
					<span class="min-w-0">
						<span class="text-phosphor-text">{item.title}</span>
						{#if item.summary}
							<span class="block text-xs leading-relaxed text-phosphor-dim">{item.summary}</span>
						{/if}
					</span>
					<span class="text-xs whitespace-nowrap text-phosphor-dim">{item.meta ?? ''}</span>
				</div>
			{/if}
		</li>
	{/each}
</ul>
