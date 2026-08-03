/**
 * Where the site lives.
 *
 * The canonical origin appears in the sitemap, canonical tags, and Open Graph
 * URLs. Defining it three times is how those drift apart, so it lives here and
 * is only ever reached through `absolute()`.
 */
const SITE_URL = 'https://henrykhoanguyen.com';

/** Absolute URL for a path, for metadata that cannot use a relative one. */
export function absolute(path: string): string {
	return new URL(path, SITE_URL).href;
}
