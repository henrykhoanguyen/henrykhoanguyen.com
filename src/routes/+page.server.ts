import { getAbout, getExperience, getFeaturedProjects, getSkills } from '$lib/server/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => ({
	about: getAbout(),
	featured: getFeaturedProjects(3),

	// Every skill used by at least one project or role. Hovering one highlights
	// where it was used, so a skill that matches nothing has no place here.
	skills: getSkills(),

	/*
		Experiences in summary.

		The home page renders roles, dates, and a one-line summary — the full
		history lives at /experiences. Returning whole roles would serialise every
		highlight into the prerendered HTML just to leave it undisplayed.

		`stack` is included despite not being rendered: the skills row needs it to
		decide which rows to dim.
	*/
	experience: getExperience().map(({ slug, company, role, start, end, summary, stack }) => ({
		slug,
		company,
		role,
		start,
		end,
		summary,
		stack
	}))
});
