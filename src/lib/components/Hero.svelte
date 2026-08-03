<script lang="ts">
	import TypedText from './TypedText.svelte';
	import type { Step } from './boot.js';
	import { reached, stateFor } from './boot.js';

	/**
	 * The hero, which arrives last.
	 *
	 * Unlike the listings — whose contents appear all at once when their command
	 * finishes — the name and tagline type themselves out, because they are what
	 * the visitor is here to read and deserve the beat.
	 *
	 * The complete name is always present in a visually-hidden span, so the
	 * prerendered HTML carries it for crawlers and a screen reader announces it
	 * once rather than following a mutating text node.
	 */
	let {
		name,
		tagline,
		step,
		onstep
	}: {
		name: string;
		tagline: string;
		step: Step;
		onstep: (next: Step) => void;
	} = $props();

	// The resting caret appears once the name is complete, which is the end of
	// the whole sequence.
	const nameDone = $derived(reached(step, 'done'));
</script>

<header class="mb-10">
	<p class="mb-1.5 text-xs text-phosphor" aria-hidden="true">
		<span>$ </span><TypedText
			text="whoami"
			phase={stateFor(step, 'whoamiCommand')}
			caret
			onfinish={() => onstep('tagline')}
		/>
	</p>

	<h1 class="text-xl font-medium text-phosphor-text">
		<span class="sr-only">{name}</span>
		<span aria-hidden="true">
			<TypedText
				text={name}
				phase={stateFor(step, 'name')}
				caret
				onfinish={() => onstep('done')}
			/>{#if nameDone}<span class="caret blinking">▋</span>{/if}
		</span>
	</h1>

	<p class="mt-2 max-w-[52ch] text-sm leading-relaxed text-phosphor-dim">
		<span class="sr-only">{tagline}</span>
		<span aria-hidden="true">
			<TypedText
				text={tagline}
				phase={stateFor(step, 'tagline')}
				caret
				onfinish={() => onstep('name')}
			/>
		</span>
	</p>
</header>

<style>
	.caret {
		color: var(--green-bright);
	}

	/*
		The caret only blinks once everything has finished. While text is still
		arriving it holds steady, the way a terminal does, which also keeps two
		competing motions off the screen at once.
	*/
	.caret.blinking {
		animation: blink 1.2s step-end infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.caret.blinking {
			animation: none;
		}
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
