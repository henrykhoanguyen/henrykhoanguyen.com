import { getAbout } from '$lib/server/content.js';
import type { LayoutServerLoad } from './$types.js';

/**
 * Footer links come from `about.md` frontmatter and appear on every page, so
 * they load once at the layout rather than per route.
 */
export const load: LayoutServerLoad = async () => {
	const about = getAbout();
	return { links: about.links, name: about.name };
};
