import type { DirectoryRow } from '$lib/components/directory.js';
import type { Experience, Project } from './schema.js';
import { formatDate, formatEnd, formatYear } from './format.js';
import { isDimmed } from './transform.js';

/**
 * Turning content into listing rows.
 *
 * Both the home page and the listing pages render the same two kinds of row,
 * and they were drifting: the gutter format, how many stack tags to show, and
 * the dimming rule were each written twice. These are the shared shapes.
 */

type ProjectRowOptions = {
	/** Blank on rows that repeat their group's year. Defaults to the year. */
	gutter?: string;
	/** How many stack tags fit in the right column at this width. */
	maxStack?: number;
	activeSkill?: string | null;
};

export function projectRow(project: Project, options: ProjectRowOptions = {}): DirectoryRow {
	const { gutter = formatYear(project.date), maxStack = 3, activeSkill = null } = options;

	return {
		gutter,
		title: project.title,
		summary: project.summary,
		meta: project.stack.slice(0, maxStack).join(' · '),
		href: project.href,
		dimmed: isDimmed(project.stack, activeSkill)
	};
}

/**
 * What a row actually needs from a role.
 *
 * Not the full `Experience`: the home page deliberately trims highlights out of
 * its payload rather than serialising them into HTML that never shows them.
 * Depending on the whole type would force those bytes back.
 */
type RoleLike = Pick<Experience, 'company' | 'role' | 'start' | 'end' | 'summary' | 'stack'> & {
	highlights?: string[];
};

type ExperienceRowOptions = {
	/** Highlights are shown on /experiences and omitted in the home summary. */
	withHighlights?: boolean;
	activeSkill?: string | null;
};

/**
 * A role.
 *
 * The gutter stacks its date range, end above start — the same direction the
 * listing runs, so reading down the gutter moves backwards in time exactly as
 * reading down the page does.
 */
export function experienceRow(role: RoleLike, options: ExperienceRowOptions = {}): DirectoryRow {
	const { withHighlights = false, activeSkill = null } = options;

	return {
		gutter: [formatEnd(role.end), '-', formatDate(role.start)],
		title: `${role.role} · ${role.company}`,
		summary: role.summary,
		details: withHighlights ? role.highlights : undefined,
		dimmed: isDimmed(role.stack, activeSkill)
	};
}
