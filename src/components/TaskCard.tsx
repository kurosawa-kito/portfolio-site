import React from "react";
import {
  Box,
  Text,
  Card,
  CardBody,
  Badge,
  HStack,
  Checkbox,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

// タスクインターフェースの定義
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

// TaskCardコンポーネントのプロパティ定義
interface TaskCardProps {
  task: Task;
  showCheckbox?: boolean;
  showStatusBadge?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onStatusChange?: (id: string | number, status: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string | number) => void;
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
  formatDateTime: (dateString: string, isAllDay?: boolean) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showCheckbox = true,
  showStatusBadge = false,
  showEditButton = true,
  showDeleteButton = true,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  priorityColors,
  priorityLabels,
  formatDateTime,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // ステータス変更のハンドラ
  const handleStatusChange = (id: string | number, status: string) => {
    if (onStatusChange) {
      onStatusChange(id, status);
    }
  };

  // 編集ボタンのハンドラ
  const handleEdit = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  // 削除ボタンのハンドラ
  const handleDelete = (id: string | number) => {
    if (onDeleteTask) {
      onDeleteTask(id);
    }
  };

  return (
    <Card
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
            {showCheckbox ? (
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
                    task.status === "completed" ? "line-through" : "none"
                  }
                  noOfLines={1}
                >
                  {task.title}
                  {showStatusBadge && (
                    <Badge
                      ml={2}
                      colorScheme={
                        task.status === "completed" ? "green" : "blue"
                      }
                      fontSize="xs"
                    >
                      {task.status === "completed" ? "完了" : "未完了"}
                    </Badge>
                  )}
                </Text>
              </Checkbox>
            ) : (
              <Text
                fontSize="md"
                fontWeight="bold"
                textDecoration={
                  task.status === "completed" ? "line-through" : "none"
                }
                noOfLines={1}
              >
                {task.title}
                {showStatusBadge && (
                  <Badge
                    ml={2}
                    colorScheme={task.status === "completed" ? "green" : "blue"}
                    fontSize="xs"
                  >
                    {task.status === "completed" ? "完了" : "未完了"}
                  </Badge>
                )}
              </Text>
            )}
            <HStack spacing={1}>
              <Badge
                colorScheme={
                  priorityColors[task.priority as keyof typeof priorityColors]
                }
                fontSize="xs"
              >
                {priorityLabels[task.priority as keyof typeof priorityLabels]}
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
          <HStack justify="space-between" fontSize="xs" color="gray.500">
            <Text>期限: {formatDateTime(task.due_date, task.is_all_day)}</Text>
            {task.created_by_username && (
              <Text>作成者: {task.created_by_username}</Text>
            )}
          </HStack>
        </Box>
      </CardBody>
    </Card>
  );
};

export default TaskCard;
