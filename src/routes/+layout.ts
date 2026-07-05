// Fully static: prerender every route to HTML/CSS/JS at build time (no runtime
// server). SvelteKit still SSRs during the build to generate the HTML, then the
// client hydrates. Pairs with @sveltejs/adapter-static.
export const prerender = true;
