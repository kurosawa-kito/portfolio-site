import { Heading, Box } from "@chakra-ui/react";

interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <Box w="100%">
      <Heading
        size="md"
        bgGradient="linear(to-r, blue.500, purple.500)"
        bgClip="text"
        textAlign="center"
        mb={1}
        py={1}
      >
        {children}
      </Heading>
    </Box>
  );
}
