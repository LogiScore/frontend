<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  
  let freightForwarder: any = null;
  let isLoading = true;
  let error: string | null = null;
  
  $: freightForwarderId = $page.params?.id;
  
  onMount(async () => {
    if (!freightForwarderId) {
      error = 'Invalid freight forwarder ID';
      isLoading = false;
      return;
    }
    
    try {
      isLoading = true;
      // Fetch freight forwarder details
      const details = await apiClient.getFreightForwarder(freightForwarderId);
      freightForwarder = details;
    } catch (err: any) {
      error = err.message || 'Failed to load freight forwarder details';
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>{freightForwarder ? freightForwarder.name : 'Freight Forwarder'} - LogiScore</title>
  <meta name="description" content="Detailed information and reviews for {freightForwarder ? freightForwarder.name : 'this freight forwarder'}" />
</svelte:head>

<main>
  <div class="container">
    {#if isLoading}
      <div class="loading">Loading freight forwarder details...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else if freightForwarder}
      <!-- Header Section -->
      <section class="company-header">
        <div class="company-logo">
          {#if freightForwarder.logo_url}
            <img src={freightForwarder.logo_url} alt="{freightForwarder.name} logo" />
          {:else}
            <div class="logo-placeholder">{freightForwarder.name.charAt(0)}</div>
          {/if}
        </div>
        <div class="company-info">
          {#if freightForwarder.rating}
            <div class="rating">
              <span class="stars">{'★'.repeat(Math.round(freightForwarder.rating))}</span>
              <span class="rating-text">{freightForwarder.rating.toFixed(1)}</span>
              <span class="review-count">({freightForwarder.review_count} reviews)</span>
            </div>
          {/if}
        </div>
      </section>

      <!-- Company Details Section -->
      <section class="company-details">
        <h2>Company Information</h2>
        <div class="details-grid">
          <div class="detail-item">
            <h3>Company Name</h3>
            <p>{freightForwarder.name}</p>
          </div>
          {#if freightForwarder.description}
            <div class="detail-item">
              <h3>Description</h3>
              <p>{freightForwarder.description}</p>
            </div>
          {/if}
          {#if freightForwarder.headquarters_country}
            <div class="detail-item">
              <h3>Headquarters</h3>
              <p>{freightForwarder.headquarters_country}</p>
            </div>
          {/if}
          {#if freightForwarder.global_rank}
            <div class="detail-item">
              <h3>Global Rank</h3>
              <p>#{freightForwarder.global_rank}</p>
            </div>
          {/if}
        </div>
      </section>

      <!-- Review Category Scores Section -->
      <section class="review-scores">
        <h2>Review Category Scores</h2>
        {#if freightForwarder.category_scores && freightForwarder.category_scores.length > 0}
          <div class="scores-grid">
            {#each freightForwarder.category_scores as score}
              <div class="score-item">
                <h3>{score.category_name}</h3>
                <div class="score-display">
                  <span class="score-value">{score.average_score.toFixed(1)}</span>
                  <span class="score-max">/ 5.0</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: {(score.average_score / 5) * 100}%"></div>
                </div>
                <p class="score-count">{score.review_count} reviews</p>
              </div>
            {/each}
          </div>
        {:else}
          <p class="no-scores">No category scores available yet.</p>
        {/if}
      </section>

      <!-- Submit Review Button -->
      <div class="review-section">
        <a href="/reviews?company={freightForwarder.id}" class="btn btn-primary">Submit Review</a>
      </div>
    {:else}
      <div class="not-found">Freight forwarder not found.</div>
    {/if}
  </div>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading, .error, .not-found {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.2rem;
  }

  .error {
    color: #dc3545;
  }

  .not-found {
    color: #666;
  }

  /* Company Header */
  .company-header {
    display: flex;
    align-items: center;
    gap: 3rem;
    padding: 3rem 0;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 3rem;
  }

  .company-logo {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-logo img {
    width: 360px;
    height: 180px;
    border-radius: 16px;
    object-fit: contain;
    padding: 10px;
  }

  .logo-placeholder {
    width: 360px;
    height: 180px;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    font-weight: bold;
    border-radius: 16px;
  }

  .company-info h1 {
    font-size: 2.5rem;
    margin: 0 0 1rem 0;
    color: #333;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stars {
    color: #ffc107;
    font-size: 1.2rem;
  }

  .rating-text {
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
  }

  .review-count {
    color: #666;
    font-size: 0.9rem;
  }

  /* Company Details */
  .company-details {
    margin-bottom: 3rem;
  }

  .company-details h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }

  .details-grid {
    display: grid;
    gap: 2rem;
  }

  .detail-item h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .detail-item p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  /* Review Scores */
  .review-scores {
    margin-bottom: 3rem;
  }

  .review-scores h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }

  .scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .score-item {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }

  .score-item h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .score-display {
    margin-bottom: 1rem;
  }

  .score-value {
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
  }

  .score-max {
    font-size: 1rem;
    color: #666;
  }

  .score-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    background: #667eea;
    transition: width 0.3s ease;
  }

  .score-count {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  .no-scores {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
  }

  /* Review Section */
  .review-section {
    text-align: center;
    padding: 2rem 0;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: 2px solid;
  }

  .btn-primary {
    color: white;
    border-color: #667eea;
    background: #667eea;
  }

  .btn-primary:hover {
    background: #5a6268;
    border-color: #5a6268;
  }

  .btn-outline {
    color: #667eea;
    border-color: #667eea;
    background: transparent;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .company-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .company-info h1 {
      font-size: 2rem;
    }

    .scores-grid {
      grid-template-columns: 1fr;
    }

    .container {
      padding: 1rem;
    }
  }
</style>
