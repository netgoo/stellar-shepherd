import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as makeHandler } from "./keystatic-astro-api_U8553d7Z.mjs";
import { collection, config } from "@keystatic/core";
//#region src/keystatic.config.ts
var keystatic_config_default = config({
	storage: { kind: "local" },
	collections: { blog: collection({
		label: "Blog Posts",
		slugField: "title",
		path: "src/content/blog/*",
		format: { contentField: "content" },
		schema: {
			title: {
				type: "text",
				label: "Title",
				validation: { isRequired: true }
			},
			description: {
				type: "text",
				label: "Description",
				validation: { isRequired: true }
			},
			pubDate: {
				type: "date",
				label: "Publish Date",
				validation: { isRequired: true }
			},
			updatedDate: {
				type: "date",
				label: "Updated Date"
			},
			heroImage: {
				type: "image",
				label: "Hero Image",
				directory: "src/assets/images/blog"
			},
			content: {
				type: "document",
				label: "Content",
				formatting: true
			}
		}
	}) }
});
//#endregion
//#region src/pages/api/keystatic/[...params].ts
var ____params__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var { GET, POST } = makeHandler({ config: keystatic_config_default });
//#endregion
//#region \0virtual:astro:page:src/pages/api/keystatic/[...params]@_@ts
var page = () => ____params__exports;
//#endregion
export { page };
