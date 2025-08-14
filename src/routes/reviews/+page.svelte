<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  import { auth, authMethods } from '$lib/auth';
  import type { ReviewCategory, ReviewCreate } from '$lib/api';
  
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
      // Load branches for this company
      // Note: This would need to be implemented in the API
      branches = []; // Placeholder
    } catch (err: any) {
      console.error('Failed to load company data:', err);
    }
  }

  async function loadLocations() {
    try {
      // Try to get locations from API first
      const apiLocations = await apiClient.getLocations();
      if (apiLocations && apiLocations.length > 0) {
        // Convert API locations to the expected format
        locations = apiLocations.map(loc => ({
          id: loc.id,
          Location: loc.name,
          City: loc.name,
          State: '',
          Country: loc.country,
          region: loc.region,
          subregion: loc.subregion
        }));
        console.log('Loaded API locations:', locations.length);
        console.log('Sample API location:', apiLocations[0]);
        console.log('Converted location:', locations[0]);
      } else {
        // Fallback to hardcoded locations if API returns empty
        // Format matches locations.csv: first field is combination of city, state, country
        locations = [
          { id: 'us-east', Location: 'New York, NY, USA', City: 'New York', State: 'NY', Country: 'USA', region: 'Americas', subregion: 'North America' },
          { id: 'us-west', Location: 'Los Angeles, CA, USA', City: 'Los Angeles', State: 'CA', Country: 'USA', region: 'Americas', subregion: 'North America' },
          { id: 'uk-london', Location: 'London, , UK', City: 'London', State: '', Country: 'UK', region: 'Europe', subregion: 'Western Europe' },
          { id: 'de-hamburg', Location: 'Hamburg, , Germany', City: 'Hamburg', State: '', Country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
          { id: 'cn-shanghai', Location: 'Shanghai, , China', City: 'Shanghai', State: '', Country: 'China', region: 'Asia', subregion: 'East Asia' },
          { id: 'sg-singapore', Location: 'Singapore, , Singapore', City: 'Singapore', State: '', Country: 'Singapore', region: 'Asia', subregion: 'Southeast Asia' },
          { id: 'ae-dubai', Location: 'Dubai, , UAE', City: 'Dubai', State: '', Country: 'UAE', region: 'Middle East', subregion: 'Gulf Cooperation Council' },
          { id: 'za-cape-town', Location: 'Cape Town, , South Africa', City: 'Cape Town', State: '', Country: 'South Africa', region: 'Africa', subregion: 'Southern Africa' },
          { id: 'in-mumbai', Location: 'Mumbai, Maharashtra, India', City: 'Mumbai', State: 'Maharashtra', Country: 'India', region: 'Asia', subregion: 'South Asia' },
          { id: 'jp-tokyo', Location: 'Tokyo, , Japan', City: 'Tokyo', State: '', Country: 'Japan', region: 'Asia', subregion: 'East Asia' },
          { id: 'au-sydney', Location: 'Sydney, NSW, Australia', City: 'Sydney', State: 'NSW', Country: 'Australia', region: 'Oceania', subregion: 'Australia and New Zealand' },
          { id: 'ca-toronto', Location: 'Toronto, ON, Canada', City: 'Toronto', State: 'ON', Country: 'Canada', region: 'Americas', subregion: 'North America' },
          { id: 'br-sao-paulo', Location: 'São Paulo, SP, Brazil', City: 'São Paulo', State: 'SP', Country: 'Brazil', region: 'Americas', subregion: 'South America' },
          { id: 'mx-mexico-city', Location: 'Mexico City, , Mexico', City: 'Mexico City', State: '', Country: 'Mexico', region: 'Americas', subregion: 'North America' },
          { id: 'nl-amsterdam', Location: 'Amsterdam, , Netherlands', City: 'Amsterdam', State: '', Country: 'Netherlands', region: 'Europe', subregion: 'Western Europe' },
          { id: 'fr-paris', Location: 'Paris, , France', City: 'Paris', State: '', Country: 'France', region: 'Europe', subregion: 'Western Europe' },
          { id: 'it-milan', Location: 'Milan, , Italy', City: 'Milan', State: '', Country: 'Italy', region: 'Europe', subregion: 'Southern Europe' },
          { id: 'es-barcelona', Location: 'Barcelona, , Spain', City: 'Barcelona', State: '', Country: 'Spain', region: 'Europe', subregion: 'Southern Europe' },
          { id: 'se-stockholm', Location: 'Stockholm, , Sweden', City: 'Stockholm', State: '', Country: 'Sweden', region: 'Europe', subregion: 'Northern Europe' },
          { id: 'no-oslo', Location: 'Oslo, , Norway', City: 'Oslo', State: '', Country: 'Norway', region: 'Europe', subregion: 'Northern Europe' }
        ];
        console.log('Loaded fallback locations:', locations.length);
      }
    } catch (err: any) {
      console.error('Failed to load locations from API, using fallback:', err);
      // Fallback to hardcoded locations if API fails
      // Format matches locations.csv: first field is combination of city, state, country
      locations = [
        { id: 'us-east', Location: 'New York, NY, USA', City: 'New York', State: 'NY', Country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: 'us-west', Location: 'Los Angeles, CA, USA', City: 'Los Angeles', State: 'CA', Country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: 'uk-london', Location: 'London, , UK', City: 'London', State: '', Country: 'UK', region: 'Europe', subregion: 'Western Europe' },
        { id: 'de-hamburg', Location: 'Hamburg, , Germany', City: 'Hamburg', State: '', Country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: 'cn-shanghai', Location: 'Shanghai, , China', City: 'Shanghai', State: '', Country: 'China', region: 'Asia', subregion: 'East Asia' },
        { id: 'sg-singapore', Location: 'Singapore, , Singapore', City: 'Singapore', State: '', Country: 'Singapore', region: 'Asia', subregion: 'Southeast Asia' },
        { id: 'ae-dubai', Location: 'Dubai, , UAE', City: 'Dubai', State: '', Country: 'UAE', region: 'Middle East', subregion: 'Gulf Cooperation Council' },
        { id: 'za-cape-town', Location: 'Cape Town, , South Africa', City: 'Cape Town', State: '', Country: 'South Africa', region: 'Africa', subregion: 'Southern Africa' },
        { id: 'in-mumbai', Location: 'Mumbai, Maharashtra, India', City: 'Mumbai', State: 'Maharashtra', Country: 'India', region: 'Asia', subregion: 'South Asia' },
        { id: 'jp-tokyo', Location: 'Tokyo, , Japan', City: 'Tokyo', State: '', Country: 'Japan', region: 'Asia', subregion: 'East Asia' },
        { id: 'au-sydney', Location: 'Sydney, NSW, Australia', City: 'Sydney', State: 'NSW', Country: 'Australia', region: 'Oceania', subregion: 'Australia and New Zealand' },
        { id: 'ca-toronto', Location: 'Toronto, ON, Canada', City: 'Toronto', State: 'ON', Country: 'Canada', region: 'Americas', subregion: 'North America' },
        { id: 'br-sao-paulo', Location: 'São Paulo, SP, Brazil', City: 'São Paulo', State: 'SP', Country: 'Brazil', region: 'Americas', subregion: 'South America' },
        { id: 'mx-mexico-city', Location: 'Mexico City, , Mexico', City: 'Mexico City', State: '', Country: 'Mexico', region: 'Americas', subregion: 'North America' },
        { id: 'nl-amsterdam', Location: 'Amsterdam, , Netherlands', City: 'Amsterdam', State: '', Country: 'Netherlands', region: 'Europe', subregion: 'Western Europe' },
        { id: 'fr-paris', Location: 'Paris, , France', City: 'Paris', State: '', Country: 'France', region: 'Europe', subregion: 'Western Europe' },
        { id: 'it-milan', Location: 'Milan, , Italy', City: 'Milan', State: '', Country: 'Italy', region: 'Europe', subregion: 'Southern Europe' },
        { id: 'es-barcelona', Location: 'Barcelona, , Spain', City: 'Barcelona', State: '', Country: 'Spain', region: 'Europe', subregion: 'Southern Europe' },
        { id: 'se-stockholm', Location: 'Stockholm, , Sweden', City: 'Stockholm', State: '', Country: 'Sweden', region: 'Europe', subregion: 'Northern Europe' },
        { id: 'no-oslo', Location: 'Oslo, , Norway', City: 'Oslo', State: '', Country: 'Norway', region: 'Europe', subregion: 'Northern Europe' }
      ];
      console.log('Loaded fallback locations:', locations.length);
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

  function handleLocationSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase().trim();
    
    console.log('Location search triggered with query:', query);
    console.log('Available locations:', locations.length);
    
    if (query.length < 2) {
      showLocationSuggestions = false;
      locationSuggestions = [];
      return;
    }
    
    // Filter locations based on input
    const filtered = locations.filter(location => 
      location.Location.toLowerCase().includes(query) ||
      location.City.toLowerCase().includes(query) ||
      (location.State && location.State.toLowerCase().includes(query)) ||
      location.Country.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 suggestions
    
    console.log('Filtered locations:', filtered.length);
    console.log('Filtered results:', filtered.map(l => l.Location));
    
    locationSuggestions = filtered;
    showLocationSuggestions = true;
  }
  
  function selectLocation(location: any) {
    console.log('Selected location:', location);
    console.log('Location ID:', location.id);
    console.log('Location Location:', location.Location);
    console.log('Location City:', location.City);
    console.log('Location type:', typeof location.id);
    console.log('Location ID length:', location.id?.length);
    
    // Use the location ID as the branch identifier for the API
    // This ensures we send a valid branch_id format (UUID or branch name)
    selectedBranch = location.id;
    selectedBranchDisplay = location.Location;
    console.log('Set selectedBranch (ID):', selectedBranch);
    console.log('Set selectedBranchDisplay (name):', selectedBranchDisplay);
    showLocationSuggestions = false;
    locationSuggestions = [];
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

    if (!selectedBranch || selectedBranch.trim() === '' || !selectedBranchDisplay || selectedBranchDisplay.trim() === '') {
      error = 'Please select a branch location';
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

    // Additional validation: Ensure branch_id is not empty and is a valid format
    if (!reviewData.branch_id || reviewData.branch_id.trim() === '') {
      error = 'Branch ID is required. Please select a valid branch location.';
      return;
    }

    // Additional validation: Check if branch_id looks like a valid format
    console.log('Branch ID format check:', {
      branch_id: reviewData.branch_id,
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewData.branch_id),
      isBranchName: /^[a-zA-Z0-9-]+$/.test(reviewData.branch_id),
      length: reviewData.branch_id.length
    });

    // Try to format branch_id if it's not a UUID
    // The backend might expect a specific format for branch names
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewData.branch_id)) {
      // If it's not a UUID, try to format it as a proper branch name
      // Remove any special characters and ensure it's alphanumeric with hyphens
      const formattedBranchId = reviewData.branch_id.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      if (formattedBranchId !== reviewData.branch_id) {
        console.log('Reformatting branch_id:', { original: reviewData.branch_id, formatted: formattedBranchId });
        reviewData.branch_id = formattedBranchId;
      }
    }

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

  async function testAuthentication() {
    try {
      console.log('=== AUTHENTICATION DEBUG ===');
      console.log('Token exists:', !!authState.token);
      console.log('Token length:', authState.token?.length);
      console.log('Token preview:', authState.token?.substring(0, 50) + '...');
      console.log('Token ends with:', authState.token?.substring(-20));
      console.log('User info:', authState.user);
      
      // Check if token looks like JWT (should have 3 parts separated by dots)
      if (authState.token) {
        const parts = authState.token.split('.');
        console.log('Token parts count:', parts.length);
        if (parts.length === 3) {
          try {
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            console.log('JWT Header:', header);
            console.log('JWT Payload:', payload);
            console.log('Token issued at:', new Date(payload.iat * 1000));
            console.log('Token expires at:', new Date(payload.exp * 1000));
            console.log('Current time:', new Date());
            console.log('Token expired:', payload.exp ? Date.now() > payload.exp * 1000 : 'Unknown');
          } catch (e) {
            console.log('Could not decode JWT parts:', e);
          }
        } else {
          console.log('Token does not appear to be JWT format');
        }
      }
      
      console.log('=== TESTING API CALLS ===');
      
      // Test 1: Try the freight forwarders endpoint
      console.log('Testing freight forwarders endpoint...');
      const ffResponse = await fetch('https://logiscorebe.onrender.com/api/freight-forwarders/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Test Company' })
      });
      
      console.log('Freight forwarders response status:', ffResponse.status);
      const ffText = await ffResponse.text();
      console.log('Freight forwarders response:', ffText);
      
      // Test 2: Try a different endpoint to see if it's specific to freight forwarders
      console.log('Testing users/me endpoint...');
      const userResponse = await fetch('https://logiscorebe.onrender.com/api/users/me', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users/me response status:', userResponse.status);
      const userText = await userResponse.text();
      console.log('Users/me response:', userText);
      
      if (ffResponse.ok) {
        successMessage = 'Authentication test successful!';
      } else {
        error = `Authentication test failed: Freight forwarders (${ffResponse.status}) - ${ffText}`;
      }
      
    } catch (err: any) {
      console.error('Auth test error:', err);
      error = `Authentication test error: ${err.message}`;
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
          <!-- Authentication Status -->
          <div class="auth-status">
            <div class="auth-info">
              <span class="auth-icon">🔐</span>
              <span class="auth-text">Logged in as: <strong>{authState.user?.username || authState.user?.full_name || 'User'}</strong></span>
              <span class="auth-type">({authState.user?.user_type || 'shipper'})</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline" on:click={testAuthentication}>
              Test Auth
            </button>
          </div>

          <!-- Company Selection -->
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
              <input 
                type="text" 
                id="branch" 
                bind:value={selectedBranchDisplay}
                placeholder="Start typing to search locations..."
                on:input={handleLocationSearch}
                class="location-input"
                required
              />
              {#if showLocationSuggestions && locationSuggestions.length > 0}
                <div class="location-suggestions">
                  {#each locationSuggestions as suggestion}
                    <div 
                      class="suggestion-item" 
                      on:click={() => selectLocation(suggestion)}
                      on:keydown={(e) => e.key === 'Enter' && selectLocation(suggestion)}
                      tabindex="0"
                    >
                      <strong>{suggestion.Location}</strong>
                      <span class="suggestion-details">{suggestion.City}{suggestion.State ? ', ' + suggestion.State : ''}, {suggestion.Country}</span>
                    </div>
                  {/each}
                </div>
              {/if}
              <p class="help-text">Select a branch location for your review. The location ID will be used for the API while displaying the full location name.</p>
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
                <li>Be specific about the branch/location you're reviewing</li>
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
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
</style>

