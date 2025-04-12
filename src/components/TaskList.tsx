import React, { useMemo, useCallback } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  Checkbox,
  IconButton,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

interface Task {
  id: string | number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  assigned_to_username?: string;
  created_by_username?: string;
  is_all_day?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (id: string | number, status: string) => void;
  showSubtitle?: boolean;
  viewType?: "card" | "table";
  isLoading?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string | number) => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

const priorityColors = {
  low: "green",
  medium: "yellow",
  high: "red",
};

const priorityLabels = {
  low: "低",
  medium: "中",
  high: "高",
};

const formatDateTime = (dateString: string, isAllDay?: boolean): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    if (isAllDay) {
      return `${year}/${month}/${day}`;
    }
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

export default function TaskList({
  tasks,
  onStatusChange,
  showSubtitle = true,
  viewType = "card",
  isLoading = false,
  onEditTask,
  onDeleteTask,
  showEditButton = true,
  showDeleteButton = true,
}: TaskListProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleBg = useColorModeValue("blue.50", "blue.900");
  const toast = useToast();

  // タスクを完了状態に基づいてソート（useMemoを使用してメモ化）
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      return 0;
    });
  }, [tasks]);

  // イベントハンドラをメモ化
  const handleDelete = useCallback(
    (id: string | number) => {
      if (onDeleteTask) {
        onDeleteTask(id);
      }
    },
    [onDeleteTask]
  );

  const handleEdit = useCallback(
    (task: Task) => {
      if (onEditTask) {
        onEditTask(task);
      }
    },
    [onEditTask]
  );

  const handleStatusChange = useCallback(
    (id: string | number, status: string) => {
      if (onStatusChange) {
        onStatusChange(id, status);
      }
    },
    [onStatusChange]
  );

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <>
      {showSubtitle && (
        <Box
          position="relative"
          py={2}
          mb={2}
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
              📋
            </Box>
            タスク管理
          </Text>
        </Box>
      )}

      {viewType === "card" ? (
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
          mt={showSubtitle ? -2 : 0}
        >
          {tasks.length === 0 ? (
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Text textAlign="center" color="gray.500">
                  タスクはありません
                </Text>
              </CardBody>
            </Card>
          ) : (
            sortedTasks.map((task) => (
              <Card
                key={task.id}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
                size="sm"
              >
                <CardBody p={3}>
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Checkbox
                        isChecked={task.status === "completed"}
                        onChange={(e) =>
                          handleStatusChange(
                            String(task.id),
                            e.target.checked ? "completed" : "pending"
                          )
                        }
                        size="md"
                      >
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          textDecoration={
                            task.status === "completed"
                              ? "line-through"
                              : "none"
                          }
                          noOfLines={1}
                        >
                          {task.title}
                        </Text>
                      </Checkbox>
                      <HStack spacing={1}>
                        <Badge
                          colorScheme={
                            priorityColors[
                              task.priority as keyof typeof priorityColors
                            ]
                          }
                          fontSize="xs"
                        >
                          {
                            priorityLabels[
                              task.priority as keyof typeof priorityLabels
                            ]
                          }
                        </Badge>
                        {showEditButton && (
                          <IconButton
                            aria-label="編集"
                            icon={<EditIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(task)}
                          />
                        )}
                        {showDeleteButton && (
                          <IconButton
                            aria-label="削除"
                            icon={<DeleteIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(task.id)}
                          />
                        )}
                      </HStack>
                    </HStack>
                    <Text color="gray.600" fontSize="sm" noOfLines={2} mb={1}>
                      {task.description}
                    </Text>
                    <HStack
                      justify="space-between"
                      fontSize="xs"
                      color="gray.500"
                    >
                      <Text>
                        期限: {formatDateTime(task.due_date, task.is_all_day)}
                      </Text>
                      {task.created_by_username && (
                        <Text>作成者: {task.created_by_username}</Text>
                      )}
                    </HStack>
                  </Box>
                </CardBody>
              </Card>
            ))
          )}
        </SimpleGrid>
      ) : (
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          mt={showSubtitle ? -2 : 0}
        >
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>タイトル</Th>
                  <Th>説明</Th>
                  <Th>期限</Th>
                  <Th>優先度</Th>
                  <Th>ステータス</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" color="gray.500">
                      タスクはありません
                    </Td>
                  </Tr>
                ) : (
                  sortedTasks.map((task) => (
                    <Tr key={task.id}>
                      <Td>{task.title}</Td>
                      <Td>{task.description}</Td>
                      <Td>{formatDateTime(task.due_date, task.is_all_day)}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            priorityColors[
                              task.priority as keyof typeof priorityColors
                            ]
                          }
                        >
                          {
                            priorityLabels[
                              task.priority as keyof typeof priorityLabels
                            ]
                          }
                        </Badge>
                      </Td>
                      <Td>
                        <Checkbox
                          isChecked={task.status === "completed"}
                          onChange={(e) =>
                            handleStatusChange(
                              String(task.id),
                              e.target.checked ? "completed" : "pending"
                            )
                          }
                        />
                      </Td>
                      <Td textAlign="right">
                        {showEditButton && (
                          <IconButton
                            aria-label="編集"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(task)}
                            mr={2}
                          />
                        )}
                        {showDeleteButton && (
                          <IconButton
                            aria-label="削除"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(task.id)}
                          />
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </>
  );
}
