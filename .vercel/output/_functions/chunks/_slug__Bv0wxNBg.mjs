import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as renderTemplate, h as maybeRenderHead, i as renderComponent, w as createAstro } from "./server_CNiDaRmB.mjs";
import { t as createComponent } from "./astro-component_SYADG7pl.mjs";
import "./compiler_Dd9cibqx.mjs";
import { n as hello_exports, r as hello_world_exports, t as $$BlogLayout } from "./BlogLayout_CDu9ZvH4.mjs";
//#region src/pages/blog/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://stellarshepherd.com");
var $$Slug = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const allPostFiles = /* #__PURE__ */ Object.assign({
		"../../content/posts/hello-world.md": hello_world_exports,
		"../../content/posts/hello.md": hello_exports
	});
	const { slug } = Astro.params;
	const targetPost = allPostFiles[`../../content/posts/${slug}.md`];
	if (!targetPost) return Astro.redirect("/blog");
	const { default: ArticleContent, frontmatter } = targetPost;
	const rawPublishDate = frontmatter.date ?? frontmatter.pubDate;
	const dateObj = new Date(rawPublishDate);
	const displayDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`;
	return renderTemplate`${renderComponent($$result, "BlogLayout", $$BlogLayout, {
		"title": frontmatter.title,
		"data-astro-cid-zg7dkzxc": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main style="max-width:860px;margin:4rem auto;padding:0 2rem;font-family:system-ui,-apple-system,Segoe UI,Roboto;" data-astro-cid-zg7dkzxc><a href="/blog" style="display:inline-block;margin-bottom:2.5rem;color:#666;text-decoration:none;font-size:1rem;" data-astro-cid-zg7dkzxc>← 返回全部笔记</a><header style="margin-bottom:3rem;border-bottom:1px solid #eee;padding-bottom:1.8rem;" data-astro-cid-zg7dkzxc><h1 style="font-size:2.4rem;font-weight:400;margin:0 0 1rem;color:#111;" data-astro-cid-zg7dkzxc>${frontmatter.title}</h1><time style="display:block;color:#666;font-size:0.95rem;" data-astro-cid-zg7dkzxc>${displayDate}</time></header><article style="line-height:1.9;font-size:1.08rem;color:#222;" data-astro-cid-zg7dkzxc>${renderComponent($$result, "ArticleContent", ArticleContent, { "data-astro-cid-zg7dkzxc": true })}</article></main>` })}`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/pages/blog/[slug].astro", void 0);
var $$file = "C:/Users/Administrator/stellar-shepherd-new/src/pages/blog/[slug].astro";
var $$url = "/blog/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
