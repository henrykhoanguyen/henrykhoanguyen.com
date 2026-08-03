<script lang="ts">
	/**
	 * Section headings rendered as shell commands: `$ ls ./projects`.
	 *
	 * This is the aesthetic's load-bearing device, so it stays consistent and
	 * does not spread into decoration elsewhere.
	 */
	let { command, id }: { command: string; id?: string } = $props();
</script>

<h2 {id} class="mt-12 mb-3 text-xs font-medium text-phosphor first:mt-0">
	<!-- Decorative. A screen reader should hear "ls ./projects", not "dollar sign". -->
	<span aria-hidden="true">$ </span>{command}
</h2>
