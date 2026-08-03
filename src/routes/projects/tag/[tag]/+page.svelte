<script lang="ts">
	import ProjectListing from '$lib/components/ProjectListing.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Projects using {data.activeTag} — {data.name}</title>
	<meta name="description" content="Projects by {data.name} using {data.activeTag}." />
	<!-- Canonical comes from the layout, driven by `canonical` in this route's load. -->
</svelte:head>

<ProjectListing groups={data.groups} tags={data.tags} activeTag={data.activeTag} />
