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
	'/experiences',
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

	test('summarises experiences without highlights, and links to the full history', async ({
		page
	}) => {
		await page.goto('/');
		const experience = page.getByRole('list', { name: 'Work experience' });
		// A one-line summary per role, but none of the detailed highlights.
		await expect(experience).toContainText('Streaming Oracle into BigQuery');
		await expect(experience).not.toContainText('Oracle-to-BigQuery streaming pipeline where none');
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
		await page.goto('/experiences');
		await expect(page.getByRole('list', { name: 'Work experience' })).toContainText(
			'Oracle-to-BigQuery'
		);
	});

	test('is reachable from the home page summary', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: /see full history/ }).click();
		await expect(page).toHaveURL('/experiences');
	});
});

test.describe('navigation', () => {
	test('header links reach both sections', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'projects', exact: true }).click();
		await expect(page).toHaveURL('/projects');

		await page.getByRole('link', { name: 'experiences', exact: true }).click();
		await expect(page).toHaveURL('/experiences');

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
	/*
		The 404 is a prerendered file, not a client-side render. Without
		build/404.html a static host answers an unknown path with index.html, and
		the visitor gets the home page and its boot sequence instead of an error —
		which is exactly the bug these cover.
	*/
	test('an unknown path renders the terminal 404', async ({ page }) => {
		const response = await page.goto('/does-not-exist');

		expect(response?.status()).toBe(404);
		await expect(page.getByText('exec ./where_u_thik_u_goin_?')).toBeVisible();
		await expect(page.getByText('zsh: no such file or directory')).toBeVisible();
	});

	test('the 404 is not the home page wearing a costume', async ({ page }) => {
		await page.goto('/project');

		// The tell for the old bug: the hero and the listings turning up on a URL
		// that was never a route.
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
		await expect(page.getByRole('list', { name: 'Featured projects' })).toHaveCount(0);
	});

	test('the prompt reports an unknown path as guest', async ({ page }) => {
		await page.goto('/project');
		await expect(page.getByRole('banner')).toContainText('guest@henrykhoanguyen');
	});

	test('it works without JavaScript, being a real file', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();

		await page.goto('/does-not-exist');
		await expect(page.getByText('zsh: no such file or directory')).toBeVisible();

		await context.close();
	});

	test('it is kept out of the index', async ({ page }) => {
		await page.goto('/does-not-exist');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
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

test.describe('skills', () => {
	/*
		Reduced motion renders the page complete on arrival. Pressing a key to skip
		the intro would race hydration: land the keystroke before the listener is
		attached and the test waits on an animation nobody cancelled.
	*/
	test.use({ reducedMotion: 'reduce' });

	/*
		The row a skill lights up is derived from frontmatter `stack`, so these
		assert against real content: BigQuery appears only under H-E-B, and PHP
		only under UCI. If either role's stack changes, these should fail rather
		than quietly keep passing.
	*/
	const rowFor = (page: Page, company: string) =>
		page
			.getByRole('list', { name: 'Work experience' })
			.getByRole('listitem')
			.filter({ hasText: company })
			.locator('a, div')
			.first();

	test('hovering a skill dims every row that does not use it', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: 'bigquery' }).hover();

		await expect(rowFor(page, 'H-E-B')).not.toHaveClass(/opacity-30/);
		await expect(rowFor(page, 'General Motors')).toHaveClass(/opacity-30/);
		await expect(rowFor(page, 'UCI')).toHaveClass(/opacity-30/);
	});

	test('the highlight releases when the pointer leaves', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: 'bigquery' }).hover();
		await expect(rowFor(page, 'UCI')).toHaveClass(/opacity-30/);

		// Somewhere with no skill under it.
		await page.getByRole('heading', { level: 1 }).hover();
		await expect(rowFor(page, 'UCI')).not.toHaveClass(/opacity-30/);
	});

	test('clicking pins a skill so it survives the pointer leaving', async ({ page }) => {
		await page.goto('/');

		const php = page.getByRole('button', { name: 'php' });
		await php.click();
		await expect(php).toHaveAttribute('aria-pressed', 'true');

		await page.getByRole('heading', { level: 1 }).hover();
		await expect(rowFor(page, 'UCI')).not.toHaveClass(/opacity-30/);
		await expect(rowFor(page, 'H-E-B')).toHaveClass(/opacity-30/);

		await php.click();
		await expect(php).toHaveAttribute('aria-pressed', 'false');
		await expect(rowFor(page, 'H-E-B')).not.toHaveClass(/opacity-30/);
	});

	test('clicking dead space clears the pin', async ({ page }) => {
		await page.goto('/');

		const php = page.getByRole('button', { name: 'php' });
		await php.click();
		await expect(php).toHaveAttribute('aria-pressed', 'true');

		await page.getByRole('main').click({ position: { x: 5, y: 5 } });
		await expect(php).toHaveAttribute('aria-pressed', 'false');
	});

	test('no skill is a dead end', async ({ page }) => {
		// A chip that highlights nothing would be a broken affordance. The skill
		// list is derived from the same stacks that drive dimming, so every one
		// of them must leave at least one row lit.
		await page.goto('/');

		const skills = page.locator('li button[aria-pressed]');
		const count = await skills.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			await skills.nth(i).hover();
			const dimmed = page.locator('li > .opacity-30');
			const rows = page.locator('li > :is(a, div)');
			expect(await dimmed.count()).toBeLessThan(await rows.count());
		}
	});

	test('announces the match count for screen readers', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: 'bigquery' }).hover();
		// Dimming is visual only, so the count carries the same information.
		await expect(page.getByText(/\d+ entries use BigQuery/)).toBeAttached();
	});
});

test.describe('the intro', () => {
	test('does not replay when returning home from a subpage', async ({ page }) => {
		await page.goto('/');
		// Let the first run finish rather than racing it — the point of the test
		// is what happens on the way back, not how it was cut short.
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });

		await page.getByRole('link', { name: 'projects', exact: true }).click();
		await expect(page).toHaveURL('/projects');
		await page.getByRole('link', { name: /cd ~/ }).click();
		await expect(page).toHaveURL('/');

		/*
			During the sequence the hero does not exist yet — it is the last thing
			mounted, several seconds in. Requiring it almost immediately is what
			makes this a test of the gate rather than of patience.
		*/
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 400 });
	});

	test('replays when the header prompt is clicked', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });
		await page.getByRole('link', { name: 'about', exact: true }).click();

		await page
			.getByRole('banner')
			.getByRole('link', { name: /henrykhoanguyen/ })
			.click();
		await expect(page).toHaveURL('/');
		// The hero arrives last, so it is absent while the sequence runs.
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
	});
});

test.describe('exit', () => {
	test('quitting replaces the page with a logout screen', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');
		await page.keyboard.type(':q!');
		await page.keyboard.press('Enter');

		await expect(page.getByText('logout')).toBeVisible();
		// Skip the sequence, then the only thing on screen is the way back.
		await page.keyboard.press('Space');
		await expect(page.getByRole('button', { name: 'click to restore' })).toBeVisible();
	});

	test('takes the whole site with it', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');
		await page.keyboard.type('exit');
		await page.keyboard.press('Enter');

		await expect(page.getByRole('navigation', { name: 'Main' })).not.toBeVisible();
		await expect(page.getByRole('contentinfo')).not.toBeVisible();
	});

	test('restores the site', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('ControlOrMeta+k');
		await page.keyboard.type('quit');
		await page.keyboard.press('Enter');
		await page.keyboard.press('Space');

		await page.getByRole('button', { name: 'click to restore' }).click();
		await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
	});
});

test.describe('the header prompt', () => {
	test('reports where you are', async ({ page }) => {
		await page.goto('/projects/retail-data-platform');
		await expect(page.getByRole('banner')).toContainText(
			'proj@henrykhoanguyen ~/retail-data-platform'
		);
	});
});
