import { getCaseStudySlugs } from '$lib/server/content.js';
import { absolute } from '$lib/site.js';
import type { RequestHandler } from './$types.js';

export const prerender = true;

/**
 * The sitemap lists pages worth indexing, which is not the same as every page
 * the build emits.
 *
 * Tag pages are excluded deliberately: each is the same set of projects with a
 * different one emphasised, and all of them carry a canonical link back to
 * /projects. Listing them would ask search engines to index sixteen
 * near-duplicates of one page.
 */
export const GET: RequestHandler = async () => {
	const paths = ['/', '/projects', '/about', ...getCaseStudySlugs().map((s) => `/projects/${s}`)];

	const urls = paths
		.map((path) => `\t<url>\n\t\t<loc>${absolute(path)}</loc>\n\t</url>`)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
};
