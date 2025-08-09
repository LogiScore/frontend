<script>
  import { onMount } from 'svelte';

  let reviews = [];
  let isLoading = true;
  let error = null;

  onMount(async () => {
    try {
      // For now, we'll show a placeholder since the review system isn't implemented yet
      reviews = [
        {
          id: 1,
          company_name: "Global Logistics Inc",
          reviewer_name: "Sarah M.",
          rating: 4.5,
          review_text: "Excellent service and communication throughout the entire process. Highly recommended!",
          date: "2024-01-15"
        },
        {
          id: 2,
          company_name: "Express Freight Solutions",
          reviewer_name: "Michael R.",
          rating: 4.0,
          review_text: "Good experience overall. Timely delivery and fair pricing.",
          date: "2024-01-10"
        },
        {
          id: 3,
          company_name: "Worldwide Shipping Co",
          reviewer_name: "Jennifer L.",
          rating: 5.0,
          review_text: "Outstanding service! They handled our complex international shipment perfectly.",
          date: "2024-01-05"
        }
      ];
    } catch (err) {
      error = 'Failed to load reviews';
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Reviews - LogiScore</title>
  <meta name="description" content="Read customer reviews and ratings for freight forwarders on LogiScore" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>Customer Reviews</h1>
      <p class="hero-subtitle">Read what our community says about freight forwarders</p>
    </div>
  </section>

  <section class="reviews-content">
    <div class="container">
      {#if isLoading}
        <div class="loading">
          <p>Loading reviews...</p>
        </div>
      {:else if error}
        <div class="error">
          <p>{error}</p>
        </div>
      {:else}
        <div class="reviews-header">
          <h2>Latest Reviews</h2>
          <p>Real experiences from verified customers</p>
        </div>

        <div class="reviews-grid">
          {#each reviews as review}
            <div class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <h3 class="reviewer-name">{review.reviewer_name}</h3>
                  <p class="company-name">{review.company_name}</p>
                </div>
                <div class="review-rating">
                  {#each Array(5) as _, i}
                    <span class="star {i < review.rating ? 'filled' : ''}">★</span>
                  {/each}
                  <span class="rating-number">{review.rating}</span>
                </div>
              </div>
              
              <p class="review-text">"{review.review_text}"</p>
              
              <div class="review-footer">
                <span class="review-date">{new Date(review.date).toLocaleDateString()}</span>
              </div>
            </div>
          {/each}
        </div>

        <div class="coming-soon">
          <h3>Review System Coming Soon</h3>
          <p>We're working on implementing a comprehensive review system where you can:</p>
          <ul>
            <li>Write detailed reviews about your experiences</li>
            <li>Rate freight forwarders on multiple criteria</li>
            <li>Read verified customer feedback</li>
            <li>Help other businesses make informed decisions</li>
          </ul>
        </div>
      {/if}
    </div>
  </section>
</main>

<style>
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .reviews-content {
    padding: 80px 0;
  }

  .reviews-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .reviews-header h2 {
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .reviews-header p {
    color: #666;
    font-size: 1.1rem;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto 4rem auto;
  }

  .review-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .review-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .reviewer-name {
    color: #333;
    margin-bottom: 0.25rem;
    font-size: 1.1rem;
  }

  .company-name {
    color: #667eea;
    font-size: 0.9rem;
    margin: 0;
  }

  .review-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .star {
    color: #ddd;
    font-size: 1.2rem;
  }

  .star.filled {
    color: #ffd700;
  }

  .rating-number {
    color: #666;
    font-weight: 500;
  }

  .review-text {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-style: italic;
  }

  .review-footer {
    border-top: 1px solid #eee;
    padding-top: 1rem;
  }

  .review-date {
    color: #999;
    font-size: 0.9rem;
  }

  .coming-soon {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .coming-soon h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .coming-soon p {
    color: #666;
    margin-bottom: 1rem;
  }

  .coming-soon ul {
    text-align: left;
    max-width: 500px;
    margin: 0 auto;
    color: #666;
  }

  .coming-soon li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .loading, .error {
    text-align: center;
    padding: 60px 0;
  }

  .loading p, .error p {
    color: #666;
    font-size: 1.1rem;
  }

  .error p {
    color: #e74c3c;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .reviews-header h2 {
      font-size: 2rem;
    }
    
    .reviews-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

