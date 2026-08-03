<script lang="ts">
	import ProjectListing from '$lib/components/ProjectListing.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Projects — {data.name}</title>
	<meta name="description" content="Projects and case studies by {data.name}." />
</svelte:head>

<ProjectListing groups={data.groups} tags={data.tags} />
