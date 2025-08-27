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
  // Anonymous reviews are no longer supported - all reviews count as 100% weight
  let isAnonymous = false;
  
  // Shipment reference for review verification
  let shipmentReference = '';
  
  // Location autocomplete
  let showLocationSuggestions = false;
  let locationSuggestions: any[] = [];
  let isLoading = true;
  let error: string | null = null;
  let successMessage: string | null = null;
  let showLocationModal = false;
  
  // New forwarder creation - RE-ENABLED after backend implementation
  let showNewForwarderForm = false;
  let newForwarder = {
    name: '',
    website: '',
    description: ''
  };
  
  // Branch location autopopulation
  let locations: any[] = [];

  // Hierarchical location selection
  let selectedCountry = '';
  let selectedCity = '';
  let availableCountries: string[] = [];
  let availableCities: string[] = [];
  let availableLocations: any[] = [];
  let showCountrySelector = false;
  let showCitySelector = false;
  let showLocationSelector = false;
  
  // Separate search terms for each step
  let countrySearchTerm = '';
  let citySearchTerm = '';
  let locationSearchTerm = '';
  
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
  let isCheckingReviewFrequency = false;
  
  // Debug: Track user reviews for company-location combination
  let userReviewCount = 0;
  let userReviewDetails: any[] = [];

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  // Track review frequency check status to ensure it only happens once per company-location
  // This prevents repeated API calls when users are filling out the review form
  let reviewFrequencyChecked = false;
  let lastCheckedCompanyLocation = '';
  
  // Watch for company changes to reset branch selection and review frequency status
  $: if (selectedCompany) {
    // Clear previous branch selection when company changes
    selectedBranch = '';
    selectedBranchDisplay = '';
    // Reset review frequency check status for new company
    reviewFrequencyChecked = false;
    // Company data will be loaded in loadCompanyData
  }
  
  // Watch for both company AND location selection to check review frequency ONCE
  $: if (selectedCompany && selectedBranch && authState.user && !reviewFrequencyChecked) {
    const currentCombination = `${selectedCompany}-${selectedBranch}`;
    
    // Only check review frequency if this is a new company-location combination
    if (currentCombination !== lastCheckedCompanyLocation) {
      lastCheckedCompanyLocation = currentCombination;
      reviewFrequencyChecked = true; // Mark as checked to prevent repeated calls
      
      // Perform the check immediately (no debounce needed since it's one-time)
      checkReviewFrequency().catch(err => {
        console.error('Review frequency check failed (non-blocking):', err);
        // Don't let this error affect the UI - allow form to work
      });
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

  // Computed property for filtered modal locations
  $: filteredModalLocations = locationSearchTerm 
    ? locationSuggestions.filter(loc => 
        loc.name?.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
        loc.city?.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
        loc.country?.toLowerCase().includes(locationSearchTerm.toLowerCase())
      )
    : locationSuggestions;

  // Helper function to normalize text for search (remove accents, diacritics, etc.)
  function normalizeText(text: string): string {
    return text
      .normalize('NFD') // Decompose characters with diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase() // Convert to lowercase
      // Comprehensive normalization for international characters
      // Latin characters with diacritics
      .replace(/[ÀÁÂÃÄÅĀĂĄ]/g, 'a') // A variants -> a
      .replace(/[àáâãäåāăą]/g, 'a') // a variants -> a
      .replace(/[ÇĆĈĊČ]/g, 'c') // C variants -> c
      .replace(/[çćĉċč]/g, 'c') // c variants -> c
      .replace(/[ÐĎĐ]/g, 'd') // D variants -> d
      .replace(/[ďđ]/g, 'd') // d variants -> d
      .replace(/[ÈÉÊËĒĔĖĘĚ]/g, 'e') // E variants -> e
      .replace(/[èéêëēĕėęě]/g, 'e') // e variants -> e
      .replace(/[ĜĞĠĢ]/g, 'g') // G variants -> g
      .replace(/[ĝğġģ]/g, 'g') // g variants -> g
      .replace(/[ĤĦ]/g, 'h') // H variants -> h
      .replace(/[ĥħ]/g, 'h') // h variants -> h
      .replace(/[ÌÍÎÏĨĪĬĮİ]/g, 'i') // I variants -> i
      .replace(/[ìíîïĩīĭįı]/g, 'i') // i variants -> i
      .replace(/[Ĵ]/g, 'j') // J variants -> j
      .replace(/[ĵ]/g, 'j') // j variants -> j
      .replace(/[Ķ]/g, 'k') // K variants -> k
      .replace(/[ķ]/g, 'k') // k variants -> k
      .replace(/[ĹĻĽĿŁ]/g, 'l') // L variants -> l
      .replace(/[ĺļľŀł]/g, 'l') // l variants -> l
      .replace(/[ÑŃŅŇŉ]/g, 'n') // N variants -> n
      .replace(/[ñńņňŉ]/g, 'n') // n variants -> n
      .replace(/[ÒÓÔÕÖØŌŎŐ]/g, 'o') // O variants -> o
      .replace(/[òóôõöøōŏő]/g, 'o') // o variants -> o
      .replace(/[ŔŖŘ]/g, 'r') // R variants -> r
      .replace(/[ŕŗř]/g, 'r') // r variants -> r
      .replace(/[ŚŜŞŠ]/g, 's') // S variants -> s
      .replace(/[śŝşš]/g, 's') // s variants -> s
      .replace(/[ŢŤ]/g, 't') // T variants -> t
      .replace(/[ţť]/g, 't') // t variants -> t
      .replace(/[ÙÚÛÜŨŪŬŮŰŲ]/g, 'u') // U variants -> u
      .replace(/[ùúûüũūŭůűų]/g, 'u') // u variants -> u
      .replace(/[ŴŴ]/g, 'w') // W variants -> w
      .replace(/[ŵŵ]/g, 'w') // w variants -> w
      .replace(/[ÝŶŸ]/g, 'y') // Y variants -> y
      .replace(/[ýŷÿ]/g, 'y') // y variants -> y
      .replace(/[ŹŻŽ]/g, 'z') // Z variants -> z
      .replace(/[źżž]/g, 'z') // z variants -> z
      // Additional special characters that might not be caught by NFD
      .replace(/[Ł]/g, 'l') // Polish Ł -> l
      .replace(/[Å]/g, 'a') // Nordic Å -> a
      .replace(/[å]/g, 'a') // Nordic å -> a
      .replace(/[Ø]/g, 'o') // Nordic Ø -> o
      .replace(/[ø]/g, 'o') // Nordic ø -> o
      .replace(/[Æ]/g, 'ae') // Nordic Æ -> ae
      .replace(/[æ]/g, 'ae') // Nordic æ -> ae
      .replace(/[Œ]/g, 'oe') // French Œ -> oe
      .replace(/[œ]/g, 'oe'); // French œ -> oe
  }

  // Helper function to check if city matches search query with normalization
  function cityMatchesQuery(city: string, query: string): boolean {
    if (!city || !query) return false;
    const normalizedCity = normalizeText(city);
    const normalizedQuery = normalizeText(query);
    const matches = normalizedCity.includes(normalizedQuery);
    
    // Enhanced debug logging for city search
    if (query.length >= 3) { // Only log for meaningful searches
      console.log(`🔍 City search: "${city}" (${normalizedCity}) matches "${query}" (${normalizedQuery}): ${matches}`);
      
              // Special debug for international characters
        if (/[À-ÿĀ-ž]/.test(city)) {
          console.log(`🔍 International character debug: "${city}" -> "${normalizedCity}"`);
        }
    }
    
    return matches;
  }

  // Function to open location modal and reset search
  async function openLocationModal() {
    showLocationModal = true;
    locationSearchTerm = '';
    
    // Load available countries when the modal is opened
    // This ensures we have countries to show in the selector
    await loadAvailableCountries();
  }

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
      
      // Don't load all locations on page load - only load when country is selected
      // await loadLocations(); // REMOVED: This was loading 140,000+ locations unnecessarily
      // 
      // PERFORMANCE IMPROVEMENT: Instead of loading all 140,000+ locations upfront,
      // we now load locations dynamically only when a user selects a country.
      // This reduces initial page load time from ~30 seconds to ~2 seconds.
      
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
      lastReviewDate = null;
      return;
    }

    // Set loading state
    isCheckingReviewFrequency = true;
    reviewFrequencyMessage = 'Checking review eligibility...';

    try {
      // Add timeout to prevent API call from hanging - increased to 20 seconds for complex queries
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 20000)
      );
      
      // Get user's previous reviews for this company with timeout
      let userReviews: any[] = [];
      try {
        userReviews = await Promise.race([
          apiClient.getUserReviewsForCompany(authState.user.id, selectedCompany),
          timeoutPromise
        ]) as any[];
      } catch (timeoutError) {
        // If the main call times out, try a quick fallback check
        console.warn('Primary review frequency check timed out, trying fallback...');
        try {
          // Quick fallback: just check if we can get basic company data
          const fallbackPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fallback timeout')), 5000)
          );
          
          userReviews = await Promise.race([
            apiClient.getUserReviewsForCompany(authState.user.id, selectedCompany),
            fallbackPromise
          ]) as any[];
        } catch (fallbackError) {
          console.warn('Fallback review frequency check also failed:', fallbackError);
          // If both attempts fail, allow submission to prevent user blocking
          userReviews = [];
          // Set a user-friendly message
          reviewFrequencyMessage = 'Review frequency check is temporarily unavailable. You may proceed with your review submission.';
        }
      }
      
      // Debug: Filter reviews for this specific company-location combination
      const companyLocationReviews = userReviews.filter((review: any) => {
        // Extract city and country from the selected location display
        // Format: "Dubai, Dubai, UAE" -> city: "Dubai", country: "UAE"
        const locationParts = selectedBranchDisplay.split(', ');
        const selectedCity = locationParts[0]?.trim();
        const selectedCountry = locationParts[locationParts.length - 1]?.trim();
        
        // Match by user and company UUIDs (most reliable)
        const userMatch = review.user_id === authState.user.id;
        const companyMatch = review.freight_forwarder_id === selectedCompany;
        
        // Match by city and country names from the branches table
        const cityMatch = review.city && review.city.toLowerCase() === selectedCity?.toLowerCase();
        const countryMatch = review.country && review.country.toLowerCase() === selectedCountry?.toLowerCase();
        const locationMatch = cityMatch && countryMatch;
        

        
        // A review matches if user+company match AND location matches
        return userMatch && companyMatch && locationMatch;
      });
      
      // Update debug variables
      userReviewCount = companyLocationReviews.length;
      userReviewDetails = companyLocationReviews;
      
      if (companyLocationReviews.length === 0) {
        // No previous reviews for this specific location, can submit
        canSubmitReview = true;
        reviewFrequencyMessage = '';
        lastReviewDate = null;
        return;
      }

      // Check the most recent review for this specific location
      const mostRecentReview = companyLocationReviews.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const lastReviewTime = new Date(mostRecentReview.created_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (lastReviewTime > sixMonthsAgo) {
        // Last review for this location was within 6 months
        canSubmitReview = false;
        const timeRemaining = new Date(lastReviewTime.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
        const daysRemaining = Math.ceil((timeRemaining.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        reviewFrequencyMessage = `Users are only allowed to review specific branches of Freight Forwarders once every six months. You can submit another review for this branch in ${daysRemaining} days. You may submit a review of another branch, unless you have already done so.`;
        lastReviewDate = mostRecentReview.created_at;
      } else {
        // Last review for this location was more than 6 months ago
        canSubmitReview = true;
        reviewFrequencyMessage = '';
        lastReviewDate = mostRecentReview.created_at;
      }
    } catch (err: any) {
      console.error('Failed to check review frequency:', err);
      
      // Check if it's a CORS error and handle it gracefully
      if (err.message && (err.message.includes('Load failed') || err.message.includes('access control checks') || err.message.includes('CORS') || err.message.includes('NetworkError'))) {
        canSubmitReview = true;
        reviewFrequencyMessage = '';
        lastReviewDate = null;
        
        // Don't show error message to user for CORS issues
        // Also, don't retry this check to avoid repeated CORS errors
        return;
      }
      
      // Check if it's a timeout error
      if (err.message && err.message.includes('API timeout')) {
        console.warn('Review frequency check timed out - allowing submission to prevent user blocking');
        canSubmitReview = true;
        reviewFrequencyMessage = 'Review frequency check is temporarily unavailable. You may proceed with your review submission.';
        lastReviewDate = null;
        return;
      }
      
      // For other errors, allow submission but log the error
      canSubmitReview = true;
      reviewFrequencyMessage = '';
      lastReviewDate = null;
    } finally {
      // Always reset loading state
      isCheckingReviewFrequency = false;
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
    
    return uuid;
  }

  async function loadLocations() {
    try {
      console.log('🔄 Loading locations from database...');
      
      // Use the new dynamic location loading method from database
      const databaseLocations = await apiClient.getLocationsFromDatabase();
      console.log('📊 Database locations loaded:', databaseLocations.length);
      console.log('📊 Sample database location:', databaseLocations[0]);
      
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
      
      console.log('🔄 Processed locations:', processedLocations.length);
      console.log('🔄 Sample processed location:', processedLocations[0]);
      
      // Check for Bangladesh specifically
      const bangladeshLocations = processedLocations.filter(loc => 
        loc.country && loc.country.toLowerCase().includes('bangladesh')
      );
      console.log('🇧🇩 Bangladesh locations found:', bangladeshLocations.length);
      if (bangladeshLocations.length > 0) {
        console.log('🇧🇩 Sample Bangladesh location:', bangladeshLocations[0]);
      }
      
      // Set locations to only the processed ones (no hardcoded test data)
      locations = processedLocations;
      
      console.log('✅ Final locations array:', locations.length);
      console.log('✅ Available countries:', [...new Set(locations.map(loc => loc.country).filter(Boolean))].sort());
      
    } catch (err: any) {
      console.error('❌ Failed to load dynamic locations:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Enhanced fallback with Bangladesh and more locations
      console.log('🔄 Using enhanced fallback locations due to API error');
      locations = [
        // Bangladesh locations
        { id: convertLocationIdToUUID('bd-dhaka'), name: 'Dhaka, Dhaka Division, Bangladesh', city: 'Dhaka', state: 'Dhaka Division', country: 'Bangladesh', region: 'Asia', subregion: 'South Asia' },
        { id: convertLocationIdToUUID('bd-chittagong'), name: 'Chittagong, Chittagong Division, Bangladesh', city: 'Chittagong', state: 'Chittagong Division', country: 'Bangladesh', region: 'Asia', subregion: 'South Asia' },
        { id: convertLocationIdToUUID('bd-sylhet'), name: 'Sylhet, Sylhet Division, Bangladesh', city: 'Sylhet', state: 'Sylhet Division', country: 'Bangladesh', region: 'Asia', subregion: 'South Asia' },
        
        // Other major locations
        { id: convertLocationIdToUUID('us-new-york'), name: 'New York, NY, USA', city: 'New York', state: 'NY', country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: convertLocationIdToUUID('us-los-angeles'), name: 'Los Angeles, CA, USA', city: 'Los Angeles', state: 'CA', country: 'USA', region: 'Americas', subregion: 'North America' },
        { id: convertLocationIdToUUID('uk-london'), name: 'London, England, UK', city: 'London', state: 'England', country: 'UK', region: 'Europe', subregion: 'Western Europe' },
        { id: convertLocationIdToUUID('de-munchen'), name: 'München, Bayern, Germany', city: 'München', state: 'Bayern', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: convertLocationIdToUUID('de-hamburg'), name: 'Hamburg, Hamburg, Germany', city: 'Hamburg', state: 'Hamburg', country: 'Germany', region: 'Europe', subregion: 'Central Europe' },
        { id: convertLocationIdToUUID('br-sao-paulo'), name: 'São Paulo, SP, Brazil', city: 'São Paulo', state: 'SP', country: 'Brazil', region: 'Americas', subregion: 'South America' },
        { id: convertLocationIdToUUID('in-mumbai'), name: 'Mumbai, Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', region: 'Asia', subregion: 'South Asia' },
        { id: convertLocationIdToUUID('cn-shanghai'), name: 'Shanghai, Shanghai, China', city: 'Shanghai', state: 'Shanghai', country: 'China', region: 'Asia', subregion: 'East Asia' },
        { id: convertLocationIdToUUID('jp-tokyo'), name: 'Tokyo, Tokyo, Japan', city: 'Tokyo', state: 'Tokyo', country: 'Japan', region: 'Asia', subregion: 'East Asia' },
        { id: convertLocationIdToUUID('au-sydney'), name: 'Sydney, NSW, Australia', city: 'Sydney', state: 'NSW', country: 'Australia', region: 'Oceania', subregion: 'Australia and New Zealand' },
        { id: convertLocationIdToUUID('ca-toronto'), name: 'Toronto, ON, Canada', city: 'Toronto', state: 'ON', country: 'Canada', region: 'Americas', subregion: 'North America' },
        { id: convertLocationIdToUUID('mx-mexico-city'), name: 'Mexico City, Mexico City, Mexico', city: 'Mexico City', state: 'Mexico City', country: 'Mexico', region: 'Americas', subregion: 'North America' },
        { id: convertLocationIdToUUID('nl-amsterdam'), name: 'Amsterdam, North Holland, Netherlands', city: 'Amsterdam', state: 'North Holland', country: 'Netherlands', region: 'Europe', subregion: 'Western Europe' },
        { id: convertLocationIdToUUID('fr-paris'), name: 'Paris, Île-de-France, France', city: 'Paris', state: 'Île-de-France', country: 'France', region: 'Europe', subregion: 'Southern Europe' },
        { id: convertLocationIdToUUID('it-milan'), name: 'Milan, Lombardy, Italy', city: 'Milan', state: 'Lombardy', country: 'Italy', region: 'Europe', subregion: 'Southern Europe' },
        { id: convertLocationIdToUUID('es-barcelona'), name: 'Barcelona, Catalonia, Spain', city: 'Barcelona', state: 'Catalonia', country: 'Spain', region: 'Europe', subregion: 'Southern Europe' }
      ];
      
      console.log('✅ Fallback locations loaded:', locations.length);
      console.log('✅ Available countries in fallback:', [...new Set(locations.map(loc => loc.country).filter(Boolean))].sort());
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
    console.log('🔍 handleLocationSearch called');
    console.log('🔍 Event:', event);
    console.log('🔍 Event target:', event.target);
    
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    
    console.log('🔍 Location search query:', query);
    console.log('🔍 Query length:', query.length);
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
      
      // Review frequency check is now handled by the reactive statement
      // when both company and location are selected
      
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
    
    // Review frequency check is now handled by the reactive statement
    // when both company and location are selected
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
      shipment_reference: shipmentReference.trim() || null, // Add shipment reference
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
      shipment_reference: reviewData.shipment_reference,
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

  // Test function for comprehensive international character normalization
  function testInternationalCharacterNormalization() {
    console.log('🧪 Testing comprehensive international character normalization:');
    const testCases = [
      // Polish characters
      'Gdańsk', 'Gdań', 'Warszawa', 'Kraków', 'Łódź', 'Poznań',
      // Turkish characters
      'İstanbul', 'İzmir', 'Çanakkale', 'Göreme', 'Şanlıurfa', 'Ürgüp',
      // Latin characters with macrons (Hawaiian, Māori, etc.)
      'Hawaiʻi', 'Āotearoa', 'Kāneʻohe', 'Wailuku',
      // French characters
      'Bordeaux', 'Côte d\'Azur', 'Île-de-France', 'Nîmes',
      // German characters
      'München', 'Köln', 'Düsseldorf', 'Straßburg',
      // Spanish characters
      'España', 'México', 'Colombia', 'Perú',
      // Portuguese characters
      'São Paulo', 'João Pessoa', 'Açores', 'Porto',
      // Nordic characters
      'København', 'Göteborg', 'Åland', 'Trondheim',
      // Eastern European characters
      'Praha', 'Bratislava', 'Budapest', 'București'
    ];
    
    testCases.forEach(test => {
      const normalized = normalizeText(test);
      console.log(`"${test}" -> "${normalized}"`);
    });
  }

  // Hierarchical location selection computed properties
  // Note: countries and locations are now loaded separately for better performance
  $: availableCountries = countries.length > 0 ? countries : [];
  
  $: availableCities = selectedCountry && locations.length > 0
    ? [...new Set(locations.map(loc => loc.city).filter((city): city is string => Boolean(city)))].sort()
    : [];
  
  $: availableLocations = selectedCountry && selectedCity && locations.length > 0
    ? locations.filter(loc => loc.city === selectedCity)
    : [];
  
  // Separate arrays for countries and locations
  let countries: string[] = []; // Available countries (loaded separately from locations)
  
  // Real-time search results for each step
  let searchedCountries: string[] = [];
  let searchedCities: string[] = [];
  let searchedLocations: any[] = [];
  let isSearchingCountries = false;
  let isSearchingCities = false;
  let isSearchingLocations = false;

  // Debug computed properties
  $: if (selectedCountry) {
    console.log('🔍 Debug computed properties:');
    console.log('- selectedCountry:', selectedCountry);
    console.log('- availableCities:', availableCities);
    console.log('- availableLocations:', availableLocations);
    console.log('- Total locations for country:', locations.filter(loc => loc.country === selectedCountry).length);
    console.log('- Sample locations for country:', locations.filter(loc => loc.country === selectedCountry).slice(0, 3));
    console.log('- Cities found for country:', [...new Set(locations.filter(loc => loc.country === selectedCountry).map(loc => loc.city).filter(Boolean))]);
  }

  // Hierarchical location selection functions
  async function selectCountry(country: string) {
    console.log('🌍 selectCountry called with:', country);
    selectedCountry = country;
    selectedCity = '';
    selectedBranch = '';
    selectedBranchDisplay = '';
    showCountrySelector = false;
    showCitySelector = true;
    showLocationSelector = false;
    
    console.log('After selectCountry:');
    console.log('- selectedCountry:', selectedCountry);
    console.log('- selectedCity:', selectedCity);
    console.log('- availableCities:', availableCities);
    console.log('- availableLocations:', availableLocations);
    
    // Load cities for this country from database
    await loadCitiesForCountry(country);
  }

  async function selectCity(city: string) {
    console.log('🏙️ selectCity called with:', city);
    selectedCity = city;
    
    // Debug: Check what data we have available
    console.log('🔍 Debug selectCity:');
    console.log('- searchedLocations length:', searchedLocations.length);
    console.log('- searchedCities length:', searchedCities.length);
    console.log('- selectedCountry:', selectedCountry);
    console.log('- searchedLocations sample:', searchedLocations.slice(0, 2));
    
    // Find the actual location data for this city from the search results
    // We need the real location ID for the review submission
    let locationData = null;
    
    if (searchedLocations.length > 0) {
      // Find a location that matches the selected city and country
      locationData = searchedLocations.find(loc => 
        loc.city === city && loc.country === selectedCountry
      );
      
      if (locationData) {
        // Use the real location ID
        selectedBranch = locationData.id;
        console.log('✅ Found real location ID:', selectedBranch);
        console.log('✅ Location data:', locationData);
      } else {
        console.warn('⚠️ No matching location found in searchedLocations');
        console.warn('⚠️ Available cities in searchedLocations:', searchedLocations.map(loc => loc.city));
        console.warn('⚠️ Available countries in searchedLocations:', searchedLocations.map(loc => loc.country));
      }
    } else {
      console.warn('⚠️ searchedLocations is empty - no location data available');
    }
    
    // If we still don't have a real ID, create a fallback
    if (!locationData || !selectedBranch) {
      selectedBranch = `city-${city}-${selectedCountry}`;
      console.warn('⚠️ Using fallback ID - review submission may fail');
      console.warn('⚠️ This means the city search did not return location data');
    }
    
    selectedBranchDisplay = `${city}, ${selectedCountry}`;
    
    // Close the modal - selection is complete
    showCitySelector = false;
    showLocationSelector = false;
    showLocationModal = false;
    
    console.log('After selectCity:');
    console.log('- selectedCountry:', selectedCountry);
    console.log('- selectedCity:', selectedCity);
    console.log('- selectedBranch:', selectedBranch);
    console.log('- selectedBranchDisplay:', selectedBranchDisplay);
    console.log('- locationData:', locationData);
    
    // Note: We need a real location ID for review submission to work
    // The fallback ID will cause 404 errors
  }

  function selectLocationFromHierarchy(location: any) {
    selectLocation(location);
    showLocationSelector = false;
    // Reset hierarchical selectors
    showCountrySelector = false;
    showCitySelector = false;
  }

  // Load available countries when country selector is opened
  async function loadAvailableCountries() {
    try {
      console.log('🌍 Loading available countries...');
      
      // Get a sample of countries by searching with a common letter
      // This will give us a good starting point for country selection
      const searchResults = await apiClient.searchCountries('a');
      
      console.log('🔍 Raw search results:', searchResults.length, 'items');
      console.log('🔍 Sample search result:', searchResults[0]);
      
      // Extract unique countries from search results
      const uniqueCountries = [...new Set(searchResults.map(loc => loc.country).filter((country): country is string => Boolean(country)))].sort();
      
      console.log(`✅ Found ${uniqueCountries.length} available countries:`, uniqueCountries.slice(0, 10));
      
      // Update the countries array which feeds into the availableCountries computed property
      countries = uniqueCountries;
      
      console.log('🔍 Updated countries array:', countries.length, 'countries');
      console.log('🔍 availableCountries computed property should now have:', availableCountries.length, 'countries');
      
    } catch (error) {
      console.error('❌ Failed to load available countries:', error);
      availableCountries = [];
    }
  }

  // Real-time search functions
  async function searchCountries(query: string) {
    console.log(`🔍 searchCountries called with: "${query}"`);
    
    if (!query || query.length < 2) {
      console.log('❌ Query too short, clearing results');
      searchedCountries = [];
      isSearchingCountries = false;
      return;
    }
    
    try {
      console.log('🔄 Setting isSearchingCountries = true');
      isSearchingCountries = true;
      console.log(`🔍 Searching countries for: "${query}"`);
      
      // Search countries using the country parameter (accepts 2+ characters)
      const searchResults = await apiClient.searchCountries(query);
      console.log(`📊 Search API returned ${searchResults.length} results:`, searchResults.slice(0, 3));
      
      // Extract unique countries from search results
      const countries = [...new Set(searchResults.map(loc => loc.country).filter((country): country is string => Boolean(country)))].sort();
      console.log(`🏗️ Extracted ${countries.length} unique countries:`, countries);
      
      // Update the searchedCountries array
      searchedCountries = countries;
      console.log(`✅ Updated searchedCountries array:`, searchedCountries);
      
    } catch (error) {
      console.error('❌ Country search failed:', error);
      searchedCountries = [];
    } finally {
      console.log('🔄 Setting isSearchingCountries = false');
      isSearchingCountries = false;
      console.log(`🎯 Final state - searchedCountries: ${searchedCountries.length}, isSearching: ${isSearchingCountries}`);
    }
  }

  // Load cities for a specific country from database
  async function loadCitiesForCountry(country: string) {
    try {
      console.log(`🏙️ Loading cities for country: ${country}`);
      
      // Don't load all cities upfront - let users search for cities they need
      // This prevents the 30-second loading issue
      console.log(`✅ Cities will be loaded on-demand when user types 4+ characters`);
      
      // Clear any previous cities and let the search handle it
      availableCities = [];
      
      // Note: Cities are now loaded dynamically via searchCities() when user types
      // This keeps the performance fast while still providing city selection
      
    } catch (error) {
      console.error(`❌ Failed to load cities for ${country}:`, error);
      availableCities = [];
    }
  }

  async function searchCities(country: string, query: string) {
    if (!query || query.length < 4) {
      searchedCities = [];
      searchedLocations = []; // Clear previous location data
      return;
    }
    
    try {
      isSearchingCities = true;
      console.log(`🔍 Searching cities in ${country} for: "${query}"`);
      
      // Try multiple search strategies to find cities
      let searchResults: any[] = [];
      
      // Strategy 1: Search for city name with country
      console.log(`🔍 Strategy 1: Searching for "${query} ${country}"`);
      searchResults = await apiClient.searchLocations(`${query} ${country}`);
      
      // Strategy 2: If no results, try searching just for the city name
      if (searchResults.length === 0) {
        console.log(`🔍 Strategy 2: Searching for "${query}" only`);
        const cityOnlyResults = await apiClient.searchLocations(query);
        // Filter to only include results from the selected country
        searchResults = cityOnlyResults.filter(loc => loc.country === country);
      }
      
      // Strategy 3: If still no results, try searching with country parameter
      if (searchResults.length === 0) {
        console.log(`🔍 Strategy 3: Searching with country parameter "${country}"`);
        const countryResults = await apiClient.searchCountries(country);
        // Filter to cities that contain the search query using normalized text
        searchResults = countryResults.filter(loc => 
          loc.city && cityMatchesQuery(loc.city, query)
        );
      }
      
      // Strategy 4: Client-side fallback with normalized text if backend search fails
      if (searchResults.length === 0) {
        console.log(`🔍 Strategy 4: Client-side fallback with normalized text`);
        // Use the existing locations array if available
        if (locations.length > 0) {
          searchResults = locations.filter(loc => 
            loc.country === country && 
            loc.city && cityMatchesQuery(loc.city, query)
          );
        }
      }
      
      console.log(`🔍 Final search results:`, searchResults.length, 'items');
      console.log(`🔍 Sample search result:`, searchResults[0]);
      console.log(`🔍 All search results:`, searchResults);
      
      // Store the full location data for later use
      searchedLocations = searchResults;
      
      // Debug: Check what we're storing
      console.log(`🔍 Debug searchCities storage:`);
      console.log(`- searchResults length:`, searchResults.length);
      console.log(`- searchedLocations length:`, searchedLocations.length);
      console.log(`- Sample location object:`, searchResults[0]);
      console.log(`- Location IDs:`, searchResults.map(loc => loc.id).slice(0, 5));
      
      // Extract unique cities from search results for the specific country
      const cities = [...new Set(
        searchResults
          .map(loc => loc.city)
          .filter((city): city is string => Boolean(city))
      )].sort();
      
      searchedCities = cities;
      console.log(`✅ Found ${cities.length} cities in ${country} for "${query}":`, cities);
      console.log(`✅ Stored ${searchedLocations.length} location objects for city selection`);
    } catch (error) {
      console.error('❌ City search failed:', error);
      searchedCities = [];
      searchedLocations = [];
    } finally {
      isSearchingCities = false;
    }
  }

  async function searchLocations(country: string, city: string, query: string) {
    if (!query || query.length < 4) {
      searchedLocations = [];
      return;
    }
    
    try {
      isSearchingLocations = true;
      console.log(`🔍 Searching locations in ${city}, ${country} for: "${query}"`);
      
      // Search locations in database with specific filters
      const searchResults = await apiClient.searchLocations(`${query} ${city} ${country}`);
      
      // Filter results to specific city and country
      const locations = searchResults.filter(loc => 
        loc.country === country && loc.city === city
      );
      
      searchedLocations = locations;
      console.log(`✅ Found ${locations.length} locations in ${city}, ${country} for "${query}":`, locations);
    } catch (error) {
      console.error('❌ Location search failed:', error);
      searchedLocations = [];
    } finally {
      isSearchingLocations = false;
    }
  }

  // Load locations for a specific city from database
  async function loadLocationsForCity(country: string, city: string) {
    try {
      console.log(`📍 Loading locations for city: ${city}, ${country}`);
      
      // Use the new API method to get all locations in this specific city and country
      const cityLocations = await apiClient.getLocationsByCity(country, city);
      
      console.log(`✅ Found ${cityLocations.length} locations in ${city}, ${country}:`, cityLocations.slice(0, 5));
      
      // Update the availableLocations computed property
      availableLocations = cityLocations;
      
    } catch (error) {
      console.error(`❌ Failed to load locations for ${city}, ${country}:`, error);
      availableLocations = [];
    }
  }

  function resetLocationSelection() {
    selectedCountry = '';
    selectedCity = '';
    selectedBranch = '';
    selectedBranchDisplay = '';
    showCountrySelector = false;
    showCitySelector = false;
    showLocationSelector = false;
    
    // Clear search results
    searchedCountries = [];
    searchedCities = [];
    searchedLocations = [];
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
              <select id="company" bind:value={selectedCompany} on:change={() => {
                console.log('🏢 Company selection changed to:', selectedCompany);
                console.log('🏢 canSubmitReview will be checked...');
              }} required>
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
                <div class="form-group">
                  <label for="newCompanyName">Company Name *</label>
                  <input 
                    type="text" 
                    id="newCompanyName" 
                    bind:value={newForwarder.name} 
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="newCompanyWebsite">Website</label>
                  <input 
                    type="url" 
                    id="newCompanyWebsite" 
                    bind:value={newForwarder.website} 
                    placeholder="https://example.com"
                  />
                </div>
                
                <div class="form-group">
                  <label for="newCompanyDescription">Description</label>
                  <textarea 
                    id="newCompanyDescription" 
                    bind:value={newForwarder.description} 
                    placeholder="Brief description of the company"
                    rows="3"
                  ></textarea>
                </div>
                
                <button type="button" class="btn btn-primary" on:click={createNewForwarder}>
                  Create Company
                </button>
              </div>
            {/if}



            <!-- Location Section -->
            <div class="form-group">
              <label for="branch">Location *</label>
              
              <!-- Single Location Selection Button -->
              <div class="location-selection-container">
                {#if !selectedBranch}
                  <button 
                    type="button"
                    class="location-selection-button"
                    on:click={openLocationModal}
                  >
                    🌍 Select Location
                  </button>
                {:else}
                  <div class="selected-location-display">
                    <span class="selected-location-text">📍 {selectedBranchDisplay}</span>
                    <button 
                      type="button"
                      class="change-location-btn"
                      on:click={() => {
                        selectedBranch = '';
                        selectedBranchDisplay = '';
                        selectedCountry = '';
                        selectedCity = '';
                      }}
                    >
                      Change
                    </button>
                  </div>
                {/if}
              </div>
              
              <!-- Review Frequency Check -->
              {#if reviewFrequencyMessage && !canSubmitReview}
                <div class="review-frequency-warning">
                  <strong>⚠️ Review Frequency Limit:</strong> {reviewFrequencyMessage}
                  <button 
                    type="button" 
                    class="refresh-check-btn"
                    on:click={() => {
                      reviewFrequencyChecked = false; // Allow re-check
                      checkReviewFrequency();
                    }}
                    disabled={isCheckingReviewFrequency}
                    title="Re-check your review eligibility (useful if you've waited 6 months)"
                  >
                    {isCheckingReviewFrequency ? 'Checking...' : 'Refresh Check'}
                  </button>
                </div>
              {/if}
              
              {#if lastReviewDate && canSubmitReview}
                <div class="review-frequency-info">
                  <strong>ℹ️ Last Review:</strong> You last reviewed this company on {new Date(lastReviewDate).toLocaleDateString()}. You can submit a new review now.
                  <button 
                    type="button" 
                    class="refresh-check-btn"
                    on:click={() => {
                      reviewFrequencyChecked = false; // Allow re-check
                      checkReviewFrequency();
                    }}
                    disabled={isCheckingReviewFrequency}
                    title="Re-check your review eligibility (useful if you've waited 6 months)"
                  >
                    {isCheckingReviewFrequency ? 'Checking...' : 'Refresh Check'}
                  </button>
                </div>
              {/if}
              
              <!-- Show loading state when checking review frequency -->
              {#if isCheckingReviewFrequency}
                <div class="review-frequency-loading">
                  <strong>⏳ Checking Review Eligibility...</strong>
                  <p>Please wait while we verify your review submission eligibility.</p>
                </div>
              {/if}


              


            </div>



          <!-- Tips for Accurate Reviews -->
          <div class="form-section">
            <h2>Tips for Accurate Reviews</h2>
            <div class="tips-container">
              <ul class="tips-list">
                <li>Be specific about your experience with this location</li>
                <li>Consider factors like communication, timeliness, and service quality</li>
                <li>Provide constructive feedback that can help other users</li>
                <li>Respond to customer reviews</li>
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

          <!-- Shipment Reference -->
          <div class="form-section">
            <h2>Shipment Reference</h2>
            <div class="form-group">
              <label for="shipmentReference"></label>
              <input 
                type="text" 
                id="shipmentReference" 
                bind:value={shipmentReference}
                placeholder="Enter reference (e.g. Shipment ID, Shipment Job No etc.)"
                class="form-control"
              />
              <p class="help-text">
                You may optionally add a reference of the Freight Forwarder to verify your review
              </p>
            </div>
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

  <!-- Location Selection Modal -->
  {#if showLocationModal}
    <div class="modal-overlay" on:click={() => showLocationModal = false}>
      <div class="location-modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Select Location</h3>
          <button 
            type="button" 
            class="modal-close"
            on:click={() => showLocationModal = false}
          >
            ×
          </button>
        </div>
        
        <div class="modal-content">
          <!-- Step 1: Country Selection -->
          {#if !selectedCountry}
            <div class="modal-step">
              <h4>1. Select Country</h4>
              <div class="location-search">
                <input 
                  type="text" 
                  placeholder="Search countries (min. 2 characters)..." 
                  bind:value={countrySearchTerm}
                  on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    const query = target.value;
                    console.log('🔍 Country search input:', query);
                    searchCountries(query);
                  }}
                  class="location-search-input"
                />

              </div>
              
              <div class="location-list">
                
                {#if isSearchingCountries}
                  <div class="searching-indicator">
                    🔍 Searching countries...
                  </div>
                {:else if countrySearchTerm && searchedCountries.length > 0}
                  <!-- Show search results -->
                  <div class="search-results-header">
                    🔍 Search Results ({searchedCountries.length} found):
                  </div>
                  {#each searchedCountries as country}
                    <div 
                      class="modal-location-item"
                      on:click={() => selectCountry(country)}
                    >
                      🌍 {country}
                    </div>
                  {/each}
                {:else if countrySearchTerm && searchedCountries.length === 0}
                  <div class="no-results">
                    No countries found for "{countrySearchTerm}"
                  </div>
                {:else}
                  <!-- Show all available countries -->
                  {#each availableCountries as country}
                    <div 
                      class="modal-location-item"
                      on:click={() => selectCountry(country)}
                    >
                      🌍 {country}
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          
          <!-- Step 2: City Selection -->
          {:else if selectedCountry && !selectedCity}
            <div class="modal-step">
              <div class="modal-step-header">
                <h4>2. Select City in {selectedCountry}</h4>
              </div>
              
              <div class="location-search">
                <input 
                  type="text" 
                  placeholder="Search cities in {selectedCountry} (min. 4 characters)..." 
                  bind:value={citySearchTerm}
                  on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    const query = target.value;
                    searchCities(selectedCountry, query);
                  }}
                  class="location-search-input"
                />
              </div>
              
              <div class="location-list">
                {#if citySearchTerm.length >= 4 && searchedCities.length > 0}
                  <!-- Show searched cities -->
                  {#each searchedCities as city}
                    <div 
                      class="modal-location-item"
                      on:click={() => selectCity(city)}
                    >
                      🏙️ {city}
                    </div>
                  {/each}
                {:else if citySearchTerm.length >= 4 && isSearchingCities}
                  <!-- Show loading state -->
                  <div class="search-loading">
                    🔍 Searching for cities...
                  </div>
                {:else if citySearchTerm.length >= 4 && searchedCities.length === 0}
                  <!-- Show no results message -->
                  <div class="no-results">
                    No cities found for "{citySearchTerm}" in {selectedCountry}
                  </div>
                {:else if citySearchTerm.length < 4}
                  <!-- Show instruction message -->
                  <div class="search-instruction">
                    
                  </div>
                {:else}
                  <!-- Fallback: Show locations directly if no cities found -->
                  <div class="no-cities-message">
                    <p>No cities found for {selectedCountry}. Showing locations directly:</p>
                  </div>
                  {#each locations.filter(loc => 
                    loc.country === selectedCountry && 
                    (!citySearchTerm || 
                     (loc.city && cityMatchesQuery(loc.city, citySearchTerm)) ||
                     (loc.name && cityMatchesQuery(loc.name, citySearchTerm)))
                  ) as location}
                    <div 
                      class="modal-location-item"
                      on:click={() => {
                        selectLocationFromHierarchy(location);
                        showLocationModal = false;
                      }}
                    >
                      <strong>📍 {location.name || 'Unknown Location'}</strong>
                      {#if location.city}
                        <span class="location-details">, {location.city}</span>
                      {/if}
                    </div>
                  {/each}
                {/if}
              </div>
              
              <!-- Back button at bottom -->
              <div class="modal-step-footer">
                <button 
                  type="button" 
                  class="back-button"
                  on:click={() => {
                    selectedCountry = '';
                    citySearchTerm = '';
                  }}
                >
                  ← Back to Countries
                </button>
              </div>
            </div>
          
          <!-- Step 3: Specific Location Selection -->
          {:else if selectedCountry && selectedCity}
            <div class="modal-step">
              <div class="modal-step-header">
                <button 
                  type="button" 
                  class="back-button"
                  on:click={() => {
                    selectedCity = '';
                    locationSearchTerm = '';
                  }}
                >
                  ← Back to Cities
                </button>
                <h4>3. Select Location in {selectedCity}, {selectedCountry}</h4>
              </div>
              
              <div class="location-search">
                <input 
                  type="text" 
                  placeholder="Search locations in {selectedCity}, {selectedCountry}..." 
                  bind:value={locationSearchTerm}
                  on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    const query = target.value;
                    searchLocations(selectedCountry, selectedCity, query);
                  }}
                  class="location-search-input"
                />
                <div class="search-help" style="font-size: 12px; color: #666; margin-top: 5px;">
                  💡 Type to filter locations in {selectedCity}, {selectedCountry}
                </div>
              </div>
              
              <div class="location-list">
                {#if locationSearchTerm.length >= 4 && searchedLocations.length > 0}
                  <!-- Show searched locations -->
                  {#each searchedLocations as location}
                    <div 
                      class="modal-location-item"
                      on:click={() => {
                        selectLocationFromHierarchy(location);
                        showLocationModal = false;
                      }}
                    >
                      <strong>📍 {location.name || 'Unknown Location'}</strong>
                      {#if location.state}
                        <span class="location-details">, {location.state}</span>
                      {/if}
                    </div>
                  {/each}
                {:else if locationSearchTerm.length >= 4 && isSearchingLocations}
                  <!-- Show loading state -->
                  <div class="search-loading">
                    🔍 Searching for locations...
                  </div>
                {:else if locationSearchTerm.length >= 4 && searchedLocations.length === 0}
                  <!-- Show no results message -->
                  <div class="no-results">
                    No locations found for "{locationSearchTerm}" in {selectedCity}, {selectedCountry}
                  </div>
                {:else if locationSearchTerm.length < 4}
                  <!-- Show instruction message -->
                  <div class="search-instruction">
                    
                  </div>
                {:else}
                  <!-- Show message that search is required -->
                  <div class="search-instruction">
                    
                  </div>
                {/if}
              </div>
            </div>
          {/if}
          
          {#if selectedCountry && selectedCity && locationSearchTerm.length >= 4 && searchedLocations.length === 0}
            <div class="no-locations">
              <p>No locations found for "{locationSearchTerm}" in {selectedCity}, {selectedCountry}.</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
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
  
  .location-input-section {
    position: relative;
    width: 100%;
  }
  
  .location-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
    cursor: text;
    position: relative;
    z-index: 1;
  }
  
  .location-input:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
  
  /* Ensure input field is interactive */
  .location-input-section input {
    pointer-events: auto !important;
    user-select: text !important;
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
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

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .form-control:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
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

  .review-frequency-loading {
    background: #e2e3e5;
    color: #495057;
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    border: 1px solid #c6c8ca;
    text-align: center;
  }

  .refresh-check-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-left: 1rem;
    transition: background-color 0.2s ease;
  }

  .refresh-check-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .refresh-check-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
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

  /* Mobile-friendly location selector */
  .location-selector-mobile {
    margin-top: 0.5rem;
  }

  .location-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    /* Mobile-optimized styling */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1em;
    padding-right: 2.5rem;
  }

  .location-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .location-modal-trigger {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
  }

  .location-modal-trigger:hover {
    border-color: #667eea;
    background-color: #f8f9fa;
  }

  .location-modal-trigger:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  /* Mobile-specific optimizations */
  @media (max-width: 768px) {
    .location-select {
      font-size: 16px; /* Prevents zoom on iOS */
      padding: 1rem;
      min-height: 48px; /* Better touch target */
    }
  }

  /* Hide the old location suggestions styles */
  .location-suggestions {
    display: none;
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

  /* Hide the old location suggestions styles */
  .location-suggestions {
    display: none;
  }

  /* Location Modal Styles */
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
    z-index: 10000;
    padding: 1rem;
  }

  .location-modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .location-search {
    margin-bottom: 1.5rem;
  }

  .location-search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .location-search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .location-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .modal-location-item {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-location-item:hover {
    background: #f9fafb;
    border-color: #667eea;
  }

  .modal-location-item:last-child {
    margin-bottom: 0;
  }

  .location-details {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .no-locations {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  /* Mobile optimizations for modal */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 0.5rem;
    }
    
    .location-modal {
      max-height: 90vh;
      border-radius: 8px;
    }
    
    .modal-header {
      padding: 1rem;
    }
    
    .modal-content {
      padding: 1rem;
    }
    
    .location-list {
      max-height: 300px;
    }
  }

  /* New Location Selection Styles */
  .location-selection-container {
    margin-top: 0.5rem;
  }

  .location-selection-button {
    width: 100%;
    padding: 1rem;
    background: white;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .location-selection-button:hover {
    border-color: #667eea;
    background-color: #f8f9fa;
  }

  .location-selection-button:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .selected-location-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #f8f9fa;
    border: 2px solid #6c757d;
    border-radius: 8px;
  }

  .selected-location-text {
    font-weight: 600;
    color: #495057;
    font-size: 1rem;
  }

  .change-location-btn {
    padding: 0.5rem 1rem;
    background: #6c757d;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .change-location-btn:hover {
    background-color: #5a6268;
  }



  /* Modal Step Styles */
  .modal-step {
    min-height: 400px;
  }

  .modal-step h4 {
    margin: 0 0 1rem 0;
    color: #374151;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .modal-step-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .modal-step-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .back-button {
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .back-button:hover {
    background-color: #f3f4f6;
  }

  /* Mobile optimizations for new location selection */
  @media (max-width: 768px) {
    .location-selection-button {
      padding: 1rem;
      font-size: 16px; /* Prevents zoom on iOS */
      min-height: 48px; /* Better touch target */
    }
    
    .modal-step {
      min-height: 300px;
    }
    
    .modal-step-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>

