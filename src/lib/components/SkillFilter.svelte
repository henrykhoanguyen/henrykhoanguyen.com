<script lang="ts">
	/**
	 * The skills row: hover or click a skill to highlight where it was used.
	 *
	 * Two ways in, because they answer different questions. Hovering is for
	 * browsing — sweep across and watch the page respond, no commitment. Clicking
	 * pins, so you can move the mouse away and read what stayed lit.
	 *
	 * Focus previews too, which is what makes this reachable by keyboard rather
	 * than being a mouse-only flourish.
	 *
	 * These are buttons, not links. Nothing navigates: the filter is a way of
	 * looking at the page you are already on. That is also why this differs from
	 * the /projects stack filter, where each tag is a real prerendered route.
	 */
	let {
		skills,
		active,
		pinned,
		onpreview,
		ontoggle
	}: {
		skills: string[];
		/** The skill currently highlighting — a hover, or the pinned one. */
		active: string | null;
		/** The clicked skill, which survives the pointer leaving. */
		pinned: string | null;
		onpreview: (skill: string | null) => void;
		ontoggle: (skill: string) => void;
	} = $props();
</script>

<ul class="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-xs">
	{#each skills as skill (skill)}
		<li>
			<button
				type="button"
				aria-pressed={pinned === skill}
				onmouseenter={() => onpreview(skill)}
				onmouseleave={() => onpreview(null)}
				onfocus={() => onpreview(skill)}
				onblur={() => onpreview(null)}
				onclick={() => ontoggle(skill)}
				class="rounded-sm transition-colors hover:text-phosphor"
				class:text-phosphor={active === skill}
				class:text-phosphor-dim={active !== skill}
				class:underline={pinned === skill}
			>
				{skill.toLowerCase()}
			</button>
		</li>
	{/each}
</ul>
