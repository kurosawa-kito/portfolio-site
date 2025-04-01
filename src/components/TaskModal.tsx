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
        // ISO形式の文字列に変換
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        let formattedDate: string;

        if (isAllDay) {
          // 終日の場合は時間を00:00に設定
          formattedDate = `${year}-${month}-${day}T00:00`;
        } else {
          // 通常は選択された時間を使用
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
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
      // モードに応じたエンドポイントとリクエストデータを設定
      let endpoint = "/api/tasks";
      let method = "POST";

      if (mode === "shared") {
        endpoint = "/api/shared/tasks";
      } else if (mode === "edit" && task) {
        endpoint = `/api/tasks/${task.id}`;
        method = "PUT";
      }

      // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
      const userStr = JSON.stringify(user);
      const userBase64 =
        typeof window !== "undefined"
          ? safeBase64Encode(userStr, user)
          : Buffer.from(userStr).toString("base64");

      // APIリクエスト用のヘッダーを定義
      const requestHeaders = {
        "Content-Type": "application/json",
        "x-user-base64": userBase64,
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: requestHeaders,
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate,
          priority,
          is_all_day: isAllDay,
        }),
      });

      if (response.ok) {
        let successMessage = "";
        if (mode === "create") {
          successMessage = "タスクが作成されました";
        } else if (mode === "shared") {
          successMessage = "共有タスクが作成されました";
        } else {
          successMessage = "タスクが更新されました";
        }

        toast({
          title: "成功",
          description: successMessage,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // フォームをリセットして閉じる
        handleClose();

        // 成功時のコールバックがあれば実行（リスト更新など）
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("API request failed");
      }
    } catch (error) {
      console.error("タスク操作エラー:", error);
      toast({
        title: "エラー",
        description:
          mode === "edit"
            ? "タスクの更新に失敗しました"
            : "タスクの作成に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルのタイトル
  const modalTitle =
    mode === "create"
      ? "新しいタスクを作成"
      : mode === "shared"
      ? "新しい共有タスクを作成"
      : "タスクを編集";

  // ボタンのラベル
  const buttonLabel = mode === "edit" ? "更新する" : "作成する";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay className="chakra-modal-overlay" style={{ zIndex: 1000 }} />
      <ModalContent className="chakra-modal__content">
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>タイトル</FormLabel>
            <Input
              placeholder="タスクのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>説明</FormLabel>
            <Textarea
              placeholder="タスクの説明"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </FormControl>

          <HStack spacing={4} mb={4} alignItems="flex-start">
            <FormControl isRequired>
              <VStack align="flex-start" spacing={2}>
                <HStack
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormLabel mb={0}>期限</FormLabel>
                  <Checkbox
                    isChecked={isAllDay}
                    onChange={handleAllDayChange}
                    size="sm"
                  >
                    終日
                  </Checkbox>
                </HStack>
                <Box className={classes.popupOverlay} w="100%">
                  {isAllDay ? (
                    <DatePicker
                      value={dueDateObj}
                      onChange={handleDateChange}
                      format="yyyy/MM/dd"
                      clearable
                      placeholder="日付を選択"
                      variant="inline"
                      inputVariant="outlined"
                      label=""
                      fullWidth
                      className={classes.picker}
                      autoOk
                      disableToolbar={false}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EventIcon style={{ color: "#3182CE" }} />
                          </InputAdornment>
                        ),
                      }}
                      PopoverProps={{
                        className: "date-picker-popover",
                        style: { zIndex: 9999 },
                        disablePortal: false,
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                      }}
                      DialogProps={{
                        className: "date-picker-dialog",
                        style: { zIndex: 9999 },
                      }}
                    />
                  ) : (
                    <DateTimePicker
                      value={dueDateObj}
                      onChange={handleDateChange}
                      format="yyyy/MM/dd HH:mm"
                      ampm={false}
                      clearable
                      placeholder="日時を選択"
                      variant="inline"
                      inputVariant="outlined"
                      label=""
                      fullWidth
                      className={classes.picker}
                      autoOk
                      disableToolbar={false}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EventIcon style={{ color: "#3182CE" }} />
                          </InputAdornment>
                        ),
                      }}
                      PopoverProps={{
                        className: "date-picker-popover",
                        style: { zIndex: 9999 },
                        disablePortal: false,
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                      }}
                      DialogProps={{
                        className: "date-picker-dialog",
                        style: { zIndex: 9999 },
                      }}
                    />
                  )}
                </Box>
              </VStack>
            </FormControl>

            <FormControl isRequired>
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
          </HStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            isDisabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {buttonLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
