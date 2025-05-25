import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		// Only include valid React components from TabsComponents
		...Object.fromEntries(
			Object.entries(TabsComponents).filter(
				([, value]) => typeof value === "function" || (typeof value === "object" && value !== null && ("$$typeof" in value))
			)
		),
		...components,
	};
}
