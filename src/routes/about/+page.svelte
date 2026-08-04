<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PromptHeading from '$lib/components/PromptHeading.svelte';

	let { data } = $props();
	const Body = $derived(data.body);
</script>

<svelte:head>
	<title>About — {data.about.name}</title>
	<meta name="description" content={data.about.tagline} />
</svelte:head>

<PageHeader command="cat ./about.md" />

<div class="prose prose-phosphor">
	<Body />
</div>

<PromptHeading command="ls ./skills" />
<ul class="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-xs">
	{#each data.about.skills as skill (skill)}
		<li class="text-phosphor-dim">{skill.toLowerCase()}</li>
	{/each}
</ul>

<PromptHeading command="cat ./contact" />
<ul class="m-0 list-none space-y-1 p-0 text-xs">
	{#each data.about.links as link (link.url)}
		<li class="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4">
			<span class="text-phosphor-dim">{link.label.toLowerCase()}</span>
			<a
				href={link.url}
				target={/^https?:/.test(link.url) ? '_blank' : undefined}
				rel={/^https?:/.test(link.url) ? 'noopener noreferrer' : undefined}
				class="min-w-0 truncate"
			>
				{link.url.replace(/^https?:\/\/(www\.)?|^mailto:/, '')}
			</a>
		</li>
	{/each}
</ul>
