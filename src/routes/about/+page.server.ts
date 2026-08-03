import { getAbout } from '$lib/server/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => ({ about: getAbout() });
