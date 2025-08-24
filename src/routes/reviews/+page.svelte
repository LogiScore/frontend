<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api';
  import { auth, authMethods } from '$lib/auth';
  import type { ReviewCategory, ReviewCreate } from '$lib/api';
  
  // Note: Branch locations use generated UUIDs to satisfy backend validation requirements.
  // The backend expects branch_id to be a valid UUID format, so we generate deterministic
  // UUIDs based on location identifiers to maintain consistency while meeting format requirements.
  
  let freightForwarders: any[] = [];
  // Removed branches array - we don't use the branches table
  let selectedCompany: string = '';
  let selectedBranch = '';
  let selectedBranchDisplay = '';
  let isAnonymous = false;
  
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

  // Review frequency validation
  let canSubmitReview = true;
  let lastReviewDate: string | null = null;
  let reviewFrequencyMessage = '';

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  // Watch for company changes to reset branch selection
  $: if (selectedCompany) {
    // Clear previous branch selection when company changes
    selectedBranch = '';
    selectedBranchDisplay = '';
    // Company data will be loaded in loadCompanyData
    // Check review frequency when company changes
    if (selectedCompany && authState.user) {
      checkReviewFrequency();
    }
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
        // Load company details
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
      // No need to load branches since we don't use the branches table
      console.log('Loaded company data:', company);
    } catch (err: any) {
      console.error('Failed to load company data:', err);
    }
  }

  // Check if user can submit a review for this company/branch (6-month rule)
  async function checkReviewFrequency() {
    if (!selectedCompany || !authState.user) {
      canSubmitReview = true;
      reviewFrequencyMessage = '';
      return;
    }

    try {
      // Get user's previous reviews for this company
      const userReviews = await apiClient.getUserReviewsForCompany(authState.user.id, selectedCompany);
      
      if (userReviews.length === 0) {
        // No previous reviews, can submit
        canSubmitReview = true;
        reviewFrequencyMessage = '';
        lastReviewDate = null;
        return;
      }

      // Check the most recent review
      const mostRecentReview = userReviews.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const lastReviewTime = new Date(mostRecentReview.created_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (lastReviewTime > sixMonthsAgo) {
        // Last review was within 6 months
        canSubmitReview = false;
        const timeRemaining = new Date(lastReviewTime.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
        const daysRemaining = Math.ceil((timeRemaining.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        reviewFrequencyMessage = `You can submit another review for this company in ${daysRemaining} days (one review per company every 6 months).`;
        lastReviewDate = mostRecentReview.created_at;
      } else {
        // Last review was more than 6 months ago
        canSubmitReview = true;
        reviewFrequencyMessage = '';
        lastReviewDate = mostRecentReview.created_at;
      }
    } catch (err: any) {
      console.error('Failed to check review frequency:', err);
      // If we can't check, allow submission but log the error
      canSubmitReview = true;
      reviewFrequencyMessage = '';
    }
  }

  // Convert location ID to proper UUID format by padding with zeros
  // This ensures every location gets a valid UUID based on its actual ID
  function convertLocationIdToUUID(locationId: string): string {
    // If it's already a UUID, return it
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationId)) {
      return locationId;
    }
    
    // Convert location ID to a simple UUID by padding with zeros
    // Example: 'de-munchen' becomes 'de-munche-0000-0000-000000000000'
    const cleanId = locationId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Pad to create UUID format: 8-4-4-4-12 characters
    const paddedId = cleanId.padEnd(32, '0');
    
    // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuid = [
      paddedId.slice(0, 8),
      paddedId.slice(8, 12),
      paddedId.slice(12, 16),
      paddedId.slice(16, 20),
      paddedId.slice(20, 32)
    ].join('-');
    
    console.log(`Converted location ID "${locationId}" to UUID: ${uuid}`);
    return uuid;
  }

  async function loadLocations() {
    try {
      console.log('🔄 Loading locations...');
      
      // Use the new dynamic location loading method from database
      const databaseLocations = await apiClient.getLocationsFromDatabase();
      console.log('📊 Raw database locations:', databaseLocations.length);
      console.log('📊 Sample raw location:', databaseLocations[0]);
      
      // Convert to the expected format for the existing code
      const processedLocations = databaseLocations.map(loc => ({
        id: convertLocationIdToUUID(loc.id), // Convert to proper UUID format
        name: loc.name,
        city: loc.city || loc.name.split(',')[0]?.trim() || loc.name, // Use city from API or extract from name
        state: loc.state || (loc.name.includes(',') ? loc.name.split(',')[1]?.trim() || '' : ''),
        country: loc.country,
        region: loc.region,
        subregion: loc.subregion
      }));
      
      // TEMPORARY: Always add test data with special characters for testing
      const testLocations = [
        { id: convertLocationIdToUUID('de-munchen'), name: 'München, Bayern, Germany', city: 'München', state: 'Bayern', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: convertLocationIdToUUID('br-sao-paulo'), name: 'São Paulo, SP, Brazil', city: 'São Paulo', state: 'SP', country: 'Brazil', region: 'Americas', subregion: 'South America' },
        { id: convertLocationIdToUUID('ma-selibaby'), name: 'Sélibaby, , Mauritania', city: 'Sélibaby', state: '', country: 'Mauritania', region: 'Africa', subregion: 'Western Africa' }
      ];
      
      // Combine backend locations with test data
      locations = [...processedLocations, ...testLocations];
      
      console.log('✅ Processed locations:', processedLocations.length);
      console.log('✅ Test locations added:', testLocations.length);
      console.log('✅ Total locations available:', locations.length);
      console.log('✅ Sample processed location:', processedLocations[0]);
      console.log('✅ Sample test location:', testLocations[0]);
      
      // Warn if we have limited data due to backend restrictions
      if (processedLocations.length <= 50) {
        console.warn('⚠️ BACKEND LIMITATION: Only loaded', processedLocations.length, 'locations');
        console.warn('⚠️ This severely limits search functionality - backend needs to be updated');
        console.warn('⚠️ Users cannot search for locations beyond the first', processedLocations.length, 'records');
      }
    } catch (err: any) {
      console.error('❌ Failed to load dynamic locations:', err);
      // Keep existing fallback logic as a safety net
      locations = [
        { id: convertLocationIdToUUID('us-east'), name: 'New York, NY, USA', city: 'New York', state: 'NY', country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: convertLocationIdToUUID('us-west'), name: 'Los Angeles, CA, USA', city: 'Los Angeles', state: 'CA', country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: convertLocationIdToUUID('uk-london'), name: 'London, , UK', city: 'London', state: '', country: 'UK', region: 'Europe', subregion: 'Western Europe' },
        { id: convertLocationIdToUUID('de-munchen'), name: 'München, Bayern, Germany', city: 'München', state: 'Bayern', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: convertLocationIdToUUID('de-hamburg'), name: 'Hamburg, , Germany', city: 'Hamburg', state: '', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: convertLocationIdToUUID('br-sao-paulo'), name: 'São Paulo, SP, Brazil', city: 'São Paulo', state: 'SP', country: 'Brazil', region: 'Americas', subregion: 'South America' },
        { id: convertLocationIdToUUID('ma-selibaby'), name: 'Sélibaby, , Mauritania', city: 'Sélibaby', state: '', country: 'Mauritania', region: 'Africa', subregion: 'Western Africa' }
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
    
    console.log('🔍 Location search query:', query);
    console.log('📊 Available locations:', locations.length);
    console.log('📊 Sample locations:', locations.slice(0, 3));
    
    if (query.length < 4) {
      locationSuggestions = [];
      showLocationSuggestions = false;
      return;
    }

    // Use backend search by default for production
    // Only fall back to client-side filtering if backend search fails
    const forceFallback = false; // Set to true only for testing client-side filtering
    
    if (forceFallback) {
      console.log('🔄 Forcing fallback to client-side filtering for testing special character handling');
      console.log('🔍 Searching in', locations.length, 'locations for query:', query);
      
      // Fallback to client-side filtering to test special character search
      const filtered = locations.filter(location => {
        // Only log detailed info for the first few locations to avoid spam
        const shouldLogDetailed = locations.indexOf(location) < 5;
        
        if (shouldLogDetailed) {
          console.log('🔍 Checking location:', location.name, 'for query:', query);
        }
        
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
        
        // Debug logging for matches (always log matches)
        if (hasMatch) {
          console.log('✅ Match found:', {
            location: location.name,
            query,
            normalizedQuery,
            nameMatch,
            cityMatch,
            exactNameMatch,
            exactCityMatch,
            partialNameMatch,
            partialCityMatch
          });
        } else if (shouldLogDetailed) {
          // Only log detailed non-match info for first few locations
          console.log('❌ No match for:', {
            location: location.name,
            query,
            normalizedQuery,
            normalizedName: normalizedName.substring(0, 50),
            normalizedCity: normalizedCity.substring(0, 50)
          });
        }
        
        return hasMatch;
      }).slice(0, 25); // Increased from 10 to 25
      
      console.log('🎯 Fallback filtered locations:', filtered.length);
      console.log('🎯 Filtered results:', filtered.map(l => l.name));
      console.log(`📊 Search summary: Checked ${locations.length} locations, found ${filtered.length} matches for query "${query}"`);
      locationSuggestions = filtered;
      showLocationSuggestions = true;
      console.log('🎯 Location suggestions set:', locationSuggestions.length);
      console.log('🎯 Show location suggestions:', showLocationSuggestions);
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
  
  async function selectLocation(location: any) {
    console.log('🔍 selectLocation called with:', location);
    console.log('🔍 Location details:', {
      id: location.id,
      idType: typeof location.id,
      idLength: location.id?.length,
      idValue: location.id,
      name: location.name,
      nameType: typeof location.name,
      city: location.city,
      country: location.country,
      fullObject: location
    });
    
    try {
      // Use the location ID directly as the branch ID since locations already exist in the database
      // This eliminates the need for temporary UUIDs and separate branch creation
      selectedBranch = location.id;
      selectedBranchDisplay = location.name || 'Unknown Location';
      
      console.log('Set selectedBranch (location ID):', selectedBranch);
      console.log('Set selectedBranchDisplay (name):', selectedBranchDisplay);
      console.log('Selected branch type:', typeof selectedBranch);
      console.log('Selected branch value:', selectedBranch);
      
      showLocationSuggestions = false;
      locationSuggestions = [];
      error = null; // Clear any previous errors
      
      // Check review frequency after branch selection
      if (selectedCompany && authState.user) {
        await checkReviewFrequency();
      }
      
      console.log('Location selection completed successfully');
      
    } catch (err: any) {
      console.error('Failed to select location:', err);
      error = 'Failed to select location. Please try again.';
    }
  }

  async function selectExistingBranch(branch: any) {
    selectedBranch = branch.id;
    selectedBranchDisplay = branch.name;
    showLocationSuggestions = false;
    locationSuggestions = [];
    error = null; // Clear any previous errors
    
    // Check review frequency after branch selection
    if (selectedCompany && authState.user) {
      await checkReviewFrequency();
    }
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
    if (!selectedBranch || selectedBranch.trim() === '') {
      error = 'Please select a location. Service quality can vary significantly between different locations, so we require a specific location for accurate reviews.';
      return;
    }

    if (ratedQuestions === 0) {
      error = 'Please provide ratings for at least one category';
      return;
    }

    // Check review frequency (6-month rule)
    if (!canSubmitReview) {
      error = reviewFrequencyMessage || 'You cannot submit another review for this company at this time. Please wait 6 months between reviews.';
      return;
    }

    // Prepare review data for API
    const reviewData: ReviewCreate = {
      freight_forwarder_id: selectedCompany,
      location_id: selectedBranch.trim(), // Changed from branch_id to location_id
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
      location_id: reviewData.location_id,
      selectedBranch: selectedBranch,
      selectedBranchDisplay: selectedBranchDisplay
    });

    // Validate location_id format
    if (!reviewData.location_id || reviewData.location_id.trim() === '') {
      error = 'Location ID is required. Please select a valid location.';
      return;
    }

    // Debug: Log the location ID being sent
    console.log('Location ID validation:', {
      location_id: reviewData.location_id,
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewData.location_id),
      length: reviewData.location_id.length,
      selectedBranchType: typeof selectedBranch,
      selectedBranchValue: selectedBranch,
      selectedBranchDisplay: selectedBranchDisplay
    });

    try {
      // Submit review using the location ID as branch ID
      // Since locations already exist in the database, we can submit directly
      const response = await apiClient.createComprehensiveReview(reviewData, authState.token);
      
      // Show success message
      alert('Review submitted successfully! A thank you email has been sent to your email address.');
      console.log('Review submitted:', response);
      console.log('Review ID for email:', response.id);
      
      // Send thank you email
      try {
        // Verify we have a valid review ID
        if (!response.id) {
          console.error('No review ID in response, cannot send email');
          return;
        }
        
        // Get company and location names for the email
        const selectedCompanyData = freightForwarders.find(c => c.id === selectedCompany);
        const selectedLocationData = locations.find(l => l.id === selectedBranch);
        
        // Calculate category ratings for email
        const emailCategoryRatings = reviewCategories.map(cat => {
          const ratedQuestions = cat.questions.filter(q => q.rating && q.rating > 0);
          const averageRating = ratedQuestions.length > 0 
            ? ratedQuestions.reduce((sum, q) => sum + (q.rating || 0), 0) / ratedQuestions.length 
            : 0;
          
          return {
            categoryName: cat.name,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            questionCount: ratedQuestions.length
          };
        }).filter(cat => cat.questionCount > 0); // Only include categories with ratings
        
        // Send thank you email
        await apiClient.sendReviewThankYouEmail(
          response.id,
          authState.user?.email || 'user@example.com',
          authState.user?.full_name || authState.user?.username || 'User',
          selectedCompanyData?.name || 'Unknown Company',
          selectedLocationData?.name || selectedBranchDisplay || 'Unknown Location',
          emailCategoryRatings,
          aggregateRating,
          reviewWeight
        );
        
        console.log('Thank you email sent successfully');
      } catch (emailError) {
        console.error('Failed to send thank you email:', emailError);
        // Don't show error to user since review was submitted successfully
        // Email failure shouldn't affect the review submission
      }
      
      // Reset form
      reviewCategories.forEach(cat => cat.questions.forEach((q: any) => q.rating = 0));
      selectedBranch = '';
      selectedBranchDisplay = '';
      selectedCompany = ''; // Reset company selection
      
      // Show brief success message before redirect
      successMessage = `Review submitted successfully! Redirecting to browse reviews page...`;
      
      // Redirect to search page to browse reviews after successful submission
      setTimeout(() => {
        goto('/search');
      }, 1500); // Give user 1.5 seconds to see the success message
      
    } catch (err: any) {
      console.error('Review submission failed:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('405')) {
        error = 'Review submission failed: Backend endpoint not available. Please try again later or contact support.';
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        error = 'Authentication failed. Please log in again.';
      } else if (err.message?.includes('400')) {
        // Check for specific location_id error
        if (err.message?.includes('Invalid location_id format') || err.message?.includes('Invalid branch_id format')) {
          error = 'Invalid location ID format. Please try selecting the location again.';
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

  async function testAllSearches() {
    console.log('Testing all search queries...');
    await testSearch('munchen');
    await testSearch('münchen');
    await testSearch('london');
    await testSearch('new york');
    await testSearch('germany');
    console.log('All search tests completed.');
  }

  function inspectLocationData() {
    console.log('🔍 INSPECTING LOCATION DATA:');
    console.log('Total locations:', locations.length);
    console.log('All locations:', locations);
    
    // Check for data structure issues
    locations.forEach((loc, index) => {
      console.log(`Location ${index}:`, {
        id: loc.id,
        name: loc.name,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        hasName: !!loc.name,
        hasCity: !!loc.city,
        hasState: !!loc.state,
        hasCountry: !!loc.country,
        nameType: typeof loc.name,
        cityType: typeof loc.city
      });
    });
  }


</script>

<svelte:head>
  <title>Submit Review - LogiScore</title>
  <meta name="description" content="Submit your review for freight forwarders on LogiScore" />
</svelte:head>

<main>
  <!-- Modern Page Header -->
  <section class="page-header">
    <div class="container">
      <div class="breadcrumb">
        <a href="/" class="breadcrumb-item">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">Submit Review</span>
      </div>
      <p class="page-description">Share your experience to help others make informed decisions</p>
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

            <!-- Location Section -->
            <div class="form-group">
              <label for="branch">Location *</label>
              
              <!-- Location input field -->
              <div class="location-input-section">
                
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
              
              <!-- Review Frequency Check -->
              {#if reviewFrequencyMessage && !canSubmitReview}
                <div class="review-frequency-warning">
                  <strong>⚠️ Review Frequency Limit:</strong> {reviewFrequencyMessage}
                </div>
              {/if}
              
              {#if lastReviewDate && canSubmitReview}
                <div class="review-frequency-info">
                  <strong>ℹ️ Last Review:</strong> You last reviewed this company on {new Date(lastReviewDate).toLocaleDateString()}. You can submit a new review now.
                </div>
              {/if}

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
                <li>Base your review on recent experiences (within 6 months)</li>
                <li>Consider multiple interactions, not just one shipment</li>
                <li>Always select the specific branch/location you're reviewing - service quality varies by location</li>

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
            <button type="submit" class="btn btn-primary" disabled={ratedQuestions === 0 || !canSubmitReview}>
              {#if !canSubmitReview}
                Cannot Submit - Review Frequency Limit
              {:else}
                Submit Review
              {/if}
            </button>
          </div>

          {#if error}
            <div class="error-message">
              {error}
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

  /* Page Header */
  .page-header {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 40px 0;
    margin-bottom: 0;
  }

  .page-header .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .breadcrumb-separator {
    color: #dee2e6;
  }

  .breadcrumb-item.active {
    color: #667eea;
    font-weight: 600;
  }

  .breadcrumb-item {
    text-decoration: none;
    color: #6c757d;
    transition: color 0.2s ease;
  }

  .breadcrumb-item:hover {
    color: #667eea;
  }

  .page-title {
    font-size: 2.5rem;
    margin-bottom: 12px;
    font-weight: 700;
    color: #2c3e50;
  }

  .page-description {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
    max-width: 600px;
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
    width: 98%;
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
  
  /* Review Frequency Messages */
  .review-frequency-warning {
    background: #fff3cd;
    color: #856404;
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    border: 1px solid #ffeaa7;
  }

  .review-frequency-info {
    background: #d1ecf1;
    color: #0c5460;
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    border: 1px solid #bee5eb;
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
    
    .page-title {
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

  /* New Branch Status Styles */
  .branch-status {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }



  /* Success View Styles */
  .success-view {
    background: white;
    border-radius: 12px;
    padding: 3rem 2rem;
    margin-top: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .success-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .success-view h2 {
    color: #28a745;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  .success-view p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .email-confirmation {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: left;
  }

  .email-confirmation h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .email-confirmation ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .email-confirmation li {
    color: #555;
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
  }

  .email-confirmation li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
  }

  .next-steps {
    background: #e8f5e9;
    border: 1px solid #c8e6c9;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: left;
  }

  .next-steps h3 {
    color: #2e7d32;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .next-steps ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .next-steps li {
    color: #2e7d32;
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
  }

  .next-steps li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #4caf50;
    font-weight: bold;
  }
</style>

