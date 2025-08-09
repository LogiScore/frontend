<script>
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>About - LogiScore</title>
  <meta name="description" content="Learn about LogiScore - the leading platform for freight forwarder reviews and ratings" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>About LogiScore</h1>
      <p class="hero-subtitle">Transforming logistics decision-making through transparency and community-driven insights</p>
    </div>
  </section>

  <section class="about-content">
    <div class="container">
      <div class="about-grid">
        <div class="about-section">
          <h2>Our Mission</h2>
          <p>LogiScore is dedicated to bringing transparency and accountability to the freight forwarding industry. We believe that businesses deserve access to reliable, unbiased information when choosing their logistics partners.</p>
          <p>By connecting shippers with real experiences and verified reviews, we're building a community that drives better service standards across the entire logistics ecosystem.</p>
        </div>

        <div class="about-section">
          <h2>What We Do</h2>
          <p>We provide a comprehensive platform where businesses can:</p>
          <ul>
            <li>Read detailed reviews from verified customers</li>
            <li>Compare freight forwarders based on real performance data</li>
            <li>Access transparent pricing and service information</li>
            <li>Make informed decisions backed by community insights</li>
          </ul>
        </div>

        <div class="about-section">
          <h2>Our Values</h2>
          <div class="values-grid">
            <div class="value-item">
              <h3>Transparency</h3>
              <p>We believe in open, honest information sharing that benefits everyone in the logistics chain.</p>
            </div>
            <div class="value-item">
              <h3>Community</h3>
              <p>Building a trusted network of shippers and forwarders who value quality service.</p>
            </div>
            <div class="value-item">
              <h3>Innovation</h3>
              <p>Continuously improving our platform to better serve the logistics community.</p>
            </div>
          </div>
        </div>
      </div>
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

  .about-content {
    padding: 80px 0;
  }

  .about-grid {
    display: grid;
    gap: 60px;
    max-width: 800px;
    margin: 0 auto;
  }

  .about-section h2 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }

  .about-section p {
    line-height: 1.6;
    margin-bottom: 1rem;
    color: #666;
  }

  .about-section ul {
    margin-left: 1.5rem;
    color: #666;
  }

  .about-section li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .values-grid {
    display: grid;
    gap: 2rem;
    margin-top: 2rem;
  }

  .value-item h3 {
    color: #667eea;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }

  .value-item p {
    color: #666;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .about-grid {
      gap: 40px;
    }
  }
</style>

