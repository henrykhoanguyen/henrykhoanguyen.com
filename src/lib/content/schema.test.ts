import { describe, expect, it } from 'vitest';
import { aboutFrontmatter, experienceFrontmatter, projectFrontmatter, validate } from './schema.js';

const validProject = {
	title: 'Retail data platform',
	summary: 'Oracle to BigQuery, minutes to milliseconds.',
	stack: ['java', 'bigquery'],
	date: '2026-01-01'
};

const validExperience = {
	company: 'H-E-B',
	role: 'Software Engineer',
	start: '2024-05',
	end: 'present',
	summary: 'Streaming pipelines and the services on top of them.',
	highlights: ['Built the streaming pipeline.']
};

const validAbout = {
	name: 'Khoa Nguyen',
	tagline: 'Backend engineer with streaming depth.',
	skills: ['java', 'bigquery'],
	links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/henrykhoanguyen/' }]
};

describe('validate', () => {
	it('names the file when frontmatter is invalid', () => {
		expect(() => validate(projectFrontmatter, {}, '/src/content/projects/broken.md')).toThrowError(
			/broken\.md/
		);
	});

	it('names the offending field', () => {
		const missingSummary = { ...validProject, summary: undefined };
		expect(() =>
			validate(projectFrontmatter, missingSummary, '/src/content/projects/broken.md')
		).toThrowError(/summary/);
	});

	it('returns parsed data when valid', () => {
		const parsed = validate(projectFrontmatter, validProject, 'ok.md');
		expect(parsed.title).toBe('Retail data platform');
	});
});

describe('projectFrontmatter', () => {
	it('accepts a complete project', () => {
		expect(projectFrontmatter.safeParse(validProject).success).toBe(true);
	});

	it.each(['title', 'summary', 'stack', 'date'])('requires %s', (field) => {
		const incomplete: Record<string, unknown> = { ...validProject };
		delete incomplete[field];
		const result = projectFrontmatter.safeParse(incomplete);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes(field))).toBe(true);
		}
	});

	it('defaults featured to false', () => {
		const parsed = projectFrontmatter.parse(validProject);
		expect(parsed.featured).toBe(false);
	});

	it('rejects an empty stack, since every row shows one', () => {
		expect(projectFrontmatter.safeParse({ ...validProject, stack: [] }).success).toBe(false);
	});

	it.each(['2026', '2026-01', '2026-01-01'])('accepts the date %s', (date) => {
		expect(projectFrontmatter.safeParse({ ...validProject, date }).success).toBe(true);
	});

	it.each(['Jan 2026', '01/01/2026', 'yesterday'])('rejects the date %s', (date) => {
		expect(projectFrontmatter.safeParse({ ...validProject, date }).success).toBe(false);
	});

	it('rejects a repo that is not a URL', () => {
		expect(projectFrontmatter.safeParse({ ...validProject, repo: 'github.com/x/y' }).success).toBe(
			false
		);
	});

	it('accepts a project with no repo, since employer work has none', () => {
		expect(projectFrontmatter.safeParse(validProject).success).toBe(true);
	});
});

describe('experienceFrontmatter', () => {
	it('accepts a complete role', () => {
		expect(experienceFrontmatter.safeParse(validExperience).success).toBe(true);
	});

	it('accepts present as an end date', () => {
		const parsed = experienceFrontmatter.parse(validExperience);
		expect(parsed.end).toBe('present');
	});

	it('accepts a concrete end date', () => {
		expect(experienceFrontmatter.safeParse({ ...validExperience, end: '2024-05' }).success).toBe(
			true
		);
	});

	it('rejects any other end value', () => {
		expect(experienceFrontmatter.safeParse({ ...validExperience, end: 'now' }).success).toBe(false);
	});

	it('requires at least one highlight', () => {
		expect(experienceFrontmatter.safeParse({ ...validExperience, highlights: [] }).success).toBe(
			false
		);
	});

	it('defaults stack to an empty list', () => {
		expect(experienceFrontmatter.parse(validExperience).stack).toEqual([]);
	});
});

describe('aboutFrontmatter', () => {
	it('accepts complete site metadata', () => {
		expect(aboutFrontmatter.safeParse(validAbout).success).toBe(true);
	});

	it.each(['name', 'tagline', 'skills', 'links'])('requires %s', (field) => {
		const incomplete: Record<string, unknown> = { ...validAbout };
		delete incomplete[field];
		expect(aboutFrontmatter.safeParse(incomplete).success).toBe(false);
	});

	it('requires at least one link, since the footer is the exit route', () => {
		expect(aboutFrontmatter.safeParse({ ...validAbout, links: [] }).success).toBe(false);
	});

	it('has no resume field, since the site hosts no PDF', () => {
		const parsed = aboutFrontmatter.parse({ ...validAbout, resume: '/resume.pdf' });
		expect('resume' in parsed).toBe(false);
	});
});
