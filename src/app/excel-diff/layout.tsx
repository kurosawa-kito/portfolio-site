"use client";

import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";

export default function ExcelDiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        {children}
      </Box>
    </ChakraProvider>
  );
}
