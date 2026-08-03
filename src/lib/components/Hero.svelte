<script lang="ts">
	let { name, tagline }: { name: string; tagline: string } = $props();
</script>

<header class="mb-10">
	<p class="mb-1.5 text-xs text-phosphor" aria-hidden="true">$ whoami</p>
	<h1 class="text-xl font-medium text-phosphor-text">
		{name}<span class="caret" aria-hidden="true">▋</span>
	</h1>
	<p class="mt-2 max-w-[52ch] text-sm leading-relaxed text-phosphor-dim">{tagline}</p>
</header>

<style>
	.caret {
		color: var(--green-bright);
		animation: blink 1.2s step-end infinite;
	}

	/*
		A blinking caret is exactly the kind of motion that triggers discomfort
		for people sensitive to it, and it carries no information. Held steady
		when the system asks for reduced motion.
	*/
	@media (prefers-reduced-motion: reduce) {
		.caret {
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
