import { describe, expect, it } from 'vitest';
import { experienceRow, projectRow } from './rows.js';
import type { Project } from './schema.js';

const project: Project = {
	title: 'Retail data platform',
	summary: 'Oracle to BigQuery.',
	stack: ['Java', 'Pub/Sub', 'BigQuery', 'Oracle'],
	date: '2026-01',
	featured: true,
	slug: 'retail-data-platform',
	hasBody: true,
	href: '/projects/retail-data-platform'
};

const role = {
	company: 'H-E-B',
	role: 'Software Engineer',
	start: '2024-05',
	end: 'present',
	summary: 'Streaming into the warehouse.',
	stack: ['Java', 'BigQuery'],
	highlights: ['Built the pipeline.', 'Cut response times.']
};

describe('projectRow', () => {
	it('defaults the gutter to the year', () => {
		expect(projectRow(project).gutter).toBe('2026');
	});

	it('lets a caller blank the gutter for a repeated year', () => {
		expect(projectRow(project, { gutter: '' }).gutter).toBe('');
	});

	it('truncates the stack to the width the caller has room for', () => {
		expect(projectRow(project, { maxStack: 2 }).meta).toBe('Java · Pub/Sub');
	});

	it('dims when the active skill is not in the stack', () => {
		expect(projectRow(project, { activeSkill: 'Rust' }).dimmed).toBe(true);
		expect(projectRow(project, { activeSkill: 'Java' }).dimmed).toBe(false);
	});

	it('carries the href the content layer resolved', () => {
		expect(projectRow(project).href).toBe('/projects/retail-data-platform');
	});
});

describe('experienceRow', () => {
	it('stacks the date range with the end above the start', () => {
		expect(experienceRow(role).gutter).toEqual(['Present', '-', 'May 2024']);
	});

	it('combines role and company into the title', () => {
		expect(experienceRow(role).title).toBe('Software Engineer · H-E-B');
	});

	it('omits highlights by default, for the home page summary', () => {
		expect(experienceRow(role).details).toBeUndefined();
	});

	it('includes highlights when asked, for the full history', () => {
		expect(experienceRow(role, { withHighlights: true }).details).toHaveLength(2);
	});

	it('accepts a role with no highlights at all', () => {
		// The home page trims them out of its payload; requiring them would put
		// those bytes back into the prerendered HTML for nothing.
		const trimmed = { ...role, highlights: undefined };
		expect(() => experienceRow(trimmed)).not.toThrow();
		expect(experienceRow(trimmed).title).toBe('Software Engineer · H-E-B');
	});

	it('dims on the same rule as a project row', () => {
		expect(experienceRow(role, { activeSkill: 'Rust' }).dimmed).toBe(true);
		expect(experienceRow(role, { activeSkill: 'BigQuery' }).dimmed).toBe(false);
	});
});
