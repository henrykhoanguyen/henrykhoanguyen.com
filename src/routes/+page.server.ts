import { getAbout, getExperience, getFeaturedProjects } from '$lib/server/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => ({
	about: getAbout(),
	featured: getFeaturedProjects(3),
	experience: getExperience()
});
