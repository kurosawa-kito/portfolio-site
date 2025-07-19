"use client";

import { EbayAuthProvider } from "@/contexts/EbayAuthContext";
import { ReactNode } from "react";

export default function EbayAutomationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <EbayAuthProvider>{children}</EbayAuthProvider>;
}
