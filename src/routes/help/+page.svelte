<script lang="ts">
  
</script>

<svelte:head>
  <title>Help Center - LogiScore Support</title>
  <meta name="description" content="Get help with LogiScore. Find answers to frequently asked questions, guides, and contact support." />
</svelte:head>



<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">Help Center</h1>
      <p class="hero-subtitle">
        Find answers to your questions and get the support you need
      </p>
    </div>
  </div>
</section>

<!-- Search Help -->
<section class="search-help">
  <div class="container">
    <div class="search-box">
      <input type="text" placeholder="Search help articles..." class="search-input" />
      <button class="search-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
  </div>
</section>

<!-- Help Categories -->
<section class="help-categories">
  <div class="container">
    <div class="categories-grid">
      <div class="category-card">
        <div class="category-icon">🔍</div>
        <h3>Getting Started</h3>
        <p>Learn the basics of using LogiScore</p>
        <ul>
          <li><a href="#account-setup">Account Setup</a></li>
          <li><a href="#first-search">Your First Search</a></li>
          <li><a href="#writing-reviews">Writing Reviews</a></li>
          <li><a href="#understanding-ratings">Understanding Ratings</a></li>
        </ul>
      </div>
      
      <div class="category-card">
        <div class="category-icon">📊</div>
        <h3>Search & Reviews</h3>
        <p>How to search and review effectively</p>
        <ul>
          <li><a href="#advanced-search">Advanced Search</a></li>
          <li><a href="#filtering-results">Filtering Results</a></li>
          <li><a href="#review-guidelines">Review Guidelines</a></li>
          <li><a href="#rating-system">Rating System</a></li>
        </ul>
      </div>
      
      <div class="category-card">
        <div class="category-icon">💳</div>
        <h3>Billing & Plans</h3>
        <p>Manage your subscription and billing</p>
        <ul>
          <li><a href="#plan-comparison">Plan Comparison</a></li>
          <li><a href="#billing-cycles">Billing Cycles</a></li>
          <li><a href="#payment-methods">Payment Methods</a></li>
          <li><a href="#cancellation">Cancellation</a></li>
        </ul>
      </div>
      
      <div class="category-card">
        <div class="category-icon">🔧</div>
        <h3>Account & Settings</h3>
        <p>Manage your account and preferences</p>
        <ul>
          <li><a href="#profile-settings">Profile Settings</a></li>
          <li><a href="#privacy-controls">Privacy Controls</a></li>
          <li><a href="#notifications">Notifications</a></li>
          <li><a href="#data-export">Data Export</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Popular Articles -->
<section class="popular-articles">
  <div class="container">
    <h2>Popular Articles</h2>
    
    <div class="articles-grid">
      <div class="article-card">
        <h3>How to Write an Effective Review</h3>
        <p>Learn the best practices for writing helpful and informative reviews that benefit the community.</p>
        <a href="#" class="read-more">Read More →</a>
      </div>
      
      <div class="article-card">
        <h3>Understanding Our Rating System</h3>
        <p>Get detailed information about our 7-category rating system and how scores are calculated.</p>
        <a href="#" class="read-more">Read More →</a>
      </div>
      
      <div class="article-card">
        <h3>Search Tips and Tricks</h3>
        <p>Discover advanced search techniques to find the perfect freight forwarder for your needs.</p>
        <a href="#" class="read-more">Read More →</a>
      </div>
      
      <div class="article-card">
        <h3>Account Security Best Practices</h3>
        <p>Learn how to keep your account secure and protect your personal information.</p>
        <a href="#" class="read-more">Read More →</a>
      </div>
    </div>
  </div>
</section>

<!-- Contact Support -->
<section class="contact-support">
  <div class="container">
    <div class="support-content">
      <h2>Still Need Help?</h2>
      <p>Our support team is here to help you with any questions or issues.</p>
      
      <div class="contact-link">
        <a href="/contact" class="btn-primary">Contact Support</a>
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

  /* Search Help */
  .search-help {
    padding: 40px 0;
    background: white;
  }

  .search-box {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }

  .search-input {
    flex: 1;
    padding: 20px 25px;
    border: none;
    outline: none;
    font-size: 1.1rem;
    font-family: 'Roboto', sans-serif;
  }

  .search-button {
    background: #667eea;
    color: white;
    border: none;
    padding: 20px 25px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .search-button:hover {
    background: #5a6fd8;
  }

  /* Help Categories */
  .help-categories {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .help-categories h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .category-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s;
  }

  .category-card:hover {
    transform: translateY(-5px);
  }

  .category-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  .category-card h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: #333;
  }

  .category-card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .category-card ul {
    list-style: none;
    padding: 0;
  }

  .category-card li {
    margin-bottom: 10px;
  }

  .category-card a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
  }

  .category-card a:hover {
    color: #5a6fd8;
  }

  /* Popular Articles */
  .popular-articles {
    padding: 80px 0;
    background: white;
  }

  .popular-articles h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .article-card {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }

  .article-card h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: #333;
  }

  .article-card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .read-more {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
  }

  .read-more:hover {
    color: #5a6fd8;
  }

  /* Contact Support */
  .contact-support {
    padding: 80px 0;
    background: #f8f9fa;
    text-align: center;
  }

  .contact-support h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #333;
  }

  .contact-support p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 50px;
  }

  .contact-link {
    display: inline-block;
  }

  .btn-primary {
    background: #667eea;
    color: white;
    padding: 15px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: background 0.3s;
  }

  .btn-primary:hover {
    background: #5a6fd8;
  }


  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .search-box {
      flex-direction: column;
      border-radius: 12px;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }

    .articles-grid {
      grid-template-columns: 1fr;
    }

    .contact-link {
      width: 100%;
    }


  }
</style> 