import { J as copy_payload, K as assign_payload, w as pop, u as push, O as head, y as escape_html, P as attr_class, Q as stringify } from "../../../chunks/index.js";
import { a as auth, b as apiClient } from "../../../chunks/auth.js";
import { A as AuthModal } from "../../../chunks/AuthModal.js";
function _page($$payload, $$props) {
  push();
  let authState = { user: null, token: null, isLoading: false, error: null };
  let showAuthModal = false;
  auth.subscribe((state) => {
    authState = state;
  });
  let isLoading = false;
  let dashboardStats = {
    totalUsers: 0,
    totalCompanies: 0,
    totalReviews: 0,
    pendingDisputes: 0,
    pendingReviews: 0,
    totalRevenue: 0
  };
  async function loadDashboardStats() {
    if (!authState.token) return;
    try {
      isLoading = true;
      const stats = await apiClient.getDashboardStats(authState.token);
      dashboardStats = {
        totalUsers: stats.total_users,
        totalCompanies: stats.total_companies,
        totalReviews: stats.total_reviews,
        pendingDisputes: stats.pending_disputes,
        pendingReviews: stats.pending_reviews,
        totalRevenue: stats.total_revenue
      };
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      isLoading = false;
    }
  }
  if (authState.token) {
    loadDashboardStats();
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Admin Dashboard - LogiScore</title>`;
      $$payload3.out.push(`<meta name="description" content="LogiScore Admin Dashboard - Manage reviews, disputes, users, and company data." class="svelte-1eqk8v0"/>`);
    });
    $$payload2.out.push(`<header class="header svelte-1eqk8v0"><div class="container svelte-1eqk8v0"><nav class="nav svelte-1eqk8v0"><div class="nav-brand svelte-1eqk8v0"><a href="/" class="logo-container svelte-1eqk8v0"><img src="/logo.png" alt="LogiScore" class="logo svelte-1eqk8v0"/></a></div> <div class="nav-menu svelte-1eqk8v0"></div> <div class="nav-actions svelte-1eqk8v0">`);
    if (authState.user) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div class="user-menu svelte-1eqk8v0"><span class="username svelte-1eqk8v0">Welcome, ${escape_html(authState.user.username)}</span> <button class="btn-secondary svelte-1eqk8v0">Sign Out</button></div>`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<button class="btn-secondary svelte-1eqk8v0">Sign In</button>`);
    }
    $$payload2.out.push(`<!--]--></div></nav></div></header> <section class="admin-dashboard svelte-1eqk8v0"><div class="container svelte-1eqk8v0"><div class="admin-header svelte-1eqk8v0"><h1 class="svelte-1eqk8v0">Admin Dashboard</h1> <p class="svelte-1eqk8v0">Manage reviews, disputes, users, and company data</p></div> <div class="tab-navigation svelte-1eqk8v0"><button${attr_class(`tab-button ${stringify("active")}`, "svelte-1eqk8v0")}>Dashboard</button> <button${attr_class(`tab-button ${stringify("")}`, "svelte-1eqk8v0")}>Review Management</button> <button${attr_class(`tab-button ${stringify("")}`, "svelte-1eqk8v0")}>Disputes</button> <button${attr_class(`tab-button ${stringify("")}`, "svelte-1eqk8v0")}>Company Management</button> <button${attr_class(`tab-button ${stringify("")}`, "svelte-1eqk8v0")}>User Management</button> <button${attr_class(`tab-button ${stringify("")}`, "svelte-1eqk8v0")}>Analytics</button></div> `);
    {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div class="dashboard-content svelte-1eqk8v0"><div class="stats-grid svelte-1eqk8v0"><div class="stat-card svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Total Users</h3> <div class="stat-number svelte-1eqk8v0">${escape_html(dashboardStats.totalUsers.toLocaleString())}</div></div> <div class="stat-card svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Total Companies</h3> <div class="stat-number svelte-1eqk8v0">${escape_html(dashboardStats.totalCompanies)}</div></div> <div class="stat-card svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Total Reviews</h3> <div class="stat-number svelte-1eqk8v0">${escape_html(dashboardStats.totalReviews.toLocaleString())}</div></div> <div class="stat-card svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Pending Disputes</h3> <div class="stat-number warning svelte-1eqk8v0">${escape_html(dashboardStats.pendingDisputes)}</div></div> <div class="stat-card svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Pending Reviews</h3> <div class="stat-number warning svelte-1eqk8v0">${escape_html(dashboardStats.pendingReviews)}</div></div> <div class="stat-card svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Monthly Revenue</h3> <div class="stat-number svelte-1eqk8v0">$${escape_html(dashboardStats.totalRevenue.toLocaleString())}</div></div></div> <div class="recent-activity svelte-1eqk8v0"><h2 class="svelte-1eqk8v0">Recent Activity</h2> <div class="activity-list svelte-1eqk8v0"><div class="activity-item svelte-1eqk8v0"><span class="activity-time svelte-1eqk8v0">2 hours ago</span> <span class="activity-text svelte-1eqk8v0">New review submitted for DHL Supply Chain</span></div> <div class="activity-item svelte-1eqk8v0"><span class="activity-time svelte-1eqk8v0">4 hours ago</span> <span class="activity-text svelte-1eqk8v0">Dispute opened for Kuehne + Nagel review</span></div> <div class="activity-item svelte-1eqk8v0"><span class="activity-time svelte-1eqk8v0">1 day ago</span> <span class="activity-text svelte-1eqk8v0">New company registered: C.H. Robinson</span></div></div></div></div>`);
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></div></section> <footer class="footer svelte-1eqk8v0"><div class="container svelte-1eqk8v0"><div class="footer-content svelte-1eqk8v0"><div class="footer-section svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Company</h3> <ul class="svelte-1eqk8v0"><li class="svelte-1eqk8v0"><a href="/about" class="svelte-1eqk8v0">About</a></li> <li class="svelte-1eqk8v0"><a href="/careers" class="svelte-1eqk8v0">Careers</a></li> <li class="svelte-1eqk8v0"><a href="/press" class="svelte-1eqk8v0">Press</a></li> <li class="svelte-1eqk8v0"><a href="/contact" class="svelte-1eqk8v0">Contact</a></li></ul></div> <div class="footer-section svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Platform</h3> <ul class="svelte-1eqk8v0"><li class="svelte-1eqk8v0"><a href="/how-it-works" class="svelte-1eqk8v0">How It Works</a></li> <li class="svelte-1eqk8v0"><a href="/pricing" class="svelte-1eqk8v0">Pricing</a></li> <li class="svelte-1eqk8v0"><a href="/features" class="svelte-1eqk8v0">Features</a></li> <li class="svelte-1eqk8v0"><a href="/api" class="svelte-1eqk8v0">API</a></li></ul></div> <div class="footer-section svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Support</h3> <ul class="svelte-1eqk8v0"><li class="svelte-1eqk8v0"><a href="/help" class="svelte-1eqk8v0">Help Center</a></li> <li class="svelte-1eqk8v0"><a href="/faq" class="svelte-1eqk8v0">FAQ</a></li> <li class="svelte-1eqk8v0"><a href="/guidelines" class="svelte-1eqk8v0">Guidelines</a></li> <li class="svelte-1eqk8v0"><a href="/contact-support" class="svelte-1eqk8v0">Contact Support</a></li></ul></div> <div class="footer-section svelte-1eqk8v0"><h3 class="svelte-1eqk8v0">Legal</h3> <ul class="svelte-1eqk8v0"><li class="svelte-1eqk8v0"><a href="/privacy" class="svelte-1eqk8v0">Privacy Policy</a></li> <li class="svelte-1eqk8v0"><a href="/terms" class="svelte-1eqk8v0">Terms of Service</a></li> <li class="svelte-1eqk8v0"><a href="/cookies" class="svelte-1eqk8v0">Cookie Policy</a></li> <li class="svelte-1eqk8v0"><a href="/security" class="svelte-1eqk8v0">Security</a></li></ul></div></div> <div class="footer-bottom svelte-1eqk8v0"><p class="svelte-1eqk8v0">© 2025 LogiScore. All rights reserved.</p></div></div></footer> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    AuthModal($$payload2, {
      defaultMode: "signin",
      get isOpen() {
        return showAuthModal;
      },
      set isOpen($$value) {
        showAuthModal = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
export {
  _page as default
};
