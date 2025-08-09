<script>
	export let isOpen = false;
	export let selectedPlan = null;
	
	function closeModal() {
		isOpen = false;
	}
	
	function handleSubscribe() {
		// Handle subscription logic
		console.log('Subscribing to plan:', selectedPlan);
		closeModal();
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal} role="dialog" aria-modal="true">
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Subscribe to {selectedPlan?.name || 'Plan'}</h2>
				<button class="close-button" on:click={closeModal} aria-label="Close modal">×</button>
			</div>
			
			<div class="modal-body">
				<p>You're about to subscribe to the {selectedPlan?.name || 'selected'} plan for ${selectedPlan?.price || 0}/month.</p>
				
				<div class="plan-details">
					<h3>Plan Features:</h3>
					<ul>
						<li>Access to freight forwarder reviews</li>
						<li>Advanced search capabilities</li>
						<li>Priority customer support</li>
					</ul>
				</div>
			</div>
			
			<div class="modal-footer">
				<button class="btn-secondary" on:click={closeModal}>Cancel</button>
				<button class="btn-primary" on:click={handleSubscribe}>Subscribe Now</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	
	.modal-content {
		background: white;
		border-radius: 8px;
		padding: 0;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #eee;
	}
	
	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
	}
	
	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.modal-body {
		padding: 1.5rem;
	}
	
	.plan-details {
		margin-top: 1rem;
	}
	
	.plan-details ul {
		list-style: none;
		padding: 0;
	}
	
	.plan-details li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.plan-details li:before {
		content: "✓";
		color: #4CAF50;
		font-weight: bold;
		margin-right: 0.5rem;
	}
	
	.modal-footer {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid #eee;
		justify-content: flex-end;
	}
	
	.btn-primary, .btn-secondary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}
	
	.btn-primary {
		background: #667eea;
		color: white;
	}
	
	.btn-secondary {
		background: #f8f9fa;
		color: #333;
		border: 1px solid #ddd;
	}
	
	.btn-primary:hover {
		background: #5a6fd8;
	}
	
	.btn-secondary:hover {
		background: #e9ecef;
	}
</style>
