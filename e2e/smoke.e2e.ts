import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke coverage for the built site.
 *
 * The unit tests cover the content layer, which is where the logic is. These
 * cover the things unit tests structurally cannot: that the prerendered pages
 * actually exist, that nothing throws in a browser, and that the palette and
 * navigation work when driven by a real keyboard.
 *
 * Deliberately not visual regression tests. Locking pixels down on a site whose
 * design is still moving would produce failures that mean nothing.
 */

const PAGES = [
	'/',
	'/projects',
	'/experience',
	'/about',
	'/projects/retail-data-platform',
	'/projects/vehicle-data-streaming',
	'/projects/spring-boot-streaming-harness',
	'/projects/german-football-analyzer',
	'/projects/tag/java',
	'/projects/tag/pub-sub'
];

/** Collects console errors and page exceptions for the life of a page. */
function watchForErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	page.on('pageerror', (error) => errors.push(error.message));
	return errors;
}

test.describe('every page', () => {
	for (const path of PAGES) {
		test(`${path} loads without errors`, async ({ page }) => {
			const errors = watchForErrors(page);
			const response = await page.goto(path);

			expect(response?.status()).toBe(200);
			await expect(page.locator('h1, h2').first()).toBeVisible();
			expect(errors).toEqual([]);
		});
	}
});

test.describe('home', () => {
	test('shows the name, tagline, and both listings', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1 })).toContainText('Khoa Nguyen');
		await expect(page.getByRole('list', { name: 'Featured projects' })).toBeVisible();
		await expect(page.getByRole('list', { name: 'Work experience' })).toBeVisible();
	});

	test('leads with the current role', async ({ page }) => {
		await page.goto('/');
		const experience = page.getByRole('list', { name: 'Work experience' });
		await expect(experience.getByRole('listitem').first()).toContainText('H-E-B');
		await expect(experience.getByRole('listitem').first()).toContainText('Present');
	});

	test('summarises experience without highlights, and links to the full history', async ({
		page
	}) => {
		await page.goto('/');
		const experience = page.getByRole('list', { name: 'Work experience' });
		await expect(experience).not.toContainText('Oracle-to-BigQuery');
		await expect(page.getByRole('link', { name: /see full history/ })).toBeVisible();
	});

	test('the typed name is announced once, not per character', async ({ page }) => {
		await page.goto('/');
		// The accessible name comes from the static copy, so it is complete
		// immediately regardless of how far the animation has progressed.
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Khoa Nguyen/);
	});
});

test.describe('experience', () => {
	test('the full history carries highlights the home page omits', async ({ page }) => {
		await page.goto('/experience');
		await expect(page.getByRole('list', { name: 'Work experience' })).toContainText(
			'Oracle-to-BigQuery'
		);
	});

	test('is reachable from the home page summary', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: /see full history/ }).click();
		await expect(page).toHaveURL('/experience');
	});
});

test.describe('navigation', () => {
	test('header links reach both sections', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'projects', exact: true }).click();
		await expect(page).toHaveURL('/projects');

		await page.getByRole('link', { name: 'experience', exact: true }).click();
		await expect(page).toHaveURL('/experience');

		await page.getByRole('link', { name: 'about', exact: true }).click();
		await expect(page).toHaveURL('/about');
	});

	test('a project row opens its case study', async ({ page }) => {
		await page.goto('/projects');
		await page
			.getByRole('link', { name: /Retail data platform/ })
			.first()
			.click();
		await expect(page).toHaveURL('/projects/retail-data-platform');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Retail data platform');
	});
});

test.describe('stack filter', () => {
	test('works without JavaScript, since the pages are real', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();

		const response = await page.goto('/projects/tag/java');
		expect(response?.status()).toBe(200);
		await expect(page.getByRole('link', { name: 'java', exact: true })).toHaveAttribute(
			'aria-current',
			'true'
		);

		await context.close();
	});

	test('points search engines back at the unfiltered listing', async ({ page }) => {
		await page.goto('/projects/tag/java');
		const canonicals = page.locator('link[rel="canonical"]');
		await expect(canonicals).toHaveCount(1);
		await expect(canonicals).toHaveAttribute('href', 'https://henrykhoanguyen.com/projects');
	});
});

test.describe('command palette', () => {
	test('opens with the keyboard and jumps to a project', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');

		const palette = page.getByRole('dialog', { name: 'Jump to' });
		await expect(palette).toBeVisible();

		await page.keyboard.type('retail');
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL('/projects/retail-data-platform');
	});

	test('closes on Escape without navigating', async ({ page }) => {
		await page.goto('/about');
		await page.keyboard.press('ControlOrMeta+k');
		await expect(page.getByRole('dialog', { name: 'Jump to' })).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Jump to' })).not.toBeVisible();
		await expect(page).toHaveURL('/about');
	});

	test('says so when nothing matches', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');
		await page.keyboard.type('zzzznotathing');
		await expect(page.getByText(/no matches found/)).toBeVisible();
	});

	test('the input never moves as results narrow', async ({ page }) => {
		// A centred dialog re-centres itself as the list shrinks, dragging the
		// input down while you are still typing into it. The dialog is anchored
		// from the top so only its bottom edge moves.
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');

		const input = page.getByRole('textbox', { name: 'Search pages and projects' });
		const before = await input.boundingBox();

		await page.keyboard.type('zzzznotathing');
		await expect(page.getByText(/no matches found/)).toBeVisible();

		const after = await input.boundingBox();
		expect(after?.y).toBeCloseTo(before?.y ?? -1, 0);
	});

	test('finds contact links by their address, not just their label', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');
		await page.keyboard.type('linkedin.com');
		await expect(page.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
	});
});

test.describe('errors', () => {
	test('an unknown path renders the terminal 404', async ({ page }) => {
		const response = await page.goto('/does-not-exist');
		expect(response?.status()).toBe(404);
		await expect(page.getByText(/no such file or directory/)).toBeVisible();
		await expect(page.getByRole('link', { name: 'cd ~' })).toBeVisible();
	});

	test('an unknown stack tag 404s rather than showing an empty list', async ({ page }) => {
		const response = await page.goto('/projects/tag/cobol');
		expect(response?.status()).toBe(404);
	});
});

test.describe('accessibility', () => {
	test('the first tab stop is a skip link', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Tab');
		await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	});

	test('listings are marked up as lists, not grids of divs', async ({ page }) => {
		await page.goto('/projects');
		const lists = page.getByRole('list');
		expect(await lists.count()).toBeGreaterThan(0);
	});

	test('the prompt glyphs are hidden from assistive technology', async ({ page }) => {
		await page.goto('/');
		// "$ ls ./projects --featured" should be announced without the "$".
		await expect(
			page.getByRole('heading', { name: 'ls ./projects --featured', exact: true })
		).toBeVisible();
	});
});

test.describe('deployment metadata', () => {
	test('the sitemap lists case studies but not tag pages', async ({ request }) => {
		const response = await request.get('/sitemap.xml');
		expect(response.status()).toBe(200);

		const xml = await response.text();
		expect(xml).toContain('https://henrykhoanguyen.com/projects/retail-data-platform');
		expect(xml).not.toContain('/projects/tag/');
	});

	test('robots.txt points at the sitemap', async ({ request }) => {
		const response = await request.get('/robots.txt');
		expect(await response.text()).toContain('Sitemap: https://henrykhoanguyen.com/sitemap.xml');
	});
});
