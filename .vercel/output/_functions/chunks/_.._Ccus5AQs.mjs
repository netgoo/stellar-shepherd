import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_CNiDaRmB.mjs";
import { t as createComponent } from "./astro-component_SYADG7pl.mjs";
import { t as keystatic_config_default } from "./keystatic.config_DDmSf67S.mjs";
import "./compiler_Dd9cibqx.mjs";
import "react";
import { Keystatic } from "@keystatic/core/ui";
import { jsx } from "react/jsx-runtime";
//#region node_modules/.pnpm/@keystatic+astro@5.2.0_@key_a1bb302c712a81b48040d55b8819a76f/node_modules/@keystatic/astro/dist/keystatic-astro-ui.js
var appSlug = {
	envName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG",
	value: "netgoo-keystatic"
};
function makePage(config) {
	return function Keystatic$1() {
		return /* @__PURE__ */ jsx(Keystatic, {
			config,
			appSlug
		});
	};
}
//#endregion
//#region src/pages/keystatic/[...params].astro
var ____params__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Component,
	file: () => $$file,
	url: () => $$url
});
var $$Component = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "KeystaticPage", makePage(keystatic_config_default), {})}`;
}, "C:/Users/Administrator/stellar-shepherd-new/src/pages/keystatic/[...params].astro", void 0);
var $$file = "C:/Users/Administrator/stellar-shepherd-new/src/pages/keystatic/[...params].astro";
var $$url = "/keystatic/[...params]";
//#endregion
//#region \0virtual:astro:page:src/pages/keystatic/[...params]@_@astro
var page = () => ____params__exports;
//#endregion
export { page };
