<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import Hero from '$lib/components/Hero.svelte';
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import MoreLink from '$lib/components/MoreLink.svelte';
	import SkillFilter from '$lib/components/SkillFilter.svelte';
	import Hint from '$lib/components/Hint.svelte';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { FINAL, next, reached, stateFor, type Step } from '$lib/components/boot.js';
	import { experienceRow, projectRow } from '$lib/content/rows.js';
	import { isDeadSpaceClick } from '$lib/components/outside-click.js';

	let { data } = $props();

	/*
		The boot sequence.

		The page assembles bottom-up: `ls ./skills` types first, then experiences
		appear above and push it down, then projects, then the hero above all of
		it. No positioning trick is involved — sections render in normal document
		order and simply are not present yet, so each arrival shifts the rest down
		on its own.

		Seeded from `browser`: during prerender the sequence starts finished, so the
		HTML ships complete and the page is fully readable with JavaScript disabled
		or before hydration. On the client it starts at the beginning.
	*/
	let step = $state<Step>(browser ? 'skillsCommand' : FINAL);

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

	/*
		Skill highlighting.

		Two inputs, one result. `hovered` is transient — a sweep across the skills
		row lights things up and lets go. `pinned` survives the pointer leaving, so
		you can click a skill, move away, and read what stayed lit. A hover always
		wins while it lasts, which is what makes browsing over a pinned skill feel
		like a peek rather than a mode change.
	*/
	let hovered = $state<string | null>(null);
	let pinned = $state<string | null>(null);

	const activeSkill = $derived(hovered ?? pinned);

	const toggleSkill = (skill: string) => (pinned = pinned === skill ? null : skill);

	// Clicking dead space clears the pin, the same gesture that clears the stack
	// filter on /projects.
	function onDocumentClick(event: MouseEvent) {
		if (pinned && isDeadSpaceClick(event)) pinned = null;
	}

	const matchCount = $derived(
		activeSkill === null
			? 0
			: data.featured.filter((p) => p.stack.includes(activeSkill)).length +
					data.experience.filter((r) => r.stack.includes(activeSkill)).length
	);

	const projectRows: DirectoryRow[] = $derived(
		data.featured.map((p) => projectRow(p, { maxStack: 2, activeSkill }))
	);

	/*
		Experiences in summary: role, a one-line summary, and dates — the same shape
		as a project row above. Highlights are omitted; the full history lives at
		/experiences. `ls` here, `cat` there, the split the projects listing uses.

		Not year-grouped, unlike projects: each row carries its own full range, so
		blanking a repeated year would hide the month that distinguishes two roles
		begun in the same one.
	*/
	const experienceRows: DirectoryRow[] = $derived(
		data.experience.map((role) => experienceRow(role, { activeSkill }))
	);
</script>

<svelte:document onclick={onDocumentClick} />

<svelte:head>
	<title>{data.about.name} — {data.about.tagline}</title>
	<meta name="description" content={data.about.tagline} />
</svelte:head>

<!--
	The skip hint lives at the top of the page and only while the sequence is
	running. It has to be visible from the first frame — that is the moment it is
	useful — and a hint for something that has already finished is just clutter,
	so it leaves when the animation does.

	It never appears in the prerendered HTML: the sequence starts finished during
	prerender, so nobody with JavaScript disabled is told to skip an animation
	that is not playing.
-->
{#if step !== FINAL}
	<Hint margin="mb-6">press any key, scroll, or click anywhere to skip the animation</Hint>
{/if}

{#if reached(step, 'whoamiCommand')}
	<Hero name={data.about.name} tagline={data.about.tagline} {step} onstep={advance} />
{/if}

<!--
	Section spacing lives here rather than on PromptHeading.

	The heading carries `mt-12 first:mt-0`, which works when headings are siblings
	on a page — as they are on /about. Inside a <section> every heading is a first
	child, so that rule zeroes all of them and the sections collide. The wrapper
	owns the gap instead, and `first:mt-0` on the wrapper keeps whichever section
	is currently topmost from being pushed off the header.
-->
{#if reached(step, 'projectsCommand')}
	<section class="mt-12 first:mt-0">
		<PromptHeading
			command="ls ./projects --featured"
			phase={stateFor(step, 'projectsCommand')}
			onfinish={() => revealThenContinue('projectsBody')}
		/>

		{#if reached(step, 'projectsBody')}
			<DirectoryList items={projectRows} ariaLabel="Featured projects" />
			<MoreLink href={resolve('/projects')}>see all projects →</MoreLink>
		{/if}
	</section>
{/if}

{#if reached(step, 'experienceCommand')}
	<section class="mt-12 first:mt-0">
		<PromptHeading
			command="ls ./experiences"
			phase={stateFor(step, 'experienceCommand')}
			onfinish={() => revealThenContinue('experienceBody')}
		/>

		{#if reached(step, 'experienceBody')}
			<DirectoryList items={experienceRows} ariaLabel="Work experience" />
			<MoreLink href={resolve('/experiences')}>see full history →</MoreLink>
		{/if}
	</section>
{/if}

{#if reached(step, 'skillsCommand')}
	<section class="mt-12 first:mt-0">
		<PromptHeading
			command="ls ./skills"
			phase={stateFor(step, 'skillsCommand')}
			onfinish={() => revealThenContinue('skillsBody')}
		/>

		{#if reached(step, 'skillsBody')}
			<Hint>
				{#if pinned}
					hover or click a skill to highlight where it was used — click it again to clear
				{:else}
					hover or click a skill to highlight where it was used
				{/if}
			</Hint>

			<SkillFilter
				skills={data.skills}
				active={activeSkill}
				{pinned}
				onpreview={(skill) => (hovered = skill)}
				ontoggle={toggleSkill}
			/>

			<!-- Dimming is a visual cue only, so the count is announced instead. -->
			<p class="sr-only" aria-live="polite">
				{#if activeSkill}
					{matchCount} entries use {activeSkill}
				{/if}
			</p>
		{/if}
	</section>
{/if}
