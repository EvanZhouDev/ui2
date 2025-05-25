import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
	subsets: ["latin"],
});

import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export const metadata: Metadata = {
	icons: {
		icon: [
			{ url: "/favicon-light.ico", media: "(prefers-color-scheme: light)" },
			{ url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
		],
	},
};

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider>
					<DocsLayout tree={source.pageTree} {...baseOptions}>
						{children}
					</DocsLayout>
				</RootProvider>
				<Analytics />
			</body>
		</html>
	);
}
