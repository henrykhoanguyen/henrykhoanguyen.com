<script lang="ts">
	import { onMount } from 'svelte';
	import TypedText from './TypedText.svelte';
	import { LOGOUT_COMMAND, LOGOUT_LINES } from './logout.js';
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

	/*
		Step 0 types the command; steps 1..n type the output lines; one past the
		end means finished. A single counter rather than a flag per line keeps
		"skip to the end" to one assignment.
	*/
	const TOTAL = 1 + LOGOUT_LINES.length;

	let step = $state(0);

	const finished = $derived(step >= TOTAL);

	const phaseOf = (index: number) =>
		step === index ? 'typing' : step > index ? 'done' : 'pending';

	function next() {
		// A beat between lines, as though each step took a moment.
		setTimeout(() => (step += 1), 90);
	}

	const skip = () => (step = TOTAL);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			skip();
			return;
		}

		// The same escape the home page offers, for the same reason: nobody should
		// be held by an animation they have already seen.
		window.addEventListener('keydown', skip, { once: true });
		window.addEventListener('pointerdown', skip, { once: true });
		window.addEventListener('wheel', skip, { once: true, passive: true });

		return () => {
			window.removeEventListener('keydown', skip);
			window.removeEventListener('pointerdown', skip);
			window.removeEventListener('wheel', skip);
		};
	});
</script>

<div class="mx-auto min-h-dvh max-w-2xl px-5 py-10 text-xs sm:px-8">
	<!--
		The whole command line is the accent colour, as every other prompt on the
		site is. The `$` is printed by the shell rather than typed, so it appears
		whole — and non-breaking, since a trailing space inside a span is collapsed
		away in rendering.
	-->
	<p class="text-phosphor">
		<span aria-hidden="true">$&nbsp;</span><TypedText
			text={LOGOUT_COMMAND}
			phase={phaseOf(0)}
			caret={step === 0}
			onfinish={next}
		/>
	</p>

	{#each LOGOUT_LINES as line, i (line)}
		{#if step >= i + 1}
			<p class="text-phosphor-text">
				<TypedText text={line} phase={phaseOf(i + 1)} caret={step === i + 1} onfinish={next} />
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
