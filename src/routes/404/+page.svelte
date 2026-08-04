<script lang="ts">
	import NotFound from '$lib/components/NotFound.svelte';

	/*
		Prerendered to `build/404.html`.

		Without this file the build emits no 404 page at all, and a static host
		answers an unknown path with whatever its own fallback is — which, for a
		URL like /project, meant serving index.html and playing the boot sequence
		as though nothing were wrong.

		Cloudflare Pages serves /404.html for unmatched paths automatically, so
		this file is the whole fix there. Deploying to Workers static assets
		instead would additionally need `assets.not_found_handling: "404-page"`
		in a Wrangler config — see docs/deploy.md.
	*/
</script>

<svelte:head>
	<title>404 — not found</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<NotFound />
