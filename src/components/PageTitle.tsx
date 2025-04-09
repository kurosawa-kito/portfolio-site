import { Heading, Box, Text, VStack } from "@chakra-ui/react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  children?: React.ReactNode;
}

export default function PageTitle({
  title,
  subtitle,
  emoji,
  children,
}: PageTitleProps) {
  return (
    <Box w="100%" mb={6}>
      <VStack spacing={2} align="center">
        <Heading
          size="lg"
          bgGradient="linear(to-r, blue.500, purple.500)"
          bgClip="text"
          textAlign="center"
        >
          {emoji && (
            <Box as="span" mr={2}>
              {emoji}
            </Box>
          )}
          {title || children}
        </Heading>
        {subtitle && (
          <Text color="gray.600" fontSize="md" textAlign="center">
            {subtitle}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
