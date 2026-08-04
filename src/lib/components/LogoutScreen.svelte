<script lang="ts">
	import { onMount } from 'svelte';
	import TypedText from './TypedText.svelte';
	import { LOGOUT_LINES } from './logout.js';
	import { session } from './exit-state.svelte.js';

	/**
	 * The screen a terminal leaves behind after you log out.
	 *
	 * Lines type one after another at the same pace as the home page, except for
	 * the ellipses — those run slower so each dot lands separately, which is what
	 * makes a progress line read as work happening rather than text appearing.
	 *
	 * Nothing else renders while this is up. The whole point is an empty terminal.
	 */
	let typedLines = $state(0);

	const finished = $derived(typedLines >= LOGOUT_LINES.length);

	function nextLine() {
		// A beat between lines, as though each step took a moment.
		setTimeout(() => (typedLines += 1), 90);
	}

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			typedLines = LOGOUT_LINES.length;
		}
	});
</script>

<div class="mx-auto min-h-dvh max-w-2xl px-5 py-10 text-xs sm:px-8">
	{#each LOGOUT_LINES as line, i (line)}
		{#if i <= typedLines}
			<p class="text-phosphor-text">
				<TypedText
					text={line}
					phase={i === typedLines ? 'typing' : 'done'}
					caret={i === typedLines}
					onfinish={nextLine}
				/>
			</p>
		{/if}
	{/each}

	{#if finished}
		<!--
			Styled as the ⌘K badge is: the border does the work the square brackets
			would, and it marks this as the one thing on screen you can act on.
		-->
		<button
			type="button"
			onclick={() => session.restore()}
			class="mt-6 rounded-sm border border-phosphor-rule px-1.5 py-0.5 text-[0.65rem] text-phosphor-dim hover:border-phosphor hover:text-phosphor"
		>
			click to restore
		</button>
	{/if}
</div>
