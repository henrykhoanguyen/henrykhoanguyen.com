<script lang="ts">
	import { resolve } from '$app/paths';
	import Hero from '$lib/components/Hero.svelte';
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { formatMonth, formatYear } from '$lib/content/format.js';
	import { groupByYear } from '$lib/content/transform.js';

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
		Experience uses the same three-column rhythm as the projects listing:
		start year in the gutter, month on the right, highlights beneath the role.

		Only the start date is shown. An end date on the current role would be
		empty or say "now", and on past roles the span matters less than the order
		— which the listing already conveys. Grouping by year means a year prints
		once even if two roles began in it, and the month on the right still tells
		them apart.
	*/
	const experienceRows: DirectoryRow[] = $derived(
		groupByYear(data.experience, (role) => role.start).flatMap((group) =>
			group.items.map((role, i) => ({
				gutter: i === 0 ? group.year : '',
				title: `${role.role} · ${role.company}`,
				meta: formatMonth(role.start),
				details: role.highlights
			}))
		)
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
