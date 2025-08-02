<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import AuthModal from '$lib/components/AuthModal.svelte';
  import ChangePasswordModal from '$lib/components/ChangePasswordModal.svelte';
  import SubscriptionModal from '$lib/components/SubscriptionModal.svelte';
  import ProfileModal from '$lib/components/ProfileModal.svelte';
  
  let searchQuery = '';
  let showAuthModal = false;
  let authModalMode: 'signin' | 'signup' = 'signin';
  let showChangePasswordModal = false;
  let showSubscriptionModal = false;
  let showUserDropdown = false;
  let showProfileModal = false;
  
  let featuredCompanies = [
    {
      name: 'DHL Supply Chain',
      rating: 4.8,
      reviews: 156,
      logo: 'https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg',
      description: 'Global logistics leader with comprehensive supply chain solutions'
    },
    {
      name: 'Kuehne + Nagel',
      rating: 4.7,
      reviews: 142,
      logo: 'https://www.kuehne-nagel.com/-/media/kn/website/header/logo.svg',
      description: 'International logistics company with extensive global network'
    },
    {
      name: 'DB Schenker',
      rating: 4.6,
      reviews: 128,
      logo: 'https://www.dbschenker.com/logo.svg',
      description: 'Reliable global logistics provider with innovative solutions'
    }
  ];

  let testimonials = [
    {
      name: 'Sarah Chen',
      company: 'Global Imports Ltd',
      text: 'LogiScore helped us find a reliable freight forwarder that saved us 30% on shipping costs. The reviews were spot-on!',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      company: 'TechExports Inc',
      text: 'Finally, a platform that gives us real insights into freight forwarders. The detailed reviews helped us make the right choice.',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      company: 'European Logistics',
      text: 'As a freight forwarder, LogiScore has helped us showcase our strengths and improve our services based on customer feedback.',
      rating: 5
    }
  ];

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

  onMount(() => {
    // Check if user is already authenticated
    if (authState.token) {
      auth.getCurrentUser().catch(error => {
        console.error('Failed to get current user:', error);
      });
    }
    
    // Add click outside handler for dropdown
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  function openSignInModal() {
    authModalMode = 'signin';
    showAuthModal = true;
  }

  function openSignUpModal() {
    authModalMode = 'signup';
    showAuthModal = true;
  }

  function closeAuthModal() {
    showAuthModal = false;
  }

  function handleLogout() {
    auth.logout();
  }

  function openChangePasswordModal() {
    showChangePasswordModal = true;
  }

  function closeChangePasswordModal() {
    showChangePasswordModal = false;
  }

  function openSubscriptionModal() {
    showSubscriptionModal = true;
  }

  function closeSubscriptionModal() {
    showSubscriptionModal = false;
  }

  function openProfileModal() {
    showProfileModal = true;
    showUserDropdown = false; // Close dropdown when opening modal
  }

  function closeProfileModal() {
    showProfileModal = false;
  }

  function closeUserDropdown() {
    showUserDropdown = false;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      showUserDropdown = false;
    }
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality with backend
      console.log('Searching for:', searchQuery);
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<svelte:head>
  <title>LogiScore - Find and Review Freight Forwarders</title>
  <meta name="description" content="Discover, compare, and review freight forwarders worldwide. Make informed decisions with real user ratings and detailed reviews." />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Navigation Header -->
<header class="header">
  <div class="container">
    <nav class="nav">
      <div class="nav-brand">
        <div class="logo-container">
          <img src="/logo.png" alt="LogiScore" class="logo" />
        </div>
      </div>
      
      <div class="nav-menu">
        <a href="/search" class="nav-link">Search</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/how-it-works" class="nav-link">How It Works</a>
        <a href="/pricing" class="nav-link">Pricing</a>
        <a href="/help" class="nav-link">Help</a>
        <a href="/contact" class="nav-link">Contact</a>
      </div>
      
      <div class="nav-actions">
        {#if authState.user}
          <div class="user-dropdown" class:open={showUserDropdown}>
            <button class="user-dropdown-toggle" on:click={() => showUserDropdown = !showUserDropdown}>
              <span class="username">{authState.user.username}</span>
              <span class="status-badge" class:premium={authState.user.subscription_tier !== 'free'}>
                {authState.user.subscription_tier === 'free' ? 'Free' : authState.user.subscription_tier}
              </span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
            
            <div class="user-dropdown-menu">
              <div class="dropdown-header">
                <div class="user-info">
                  <span class="user-name">{authState.user.full_name || authState.user.username}</span>
                  <span class="user-email">{authState.user.email}</span>
                </div>
                <div class="subscription-info">
                  <span class="subscription-label">Plan:</span>
                  <span class="subscription-value" class:premium={authState.user.subscription_tier !== 'free'}>
                    {authState.user.subscription_tier === 'free' ? 'Free Plan' : authState.user.subscription_tier}
                  </span>
                </div>
              </div>
              
              <div class="dropdown-actions">
                <button class="dropdown-item" on:click={openProfileModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  View Profile
                </button>
                <button class="dropdown-item" on:click={openSubscriptionModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Upgrade Subscription
                </button>
                <button class="dropdown-item" on:click={openChangePasswordModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Change Password
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" on:click={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        {:else}
          <button class="btn-secondary" on:click={openSignInModal}>Sign In</button>
          <button class="btn-primary" on:click={openSignUpModal}>Sign Up</button>
        {/if}
      </div>
    </nav>
  </div>
</header>

<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">
        Find the Perfect 
        <span class="highlight">Freight Forwarder</span>
      </h1>
      <p class="hero-subtitle">
        Discover, compare, and review freight forwarders worldwide. 
        Make informed decisions with real user ratings and detailed reviews.
      </p>
      
      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search freight forwarders, companies, or locations..."
            bind:value={searchQuery}
            on:keypress={handleKeyPress}
            class="search-input"
          />
          <button on:click={handleSearch} class="search-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">500+</span>
          <span class="stat-label">Companies</span>
        </div>
        <div class="stat">
          <span class="stat-number">10K+</span>
          <span class="stat-label">Reviews</span>
        </div>
        <div class="stat">
          <span class="stat-number">50+</span>
          <span class="stat-label">Countries</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Ad Space 1 -->
<section class="ad-space">
  <div class="container">
    <div class="ad-banner">
      <div class="ad-content">
        <h3>Premium Freight Forwarder Spotlight</h3>
        <p>Featured placement for top-rated logistics companies</p>
      </div>
      <div class="ad-cta">
        <button class="ad-button">Learn More</button>
      </div>
    </div>
  </div>
</section>

<!-- Featured Companies -->
<section class="featured">
  <div class="container">
    <h2 class="section-title">Top Rated Freight Forwarders</h2>
    <div class="companies-grid">
      {#each featuredCompanies as company}
        <div class="company-card">
          <div class="company-header">
            <div class="company-logo">
              <img src={company.logo} alt="{company.name} logo" />
            </div>
            <div class="company-info">
              <h3 class="company-name">{company.name}</h3>
              <div class="company-rating">
                <div class="stars">
                  {#each Array(5) as _, i}
                    <span class="star {i < Math.floor(company.rating) ? 'filled' : ''}">★</span>
                  {/each}
                </div>
                <span class="rating-text">{company.rating} ({company.reviews} reviews)</span>
              </div>
            </div>
          </div>
          <p class="company-description">{company.description}</p>
          <button class="view-details-btn">View Details</button>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Ad Space 2 -->
<section class="ad-space">
  <div class="container">
    <div class="ad-banner">
      <div class="ad-content">
        <h3>Get Your Company Featured</h3>
        <p>Boost your visibility with premium placement and enhanced profiles</p>
      </div>
      <div class="ad-cta">
        <button class="ad-button">Contact Sales</button>
      </div>
    </div>
  </div>
</section>

<!-- How It Works -->
<section class="how-it-works">
  <div class="container">
    <h2 class="section-title">How LogiScore Works</h2>
    <div class="steps-grid">
      <div class="step">
        <div class="step-number">1</div>
        <h3>Search & Discover</h3>
        <p>Find freight forwarders by name, location, or service type. Browse detailed company profiles and ratings.</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <h3>Compare & Evaluate</h3>
        <p>Compare companies side-by-side. Read detailed reviews and ratings from real customers.</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <h3>Review & Share</h3>
        <p>Share your experience by leaving reviews and ratings. Help others make informed decisions.</p>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="testimonials">
  <div class="container">
    <h2 class="section-title">What Our Users Say</h2>
    <div class="testimonials-grid">
      {#each testimonials as testimonial}
        <div class="testimonial-card">
          <div class="testimonial-stars">
            {#each Array(5) as _, i}
              <span class="star {i < testimonial.rating ? 'filled' : ''}">★</span>
            {/each}
          </div>
          <p class="testimonial-text">"{testimonial.text}"</p>
          <div class="testimonial-author">
            <strong>{testimonial.name}</strong>
            <span class="testimonial-company">{testimonial.company}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Ad Space 3 -->
<section class="ad-space">
  <div class="container">
    <div class="ad-banner">
      <div class="ad-content">
        <h3>Pro Plan Benefits</h3>
        <p>Unlock detailed analytics, custom reports, and priority support</p>
      </div>
      <div class="ad-cta">
        <button class="ad-button">Upgrade Now</button>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta">
  <div class="container">
    <div class="cta-content">
      <h2>Ready to Find Your Perfect Freight Forwarder?</h2>
      <p>Join thousands of businesses making informed logistics decisions.</p>
      <div class="cta-buttons">
        <button class="btn-primary">Start Searching</button>
        <button class="btn-secondary">Write a Review</button>
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
    font-weight: 400;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Header Navigation */
  .header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
  }

  .nav-brand {
    display: flex;
    align-items: center;
  }

  .logo-container {
    background-color: white;   /* Force white background behind logo */
    display: inline-block;
    padding: 4px;              /* Optional spacing */
  }
  
  .logo-container img {
    display: block;
  }
  
  .logo {
    height: 50px;
    width: auto;
    background: white !important;
    border-radius: 4px;
    padding: 4px;
    filter: brightness(1.1) contrast(1.1);
  }

  .nav-menu {
    display: flex;
    gap: 30px;
  }

  .nav-link {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.3s;
  }

  .nav-link:hover {
    color: #667eea;
  }

  .nav-actions {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .username {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
  }

  .subscription-status {
    margin: 0 10px;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #e3f2fd;
    color: #1976d2;
  }

  .status-badge.premium {
    background: #fff3e0;
    color: #f57c00;
  }

  /* User Dropdown */
  .user-dropdown {
    position: relative;
  }

  .user-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .user-dropdown-toggle:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dropdown-arrow {
    transition: transform 0.2s;
  }

  .user-dropdown.open .dropdown-arrow {
    transform: rotate(180deg);
  }

  .user-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    min-width: 280px;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
  }

  .user-dropdown.open .user-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .dropdown-header {
    padding: 16px;
    border-bottom: 1px solid #f1f3f4;
    background: #f8f9fa;
  }

  .user-info {
    margin-bottom: 8px;
  }

  .user-name {
    display: block;
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
  }

  .user-email {
    display: block;
    color: #666;
    font-size: 0.85rem;
  }

  .subscription-info {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .subscription-label {
    font-size: 0.8rem;
    color: #666;
  }

  .subscription-value {
    font-size: 0.8rem;
    font-weight: 600;
    color: #1976d2;
  }

  .subscription-value.premium {
    color: #f57c00;
  }

  .dropdown-actions {
    padding: 8px 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .dropdown-item:hover {
    background: #f8f9fa;
  }

  .dropdown-item svg {
    color: #666;
  }

  .dropdown-divider {
    height: 1px;
    background: #e9ecef;
    margin: 8px 0;
  }

  .dropdown-item.logout {
    color: #dc3545;
  }

  .dropdown-item.logout svg {
    color: #dc3545;
  }

  .dropdown-item.logout:hover {
    background: #fff5f5;
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .highlight {
    color: #ffd700;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 40px;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    font-weight: 400;
  }

  /* Search Box */
  .search-container {
    margin-bottom: 40px;
  }

  .search-box {
    display: flex;
    max-width: 500px;
    margin: 0 auto;
    background: white;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .search-input {
    flex: 1;
    padding: 20px 25px;
    border: none;
    outline: none;
    font-size: 1.1rem;
    font-family: 'Roboto', sans-serif;
  }

  .search-button {
    background: #667eea;
    color: white;
    border: none;
    padding: 20px 25px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .search-button:hover {
    background: #5a6fd8;
  }

  /* Stats */
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin-top: 40px;
  }

  .stat {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    color: #ffd700;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: 500;
  }

  /* Ad Space */
  .ad-space {
    padding: 40px 0;
    background: #f8f9fa;
  }

  .ad-banner {
    background: white;
    border-radius: 12px;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    border: 2px solid #e9ecef;
  }

  .ad-content h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  .ad-content p {
    color: #666;
    font-size: 1rem;
  }

  .ad-button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: background 0.3s;
  }

  .ad-button:hover {
    background: #5a6fd8;
  }

  /* Featured Companies */
  .featured {
    padding: 80px 0;
    background: white;
  }

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #333;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .companies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }

  .company-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid #e9ecef;
  }

  .company-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }

  .company-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .company-logo {
    width: 60px;
    height: 60px;
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-logo img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .company-name {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .company-rating {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    color: #ddd;
    font-size: 1.1rem;
  }

  .star.filled {
    color: #ffd700;
  }

  .rating-text {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  .company-description {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .view-details-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
  }

  .view-details-btn:hover {
    background: #5a6fd8;
  }

  /* How It Works */
  .how-it-works {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    margin-top: 50px;
  }

  .step {
    text-align: center;
    padding: 30px;
  }

  .step-number {
    width: 60px;
    height: 60px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto 20px;
  }

  .step h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #333;
    font-weight: 600;
  }

  .step p {
    color: #666;
    line-height: 1.6;
  }

  /* Testimonials */
  .testimonials {
    padding: 80px 0;
    background: white;
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .testimonial-card {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    border: 1px solid #e9ecef;
  }

  .testimonial-stars {
    margin-bottom: 15px;
  }

  .testimonial-text {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 20px;
    color: #333;
    font-style: italic;
  }

  .testimonial-author {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .testimonial-company {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
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
    letter-spacing: -0.02em;
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

  .btn-primary, .btn-secondary {
    padding: 15px 30px;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    font-family: 'Roboto', sans-serif;
  }

  .btn-primary {
    background: #ffd700;
    color: #333;
  }

  .btn-primary:hover {
    background: #e6c200;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: #ffffff !important;
    color: #333 !important;
    border: 2px solid #333 !important;
    font-weight: 600 !important;
    padding: 10px 20px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    cursor: pointer !important;
    display: inline-block !important;
    text-decoration: none !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    opacity: 1 !important;
    visibility: visible !important;
    position: relative !important;
    z-index: 10 !important;
  }

  .btn-secondary:hover {
    background: #333;
    color: white;
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

    .hero-stats {
      flex-direction: column;
      gap: 30px;
    }

    .companies-grid {
      grid-template-columns: 1fr;
    }

    .steps-grid {
      grid-template-columns: 1fr;
    }

    .testimonials-grid {
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

    .ad-banner {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }
  }
</style>

<!-- Auth Modal -->
<AuthModal 
  bind:isOpen={showAuthModal}
  defaultMode={authModalMode}
  on:close={closeAuthModal}
/>

<!-- Change Password Modal -->
<ChangePasswordModal 
  bind:isOpen={showChangePasswordModal}
  on:close={closeChangePasswordModal}
/>

<!-- Subscription Modal -->
<SubscriptionModal 
  bind:isOpen={showSubscriptionModal}
  on:close={closeSubscriptionModal}
/>

<!-- Profile Modal -->
<ProfileModal 
  bind:isOpen={showProfileModal}
  on:close={closeProfileModal}
/>
