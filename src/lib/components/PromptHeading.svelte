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
		onfinish
	}: {
		command: string;
		id?: string;
		phase?: 'pending' | 'typing' | 'done';
		onfinish?: () => void;
	} = $props();
</script>

<!--
	scroll-mt keeps an anchored heading clear of the top edge when jumped to,
	rather than sitting flush against it.
-->
<h2 {id} class="mt-12 mb-3 scroll-mt-8 text-xs font-medium text-phosphor first:mt-0">
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
