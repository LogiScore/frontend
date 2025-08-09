<script>
	import PaymentModal from '$lib/components/PaymentModal.svelte';
	
	let showPaymentModal = false;
	let selectedPlan = {
		id: 1,
		name: 'Basic Plan',
		price: 9.99,
		description: 'Basic freight forwarder reviews'
	};
</script>

<svelte:head>
	<title>LogiScore - Freight Forwarder Reviews</title>
	<meta name="description" content="Find and review the best freight forwarders" />
</svelte:head>

<main>
	<h1>Welcome to LogiScore</h1>
	<p>Find and review the best freight forwarders</p>
	
	<button on:click={() => showPaymentModal = true}>
		Subscribe to Basic Plan
	</button>
</main>

<PaymentModal 
	bind:isOpen={showPaymentModal} 
	{selectedPlan}
	on:close={() => showPaymentModal = false}
/>

<style>
	main {
		padding: 2rem;
		text-align: center;
	}
	
	h1 {
		color: #333;
		margin-bottom: 1rem;
	}
	
	button {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
	}
	
	button:hover {
		background: #2563eb;
	}
</style>
