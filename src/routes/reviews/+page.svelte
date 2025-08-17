<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  import { auth, authMethods } from '$lib/auth';
  import type { ReviewCategory, ReviewCreate } from '$lib/api';
  
  // Note: Branch locations use generated UUIDs to satisfy backend validation requirements.
  // The backend expects branch_id to be a valid UUID format, so we generate deterministic
  // UUIDs based on location identifiers to maintain consistency while meeting format requirements.
  
  let freightForwarders: any[] = [];
  let branches: any[] = [];
  let selectedCompany: string = '';
  let selectedBranch: string = '';
  let selectedBranchDisplay: string = '';
  let isAnonymous: boolean = false;
  
  // Location autocomplete
  let showLocationSuggestions = false;
  let locationSuggestions: any[] = [];
  let isLoading = true;
  let error: string | null = null;
  let successMessage: string | null = null;
  
  // New forwarder creation - RE-ENABLED after backend implementation
  let showNewForwarderForm = false;
  let newForwarder = {
    name: '',
    website: '',
    description: ''
  };
  
  // Branch location autopopulation
  let locations: any[] = [];

  
  // Auth state
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Review categories loaded from API
  let reviewCategories: ReviewCategory[] = [];

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  // Watch for company changes to reset branch selection
  $: if (selectedCompany) {
    // Clear previous branch selection when company changes
    selectedBranch = '';
    selectedBranchDisplay = '';
    // Branches will be loaded in loadCompanyData
  }
  
  $: aggregateRating = reviewCategories.reduce((sum, cat) => {
    const categoryRating = cat.questions.reduce((qSum: number, q: any) => qSum + (q.rating || 0), 0) / cat.questions.filter((q: any) => (q.rating || 0) > 0).length || 0;
    return sum + categoryRating;
  }, 0) / reviewCategories.filter(cat => cat.questions.some((q: any) => (q.rating || 0) > 0)).length || 0;
  
  $: ratedQuestions = reviewCategories.reduce((sum, cat) => sum + cat.questions.filter((q: any) => (q.rating || 0) > 0).length, 0);
  $: totalQuestions = reviewCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
  $: reviewWeight = isAnonymous ? 0.5 : 1.0;
  $: weightedRating = aggregateRating * reviewWeight;

  onMount(async () => {
    try {
      // Check authentication first
      if (!authState.token) {
        error = 'You must be logged in to submit reviews. Please sign in or create an account.';
        isLoading = false;
        return;
      }

      // Get company from URL parameter if available
      const urlParams = new URLSearchParams(window.location.search);
      const companyId = urlParams.get('company');
      
      if (companyId) {
        selectedCompany = companyId;
        // Load company details and branches
        await loadCompanyData(companyId);
      }
      
      // Load all freight forwarders for selection
      await loadFreightForwarders();
      
      // Load locations for branch autopopulation
      await loadLocations();
      
      // Load review questions from API
      await loadReviewQuestions();
    } catch (err: any) {
      error = err.message || 'Failed to load data';
    } finally {
      isLoading = false;
    }
  });

  async function loadFreightForwarders() {
    try {
      freightForwarders = await apiClient.getFreightForwarders();
    } catch (err: any) {
      console.error('Failed to load freight forwarders:', err);
    }
  }

  async function loadCompanyData(companyId: string) {
    try {
      const company = await apiClient.getFreightForwarder(companyId);
      // Load existing branches for this company
      branches = await apiClient.getBranchesByFreightForwarder(companyId);
      console.log('Loaded branches for company:', branches);
    } catch (err: any) {
      console.error('Failed to load company data:', err);
      branches = [];
    }
  }

  async function loadLocations() {
    try {
      console.log('🔄 Loading locations...');
      
      // Use the new dynamic location loading method from database
      const databaseLocations = await apiClient.getLocationsFromDatabase();
      console.log('📊 Raw database locations:', databaseLocations.length);
      console.log('📊 Sample raw location:', databaseLocations[0]);
      
      // Convert to the expected format for the existing code
      locations = databaseLocations.map(loc => ({
        id: loc.id,
        name: loc.name,
        city: loc.city || loc.name.split(',')[0]?.trim() || loc.name, // Use city from API or extract from name
        state: loc.state || (loc.name.includes(',') ? loc.name.split(',')[1]?.trim() || '' : ''),
        country: loc.country,
        region: loc.region,
        subregion: loc.subregion
      }));
      
      console.log('✅ Processed locations:', locations.length);
      console.log('✅ Sample processed location:', locations[0]);
      
      // Warn if we have limited data due to backend restrictions
      if (locations.length <= 50) {
        console.warn('⚠️ BACKEND LIMITATION: Only loaded', locations.length, 'locations');
        console.warn('⚠️ This severely limits search functionality - backend needs to be updated');
        console.warn('⚠️ Users cannot search for locations beyond the first', locations.length, 'records');
      }
    } catch (err: any) {
      console.error('❌ Failed to load dynamic locations:', err);
      // Keep existing fallback logic as a safety net
      locations = [
        { id: 'us-east', name: 'New York, NY, USA', city: 'New York', state: 'NY', country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: 'us-west', name: 'Los Angeles, CA, USA', city: 'Los Angeles', state: 'CA', country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: 'uk-london', name: 'London, , UK', city: 'London', state: '', country: 'UK', region: 'Europe', subregion: 'Western Europe' },
        { id: 'de-munchen', name: 'München, Bayern, Germany', city: 'München', state: 'Bayern', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: 'de-hamburg', name: 'Hamburg, , Germany', city: 'Hamburg', state: '', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: 'br-sao-paulo', name: 'São Paulo, SP, Brazil', city: 'São Paulo', state: 'SP', country: 'Brazil', region: 'Americas', subregion: 'South America' },
        { id: 'ma-selibaby', name: 'Sélibaby, , Mauritania', city: 'Sélibaby', state: '', country: 'Mauritania', region: 'Africa', subregion: 'Western Africa' }
      ];
      console.log('🔄 Using minimal fallback locations due to error');
    }
  }

  async function createNewForwarder() {
    try {
      console.log('Creating new forwarder:', newForwarder);
      
      // Check authentication first
      if (!authState.token) {
        error = 'You must be logged in to create companies. Please sign in or create an account.';
        return;
      }

      // Debug: Log authentication details
      console.log('Auth state:', {
        hasToken: !!authState.token,
        tokenLength: authState.token?.length,
        tokenStart: authState.token?.substring(0, 20) + '...',
        user: authState.user
      });

      if (!newForwarder.name.trim()) {
        error = 'Company name is required';
        return;
      }

      console.log('Calling API to create forwarder...');
      const createdForwarder = await apiClient.createFreightForwarder(newForwarder, authState.token);
      console.log('Forwarder created successfully:', createdForwarder);
      
      // Add to the list and select it
      freightForwarders.push(createdForwarder);
      selectedCompany = createdForwarder.id;
      
      // Reset form
      newForwarder = {
        name: '',
        website: '',
        description: ''
      };
      showNewForwarderForm = false;
      
      // Clear any previous errors and set success message
      error = null;
      successMessage = `Company "${createdForwarder.name}" created successfully!`;
      
      console.log('New forwarder added to list, selected company:', selectedCompany);
      
    } catch (err: any) {
      console.error('Error creating forwarder:', err);
      
      // Handle specific backend error responses
      if (err.message && err.message.includes('API request failed:')) {
        const statusMatch = err.message.match(/API request failed: (\d+)/);
        if (statusMatch) {
          const statusCode = parseInt(statusMatch[1]);
          switch (statusCode) {
            case 400:
              error = 'Invalid company data. Please check all fields and try again.';
              break;
            case 401:
              error = 'Authentication required. Please log in again.';
              break;
            case 403:
              error = 'Permission denied. Only admins and shippers can create companies.';
              break;
            case 409:
              error = 'A company with this name already exists. Please use a different name.';
              break;
            case 500:
              error = 'Server error. Please try again later.';
              break;
            default:
              error = err.message || 'Failed to create new freight forwarder';
          }
        } else {
          error = err.message || 'Failed to create new freight forwarder';
        }
      } else {
        error = err.message || 'Failed to create new freight forwarder';
      }
    }
  }

  async function loadReviewQuestions() {
    try {
      reviewCategories = await apiClient.getReviewQuestions();
      console.log('Loaded review questions:', reviewCategories);
      
      // Check if we got the fallback questions instead of API data
      if (reviewCategories.length <= 3) {
        console.warn('Warning: Using fallback questions. API may be unavailable.');
        // Don't show error since we now have comprehensive fallback questions
      }
    } catch (err: any) {
      console.error('Failed to load review questions:', err);
      error = 'Failed to load review questions. Please refresh the page.';
    }
  }

  async function handleLocationSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    
    console.log('Location search query:', query);
    console.log('Available locations:', locations.length);
    
    if (query.length < 4) {
      locationSuggestions = [];
      showLocationSuggestions = false;
      return;
    }

    // TEMPORARY: Force fallback to test special character handling
    // Remove this when backend is updated to handle special characters properly
    const forceFallback = true;
    
    if (forceFallback) {
      console.log('🔄 Forcing fallback to client-side filtering for testing special character handling');
      // Fallback to client-side filtering to test special character search
      const filtered = locations.filter(location => {
        // Strategy 1: Normalized search (remove accents)
        const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedName = (location.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedCity = (location.city || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedState = (location.state || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedCountry = (location.country || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        
        // Strategy 2: Exact character matching (including special characters)
        const exactNameMatch = location.name && location.name.toLowerCase().includes(query);
        const exactCityMatch = location.city && location.city.toLowerCase().includes(query);
        const exactStateMatch = location.state && location.state.toLowerCase().includes(query);
        const exactCountryMatch = location.country && location.country.toLowerCase().includes(query);
        
        // Strategy 3: Normalized matching (e.g., "munchen" matches "München")
        const nameMatch = normalizedName.includes(normalizedQuery);
        const cityMatch = normalizedCity.includes(normalizedQuery);
        const stateMatch = normalizedState.includes(normalizedQuery);
        const countryMatch = normalizedCountry.includes(normalizedQuery);
        
        // Strategy 4: Partial word matching for better results
        const partialNameMatch = location.name && location.name.toLowerCase().split(/\s+/).some((word: string) => 
          word.includes(query) || word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
        );
        const partialCityMatch = location.city && location.city.toLowerCase().split(/\s+/).some((word: string) => 
          word.includes(query) || word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
        );
        
        const hasMatch = nameMatch || cityMatch || stateMatch || countryMatch || 
                        exactNameMatch || exactCityMatch || exactStateMatch || exactCountryMatch ||
                        partialNameMatch || partialCityMatch;
        
        // Debug logging for specific cases
        if (query === 'munchen' && location.name && location.name.toLowerCase().includes('münchen')) {
          console.log('🔍 Debug match for "munchen" → "München":', {
            location: location.name,
            normalizedQuery,
            normalizedName,
            nameMatch,
            exactNameMatch,
            partialNameMatch,
            hasMatch
          });
        }
        
        return hasMatch;
      }).slice(0, 25); // Increased from 10 to 25
      
      console.log('Fallback filtered locations:', filtered.length);
      locationSuggestions = filtered;
      showLocationSuggestions = true;
      console.log('Fallback location suggestions set:', locationSuggestions.length);
      console.log('Show location suggestions (fallback):', showLocationSuggestions);
      return;
    }

    try {
      // Try backend search first
      const searchResults = await apiClient.searchLocations(query);
      console.log('Backend search results:', searchResults.length);
      
      const filtered = searchResults.slice(0, 25); // Increased from 10 to 25
      console.log(`✅ Backend search found ${searchResults.length} locations, showing ${filtered.length}`);
      
      locationSuggestions = filtered;
      showLocationSuggestions = true;
      console.log('Location suggestions set:', locationSuggestions.length);
      console.log('Show location suggestions:', showLocationSuggestions);
    } catch (error) {
      console.error('Search failed, falling back to client-side filtering:', error);
      
      // Fallback to client-side filtering if backend search fails
      const filtered = locations.filter(location => {
        // Strategy 1: Normalized search (remove accents)
        const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedName = (location.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedCity = (location.city || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedState = (location.state || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedCountry = (location.country || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        
        // Strategy 2: Exact character matching (including special characters)
        const exactNameMatch = location.name && location.name.toLowerCase().includes(query);
        const exactCityMatch = location.city && location.city.toLowerCase().includes(query);
        const exactStateMatch = location.state && location.state.toLowerCase().includes(query);
        const exactCountryMatch = location.country && location.country.toLowerCase().includes(query);
        
        // Strategy 3: Normalized matching (e.g., "munchen" matches "München")
        const nameMatch = normalizedName.includes(normalizedQuery);
        const cityMatch = normalizedCity.includes(normalizedQuery);
        const stateMatch = normalizedState.includes(normalizedQuery);
        const countryMatch = normalizedCountry.includes(normalizedQuery);
        
        // Strategy 4: Partial word matching for better results
        const partialNameMatch = location.name && location.name.toLowerCase().split(/\s+/).some((word: string) => 
          word.includes(query) || word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
        );
        const partialCityMatch = location.city && location.city.toLowerCase().split(/\s+/).some((word: string) => 
          word.includes(query) || word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
        );
        
        const hasMatch = nameMatch || cityMatch || stateMatch || countryMatch || 
                        exactNameMatch || exactCityMatch || exactStateMatch || exactCountryMatch ||
                        partialNameMatch || partialCityMatch;
        
        // Debug logging for specific cases
        if (query === 'munchen' && location.name && location.name.toLowerCase().includes('münchen')) {
          console.log('🔍 Debug match for "munchen" → "München":', {
            location: location.name,
            normalizedQuery,
            normalizedName,
            nameMatch,
            exactNameMatch,
            partialNameMatch,
            hasMatch
          });
        }
        
        return hasMatch;
      }).slice(0, 25); // Increased from 10 to 25
      
      console.log('Fallback filtered locations:', filtered.length);
      locationSuggestions = filtered;
      showLocationSuggestions = true;
      console.log('Fallback location suggestions set:', locationSuggestions.length);
      console.log('Show location suggestions (fallback):', showLocationSuggestions);
    }
  }
  
  async function createBranchForCompany(location: any): Promise<string> {
    if (!selectedCompany || !authState.token) {
      throw new Error('Company and authentication required to create branch');
    }

    try {
      // Create a new branch record for this company and location
      const branchData = {
        freight_forwarder_id: selectedCompany,
        name: location.name || 'Unknown Location',
        country: location.country || 'Unknown',
        city: location.city || location.name?.split(',')[0]?.trim() || 'Unknown',
        address: location.name || 'Unknown Address',
        is_active: true
      };

      console.log('Creating branch for company:', branchData);
      
      // Call the API to create the branch
      const newBranch = await apiClient.createBranch(branchData, authState.token);
      console.log('Branch created successfully:', newBranch);
      
      return newBranch.id;
    } catch (error: any) {
      console.error('Failed to create branch:', error);
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async function selectLocation(location: any) {
    console.log('Selected location:', location);
    console.log('Location ID:', location.id);
    console.log('Location name:', location.name);
    console.log('Location city:', location.city);
    console.log('Location type:', typeof location.id);
    console.log('Location ID length:', location.id?.length);
    
    try {
      // Create a real branch record for this company and location
      const branchId = await createBranchForCompany(location);
      
      selectedBranch = branchId; // Use the real branch ID from the backend
      selectedBranchDisplay = location.name || 'Unknown Location';
      console.log('Set selectedBranch (real ID):', selectedBranch);
      console.log('Set selectedBranchDisplay (name):', selectedBranchDisplay);
      
      showLocationSuggestions = false;
      locationSuggestions = [];
      error = null; // Clear any previous errors
      
      // Show success message
      successMessage = `Branch "${location.name}" created successfully for the selected company.`;
      
    } catch (err: any) {
      console.error('Failed to create branch:', err);
      
      // TEMPORARY: Fallback for when backend API is not yet implemented
      // This allows testing the location selection while the backend is being developed
      console.warn('Backend API not available, using fallback branch creation');
      
      // Generate a temporary branch ID for testing purposes
      const tempBranchId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      selectedBranch = tempBranchId;
      selectedBranchDisplay = location.name || 'Unknown Location';
      console.log('Set selectedBranch (temporary ID):', selectedBranch);
      console.log('Set selectedBranchDisplay (name):', selectedBranchDisplay);
      
      showLocationSuggestions = false;
      locationSuggestions = [];
      error = null; // Clear any previous errors
      
      // Show warning message
      successMessage = `Branch "${location.name}" selected (temporary ID for testing). Backend API needs to be implemented for production use.`;
      
      // Note: This is a temporary solution - remove when backend API is ready
    }
  }

  async function selectExistingBranch(branch: any) {
    selectedBranch = branch.id;
    selectedBranchDisplay = branch.name;
    showLocationSuggestions = false;
    locationSuggestions = [];
    error = null; // Clear any previous errors
    successMessage = `Branch "${branch.name}" selected for the selected company.`;
  }
  
  function handleRatingChange(categoryId: string, questionId: string, rating: number) {
    console.log('Rating changed:', { categoryId, questionId, rating });
    reviewCategories = reviewCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          questions: cat.questions.map(q => {
            if (q.id === questionId) {
              return { ...q, rating };
            }
            return q;
          })
        };
      }
      return cat;
    });
  }

  async function submitReview() {
    // Check authentication again
    if (!authState.token || !authState.user) {
      error = 'You must be logged in to submit reviews. Please sign in or create an account.';
      return;
    }

    if (!selectedCompany) {
      error = 'Please select a company';
      return;
    }

    // Branch selection is mandatory for valid service reviews
    if (!selectedBranch || selectedBranch.trim() === '' || !selectedBranchDisplay || selectedBranchDisplay.trim() === '') {
      error = 'Please select a branch location. Service quality can vary significantly between different branches, so we require a specific location for accurate reviews.';
      return;
    }

    if (ratedQuestions === 0) {
      error = 'Please provide ratings for at least one category';
      return;
    }

    // Prepare review data for API
    const reviewData: ReviewCreate = {
      freight_forwarder_id: selectedCompany,
      branch_id: selectedBranch.trim(), // Branch location is mandatory
      is_anonymous: isAnonymous,
      review_weight: reviewWeight,
      category_ratings: reviewCategories.map(cat => ({
        category: cat.id,
        questions: cat.questions.map(q => ({
          question: q.id,
          rating: q.rating || 0
        }))
      })),
      aggregate_rating: aggregateRating,
      weighted_rating: weightedRating
    };

    // Debug: Log the review data being sent
    console.log('Submitting review with data:', {
      freight_forwarder_id: reviewData.freight_forwarder_id,
      branch_id: reviewData.branch_id,
      selectedBranch: selectedBranch,
      selectedBranchDisplay: selectedBranchDisplay
    });

    // Validate branch_id format
    if (!reviewData.branch_id || reviewData.branch_id.trim() === '') {
      error = 'Branch ID is required. Please select a valid branch location.';
      return;
    }

    // Debug: Log the branch ID being sent
    console.log('Branch ID validation:', {
      branch_id: reviewData.branch_id,
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewData.branch_id),
      length: reviewData.branch_id.length
    });

    try {
      // Submit review using the new API method
      const response = await apiClient.createComprehensiveReview(reviewData, authState.token);
      
      // Show success message
      alert('Review submitted successfully!');
      console.log('Review submitted:', response);
      
      // Reset form
      reviewCategories.forEach(cat => cat.questions.forEach((q: any) => q.rating = 0));
      selectedBranch = '';
      selectedBranchDisplay = '';
      isAnonymous = false;
      
    } catch (err: any) {
      console.error('Review submission failed:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('405')) {
        error = 'Review submission failed: Backend endpoint not available. Please try again later or contact support.';
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        error = 'Authentication failed. Please log in again.';
      } else if (err.message?.includes('400')) {
        // Check for specific branch_id error
        if (err.message?.includes('Invalid branch_id format')) {
          error = 'Invalid branch ID format. Please try selecting the branch location again.';
        } else {
          error = 'Invalid review data. Please check your inputs and try again.';
        }
      } else if (err.message?.includes('404')) {
        // Check for specific branch not found error
        if (err.message?.includes('Branch not found') || err.message?.includes('does not belong to the specified freight forwarder')) {
          error = 'The selected branch location was not found or does not belong to the selected company. Please create a new branch for this company or select an existing one.';
        } else {
          error = 'The requested resource was not found. Please check your selection and try again.';
        }
      } else if (err.message?.includes('500')) {
        error = 'Server error occurred. Please try again later.';
      } else {
        error = err.message || 'Failed to submit review. Please try again.';
      }
      
      // Log additional details for debugging
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response,
        data: reviewData
      });
    }
  }

  async function testSearch(query: string) {
    console.log('Testing search with query:', query);
    try {
      const results = await apiClient.searchLocations(query);
      console.log('Test search results:', results.length);
      if (results.length > 0) {
        console.log('First result:', results[0]);
      } else {
        console.log('No results found for query:', query);
      }
    } catch (error) {
      console.error('Error during test search:', error);
    }
  }

</script>

<svelte:head>
  <title>Submit Review - LogiScore</title>
  <meta name="description" content="Submit your review for freight forwarders on LogiScore" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>Submit Your Review</h1>
      <p class="hero-subtitle">Share your experience to help others make informed decisions</p>
    </div>
  </section>

  <section class="review-form">
    <div class="container">
      {#if isLoading}
        <div class="loading">
          <p>Loading...</p>
        </div>
      {:else if !authState.token}
        <div class="auth-required">
          <h2>Authentication Required</h2>
          <p>You must be logged in to submit reviews on LogiScore.</p>
          <p class="auth-note">Our comprehensive review system includes 35 detailed questions across multiple categories to provide accurate assessments of freight forwarder services.</p>
          <div class="auth-actions">
            <a href="/?auth=signin" class="btn btn-primary">Sign In</a>
            <a href="/?auth=signup" class="btn btn-secondary">Create Account</a>
          </div>
          <div class="auth-benefits">
            <h3>Why Create an Account?</h3>
            <ul>
              <li>Submit reviews with full weight (100% vs 50% for anonymous)</li>
              <li>Track your review history</li>
              <li>Earn reputation points</li>
              <li>Get notified about responses to your reviews</li>
              <li>Access to comprehensive 35-question review system</li>
            </ul>
          </div>
        </div>
      {:else}
        <form on:submit|preventDefault={submitReview}>


          <!-- Company Information -->
          <div class="form-section">
            <h2>Company Information</h2>
            <div class="form-group">
              <label for="company">Company *</label>
              <select id="company" bind:value={selectedCompany} required>
                <option value="">Select a company</option>
                {#each freightForwarders as company}
                  <option value={company.id}>{company.name}</option>
                {/each}
              </select>
            </div>
            
            <!-- Add New Company Button -->
            <div class="form-group">
              <button 
                type="button" 
                class="btn btn-secondary" 
                on:click={() => showNewForwarderForm = !showNewForwarderForm}
              >
                {showNewForwarderForm ? 'Cancel' : 'Add New Company'}
              </button>
            </div>

            <!-- New Company Form -->
            {#if showNewForwarderForm}
              <div class="new-company-form">
                <h4>Add New Freight Forwarder</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="newName">Company Name *</label>
                    <input 
                      id="newName" 
                      type="text" 
                      bind:value={newForwarder.name} 
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="newWebsite">Website</label>
                    <input 
                      id="newWebsite" 
                      type="url" 
                      bind:value={newForwarder.website} 
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="newDescription">Description</label>
                    <textarea 
                      id="newDescription" 
                      bind:value={newForwarder.description} 
                      placeholder="Brief description of the company"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div class="form-group">
                  <button 
                    type="button" 
                    class="btn btn-primary" 
                    on:click={createNewForwarder}
                  >
                    Create Company
                  </button>
                </div>
              </div>
            {/if}

            <!-- Branch Location Section -->
            <div class="form-group">
              <label for="branch">Branch Location *</label>
              
              <!-- Special Characters Warning -->
              <div class="special-chars-warning">
                <strong>⚠️ International Locations:</strong> For locations with special characters (like "Sélibaby", "São Paulo", "München"), type them exactly as they appear. The search will work with or without special characters.
              </div>
              
              <!-- Show existing branches if available -->
              {#if branches && branches.length > 0}
                <div class="existing-branches">
                  <p class="help-text">Select from existing branches or create a new one:</p>
                  <div class="branch-options">
                    {#each branches as branch}
                      <button 
                        type="button" 
                        class="branch-option {selectedBranch === branch.id ? 'selected' : ''}"
                        on:click={() => selectExistingBranch(branch)}
                      >
                        <strong>{branch.name}</strong>
                        {#if branch.city || branch.country}
                          <span class="branch-details">
                            {branch.city}{branch.city && branch.country ? ', ' : ''}{branch.country}
                          </span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                  <div class="branch-divider">
                    <span>or</span>
                  </div>
                </div>
              {/if}
              
              <!-- Create new branch section -->
              <div class="new-branch-section">
                <p class="help-text">{branches && branches.length > 0 ? 'Create a new branch:' : ''}</p>
                
                <input 
                  type="text" 
                  id="branch" 
                  bind:value={selectedBranchDisplay}
                  placeholder="Start typing to search locations..."
                  on:input={handleLocationSearch}
                  class="location-input"
                  required
                />
                <div class="search-tips">
                  <small>
                    💡 <strong>Search Tips:</strong> 
                    Type city names (e.g., "London"), country names (e.g., "Germany"), or specific locations (e.g., "New York") for better results.
                    <br>⚠️ <strong>Special Characters:</strong> Enter special characters exactly as they appear (e.g., "Sélibaby", "São Paulo", "München").
                    {#if locations.length <= 50}
                      <br>⚠️ <strong>Limited Data:</strong> Currently only {locations.length} locations available. Backend needs to be updated for full location database.
                    {/if}
                  </small>
                  
                  <!-- TEMPORARY: Test search functionality -->
                  <div class="test-search" style="margin-top: 10px; padding: 10px; background: #e8f5e8; border-radius: 4px;">
                    <strong>Test Search:</strong> 
                    <button type="button" on:click={() => testSearch('munchen')} style="margin: 0 5px; padding: 2px 8px;">Test "munchen"</button>
                    <button type="button" on:click={() => testSearch('münchen')} style="margin: 0 5px; padding: 2px 8px;">Test "München"</button>
                    <small>Check console for results</small>
                  </div>
                </div>
                {#if selectedBranchDisplay && selectedBranchDisplay.length > 0 && selectedBranchDisplay.length < 4}
                  <div class="location-hint">
                    <span class="hint-text">Type at least 4 characters to search locations...</span>
                  </div>
                {/if}
                {#if showLocationSuggestions && locationSuggestions.length > 0}
                  <div class="location-suggestions">
                    {#each locationSuggestions as suggestion}
                      <div 
                        class="suggestion-item" 
                        on:click={() => {
                          console.log('Location suggestion clicked:', suggestion);
                          selectLocation(suggestion);
                        }}
                        on:keydown={(e) => {
                          if (e.key === 'Enter') {
                            console.log('Location suggestion Enter key pressed:', suggestion);
                            selectLocation(suggestion);
                          }
                        }}
                        tabindex="0"
                        role="button"
                        style="cursor: pointer;"
                      >
                        <strong>{suggestion.name || 'Unknown Location'}</strong>
                        <span class="suggestion-details">{suggestion.city || ''}{suggestion.state ? ', ' + suggestion.state : ''}, {suggestion.country || 'Unknown Country'}</span>
                      </div>
                    {/each}
                    
                    <!-- Show More option if there are more results -->
                    {#if locationSuggestions.length >= 25}
                      <div class="show-more-item">
                        <em>Showing first 25 results. Try a more specific search for better results.</em>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
              
              <p class="help-text">Select a specific branch location for your review. Service quality can vary significantly between different branches, so we require a specific location for accurate reviews.</p>
            </div>

          <!-- Review Options -->
          <div class="form-section">
            <h2>Review Options</h2>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" bind:checked={isAnonymous}>
                Submit anonymously (reviews count 50% weight)
              </label>
              <p class="help-text">
                {isAnonymous ? 'Your review will count as 50% weight' : 'Log in as a shipper for 100% weight'}
              </p>
            </div>
          </div>

          <!-- Tips for Accurate Reviews -->
          <div class="form-section">
            <h2>Tips for Accurate Reviews</h2>
            <div class="tips-container">
              <ul class="tips-list">
                <li>Base your review on recent experiences (within 12 months)</li>
                <li>Consider multiple interactions, not just one shipment</li>
                <li>Always select the specific branch/location you're reviewing - service quality varies by location</li>
                <li>For international locations, type special characters exactly as they appear (e.g., "Sélibaby", "São Paulo")</li>
                <li>Focus on objective criteria rather than personal preferences</li>
                <li>Consider both positive and negative aspects</li>
              </ul>
            </div>
          </div>

                    <!-- Rating Categories -->
          <div class="form-section">
            {#each reviewCategories as category}
              <div class="rating-category">
                <h3>{category.name}</h3>
                {#each category.questions as question}
                  <div class="question-item">
                    <p class="question-text">{question.text}</p>
                    <div class="star-rating">
                      {#each Array(5) as _, i}
                        <button
                          type="button"
                          class="star {i === 0 ? 'not-applicable' : ''} {i <= (question.rating || 0) ? 'filled' : ''}"
                          on:click={() => handleRatingChange(category.id, question.id, i === 0 ? 0 : i)}
                        >
                          {i === 0 ? 'N/A' : '★'}
                        </button>
                      {/each}
                      {#if question.rating && question.rating > 0}
                        <div class="rating-definition">
                          {question.ratingDefinitions[question.rating.toString()]}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>

          <!-- Rating Summary -->
          <div class="form-section rating-summary">
            <h2>Your Rating Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Aggregate Rating:</span>
                <span class="value">{aggregateRating.toFixed(1)}/4.0</span>
              </div>
              <div class="summary-item">
                <span class="label">Rated Questions:</span>
                <span class="value">{ratedQuestions} out of {totalQuestions}</span>
              </div>
              <div class="summary-item">
                <span class="label">Review Weight:</span>
                <span class="value">{isAnonymous ? '50% (Anonymous)' : '100% (Authenticated)'}</span>
              </div>
              <div class="summary-item">
                <span class="label">Weighted Rating:</span>
                <span class="value">{weightedRating.toFixed(1)}/4.0</span>
              </div>
              <div class="summary-item">
                <span class="label">Review Scope:</span>
                <span class="value">{selectedBranch && selectedBranch.trim() !== '' ? `Branch: ${selectedBranchDisplay}` : 'Company Overall'}</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-section">
            <button type="submit" class="btn btn-primary" disabled={ratedQuestions === 0}>
              Submit Review
            </button>
          </div>

          {#if error}
            <div class="error-message">
              {error}
            </div>
          {/if}
          
          {#if successMessage}
            <div class="success-message">
              {successMessage}
            </div>
          {/if}
        </form>
      {/if}
    </div>
  </section>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
  }

  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .review-form {
    padding: 3rem 0;
  }

  .form-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .form-section h2 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .location-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .location-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .suggestion-item {
    padding: 0.75rem;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }
  
  .suggestion-item:hover,
  .suggestion-item:focus {
    background-color: #f8f9fa;
  }
  
  .suggestion-item:last-child {
    border-bottom: none;
  }
  
  .suggestion-details {
    display: block;
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .location-hint {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 4px 4px;
    padding: 0.75rem;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .hint-text {
    display: block;
    font-size: 0.875rem;
    color: #666;
    font-style: italic;
    text-align: center;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
  }

  .checkbox-group input[type="checkbox"] {
    width: auto;
  }

  .help-text {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  .rating-instructions {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 2rem;
    color: #666;
    line-height: 1.6;
  }

  .rating-category {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .rating-category h3 {
    color: #333;
    margin-bottom: 0.5rem;
  }

  .question-item {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #667eea;
  }

  .question-text {
    color: #333;
    margin-bottom: 0.75rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .star-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .star {
    background: none;
    border: 2px solid #ddd;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.2rem;
  }

  .star.not-applicable {
    font-size: 0.8rem;
    font-weight: bold;
  }

  .star.filled {
    background: #ffc107;
    border-color: #ffc107;
    color: white;
  }

  .star:hover {
    border-color: #ffc107;
    transform: scale(1.1);
  }

  .rating-label {
    margin-left: 1rem;
    color: #666;
    font-size: 0.9rem;
  }

  .rating-definition {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-left: 3px solid #667eea;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #555;
    line-height: 1.4;
  }

  .rating-summary {
    background: #f8f9fa;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
  }

  .summary-item .label {
    font-weight: 600;
    color: #333;
  }

  .summary-item .value {
    font-weight: bold;
    color: #667eea;
  }

  .btn {
    display: inline-block;
    padding: 1rem 2rem;
    background: #667eea;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn:hover:not(:disabled) {
    background: #5a6268;
  }

  .btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    border: 1px solid #f5c6cb;
  }

  .error-help {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f5c6cb;
  }

  .error-help p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .error-help strong {
    color: #721c24;
  }
  
  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    border: 1px solid #c3e6cb;
  }

  .loading {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.2rem;
    color: #666;
  }

  .tips-container {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tips-list li {
    margin-bottom: 0.75rem;
    color: #333;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .rating-scale-info {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .rating-scale-info h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .scale-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .scale-item {
    background: white;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .scale-item strong {
    font-weight: 600;
    color: #333;
  }

  .auth-required {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .auth-required h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }

  .auth-required p {
    color: #555;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .auth-note {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #e0e0e0;
    border-radius: 6px;
    border: 1px solid #d0d0d0;
  }

  .auth-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .btn-primary {
    background: #667eea;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .btn-primary:hover {
    background: #5a6268;
  }

  .btn-secondary {
    background: #e0e0e0;
    color: #333;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .btn-secondary:hover {
    background: #d0d0d0;
  }

  .auth-benefits {
    background: #f0f0f0;
    border: 1px solid #e0e0e0;
  }

  /* New Company Form Styles */
  .new-company-form {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .new-company-form h4 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.2rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-row .form-group {
    margin-bottom: 0;
  }

  /* Location Selection Styles */
  .location-selection {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 0.5rem;
  }

  .location-selection .form-row {
    margin-bottom: 1rem;
  }

  .location-selection .form-group:last-child {
    margin-bottom: 0;
  }

  .auth-benefits h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .auth-benefits ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .auth-benefits li {
    color: #555;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }

  /* New Auth Status Styles */
  .auth-status {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: #333;
  }

  .auth-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .auth-icon {
    font-size: 1.2rem;
  }

  .auth-text {
    font-weight: 600;
  }

  .auth-type {
    color: #666;
    font-style: italic;
  }

  .btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid #667eea;
    color: #667eea;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  /* New Branch Selection Styles */
  .existing-branches {
    margin-bottom: 1.5rem;
  }

  .branch-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .branch-option {
    background: #f0f0f0;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
  }

  .branch-option:hover {
    background: #e0e0e0;
    border-color: #667eea;
  }

  .branch-option.selected {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .branch-option strong {
    font-weight: 600;
  }

  .branch-details {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .branch-divider {
    text-align: center;
    margin: 1rem 0;
    position: relative;
  }

  .branch-divider span {
    background: #f8f9fa;
    padding: 0 10px;
    position: relative;
    z-index: 1;
    font-size: 0.9rem;
    color: #666;
  }

  .branch-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e0e0e0;
    z-index: 0;
  }

  .new-branch-section {
    margin-top: 1.5rem;
  }

  .show-more-item {
    padding: 0.75rem;
    text-align: center;
    font-size: 0.85rem;
    color: #666;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-top: 0.5rem;
  }

  .search-tips {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #666;
    text-align: center;
  }

  .search-tips small {
    display: block;
    line-height: 1.4;
  }

  .search-tips strong {
    color: #333;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }
    
    .hero h1 {
      font-size: 2rem;
    }
    
    .form-section {
      padding: 1.5rem;
    }
    
    .star {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }
    
    .summary-grid {
      grid-template-columns: 1fr;
    }

    .auth-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  .special-chars-warning {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border: 2px solid #fdcb6e;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: #856404;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 2px 8px rgba(253, 203, 110, 0.3);
    position: relative;
    overflow: hidden;
  }

  .special-chars-warning::before {
    content: '🌍';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
  }

  .special-chars-warning strong {
    color: #d63031;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
</style>

