import type { Metadata } from "next";
import RedirectToPrograms from "@/components/RedirectToPrograms";

export const metadata: Metadata = {
  title: "Redirecting — FAITH Foundation",
  robots: { index: false, follow: false },
  alternates: { canonical: "/programs" },
};

export default function SingleParentsPage() {
  return <RedirectToPrograms />;
}
