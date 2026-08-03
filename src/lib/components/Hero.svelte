<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { keystrokeDelay } from './typing.js';

	let { name, tagline }: { name: string; tagline: string } = $props();

	/*
		The name types itself out on load, as if someone were at the prompt.

		Three constraints shape how this is built:

		1. The prerendered HTML must contain the full name. A crawler that sees an
		   empty <h1> learns nothing, and this is the single most important string
		   on the site. The visually-hidden copy is always present and complete.
		2. A screen reader should hear "Khoa Nguyen" once, not eleven times as the
		   text node mutates. The animated copy is aria-hidden; the accessible name
		   comes from the static copy beside it.
		3. Reduced-motion users see the finished name immediately. Typing is
		   decoration and carries no information they would lose.

		`browser` seeds the initial value: during prerender it is false, so the
		markup ships complete and works with JavaScript disabled. On the client it
		is true, so the animated span starts empty and the typing begins from
		nothing rather than flashing the full name first.
	*/
	// Seeded once on purpose. `name` comes from about.md and never changes at
	// runtime, and re-seeding mid-animation would restart the typing. untrack
	// states that intent rather than leaving it to look like an oversight.
	let typed = $state(browser ? '' : untrack(() => name));
	let finished = $state(!browser);

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (reduced.matches) {
			typed = name;
			finished = true;
			return;
		}

		let index = 0;
		let timer: ReturnType<typeof setTimeout>;

		const step = () => {
			index += 1;
			typed = name.slice(0, index);
			if (index >= name.length) {
				finished = true;
				return;
			}
			timer = setTimeout(step, keystrokeDelay(name[index - 1]));
		};

		// A short beat before the first keystroke, as though the prompt were read
		// before being answered.
		timer = setTimeout(step, 320);
		return () => clearTimeout(timer);
	});
</script>

<header class="mb-10">
	<p class="mb-1.5 text-xs text-phosphor" aria-hidden="true">$ whoami</p>

	<h1 class="text-xl font-medium text-phosphor-text">
		<!-- The real, complete name: what crawlers index and screen readers announce. -->
		<span class="sr-only">{name}</span>
		<!--
			The visual copy. Hidden from assistive tech so the mutating text node is
			never announced character by character.
		-->
		<span aria-hidden="true">
			{typed}<span class="caret" class:blinking={finished}>▋</span>
		</span>
	</h1>

	<p class="mt-2 max-w-[52ch] text-sm leading-relaxed text-phosphor-dim">{tagline}</p>
</header>

<style>
	.caret {
		color: var(--green-bright);
	}

	/*
		The caret holds steady while characters are arriving and only starts
		blinking once typing stops — the same way a real terminal behaves, and it
		keeps two competing motions off the screen at once.
	*/
	.caret.blinking {
		animation: blink 1.2s step-end infinite;
	}

	/*
		Blinking is exactly the kind of motion that causes discomfort for people
		sensitive to it, and it carries no information. The typing itself is
		skipped in JavaScript for the same reason.
	*/
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
