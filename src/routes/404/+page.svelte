<script lang="ts">
	import NotFound from '$lib/components/NotFound.svelte';

	/*
		Prerendered to `build/404.html`.

		Without this file the build emits no 404 page at all, and a static host
		answers an unknown path with whatever its own fallback is — which, for a
		URL like /project, meant serving index.html and playing the boot sequence
		as though nothing were wrong.

		Cloudflare Pages serves /404.html for unmatched paths automatically. On
		Workers static assets the same behaviour needs
		`assets.not_found_handling: "404-page"`, which is set in wrangler.jsonc.
	*/
</script>

<svelte:head>
	<title>404 — not found</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<NotFound />
