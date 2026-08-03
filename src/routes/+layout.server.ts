import { getAbout, getProjects } from '$lib/server/content.js';
import type { PaletteItem } from '$lib/components/palette.js';
import type { LayoutServerLoad } from './$types.js';

/**
 * Footer links and the command palette both appear on every page, so they load
 * once here rather than per route.
 */
export const load: LayoutServerLoad = async () => {
	const about = getAbout();

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
		}))
	];

	return { links: about.links, name: about.name, palette };
};
