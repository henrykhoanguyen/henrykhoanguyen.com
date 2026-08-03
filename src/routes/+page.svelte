<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import Hero from '$lib/components/Hero.svelte';
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { FINAL, next, reached, stateFor, type Step } from '$lib/components/boot.js';
	import { formatDate, formatEnd, formatYear } from '$lib/content/format.js';

	let { data } = $props();

	/*
		The boot sequence.

		The page assembles bottom-up: `cat ./experience` types first, then the
		projects prompt appears above it and pushes it down, then the hero appears
		above both. No positioning trick is involved — sections render in normal
		document order and simply are not present yet, so each arrival shifts the
		rest down on its own.

		Seeded from `browser`: during prerender the sequence starts finished, so the
		HTML ships complete and the page is fully readable with JavaScript disabled
		or before hydration. On the client it starts at the beginning.
	*/
	let step = $state<Step>(browser ? 'experienceCommand' : FINAL);

	const advance = (to: Step) => {
		if (step !== FINAL) step = to;
	};

	const finish = () => (step = FINAL);

	/*
		A command finishing does two things in turn: its output appears after a
		short beat, then the next prompt begins after a slightly longer one. A
		terminal is never quite instant, and running the two together reads as a
		single jump rather than a sequence.

		Both timers go through `advance`, which is a no-op once the sequence has
		been skipped — so pending timeouts cannot rewind a finished page.
	*/
	function revealThenContinue(bodyStep: Step, reveal = 150, thenNext = 260) {
		setTimeout(() => {
			advance(bodyStep);
			setTimeout(() => advance(next(bodyStep)), thenNext);
		}, reveal);
	}

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			finish();
			return;
		}

		/*
			Anyone who does not want to wait skips the whole thing. A recruiter on
			their fifth portfolio of the afternoon should not be made to watch an
			animation before they can read anything.
		*/
		const skip = () => finish();
		window.addEventListener('pointerdown', skip, { once: true });
		window.addEventListener('keydown', skip, { once: true });
		window.addEventListener('wheel', skip, { once: true, passive: true });

		return () => {
			window.removeEventListener('pointerdown', skip);
			window.removeEventListener('keydown', skip);
			window.removeEventListener('wheel', skip);
		};
	});

	const projectRows: DirectoryRow[] = $derived(
		data.featured.map((p) => ({
			gutter: formatYear(p.date),
			title: p.title,
			summary: p.summary,
			meta: p.stack.slice(0, 2).join(' · '),
			href: p.href
		}))
	);

	/*
		Experience shares the projects gutter but stacks its date range, end above
		start — the same direction the listing runs, so reading down the gutter
		moves backwards in time exactly as reading down the page does.

		These rows are not year-grouped: each carries its own full range, so
		blanking a repeated year would hide the month that distinguishes two roles
		begun in the same one.
	*/
	const experienceRows: DirectoryRow[] = $derived(
		data.experience.map((role) => ({
			gutter: [formatEnd(role.end), '-', formatDate(role.start)],
			title: `${role.role} · ${role.company}`,
			details: role.highlights
		}))
	);
</script>

<svelte:head>
	<title>{data.about.name} — {data.about.tagline}</title>
	<meta name="description" content={data.about.tagline} />
</svelte:head>

{#if reached(step, 'whoamiCommand')}
	<Hero name={data.about.name} tagline={data.about.tagline} {step} onstep={advance} />
{/if}

{#if reached(step, 'projectsCommand')}
	<section>
		<PromptHeading
			command="ls ./projects --featured"
			phase={stateFor(step, 'projectsCommand')}
			onfinish={() => revealThenContinue('projectsBody')}
		/>

		{#if reached(step, 'projectsBody')}
			<DirectoryList items={projectRows} ariaLabel="Featured projects" />
			<p class="mt-3 text-xs">
				<a href={resolve('/projects')} class="text-phosphor-dim hover:text-phosphor">
					see all projects →
				</a>
			</p>
		{/if}
	</section>
{/if}

{#if reached(step, 'experienceCommand')}
	<section>
		<!-- The nav links here, so the id has to sit on something scroll-visible. -->
		<PromptHeading
			command="cat ./experience"
			id="experience"
			phase={stateFor(step, 'experienceCommand')}
			onfinish={() => revealThenContinue('experienceBody')}
		/>

		{#if reached(step, 'experienceBody')}
			<DirectoryList items={experienceRows} ariaLabel="Work experience" />
		{/if}
	</section>
{/if}
