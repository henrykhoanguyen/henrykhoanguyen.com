import { error } from '@sveltejs/kit';
import { getCaseStudySlugs, getProject } from '$lib/server/content.js';
import type { EntryGenerator, PageServerLoad } from './$types.js';

/**
 * The prerender list comes from the content files themselves, so the
 * empty-body rule is enforced by the build rather than by convention: a project
 * with no case study body simply never generates a page, and its listing row
 * points at its repo instead.
 */
export const entries: EntryGenerator = () => getCaseStudySlugs().map((slug) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
	const project = getProject(params.slug);
	if (!project?.hasBody) error(404, 'No case study at this path');
	return { project };
};
