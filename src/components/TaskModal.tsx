"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  HStack,
  useToast,
  Box,
  Checkbox,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import { DateTimePicker, DatePicker } from "@material-ui/pickers";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { InputAdornment } from "@material-ui/core";
import EventIcon from "@material-ui/icons/Event";
import api from "@/lib/api";

// マルチバイト文字をエンコードするための安全なbase64エンコード関数
const safeBase64Encode = (str: string, user: any) => {
  try {
    // UTF-8でエンコードしてからbase64に変換
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    console.error("Base64エンコードエラー:", e);
    // エラー時は単純な文字列を返す（ロールバック）
    return btoa(JSON.stringify({ id: user?.id || 0 }));
  }
};

// DateTimePickerのスタイル
const useStyles = makeStyles(() =>
  createStyles({
    picker: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "0.375rem",
        backgroundColor: "white",
        border: "1px solid #E2E8F0",
        transition: "border-color 0.2s ease-in-out",
        "&:hover": {
          borderColor: "#3182CE",
        },
        "&.Mui-focused": {
          borderColor: "#3182CE",
          borderWidth: "2px",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
        "& .MuiOutlinedInput-input": {
          paddingTop: "8px",
          paddingBottom: "8px",
          height: "20px",
        },
        "& .MuiSelect-icon": {
          display: "none",
        },
      },
      "& .MuiIconButton-root": {
        color: "#3182CE",
        padding: "8px",
      },
      "& .MuiInputAdornment-root": {
        marginLeft: 0,
      },
      "& .MuiPickersArrowSwitcher-iconButton": {
        display: "none",
      },
      "& .MuiPickersArrowSwitcher-spacer": {
        display: "none",
      },
      "& .MuiPickersArrowSwitcher-root": {
        display: "none",
      },
      "& fieldset": {
        display: "none",
      },
      "& legend": {
        display: "none",
      },
      width: "100%",
    },
    popupOverlay: {
      zIndex: 9999,
      position: "relative",
    },
  })
);

interface Task {
  id: string | number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  is_all_day?: boolean;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "shared" | "edit";
  task?: Task;
  onSuccess?: () => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  mode,
  task,
  onSuccess,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueDateObj, setDueDateObj] = useState<Date | null>(null);
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const classes = useStyles();

  // 編集時のデータを設定
  useEffect(() => {
    if (mode === "edit" && task && isOpen) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setIsAllDay(task.is_all_day || false);

      // 日付の設定
      if (task.due_date) {
        setDueDate(task.due_date);
        const dateObj = new Date(task.due_date);
        if (!isNaN(dateObj.getTime())) {
          setDueDateObj(dateObj);
        }
      }
    }
  }, [mode, task, isOpen]);

  // モーダルを閉じる際にフォームをリセット
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueDateObj(null);
    setPriority("medium");
    setIsAllDay(false);
    onClose();
  };

  // 終日チェックボックスの変更時の処理
  const handleAllDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAllDay(e.target.checked);

    // 終日に変更した場合、既存の日付があれば時間をリセットして日付のみにする
    if (e.target.checked && dueDateObj) {
      const newDate = new Date(dueDateObj);
      newDate.setHours(0, 0, 0, 0);
      setDueDateObj(newDate);

      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");

      // 終日の場合は00:00を設定
      const formattedDate = `${year}-${month}-${day}T00:00`;
      setDueDate(formattedDate);
    }
  };

  // 日時選択時の処理
  const handleDateChange = (date: Date | null) => {
    try {
      setDueDateObj(date);

      if (date && !isNaN(date.getTime())) {
        let formattedDate: string;

        if (isAllDay) {
          // 終日の場合は時間を00:00に設定
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          formattedDate = `${year}-${month}-${day}T00:00:00`;
        } else {
          // 通常は選択された時間をそのまま使用
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:00`;
        }

        setDueDate(formattedDate);
      } else {
        setDueDate("");
      }
    } catch (error) {
      console.error("日付変換エラー:", error);
      setDueDate("");
    }
  };

  // タスクを作成/共有/編集
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "エラー",
        description: "タイトルを入力してください",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: "エラー",
        description: "期限を設定してください",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        due_date: dueDate,
        priority,
        is_all_day: isAllDay,
      };

      if (mode === "edit" && task) {
        // 既存タスクの編集
        await api.tasks.update(task.id, taskData);
        toast({
          title: "成功",
          description: "タスクを更新しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // 新規タスクの作成
        await api.tasks.create(taskData);
        toast({
          title: "成功",
          description: "タスクを作成しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "タスクの保存に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === "edit" ? "タスクを編集" : "新しいタスク"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl id="title" isRequired>
              <FormLabel>タイトル</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスクのタイトル"
              />
            </FormControl>

            <FormControl id="description">
              <FormLabel>詳細</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="タスクの詳細"
                rows={3}
              />
            </FormControl>

            <FormControl id="priority">
              <FormLabel>優先度</FormLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </Select>
            </FormControl>

            <FormControl id="is_all_day">
              <Checkbox
                isChecked={isAllDay}
                onChange={handleAllDayChange}
                colorScheme="blue"
              >
                終日タスク
              </Checkbox>
            </FormControl>

            <FormControl id="due_date" isRequired>
              <FormLabel>期限</FormLabel>
              <Box className={classes.picker}>
                {isAllDay ? (
                  <DatePicker
                    value={dueDateObj}
                    onChange={handleDateChange}
                    inputVariant="outlined"
                    format="yyyy/MM/dd"
                    placeholder="日付を選択"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <EventIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={dueDateObj}
                    onChange={handleDateChange}
                    inputVariant="outlined"
                    format="yyyy/MM/dd HH:mm"
                    placeholder="日時を選択"
                    fullWidth
                    ampm={false}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <EventIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {mode === "edit" ? "更新" : "作成"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
