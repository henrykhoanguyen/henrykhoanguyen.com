<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The "there is more this way" link that closes a listing.
	 *
	 * Three of these exist — see all projects, see full history, full history on
	 * LinkedIn — and they were drifting: the two internal ones were styled at the
	 * call site while the external one fell through to the global anchor rule and
	 * came out brighter than the rest.
	 *
	 * Dim rather than accent-green on purpose. These are exits, not the point of
	 * the page; they should be findable when looked for and quiet when not.
	 */
	let {
		href,
		margin = 'mt-3',
		children
	}: {
		href: string;
		/** Spacing above. Longer listings want more room than a short one. */
		margin?: string;
		children: Snippet;
	} = $props();

	const isExternal = $derived(/^https?:\/\//.test(href));
</script>

<p class="{margin} text-xs">
	<a
		{href}
		class="text-phosphor-dim no-underline hover:text-phosphor hover:underline"
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
	>
		{@render children()}
	</a>
</p>
