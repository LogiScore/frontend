import { O as head, w as pop, u as push } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "clsx";
import "../../../chunks/state.svelte.js";
import "../../../chunks/auth.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Authenticating - LogiScore</title>`;
  });
  $$payload.out.push(`<div class="callback-container svelte-7akrql">`);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="loading svelte-7akrql"><div class="spinner svelte-7akrql"></div> <h2 class="svelte-7akrql">Authenticating with GitHub...</h2> <p class="svelte-7akrql">Please wait while we complete your sign-in.</p></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
