<script lang="ts">
  import { auth, authMethods } from '$lib/auth';
  import { onMount } from 'svelte';
  import AuthModal from '$lib/components/AuthModal.svelte';
  import SubscriptionModal from '$lib/components/SubscriptionModal.svelte';
  import ProfileModal from '$lib/components/ProfileModal.svelte';
  import ChangePasswordModal from '$lib/components/ChangePasswordModal.svelte';
  
  // Props
  export let hideSignUp = false;
  export let hideNavigation = false;
  
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };
  
  let showUserDropdown = false;
  let showAuthModal = false;
  let showSubscriptionModal = false;
  let showProfileModal = false;
  let showChangePasswordModal = false;
  let authModalMode: 'signin' | 'signup' = 'signin';
  
  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });
  
  onMount(() => {
    // Only check auth if we don't already have a user
    if (!authState.user && authState.token) {
      console.log('Header: No user but token exists, attempting to restore session');
      authMethods.getCurrentUser().catch((error: any) => {
        console.error('Failed to get current user:', error);
      });
    } else if (authState.user && authState.token) {
      console.log('Header: User session already restored');
    } else {
      console.log('Header: No authentication found');
    }
    
    // Add click outside handler for dropdown
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      showUserDropdown = false;
    }
  }
  
  function openSignInModal() {
    authModalMode = 'signin';
    showAuthModal = true;
  }
  
  function openSignUpModal() {
    authModalMode = 'signup';
    showAuthModal = true;
  }
  
  function openSubscriptionModal() {
    console.log('Opening subscription modal');
    showSubscriptionModal = true;
  }
  
  function openProfileModal() {
    console.log('Opening profile modal');
    showProfileModal = true;
  }
  
  function openChangePasswordModal() {
    console.log('Opening change password modal');
    showChangePasswordModal = true;
  }
  
  function closeAuthModal() {
    showAuthModal = false;
  }
  
  function closeSubscriptionModal() {
    showSubscriptionModal = false;
  }
  
  function closeProfileModal() {
    showProfileModal = false;
  }
  
  function closeChangePasswordModal() {
    showChangePasswordModal = false;
  }
  
  function handleLogout() {
    authMethods.logout();
    showUserDropdown = false;
  }
</script>

<!-- Navigation Header -->
<header class="header">
  <div class="container">
    <nav class="nav">
      <div class="nav-brand">
        <a href="/" class="logo-link">
          <div class="logo-container">
            <img src="/logo.png" alt="LogiScore" class="logo" />
          </div>
        </a>
      </div>
      
      {#if !hideNavigation}
        <div class="nav-menu">
          <a href="/search" class="nav-link">Search</a>
          <a href="/about" class="nav-link">About</a>
          <a href="/how-it-works" class="nav-link">How It Works</a>
          <a href="/pricing" class="nav-link">Pricing</a>
          <a href="/help" class="nav-link">Help</a>
          <a href="/contact" class="nav-link">Contact</a>
        </div>
      {/if}
      
      <div class="nav-actions">
        {#if authState.user}
          <div class="user-dropdown" class:open={showUserDropdown}>
            <button class="user-dropdown-toggle" on:click={() => {
              console.log('Dropdown toggle clicked, current state:', showUserDropdown);
              showUserDropdown = !showUserDropdown;
              console.log('New dropdown state:', showUserDropdown);
            }}>
              <span class="username">{authState.user.username}</span>
              <span class="status-badge" class:premium={authState.user.subscription_tier !== 'free'}>
                {authState.user.subscription_tier === 'free' ? 'Free' : authState.user.subscription_tier}
              </span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
            
            <div class="user-dropdown-menu">
              <div class="dropdown-header">
                <div class="user-info">
                  <span class="user-name">{authState.user.full_name || authState.user.username}</span>
                  <span class="user-email">{authState.user.email}</span>
                </div>
                <div class="subscription-info">
                  <span class="subscription-label">Plan:</span>
                  <span class="subscription-value" class:premium={authState.user.subscription_tier !== 'free'}>
                    {authState.user.subscription_tier === 'free' ? 'Free Plan' : authState.user.subscription_tier}
                  </span>
                </div>
              </div>
              
              <div class="dropdown-actions">
                <button class="dropdown-item" on:click={openProfileModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  View Profile
                </button>
                <button class="dropdown-item" on:click={openSubscriptionModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Upgrade Subscription
                </button>
                <button class="dropdown-item" on:click={openChangePasswordModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Change Password
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" on:click={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        {:else}
          <button class="btn-secondary" on:click={openSignInModal}>Sign In</button>
          <!-- Hide Sign Up button on admin pages for security -->
          {#if !hideSignUp}
            <button class="btn-primary" on:click={openSignUpModal}>Sign Up</button>
          {/if}
        {/if}
      </div>
    </nav>
  </div>
</header>

<!-- Modals -->
{#if showAuthModal}
  <AuthModal 
    isOpen={showAuthModal}
    mode={authModalMode} 
    on:close={closeAuthModal}
  />
{/if}

{#if showSubscriptionModal}
  <SubscriptionModal 
    isOpen={showSubscriptionModal}
    on:close={closeSubscriptionModal}
  />
{/if}

{#if showProfileModal}
  <ProfileModal 
    isOpen={showProfileModal}
    on:close={closeProfileModal}
  />
{/if}

{#if showChangePasswordModal}
  <ChangePasswordModal 
    isOpen={showChangePasswordModal}
    on:close={closeChangePasswordModal}
  />
{/if}

<style>
  /* Header Navigation */
  .header {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    background: transparent !important;
  }

  .logo-container {
    display: flex;
    align-items: center;
    background: transparent;
  }

  .logo-link {
    text-decoration: none;
    display: flex;
    align-items: center;
    background: transparent;
  }

  .logo-link:hover {
    opacity: 0.8;
  }

  .logo {
    height: 84px; /* Doubled from 42px to 84px */
    width: auto;
    background: transparent !important;
    filter: brightness(1.1) contrast(1.1);
    mix-blend-mode: darken;
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    color: #374151;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .nav-link:hover {
    color: #1f2937;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* User Dropdown */
  .user-dropdown {
    position: relative;
  }

  .user-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .user-dropdown-toggle:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }

  .username {
    font-weight: 500;
    color: #374151;
  }

  .status-badge {
    background: #e5e7eb;
    color: #6b7280;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.premium {
    background: #fef3c7;
    color: #d97706;
  }

  .dropdown-arrow {
    transition: transform 0.2s ease;
  }

  .user-dropdown.open .dropdown-arrow {
    transform: rotate(180deg);
  }

  .user-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    min-width: 280px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
  }

  .user-dropdown.open .user-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .dropdown-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .user-info {
    margin-bottom: 0.5rem;
  }

  .user-name {
    display: block;
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }

  .user-email {
    display: block;
    color: #6b7280;
    font-size: 0.75rem;
  }

  .subscription-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subscription-label {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .subscription-value {
    font-weight: 500;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .subscription-value.premium {
    color: #d97706;
  }

  .dropdown-actions {
    padding: 0.5rem;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background: none;
    border: none;
    border-radius: 0.375rem;
    color: #374151;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .dropdown-item:hover {
    background: #f3f4f6;
  }

  .dropdown-item.logout {
    color: #dc2626;
  }

  .dropdown-item.logout:hover {
    background: #fef2f2;
  }

  .dropdown-divider {
    height: 1px;
    background: #e5e7eb;
    margin: 0.5rem 0;
  }

  /* Buttons */
  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }
    
    .nav-actions {
      gap: 0.5rem;
    }
    
    .user-dropdown-menu {
      right: -1rem;
      min-width: 260px;
    }
  }
</style> 
