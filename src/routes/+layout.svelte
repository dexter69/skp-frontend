<script>
	import '../app.css';

	let { children } = $props();

	const navItems = [
		{
			label: 'Klienci',
			submenu: [{ label: 'Lista' }, { label: 'Dodaj' }]
		},
		{
			label: 'Handlowe',
			submenu: [{ label: 'Lista' }, { label: 'Dodaj' }]
		},
		{
			label: 'Produkcyjne',
			submenu: [{ label: 'Lista' }, { label: 'Dodaj' }]
		},
		{
			label: 'Przesyłki',
			submenu: [{ label: 'Lista' }, { label: 'Dodaj' }]
		},
		{
			label: 'Administracja',
			submenu: [{ label: 'Użytkownicy' }, { label: 'Uprawnienia' }]
		}
	];

	let openItem = $state(null);

	function toggleItem(label) {
		openItem = openItem === label ? null : label;
	}

	function closeAll() {
		openItem = null;
	}
</script>

<svelte:head>
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
</svelte:head>

<svelte:window on:click={closeAll} />

<div class="h-full flex flex-col">
	<div class="bg-nav-bg pb-32">
		<nav class="border-b border-nav-border bg-nav-bg">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="relative flex h-16 items-center justify-between border-b border-nav-border">

					<!-- Logo + Navigation -->
					<div class="flex items-center">
						<!-- Logo -->
						<div class="shrink-0">
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-7 text-text-on-dark">
								<path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
								<path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
							</svg>
						</div>

						<!-- Desktop Navigation -->
						<div class="ml-10">
							<div class="flex space-x-1">
								{#each navItems as item}
									{@const isOpen = openItem === item.label}
									<div class="relative">
										<button
											type="button"
											class="inline-flex items-center gap-x-1 rounded-md px-3 py-2 text-sm font-medium text-text-on-dark transition-colors
												{isOpen ? 'bg-nav-item-hover' : 'hover:bg-nav-item-hover'}"
											on:click|stopPropagation={() => toggleItem(item.label)}
										>
											{item.label}
											<svg viewBox="0 0 20 20" fill="currentColor" class="size-4 text-text-on-dark transition-transform {isOpen ? 'rotate-180' : ''}">
												<path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
											</svg>
										</button>

										{#if isOpen}
											<div class="absolute left-0 top-full z-10 mt-1 w-56 rounded-md bg-nav-item-hover shadow-lg outline-1 -outline-offset-1 outline-nav-border">
												<div class="py-1">
													{#each item.submenu as subItem}
														<a href="#" class="flex items-center px-4 py-2 text-sm text-text-on-dark hover:bg-nav-sub-hover transition-colors">
															{subItem.label}
														</a>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Right side -->
					<div class="ml-4 flex items-center gap-x-2">
						<!-- Notifications -->
						<button type="button" class="relative shrink-0 rounded-full p-1 text-text-muted hover:text-text-on-dark focus:outline-2 focus:outline-offset-2 focus:outline-border-focus transition-colors">
							<span class="sr-only">Powiadomienia</span>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-6">
								<path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>

						<!-- Avatar -->
						<div class="relative flex size-8 items-center justify-center rounded-full bg-accent text-white text-sm font-medium">
							<span>DG</span>
						</div>
					</div>

				</div>
			</div>
		</nav>
	</div>

	<main class="-mt-32 flex-1 overflow-hidden">
		<div class="mx-auto h-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
			<div class="h-full overflow-y-auto rounded-lg bg-bg-primary px-5 py-6 outline-1 -outline-offset-1 outline-border-default sm:px-6">
				{@render children()}
			</div>
		</div>
	</main>
</div>