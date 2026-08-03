<!--
	Footer links come from about.md frontmatter: external URLs and mailto:,
	never internal routes, so there is nothing for resolve() to do.
-->
<script lang="ts">
	type Link = { label: string; url: string };
	let { links }: { links: Link[] } = $props();

	const isExternal = (url: string) => /^https?:\/\//.test(url);
</script>

<footer class="mt-20 border-t border-phosphor-rule pt-4 text-xs">
	<nav aria-label="Contact and profiles">
		<ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
			{#each links as link (link.url)}
				<li>
					<a
						href={link.url}
						class="text-phosphor-dim no-underline hover:text-phosphor hover:underline"
						target={isExternal(link.url) ? '_blank' : undefined}
						rel={isExternal(link.url) ? 'noopener noreferrer' : undefined}
					>
						{link.label.toLowerCase()}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</footer>
