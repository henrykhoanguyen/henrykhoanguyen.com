import { getAbout, getExperience, getFeaturedProjects } from '$lib/server/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => ({
	about: getAbout(),
	featured: getFeaturedProjects(3),

	/*
		Experience in summary only.

		The home page renders roles and dates without highlights — the full history
		lives at /experience. Returning the whole role here would serialise every
		highlight into the prerendered HTML just to leave it undisplayed, which is
		a few kilobytes of payload for nothing.
	*/
	experience: getExperience().map(({ slug, company, role, start, end, summary }) => ({
		slug,
		company,
		role,
		start,
		end,
		summary
	}))
});
