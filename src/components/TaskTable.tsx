import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Checkbox,
  IconButton,
  Text,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

// タスクインターフェース
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

// TaskTableコンポーネントのプロパティ
interface TaskTableProps {
  tasks: Task[];
  showCheckbox?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onStatusChange?: (id: string | number, status: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string | number) => void;
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
  formatDateTime: (dateString: string, isAllDay?: boolean) => string;
  showSubtitle?: boolean;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  showCheckbox = true,
  showEditButton = true,
  showDeleteButton = true,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  priorityColors,
  priorityLabels,
  formatDateTime,
  showSubtitle = true,
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
              tasks.map((task) => (
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
                    {showCheckbox ? (
                      <Checkbox
                        isChecked={task.status === "completed"}
                        onChange={(e) =>
                          handleStatusChange(
                            String(task.id),
                            e.target.checked ? "completed" : "pending",
                          )
                        }
                      />
                    ) : task.status === "completed" ? (
                      "完了"
                    ) : (
                      "未完了"
                    )}
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
  );
};

export default TaskTable;
