import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { _ as addAttribute, d as renderTemplate, h as maybeRenderHead, i as renderComponent } from "./server_CNiDaRmB.mjs";
import { t as createComponent } from "./astro-component_SYADG7pl.mjs";
import "./compiler_Dd9cibqx.mjs";
import { n as hello_exports, r as hello_world_exports, t as $$BlogLayout } from "./BlogLayout_CDu9ZvH4.mjs";
//#region src/pages/blog/index.astro
var blog_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const postModules = /* #__PURE__ */ Object.assign({
		"../../content/posts/hello-world.md": hello_world_exports,
		"../../content/posts/hello.md": hello_exports
	});
	const postList = [];
	for (const filePath in postModules) {
		const fm = postModules[filePath].frontmatter;
		const slug = filePath.split("/").at(-1).replace(".md", "");
		const rawDate = fm.date ?? fm.pubDate ?? "";
		const dateObj = new Date(rawDate);
		const validDate = isNaN(dateObj.getTime()) ? /* @__PURE__ */ new Date() : dateObj;
		postList.push({
			slug,
			title: fm.title,
			date: validDate
		});
	}
	postList.sort((a, b) => b.date.getTime() - a.date.getTime());
	return renderTemplate`${renderComponent($$result, "BlogLayout", $$BlogLayout, {
		"title": "全部笔记",
		"data-astro-cid-x255k2k2": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main style="max-width:860px;margin:4rem auto;padding:0 2rem;font-family:system-ui;" data-astro-cid-x255k2k2><header style="margin-bottom:3rem;" data-astro-cid-x255k2k2><h1 style="font-size:2.6rem;font-weight:400;margin:0 0 0.6rem;color:#111;" data-astro-cid-x255k2k2>全部笔记</h1><p style="color:#666;margin:0;" data-astro-cid-x255k2k2>当前文章总数：${postList.length}</p><div style="width:60px;height:3px;background:#2277dd;margin-top:1rem;" data-astro-cid-x255k2k2></div></header>${postList.length === 0 ? renderTemplate`<p style="color:#888;text-align:center;padding:3rem 0;" data-astro-cid-x255k2k2>暂无发布文章</p>` : renderTemplate`<ul style="list-style:none;padding:0;margin:0;" data-astro-cid-x255k2k2>${postList.map((post) => renderTemplate`<li style="padding:1.8rem 0;border-bottom:1px solid #eee;" data-astro-cid-x255k2k2><a${addAttribute(/blog/, "href")} style="font-size:1.45rem;color:#111;text-decoration:none;" data-astro-cid-x255k2k2>${post.title}</a><div style="margin-top:0.7rem;color:#666;font-size:0.95rem;" data-astro-cid-x255k2k2>${post.date.getFullYear()}-${(post.date.getMonth() + 1).toString().padStart(2, "0")}-${post.date.getDate().toString().padStart(2, "0")}</div></li>`)}</ul>`}</main>` })}`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/pages/blog/index.astro", void 0);
var $$file = "C:/Users/Administrator/stellar-shepherd-new/src/pages/blog/index.astro";
var $$url = "/blog";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/index@_@astro
var page = () => blog_exports;
//#endregion
export { page };
