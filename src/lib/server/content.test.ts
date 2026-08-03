import { describe, expect, it } from 'vitest';
import {
	getAbout,
	getCaseStudySlugs,
	getExperience,
	getFeaturedProjects,
	getProject,
	getProjects,
	getProjectsByYear,
	getStackTags
} from './content.js';

/**
 * Integration coverage for the glob wiring.
 *
 * `transform.test.ts` and `schema.test.ts` cover the logic in isolation. These
 * assertions run against the real files in `src/content`, so they catch the
 * failures those cannot: a glob pattern that matches nothing, a content file
 * whose frontmatter drifted, or a project that would render a row linking
 * nowhere. Importing this module is itself the test — validation throws at
 * import time.
 */

describe('projects', () => {
	it('loads every markdown file in src/content/projects', () => {
		expect(getProjects().length).toBeGreaterThanOrEqual(4);
	});

	it('derives slugs from filenames', () => {
		expect(getProject('retail-data-platform')).toBeDefined();
	});

	it('returns undefined for an unknown slug', () => {
		expect(getProject('does-not-exist')).toBeUndefined();
	});

	it('orders newest first', () => {
		const dates = getProjects().map((p) => p.date);
		expect([...dates].sort().reverse()).toEqual(dates);
	});

	it('gives every project a reachable href', () => {
		const unreachable = getProjects().filter((p) => !/^(\/projects\/|https?:\/\/)/.test(p.href));
		expect(unreachable).toEqual([]);
	});

	it('points projects with a case study at their own page', () => {
		const misrouted = getProjects()
			.filter((p) => p.hasBody)
			.filter((p) => p.href !== `/projects/${p.slug}`);
		expect(misrouted).toEqual([]);
	});

	// Vacuously true while every project has a case study. Kept as a guard for
	// when a frontmatter-only project is added later — the fallback to the repo
	// is covered directly in transform.test.ts.
	it('points projects without a case study at an external repo', () => {
		const misrouted = getProjects()
			.filter((p) => !p.hasBody)
			.filter((p) => !/^https?:\/\//.test(p.href));
		expect(misrouted).toEqual([]);
	});

	it('generates case study routes only for projects with a body', () => {
		const slugs = getCaseStudySlugs();
		const withBody = getProjects().filter((p) => p.hasBody);
		expect(slugs).toHaveLength(withBody.length);
	});

	it('leads with the H-E-B platform, the strongest and most current work', () => {
		expect(getProjects()[0].slug).toBe('retail-data-platform');
	});
});

describe('featured projects', () => {
	it('returns at most the requested number', () => {
		expect(getFeaturedProjects(3).length).toBeLessThanOrEqual(3);
	});

	it('returns only featured projects when some are marked', () => {
		const featured = getFeaturedProjects(3);
		expect(featured.every((p) => p.featured)).toBe(true);
	});
});

describe('year grouping', () => {
	it('emits each year once, in descending order', () => {
		const years = getProjectsByYear().map((g) => g.year);
		expect(new Set(years).size).toBe(years.length);
		expect([...years].sort().reverse()).toEqual(years);
	});

	it('accounts for every project', () => {
		const grouped = getProjectsByYear().flatMap((g) => g.items);
		expect(grouped).toHaveLength(getProjects().length);
	});
});

describe('stack tags', () => {
	it('are deduplicated and sorted', () => {
		const tags = getStackTags();
		expect([...new Set(tags)]).toEqual(tags);
		expect([...tags].sort((a, b) => a.localeCompare(b))).toEqual(tags);
	});

	it('cover every tag used by a project', () => {
		const used = new Set(getProjects().flatMap((p) => p.stack));
		expect(new Set(getStackTags())).toEqual(used);
	});
});

describe('experience', () => {
	it('loads every role', () => {
		expect(getExperience().length).toBeGreaterThanOrEqual(3);
	});

	it('leads with the current role', () => {
		const [current] = getExperience();
		expect(current.end).toBe('present');
	});

	it('orders most recent first', () => {
		const starts = getExperience().map((r) => r.start);
		expect([...starts].sort().reverse()).toEqual(starts);
	});

	it('gives every role at least one highlight', () => {
		const empty = getExperience().filter((r) => r.highlights.length === 0);
		expect(empty).toEqual([]);
	});
});

describe('about', () => {
	it('loads site metadata from frontmatter', () => {
		const about = getAbout();
		expect(about.name).toBe('Khoa Nguyen');
		expect(about.tagline.length).toBeGreaterThan(0);
	});

	it('carries the links that serve as the site exit routes', () => {
		const labels = getAbout().links.map((l) => l.label.toLowerCase());
		expect(labels).toContain('linkedin');
		expect(labels).toContain('github');
	});
});
