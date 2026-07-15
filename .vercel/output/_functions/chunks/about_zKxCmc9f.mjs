import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as $$Image } from "./_astro_assets_B4OdoNDj.mjs";
import { _ as addAttribute, c as renderSlot, d as renderTemplate, g as renderHead, h as maybeRenderHead, i as renderComponent, w as createAstro } from "./server_CNiDaRmB.mjs";
import { t as createComponent } from "./astro-component_SYADG7pl.mjs";
import "./compiler_Dd9cibqx.mjs";
import { n as $$Footer, r as $$BaseHead, t as $$Header } from "./Header_Deu-hPNs.mjs";
//#region src/assets/blog-placeholder-about.jpg
var blog_placeholder_about_default = new Proxy({
	"src": "/_astro/blog-placeholder-about.BtEdEmGp.jpg",
	"width": 960,
	"height": 480,
	"format": "jpg"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "C:/Users/Administrator/stellar-shepherd-new/src/assets/blog-placeholder-about.jpg";
	return target[name];
} });
//#endregion
//#region src/components/FormattedDate.astro
createAstro("https://stellarshepherd.com");
var $$FormattedDate = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$FormattedDate;
	const { date } = Astro.props;
	let validDate = date;
	if (!validDate || !(validDate instanceof Date) || isNaN(new Date(validDate).getTime())) validDate = /* @__PURE__ */ new Date();
	else if (!(validDate instanceof Date)) validDate = new Date(validDate);
	return renderTemplate`${maybeRenderHead($$result)}<time${addAttribute(validDate.toISOString(), "datetime")}>${validDate.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "long",
		day: "numeric"
	})}</time>`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/components/FormattedDate.astro", void 0);
//#endregion
//#region src/layouts/BlogPost.astro
createAstro("https://stellarshepherd.com");
var $$BlogPost = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BlogPost;
	const { title, description, pubDate, updatedDate, heroImage } = Astro.props;
	return renderTemplate`<html lang="en" data-astro-cid-tldeq5d5><head>${renderComponent($$result, "BaseHead", $$BaseHead, {
		"title": title,
		"description": description,
		"data-astro-cid-tldeq5d5": true
	})}${renderHead($$result)}</head><body data-astro-cid-tldeq5d5>${renderComponent($$result, "Header", $$Header, { "data-astro-cid-tldeq5d5": true })}<main data-astro-cid-tldeq5d5><article data-astro-cid-tldeq5d5><div class="hero-image" data-astro-cid-tldeq5d5>${heroImage && renderTemplate`${renderComponent($$result, "Image", $$Image, {
		"width": 1020,
		"height": 510,
		"src": heroImage,
		"alt": "",
		"data-astro-cid-tldeq5d5": true
	})}`}</div><div class="prose" data-astro-cid-tldeq5d5><div class="title" data-astro-cid-tldeq5d5><div class="date" data-astro-cid-tldeq5d5>${renderComponent($$result, "FormattedDate", $$FormattedDate, {
		"date": pubDate,
		"data-astro-cid-tldeq5d5": true
	})}${updatedDate && renderTemplate`<div class="last-updated-on" data-astro-cid-tldeq5d5>Last updated on ${renderComponent($$result, "FormattedDate", $$FormattedDate, {
		"date": updatedDate,
		"data-astro-cid-tldeq5d5": true
	})}</div>`}</div><h1 data-astro-cid-tldeq5d5>${title}</h1><hr data-astro-cid-tldeq5d5></div>${renderSlot($$result, $$slots["default"])}</div></article></main>${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-tldeq5d5": true })}</body></html>`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/layouts/BlogPost.astro", void 0);
//#endregion
//#region src/pages/about.astro
var about_exports = /* @__PURE__ */ __exportAll({
	default: () => $$About,
	file: () => $$file,
	url: () => $$url
});
var $$About = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$BlogPost, {
		"title": "About Me",
		"description": "Lorem ipsum dolor sit amet",
		"pubDate": /* @__PURE__ */ new Date("August 08 2021"),
		"heroImage": blog_placeholder_about_default
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.</p><p>Morbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.</p><p>Mollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.</p><p>Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.</p><p>Tempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.</p>` })}`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/pages/about.astro", void 0);
var $$file = "C:/Users/Administrator/stellar-shepherd-new/src/pages/about.astro";
var $$url = "/about";
//#endregion
//#region \0virtual:astro:page:src/pages/about@_@astro
var page = () => about_exports;
//#endregion
export { page };
