<script lang="ts">
  import { onMount } from 'svelte';
  
  // Types for help content
  interface HelpCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    articles: HelpArticle[];
  }
  
  interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
  }
  
  // State variables
  let searchQuery = '';
  let filteredCategories: HelpCategory[] = [];
  let isLoading = true;
  let searchResults: HelpArticle[] = [];
  let showSearchResults = false;
  
  // Sample help data - in production this would come from an API
  const helpData: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using LogiScore',
      icon: '🔍',
      articles: [
        {
          id: 'account-setup',
          title: 'Account Setup',
          content: 'Step-by-step guide to setting up your LogiScore account',
          category: 'getting-started',
          tags: ['account', 'setup', 'beginner']
        },
        {
          id: 'first-search',
          title: 'Your First Search',
          content: 'How to perform your first search for freight forwarders',
          category: 'getting-started',
          tags: ['search', 'first-time', 'tutorial']
        },
        {
          id: 'writing-reviews',
          title: 'Writing Reviews',
          content: 'Learn how to write helpful and informative reviews',
          category: 'getting-started',
          tags: ['reviews', 'writing', 'guidelines']
        },
        {
          id: 'understanding-ratings',
          title: 'Understanding Ratings',
          content: 'Comprehensive guide to our rating system',
          category: 'getting-started',
          tags: ['ratings', 'system', 'explanation']
        }
      ]
    },
    {
      id: 'search-reviews',
      title: 'Search & Reviews',
      description: 'How to search and review effectively',
      icon: '📊',
      articles: [
        {
          id: 'advanced-search',
          title: 'Advanced Search',
          content: 'Master advanced search techniques and filters',
          category: 'search-reviews',
          tags: ['search', 'advanced', 'filters']
        },
        {
          id: 'filtering-results',
          title: 'Filtering Results',
          content: 'How to use filters to find the perfect match',
          category: 'search-reviews',
          tags: ['filters', 'results', 'refinement']
        },
        {
          id: 'review-guidelines',
          title: 'Review Guidelines',
          content: 'Follow our community guidelines for writing reviews',
          category: 'search-reviews',
          tags: ['guidelines', 'community', 'standards']
        },
        {
          id: 'rating-system',
          title: 'Rating System',
          content: 'Detailed explanation of our 7-category rating system',
          category: 'search-reviews',
          tags: ['rating', 'system', 'categories']
        }
      ]
    },
    {
      id: 'billing-plans',
      title: 'Billing & Plans',
      description: 'Manage your subscription and billing',
      icon: '💳',
      articles: [
        {
          id: 'plan-comparison',
          title: 'Plan Comparison',
          content: 'Compare different subscription plans and features',
          category: 'billing-plans',
          tags: ['plans', 'comparison', 'features']
        },
        {
          id: 'billing-cycles',
          title: 'Billing Cycles',
          content: 'Understanding billing cycles and payment schedules',
          category: 'billing-plans',
          tags: ['billing', 'cycles', 'payment']
        },
        {
          id: 'payment-methods',
          title: 'Payment Methods',
          content: 'Supported payment methods and security',
          category: 'billing-plans',
          tags: ['payment', 'methods', 'security']
        },
        {
          id: 'cancellation',
          title: 'Cancellation',
          content: 'How to cancel your subscription',
          category: 'billing-plans',
          tags: ['cancellation', 'subscription', 'refund']
        }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      description: 'Manage your account and preferences',
      icon: '🔧',
      articles: [
        {
          id: 'profile-settings',
          title: 'Profile Settings',
          content: 'Customize your profile and personal information',
          category: 'account-settings',
          tags: ['profile', 'settings', 'personal']
        },
        {
          id: 'privacy-controls',
          title: 'Privacy Controls',
          content: 'Manage your privacy settings and data sharing',
          category: 'account-settings',
          tags: ['privacy', 'controls', 'data']
        },
        {
          id: 'notifications',
          title: 'Notifications',
          content: 'Configure notification preferences',
          category: 'account-settings',
          tags: ['notifications', 'preferences', 'alerts']
        },
        {
          id: 'data-export',
          title: 'Data Export',
          content: 'Export your data and reviews',
          category: 'account-settings',
          tags: ['data', 'export', 'backup']
        }
      ]
    }
  ];
  
  // Initialize data
  onMount(() => {
    filteredCategories = [...helpData];
    isLoading = false;
  });
  
  // Search functionality
  function handleSearch() {
    if (!searchQuery.trim()) {
      filteredCategories = [...helpData];
      showSearchResults = false;
      return;
    }
    
    const query = searchQuery.toLowerCase();
    searchResults = [];
    
    // Search through all articles
    helpData.forEach(category => {
      category.articles.forEach(article => {
        if (
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        ) {
          searchResults.push(article);
        }
      });
    });
    
    showSearchResults = true;
  }
  
  // Clear search
  function clearSearch() {
    searchQuery = '';
    filteredCategories = [...helpData];
    showSearchResults = false;
    searchResults = [];
  }
  
  // Handle search input changes
  function onSearchInput() {
    if (!searchQuery.trim()) {
      clearSearch();
    }
  }
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
      <input 
        type="text" 
        placeholder="Search help articles..." 
        class="search-input"
        bind:value={searchQuery}
        on:input={onSearchInput}
        on:keydown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button class="search-button" on:click={handleSearch}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
    {#if searchQuery && showSearchResults}
      <div class="search-results">
        <div class="search-header">
          <h3>Search Results for "{searchQuery}"</h3>
          <button class="clear-search" on:click={clearSearch}>Clear Search</button>
        </div>
        {#if searchResults.length > 0}
          <div class="search-results-grid">
            {#each searchResults as article}
              <div class="search-result-card">
                <h4>{article.title}</h4>
                <p>{article.content}</p>
                <div class="article-tags">
                  {#each article.tags as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="no-results">No results found for "{searchQuery}". Try different keywords.</p>
        {/if}
      </div>
    {/if}
  </div>
</section>

<!-- Help Categories -->
{#if !isLoading && !showSearchResults}
  <section class="help-categories">
    <div class="container">
      <div class="categories-grid">
        {#each filteredCategories as category}
          <div class="category-card">
            <div class="category-icon">{category.icon}</div>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            <ul>
              {#each category.articles as article}
                <li><a href="#{article.id}">{article.title}</a></li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

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

  /* Search Results */
  .search-results {
    margin-top: 30px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .search-header h3 {
    color: #333;
    font-size: 1.5rem;
  }

  .clear-search {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
  }

  .clear-search:hover {
    background: #5a6268;
  }

  .search-results-grid {
    display: grid;
    gap: 20px;
  }

  .search-result-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #667eea;
  }

  .search-result-card h4 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }

  .search-result-card p {
    color: #666;
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #e9ecef;
    color: #495057;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .no-results {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px 0;
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

    .search-header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }

    .contact-link {
      width: 100%;
    }
  }
</style> 