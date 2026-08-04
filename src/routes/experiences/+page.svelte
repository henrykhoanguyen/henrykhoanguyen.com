<script lang="ts">
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import QuietLink from '$lib/components/QuietLink.svelte';
	import { resolve } from '$app/paths';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { experienceRow } from '$lib/content/rows.js';

	let { data } = $props();

	/*
		The full history: every role with its highlights.

		The home page shows the same roles without highlights — `ls` there, `cat`
		here. That mirrors how the projects listing works, and it means a recruiter
		skimming the home page sees the shape of a career in four lines, while
		anyone who wants the detail has one click to reach it.
	*/
	const rows: DirectoryRow[] = $derived(
		data.experience.map((role) => experienceRow(role, { withHighlights: true }))
	);
</script>

<svelte:head>
	<title>Experiences — {data.name}</title>
	<meta name="description" content="Roles and work history for {data.name}." />
</svelte:head>

<!-- `cd ~` rather than `cd ./`: the prompt already calls home `~`, and `./` is where you already are. -->
<QuietLink href={resolve('/')} margin="mb-4">← cd ~</QuietLink>
<PromptHeading command="cat ./experiences" />
<DirectoryList items={rows} ariaLabel="Work experience" />

<QuietLink href="https://www.linkedin.com/in/henrykhoanguyen/" margin="mt-8">
	full history on linkedin ↗
</QuietLink>
