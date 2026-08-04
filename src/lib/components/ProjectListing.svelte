<script lang="ts">
	import PromptHeading from './PromptHeading.svelte';
	import QuietLink from './QuietLink.svelte';
	import DirectoryList from './DirectoryList.svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { tagSlug } from '$lib/content/transform.js';
	import { projectRow } from '$lib/content/rows.js';
	import { isDeadSpaceClick } from './outside-click.js';
	import type { Project } from '$lib/content/schema.js';

	/**
	 * The `/projects` listing, shared by the unfiltered page and each tag page.
	 *
	 * Filtering is done with real prerendered routes rather than query strings
	 * or client state. Query strings cannot be prerendered, and client-only
	 * state would not survive a reload or work without JavaScript. These are
	 * plain links to plain pages, which SvelteKit upgrades to client-side
	 * navigation on its own.
	 */
	let {
		groups,
		tags,
		activeTag = null
	}: {
		groups: { year: string; items: Project[] }[];
		tags: string[];
		activeTag?: string | null;
	} = $props();

	const tagHref = (tag: string | null) =>
		tag === null ? resolve('/projects') : resolve('/projects/tag/[tag]', { tag: tagSlug(tag) });

	/*
		Clicking dead space clears the filter.

		A filter with no obvious way out is a trap, and the usual escape — a small
		×, or hunting for "all" among sixteen tags — is fussier than the gesture
		people already reach for. This only fires while a filter is active, and
		only when the click landed on nothing interactive, so it never steals a
		click from a link or a button.
	*/
	function onDocumentClick(event: MouseEvent) {
		if (activeTag && isDeadSpaceClick(event)) {
			goto(resolve('/projects'), { noScroll: true, keepFocus: true });
		}
	}

	/*
		Non-matching rows are dimmed rather than removed. Removing them would
		collapse year groups and make the page jump on every filter change;
		dimming keeps the gutter stable so the eye stays where it was.
	*/
	const rendered = $derived(
		groups.map((group) => ({
			year: group.year,
			rows: group.items.map((p, i) =>
				projectRow(p, { gutter: i === 0 ? group.year : '', activeSkill: activeTag })
			)
		}))
	);

	const total = $derived(groups.reduce((n, g) => n + g.items.length, 0));
	const shown = $derived(rendered.reduce((n, g) => n + g.rows.filter((r) => !r.dimmed).length, 0));
</script>

<svelte:document onclick={onDocumentClick} />

<!-- `cd ~` rather than `cd ./`: the prompt already calls home `~`, and `./` is where you already are. -->
<QuietLink href={resolve('/')} margin="mb-4">← cd ~</QuietLink>
<PromptHeading command="ls ./projects" />

<nav
	class="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs"
	aria-label="Filter by stack"
>
	<span class="text-phosphor" aria-hidden="true">$ filter --stack</span>
	<a
		href={tagHref(null)}
		aria-current={activeTag === null ? 'true' : undefined}
		class="text-phosphor-dim no-underline hover:text-phosphor aria-[current]:text-phosphor"
	>
		all
	</a>
	{#each tags as tag (tag)}
		<a
			href={tagHref(tag)}
			aria-current={activeTag === tag ? 'true' : undefined}
			class="text-phosphor-dim no-underline hover:text-phosphor aria-[current]:text-phosphor"
		>
			{tag.toLowerCase()}
		</a>
	{/each}
</nav>

<!-- The only cue for a dimmed row is opacity, which a screen reader cannot see. -->
<p class="sr-only" aria-live="polite">
	{#if activeTag}
		{shown} of {total} projects use {activeTag}
	{:else}
		Showing all {total} projects
	{/if}
</p>

{#each rendered as group (group.year)}
	<DirectoryList items={group.rows} ariaLabel="Projects from {group.year}" />
{/each}
