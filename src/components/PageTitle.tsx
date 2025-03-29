import { Heading, Box } from "@chakra-ui/react";

interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <Box w="100%">
      <Heading
        size="lg"
        bgGradient="linear(to-r, blue.500, purple.500)"
        bgClip="text"
        textAlign="center"
        mb={4}
      >
        {children}
      </Heading>
    </Box>
  );
}
