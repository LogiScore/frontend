<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import AuthModal from '$lib/components/AuthModal.svelte';
  
  let searchQuery = '';
  let searchResults: any[] = [];
  let isLoading = false;
  let error = '';
  let selectedCompany: any = null;
  let showFilters = false;
  let showAuthModal = false;
  let authModalMode: 'signin' | 'signup' = 'signin';
  let filters = {
    location: '',
    minRating: 0,
    sortBy: 'name'
  };

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

  onMount(async () => {
    // Load initial freight forwarders
    await loadFreightForwarders();
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

  async function loadFreightForwarders() {
    try {
      isLoading = true;
      error = '';
      const results = await apiClient.getFreightForwarders();
      searchResults = results;
    } catch (err) {
      error = 'Failed to load freight forwarders';
      console.error('Error loading freight forwarders:', err);
    } finally {
      isLoading = false;
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      await loadFreightForwarders();
      return;
    }

    try {
      isLoading = true;
      error = '';
      const results = await apiClient.searchFreightForwarders(searchQuery);
      searchResults = results;
    } catch (err) {
      error = 'Search failed. Please try again.';
      console.error('Search error:', err);
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function selectCompany(company: any) {
    selectedCompany = company;
  }

  function clearFilters() {
    filters = {
      location: '',
      minRating: 0,
      sortBy: 'name'
    };
    loadFreightForwarders();
  }

  function getFilteredResults() {
    let filtered = [...searchResults];

    if (filters.location) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(filters.location.toLowerCase()) ||
        (company.website && company.website.toLowerCase().includes(filters.location.toLowerCase()))
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(company => 
        company.rating && company.rating >= filters.minRating
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return (b.review_count || 0) - (a.review_count || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }
</script>

<svelte:head>
  <title>Search Freight Forwarders - LogiScore</title>
  <meta name="description" content="Search and compare freight forwarders worldwide. Find the perfect logistics partner for your business." />
</svelte:head>

<!-- Navigation Header -->
<header class="header">
  <div class="container">
    <nav class="nav">
      <div class="nav-brand">
        <a href="/" class="logo-container">
          <img src="/logo.png" alt="LogiScore" class="logo" />
        </a>
      </div>
      
      <div class="nav-menu">
        <a href="/search" class="nav-link active">Search</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/how-it-works" class="nav-link">How It Works</a>
        <a href="/pricing" class="nav-link">Pricing</a>
        <a href="/help" class="nav-link">Help</a>
        <a href="/contact" class="nav-link">Contact</a>
      </div>
      
      <div class="nav-actions">
        {#if authState.user}
          <div class="user-menu">
            <span class="username">Welcome, {authState.user.username}</span>
            <button class="btn-secondary" on:click={handleLogout}>Sign Out</button>
          </div>
        {:else}
          <button class="btn-secondary" on:click={openSignInModal}>Sign In</button>
          <button class="btn-primary" on:click={openSignUpModal}>Sign Up</button>
        {/if}
      </div>
    </nav>
  </div>
</header>

<!-- Search Section -->
<section class="search-section">
  <div class="container">
    <h1 class="search-title">Find Your Perfect Freight Forwarder</h1>
    <p class="search-subtitle">Search and compare logistics companies worldwide</p>
    
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
      
      <button class="filter-toggle" on:click={() => showFilters = !showFilters}>
        {showFilters ? 'Hide' : 'Show'} Filters
      </button>
    </div>

    <!-- Filters -->
    {#if showFilters}
      <div class="filters">
        <div class="filter-group">
          <label for="location">Location</label>
          <input 
            type="text" 
            id="location"
            bind:value={filters.location}
            placeholder="Filter by location"
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label for="minRating">Minimum Rating</label>
          <select bind:value={filters.minRating} class="filter-select">
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={2}>2+ Stars</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="sortBy">Sort By</label>
          <select bind:value={filters.sortBy} class="filter-select">
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>
        
        <button class="clear-filters" on:click={clearFilters}>
          Clear Filters
        </button>
      </div>
    {/if}
  </div>
</section>

<!-- Results Section -->
<section class="results-section">
  <div class="container">
    {#if error}
      <div class="error-message">
        <p>{error}</p>
        <button on:click={loadFreightForwarders} class="btn-primary">Try Again</button>
      </div>
    {:else if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Searching freight forwarders...</p>
      </div>
    {:else}
      <div class="results-header">
        <h2>Found {getFilteredResults().length} freight forwarders</h2>
        {#if searchQuery}
          <p>Results for "{searchQuery}"</p>
        {/if}
      </div>
      
      <div class="results-grid">
        {#each getFilteredResults() as company}
          <div class="company-card" on:click={() => selectCompany(company)}>
            <div class="company-header">
              <div class="company-logo">
                <img src={company.logo_url || '/default-logo.png'} alt="{company.name} logo" />
              </div>
              <div class="company-info">
                <h3 class="company-name">{company.name}</h3>
                {#if company.rating}
                  <div class="company-rating">
                    <div class="stars">
                      {#each Array(5) as _, i}
                        <span class="star {i < Math.floor(company.rating) ? 'filled' : ''}">★</span>
                      {/each}
                    </div>
                    <span class="rating-text">{company.rating} ({company.review_count || 0} reviews)</span>
                  </div>
                {/if}
              </div>
            </div>
            
            {#if company.website}
              <div class="company-website">
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            {/if}
            
            <div class="company-actions">
              <button class="view-details-btn">View Details</button>
              <button class="write-review-btn">Write Review</button>
            </div>
          </div>
        {/each}
      </div>
      
      {#if getFilteredResults().length === 0}
        <div class="no-results">
          <h3>No freight forwarders found</h3>
          <p>Try adjusting your search terms or filters</p>
          <button on:click={loadFreightForwarders} class="btn-primary">Show All Companies</button>
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Company Details Modal -->
{#if selectedCompany}
  <div class="modal-overlay" on:click={() => selectedCompany = null}>
    <div class="modal-content" on:click|stopPropagation>
      <button class="modal-close" on:click={() => selectedCompany = null}>×</button>
      
      <div class="company-details">
        <div class="company-header">
          <img src={selectedCompany.logo_url || '/default-logo.png'} alt="{selectedCompany.name} logo" class="company-logo-large" />
          <div class="company-info">
            <h2>{selectedCompany.name}</h2>
            {#if selectedCompany.rating}
              <div class="rating">
                <div class="stars">
                  {#each Array(5) as _, i}
                    <span class="star {i < Math.floor(selectedCompany.rating) ? 'filled' : ''}">★</span>
                  {/each}
                </div>
                <span>{selectedCompany.rating} ({selectedCompany.review_count || 0} reviews)</span>
              </div>
            {/if}
          </div>
        </div>
        
        {#if selectedCompany.website}
          <div class="company-website">
            <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" class="btn-primary">
              Visit Website
            </a>
          </div>
        {/if}
        
        <div class="company-actions">
          <button class="btn-primary">Write a Review</button>
          <button class="btn-secondary">Compare</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Auth Modal -->
<AuthModal 
  bind:isOpen={showAuthModal}
  defaultMode={authModalMode}
  on:close={closeAuthModal}
/>

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

  .nav-link.active {
    color: #667eea;
    font-weight: 600;
  }

  .nav-actions {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .username {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
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

  /* Search Section */
  .search-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 0;
    text-align: center;
  }

  .search-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .search-subtitle {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .search-container {
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-box {
    display: flex;
    max-width: 500px;
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

  .filter-toggle {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
  }

  .filter-toggle:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Filters */
  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-group label {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .filter-input, .filter-select {
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    color: #333;
  }

  .clear-filters {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    align-self: end;
  }

  /* Results Section */
  .results-section {
    padding: 60px 0;
    background: #f8f9fa;
  }

  .results-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .results-header h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 10px;
  }

  .results-header p {
    color: #666;
    font-size: 1.1rem;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
  }

  .company-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
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

  .company-website {
    margin-bottom: 20px;
  }

  .company-website a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .company-actions {
    display: flex;
    gap: 10px;
  }

  .view-details-btn, .write-review-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
  }

  .view-details-btn {
    background: #667eea;
    color: white;
  }

  .write-review-btn {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
  }

  .view-details-btn:hover {
    background: #5a6fd8;
  }

  .write-review-btn:hover {
    background: #e9ecef;
  }

  /* Loading and Error States */
  .loading, .error-message, .no-results {
    text-align: center;
    padding: 60px 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Modal */
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
    border-radius: 12px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
  }

  .company-logo-large {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-right: 20px;
  }

  .company-details .company-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }

  .company-details h2 {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .company-details .company-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
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

    .search-title {
      font-size: 2rem;
    }

    .search-container {
      flex-direction: column;
    }

    .filters {
      grid-template-columns: 1fr;
    }

    .results-grid {
      grid-template-columns: 1fr;
    }

    .company-actions {
      flex-direction: column;
    }
  }
</style> 