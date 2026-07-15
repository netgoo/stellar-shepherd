import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as unescapeHTML, c as renderSlot, d as renderTemplate, g as renderHead, h as maybeRenderHead, w as createAstro } from "./server_CNiDaRmB.mjs";
import { t as createComponent } from "./astro-component_SYADG7pl.mjs";
import "./compiler_Dd9cibqx.mjs";
//#region src/content/posts/hello-world.md
var hello_world_exports = /* @__PURE__ */ __exportAll({
	Content: () => Content$1,
	compiledContent: () => compiledContent$1,
	default: () => Content$1,
	file: () => file$1,
	frontmatter: () => frontmatter$1,
	getHeadings: () => getHeadings$1,
	rawContent: () => rawContent$1,
	url: () => void 0
});
var html$1 = () => "<h1 id=\"welcome-to-my-blog\">Welcome to My Blog</h1>\n<p>This is a <strong>test post</strong> to verify the content collection setup.</p>\n<h2 id=\"features\">Features</h2>\n<ul>\n<li>Markdown support</li>\n<li>Content Collections</li>\n<li>Static generation</li>\n</ul>\n";
var frontmatter$1 = {
	"title": "Hello World",
	"pubDate": "2024-01-15T00:00:00.000Z",
	"description": "My first blog post with Astro"
};
var file$1 = "C:/Users/Administrator/stellar-shepherd-new/src/content/posts/hello-world.md";
function rawContent$1() {
	return "﻿   \n                  \n                   \n                                          \n   \n\n# Welcome to My Blog\n\nThis is a **test post** to verify the content collection setup.\n\n## Features\n\n- Markdown support\n- Content Collections\n- Static generation\r\n";
}
async function compiledContent$1() {
	return await html$1();
}
function getHeadings$1() {
	return [{
		"depth": 1,
		"slug": "welcome-to-my-blog",
		"text": "Welcome to My Blog"
	}, {
		"depth": 2,
		"slug": "features",
		"text": "Features"
	}];
}
var Content$1 = createComponent((result, _props, slots) => {
	const { layout, ...content } = frontmatter$1;
	content.file = file$1;
	content.url = void 0;
	return renderTemplate`${maybeRenderHead()}${unescapeHTML(html$1())}`;
});
//#endregion
//#region src/content/posts/hello.md
var hello_exports = /* @__PURE__ */ __exportAll({
	Content: () => Content,
	compiledContent: () => compiledContent,
	default: () => Content,
	file: () => file,
	frontmatter: () => frontmatter,
	getHeadings: () => getHeadings,
	rawContent: () => rawContent,
	url: () => void 0
});
var html = () => "<p>这是你的第一篇文章。</p>\n";
var frontmatter = {
	"title": "欢迎使用 Keystatic",
	"pubDate": "2026-07-14T00:00:00.000Z",
	"description": "这是你的第一篇文章。"
};
var file = "C:/Users/Administrator/stellar-shepherd-new/src/content/posts/hello.md";
function rawContent() {
	return "﻿   \n                     \n                   \n                       \n   \n\n这是你的第一篇文章。\r\n";
}
async function compiledContent() {
	return await html();
}
function getHeadings() {
	return [];
}
var Content = createComponent((result, _props, slots) => {
	const { layout, ...content } = frontmatter;
	content.file = file;
	content.url = void 0;
	return renderTemplate`${maybeRenderHead()}${unescapeHTML(html())}`;
});
//#endregion
//#region src/layouts/BlogLayout.astro
createAstro("https://stellarshepherd.com");
var $$BlogLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BlogLayout;
	const { title } = Astro.props;
	return renderTemplate`<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead($$result)}</head><body>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/layouts/BlogLayout.astro", void 0);
//#endregion
export { hello_exports as n, hello_world_exports as r, $$BlogLayout as t };
