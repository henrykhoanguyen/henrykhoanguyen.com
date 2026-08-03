<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import PromptHeading from '$lib/components/PromptHeading.svelte';
	import DirectoryList from '$lib/components/DirectoryList.svelte';
	import type { DirectoryRow } from '$lib/components/directory.js';
	import { resolve } from '$app/paths';
	import { formatRange } from '$lib/content/format.js';

	let { data } = $props();

	const projectRows: DirectoryRow[] = $derived(
		data.featured.map((p) => ({
			gutter: p.date.slice(0, 4),
			title: p.title,
			summary: p.summary,
			meta: p.stack.slice(0, 2).join(' · '),
			href: p.href
		}))
	);

	// Experience is not year-grouped: every role spans years, so a year gutter
	// would repeat and mislead. The date range goes on the right instead.
	const experienceRows: DirectoryRow[] = $derived(
		data.experience.map((role) => ({
			title: `${role.role} · ${role.company}`,
			meta: formatRange(role.start, role.end)
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

<!--
	Highlights sit under the listing rather than inside it. The listing answers
	"where has he worked"; this answers "what did he do there", and a recruiter
	skimming the first question should not have to wade through the second.
-->
<div class="mt-8 space-y-6">
	{#each data.experience as role (role.slug)}
		<section aria-labelledby="role-{role.slug}">
			<h3 id="role-{role.slug}" class="text-xs text-phosphor-text">
				{role.role} · {role.company}
			</h3>
			<ul class="mt-1.5 list-none space-y-1 p-0 text-xs leading-relaxed text-phosphor-dim">
				{#each role.highlights as highlight (highlight)}
					<li class="flex gap-2">
						<span class="shrink-0 text-phosphor" aria-hidden="true">-</span>
						<span>{highlight}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
