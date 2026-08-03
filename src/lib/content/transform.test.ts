import { describe, expect, it } from 'vitest';
import {
	collectStackTags,
	filterByStack,
	groupByYear,
	hasBody,
	projectHref,
	slugFromPath,
	sortExperience,
	sortProjects,
	stripFrontmatter,
	tagFromSlug,
	tagSlug
} from './transform.js';
import type { Experience, Project, ProjectFrontmatter } from './schema.js';

function project(overrides: Partial<Project> = {}): Project {
	return {
		title: 'A project',
		summary: 'Does a thing.',
		stack: ['java'],
		date: '2026-01-01',
		featured: false,
		slug: 'a-project',
		hasBody: true,
		href: '/projects/a-project',
		...overrides
	};
}

function role(overrides: Partial<Experience> = {}): Experience {
	return {
		company: 'Acme',
		role: 'Engineer',
		start: '2024-05',
		end: 'present',
		highlights: ['Did a thing.'],
		stack: [],
		slug: 'acme',
		...overrides
	};
}

describe('slugFromPath', () => {
	it('takes the filename without its extension', () => {
		expect(slugFromPath('/src/content/projects/stream-ingest.md')).toBe('stream-ingest');
	});

	it('leaves hyphens and digits intact', () => {
		expect(slugFromPath('/src/content/projects/parquet-diff-2.md')).toBe('parquet-diff-2');
	});
});

describe('stripFrontmatter', () => {
	it('removes a leading frontmatter block', () => {
		expect(stripFrontmatter('---\ntitle: x\n---\nBody text.')).toBe('Body text.');
	});

	it('leaves a file with no frontmatter untouched', () => {
		expect(stripFrontmatter('Just prose.')).toBe('Just prose.');
	});

	it('does not strip a horizontal rule further down the file', () => {
		const raw = '---\ntitle: x\n---\nIntro.\n\n---\n\nMore.';
		expect(stripFrontmatter(raw)).toContain('---');
		expect(stripFrontmatter(raw).startsWith('Intro.')).toBe(true);
	});
});

describe('hasBody', () => {
	it('is true when prose follows the frontmatter', () => {
		expect(hasBody('---\ntitle: x\n---\nA case study.')).toBe(true);
	});

	it('is false when the file is frontmatter only', () => {
		expect(hasBody('---\ntitle: x\n---\n')).toBe(false);
	});

	it('is false when the body is only whitespace', () => {
		expect(hasBody('---\ntitle: x\n---\n\n   \n\t\n')).toBe(false);
	});
});

describe('projectHref', () => {
	const frontmatter = {
		title: 'x',
		summary: 'y',
		stack: ['java'],
		date: '2026-01-01',
		featured: false
	} satisfies ProjectFrontmatter;

	it('points at the case study when the project has a body', () => {
		expect(projectHref(frontmatter, 'stream-ingest', true)).toBe('/projects/stream-ingest');
	});

	it('falls back to the repo when there is no body', () => {
		const withRepo = { ...frontmatter, repo: 'https://github.com/x/y' };
		expect(projectHref(withRepo, 'stream-ingest', false)).toBe('https://github.com/x/y');
	});

	it('prefers the case study over the repo when both exist', () => {
		const withRepo = { ...frontmatter, repo: 'https://github.com/x/y' };
		expect(projectHref(withRepo, 'stream-ingest', true)).toBe('/projects/stream-ingest');
	});

	it('refuses a project with neither a body nor a repo', () => {
		expect(() => projectHref(frontmatter, 'orphan', false)).toThrowError(/orphan/);
	});
});

describe('sortProjects', () => {
	it('puts the newest first', () => {
		const sorted = sortProjects([
			project({ slug: 'old', date: '2024-01-01' }),
			project({ slug: 'new', date: '2026-06-01' }),
			project({ slug: 'mid', date: '2025-03-01' })
		]);
		expect(sorted.map((p) => p.slug)).toEqual(['new', 'mid', 'old']);
	});

	it('breaks ties on slug so ordering is stable across builds', () => {
		const sorted = sortProjects([
			project({ slug: 'beta', date: '2026-01-01' }),
			project({ slug: 'alpha', date: '2026-01-01' })
		]);
		expect(sorted.map((p) => p.slug)).toEqual(['alpha', 'beta']);
	});

	it('does not mutate its input', () => {
		const input = [
			project({ slug: 'a', date: '2024-01-01' }),
			project({ slug: 'b', date: '2026-01-01' })
		];
		sortProjects(input);
		expect(input.map((p) => p.slug)).toEqual(['a', 'b']);
	});
});

describe('sortExperience', () => {
	it('puts the most recent role first', () => {
		const sorted = sortExperience([
			role({ slug: 'uci', start: '2020-10', end: '2021-01' }),
			role({ slug: 'heb', start: '2024-05', end: 'present' }),
			role({ slug: 'gm', start: '2021-01', end: '2024-05' })
		]);
		expect(sorted.map((r) => r.slug)).toEqual(['heb', 'gm', 'uci']);
	});
});

describe('groupByYear', () => {
	it('emits a year only on the first entry of that year', () => {
		const groups = groupByYear(
			[
				project({ slug: 'a', date: '2026-06-01' }),
				project({ slug: 'b', date: '2026-02-01' }),
				project({ slug: 'c', date: '2025-11-01' })
			],
			(p) => p.date
		);
		expect(groups.map((g) => g.year)).toEqual(['2026', '2025']);
		expect(groups[0].items.map((p) => p.slug)).toEqual(['a', 'b']);
		expect(groups[1].items.map((p) => p.slug)).toEqual(['c']);
	});

	it('returns nothing for an empty list', () => {
		expect(groupByYear([], (p: Project) => p.date)).toEqual([]);
	});

	it('starts a new group when a year repeats after a gap', () => {
		const groups = groupByYear(
			[
				project({ slug: 'a', date: '2026-01-01' }),
				project({ slug: 'b', date: '2025-01-01' }),
				project({ slug: 'c', date: '2026-01-01' })
			],
			(p) => p.date
		);
		expect(groups.map((g) => g.year)).toEqual(['2026', '2025', '2026']);
	});
});

describe('collectStackTags', () => {
	it('deduplicates and sorts tags across projects', () => {
		const tags = collectStackTags([
			project({ stack: ['python', 'kafka'] }),
			project({ stack: ['kafka', 'java'] })
		]);
		expect(tags).toEqual(['java', 'kafka', 'python']);
	});

	it('returns nothing when there are no projects', () => {
		expect(collectStackTags([])).toEqual([]);
	});
});

describe('filterByStack', () => {
	const projects = [
		project({ slug: 'a', stack: ['java', 'kafka'] }),
		project({ slug: 'b', stack: ['python'] })
	];

	it('keeps only projects carrying the tag', () => {
		expect(filterByStack(projects, 'java').map((p) => p.slug)).toEqual(['a']);
	});

	it('returns everything when no tag is selected', () => {
		expect(filterByStack(projects, null)).toHaveLength(2);
	});

	it('returns nothing for a tag no project carries', () => {
		expect(filterByStack(projects, 'rust')).toEqual([]);
	});
});

describe('tagSlug', () => {
	// Tags are written for humans and land in URL path segments, so the
	// characters that break paths are the ones worth asserting.
	it.each([
		['Java', 'java'],
		['Pub/Sub', 'pub-sub'],
		['Node.js', 'node-js'],
		['Apache Pulsar', 'apache-pulsar'],
		['Azure DevOps', 'azure-devops'],
		['C++', 'c'],
		['  spaced  ', 'spaced']
	])('turns %s into %s', (tag, slug) => {
		expect(tagSlug(tag)).toBe(slug);
	});

	it('produces slugs safe to place in a URL path', () => {
		const tags = ['Pub/Sub', 'Node.js', 'Spring Boot', 'C#'];
		for (const slug of tags.map(tagSlug)) {
			expect(slug).toMatch(/^[a-z0-9-]+$/);
		}
	});

	it('is idempotent, so slugging a slug changes nothing', () => {
		expect(tagSlug(tagSlug('Pub/Sub'))).toBe(tagSlug('Pub/Sub'));
	});
});

describe('tagFromSlug', () => {
	const tags = ['Java', 'Pub/Sub', 'Node.js'];

	it('resolves a slug back to its original tag', () => {
		expect(tagFromSlug(tags, 'pub-sub')).toBe('Pub/Sub');
	});

	it('returns null for a slug no tag produces', () => {
		expect(tagFromSlug(tags, 'rust')).toBeNull();
	});

	it('round-trips every tag', () => {
		const broken = tags.filter((tag) => tagFromSlug(tags, tagSlug(tag)) !== tag);
		expect(broken).toEqual([]);
	});
});
