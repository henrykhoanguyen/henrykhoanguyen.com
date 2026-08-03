<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const links = [
		{ href: resolve('/projects'), label: 'projects' },
		{ href: resolve('/about'), label: 'about' }
	];

	const isCurrent = (href: string) => page.url.pathname.startsWith(href);
</script>

<header class="mb-12 flex items-baseline justify-between gap-4 text-xs">
	<a href={resolve('/')} class="text-phosphor no-underline hover:underline">~/henrykhoanguyen</a>
	<nav aria-label="Main">
		<ul class="m-0 flex list-none gap-4 p-0">
			{#each links as link (link.href)}
				<li>
					<a
						href={link.href}
						aria-current={isCurrent(link.href) ? 'page' : undefined}
						class="text-phosphor-dim no-underline hover:underline aria-[current=page]:text-phosphor"
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
