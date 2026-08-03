// Every route on this site is prerendered. There is no server, no database,
// and no runtime data fetching — the build emits plain HTML.
export const prerender = true;

// Trailing slashes are normalised so that /projects and /projects/ don't
// prerender as two separate pages.
export const trailingSlash = 'never';
