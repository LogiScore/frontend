<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api';
  
  let featuredCompanies: any[] = [];
  let isLoading = true;
  
  onMount(async () => {
    try {
      // Load up to 18 freight forwarders with random selection
      const companies = await apiClient.getFreightForwarders(18, true);
      featuredCompanies = companies;
    } catch (error) {
      console.error('Failed to load homepage data:', error);
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>LogiScore - Find the Best Freight Forwarders</title>
  <meta name="description" content="Discover top-rated freight forwarders through verified customer reviews. Make informed logistics decisions with LogiScore." />
</svelte:head>

<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>Find the Best Freight Forwarders</h1>
        <p class="hero-subtitle">Make informed logistics decisions with verified customer reviews and ratings</p>
        <div class="hero-actions">
          <a href="/search" class="btn btn-primary">Search Companies</a>
          <a href="/reviews" class="btn btn-secondary">Browse Reviews</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features">
    <div class="container">
      <h2>Why Choose LogiScore?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3>Verified Reviews</h3>
          <p>All reviews come from verified customers with real shipping experiences</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Detailed Ratings</h3>
          <p>Comprehensive ratings across service quality, reliability, and pricing</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>Easy Comparison</h3>
          <p>Compare multiple freight forwarders to find your perfect match</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💼</div>
          <h3>Business Focused</h3>
          <p>Built specifically for businesses making critical logistics decisions</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Companies Section -->
  <section class="featured-companies">
    <div class="container">
      <h2>Featured Freight Forwarders</h2>
      {#if isLoading}
        <div class="loading">Loading freight forwarders...</div>
      {:else if featuredCompanies.length > 0}
        <div class="companies-grid">
          {#each featuredCompanies as company}
            <a href="/freight-forwarder/{company.id}" class="company-card-link">
              <div class="company-card">
                <div class="company-logo">
                  {#if company.logo_url}
                    <img src={company.logo_url} alt="{company.name} logo" />
                  {:else}
                    <div class="logo-placeholder">{company.name.charAt(0)}</div>
                  {/if}
                </div>
                <div class="company-info">
                  {#if company.rating}
                    <div class="rating">
                      <span class="stars">{'★'.repeat(Math.round(company.rating))}</span>
                      <span class="rating-text">{company.rating.toFixed(1)}</span>
                    </div>
                  {/if}
                  {#if company.review_count}
                    <p class="review-count">{company.review_count} reviews</p>
                  {/if}
                </div>
              </div>
            </a>
          {/each}
        </div>
        <div class="text-center">
          <a href="/search" class="btn btn-outline">Search & Filter Companies</a>
        </div>
      {:else}
        <p class="no-data">No companies available at the moment.</p>
      {/if}
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta">
    <div class="container">
      <h2>Ready to Find Your Perfect Freight Forwarder?</h2>
      <p>Join thousands of businesses making better logistics decisions with LogiScore</p>
      <div class="cta-actions">
        <a href="/search" class="btn btn-primary">Start Searching</a>
        <a href="/how-it-works" class="btn btn-secondary">Learn How It Works</a>
      </div>
    </div>
  </section>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background: #ff6b35;
    color: white;
  }

  .btn-primary:hover {
    background: #e55a2b;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
  }

  .btn-secondary:hover {
    background: white;
    color: #667eea;
  }

  .btn-outline {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  .hero .btn {
    margin: 0 0.5rem;
  }

  .hero .btn:first-child {
    margin-left: 0;
  }

  .hero .btn:last-child {
    margin-right: 0;
  }

  /* Features Section */
  .features {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .feature-card p {
    color: #666;
    line-height: 1.6;
  }

  /* Featured Companies Section */
  .featured-companies {
    padding: 80px 0;
  }

  .featured-companies h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
  }

  .companies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .company-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: box-shadow 0.3s ease;
  }

  .company-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .company-card-link:hover .company-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .company-logo {
    margin-right: 1rem;
  }

  .company-logo img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }

  .logo-placeholder {
    width: 80px;
    height: 80px;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    border-radius: 8px;
  }

  .company-info h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .stars {
    color: #ffc107;
  }

  .rating-text {
    font-weight: 600;
    color: #333;
  }

  .review-count {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  /* CTA Section */
  .cta {
    padding: 80px 0;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    color: white;
    text-align: center;
  }

  .cta h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .cta p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .cta-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Utility Classes */
  .text-center {
    text-align: center;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .no-data {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-style: italic;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-content h1 {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }

    .features-grid,
    .companies-grid {
      grid-template-columns: 1fr;
    }

    .company-card {
      flex-direction: column;
      text-align: center;
    }

    .company-logo {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
</style>
