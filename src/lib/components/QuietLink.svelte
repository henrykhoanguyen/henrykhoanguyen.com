<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A quiet link on a line of its own — the site's exits and back-links.
	 *
	 * `see all projects →`, `← cd ~`, `full history on linkedin ↗`. They were
	 * drifting before this existed: internal ones styled at the call site, the
	 * external one falling through to the global anchor rule and coming out
	 * brighter than the rest.
	 *
	 * Dim rather than accent-green on purpose. These are ways out, not the point
	 * of the page; they should be findable when looked for and quiet when not.
	 * The arrow is content, so the same component serves both directions.
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
