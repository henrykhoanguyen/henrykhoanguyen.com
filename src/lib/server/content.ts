import {
	aboutFrontmatter,
	experienceFrontmatter,
	projectFrontmatter,
	validate,
	type AboutFrontmatter,
	type Experience,
	type Project
} from '$lib/content/schema.js';
import {
	collectSkills,
	collectStackTags,
	groupByYear,
	hasBody,
	projectHref,
	slugFromPath,
	sortExperience,
	sortProjects
} from '$lib/content/transform.js';

/**
 * The only module in the codebase that globs content off disk.
 *
 * Routes call `getProjects()` and friends; they never touch `import.meta.glob`
 * or parse frontmatter themselves. That keeps content mechanics in one place
 * and out of page code.
 *
 * This lives under `$lib/server` so SvelteKit refuses any client import. Two
 * things depend on that: the raw markdown glob below, which would otherwise
 * bundle every case study body into the browser payload, and the fact that
 * validation errors should surface at build time rather than in someone's tab.
 * Every route on this site is prerendered, so "server" here means "during
 * `npm run build`".
 */

const projectMeta = import.meta.glob('/src/content/projects/*.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, unknown>;

const projectRaw = import.meta.glob('/src/content/projects/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const experienceMeta = import.meta.glob('/src/content/experiences/*.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, unknown>;

const aboutMeta = import.meta.glob('/src/content/about.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, unknown>;

function buildProjects(): Project[] {
	const projects = Object.entries(projectMeta).map(([path, meta]) => {
		const slug = slugFromPath(path);
		const frontmatter = validate(projectFrontmatter, meta, path);
		const body = hasBody(projectRaw[path] ?? '');
		return { ...frontmatter, slug, hasBody: body, href: projectHref(frontmatter, slug, body) };
	});

	if (projects.length === 0) {
		throw new Error('No projects found in src/content/projects. An empty site is a bug.');
	}

	return sortProjects(projects);
}

function buildExperience(): Experience[] {
	const roles = Object.entries(experienceMeta).map(([path, meta]) => ({
		...validate(experienceFrontmatter, meta, path),
		slug: slugFromPath(path)
	}));

	if (roles.length === 0) {
		throw new Error('No experience found in src/content/experiences. An empty site is a bug.');
	}

	return sortExperience(roles);
}

// Built once at module load. The content is fixed at build time, so there is
// nothing to invalidate.
const projects = buildProjects();
const experience = buildExperience();

export function getProjects(): Project[] {
	return projects;
}

/** Featured projects for the home page, falling back to the newest three. */
export function getFeaturedProjects(limit = 3): Project[] {
	const featured = projects.filter((p) => p.featured);
	return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export function getProject(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug);
}

/** Slugs that should generate a case study page — those with a body. */
export function getCaseStudySlugs(): string[] {
	return projects.filter((p) => p.hasBody).map((p) => p.slug);
}

export function getExperience(): Experience[] {
	return experience;
}

export function getStackTags(): string[] {
	return collectStackTags(projects);
}

/**
 * Skills that appear on at least one project or role — the chips on the home
 * page. Wider than the project-only stack tags used by /projects, because a
 * skill used at a job but never in a public project still belongs here.
 */
export function getSkills(): string[] {
	return collectSkills(projects, experience);
}

export function getProjectsByYear() {
	return groupByYear(projects, (p) => p.date);
}

export function getAbout(): AboutFrontmatter {
	const [path, meta] = Object.entries(aboutMeta)[0] ?? [];
	if (!path) throw new Error('src/content/about.md is missing.');
	return validate(aboutFrontmatter, meta, path);
}
