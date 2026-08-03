import { z } from 'zod';

/**
 * Frontmatter contracts for every content file on the site.
 *
 * These exist because the content layer is authored in markdown by hand. A
 * typo in a frontmatter key would otherwise ship as a blank page; here it
 * fails the build instead, naming the file and the field.
 */

/** An ISO date (YYYY-MM-DD), or a looser YYYY-MM / YYYY for imprecise dates. */
const isoDate = z
	.string()
	.regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'must be YYYY, YYYY-MM, or YYYY-MM-DD');

const url = z.url('must be a fully qualified URL');

/**
 * A project.
 *
 * There is deliberately no `slug` field — the slug comes from the filename, so
 * a URL can never drift from the file that produces it. There is likewise no
 * "has case study" flag: whether a detail page exists is derived from whether
 * the file has a body, so there is no switch to forget to flip.
 */
export const projectFrontmatter = z.object({
	title: z.string().min(1),
	summary: z.string().min(1),
	stack: z.array(z.string().min(1)).min(1),
	date: isoDate,
	featured: z.boolean().default(false),
	repo: url.optional(),
	demo: url.optional()
});

export const experienceFrontmatter = z.object({
	company: z.string().min(1),
	role: z.string().min(1),
	start: isoDate,
	end: z.union([isoDate, z.literal('present')]),
	highlights: z.array(z.string().min(1)).min(1),
	stack: z.array(z.string().min(1)).default([])
});

/**
 * Site-level identity lives in `about.md` frontmatter rather than a separate
 * config file, so "everything is markdown" stays true.
 *
 * There is no `resume` field. The site hosts no resume PDF; LinkedIn stands in
 * for it, and the old PDF path is handled by a redirect.
 */
export const aboutFrontmatter = z.object({
	name: z.string().min(1),
	tagline: z.string().min(1),
	skills: z.array(z.string().min(1)).min(1),
	links: z
		.array(
			z.object({
				label: z.string().min(1),
				url: z.string().min(1)
			})
		)
		.min(1)
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatter>;
export type ExperienceFrontmatter = z.infer<typeof experienceFrontmatter>;
export type AboutFrontmatter = z.infer<typeof aboutFrontmatter>;

/** A project as the rest of the app sees it: frontmatter plus derived fields. */
export type Project = ProjectFrontmatter & {
	slug: string;
	/** True when the file has a markdown body, and therefore a case study page. */
	hasBody: boolean;
	/** Where the listing row points: the case study if one exists, else the repo. */
	href: string;
};

export type Experience = ExperienceFrontmatter & { slug: string };

/**
 * Validates frontmatter, raising an error that names the file and the offending
 * field. Thrown at build time, so malformed content cannot reach production.
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
	const result = schema.safeParse(data);
	if (result.success) return result.data;

	const problems = result.error.issues
		.map((issue) => {
			const path = issue.path.join('.');
			return path ? `${path}: ${issue.message}` : issue.message;
		})
		.join('; ');

	throw new Error(`Invalid frontmatter in ${file} — ${problems}`);
}
