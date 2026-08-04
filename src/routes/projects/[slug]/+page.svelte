<script lang="ts">
	import { resolve } from '$app/paths';
	import QuietLink from '$lib/components/QuietLink.svelte';
	import { formatDate } from '$lib/content/format.js';

	let { data } = $props();
	const Body = $derived(data.body);
</script>

<svelte:head>
	<title>{data.project.title} — {data.name}</title>
	<meta name="description" content={data.project.summary} />
	<meta property="og:title" content={data.project.title} />
	<meta property="og:description" content={data.project.summary} />
	<meta property="og:type" content="article" />
</svelte:head>

<article>
	<header class="mb-8 border-b border-phosphor-rule pb-5">
		<QuietLink href={resolve('/projects')} margin="mb-1.5">← cd ./projects</QuietLink>
		<h1 class="text-lg font-medium text-phosphor-text">{data.project.title}</h1>
		<p class="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-phosphor-dim">
			{data.project.summary}
		</p>

		<dl class="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
			<div class="flex gap-2">
				<dt class="text-phosphor-dim">stack</dt>
				<dd class="m-0 text-phosphor-text">{data.project.stack.join(' · ')}</dd>
			</div>
			<div class="flex gap-2">
				<dt class="text-phosphor-dim">date</dt>
				<dd class="m-0 text-phosphor-text">{formatDate(data.project.date)}</dd>
			</div>
			{#if data.project.repo}
				<div class="flex gap-2">
					<dt class="text-phosphor-dim">repo</dt>
					<dd class="m-0">
						<a href={data.project.repo} target="_blank" rel="noopener noreferrer">github ↗</a>
					</dd>
				</div>
			{/if}
			{#if data.project.demo}
				<div class="flex gap-2">
					<dt class="text-phosphor-dim">demo</dt>
					<dd class="m-0">
						<a href={data.project.demo} target="_blank" rel="noopener noreferrer">live ↗</a>
					</dd>
				</div>
			{/if}
		</dl>
	</header>

	<div class="prose prose-phosphor">
		<Body />
	</div>
</article>
