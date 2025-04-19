import React, { useMemo, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  Spinner,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import TaskCard from "./TaskCard";
import TaskTable from "./TaskTable";
import SectionTitle from "./SectionTitle";
import EmptyStateCard from "./EmptyStateCard";

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
  showCheckbox?: boolean;
  showStatusBadge?: boolean;
  subtitleSpacing?: number;
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
  showCheckbox = true,
  showStatusBadge = false,
  subtitleSpacing = 2,
}: TaskListProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
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
        <SectionTitle title="タスク管理" spacing={subtitleSpacing} />
      )}

      {viewType === "card" ? (
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
          mt={showSubtitle ? -2 : 0}
        >
          {tasks.length === 0 ? (
            <EmptyStateCard />
          ) : (
            sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showCheckbox={showCheckbox}
                showStatusBadge={showStatusBadge}
                showEditButton={showEditButton}
                showDeleteButton={showDeleteButton}
                onStatusChange={handleStatusChange}
                onEditTask={handleEdit}
                onDeleteTask={handleDelete}
                priorityColors={priorityColors}
                priorityLabels={priorityLabels}
                formatDateTime={formatDateTime}
              />
            ))
          )}
        </SimpleGrid>
      ) : (
        <TaskTable
          tasks={sortedTasks}
          showCheckbox={showCheckbox}
          showEditButton={showEditButton}
          showDeleteButton={showDeleteButton}
          onStatusChange={handleStatusChange}
          onEditTask={handleEdit}
          onDeleteTask={handleDelete}
          priorityColors={priorityColors}
          priorityLabels={priorityLabels}
          formatDateTime={formatDateTime}
          showSubtitle={showSubtitle}
        />
      )}
    </>
  );
}
