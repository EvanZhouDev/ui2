import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<>
				<svg
					width="31"
					height="30"
					viewBox="-100 0 900 550"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 400C100 427.614 122.386 450 150 450C177.614 450 200 427.614 200 400V150C200 67.1574 267.157 0 350 0H800V100H700V450H800V550H300V450H400V100H350C322.386 100 300 122.386 300 150V400C300 482.843 232.843 550 150 550C67.1572 550 0 482.843 0 400V0H100V400ZM500 450H600V100H500V450Z"
						fill="currentcolor"
					/>
				</svg>
				UI2 Docs
			</>
		),
	},
	links: [
		{
			text: "Documentation",
			url: "/",
			active: "nested-url",
		},
	],
};
