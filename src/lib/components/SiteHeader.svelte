<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { palette } from './palette-state.svelte.js';
	import { promptFor } from './prompt.js';

	/*
		Three links fit on the narrowest phone, so there is no drawer or hamburger.
		A slide-out panel for three items adds a tap, a dependency, and a focus
		trap to maintain, in exchange for hiding almost nothing.
	*/
	const links = [
		{ href: resolve('/projects'), label: 'projects' },
		{ href: resolve('/experiences'), label: 'experiences' },
		{ href: resolve('/about'), label: 'about' }
	];

	const isCurrent = (href: string) => page.url.pathname.startsWith(href);

	// The prompt reports where the visitor is, the way a shell reports the host
	// and working directory you are sitting in.
	const prompt = $derived(promptFor(page.url.pathname));

	// The shortcut hint is only meaningful where there is a keyboard, but the
	// badge is a real button so a pointer can reach the palette too.
	const isApple =
		typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform ?? '');
</script>

<header class="mb-12 flex items-baseline justify-between gap-4 text-xs">
	<!--
		Still a link home, but it reads as a prompt: the user names the section, the
		working directory names the page within it. One colour throughout — the
		prompt is a single utterance, and splitting it across three greens made it
		read as three separate labels rather than one line.
	-->
	<a href={resolve('/')} class="text-phosphor no-underline hover:underline">
		{prompt.user}@{prompt.host}
		{prompt.cwd}
	</a>

	<div class="flex items-baseline gap-3 sm:gap-4">
		<nav aria-label="Main">
			<ul class="m-0 flex list-none gap-3 p-0 sm:gap-4">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							aria-current={isCurrent(link.href) ? 'page' : undefined}
							class="text-phosphor-dim no-underline hover:underline aria-[current=page]:text-phosphor"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<button
			type="button"
			onclick={() => palette.open()}
			aria-label="Open the jump-to palette"
			aria-keyshortcuts="Meta+K Control+K"
			class="hidden rounded-sm border border-phosphor-rule px-1.5 py-0.5 text-[0.65rem] text-phosphor-dim hover:border-phosphor hover:text-phosphor sm:inline-block"
		>
			{isApple ? '⌘' : 'ctrl+'}K
		</button>
	</div>
</header>
