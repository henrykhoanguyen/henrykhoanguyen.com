<script lang="ts">
	import { keystrokeDelay } from './typing.js';

	/**
	 * A run of text that types itself out when it becomes active.
	 *
	 * Three states rather than a boolean: `pending` renders nothing at all (so it
	 * takes no vertical space and cannot push later content around), `typing`
	 * animates, `done` shows the text complete. The orchestrating page owns which
	 * state each run is in, so the sequence lives in one readable place instead of
	 * being spread across components that each know a little of it.
	 */
	let {
		text,
		phase = 'pending',
		caret = false,
		onfinish
	}: {
		text: string;
		phase?: 'pending' | 'typing' | 'done';
		/** Show a block caret while typing. */
		caret?: boolean;
		onfinish?: () => void;
	} = $props();

	let typed = $state('');

	const display = $derived(phase === 'done' ? text : typed);

	$effect(() => {
		if (phase !== 'typing') return;

		let index = 0;
		let timer: ReturnType<typeof setTimeout>;

		const step = () => {
			index += 1;
			typed = text.slice(0, index);
			if (index >= text.length) {
				onfinish?.();
				return;
			}
			timer = setTimeout(step, keystrokeDelay(text[index - 1]));
		};

		timer = setTimeout(step, 90);
		return () => clearTimeout(timer);
	});
</script>

{#if phase !== 'pending'}<span
		>{display}{#if caret && phase === 'typing'}<span class="caret">▋</span>{/if}</span
	>{/if}

<style>
	.caret {
		color: var(--green-bright);
	}
</style>
