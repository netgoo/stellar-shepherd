import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as renderTemplate, g as renderHead, i as renderComponent } from "./server_CNiDaRmB.mjs";
import { t as createComponent } from "./astro-component_SYADG7pl.mjs";
import "./compiler_Dd9cibqx.mjs";
import { n as $$Footer, r as $$BaseHead, t as $$Header } from "./Header_Deu-hPNs.mjs";
import { n as SITE_TITLE, t as SITE_DESCRIPTION } from "./consts_D6-OAHNs.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<html lang="en"><head>${renderComponent($$result, "BaseHead", $$BaseHead, {
		"title": SITE_TITLE,
		"description": SITE_DESCRIPTION
	})}${renderHead($$result)}</head><body>${renderComponent($$result, "Header", $$Header, {})}<main><h1>🧑‍🚀 Hello, Astronaut!</h1><p>Welcome to the official <a href="https://astro.build/">Astro</a> blog starter template. This template serves as a lightweight, minimally-styled starting point for anyone looking to build a personal website, blog, or portfolio with Astro.</p><p>This template comes with a few integrations already configured in your<code>astro.config.mjs</code> file. You can customize your setup with<a href="https://astro.build/integrations">Astro Integrations</a> to add tools like Tailwind, React, or Vue to your project.</p><p>Here are a few ideas on how to get started with the template:</p><ul><li>Edit this page in <code>src/pages/index.astro</code></li><li>Edit the site header items in <code>src/components/Header.astro</code></li><li>Add your name to the footer in <code>src/components/Footer.astro</code></li><li>Check out the included blog posts in <code>src/content/blog/</code></li><li>Customize the blog post page layout in <code>src/layouts/BlogPost.astro</code></li></ul><p>Have fun! If you get stuck, remember to<a href="https://docs.astro.build/">read the docs</a>or <a href="https://astro.build/chat">join us on Discord</a> to ask questions.</p><p>Looking for a blog template with a bit more personality? Check out<a href="https://github.com/Charca/astro-blog-template">astro-blog-template</a>by <a href="https://twitter.com/Charca">Maxi Ferreira</a>.</p></main>${renderComponent($$result, "Footer", $$Footer, {})}</body></html>`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/pages/index.astro", void 0);
var $$file = "C:/Users/Administrator/stellar-shepherd-new/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
