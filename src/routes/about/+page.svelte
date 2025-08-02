<script lang="ts">
  import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
  <title>About LogiScore - Freight Forwarder Review Platform</title>
  <meta name="description" content="Learn about LogiScore, the leading platform for freight forwarder reviews and ratings. Our mission is to bring transparency to the logistics industry." />
</svelte:head>

<!-- Navigation Header -->
<Header currentPage="about" />

<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">About LogiScore</h1>
      <p class="hero-subtitle">
        Bringing transparency and trust to the global logistics industry through 
        data-driven reviews and ratings.
      </p>
    </div>
  </div>
</section>

<!-- Mission Section -->
<section class="mission">
  <div class="container">
    <div class="mission-content">
      <h2>Our Mission</h2>
      <p>
        LogiScore was founded with a simple yet powerful mission: to bring transparency 
        and accountability to the freight forwarding industry. We believe that businesses 
        deserve to make informed decisions when choosing their logistics partners.
      </p>
      
      <div class="mission-stats">
        <div class="stat">
          <span class="stat-number">500+</span>
          <span class="stat-label">Freight Forwarders</span>
        </div>
        <div class="stat">
          <span class="stat-number">10K+</span>
          <span class="stat-label">Reviews</span>
        </div>
        <div class="stat">
          <span class="stat-number">50+</span>
          <span class="stat-label">Countries</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Story Section -->
<section class="story">
  <div class="container">
    <div class="story-content">
      <h2>Our Story</h2>
      <p>
        The idea for LogiScore was born from a frustrating experience. Our founder was 
        struggling to find reliable information about freight forwarders when expanding 
        their business internationally. The lack of transparency in the industry made 
        it nearly impossible to make informed decisions.
      </p>
      <p>
        We realized that the logistics industry needed a platform where businesses could 
        share their experiences, both positive and negative, to help others make better 
        choices. That's why we built LogiScore - to create a community-driven platform 
        that brings accountability to freight forwarding.
      </p>
    </div>
  </div>
</section>

<!-- Values Section -->
<section class="values">
  <div class="container">
    <h2>Our Values</h2>
    <div class="values-grid">
      <div class="value-card">
        <div class="value-icon">🔍</div>
        <h3>Transparency</h3>
        <p>We believe in complete transparency. Every review is authentic and every rating is based on real experiences.</p>
      </div>
      
      <div class="value-card">
        <div class="value-icon">🤝</div>
        <h3>Community</h3>
        <p>We're building a community where businesses help each other make better logistics decisions.</p>
      </div>
      
      <div class="value-card">
        <div class="value-icon">📊</div>
        <h3>Data-Driven</h3>
        <p>Our platform uses data and analytics to provide insights that help businesses make informed decisions.</p>
      </div>
      
      <div class="value-card">
        <div class="value-icon">⚖️</div>
        <h3>Fairness</h3>
        <p>We ensure fair representation for both shippers and freight forwarders through our balanced review system.</p>
      </div>
    </div>
  </div>
</section>

<!-- Team Section -->
<section class="team">
  <div class="container">
    <h2>Our Team</h2>
    <div class="team-grid">
      <div class="team-member">
        <div class="member-avatar">
          <img src="/team-founder.jpg" alt="Founder" />
        </div>
        <h3>Founder & CEO</h3>
        <p>Logistics industry veteran with 15+ years of experience in international trade and supply chain management.</p>
      </div>
      
      <div class="team-member">
        <div class="member-avatar">
          <img src="/team-cto.jpg" alt="CTO" />
        </div>
        <h3>CTO</h3>
        <p>Technology leader with expertise in building scalable platforms and data-driven applications.</p>
      </div>
      
      <div class="team-member">
        <div class="member-avatar">
          <img src="/team-head-of-ops.jpg" alt="Head of Operations" />
        </div>
        <h3>Head of Operations</h3>
        <p>Operations specialist focused on ensuring quality and maintaining platform integrity.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta">
  <div class="container">
    <div class="cta-content">
      <h2>Join the LogiScore Community</h2>
      <p>Help us build a more transparent and accountable logistics industry.</p>
      <div class="cta-buttons">
        <a href="/search" class="btn-primary">Start Searching</a>
        <a href="/contact" class="btn-secondary">Get in Touch</a>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Company</h3>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/press">Press</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Platform</h3>
        <ul>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/features">Features</a></li>
          <li><a href="/api">API</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Support</h3>
        <ul>
          <li><a href="/help">Help Center</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/guidelines">Guidelines</a></li>
          <li><a href="/contact-support">Contact Support</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Legal</h3>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
          <li><a href="/security">Security</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 LogiScore. All rights reserved.</p>
    </div>
  </div>
</footer>



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

  /* Mission Section */
  .mission {
    padding: 80px 0;
    background: white;
  }

  .mission-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .mission h2 {
    font-size: 2.5rem;
    margin-bottom: 30px;
    color: #333;
  }

  .mission p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 40px;
    line-height: 1.8;
  }

  .mission-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin-top: 50px;
  }

  .stat {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    color: #667eea;
  }

  .stat-label {
    font-size: 1rem;
    color: #666;
    font-weight: 500;
  }

  /* Story Section */
  .story {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .story-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .story h2 {
    font-size: 2.5rem;
    margin-bottom: 30px;
    color: #333;
    text-align: center;
  }

  .story p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.8;
  }

  /* Values Section */
  .values {
    padding: 80px 0;
    background: white;
  }

  .values h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
  }

  .value-card {
    text-align: center;
    padding: 30px;
    border-radius: 12px;
    background: #f8f9fa;
    transition: transform 0.3s;
  }

  .value-card:hover {
    transform: translateY(-5px);
  }

  .value-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .value-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #333;
  }

  .value-card p {
    color: #666;
    line-height: 1.6;
  }

  /* Team Section */
  .team {
    padding: 80px 0;
    background: #f8f9fa;
  }

  .team h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 50px;
    color: #333;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
  }

  .team-member {
    text-align: center;
    padding: 30px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }

  .member-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;
    background: #f8f9fa;
  }

  .member-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .team-member h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: #333;
  }

  .team-member p {
    color: #666;
    line-height: 1.6;
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

  /* Footer */
  .footer {
    background: #333;
    color: white;
    padding: 60px 0 20px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section h3 {
    margin-bottom: 20px;
    color: #ffd700;
    font-weight: 600;
  }

  .footer-section ul {
    list-style: none;
  }

  .footer-section li {
    margin-bottom: 10px;
  }

  .footer-section a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.3s;
    font-weight: 400;
  }

  .footer-section a:hover {
    color: white;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #555;
    color: #ccc;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .mission-stats {
      flex-direction: column;
      gap: 30px;
    }

    .values-grid {
      grid-template-columns: 1fr;
    }

    .team-grid {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
</style> 