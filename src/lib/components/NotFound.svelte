<script lang="ts">
	/**
	 * The not-found screen.
	 *
	 * Two lines and nothing else. There is deliberately no list of suggested
	 * links: the header prompt and the nav are still above this, so the way back
	 * is already on screen, and a helpful little menu underneath would undercut
	 * the joke it is sitting next to.
	 *
	 * Rendered from two places. `/404` prerenders it to `build/404.html`, which is
	 * what the host serves for a URL that was never a route. `+error.svelte`
	 * renders it for a navigation that fails after the app has booted. Same
	 * screen either way, which is the only reason it is a component.
	 */
	const COMMAND = 'exec ./where_u_thik_u_goin_?';
</script>

<section class="py-6">
	<!--
		Non-breaking space after the $ on purpose: a plain trailing space inside a
		span is collapsed when rendered, which glues the prompt to the command.
	-->
	<p class="text-sm text-phosphor">
		<span aria-hidden="true">$&nbsp;</span>{COMMAND}
	</p>
	<p class="mt-2 text-sm text-phosphor-dim">zsh: no such file or directory</p>
</section>
