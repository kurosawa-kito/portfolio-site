"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Select,
  Text,
  useToast,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
  Container,
  Switch,
  FormControl,
  FormLabel,
  Button,
  Spinner as ChakraSpinner,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthProvider";
import { PageHeader } from "@/components/PageHeader";
import { TasksDisplay } from "@/components/TasksDisplay";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";

type User = {
  id: string;
  username: string;
  role: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  created_by: string;
  assigned_to_username?: string;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
};

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

// 日付をフォーマットする関数（UTCからの直接変換）
const formatDateTime = (dateString: string, isAllDay?: boolean): string => {
  if (!dateString) return "";

  try {
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
    console.error("日付フォーマットエラー:", error);
    return dateString;
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "ai">("card");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const toast = useToast();
  const { user, isLoggedIn, setShowTaskHeader } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleBg = useColorModeValue("blue.50", "blue.900");

  // マークダウンスタイルの定義
  const markdownStyles = {
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: useColorModeValue("gray.100", "gray.700"),
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: useColorModeValue("gray.300", "gray.600"),
      borderRadius: "4px",
    },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      fontWeight: "bold",
      borderBottom: useColorModeValue("1px solid #eee", "1px solid #333"),
      paddingBottom: "5px",
      marginTop: "15px",
      marginBottom: "10px",
    },
    "& h1": { fontSize: "1.8em" },
    "& h2": { fontSize: "1.5em" },
    "& h3": { fontSize: "1.3em" },
    "& strong": { fontWeight: "bold" },
    "& em": { fontStyle: "italic" },
    "& ul, & ol": {
      paddingLeft: "20px",
      marginBottom: "10px",
    },
    "& ul": { listStyleType: "disc" },
    "& ol": { listStyleType: "decimal" },
    "& blockquote": {
      borderLeft: useColorModeValue("4px solid #ddd", "4px solid #555"),
      paddingLeft: "15px",
      marginLeft: "0",
      color: useColorModeValue("gray.600", "gray.400"),
    },
    "& code": {
      fontFamily: "monospace",
      backgroundColor: useColorModeValue("gray.100", "gray.700"),
      padding: "2px 4px",
      borderRadius: "3px",
    },
    "& pre": {
      fontFamily: "monospace",
      backgroundColor: useColorModeValue("gray.100", "gray.700"),
      padding: "10px",
      borderRadius: "5px",
      overflowX: "auto",
      marginBottom: "10px",
    },
    "& table": {
      borderCollapse: "collapse",
      width: "100%",
      marginBottom: "10px",
    },
    "& th, & td": {
      border: useColorModeValue("1px solid #eee", "1px solid #555"),
      padding: "8px 12px",
      textAlign: "left",
    },
    "& th": {
      backgroundColor: useColorModeValue("gray.100", "gray.700"),
    },
  };

  // ログインチェック
  useEffect(() => {
    if (!isLoggedIn) {
      // セッションストレージを確認して、直前までログイン状態だった場合はリダイレクトを遅延させる
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        router.push("/products");
      } else {
        // セッションストレージにユーザー情報がある場合は、
        // 少し待ってから再度チェックして、それでもログインしていなければリダイレクト
        const checkTimer = setTimeout(() => {
          if (!isLoggedIn) {
            router.push("/products");
          }
        }, 1000); // 1秒待機

        return () => clearTimeout(checkTimer);
      }
    } else {
      // タスク管理ヘッダーを表示
      setShowTaskHeader(true);
    }
  }, [isLoggedIn, router, setShowTaskHeader]);

  useEffect(() => {
    // ログインしていない場合は処理しない
    if (!isLoggedIn) return;

    const fetchUsers = async () => {
      try {
        // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
        const userStr = JSON.stringify(user);
        const userBase64 =
          typeof window !== "undefined"
            ? safeBase64Encode(userStr, user)
            : Buffer.from(userStr).toString("base64");

        const res = await fetch("/api/admin/users", {
          headers: {
            "x-user-base64": userBase64,
          },
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        toast({
          title: "エラー",
          description: "ユーザー情報の取得に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchUsers();
  }, [toast, isLoggedIn, user]);

  useEffect(() => {
    // ログインしていない場合は処理しない
    if (!isLoggedIn) return;

    const fetchTasks = async () => {
      if (!selectedUser) return;
      setIsLoading(true);
      try {
        // ユーザー情報をBase64エンコードして非ASCII文字の問題を回避
        const userStr = JSON.stringify(user);
        const userBase64 =
          typeof window !== "undefined"
            ? safeBase64Encode(userStr, user)
            : Buffer.from(userStr).toString("base64");

        const res = await fetch(`/api/admin/tasks?userId=${selectedUser}`, {
          headers: {
            "x-user-base64": userBase64,
          },
        });
        const data = await res.json();
        if (data.success) setTasks(data.tasks);
      } catch (error) {
        toast({
          title: "エラー",
          description: "タスク情報の取得に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [selectedUser, toast, isLoggedIn, user]);

  // タスク分析を実行する関数
  const analyzeTask = async (taskData: Task) => {
    setIsAnalyzing(true);
    setAiAnalysis(""); // 分析開始時に結果をクリア
    try {
      const response = await fetch("/api/ai/task-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskData: tasks }), // 全タスク配列を送信
      });

      const data = await response.json();

      if (data.success) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis(
          `エラー: ${data.message || "タスクの分析に失敗しました"}`
        );
        toast({
          title: "分析エラー",
          description: data.message || "タスクの分析に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setAiAnalysis("エラー: サーバーとの通信に失敗しました");
      toast({
        title: "エラー",
        description: "サーバーとの通信に失敗しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // タスクが選択されたときに自動的に分析する
  useEffect(() => {
    if (tasks.length > 0 && viewMode === "ai") {
      // 全タスクを分析
      analyzeTask(tasks[0]); // 引数は使われないが関数シグネチャ維持のため渡す
    }
  }, [tasks, viewMode]);

  // ログインしていない場合は何も表示しない
  if (!isLoggedIn) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <VStack spacing={6} align="stretch" width="100%">
          <PageHeader>管理者ダッシュボード</PageHeader>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Text>このページにアクセスする権限がありません。</Text>
            </CardBody>
          </Card>
        </VStack>
      </div>
    );
  }

  return (
    <Container maxW="container.lg" pb={10}>
      <VStack spacing={6} align="stretch" width="100%">
        <PageHeader>管理者ダッシュボード</PageHeader>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Text mb={4} fontWeight="bold">
              ユーザー選択
            </Text>
            <Select
              placeholder="ユーザーを選択"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Select>
          </CardBody>
        </Card>

        {selectedUser && (
          <>
            <Divider my={2} />
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel htmlFor="view-mode" mb="0">
                    表示モード:
                  </FormLabel>
                  <Text mr={2}>カード表示</Text>
                  <Switch
                    id="view-mode"
                    isChecked={viewMode === "ai"}
                    onChange={() =>
                      setViewMode(viewMode === "card" ? "ai" : "card")
                    }
                  />
                  <Text ml={2}>AI分析</Text>
                </FormControl>

                {viewMode === "card" ? (
                  <TasksDisplay
                    tasks={tasks}
                    isLoading={isLoading}
                    showEditButton={false}
                    showDeleteButton={false}
                    showCheckbox={false}
                    showStatusBadge={true}
                    subtitleSpacing={8}
                    showSubtitle={true}
                    viewType="card"
                  />
                ) : (
                  <Box
                    p={6}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={borderColor}
                    bg={useColorModeValue("gray.50", "gray.900")}
                    boxShadow="md"
                  >
                    <Text fontWeight="bold" mb={4} fontSize="lg">
                      AI分析結果{" "}
                      <span style={{ fontSize: "0.8em", color: "gray.500" }}>
                        (Powered by Gemini)
                      </span>
                    </Text>
                    {isAnalyzing ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        p={10}
                      >
                        <ChakraSpinner
                          size="xl"
                          thickness="4px"
                          speed="0.65s"
                          color="blue.500"
                        />
                        <Text ml={4} color="gray.500">
                          分析中...
                        </Text>
                      </Box>
                    ) : (
                      <>
                        <Box
                          mb={4}
                          p={4}
                          borderRadius="md"
                          bg={useColorModeValue("white", "gray.800")}
                          borderWidth="1px"
                          borderColor={borderColor}
                          boxShadow="sm"
                          minHeight="150px"
                          maxHeight="500px"
                          overflowY="auto"
                          sx={{
                            // スクロールバーのスタイリング
                            "&::-webkit-scrollbar": {
                              width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                              backgroundColor: useColorModeValue(
                                "gray.100",
                                "gray.700"
                              ),
                              borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              backgroundColor: useColorModeValue(
                                "gray.300",
                                "gray.600"
                              ),
                              borderRadius: "4px",
                            },
                            // ダークモード対応
                            "&.markdown-body": {
                              backgroundColor: "transparent",
                              color: useColorModeValue("inherit", "inherit"),
                            },
                            // テーブルスタイルの追加
                            "& table": {
                              borderCollapse: "collapse",
                              margin: "16px 0",
                              width: "100%",
                              fontFamily: "sans-serif",
                            },
                            "& th, & td": {
                              border: useColorModeValue(
                                "1px solid #ddd",
                                "1px solid #555"
                              ),
                              padding: "8px 12px",
                              textAlign: "left",
                            },
                            "& th": {
                              fontWeight: "bold",
                              backgroundColor: useColorModeValue(
                                "gray.100",
                                "gray.700"
                              ),
                            },
                            "& tr:nth-of-type(even)": {
                              backgroundColor: useColorModeValue(
                                "gray.50",
                                "gray.800"
                              ),
                            },
                            "& tr:hover": {
                              backgroundColor: useColorModeValue(
                                "blue.50",
                                "blue.900"
                              ),
                            },
                          }}
                          className="markdown-body"
                        >
                          {aiAnalysis ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            >
                              {aiAnalysis}
                            </ReactMarkdown>
                          ) : (
                            "分析結果がありません。タスクを選択して分析ボタンをクリックしてください。"
                          )}
                        </Box>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() =>
                            tasks.length > 0 && analyzeTask(tasks[0])
                          }
                          isDisabled={isAnalyzing || tasks.length === 0}
                          leftIcon={<span>🔄</span>}
                        >
                          再分析
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  );
}
