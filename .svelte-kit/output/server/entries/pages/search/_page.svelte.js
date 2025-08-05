import { J as copy_payload, K as assign_payload, w as pop, u as push, O as head, y as escape_html, z as attr, N as ensure_array_like, Q as stringify, P as attr_class } from "../../../chunks/index.js";
import { a as auth } from "../../../chunks/auth.js";
import { A as AuthModal } from "../../../chunks/AuthModal.js";
function _page($$payload, $$props) {
  push();
  let searchQuery = "";
  let searchResults = [];
  let showAuthModal = false;
  let authModalMode = "signin";
  let filters = { sortBy: "name" };
  let authState = { user: null };
  auth.subscribe((state) => {
    authState = state;
  });
  function getFilteredResults() {
    let filtered = [...searchResults];
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "reviews":
          return (b.review_count || 0) - (a.review_count || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Search Freight Forwarders - LogiScore</title>`;
      $$payload3.out.push(`<meta name="description" content="Search and compare freight forwarders worldwide. Find the perfect logistics partner for your business." class="svelte-a6114o"/>`);
    });
    $$payload2.out.push(`<header class="header svelte-a6114o"><div class="container svelte-a6114o"><nav class="nav svelte-a6114o"><div class="nav-brand svelte-a6114o"><a href="/" class="logo-container svelte-a6114o"><img src="/logo.png" alt="LogiScore" class="logo svelte-a6114o"/></a></div> <div class="nav-menu svelte-a6114o"><a href="/search" class="nav-link active svelte-a6114o">Search</a> <a href="/about" class="nav-link svelte-a6114o">About</a> <a href="/how-it-works" class="nav-link svelte-a6114o">How It Works</a> <a href="/pricing" class="nav-link svelte-a6114o">Pricing</a> <a href="/help" class="nav-link svelte-a6114o">Help</a> <a href="/contact" class="nav-link svelte-a6114o">Contact</a></div> <div class="nav-actions svelte-a6114o">`);
    if (authState.user) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div class="user-menu svelte-a6114o"><span class="username svelte-a6114o">Welcome, ${escape_html(authState.user.username)}</span> <button class="btn-secondary svelte-a6114o">Sign Out</button></div>`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<button class="btn-secondary svelte-a6114o">Sign In</button> <button class="btn-primary svelte-a6114o">Sign Up</button>`);
    }
    $$payload2.out.push(`<!--]--></div></nav></div></header> <section class="search-section svelte-a6114o"><div class="container svelte-a6114o"><h1 class="search-title svelte-a6114o">Find Your Perfect Freight Forwarder</h1> <p class="search-subtitle svelte-a6114o">Search and compare logistics companies worldwide</p> <div class="search-container svelte-a6114o"><div class="search-box svelte-a6114o"><input type="text" placeholder="Search freight forwarders, companies, or locations..."${attr("value", searchQuery)} class="search-input svelte-a6114o"/> <button class="search-button svelte-a6114o"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svelte-a6114o"><circle cx="11" cy="11" r="8" class="svelte-a6114o"></circle><path d="m21 21-4.35-4.35" class="svelte-a6114o"></path></svg></button></div> <button class="filter-toggle svelte-a6114o">${escape_html("Show")} Filters</button></div> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></div></section> <section class="results-section svelte-a6114o"><div class="container svelte-a6114o">`);
    {
      $$payload2.out.push("<!--[!-->");
      {
        $$payload2.out.push("<!--[!-->");
        const each_array = ensure_array_like(getFilteredResults());
        $$payload2.out.push(`<div class="results-header svelte-a6114o"><h2 class="svelte-a6114o">Found ${escape_html(getFilteredResults().length)} freight forwarders</h2> `);
        {
          $$payload2.out.push("<!--[!-->");
        }
        $$payload2.out.push(`<!--]--></div> <div class="results-grid svelte-a6114o"><!--[-->`);
        for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
          let company = each_array[$$index_1];
          $$payload2.out.push(`<div class="company-card svelte-a6114o"><div class="company-header svelte-a6114o"><div class="company-logo svelte-a6114o"><img${attr("src", company.logo_url || "/default-logo.png")}${attr("alt", `${stringify(company.name)} logo`)} class="svelte-a6114o"/></div> <div class="company-info svelte-a6114o"><h3 class="company-name svelte-a6114o">${escape_html(company.name)}</h3> `);
          if (company.rating) {
            $$payload2.out.push("<!--[-->");
            const each_array_1 = ensure_array_like(Array(5));
            $$payload2.out.push(`<div class="company-rating svelte-a6114o"><div class="stars svelte-a6114o"><!--[-->`);
            for (let i = 0, $$length2 = each_array_1.length; i < $$length2; i++) {
              each_array_1[i];
              $$payload2.out.push(`<span${attr_class(`star ${stringify(i < Math.floor(company.rating) ? "filled" : "")}`, "svelte-a6114o")}>★</span>`);
            }
            $$payload2.out.push(`<!--]--></div> <span class="rating-text svelte-a6114o">${escape_html(company.rating)} (${escape_html(company.review_count || 0)} reviews)</span></div>`);
          } else {
            $$payload2.out.push("<!--[!-->");
          }
          $$payload2.out.push(`<!--]--></div></div> `);
          if (company.website) {
            $$payload2.out.push("<!--[-->");
            $$payload2.out.push(`<div class="company-website svelte-a6114o"><a${attr("href", company.website)} target="_blank" rel="noopener noreferrer" class="svelte-a6114o">Visit Website</a></div>`);
          } else {
            $$payload2.out.push("<!--[!-->");
          }
          $$payload2.out.push(`<!--]--> <div class="company-actions svelte-a6114o"><button class="view-details-btn svelte-a6114o">View Details</button> <button class="write-review-btn svelte-a6114o">Write Review</button></div></div>`);
        }
        $$payload2.out.push(`<!--]--></div> `);
        if (getFilteredResults().length === 0) {
          $$payload2.out.push("<!--[-->");
          $$payload2.out.push(`<div class="no-results svelte-a6114o"><h3 class="svelte-a6114o">No freight forwarders found</h3> <p class="svelte-a6114o">Try adjusting your search terms or filters</p> <button class="btn-primary svelte-a6114o">Show All Companies</button></div>`);
        } else {
          $$payload2.out.push("<!--[!-->");
        }
        $$payload2.out.push(`<!--]-->`);
      }
      $$payload2.out.push(`<!--]-->`);
    }
    $$payload2.out.push(`<!--]--></div></section> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    AuthModal($$payload2, {
      defaultMode: authModalMode,
      get isOpen() {
        return showAuthModal;
      },
      set isOpen($$value) {
        showAuthModal = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> <footer class="footer svelte-a6114o"><div class="container svelte-a6114o"><div class="footer-content svelte-a6114o"><div class="footer-section svelte-a6114o"><h3 class="svelte-a6114o">Company</h3> <ul class="svelte-a6114o"><li class="svelte-a6114o"><a href="/about" class="svelte-a6114o">About</a></li> <li class="svelte-a6114o"><a href="/careers" class="svelte-a6114o">Careers</a></li> <li class="svelte-a6114o"><a href="/press" class="svelte-a6114o">Press</a></li> <li class="svelte-a6114o"><a href="/contact" class="svelte-a6114o">Contact</a></li></ul></div> <div class="footer-section svelte-a6114o"><h3 class="svelte-a6114o">Platform</h3> <ul class="svelte-a6114o"><li class="svelte-a6114o"><a href="/how-it-works" class="svelte-a6114o">How It Works</a></li> <li class="svelte-a6114o"><a href="/pricing" class="svelte-a6114o">Pricing</a></li> <li class="svelte-a6114o"><a href="/features" class="svelte-a6114o">Features</a></li> <li class="svelte-a6114o"><a href="/api" class="svelte-a6114o">API</a></li></ul></div> <div class="footer-section svelte-a6114o"><h3 class="svelte-a6114o">Support</h3> <ul class="svelte-a6114o"><li class="svelte-a6114o"><a href="/help" class="svelte-a6114o">Help Center</a></li> <li class="svelte-a6114o"><a href="/faq" class="svelte-a6114o">FAQ</a></li> <li class="svelte-a6114o"><a href="/guidelines" class="svelte-a6114o">Guidelines</a></li> <li class="svelte-a6114o"><a href="/contact-support" class="svelte-a6114o">Contact Support</a></li></ul></div> <div class="footer-section svelte-a6114o"><h3 class="svelte-a6114o">Legal</h3> <ul class="svelte-a6114o"><li class="svelte-a6114o"><a href="/privacy" class="svelte-a6114o">Privacy Policy</a></li> <li class="svelte-a6114o"><a href="/terms" class="svelte-a6114o">Terms of Service</a></li> <li class="svelte-a6114o"><a href="/cookies" class="svelte-a6114o">Cookie Policy</a></li> <li class="svelte-a6114o"><a href="/security" class="svelte-a6114o">Security</a></li></ul></div></div> <div class="footer-bottom svelte-a6114o"><p class="svelte-a6114o">© 2025 LogiScore. All rights reserved.</p></div></div></footer>`);
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
