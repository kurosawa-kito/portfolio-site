import { Heading, Box } from "@chakra-ui/react";

interface PageHeaderProps {
  children: React.ReactNode;
}

export const PageHeader = ({ children }: PageHeaderProps) => {
  return (
    <Box w="100%">
      <Heading
        size="lg"
        bgGradient="linear(to-r, blue.500, purple.500)"
        bgClip="text"
        textAlign="center"
        mb={2}
      >
        {children}
      </Heading>
    </Box>
  );
};
