<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A note to the reader, styled as a shell comment.
	 *
	 * Hints have to be distinguishable from the content around them at a glance,
	 * and on this site nearly everything is already dim mono text. The `#` prefix
	 * does that work: in a terminal it means "this line is not a command and not
	 * output", which is exactly what a hint is. Italic separates it from the
	 * metadata that shares its colour.
	 *
	 * Deliberately quiet. A hint that competes with the thing it describes has
	 * failed at being a hint.
	 */
	let {
		margin = 'mb-2',
		children
	}: {
		margin?: string;
		children: Snippet;
	} = $props();
</script>

<p class="{margin} text-xs text-phosphor-dim italic">
	<!--
		Decorative, like the `$` prompts. A screen reader should hear the hint, not
		"hash". Non-breaking so the space survives rendering.
	-->
	<span class="not-italic" aria-hidden="true">#&nbsp;</span>{@render children()}
</p>
