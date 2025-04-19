import React from "react";
import { Card, CardBody, Text, useColorModeValue } from "@chakra-ui/react";

interface EmptyStateCardProps {
  message?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  message = "タスクはありません",
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <Text textAlign="center" color="gray.500">
          {message}
        </Text>
      </CardBody>
    </Card>
  );
};

export default EmptyStateCard;
