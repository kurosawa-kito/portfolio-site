import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface SectionTitleProps {
  title: string;
  icon?: string;
  spacing?: number;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon = "📋",
  spacing = 2,
}) => {
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Box
      position="relative"
      py={2}
      mb={spacing}
      mt={4}
      px={3}
      borderLeftWidth="4px"
      borderLeftColor="blue.500"
      bg={subtitleBg}
      borderRadius="md"
      boxShadow="sm"
    >
      <Text
        fontSize="lg"
        fontWeight="bold"
        bgGradient="linear(to-r, blue.500, purple.500)"
        bgClip="text"
        display="flex"
        alignItems="center"
      >
        <Box as="span" mr={2}>
          {icon}
        </Box>
        {title}
      </Text>
    </Box>
  );
};

export default SectionTitle;
