<script lang="ts">
	import TypedText from './TypedText.svelte';

	/**
	 * Section headings rendered as shell commands: `$ ls ./projects`.
	 *
	 * This is the aesthetic's load-bearing device, so it stays consistent and
	 * does not spread into decoration elsewhere.
	 *
	 * On the home page the command types itself as part of the boot sequence;
	 * everywhere else it renders complete, which is the default.
	 */
	let {
		command,
		id,
		phase = 'done',
		topMargin = 'mt-12',
		onfinish
	}: {
		command: string;
		id?: string;
		phase?: 'pending' | 'typing' | 'done';
		/*
			Explicit rather than `first:mt-0`.

			That rule meant "no gap when I am the first thing here", which silently
			stopped applying every time something was inserted above the heading — a
			section wrapper once, a back-link later — each time adding 3rem nobody
			asked for. A caller that wants no gap now says so.
		*/
		topMargin?: string;
		onfinish?: () => void;
	} = $props();
</script>

<!--
	scroll-mt keeps an anchored heading clear of the top edge when jumped to,
	rather than sitting flush against it.
-->
<h2 {id} class="{topMargin} mb-3 scroll-mt-8 text-xs font-medium text-phosphor">
	<!--
		Decorative. A screen reader should hear "ls ./projects", not "dollar sign".

		The space after the $ is non-breaking on purpose: a plain trailing space
		inside a span is collapsed away when the markup is rendered, which glues
		the prompt to the command as "$ls ./projects".
	-->
	<span aria-hidden="true">$&nbsp;</span><span class="sr-only">{command}</span><span
		aria-hidden="true"><TypedText text={command} {phase} caret {onfinish} /></span
	>
</h2>
