<script lang="ts">
  // Footer component for consistent layout across all pages
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <div class="section-header">
          <h3>Company.</h3>
          <a href="/about">About</a>
        </div>
        <ul>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <div class="section-header">
          <h3>Platform.</h3>
          <a href="/guidelines">Community Guidelines</a>
        </div>
        <ul>
          <li><a href="/search">Search Companies</a></li>
          <li><a href="/reviews">Browse Reviews</a></li>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/faq">FAQ</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <div class="section-header">
          <h3>Legal.</h3>
          <a href="/privacy">Privacy Policy</a>
        </div>
        <ul>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/legal">Legal FAQ</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
          <li><a href="/notice-takedown">Notice & Takedown Policy</a></li>
          <li><a href="/transparency-report">Transparency Report</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 LogiScore. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: #333;
    color: white;
    padding: 60px 0 20px;
    margin-top: auto;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .section-header h3 {
    margin: 0;
    color: #ffd700;
    font-weight: 600;
  }

  .section-header a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.3s;
    font-weight: 400;
  }

  .section-header a:hover {
    color: white;
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
    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
</style>
