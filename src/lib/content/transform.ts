import type { Experience, Project, ProjectFrontmatter } from './schema.js';

/**
 * Pure transforms over content. No file access, no globs, no framework — which
 * is why these are the functions worth testing. The glob wiring that feeds them
 * lives in `$lib/server/content.ts`.
 */

/** `/src/content/projects/stream-ingest.md` → `stream-ingest`. */
export function slugFromPath(path: string): string {
	const filename = path.split('/').pop() ?? '';
	return filename.replace(/\.md$/, '');
}

/**
 * True when a markdown file has prose after its frontmatter.
 *
 * A project with frontmatter and no body is valid — it renders as a listing row
 * pointing at GitHub. Writing a body is the only action needed to publish a
 * case study, so emptiness is derived rather than declared.
 */
export function hasBody(raw: string): boolean {
	return stripFrontmatter(raw).trim().length > 0;
}

/** Removes a leading `---` delimited frontmatter block, if present. */
export function stripFrontmatter(raw: string): string {
	// \uFEFF tolerates a byte-order mark, which some editors prepend on save.
	const match = raw.match(/^\uFEFF?\s*---\r?\n[\s\S]*?\r?\n---\r?\n?/);
	return match ? raw.slice(match[0].length) : raw;
}

/**
 * Where a project's listing row points.
 *
 * A project with a body gets its own page. One without falls back to the repo.
 * A project with neither throws rather than silently rendering a row that links
 * nowhere.
 */
export function projectHref(frontmatter: ProjectFrontmatter, slug: string, body: boolean): string {
	if (body) return `/projects/${slug}`;
	if (frontmatter.repo) return frontmatter.repo;
	throw new Error(
		`Project ${slug} has no case study body and no repo — it would render a row that links nowhere. ` +
			`Add a body to the markdown file, or set a repo URL in its frontmatter.`
	);
}

/** Newest first. Ties break on slug so ordering is stable across builds. */
export function sortProjects(projects: Project[]): Project[] {
	return [...projects].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** Most recent role first. `present` sorts above any concrete date. */
export function sortExperience(roles: Experience[]): Experience[] {
	return [...roles].sort((a, b) => b.start.localeCompare(a.start) || a.slug.localeCompare(b.slug));
}

export type YearGroup<T> = { year: string; items: T[] };

/**
 * Groups already-sorted items under their year.
 *
 * The listing shows a year in the left gutter only when it changes, which is
 * what makes the directory layout read as a listing rather than a table.
 */
export function groupByYear<T>(items: T[], getDate: (item: T) => string): YearGroup<T>[] {
	const groups: YearGroup<T>[] = [];
	for (const item of items) {
		const year = getDate(item).slice(0, 4);
		const current = groups.at(-1);
		if (current?.year === year) current.items.push(item);
		else groups.push({ year, items: [item] });
	}
	return groups;
}

/** Every distinct stack tag across all projects, deduplicated and sorted. */
export function collectStackTags(projects: Project[]): string[] {
	return [...new Set(projects.flatMap((p) => p.stack))].sort((a, b) => a.localeCompare(b));
}

/** Filters by stack tag. An absent or unknown tag returns everything. */
export function filterByStack(projects: Project[], tag: string | null): Project[] {
	if (!tag) return projects;
	return projects.filter((p) => p.stack.includes(tag));
}

/**
 * URL-safe form of a stack tag: `Pub/Sub` → `pub-sub`, `Node.js` → `node-js`.
 *
 * Tags are written for humans in frontmatter and contain slashes, dots, and
 * spaces, none of which survive a path segment intact. Filter pages are real
 * prerendered routes rather than query strings — a query string cannot be
 * prerendered — so every tag needs a stable slug.
 */
export function tagSlug(tag: string): string {
	return tag
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Resolves a slug back to its original tag, or null if no tag matches. */
export function tagFromSlug(tags: string[], slug: string): string | null {
	return tags.find((tag) => tagSlug(tag) === slug) ?? null;
}
