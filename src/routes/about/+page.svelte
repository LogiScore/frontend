<script>
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>About - LogiScore</title>
  <meta name="description" content="Learn about LogiScore - the leading platform for freight forwarder reviews and ratings" />
</svelte:head>

<main>
  <!-- Modern Page Header -->
  <section class="page-header">
    <div class="container">
      <div class="breadcrumb">
        <a href="/" class="breadcrumb-item">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">About</span>
      </div>
      <h1 class="page-title">About LogiScore</h1>
      <p class="page-description">Driving Transparency in Global Logistics</p>
    </div>
  </section>

  <section class="about-content">
    <div class="container">
      <div class="about-grid">
        <div class="about-section">
          <h2>Our Mission</h2>
          <p>At <strong>LogiScore</strong>, we believe that trust and accountability are the foundations of great logistics partnerships. Shippers often face challenges when choosing freight forwarders: limited visibility, inconsistent service levels, and a lack of reliable benchmarks. Our mission is to change that.</p>
          <p>LogiScore is a <strong>shipper-first community platform</strong> where companies can <strong>rate and review freight forwarders</strong> based on real shipment experiences. Reviews are structured and data-driven, covering key categories such as responsiveness, documentation, shipment handling, technology, and customer experience.</p>
        </div>

        <div class="about-section">
          <h2>What We Do</h2>
          <p>Unlike traditional review platforms, LogiScore is designed to ensure <strong>fairness, authenticity, and compliance</strong>:</p>
          <ul>
            <li>Reviews are submitted only by verified shippers</li>
            <li>Forwarders cannot edit, remove, or influence reviews</li>
            <li>Anonymous submissions are allowed, but verified reviews carry full weight for accuracy</li>
            <li>A structured dispute process ensures balance and fairness</li>
          </ul>
          
          <div class="important-notice">
            <p><strong>Important:</strong> All reviews represent the <strong>opinions and experiences of individual shippers</strong>. LogiScore does not verify the accuracy of each opinion and does not endorse any specific freight forwarder.</p>
          </div>
        </div>

        <div class="about-section">
          <h2>Why It Matters</h2>
          <p>In an industry where service quality can vary widely, LogiScore provides <strong>objective, comparable insights</strong> into freight forwarder performance.</p>
          
          <p>For shippers, this means greater confidence when selecting a logistics partner. With increased transparency, shippers may be more inclined to switch to a forwarder with stronger performance, creating a market where service quality truly matters.</p>
          
          <p>For forwarders, LogiScore offers more than accountability. It is also an <strong>opportunity to showcase excellence</strong>. High-performing forwarders can use their scores as proof of service quality, strengthening credibility with prospects and giving sales teams a competitive edge in customer negotiations.</p>
          
          <p>We understand that some forwarders may feel uncomfortable with this level of transparency. However, our hope is that LogiScore will serve as a <strong>constructive tool</strong>, helping forwarders identify areas for improvement, raise their level of service, and build stronger, long-term trust with shippers.</p>
          
          <p>Our goal is to <strong>elevate the logistics industry</strong> by making service performance as transparent as rates and transit times.</p>
          
          <div class="metal-badges">
            <img src="/LogiScore Gold.png" alt="LogiScore Gold Badge" class="metal-badge" />
            <img src="/LogiScore Silver.png" alt="LogiScore Silver Badge" class="metal-badge" />
            <img src="/LogiScore Bronze.png" alt="LogiScore Bronze Badge" class="metal-badge" />
          </div>
        </div>

        <div class="about-section">
          <h2>Our Principles</h2>
          <div class="values-grid">
            <div class="value-item">
              <h3>Transparency</h3>
              <p>Real reviews from real shippers.</p>
            </div>
            <div class="value-item">
              <h3>Fairness</h3>
              <p>Structured scoring and verified participation.</p>
            </div>
            <div class="value-item">
              <h3>Independence</h3>
              <p>Built for shippers, not owned by forwarders.</p>
            </div>
            <div class="value-item">
              <h3>Compliance</h3>
              <p>Strong privacy, legal safeguards, and dispute mechanisms.</p>
            </div>
          </div>
        </div>

        <div class="about-section">
          <h2>Who We Serve</h2>
          <div class="audience-grid">
            <div class="audience-item">
              <h3>Shippers / Importers / Exporters / BCO's</h3>
              <p>Share your experiences, compare forwarders, and make informed choices.</p>
            </div>
            <div class="audience-item">
              <h3>Freight Forwarders</h3>
              <p>Gain insights into your performance, identify gaps, and showcase improvements.</p>
            </div>
            <div class="audience-item">
              <h3>Industry Stakeholders</h3>
              <p>Access aggregated insights to track logistics service trends over time.</p>
            </div>
          </div>
        </div>

        <div class="about-section">
          <h2>Looking Ahead</h2>
          <p>LogiScore is more than a rating site. It's a <strong>data-driven logistics intelligence platform</strong>, aiming to provide trend analytics, score comparisons, and industry benchmarks that help shippers and forwarders alike navigate a rapidly changing global trade environment.</p>
          <div class="vision-statement">
            <p><strong>LogiScore: Helping the logistics community hold forwarders accountable — and helping forwarders earn the trust of their customers.</strong></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* Page Header */
  .page-header {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 40px 0;
    margin-bottom: 0;
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

  .about-content {
    padding: 80px 0;
  }

  .about-grid {
    display: grid;
    gap: 60px;
    max-width: 900px;
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

  .audience-grid {
    display: grid;
    gap: 2rem;
    margin-top: 2rem;
  }

  .audience-item h3 {
    color: #667eea;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }

  .audience-item p {
    color: #666;
    line-height: 1.6;
  }

  .vision-statement {
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
    border-left: 4px solid #667eea;
    padding: 1.5rem;
    margin-top: 2rem;
    border-radius: 0 8px 8px 0;
  }

  .vision-statement p {
    margin: 0;
    color: #333;
    font-style: italic;
  }

  .important-notice {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 2rem;
    font-weight: bold;
  }

  .metal-badges {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .metal-badge {
    max-width: 120px;
    height: auto;
    transition: transform 0.2s ease;
  }

  .metal-badge:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 2rem;
    }
    
    .about-grid {
      gap: 40px;
    }

    .values-grid,
    .audience-grid {
      gap: 1.5rem;
    }
  }
</style>

