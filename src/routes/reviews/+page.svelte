<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  
  let freightForwarders: any[] = [];
  let branches: any[] = [];
  let selectedCompany: string = '';
  let selectedBranch: string = '';
  let reviewType: string = 'general';
  let isAnonymous: boolean = false;
  let isLoading = true;
  let error: string | null = null;
  
  // Review categories with detailed questions from documentation
  let reviewCategories = [
    {
      id: 'responsiveness',
      name: 'Responsiveness',
      questions: [
        {
          id: 'acknowledges_requests',
          text: 'Acknowledges receipt of requests (for quotation or information) within 30 minutes (even if full response comes later)',
          rating: 0
        },
        {
          id: 'estimated_response_time',
          text: 'Provides clear estimated response time if immediate resolution is not possible',
          rating: 0
        },
        {
          id: 'same_region_response',
          text: 'Responds within 6 hours to rate requests to/from locations within the same region',
          rating: 0
        },
        {
          id: 'other_region_response',
          text: 'Responds within 24 hours to rate requests to/from other regions (e.g. Asia to US, US to Europe)',
          rating: 0
        },
        {
          id: 'emergency_response',
          text: 'Responds to emergency requests (e.g., urgent shipment delay, customs issues) within 30 minutes',
          rating: 0
        }
      ]
    },
    {
      id: 'shipment_management',
      name: 'Shipment Management',
      questions: [
        {
          id: 'proactive_milestones',
          text: 'Proactively sends shipment milestones (e.g., pickup, departure, arrival, delivery) without being asked',
          rating: 0
        },
        {
          id: 'pre_alerts',
          text: 'Sends pre-alerts before vessel ETA',
          rating: 0
        },
        {
          id: 'pod_delivery',
          text: 'Provides POD (proof of delivery) within 24 hours of delivery',
          rating: 0
        },
        {
          id: 'delay_notifications',
          text: 'Proactively notifies delays or disruptions',
          rating: 0
        },
        {
          id: 'recovery_plans',
          text: 'Offers recovery plans in case of delays or missed transshipments',
          rating: 0
        }
      ]
    },
    {
      id: 'documentation',
      name: 'Documentation',
      questions: [
        {
          id: 'draft_bl_issuance',
          text: 'Issues draft B/L or HAWB within 24 hours of cargo departure',
          rating: 0
        },
        {
          id: 'final_invoices',
          text: 'Sends final invoices within 48 hours of shipment completion',
          rating: 0
        },
        {
          id: 'documentation_accuracy',
          text: 'Ensures documentation is accurate and complete on first submission (error rate < X%)',
          rating: 0
        },
        {
          id: 'invoice_accuracy',
          text: 'Final invoice matches quotation (no hidden costs and all calculations and volumes are correct)',
          rating: 0
        }
      ]
    },
    {
      id: 'customer_experience',
      name: 'Customer Experience',
      questions: [
        {
          id: 'follow_up_issues',
          text: 'Follows up on pending issues without the need for reminders',
          rating: 0
        },
        {
          id: 'documentation_rectification',
          text: 'Rectifies documentation (shipping documents and invoices/credit notes) within 48 hours',
          rating: 0
        },
        {
          id: 'named_contacts',
          text: 'Provides named contact person(s) for operations and customer service',
          rating: 0
        },
        {
          id: 'escalation_contact',
          text: 'Offers single point of contact for issue escalation',
          rating: 0
        },
        {
          id: 'professional_tone',
          text: 'Replies in professional tone, avoids jargon unless relevant',
          rating: 0
        }
      ]
    },
    {
      id: 'technology_process',
      name: 'Technology Process',
      questions: [
        {
          id: 'track_and_trace',
          text: 'Offers track-and-trace (either via portal or manual milestone emails)',
          rating: 0
        },
        {
          id: 'document_portal',
          text: 'Has an online document portal or can deliver documents in a single zipped file on request',
          rating: 0
        },
        {
          id: 'system_integration',
          text: 'Integrates with customer systems (e.g., EDI/API) where required',
          rating: 0
        },
        {
          id: 'regular_reporting',
          text: 'Able to provide regular reporting (e.g., weekly shipment report, KPI report)',
          rating: 0
        }
      ]
    },
    {
      id: 'reliability_execution',
      name: 'Reliability & Execution',
      questions: [
        {
          id: 'on_time_pickup',
          text: 'On-time pickup rate (%)',
          rating: 0
        },
        {
          id: 'shipped_as_promised',
          text: 'Shipped as promised (%)',
          rating: 0
        },
        {
          id: 'on_time_delivery',
          text: 'On-time delivery rate (%)',
          rating: 0
        },
        {
          id: 'sop_compliance',
          text: 'Compliance with clients\' SOP (%)',
          rating: 0
        },
        {
          id: 'customs_clearance_errors',
          text: 'Customs clearance error rate (%)',
          rating: 0
        },
        {
          id: 'claims_ratio',
          text: 'Claims ratio (number of claims / total shipments)',
          rating: 0
        }
      ]
    },
    {
      id: 'proactivity_insight',
      name: 'Proactivity & Insight',
      questions: [
        {
          id: 'rate_trends',
          text: 'Offers rate trends and capacity forecasts for key trade lanes',
          rating: 0
        },
        {
          id: 'gri_baf_notifications',
          text: 'Notifies customer of upcoming GRI or BAF changes in advance',
          rating: 0
        },
        {
          id: 'consolidation_suggestions',
          text: 'Provides suggestions for consolidation, better routings, or mode shifts',
          rating: 0
        }
      ]
    },
    {
      id: 'after_hours_support',
      name: 'After Hours Support',
      questions: [
        {
          id: 'emergency_contact',
          text: 'Has 24/7 support or provides emergency contact for after-hours escalation',
          rating: 0
        },
        {
          id: 'weekend_holiday_contact',
          text: 'Weekend or holiday contact provided in advance for critical shipments',
          rating: 0
        }
      ]
    }
  ];

  $: aggregateRating = reviewCategories.reduce((sum, cat) => {
    const categoryRating = cat.questions.reduce((qSum, q) => qSum + q.rating, 0) / cat.questions.filter(q => q.rating > 0).length || 0;
    return sum + categoryRating;
  }, 0) / reviewCategories.filter(cat => cat.questions.some(q => q.rating > 0)).length || 0;
  
  $: ratedQuestions = reviewCategories.reduce((sum, cat) => sum + cat.questions.filter(q => q.rating > 0).length, 0);
  $: totalQuestions = reviewCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
  $: reviewWeight = isAnonymous ? 0.5 : 1.0;
  $: weightedRating = aggregateRating * reviewWeight;

  onMount(async () => {
    try {
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
    if (!selectedCompany) {
      error = 'Please select a company';
      return;
    }

    if (ratedQuestions === 0) {
      error = 'Please provide ratings for at least one category';
      return;
    }

    try {
      // Prepare review data
      const reviewData = {
        freight_forwarder_id: selectedCompany,
        branch_id: selectedBranch,
        review_type: reviewType,
        is_anonymous: isAnonymous,
        review_weight: reviewWeight,
        category_ratings: reviewCategories.map(cat => ({
          category: cat.id,
          questions: cat.questions.map(q => ({
            question: q.id,
            rating: q.rating
          }))
        })),
        aggregate_rating: aggregateRating,
        weighted_rating: weightedRating
      };

      // Submit review (this would need to be implemented in the API)
      console.log('Submitting review:', reviewData);
      
      // For now, show success message
      alert('Review submitted successfully!');
      
      // Reset form
      reviewCategories.forEach(cat => cat.questions.forEach(q => q.rating = 0));
      selectedBranch = '';
      reviewType = 'general';
      isAnonymous = false;
      
    } catch (err: any) {
      error = err.message || 'Failed to submit review';
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
      {:else}
        <form on:submit|preventDefault={submitReview}>
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

            <div class="form-group">
              <label for="branch">Branch Location</label>
              <select id="branch" bind:value={selectedBranch}>
                <option value="">Select branch (optional)</option>
                {#each branches as branch}
                  <option value={branch.id}>{branch.name} - {branch.location}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="reviewType">Review Type</label>
              <select id="reviewType" bind:value={reviewType}>
                <option value="general">General Service</option>
                <option value="import">Import</option>
                <option value="export">Export</option>
                <option value="domestic">Domestic</option>
                <option value="warehousing">Warehousing</option>
              </select>
            </div>
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
            <h2>Rate Your Experience</h2>
            <div class="rating-scale-info">
              <h3>Rating Scale</h3>
              <div class="scale-grid">
                <div class="scale-item">
                  <strong>0 stars:</strong> Not applicable
                </div>
                <div class="scale-item">
                  <strong>1 star:</strong> 25% - Hardly on time / Seldom accurate / Seldom / Submits shipment reports upon request / Claims occur often / Not able to provide any information about trends relating to carriers, customs or geopolitics / Helpdesk is only active during normal working hours
                </div>
                <div class="scale-item">
                  <strong>2 stars:</strong> 50% - Usually on time / Usually accurate / In most cases / Offer some kind of track and trace, either via web or mobile, information is dynamic, or service is free / Regular claims / Provides some information about trends, carriers and geopolitical issues when requested / There is a helpdesk but require more than 2 hours to be activated
                </div>
                <div class="scale-item">
                  <strong>3 stars:</strong> 75% - Most of the time / Accurate most of the time / provides this solution via web or mobile, however information is not always up-to-date, not current (without dynamic vessel tracking), or complete or no access to documents, provided without charge / Occasional claims / Provides updates when requested about trends relating to carriers, customs and geopolitical issues that might impact global trade and the client, and mitigation options the client could consider / There is a helpdesk but requires 1-2 hours until activated
                </div>
                <div class="scale-item">
                  <strong>4 stars:</strong> 100% - Every time / Accurate every time / Provides this solution via web and mobile and information is always up-to-date, complete and current (dynamic vessel tracking), with access to documents, able to schedule reports, provided without charge / Rarely have claims / Provides proactive updates about trends relating to carriers, customs and geopolitical issues that might impact global trade and the client and mitigation options the client could consider / There is a 24/7 helpdesk that's always available
                </div>
              </div>
            </div>
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
                          class="star {i === 0 ? 'not-applicable' : ''} {i <= question.rating ? 'filled' : ''}"
                          on:click={() => handleRatingChange(category.id, question.id, i === 0 ? 0 : i)}
                        >
                          {i === 0 ? 'N/A' : '★'}
                        </button>
                      {/each}
                      <span class="rating-label">
                        {question.rating === 0 ? 'Not applicable' : 
                         question.rating === 1 ? 'Hardly (25%)' :
                         question.rating === 2 ? 'Usually (50%)' :
                         question.rating === 3 ? 'Most of the time (75%)' :
                         'Every time (100%)'}
                      </span>
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
  }
</style>

