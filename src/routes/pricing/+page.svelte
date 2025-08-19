<script lang="ts">
  import SubscriptionModal from '$lib/components/SubscriptionModal.svelte';
  import { auth } from '$lib/auth';
  import { getPlansForUserType, getAllPlans } from '$lib/subscription-plans';

  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  // Get plans based on user type
  $: userPlans = authState.user ? getPlansForUserType(authState.user.user_type) : [];
  $: userType = authState.user?.user_type || 'shipper';

  // Get all plans for non-logged-in users
  $: allPlans = getAllPlans();

  // Subscription modal state
  let showSubscriptionModal = false;

  function openSubscriptionModal() {
    if (!authState.user) {
      // Redirect to sign in if not logged in
      window.location.href = '/';
      return;
    }
    showSubscriptionModal = true;
  }

  function closeSubscriptionModal() {
    showSubscriptionModal = false;
  }

  function handlePlanSelection(planType: 'shipper' | 'forwarder') {
    if (!authState.user) {
      // For non-logged-in users, show a message to sign up first
      alert('Please sign up or sign in to view subscription plans.');
      return;
    }
    openSubscriptionModal();
  }

  function redirectToSignIn() {
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>Pricing - LogiScore Plans & Features</title>
  <meta name="description" content="Choose the perfect LogiScore plan for your business. Free and subscription plans available for shippers and freight forwarders." />
</svelte:head>

<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">
        {#if authState.user}
          {userType === 'shipper' ? 'Shipper' : 'Freight Forwarder'} Pricing Plans
        {:else}
          Simple, Transparent Pricing
        {/if}
      </h1>
      <p class="hero-subtitle">
        {#if authState.user}
          Choose the perfect plan for your {userType === 'shipper' ? 'shipping' : 'freight forwarding'} business.
        {:else}
          Choose the plan that's right for your business. No hidden fees, no surprises.
        {/if}
      </p>
    </div>
  </div>
</section>

<!-- Pricing Plans -->
<section class="pricing">
  <div class="container">
    {#if authState.user}
      <!-- Personalized plans for logged-in user -->
      <div class="plans-grid">
        {#each userPlans as plan}
          <div class="plan-card" class:featured={plan.popular}>
            {#if plan.popular}
              <div class="plan-badge">Most Popular</div>
            {/if}
            <div class="plan-header">
              <h3>{plan.name}</h3>
              <div class="price">
                {#if plan.price === 0}
                  <span class="amount">Free</span>
                {:else}
                  <span class="amount">${plan.price}</span>
                  <span class="period">/{plan.billingCycle}</span>
                {/if}
              </div>
              <p class="plan-description">{plan.description}</p>
            </div>
            
            <div class="plan-features">
              <ul>
                {#each plan.features as feature}
                  <li>✓ {feature}</li>
                {/each}
              </ul>
            </div>
            
                            <div class="plan-actions">
                  {#if plan.price === 0}
                    <button class="btn-secondary" on:click={openSubscriptionModal}>Get Started Free</button>
                  {:else}
                    <button class="btn-primary" on:click={openSubscriptionModal}>Start {plan.name} Trial</button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <!-- Sign-in prompt for non-logged-in users -->
          <div class="signin-prompt">
            <div class="signin-content">
              <h2>Sign In to Subscribe</h2>
              <p>Please sign in or create an account to view personalized subscription plans and start your subscription.</p>
              <button class="btn-primary" on:click={redirectToSignIn}>Sign In / Sign Up</button>
            </div>
          </div>

          <!-- Default plans for non-logged-in users (view only) -->
          <div class="plans-grid">
            <!-- Shipper Plans -->
            <div class="plan-type-section">
              <h2 class="section-title">Shipper Plans</h2>
              <div class="plans-row">
                {#each allPlans.userPlans as plan}
                  <div class="plan-card" class:featured={plan.popular}>
                    {#if plan.popular}
                      <div class="plan-badge">Most Popular</div>
                    {/if}
                    <div class="plan-header">
                      <h3>{plan.name}</h3>
                      <div class="price">
                        {#if plan.price === 0}
                          <span class="amount">Free</span>
                        {:else}
                          <span class="amount">${plan.price}</span>
                          <span class="period">/{plan.billingCycle}</span>
                        {/if}
                      </div>
                      <p class="plan-description">{plan.description}</p>
                    </div>
                    
                    <div class="plan-features">
                      <ul>
                        {#each plan.features as feature}
                          <li>✓ {feature}</li>
                        {/each}
                      </ul>
                    </div>
                    
                    <div class="plan-actions">
                      {#if plan.price === 0}
                        <button class="btn-secondary" on:click={redirectToSignIn}>Sign In to Get Started</button>
                      {:else}
                        <button class="btn-primary" on:click={redirectToSignIn}>Sign In to Subscribe</button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>

        <!-- Freight Forwarder Plans -->
        <div class="plan-type-section">
          <h2 class="section-title">Freight Forwarder Plans</h2>
          <div class="plans-row">
            {#each allPlans.forwarderPlans as plan}
              <div class="plan-card" class:featured={plan.popular}>
                {#if plan.popular}
                  <div class="plan-badge">Most Popular</div>
                {/if}
                <div class="plan-header">
                  <h3>{plan.name}</h3>
                  <div class="price">
                    {#if plan.price === 0}
                      <span class="amount">Free</span>
                    {:else}
                      <span class="amount">${plan.price}</span>
                      <span class="period">/{plan.billingCycle}</span>
                    {/if}
                  </div>
                  <p class="plan-description">{plan.description}</p>
                </div>
                
                <div class="plan-features">
                  <ul>
                    {#each plan.features as feature}
                      <li>✓ {feature}</li>
                    {/each}
                  </ul>
                </div>
                
                <div class="plan-actions">
                  {#if plan.price === 0}
                    <button class="btn-secondary" on:click={openSubscriptionModal}>Get Started Free</button>
                  {:else}
                    <button class="btn-primary" on:click={openSubscriptionModal}>Start {plan.name} Trial</button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>





<!-- FAQ Section -->
<section class="faq">
  <div class="container">
    <h2>Frequently Asked Questions</h2>
    
    <div class="faq-grid">
      <div class="faq-item">
        <h3>Can I cancel anytime?</h3>
        <p>Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.</p>
      </div>
      
      <div class="faq-item">
        <h3>Is there a free trial?</h3>
        <p>Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.</p>
      </div>
      
      <div class="faq-item">
        <h3>What payment methods do you accept?</h3>
        <p>We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
      </div>
      
      <div class="faq-item">
        <h3>Do you offer discounts?</h3>
        <p>Yes, we offer discounts for annual subscriptions and enterprise customers. Contact us for details.</p>
      </div>
      
      <div class="faq-item">
        <h3>Can I upgrade or downgrade?</h3>
        <p>Yes, you can change your plan at any time. Changes take effect immediately.</p>
      </div>
      
      <div class="faq-item">
        <h3>What's included in support?</h3>
        <p>Free plan includes email support. Pro and Enterprise plans include priority support and dedicated assistance.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta">
  <div class="container">
    <div class="cta-content">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of businesses making informed logistics decisions.</p>
      <div class="cta-buttons">
        <a href="/search" class="btn-primary">Start Free Trial</a>
        <a href="/contact" class="btn-secondary">Contact Sales</a>
      </div>
    </div>
  </div>
</section>





<style>
  /* Global Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }



  .btn-primary {
    background: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary:hover {
    background: #5a6fd8;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
  }

  .btn-secondary:hover {
    background: #545b62;
  }



  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 100px 0;
    text-align: center;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.9;
  }

  /* Pricing Plans */
  .pricing {
    padding: 80px 0;
    background: white;
  }

  .plans-grid {
    display: flex;
    flex-direction: column;
    gap: 60px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .plan-type-section {
    text-align: center;
  }

  .section-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
    color: #333;
  }

  .plans-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    justify-content: center;
  }

  /* Sign-in Prompt */
  .signin-prompt {
    background: #f8f9fa;
    padding: 80px 0;
    text-align: center;
    margin-bottom: 80px;
  }

  .signin-content {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .signin-content h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #333;
  }

  .signin-content p {
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: #666;
  }

  .signin-content .btn-primary {
    padding: 15px 30px;
    font-size: 1.1rem;
  }

  .plan-card {
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    border: 2px solid #e9ecef;
    position: relative;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .plan-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }

  .plan-card.featured {
    border-color: #667eea;
    transform: scale(1.05);
  }

  .plan-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #667eea;
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .plan-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .plan-header h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #333;
  }

  .price {
    margin-bottom: 15px;
  }

  .amount {
    font-size: 3rem;
    font-weight: 800;
    color: #667eea;
  }

  .period {
    font-size: 1.1rem;
    color: #666;
  }



  .plan-description {
    color: #666;
    font-size: 1rem;
  }

  .plan-features ul {
    list-style: none;
    margin-bottom: 30px;
  }

  .plan-features li {
    padding: 10px 0;
    color: #666;
    border-bottom: 1px solid #f0f0f0;
  }

  .plan-features li:last-child {
    border-bottom: none;
  }

  .plan-actions {
    text-align: center;
  }

  /* Plan Selection for Non-Logged-In Users */
  .plan-selection {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .plan-selection h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 15px;
    color: #333;
  }

  .plan-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 40px;
    max-width: 900px;
    margin: 0 auto;
  }

  .plan-type-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s ease;
  }

  .plan-type-card:hover {
    transform: translateY(-5px);
  }

  .plan-type-card h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #333;
  }

  .plan-type-card p {
    color: #666;
    margin-bottom: 20px;
    font-size: 1.1rem;
  }

  .plan-type-card ul {
    list-style: none;
    margin-bottom: 30px;
    text-align: left;
  }

  .plan-type-card li {
    padding: 8px 0;
    color: #666;
    border-bottom: 1px solid #f0f0f0;
  }

  .plan-type-card li:last-child {
    border-bottom: none;
  }

  .section-title {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 15px;
    color: #333;
  }

  .plans-row {
    display: flex;
    gap: 30px;
    justify-content: center;
    flex-wrap: wrap;
  }



  /* FAQ Section */
  .faq {
    padding: 80px 0;
    background: white;
  }

  .faq h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }

  .faq-item {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 12px;
  }

  .faq-item h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #333;
  }

  .faq-item p {
    color: #666;
    line-height: 1.6;
  }

  /* CTA Section */
  .cta {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .cta h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .cta p {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .cta-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
  }



  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }

    .plans-row {
      grid-template-columns: 1fr;
    }
    
    .plan-card.featured {
      transform: none;
    }

    .faq-grid {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
</style>

<!-- Subscription Modal -->
<SubscriptionModal 
  bind:isOpen={showSubscriptionModal}
  userType={userType}
  on:close={closeSubscriptionModal}
/> 