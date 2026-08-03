<script lang="ts">
	import ProjectListing from '$lib/components/ProjectListing.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Projects using {data.activeTag} — {data.name}</title>
	<meta name="description" content="Projects by {data.name} using {data.activeTag}." />
	<!-- The filtered views are the same content in a different order of emphasis. -->
	<link rel="canonical" href="https://henrykhoanguyen.com/projects" />
</svelte:head>

<ProjectListing groups={data.groups} tags={data.tags} activeTag={data.activeTag} />
