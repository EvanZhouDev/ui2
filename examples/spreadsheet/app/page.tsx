"use client";
import { useIsClient } from "@uidotdev/usehooks";
import Spreadsheet from "./components/Spreadsheet";

export default function Home() {
	const isClient = useIsClient();
	if (!isClient) {
		return null;
	}

	return <Spreadsheet />;
}
