<script lang="ts">
  
</script>

<svelte:head>
  <title>How LogiScore Works - Freight Forwarder Review Platform</title>
  <meta name="description" content="Learn how LogiScore works. Discover, compare, and review freight forwarders with our simple 3-step process." />
</svelte:head>



<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">How LogiScore Works</h1>
      <p class="hero-subtitle">
        A simple 3-step process to find the perfect freight forwarder for your business
      </p>
    </div>
  </div>
</section>

<!-- Process Steps -->
<section class="process">
  <div class="container">
    <div class="steps-grid">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Search & Discover</h3>
          <p>Find freight forwarders by name, location, or service type. Browse detailed company profiles and ratings from real customers.</p>
          <div class="step-features">
            <ul>
              <li>Search by company name or location</li>
              <li>Filter by rating and services</li>
              <li>View detailed company profiles</li>
              <li>Compare multiple companies</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Compare & Evaluate</h3>
          <p>Compare companies side-by-side. Read detailed reviews and ratings from real customers who have used their services.</p>
          <div class="step-features">
            <ul>
              <li>Read authentic customer reviews</li>
              <li>Compare ratings and scores</li>
              <li>View detailed category breakdowns</li>
              <li>Check company verification status</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Review & Share</h3>
          <p>Share your experience by leaving reviews and ratings. Help other businesses make informed decisions.</p>
          <div class="step-features">
            <ul>
              <li>Write detailed reviews</li>
              <li>Rate specific categories</li>
              <li>Share anonymously or verified</li>
              <li>Help the community grow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Rating System -->
<section class="rating-system">
  <div class="container">
    <h2>Our Rating System</h2>
    <p class="section-subtitle">We use a comprehensive 7-category rating system to provide detailed insights</p>
    
    <div class="categories-grid">
      <div class="category">
        <div class="category-icon">⚡</div>
        <h4>Responsiveness</h4>
        <p>Response times and communication quality</p>
      </div>
      
      <div class="category">
        <div class="category-icon">📦</div>
        <h4>Shipment Management</h4>
        <p>Tracking and milestone updates</p>
      </div>
      
      <div class="category">
        <div class="category-icon">📄</div>
        <h4>Documentation Accuracy</h4>
        <p>B/L, invoices, and error rates</p>
      </div>
      
      <div class="category">
        <div class="category-icon">👥</div>
        <h4>Customer Experience</h4>
        <p>Professional service and follow-up</p>
      </div>
      
      <div class="category">
        <div class="category-icon">��</div>
        <h4>Tech & Process</h4>
        <p>Online portals and integrations</p>
      </div>
      
      <div class="category">
        <div class="category-icon">🎯</div>
        <h4>Reliability & Execution</h4>
        <p>On-time performance and claims</p>
      </div>
      
      <div class="category">
        <div class="category-icon">💡</div>
        <h4>Proactivity & Insight</h4>
        <p>Market intelligence and advice</p>
      </div>
    </div>
  </div>
</section>

<!-- Review Process -->
<section class="review-process">
  <div class="container">
    <h2>How Reviews Work</h2>
    <div class="process-cards">
      <div class="process-card">
        <div class="card-icon">✍️</div>
        <h3>Write Your Review</h3>
        <p>Share your experience with a freight forwarder. Rate them across 7 categories and provide detailed feedback.</p>
      </div>
      
      <div class="process-card">
        <div class="card-icon">🔍</div>
        <h3>Verification Process</h3>
        <p>We verify reviews to ensure authenticity. Verified reviews carry more weight in our rating system.</p>
      </div>
      
      <div class="process-card">
        <div class="card-icon">📊</div>
        <h3>Impact on Ratings</h3>
        <p>Your review contributes to the overall rating and helps other businesses make informed decisions.</p>
      </div>
    </div>
  </div>
</section>

<!-- User Types -->
<section class="user-types">
  <div class="container">
    <h2>For Different User Types</h2>
    <div class="types-grid">
      <div class="type-card">
        <h3>For Shippers</h3>
        <p>Find reliable freight forwarders, read reviews, and make informed decisions about your logistics partners.</p>
        <ul>
          <li>Search and compare companies</li>
          <li>Read detailed reviews</li>
          <li>Write reviews for companies you've used</li>
          <li>Access premium features with Pro plan</li>
        </ul>
        <a href="/search" class="btn-primary">Start Searching</a>
      </div>
      
      <div class="type-card">
        <h3>For Freight Forwarders</h3>
        <p>Monitor your reputation, respond to reviews, and showcase your strengths to potential customers.</p>
        <ul>
          <li>Monitor your company ratings</li>
          <li>Respond to customer reviews</li>
          <li>Access detailed analytics</li>
          <li>Premium features with Insights plan</li>
        </ul>
        <a href="/contact" class="btn-secondary">Contact Us</a>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta">
  <div class="container">
    <div class="cta-content">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of businesses making informed logistics decisions with LogiScore.</p>
      <div class="cta-buttons">
        <a href="/search" class="btn-primary">Start Searching</a>
        <a href="/pricing" class="btn-secondary">View Pricing</a>
      </div>
    </div>
  </div>
</section>





<style>
  /* Global Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }



  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 100px 0;
    text-align: center;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.9;
  }

  /* Process Steps */
  .process {
    padding: 80px 0;
    background: white;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;
  }

  .step {
    display: flex;
    gap: 30px;
    padding: 40px;
    border-radius: 12px;
    background: #f8f9fa;
    transition: transform 0.3s;
  }

  .step:hover {
    transform: translateY(-5px);
  }

  .step-number {
    width: 60px;
    height: 60px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-content h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #333;
  }

  .step-content p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .step-features ul {
    list-style: none;
  }

  .step-features li {
    color: #666;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
  }

  .step-features li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: bold;
  }

  /* Rating System */
  .rating-system {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .rating-system h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 15px;
    color: #333;
  }

  .section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 50px;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }

  .category {
    text-align: center;
    padding: 30px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s;
  }

  .category:hover {
    transform: translateY(-5px);
  }

  .category-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .category h4 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: #333;
  }

  .category p {
    color: #666;
    line-height: 1.6;
  }

  /* Review Process */
  .review-process {
    padding: 80px 0;
    background: white;
  }

  .review-process h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .process-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
  }

  .process-card {
    text-align: center;
    padding: 40px;
    border-radius: 12px;
    background: #f8f9fa;
    transition: transform 0.3s;
  }

  .process-card:hover {
    transform: translateY(-5px);
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .process-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #333;
  }

  .process-card p {
    color: #666;
    line-height: 1.6;
  }

  /* User Types */
  .user-types {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .user-types h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 40px;
  }

  .type-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }

  .type-card h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #333;
  }

  .type-card p {
    color: #666;
    margin-bottom: 25px;
    line-height: 1.6;
  }

  .type-card ul {
    list-style: none;
    margin-bottom: 30px;
  }

  .type-card li {
    color: #666;
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;
  }

  .type-card li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: bold;
  }

  /* CTA Section */
  .cta {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .cta h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .cta p {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .cta-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
  }



  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .step {
      flex-direction: column;
      text-align: center;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }

    .process-cards {
      grid-template-columns: 1fr;
    }

    .types-grid {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }


  }
</style> 