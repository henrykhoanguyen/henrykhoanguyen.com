<script lang="ts">
	import { resolve } from '$app/paths';
	import Hero from '$lib/components/Hero.svelte';
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { formatDate, formatEnd, formatYear } from '$lib/content/format.js';

	let { data } = $props();

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
		Experience uses the same gutter as the projects listing, but stacks the
		date range across three lines so the column stays narrow:

			May 2024
			-
			Present

		Unlike projects these rows are not year-grouped: each carries its own full
		range, so blanking a repeated year would hide the month distinguishing two
		roles begun in the same one.
	*/
	const experienceRows: DirectoryRow[] = $derived(
		data.experience.map((role) => ({
			gutter: [formatDate(role.start), '-', formatEnd(role.end)],
			title: `${role.role} · ${role.company}`,
			details: role.highlights
		}))
	);
</script>

<svelte:head>
	<title>{data.about.name} — {data.about.tagline}</title>
	<meta name="description" content={data.about.tagline} />
</svelte:head>

<Hero name={data.about.name} tagline={data.about.tagline} />

<PromptHeading command="ls ./projects --featured" />
<DirectoryList items={projectRows} ariaLabel="Featured projects" />
<p class="mt-3 text-xs">
	<a href={resolve('/projects')} class="text-phosphor-dim hover:text-phosphor">see all projects →</a
	>
</p>

<PromptHeading command="cat ./experience" />
<DirectoryList items={experienceRows} ariaLabel="Work experience" />
