<script lang="ts">
  import SubscriptionModal from '$lib/components/SubscriptionModal.svelte';
  import { auth } from '$lib/auth';
  import { getPlansForUserType } from '$lib/subscription-plans';
  import Header from '$lib/components/Header.svelte';

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
</script>

<svelte:head>
  <title>Pricing - LogiScore Plans & Features</title>
  <meta name="description" content="Choose the perfect LogiScore plan for your business. Free, Pro, and Enterprise plans available for shippers and freight forwarders." />
</svelte:head>

<Header />

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
          <div class="plan-card" class:featured={plan.isPopular}>
            {#if plan.isPopular}
              <div class="plan-badge">Most Popular</div>
            {/if}
            <div class="plan-header">
              <h3>{plan.name}</h3>
              <div class="price">
                <span class="amount">${plan.price}</span>
                <span class="period">/{plan.billingCycle}</span>
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
              {#if plan.name === 'Basic'}
                <button class="btn-secondary" on:click={openSubscriptionModal}>Get Started Free</button>
              {:else}
                <button class="btn-primary" on:click={openSubscriptionModal}>Start {plan.name} Trial</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Default plans for non-logged-in users -->
      <div class="plans-grid">
        <!-- Free Plan -->
        <div class="plan-card">
          <div class="plan-header">
            <h3>Free</h3>
            <div class="price">
              <span class="amount">$0</span>
              <span class="period">/month</span>
            </div>
            <p class="plan-description">Perfect for getting started</p>
          </div>
          
          <div class="plan-features">
            <ul>
              <li>✓ Search freight forwarders</li>
              <li>✓ Read basic reviews</li>
              <li>✓ Submit reviews</li>
              <li>✓ Basic company profiles</li>
              <li>✓ Email support</li>
            </ul>
          </div>
          
          <div class="plan-actions">
            <button class="btn-secondary" on:click={openSubscriptionModal}>Get Started Free</button>
          </div>
        </div>
        
        <!-- Pro Plan -->
        <div class="plan-card featured">
          <div class="plan-badge">Most Popular</div>
          <div class="plan-header">
            <h3>Pro</h3>
            <div class="price">
              <span class="amount">$99</span>
              <span class="period">/month</span>
            </div>
            <p class="plan-description">For serious shippers</p>
          </div>
          
          <div class="plan-features">
            <ul>
              <li>✓ Everything in Free</li>
              <li>✓ Detailed analytics</li>
              <li>✓ Branch-level reviews</li>
              <li>✓ Advanced search filters</li>
              <li>✓ Export reports</li>
              <li>✓ Priority support</li>
              <li>✓ Custom alerts</li>
            </ul>
          </div>
          
          <div class="plan-actions">
            <button class="btn-primary" on:click={openSubscriptionModal}>Start Pro Trial</button>
          </div>
        </div>
        
        <!-- Enterprise Plan -->
        <div class="plan-card">
          <div class="plan-header">
            <h3>Enterprise</h3>
            <div class="price">
              <span class="amount">$299</span>
              <span class="period">/month</span>
            </div>
            <p class="plan-description">For large organizations</p>
          </div>
          
          <div class="plan-features">
            <ul>
              <li>✓ Everything in Pro</li>
              <li>✓ API access</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ White-label reports</li>
              <li>✓ Advanced analytics</li>
              <li>✓ 24/7 phone support</li>
            </ul>
          </div>
          
          <div class="plan-actions">
            <button class="btn-secondary" on:click={openSubscriptionModal}>Contact Sales</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>



<!-- Plan Type Selection for Non-Logged-In Users -->
{#if !authState.user}
  <section class="plan-selection">
    <div class="container">
      <h2>Choose Your Plan Type</h2>
      <p class="section-subtitle">Select the plan type that matches your business needs</p>
      
      <div class="plan-type-grid">
        <div class="plan-type-card">
          <h3>Shipper Plans</h3>
          <p>Find and review freight forwarders to make informed shipping decisions.</p>
          <ul>
            <li>✓ Search freight forwarders</li>
            <li>✓ Read detailed reviews</li>
            <li>✓ Compare companies</li>
            <li>✓ Export reports</li>
          </ul>
          <button class="btn-primary" on:click={() => handlePlanSelection('shipper')}>View Shipper Plans</button>
        </div>
        
        <div class="plan-type-card">
          <h3>Freight Forwarder Plans</h3>
          <p>Monitor and improve your reputation on LogiScore.</p>
          <ul>
            <li>✓ Monitor your ratings</li>
            <li>✓ Respond to reviews</li>
            <li>✓ Detailed analytics</li>
            <li>✓ Reputation management</li>
          </ul>
          <button class="btn-primary" on:click={() => handlePlanSelection('forwarder')}>View Forwarder Plans</button>
        </div>
      </div>
    </div>
  </section>
{/if}

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

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Company</h3>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/press">Press</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Platform</h3>
        <ul>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/features">Features</a></li>
          <li><a href="/api">API</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Support</h3>
        <ul>
          <li><a href="/help">Help Center</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/guidelines">Guidelines</a></li>
          <li><a href="/contact-support">Contact Support</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Legal</h3>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
          <li><a href="/security">Security</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 LogiScore. All rights reserved.</p>
    </div>
  </div>
</footer>



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

  /* Header styles removed - now using Header component */

  .nav-menu ul {
    display: flex;
    list-style: none;
    gap: 30px;
    align-items: center;
  }

  .nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.3s;
  }

  .nav-menu a:hover {
    color: #667eea;
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1000px;
    margin: 0 auto;
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

  /* Forwarder Plans */
  .forwarder-plans {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .forwarder-plans h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 15px;
    color: #333;
  }

  .section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 50px;
  }

  .forwarder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;
    max-width: 800px;
    margin: 0 auto;
  }

  .forwarder-plan {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    text-align: center;
    position: relative;
  }

  .forwarder-plan.featured {
    border: 2px solid #667eea;
    transform: scale(1.05);
  }

  .forwarder-plan h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #333;
  }

  .forwarder-plan .price {
    margin-bottom: 30px;
  }

  .forwarder-plan ul {
    list-style: none;
    margin-bottom: 30px;
    text-align: left;
  }

  .forwarder-plan li {
    padding: 8px 0;
    color: #666;
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

  /* Footer */
  .footer {
    background: #333;
    color: white;
    padding: 60px 0 20px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section h3 {
    margin-bottom: 20px;
    color: #ffd700;
    font-weight: 600;
  }

  .footer-section ul {
    list-style: none;
  }

  .footer-section li {
    margin-bottom: 10px;
  }

  .footer-section a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.3s;
    font-weight: 400;
  }

  .footer-section a:hover {
    color: white;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #555;
    color: #ccc;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .plans-grid {
      grid-template-columns: 1fr;
    }

    .plan-card.featured {
      transform: none;
    }

    .forwarder-grid {
      grid-template-columns: 1fr;
    }

    .forwarder-plan.featured {
      transform: none;
    }

    .faq-grid {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
</style>

<!-- Subscription Modal -->
<SubscriptionModal 
  bind:isOpen={showSubscriptionModal}
  on:close={closeSubscriptionModal}
/> 