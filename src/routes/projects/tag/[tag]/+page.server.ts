import { error } from '@sveltejs/kit';
import { getProjectsByYear, getStackTags } from '$lib/server/content.js';
import { tagFromSlug, tagSlug } from '$lib/content/transform.js';
import type { EntryGenerator, PageServerLoad } from './$types.js';

/**
 * One prerendered page per stack tag.
 *
 * This exists because query strings cannot be prerendered — a static build
 * emits one file per path, and `?stack=java` is not a path. Real routes keep
 * the filter shareable, reloadable, and working without JavaScript.
 */
export const entries: EntryGenerator = () => getStackTags().map((tag) => ({ tag: tagSlug(tag) }));

export const load: PageServerLoad = async ({ params }) => {
	const tag = tagFromSlug(getStackTags(), params.tag);
	if (!tag) error(404, `No projects tagged ${params.tag}`);

	return {
		groups: getProjectsByYear(),
		tags: getStackTags(),
		activeTag: tag,
		// Every tag page shows the same projects with a different one emphasised,
		// so they all point search engines back at the unfiltered listing.
		canonical: '/projects'
	};
};
