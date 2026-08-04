<script lang="ts">
	import { filterItems, isAction, moveSelection, withGroupHeadings } from './palette.js';
	import { EXIT_KEYWORDS } from './logout.js';
	import { session } from './exit-state.svelte.js';
	import { palette } from './palette-state.svelte.js';
	import type { PaletteItem } from './palette.js';

	/**
	 * Jump-to-anything palette, opened with ⌘K or Ctrl+K.
	 *
	 * Built on the native <dialog> element rather than a component library.
	 * `showModal()` gives focus trapping, Escape-to-close, inertness of the page
	 * behind, and a ::backdrop for free — which is precisely the set of details
	 * that hand-rolled modals get wrong. What remains is a text input and a list,
	 * and those are worth owning here so the palette can look like a terminal
	 * rather than like a restyled component.
	 */
	let { items }: { items: PaletteItem[] } = $props();

	/*
		Links come from the server load; the exit entry is added here because a
		function cannot be serialised across that boundary. It is appended last so
		it always closes the list, and carries the words someone would actually
		reach for — `quit`, `:q!` — rather than only its own label.
	*/
	const all = $derived<PaletteItem[]>([
		...items,
		{
			label: 'exit',
			group: 'session',
			keywords: EXIT_KEYWORDS,
			run: () => session.exit()
		}
	]);

	let dialog = $state<HTMLDialogElement>();
	let query = $state('');
	let selected = $state(0);

	/*
		Results that navigate are real anchors, and Enter clicks the selected one
		rather than calling goto(). Three things fall out of that: entries pointing
		at an external repo work without special-casing, middle-click and
		open-in-new-tab behave as expected, and SvelteKit still upgrades internal
		links to client-side navigation on its own. Actions are buttons, and Enter
		clicks those the same way.
	*/
	let entries: HTMLElement[] = $state([]);

	const results = $derived(filterItems(all, query));
	const grouped = $derived(withGroupHeadings(results));

	// Selection can outrun a shrinking result list as the query narrows.
	$effect(() => {
		if (selected >= results.length) selected = 0;
	});

	/*
		The shared state expresses intent; <dialog> is what is actually on screen.
		This effect drives the element from the state, and the element's own
		`close` event drives the state back — which is what keeps native Escape
		and backdrop dismissal from leaving the two out of step.
	*/
	$effect(() => {
		if (!dialog) return;
		if (palette.isOpen && !dialog.open) {
			query = '';
			selected = 0;
			dialog.showModal();
		} else if (!palette.isOpen && dialog.open) {
			dialog.close();
		}
	});

	function choose() {
		entries[selected]?.click();
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			palette.toggle();
		}
	}

	function onDialogKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selected = moveSelection(selected, 1, results.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selected = moveSelection(selected, -1, results.length);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			choose();
		}
		// Escape is handled by <dialog> itself.
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<!--
	Clicking the backdrop closes. The handler sits on the dialog and checks that
	the click landed on the dialog element itself rather than its contents, which
	is how a ::backdrop click surfaces in the DOM.
-->
<dialog
	bind:this={dialog}
	class="palette m-0 w-[min(34rem,calc(100vw-2rem))] rounded-sm border border-phosphor-rule bg-popover p-0 text-phosphor-text backdrop:bg-black/70"
	aria-label="Jump to"
	onkeydown={onDialogKeydown}
	onclose={() => palette.close()}
	onclick={(event) => {
		if (event.target === dialog) palette.close();
	}}
>
	<div class="flex items-baseline gap-2 border-b border-phosphor-rule px-3 py-2">
		<span class="text-xs text-phosphor" aria-hidden="true">$</span>
		<!--
			No autofocus attribute needed: showModal() moves focus to the first
			focusable element, which is this input.
		-->
		<input
			bind:value={query}
			type="text"
			placeholder="jump to..."
			aria-label="Search pages and projects"
			aria-controls="palette-results"
			class="w-full border-0 bg-transparent p-0 text-sm text-phosphor-text outline-none placeholder:text-phosphor-dim"
		/>
	</div>

	<ul
		id="palette-results"
		class="m-0 max-h-[min(18rem,calc(100dvh-14rem))] list-none overflow-y-auto p-1 text-sm"
	>
		{#each grouped as { item, heading }, i (item.label + item.group)}
			{#if heading}
				<li class="px-2 pt-2 pb-1 text-xs text-phosphor-dim" aria-hidden="true">{heading}</li>
			{/if}
			<li>
				{#snippet row()}
					<span class="shrink-0 text-xs text-phosphor-dim" aria-hidden="true">
						{i === selected ? '>' : ' '}
					</span>
					<span class="min-w-0 truncate">{item.label}</span>
				{/snippet}

				{#if isAction(item)}
					<button
						bind:this={entries[i]}
						type="button"
						class="flex w-full items-baseline gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-secondary"
						class:bg-secondary={i === selected}
						class:text-phosphor={i === selected}
						onmouseenter={() => (selected = i)}
						onclick={() => {
							palette.close();
							item.run();
						}}
					>
						{@render row()}
					</button>
				{:else}
					<a
						bind:this={entries[i]}
						href={item.href}
						class="flex w-full items-baseline gap-2 rounded-sm px-2 py-1.5 text-left no-underline hover:bg-secondary hover:no-underline"
						class:bg-secondary={i === selected}
						class:text-phosphor={i === selected}
						target={/^https?:\/\//.test(item.href) ? '_blank' : undefined}
						rel={/^https?:\/\//.test(item.href) ? 'noopener noreferrer' : undefined}
						onmouseenter={() => (selected = i)}
						onclick={() => palette.close()}
					>
						{@render row()}
					</a>
				{/if}
			</li>
		{/each}

		{#if results.length === 0}
			<li class="px-3 py-3 text-xs text-phosphor-dim">
				zsh: no matches found: {query}
			</li>
		{/if}
	</ul>
</dialog>

<style>
	/*
		Anchored from the top, not centred.

		Vertical centring recomputes as the result list grows and shrinks, which
		drags the input up and down while you are typing into it — narrow a query
		to nothing and the whole dialog slides down to re-centre itself. Pinning
		the top edge keeps the input at a fixed point on screen and lets only the
		bottom edge move, so your eyes never have to follow the box.

		This is why every palette worth using — Spotlight, Raycast, VS Code —
		sits high rather than centred.
	*/
	.palette {
		top: clamp(3rem, 15vh, 9rem);
		left: 50%;
		translate: -50% 0;
		max-height: none;
	}

	.palette::backdrop {
		backdrop-filter: blur(1px);
	}
</style>
