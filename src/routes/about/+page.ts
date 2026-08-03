import { loadAboutBody } from '$lib/content/load.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ data }) => ({
	...data,
	body: await loadAboutBody()
});
