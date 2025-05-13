/**
 * タスク作成・編集用モーダルコンポーネント
 *
 * 機能:
 * - 新規タスクの作成
 * - 既存タスクの編集
 * - 共有タスクの作成
 * - 日時選択（終日イベントのサポート）
 * - 入力バリデーション
 * - エラーハンドリング
 */
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

/**
 * マルチバイト文字をエンコードするための安全なbase64エンコード関数
 * 日本語などの非ASCII文字を含むユーザー情報をAPIに安全に渡すために使用
 *
 * @param str エンコードする文字列
 * @param user ユーザー情報（エラー時のフォールバック用）
 * @returns Base64エンコードされた文字列
 */
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

/**
 * DatePickerおよびDateTimePickerのカスタムスタイル
 * Material-UIのデフォルトスタイルをChakra UIデザインに合わせて調整
 */
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

/**
 * タスクのデータ構造を定義するインターフェース
 */
interface Task {
  id: string | number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  is_all_day?: boolean;
}

/**
 * TaskModalコンポーネントのプロパティを定義するインターフェース
 */
interface TaskModalProps {
  isOpen: boolean; // モーダルが開いているかどうか
  onClose: () => void; // モーダルを閉じる関数
  mode: "create" | "shared" | "edit"; // モーダルの動作モード
  task?: Task; // 編集する場合のタスク情報
  onSuccess?: () => void; // 操作成功時のコールバック関数
}

/**
 * タスク作成・編集用モーダルコンポーネント
 * モードに応じて新規作成、共有タスク作成、または編集の機能を提供
 */
export default function TaskModal({
  isOpen,
  onClose,
  mode,
  task,
  onSuccess,
}: TaskModalProps) {
  // 状態管理用のステート変数
  const [title, setTitle] = useState(""); // タスクタイトル
  const [description, setDescription] = useState(""); // タスク説明
  const [dueDate, setDueDate] = useState(""); // 期限日時（文字列形式）
  const [dueDateObj, setDueDateObj] = useState<Date | null>(new Date()); // 期限日時（Dateオブジェクト）
  const [priority, setPriority] = useState("medium"); // 優先度
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中フラグ
  const [isAllDay, setIsAllDay] = useState(false); // 終日フラグ
  const { user } = useAuth(); // ユーザー情報
  const toast = useToast(); // トースト通知
  const classes = useStyles(); // カスタムスタイル

  /**
   * モーダルが開かれた時、または編集モードでタスクが変更された時にフォームデータを初期化
   */
  // 編集時のデータを設定
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        // 編集モードの場合
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
        } else {
          // 日付がない場合は現在日時をデフォルトに
          const now = new Date();
          setDueDateObj(now);
          setDueDate(formatDateToString(now, false));
        }
      } else {
        // 新規作成モードの場合
        const now = new Date();
        setTitle("");
        setDescription("");
        setPriority("medium");
        setIsAllDay(false);
        setDueDateObj(now);
        setDueDate(formatDateToString(now, false));
      }
    }
  }, [isOpen, mode, task]);

  /**
   * Date オブジェクトをAPIに送信するための文字列形式に変換
   * 終日イベントの場合は時間部分を00:00:00に設定
   *
   * @param date 変換するDateオブジェクト
   * @param isAllDayFormat 終日形式かどうか
   * @returns 'YYYY-MM-DDThh:mm:ss' 形式の日時文字列
   */
  // 日付を文字列に変換するヘルパー関数
  const formatDateToString = (date: Date, isAllDayFormat: boolean): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (isAllDayFormat) {
      return `${year}-${month}-${day}T00:00:00`;
    } else {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    }
  };

  /**
   * モーダルを閉じる際の処理
   * フォームをリセットし、親コンポーネントのonClose関数を呼び出す
   */
  // モーダルを閉じる際にフォームをリセット
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    // 日付のデフォルト値として現在日時を保持
    const now = new Date();
    setDueDateObj(now);
    setDueDate(formatDateToString(now, false));
    setPriority("medium");
    setIsAllDay(false);
    onClose();
  };

  /**
   * 終日チェックボックスの変更時の処理
   * 終日に変更した場合、時間部分をリセット
   *
   * @param e チェックボックスのイベント
   */
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

  /**
   * 日付/時間ピッカーでの選択時の処理
   * 選択された日時を適切な形式に変換してステートに保存
   *
   * @param date 選択された日時
   */
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

  /**
   * フォーム送信処理（タスクの作成または更新）
   * バリデーション、API通信、エラーハンドリングを行う
   */
  // タスクを作成/共有/編集
  const handleSubmit = async () => {
    // 入力バリデーション
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

      // APIリクエストを実行
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
        // 成功メッセージの設定
        let successMessage = "";
        if (mode === "create") {
          successMessage = "タスクが作成されました";
        } else if (mode === "shared") {
          successMessage = "共有タスクが作成されました";
        } else {
          successMessage = "タスクが更新されました";
        }

        // 成功通知を表示
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
        // エラーレスポンスをJSON形式で取得
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed", {
          cause: { status: response.status, data: errorData },
        });
      }
    } catch (error) {
      console.error("タスク操作エラー:", error);

      // エラーメッセージを取得
      let errorMessage =
        mode === "edit"
          ? "タスクの更新に失敗しました"
          : "タスクの作成に失敗しました";

      // Error オブジェクトから具体的なエラーメッセージを取得
      if (error instanceof Error) {
        // messageが設定されていて、デフォルトメッセージでない場合はそれを使用
        if (error.message && error.message !== "API request failed") {
          errorMessage = error.message;
        }
        // causeからエラーメッセージを取得（より具体的なAPIのエラーメッセージ）
        else if (error.cause && typeof error.cause === "object") {
          if ("data" in error.cause) {
            const errorCause = error.cause as { data?: { error?: string } };
            if (errorCause.data?.error) {
              errorMessage = errorCause.data.error;
            }
          }
        }
      }

      // エラー通知を表示
      toast({
        title: "エラー",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルUI関連の設定

  /**
   * モーダルのタイトル（モードによって異なる）
   */
  // モーダルのタイトル
  const modalTitle =
    mode === "create"
      ? "新しいタスクを作成"
      : mode === "shared"
      ? "新しい共有タスクを作成"
      : "タスクを編集";

  /**
   * 送信ボタンのラベル（モードによって異なる）
   */
  // ボタンのラベル
  const buttonLabel = mode === "edit" ? "更新する" : "作成する";

  /**
   * モーダルのレンダリング
   */
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay className="chakra-modal-overlay" style={{ zIndex: 1000 }} />
      <ModalContent className="chakra-modal__content">
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* タスクタイトル入力フォーム */}
          <FormControl isRequired mb={4}>
            <FormLabel>タイトル</FormLabel>
            <Input
              placeholder="タスクのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          {/* タスク説明入力フォーム */}
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
            {/* 期限設定フォーム */}
            <FormControl isRequired>
              <VStack align="flex-start" spacing={2}>
                <HStack
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormLabel mb={0}>期限</FormLabel>
                  {/* 終日チェックボックス */}
                  <Checkbox
                    isChecked={isAllDay}
                    onChange={handleAllDayChange}
                    size="sm"
                  >
                    終日
                  </Checkbox>
                </HStack>
                <Box className={classes.popupOverlay} w="100%">
                  {/* 終日の場合は日付のみ、それ以外は日時両方を選択できるピッカーを表示 */}
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
                      disablePast
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
                      disablePast
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

            {/* 優先度選択フォーム */}
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
          {/* キャンセルボタン */}
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            isDisabled={isSubmitting}
          >
            キャンセル
          </Button>
          {/* 送信ボタン */}
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
