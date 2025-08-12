<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let searchQuery = '';
  let searchResults = [];
  let isLoading = false;
  let error = null;

  // Get search query from URL parameters
  $: {
    const urlParams = new URLSearchParams($page.url.search);
    searchQuery = urlParams.get('q') || '';
    if (searchQuery) {
      performSearch();
    }
  }

  async function performSearch() {
    if (!searchQuery.trim()) return;

    isLoading = true;
    error = null;

    try {
      const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/?search=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      searchResults = data.map(company => ({
        ...company,
        logo: company.logo_url || '/logo-placeholder.svg'
      }));
    } catch (err) {
      console.error('Error searching freight forwarders:', err);
      error = 'Failed to load search results';
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      const url = new URL(window.location);
      url.searchParams.set('q', searchQuery.trim());
      window.history.pushState({}, '', url);
      performSearch();
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<svelte:head>
  <title>Search Freight Forwarders - LogiScore</title>
  <meta name="description" content="Search and compare freight forwarders on LogiScore" />
</svelte:head>

<main>
  <section class="search-hero">
    <div class="container">
      <h1>Search Freight Forwarders</h1>
      <p>Find the perfect logistics partner for your business</p>
      
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search by company name..." 
          bind:value={searchQuery}
          on:keypress={handleKeyPress}
          class="search-input"
        />
        <button on:click={handleSearch} class="search-button">
          Search
        </button>
      </div>
    </div>
  </section>

  <section class="search-results">
    <div class="container">
      {#if isLoading}
        <div class="loading">
          <p>Searching...</p>
        </div>
      {:else if error}
        <div class="error">
          <p>{error}</p>
        </div>
      {:else if searchResults.length > 0}
        <h2>Search Results ({searchResults.length} companies found)</h2>
        <div class="results-grid">
          {#each searchResults as company}
            <div class="company-card">
              <div class="company-header">
                <div class="company-logo">
                  <img 
                    src={company.logo} 
                    alt="{company.name} logo" 
                    class="company-logo-img"
                    on:error={(e) => {
                      const target = e.target;
                      if (target && target instanceof HTMLImageElement) {
                        target.src = '/logo-placeholder.svg';
                      }
                    }}
                  />
                </div>
                <div class="company-info">
                  {#if company.headquarters_country}
                    <p class="company-headquarters">📍 {company.headquarters_country}</p>
                  {/if}
                </div>
              </div>
              {#if company.description}
                <p class="company-description preserve-linebreaks">{company.description}</p>
              {:else}
                <p class="company-description">
                  {company.name} provides comprehensive logistics and freight forwarding services worldwide.
                </p>
              {/if}
              <button class="view-details-btn">View Details</button>
            </div>
          {/each}
        </div>
      {:else if searchQuery}
        <div class="no-results">
          <h2>No results found</h2>
          <p>Try adjusting your search terms or browse all freight forwarders.</p>
        </div>
      {:else}
        <div class="search-prompt">
          <h2>Start Your Search</h2>
          <p>Enter a company name above to find freight forwarders.</p>
        </div>
      {/if}
    </div>
  </section>
</main>

<style>
  .search-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .search-hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .search-hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .search-box {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    gap: 1rem;
  }

  .search-input {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
  }

  .search-button {
    padding: 1rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
  }

  .search-button:hover {
    background: #5a6fd8;
  }

  .search-results {
    padding: 60px 0;
  }

  .search-results h2 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .company-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .company-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .company-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .company-logo {
    width: 60px;
    height: 60px;
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .company-info {
    flex: 1;
  }

  .company-headquarters {
    color: #555;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }

  .company-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .preserve-linebreaks {
    white-space: pre-line;
  }

  .view-details-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .view-details-btn:hover {
    background: #5a6fd8;
  }

  .loading, .error, .no-results, .search-prompt {
    text-align: center;
    padding: 60px 0;
  }

  .loading p, .error p, .no-results p, .search-prompt p {
    color: #666;
    font-size: 1.1rem;
  }

  .error p {
    color: #e74c3c;
  }

  @media (max-width: 768px) {
    .search-hero h1 {
      font-size: 2rem;
    }
    
    .search-box {
      flex-direction: column;
    }
    
    .results-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

