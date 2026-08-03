import type { Component } from 'svelte';

/**
 * Client-safe loading of a single markdown body.
 *
 * The listing side of the content layer lives in `$lib/server/content.ts` and
 * never reaches the browser. This module is its counterpart: a compiled mdsvex
 * module is a Svelte component, and components cannot cross a server-load
 * boundary, so case study bodies have to be imported here instead.
 *
 * The glob is lazy, so each body becomes its own chunk and only the page being
 * viewed pays for it.
 */

const projectBodies = import.meta.glob<{ default: Component }>('/src/content/projects/*.md');
const aboutBody = import.meta.glob<{ default: Component }>('/src/content/about.md');

/** Returns the rendered body for a project, or undefined if it has none. */
export async function loadProjectBody(slug: string): Promise<Component | undefined> {
	const load = projectBodies[`/src/content/projects/${slug}.md`];
	if (!load) return undefined;
	return (await load()).default;
}

export async function loadAboutBody(): Promise<Component> {
	const load = Object.values(aboutBody)[0];
	if (!load) throw new Error('src/content/about.md is missing.');
	return (await load()).default;
}
