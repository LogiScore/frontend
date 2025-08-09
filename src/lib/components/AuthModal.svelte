<script>
	export let isOpen = false;
	export let mode = 'login'; // 'login' or 'register'
	
	function closeModal() {
		isOpen = false;
	}
	
	function handleSubmit() {
		// Handle authentication logic
		console.log('Auth mode:', mode);
		closeModal();
	}
	
	function switchMode() {
		mode = mode === 'login' ? 'register' : 'login';
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal} role="dialog" aria-modal="true">
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
				<button class="close-button" on:click={closeModal} aria-label="Close modal">×</button>
			</div>
			
			<div class="modal-body">
				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-group">
						<label for="email">Email</label>
						<input type="email" id="email" required />
					</div>
					
					<div class="form-group">
						<label for="password">Password</label>
						<input type="password" id="password" required />
					</div>
					
					{#if mode === 'register'}
						<div class="form-group">
							<label for="confirmPassword">Confirm Password</label>
							<input type="password" id="confirmPassword" required />
						</div>
					{/if}
					
					<button type="submit" class="btn-primary">
						{mode === 'login' ? 'Sign In' : 'Create Account'}
					</button>
				</form>
			</div>
			
			<div class="modal-footer">
				<button class="btn-link" on:click={switchMode}>
					{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
				</button>
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
		max-width: 400px;
		width: 90%;
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
	
	.form-group {
		margin-bottom: 1rem;
	}
	
	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}
	
	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}
	
	.btn-primary {
		width: 100%;
		padding: 0.75rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 1rem;
	}
	
	.btn-primary:hover {
		background: #5a6fd8;
	}
	
	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #eee;
		text-align: center;
	}
	
	.btn-link {
		background: none;
		border: none;
		color: #667eea;
		cursor: pointer;
		text-decoration: underline;
		font-size: 0.9rem;
	}
	
	.btn-link:hover {
		color: #5a6fd8;
	}
</style>
