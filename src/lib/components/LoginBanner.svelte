<script lang="ts">
	import { onMount } from 'svelte';
	import { formatLoginTime, readAndRecordVisit } from './login-banner.js';

	/**
	 * The line a terminal prints before its first prompt.
	 *
	 * This exists to carry the skip hint without breaking the illusion. A note
	 * floating above the prompt reads as a web overlay pasted onto a terminal; a
	 * login banner reads as the terminal itself, because that is exactly what a
	 * terminal prints at the start of a session.
	 *
	 * It reports a real previous visit rather than dressing the current time up as
	 * one, so the line is true as well as in character. Client-only, since the
	 * timestamp is per-visitor and a build-time date baked into static HTML would
	 * be stale for everyone.
	 */
	let { showSkipHint = false }: { showSkipHint?: boolean } = $props();

	let banner = $state<string | null>(null);

	/*
		Assembled as one string rather than spans.

		The hint used to be a separate <span> so `skip` could be brightened, and
		its leading space was collapsed away in rendering — the same trap the `$`
		prompts hit. One text node has no boundaries to lose a space at, and the
		whole line is output anyway, so nothing in it wants a different colour.
	*/
	const line = $derived(
		banner === null ? null : showSkipHint ? `${banner} — press any key to skip` : banner
	);

	onMount(() => {
		const previous = readAndRecordVisit();
		banner = previous
			? `Last login: ${formatLoginTime(previous)} on console`
			: `Welcome. First login: ${formatLoginTime(new Date())} on console`;
	});
</script>

{#if line}
	<!--
		mb-1, not a section gap. A terminal prints its banner and then the prompt on
		the very next line; anything larger reads as a separate block of page rather
		than the line immediately before the prompt.
	-->
	<p class="mb-1 text-xs text-phosphor-dim">{line}</p>
{/if}
