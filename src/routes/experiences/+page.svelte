<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import QuietLink from '$lib/components/QuietLink.svelte';
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

<PageHeader command="cat ./experiences" />
<DirectoryList items={rows} ariaLabel="Work experience" />

<QuietLink href="https://www.linkedin.com/in/henrykhoanguyen/" margin="mt-8">
	full history on linkedin ↗
</QuietLink>
