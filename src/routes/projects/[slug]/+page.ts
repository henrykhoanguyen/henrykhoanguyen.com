import { error } from '@sveltejs/kit';
import { loadProjectBody } from '$lib/content/load.js';
import type { PageLoad } from './$types.js';

/**
 * The body loads here rather than in `+page.server.ts` because a compiled
 * mdsvex module is a Svelte component, and components cannot be serialised
 * across a server-load boundary. Metadata comes from the server load; this adds
 * the rendered body to it.
 */
export const load: PageLoad = async ({ params, data }) => {
	const body = await loadProjectBody(params.slug);
	if (!body) error(404, 'No case study at this path');
	return { ...data, body };
};
