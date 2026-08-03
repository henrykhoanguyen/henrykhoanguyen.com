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

	let line = $state<string | null>(null);

	onMount(() => {
		const previous = readAndRecordVisit();
		line = previous
			? `Last login: ${formatLoginTime(previous)} on ttys001`
			: `Welcome. First login: ${formatLoginTime(new Date())} on ttys001`;
	});
</script>

{#if line}
	<p class="mb-6 text-xs text-phosphor-dim">
		{line}{#if showSkipHint}<span class="text-phosphor-dim"> — press any key to </span><span
				class="text-phosphor">skip</span
			>{/if}
	</p>
{/if}
