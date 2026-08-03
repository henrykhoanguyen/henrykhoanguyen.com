import { getAbout, getProjects } from '$lib/server/content.js';
import type { PaletteItem } from '$lib/components/palette.js';
import type { LayoutServerLoad } from './$types.js';

/**
 * Footer links and the command palette both appear on every page, so they load
 * once here rather than per route.
 */
export const load: LayoutServerLoad = async () => {
	const about = getAbout();

	/*
		Everything the palette can reach, assembled in one place.

		Adding an entry is a line here — the component takes a flat list and knows
		nothing about where any of it came from. Entries that *do* something rather
		than navigate would need a second variant on PaletteItem; nothing yet
		does.
	*/
	const palette: PaletteItem[] = [
		{ label: 'Home', href: '/', group: 'pages' },
		{ label: 'Projects', href: '/projects', group: 'pages' },
		{ label: 'About', href: '/about', group: 'pages' },
		...getProjects().map((project) => ({
			label: project.title,
			// Frontmatter-only projects point at their repo; the palette follows
			// wherever the listing would have gone.
			href: project.href,
			group: 'projects',
			// Summary and stack are searchable without cluttering the row.
			keywords: `${project.summary} ${project.stack.join(' ')}`
		})),
		// Contact links are the most likely reason a recruiter reaches for the
		// palette at all, so they belong in it rather than only in the footer.
		...about.links.map((link) => ({
			label: link.label,
			href: link.url,
			group: 'contact',
			keywords: link.url.replace(/^https?:\/\/(www\.)?|^mailto:/, '')
		}))
	];

	return { links: about.links, name: about.name, palette };
};
