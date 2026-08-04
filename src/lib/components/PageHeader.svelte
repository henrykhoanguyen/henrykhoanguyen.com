<script lang="ts">
	import { resolve } from '$app/paths';
	import QuietLink from './QuietLink.svelte';
	import PromptHeading from './PromptHeading.svelte';

	/**
	 * The top of a section page: a way back, then the command that names the page.
	 *
	 * `/projects`, `/experiences`, and `/about` all opened with the same two
	 * elements, the same margins, and the same explanatory comment copied three
	 * times. The spacing between them is the fragile part — the heading has to
	 * ask for no top margin, and forgetting that adds 3rem — so it belongs in one
	 * place rather than at each call site.
	 *
	 * `cd ~` rather than `cd ./`: the header prompt already calls home `~`, and
	 * `./` is where you already are.
	 */
	let {
		command,
		backHref = resolve('/'),
		backLabel = '← cd ~'
	}: {
		command: string;
		/** Defaults home; a case study would point at its section instead. */
		backHref?: string;
		backLabel?: string;
	} = $props();
</script>

<QuietLink href={backHref} margin="mb-1.5">{backLabel}</QuietLink>
<PromptHeading {command} topMargin="mt-0" />
