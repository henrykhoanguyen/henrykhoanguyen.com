import { getExperience } from '$lib/server/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => ({ experience: getExperience() });
