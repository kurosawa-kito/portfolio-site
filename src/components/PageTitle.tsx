import { Heading, Box, useColorModeValue } from "@chakra-ui/react";

interface PageTitleProps {
  title: string;
  gradient?: string;
  mb?: number;
  textAlign?: "left" | "center" | "right";
}

export default function PageTitle({
  title,
  gradient = "linear(to-r, blue.500, purple.500)",
  mb = 6,
  textAlign = "center",
}: PageTitleProps) {
  return (
    <Box mb={mb}>
      <Heading
        size="lg"
        bgGradient={gradient}
        bgClip="text"
        textAlign={textAlign}
      >
        {title}
      </Heading>
    </Box>
  );
}
