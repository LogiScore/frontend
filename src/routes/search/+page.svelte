<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/auth';
  import { apiClient } from '$lib/api';
  import type { FreightForwarder, Location } from '$lib/api';

  let searchType: 'company' | 'country' | 'location' = 'company';
  let companyQuery = '';
  let countryQuery = '';
  let locationQuery = '';
  let searchResults: FreightForwarder[] = [];
  let locationsWithReviews: Location[] = [];
  let locationSuggestions: Location[] = [];
  let showLocationSuggestions = false;
  let isLoading = false;
  let error: string | null = null;
  let showSubscriptionPrompt = false;
  let user: any = null;
  let userSubscription = 'free';
  let allLocations: Location[] = [];
  let selectedLocation: Location | null = null;
  let companiesForLocation: FreightForwarder[] = [];
  let citiesWithReviews: string[] = [];
  let selectedCountry: string = '';
  let selectedCity: string = '';

  // Get search query from URL parameters
  $: {
    const urlParams = new URLSearchParams($page.url.search);
    const query = urlParams.get('q') || '';
    let type = urlParams.get('type') || 'company';
    
    // Force company search for non-subscribed users
    if ((type === 'country' || type === 'location') && !canSearchByCountry()) {
      type = 'company';
      // Update URL to reflect the change
      const url = new URL(window.location.href);
      url.searchParams.set('type', 'company');
      window.history.replaceState({}, '', url.toString());
    }
    
    searchType = type as 'company' | 'country' | 'location';
    if (type === 'company') {
      companyQuery = query;
    } else if (type === 'country') {
      countryQuery = query;
    } else {
      locationQuery = query;
    }
    
    if (query) {
      performSearch();
    }
  }

  onMount(() => {
    // Subscribe to auth store to get user info
    const unsubscribe = auth.subscribe(state => {
      user = state.user;
      userSubscription = state.user?.subscription_tier || 'free';
    });
    

    
    return unsubscribe;
  });

  function canSearchByCountry(): boolean {
    // Only paid subscribers can search by country
    console.log('canSearchByCountry called:', { userSubscription, result: userSubscription !== 'free' });
    return userSubscription !== 'free';
  }

  function canSearchByCompany(): boolean {
    // All users can search by company
    return true;
  }

  async function handleLocationSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    locationQuery = query;
    
    if (query.length < 3) {
      locationSuggestions = [];
      showLocationSuggestions = false;
      return;
    }

    try {
      // Try backend search first
      const searchResults = await apiClient.searchLocations(query);
      const filtered = searchResults.slice(0, 15);
      
      locationSuggestions = filtered;
      showLocationSuggestions = true;
    } catch (error) {
      console.error('Location search failed, falling back to client-side filtering:', error);
      
      // Fallback to client-side filtering if backend search fails
      const filtered = allLocations.filter(location => {
        const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedName = (location.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedCity = (location.city || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedState = (location.state || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedCountry = (location.country || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        
        const nameMatch = normalizedName.includes(normalizedQuery);
        const cityMatch = normalizedCity.includes(normalizedQuery);
        const stateMatch = normalizedState.includes(normalizedQuery);
        const countryMatch = normalizedCountry.includes(normalizedQuery);
        
        const exactNameMatch = location.name && location.name.toLowerCase().includes(query);
        const exactCityMatch = location.city && location.city.toLowerCase().includes(query);
        const exactStateMatch = location.state && location.state.toLowerCase().includes(query);
        const exactCountryMatch = location.country && location.country.toLowerCase().includes(query);
        
        return nameMatch || cityMatch || stateMatch || countryMatch || 
               exactNameMatch || exactCityMatch || exactStateMatch || exactCountryMatch;
      }).slice(0, 15);
      
      locationSuggestions = filtered;
      showLocationSuggestions = true;
    }
  }

  function selectLocation(location: Location) {
    locationQuery = location.name;
    showLocationSuggestions = false;
    performSearch();
  }

  function hideLocationSuggestions() {
    setTimeout(() => {
      showLocationSuggestions = false;
    }, 200);
  }

  async function selectLocationFromCountry(location: Location) {
    selectedLocation = location;
    isLoading = true;
    error = null;
    
    try {
      // Get reviews for this specific location
      const reviews = await apiClient.getReviewsByLocation(location.id);
      
      if (reviews.length === 0) {
        companiesForLocation = [];
        searchResults = [];
        error = 'No reviews found for this location';
        return;
      }
      
      // Extract unique freight forwarder IDs from the reviews
      const freightForwarderIds = [...new Set(reviews.map(review => review.freight_forwarder_id))];
      
      // Get company details for each freight forwarder that has reviews at this location
      const companiesPromises = freightForwarderIds.map(async (id) => {
        try {
          const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/aggregated/?search=${id}&limit=1`);
          if (response.ok) {
            const data = await response.json();
            return data[0];
          }
        } catch (error) {
          console.error(`Failed to fetch company ${id}:`, error);
        }
        return null;
      });
      
      const companies = await Promise.all(companiesPromises);
      companiesForLocation = companies.filter(company => company !== null);
      searchResults = companiesForLocation;
      
    } catch (err: any) {
      console.error('Error fetching companies for location:', err);
      error = 'Failed to load companies for this location';
      companiesForLocation = [];
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  function goBackToLocations() {
    selectedLocation = null;
    companiesForLocation = [];
    searchResults = [];
  }

  async function selectCity(city: string) {
    selectedCity = city;
    isLoading = true;
    error = null;
    
    try {
      // Get companies that have reviews in this city
      // We'll need to get reviews by city and then extract company IDs
      const reviews = await apiClient.getReviewsByCity(city, selectedCountry);
      
      if (reviews.length === 0) {
        companiesForLocation = [];
        searchResults = [];
        return;
      }
      
      // Extract unique freight forwarder IDs from reviews
      const companyIds = [...new Set(reviews.map(review => review.freight_forwarder_id))];
      
      // Get company details for each ID
      const companies = [];
      for (const companyId of companyIds) {
        try {
          const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/aggregated/?id=${companyId}`);
          if (response.ok) {
            const companyData = await response.json();
            if (companyData && companyData.length > 0) {
              companies.push(companyData[0]);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch company ${companyId}:`, err);
        }
      }
      
      companiesForLocation = companies;
      searchResults = companies;
      
    } catch (err: any) {
      console.error('Error fetching companies for city:', err);
      error = 'Failed to load companies for this city';
      companiesForLocation = [];
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  function goBackToCities() {
    selectedCity = '';
    companiesForLocation = [];
    searchResults = [];
  }

  async function performSearch() {
    const query = searchType === 'company' ? companyQuery : 
                  searchType === 'country' ? countryQuery : locationQuery;
    if (!query.trim()) return;

    // Check subscription restrictions
    if ((searchType === 'country' || searchType === 'location') && !canSearchByCountry()) {
      showSubscriptionPrompt = true;
      return;
    }

    isLoading = true;
    error = null;
    showSubscriptionPrompt = false;

    try {
      let results: FreightForwarder[] = [];
      
      if (searchType === 'company') {
        // Use the aggregated endpoint for comprehensive company search
        // This provides ratings, review counts, and category scores
        const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/aggregated/?search=${encodeURIComponent(query.trim())}&limit=50`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        results = data;
        locationsWithReviews = [];
      } else if (searchType === 'country') {
        // Search by country to find cities with reviews
        selectedCountry = query.trim();
        
        try {
          // Get reviews for the country to find cities
          const reviews = await apiClient.getReviewsByCountry(query.trim());
          
          if (reviews.length === 0) {
            searchResults = [];
            citiesWithReviews = [];
            return;
          }
          
          // Since ReviewResponse doesn't have city field, we'll use the fallback approach
          // Extract unique cities from locations in the country
          citiesWithReviews = [];
          results = [];
          
        } catch (error) {
          console.error('Error fetching reviews by country:', error);
          // Fallback: try to get cities from locations
          const locations = await apiClient.searchLocations(query.trim());
          const countryLocations = locations.filter(loc => 
            loc.country && loc.country.toLowerCase().includes(query.trim().toLowerCase())
          );
          
          citiesWithReviews = countryLocations
            .map(loc => loc.city)
            .filter((city): city is string => city !== undefined && city !== '')
            .filter((city, index, arr) => arr.indexOf(city) === index) // Remove duplicates
            .sort();
          results = [];
        }
      } else if (searchType === 'location') {
        // Search by specific location
        const locations = await apiClient.searchLocations(query.trim());
        
        if (locations.length === 0) {
          searchResults = [];
          locationsWithReviews = [];
          return;
        }
        
        // Get companies that have operations in the searched location
        const response = await fetch(`https://logiscorebe.onrender.com/api/freight-forwarders/aggregated/?limit=100`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allCompanies = await response.json();
        
        // For location search, we'll show companies that might have operations in the area
        // This is a simplified approach - in a full implementation, you'd query for companies
        // that actually have operations in specific locations
        results = allCompanies.slice(0, 20); // Show top 20 companies for location search
        
        // Store the found locations
        locationsWithReviews = locations;
      }

      searchResults = results.map(company => ({
        ...company,
        logo_url: company.logo_url || '/logo-placeholder.svg'
      }));
    } catch (err: any) {
      console.error('Error searching:', err);
      error = 'Failed to load search results';
      searchResults = [];
      locationsWithReviews = [];
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    const query = searchType === 'company' ? companyQuery : 
                  searchType === 'country' ? countryQuery : locationQuery;
    if (query.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', query.trim());
      url.searchParams.set('type', searchType);
      window.history.pushState({}, '', url.toString());
      performSearch();
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function switchSearchType(type: 'company' | 'country' | 'location') {
    searchType = type;
    searchResults = [];
    locationsWithReviews = [];
    locationSuggestions = [];
    showLocationSuggestions = false;
    citiesWithReviews = [];
    selectedCountry = '';
    selectedCity = '';
    companiesForLocation = [];
    error = null;
    showSubscriptionPrompt = false;
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    if (type === 'company' && companyQuery) {
      url.searchParams.set('q', companyQuery);
    } else if (type === 'country' && countryQuery) {
      url.searchParams.set('q', countryQuery);
    } else if (type === 'location' && locationQuery) {
      url.searchParams.set('q', locationQuery);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url.toString());
  }

  function getSearchPlaceholder(): string {
    if (searchType === 'company') {
      return 'Search by company name...';
    } else if (searchType === 'country') {
      return 'Search by country name...';
    } else {
      return 'Search by city, state, or location...';
    }
  }

  function getCurrentQuery(): string {
    if (searchType === 'company') {
      return companyQuery;
    } else if (searchType === 'country') {
      return countryQuery;
    } else {
      return locationQuery;
    }
  }

  function setCurrentQuery(value: string) {
    if (searchType === 'company') {
      companyQuery = value;
    } else if (searchType === 'country') {
      countryQuery = value;
    } else {
      locationQuery = value;
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
      

      
      <!-- Search Type Selector -->
      <div class="search-type-selector">
        <button 
          class="search-type-btn {searchType === 'company' ? 'active' : ''}"
          on:click={() => switchSearchType('company')}
        >
          <span class="icon">🏢</span>
          Search by Company
        </button>
        {#if canSearchByCountry()}
          <button 
            class="search-type-btn {searchType === 'country' ? 'active' : ''}"
            on:click={() => switchSearchType('country')}
          >
            <span class="icon">🌍</span>
            Search by Country
          </button>
        {:else}
          <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 12px;">
            Debug: Country search hidden because canSearchByCountry() returned false
          </div>
        {/if}
      </div>

      <!-- Search Box -->
      <div class="search-box">
        {#if searchType === 'location'}
          <div class="location-search-container">
            <input 
              type="text" 
              placeholder={getSearchPlaceholder()}
              value={getCurrentQuery()}
              on:input={handleLocationSearch}
              on:keypress={handleKeyPress}
              on:blur={hideLocationSuggestions}
              class="search-input"
            />
            {#if showLocationSuggestions && locationSuggestions.length > 0}
              <div class="location-suggestions">
                {#each locationSuggestions as location}
                  <div 
                    class="location-suggestion-item"
                    on:click={() => selectLocation(location)}
                  >
                    <span class="location-name">{location.name}</span>
                    {#if location.city && location.city !== location.name}
                      <span class="location-details">
                        {location.city}
                        {#if location.state}, {location.state}{/if}
                      </span>
                    {:else if location.state}
                      <span class="location-details">{location.state}</span>
                    {/if}
                    <span class="location-country">{location.country}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <input 
            type="text" 
            placeholder={getSearchPlaceholder()}
            value={getCurrentQuery()}
            on:input={(e) => setCurrentQuery(e.currentTarget.value)}
            on:keypress={handleKeyPress}
            class="search-input"
          />
        {/if}
        <button on:click={handleSearch} class="search-button">
          Search
        </button>
      </div>


    </div>
  </section>

  <!-- Subscription Prompt Modal -->
  {#if showSubscriptionPrompt}
    <div class="modal-overlay" on:click={() => showSubscriptionPrompt = false}>
      <div class="subscription-modal" on:click|stopPropagation>
        <h3>🔒 Premium Feature</h3>
        <p>Country-based search is available to premium subscribers only.</p>
        <p>Upgrade your subscription to unlock:</p>
        <ul>
          <li>Search freight forwarders by country</li>
          <li>Country-specific ratings and reviews</li>
          <li>Detailed location-level analytics</li>
          <li>Compare performance across countries</li>
        </ul>
        <div class="modal-actions">
          <a href="/pricing" class="upgrade-btn">View Pricing Plans</a>
          <button class="cancel-btn" on:click={() => showSubscriptionPrompt = false}>
            Continue with Company Search
          </button>
        </div>
      </div>
    </div>
  {/if}

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
        <p class="search-summary">
          {#if searchType === 'company'}
            Showing companies matching "{companyQuery}"
          {:else if searchType === 'country'}
            {#if selectedCity}
              Showing companies with reviews in {selectedCity}, {selectedCountry}
            {:else}
              Found {citiesWithReviews.length} cities with reviews in {countryQuery}
            {/if}
          {:else}
            Showing companies with operations in "{locationQuery}" ({locationsWithReviews.length} locations with reviews)
          {/if}
        </p>
        
        <!-- Show cities with reviews for country search -->
        {#if searchType === 'country' && citiesWithReviews.length > 0 && !selectedCity}
          <div class="cities-section">
            <h3>🏙️ Cities with Reviews in {countryQuery}</h3>
            <p class="cities-subtitle">Click on a city to see companies with reviews there</p>
            <div class="cities-grid">
              {#each citiesWithReviews as city}
                <div 
                  class="city-card"
                  on:click={() => selectCity(city)}
                >
                  <h4 class="city-name">{city}</h4>
                  <p class="city-country">{selectedCountry}</p>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Show companies for selected city -->
        {#if selectedCity && companiesForLocation.length > 0}
          <div class="city-companies-section">
            <div class="city-header">
              <button class="back-btn" on:click={goBackToCities}>
                ← Back to Cities
              </button>
              <h3>🏢 Companies with Reviews in {selectedCity}, {selectedCountry}</h3>
            </div>
            <div class="results-grid">
              {#each companiesForLocation as company}
                <div class="company-card">
                  <div class="company-header">
                    <div class="company-logo">
                      <img 
                        src={company.logo_url} 
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
                      <h3 class="company-name">{company.name}</h3>
                      {#if company.headquarters_country}
                        <p class="company-headquarters">📍 {company.headquarters_country}</p>
                      {/if}
                      {#if company.average_rating}
                        <div class="company-rating">
                          <span class="stars">
                            {#each Array(5) as _, i}
                              <span class="star {i < Math.floor(company.average_rating || 0) ? 'filled' : ''}">★</span>
                            {/each}
                          </span>
                          {#if user && user.subscription_tier && user.subscription_tier !== 'free'}
                            <span class="rating-text">{(company.average_rating || 0).toFixed(1)}/5</span>
                          {/if}
                        </div>
                      {/if}
                    </div>
                  </div>
                  <div class="company-stats">
                    {#if company.review_count}
                      <span class="stat">
                        <span class="stat-label">Reviews:</span>
                        <span class="stat-value">{company.review_count}</span>
                      </span>
                    {/if}
                  </div>
                  <a href="/freight-forwarder/{company.id}" class="view-profile-btn">View Profile</a>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        <div class="results-grid">
          {#each searchResults as company}
            <div class="company-card">
              <div class="company-header">
                <div class="company-logo">
                  <img 
                    src={company.logo_url} 
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
                  <h3 class="company-name">{company.name}</h3>
                  {#if company.headquarters_country}
                    <p class="company-headquarters">📍 {company.headquarters_country}</p>
                  {/if}
                  {#if company.average_rating}
                    <div class="company-rating">
                      <span class="stars">
                        {#each Array(5) as _, i}
                          <span class="star {i < Math.floor(company.average_rating || 0) ? 'filled' : ''}">★</span>
                        {/each}
                      </span>
                      {#if user && user.subscription_tier && user.subscription_tier !== 'free'}
                        <span class="rating-text">{(company.average_rating || 0).toFixed(1)}/5</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
              <div class="company-stats">
                {#if company.review_count}
                  <span class="stat">
                    <span class="stat-label">Reviews:</span>
                    <span class="stat-value">{company.review_count}</span>
                  </span>
                {/if}
              </div>
              <a href="/freight-forwarder/{company.id}" class="view-profile-btn">View Profile</a>
            </div>
          {/each}
        </div>
      {:else if getCurrentQuery()}
        <div class="no-results">
          <h2>No results found</h2>
          <p>Try adjusting your search terms or browse all freight forwarders.</p>
          <div class="no-results-suggestions">
            <h3>Search Tips:</h3>
            <ul>
              <li>Try using partial company names (e.g., "DHL" instead of "DHL Supply Chain")</li>
              <li>Check spelling and try alternative spellings</li>
              <li>Use company abbreviations if known</li>
            </ul>
          </div>
        </div>
      {:else}
        <div class="search-prompt">
          <h2>Start Your Search</h2>
          <p>Choose a search type above and enter your query to find freight forwarders.</p>
          <div class="search-examples">
            <div class="example-section">
              <h3>Company Search Examples:</h3>
              <ul>
                <li>"DHL" - Find DHL Supply Chain</li>
                <li>"Kuehne" - Find Kuehne + Nagel</li>
                <li>"DB Schenker" - Find DB Schenker</li>
              </ul>
            </div>
          </div>
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

  .search-type-selector {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .search-type-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .search-type-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .search-type-btn.active {
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    border-color: white;
  }

  .search-type-btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .search-type-btn .icon {
    font-size: 1.2rem;
  }

  .premium-badge {
    background: #ffd700;
    color: #333;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: bold;
    margin-left: 0.5rem;
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

  .subscription-notice {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .subscription-notice p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .upgrade-link {
    color: #ffd700;
    text-decoration: none;
    font-weight: bold;
  }

  .upgrade-link:hover {
    text-decoration: underline;
  }

  .search-results {
    padding: 60px 0;
  }

  .search-results h2 {
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
  }

  .search-summary {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
    text-align: center;
  }

  .company-logo {
    width: 120px;
    height: 120px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .company-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .company-info {
    width: 100%;
    text-align: center;
  }

  .company-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #333;
  }

  .company-headquarters {
    color: #555;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  .company-rating {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    color: #ddd;
    font-size: 1rem;
  }

  .star.filled {
    color: #ffd700;
  }

  .rating-text {
    font-size: 0.9rem;
    color: #666;
    font-weight: bold;
  }



  .company-stats {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 6px;
    min-width: 80px;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.2rem;
  }

  .stat-value {
    font-weight: bold;
    color: #333;
  }

  .view-profile-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    text-decoration: none;
    display: block;
    text-align: center;
    width: calc(100% - 2rem);
    max-width: 200px;
    box-sizing: border-box;
    margin: 0 auto;
  }

  .view-profile-btn:hover {
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

  .no-results-suggestions {
    text-align: left;
    max-width: 600px;
    margin: 2rem auto 0;
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .no-results-suggestions h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .no-results-suggestions ul {
    color: #666;
    line-height: 1.6;
  }

  .search-examples {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 800px;
    margin: 2rem auto 0;
    text-align: left;
  }

  .example-section h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .example-section ul {
    color: #666;
    line-height: 1.6;
  }

  /* Modal Styles */
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

  .subscription-modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    text-align: center;
  }

  .subscription-modal h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .subscription-modal p {
    color: #666;
    margin-bottom: 1rem;
  }

  .subscription-modal ul {
    text-align: left;
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .upgrade-btn {
    background: #667eea;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
    transition: background 0.3s;
  }

  .upgrade-btn:hover {
    background: #5a6fd8;
  }

  .cancel-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .cancel-btn:hover {
    background: #5a6268;
  }

  /* New styles for locations section */
  .locations-section {
    margin-top: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .locations-section h3 {
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .locations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    justify-items: center;
  }

  .location-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1rem;
    width: 100%;
    max-width: 300px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .location-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .location-info {
    margin-bottom: 0.5rem;
  }

  .location-name {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 0.3rem;
  }

  .location-details {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.3rem;
  }

  .location-country {
    font-size: 0.8rem;
    color: #555;
  }

  /* New styles for cities section */
  .cities-section {
    margin-top: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .cities-section h3 {
    color: #333;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .cities-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .cities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    justify-items: center;
  }

  .city-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
    width: 100%;
    max-width: 250px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }

  .city-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  .city-name {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .city-country {
    font-size: 0.9rem;
    color: #666;
  }

  /* City companies section */
  .city-companies-section {
    margin-top: 3rem;
  }

  .city-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .back-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 0.9rem;
  }

  .back-btn:hover {
    background: #5a6268;
  }

  .city-header h3 {
    margin: 0;
    color: #333;
  }

  /* New styles for location suggestions */
  .location-search-container {
    position: relative;
    width: 100%;
  }

  .location-suggestions {
    position: absolute;
    top: 100%; /* Position below the input */
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    margin-top: 0.5rem;
  }

  .location-suggestion-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .location-suggestion-item:hover {
    background: #f0f0f0;
  }

  .location-name {
    font-weight: bold;
    color: #333;
  }

  .location-details {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.2rem;
  }

  .location-country {
    font-size: 0.7rem;
    color: #555;
    margin-top: 0.2rem;
  }

  /* Ensure the search box can accommodate the location suggestions */
  .search-box {
    position: relative;
  }

  /* Make sure location suggestions don't overflow on mobile */
  @media (max-width: 768px) {
    .location-suggestions {
      max-height: 150px;
    }
    
    .location-suggestion-item {
      padding: 0.5rem 0.75rem;
    }
  }

  @media (max-width: 768px) {
    .search-hero h1 {
      font-size: 2rem;
    }
    
    .search-type-selector {
      flex-direction: column;
      align-items: center;
    }
    
    .search-box {
      flex-direction: column;
    }
    
    .results-grid {
      grid-template-columns: 1fr;
    }

    .search-examples {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }

    .locations-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

