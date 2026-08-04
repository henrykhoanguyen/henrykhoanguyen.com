import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}',

	/*
		Reduced motion by default.

		The home page opens with a boot sequence that assembles bottom-up, so
		while it runs the page is both incomplete and moving. A test that clicks a
		link during it is racing a layout shift, and one that looks for a skill
		chip may be looking before it exists — neither failure says anything about
		the thing being tested.

		The tests that are actually about the animation opt back in with
		`test.use({ reducedMotion: 'no-preference' })`.
	*/
	use: { reducedMotion: 'reduce' }
});
