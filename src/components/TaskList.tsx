import React from "react";
import {
  Box,
  Text,
  VStack,
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
  Flex,
  Spacer,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, TimeIcon, InfoIcon } from "@chakra-ui/icons";

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
  updated_at?: string;
}

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (id: string | number, status: string) => void;
  showSubtitle?: boolean;
  viewType?: "card" | "table";
  isLoading?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string | number) => void;
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

// 日付と時間をフォーマットする関数
const formatDateTime = (dateString: string, isAllDay?: boolean): string => {
  if (!dateString) return "";

  try {
    // データベースのタイムスタンプ文字列を直接解析（タイムゾーン指定なし）
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // 無効な日付の場合はそのまま返す

    // UTCとして扱い、タイムゾーン変換を避ける
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    // 終日タスクの場合は時間を表示しない
    if (isAllDay) {
      return `${year}/${month}/${day}`;
    }

    // 時間情報も表示（UTCの値をそのまま使用）
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
}: TaskListProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleBg = useColorModeValue("blue.50", "blue.900");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();

  // タスク削除処理
  const handleDelete = async (id: string | number) => {
    if (onDeleteTask) {
      onDeleteTask(id);
    }
  };

  // タスク編集処理
  const handleEdit = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // タスクが空の場合
  if (tasks.length === 0) {
    return (
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Text textAlign="center" color="gray.500">
            タスクはありません
          </Text>
        </CardBody>
      </Card>
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
        <VStack spacing={2} align="stretch" mt={showSubtitle ? -2 : 0}>
          {tasks.map((task) => (
            <Card
              key={task.id}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
              _hover={{ boxShadow: "md", background: hoverBg }}
              transition="all 0.2s"
              position="relative"
              overflow="hidden"
              borderLeft="4px solid"
              borderLeftColor={
                task.status === "completed"
                  ? "green.400"
                  : priorityColors[
                      task.priority as keyof typeof priorityColors
                    ] + ".400"
              }
            >
              <CardBody py={2} px={3}>
                <Flex direction="column" gap={1}>
                  {/* タイトル行 */}
                  <Flex align="center" gap={2}>
                    <Checkbox
                      isChecked={task.status === "completed"}
                      onChange={(e) =>
                        onStatusChange &&
                        onStatusChange(
                          task.id,
                          e.target.checked ? "completed" : "pending"
                        )
                      }
                      size="md"
                      colorScheme={
                        task.status === "completed" ? "green" : "blue"
                      }
                      isDisabled={!onStatusChange}
                    />
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      textDecoration={
                        task.status === "completed" ? "line-through" : "none"
                      }
                      color={
                        task.status === "completed" ? "gray.500" : "inherit"
                      }
                      noOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <Spacer />
                    <Badge
                      colorScheme={
                        priorityColors[
                          task.priority as keyof typeof priorityColors
                        ]
                      }
                      variant="subtle"
                      px={1.5}
                      py={0.5}
                      borderRadius="full"
                      fontSize="2xs"
                    >
                      {
                        priorityLabels[
                          task.priority as keyof typeof priorityLabels
                        ]
                      }
                    </Badge>
                  </Flex>

                  {/* 説明文（あれば表示） */}
                  {task.description && (
                    <Box
                      ml={8}
                      color={
                        task.status === "completed" ? "gray.500" : "gray.700"
                      }
                    >
                      <Text fontSize="xs" noOfLines={1}>
                        {task.description}
                      </Text>
                    </Box>
                  )}

                  {/* 日付と操作ボタン */}
                  <Flex align="center" justify="space-between" ml={8} mt={0.5}>
                    <Flex align="center" gap={1.5}>
                      <Tooltip label="期限" placement="top">
                        <Flex align="center" color="gray.500" fontSize="2xs">
                          <TimeIcon boxSize="2.5" mr={0.5} />
                          <Text>
                            {formatDateTime(task.due_date, task.is_all_day)}
                          </Text>
                        </Flex>
                      </Tooltip>

                      {task.created_by_username && (
                        <Tooltip label="作成者" placement="top">
                          <Flex align="center" color="gray.500" fontSize="2xs">
                            <InfoIcon boxSize="2.5" mr={0.5} />
                            <Text>{task.created_by_username}</Text>
                          </Flex>
                        </Tooltip>
                      )}
                    </Flex>

                    <Flex>
                      {onEditTask && (
                        <IconButton
                          aria-label="編集"
                          icon={<EditIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(task)}
                        />
                      )}
                      {onDeleteTask && (
                        <IconButton
                          aria-label="削除"
                          icon={<DeleteIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(task.id)}
                        />
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
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
                  <Th>ステータス</Th>
                  <Th>優先度</Th>
                  <Th>期限</Th>
                  <Th>操作</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center">
                      タスクはありません
                    </Td>
                  </Tr>
                ) : (
                  tasks.map((task) => (
                    <Tr key={task.id}>
                      <Td>{task.title}</Td>
                      <Td>{task.description}</Td>
                      <Td>{task.status === "completed" ? "完了" : "未完了"}</Td>
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
                        {typeof task.due_date === "string" && task.due_date
                          ? formatDateTime(task.due_date, task.is_all_day)
                          : ""}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {onEditTask && (
                            <IconButton
                              aria-label="編集"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleEdit(task)}
                            />
                          )}
                          {onDeleteTask && (
                            <IconButton
                              aria-label="削除"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(task.id)}
                            />
                          )}
                        </HStack>
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
