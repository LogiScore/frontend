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
  
  // Review categories with multiple questions each
  const reviewCategories = [
    {
      id: 'responsiveness',
      name: 'Responsiveness',
      questions: [
        {
          id: 'initial_response',
          text: 'How quickly does the freight forwarder respond to your initial inquiries?',
          rating: 0
        },
        {
          id: 'follow_up_speed',
          text: 'How fast is their follow-up communication?',
          rating: 0
        },
        {
          id: 'business_hours',
          text: 'How available are they during business hours?',
          rating: 0
        },
        {
          id: 'emergency_response',
          text: 'How capable are they in emergency response situations?',
          rating: 0
        }
      ]
    },
    {
      id: 'shipment_management',
      name: 'Shipment Management',
      questions: [
        {
          id: 'tracking_visibility',
          text: 'How effective is their tracking and shipment visibility?',
          rating: 0
        },
        {
          id: 'issue_resolution',
          text: 'How proactive are they in resolving shipment issues?',
          rating: 0
        },
        {
          id: 'delivery_accuracy',
          text: 'How accurate are their delivery estimates and execution?',
          rating: 0
        },
        {
          id: 'documentation_handling',
          text: 'How well do they handle shipment documentation?',
          rating: 0
        }
      ]
    },
    {
      id: 'documentation',
      name: 'Documentation',
      questions: [
        {
          id: 'customs_docs',
          text: 'How accurate and complete is their customs documentation?',
          rating: 0
        },
        {
          id: 'shipping_docs',
          text: 'How complete are their shipping documents?',
          rating: 0
        },
        {
          id: 'invoice_accuracy',
          text: 'How accurate are their invoices and billing documents?',
          rating: 0
        },
        {
          id: 'compliance_requirements',
          text: 'How well do they meet compliance requirements?',
          rating: 0
        }
      ]
    },
    {
      id: 'customer_experience',
      name: 'Customer Experience',
      questions: [
        {
          id: 'staff_professionalism',
          text: 'How professional is their staff?',
          rating: 0
        },
        {
          id: 'communication_clarity',
          text: 'How clear is their communication?',
          rating: 0
        },
        {
          id: 'problem_resolution',
          text: 'How effective are they at resolving problems?',
          rating: 0
        },
        {
          id: 'service_consistency',
          text: 'How consistent is their service quality?',
          rating: 0
        }
      ]
    },
    {
      id: 'technology_process',
      name: 'Technology Process',
      questions: [
        {
          id: 'online_tracking',
          text: 'How effective are their online tracking systems?',
          rating: 0
        },
        {
          id: 'digital_documentation',
          text: 'How well do they utilize digital documentation?',
          rating: 0
        },
        {
          id: 'communication_platforms',
          text: 'How effective are their communication platforms?',
          rating: 0
        },
        {
          id: 'process_automation',
          text: 'How well do they automate their processes?',
          rating: 0
        }
      ]
    },
    {
      id: 'reliability_execution',
      name: 'Reliability & Execution',
      questions: [
        {
          id: 'on_time_delivery',
          text: 'How reliable are they in on-time delivery?',
          rating: 0
        },
        {
          id: 'service_consistency',
          text: 'How consistent is their service delivery?',
          rating: 0
        },
        {
          id: 'commitment_fulfillment',
          text: 'How well do they fulfill their commitments?',
          rating: 0
        },
        {
          id: 'error_rate',
          text: 'How low is their error rate?',
          rating: 0
        }
      ]
    },
    {
      id: 'proactivity_insight',
      name: 'Proactivity & Insight',
      questions: [
        {
          id: 'route_optimization',
          text: 'How proactive are they in suggesting route optimizations?',
          rating: 0
        },
        {
          id: 'cost_saving',
          text: 'How proactive are they in cost-saving recommendations?',
          rating: 0
        },
        {
          id: 'risk_mitigation',
          text: 'How proactive are they in risk mitigation advice?',
          rating: 0
        },
        {
          id: 'industry_insights',
          text: 'How valuable are their industry insights and recommendations?',
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
          text: 'How accessible are they for emergency contacts?',
          rating: 0
        },
        {
          id: 'support_options',
          text: 'How many 24/7 support options do they provide?',
          rating: 0
        },
        {
          id: 'crisis_response',
          text: 'How capable are they in crisis response?',
          rating: 0
        },
        {
          id: 'weekend_holiday',
          text: 'How available are they during weekends and holidays?',
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
    const category = reviewCategories.find(cat => cat.id === categoryId);
    if (category) {
      const question = category.questions.find(q => q.id === questionId);
      if (question) {
        question.rating = rating;
      }
    }
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

          <!-- Rating Categories -->
          <div class="form-section">
            <h2>Rate Your Experience</h2>
            <p class="rating-instructions">
              Rate each question from 0-4 stars:<br>
              0 = Not applicable, 1 = Hardly (25%), 2 = Usually (50%), 3 = Most of the time (75%), 4 = Every time (100%)
            </p>

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
                <span class="value">{reviewWeight * 100}%</span>
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

