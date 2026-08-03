<script lang="ts">
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { formatDate, formatEnd } from '$lib/content/format.js';

	let { data } = $props();

	/*
		The full history: every role with its highlights.

		The home page shows the same roles without highlights — `ls` there, `cat`
		here. That mirrors how the projects listing works, and it means a recruiter
		skimming the home page sees the shape of a career in four lines, while
		anyone who wants the detail has one click to reach it.
	*/
	const rows: DirectoryRow[] = $derived(
		data.experience.map((role) => ({
			gutter: [formatEnd(role.end), '-', formatDate(role.start)],
			title: `${role.role} · ${role.company}`,
			details: role.highlights
		}))
	);
</script>

<svelte:head>
	<title>Experience — {data.name}</title>
	<meta name="description" content="Roles and work history for {data.name}." />
</svelte:head>

<PromptHeading command="cat ./experience" />
<DirectoryList items={rows} ariaLabel="Work experience" />

<p class="mt-8 text-xs">
	<a href="https://www.linkedin.com/in/henrykhoanguyen/" target="_blank" rel="noopener noreferrer">
		full history on linkedin ↗
	</a>
</p>
