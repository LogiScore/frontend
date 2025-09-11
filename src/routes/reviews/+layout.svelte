<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth';
  
  let authState: { user: any; token: string | null; isLoading: boolean; error: string | null } = {
    user: null,
    token: null,
    isLoading: false,
    error: null
  };

  // Subscribe to auth store
  auth.subscribe(state => {
    authState = state;
  });

  onMount(() => {
    // Check if user is a forwarder and redirect immediately
    if (authState.user && authState.user.user_type === 'forwarder') {

      goto('/search');
    }
  });

  // Reactive check for forwarder users
  $: if (authState.user && authState.user.user_type === 'forwarder') {

    goto('/search');
  }
</script>

<slot />
