<script>
	let isMenuOpen = false;
	
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<header class="header">
	<div class="container">
		<div class="logo">
			<a href="/">LogiScore</a>
		</div>
		
		<nav class="nav-menu" class:open={isMenuOpen}>
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/search">Search</a></li>
				<li><a href="/pricing">Pricing</a></li>
				<li><a href="/help">Help</a></li>
				<li><a href="/about">About</a></li>
			</ul>
		</nav>
		
		<button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>
</header>

<style>
	.header {
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
	}
	
	.logo a {
		font-size: 1.5rem;
		font-weight: bold;
		color: #333;
		text-decoration: none;
	}
	
	.nav-menu ul {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 2rem;
	}
	
	.nav-menu a {
		color: #333;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}
	
	.nav-menu a:hover {
		color: #667eea;
	}
	
	.menu-toggle {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
	}
	
	.menu-toggle span {
		display: block;
		width: 25px;
		height: 3px;
		background: #333;
		margin: 5px 0;
		transition: 0.3s;
	}
	
	@media (max-width: 768px) {
		.nav-menu {
			display: none;
		}
		
		.nav-menu.open {
			display: block;
			position: absolute;
			top: 70px;
			left: 0;
			right: 0;
			background: white;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}
		
		.nav-menu.open ul {
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;
		}
		
		.menu-toggle {
			display: block;
		}
	}
</style>
