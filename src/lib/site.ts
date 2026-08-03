/**
 * Facts about the deployed site that content files have no business knowing.
 *
 * The canonical origin appears in the sitemap, canonical tags, and Open Graph
 * URLs. Defining it three times is how those drift apart, so it lives here.
 */
export const SITE_URL = 'https://henrykhoanguyen.com';

/** Absolute URL for a path, for metadata that cannot use a relative one. */
export function absolute(path: string): string {
	return new URL(path, SITE_URL).href;
}
