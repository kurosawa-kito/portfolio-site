import axios, { InternalAxiosRequestConfig } from "axios";

// APIのベースURL（環境変数から取得するか、デフォルト値を使用）
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// APIクライアントの初期化
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエスト時に認証トークンを設定するインターセプター
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const user = sessionStorage.getItem("user");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Laravel用にユーザー情報をヘッダーに追加
    if (user) {
      config.headers = config.headers || {};
      config.headers["X-User"] = user;
    }
  }
  return config;
});

// API関数
export const api = {
  // タスク関連
  tasks: {
    getAll: async () => {
      const response = await apiClient.get("/tasks");
      return response.data;
    },
    create: async (taskData: any) => {
      const response = await apiClient.post("/tasks", taskData);
      return response.data;
    },
    update: async (id: number | string, taskData: any) => {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    },
    delete: async (id: number | string) => {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    },
    updateStatus: async (id: number | string, status: string) => {
      const response = await apiClient.patch("/tasks", { id, status });
      return response.data;
    },
  },

  // 共有アイテム関連
  sharedItems: {
    getAll: async () => {
      const response = await apiClient.get("/shared-items");
      return response.data;
    },
    share: async (taskId: number | string) => {
      const response = await apiClient.post("/shared-items", {
        task_id: taskId,
      });
      return response.data;
    },
    unshare: async (taskId: number | string) => {
      const response = await apiClient.delete(`/shared-items/${taskId}`);
      return response.data;
    },
  },

  // 管理者関連
  admin: {
    tasks: {
      getAll: async () => {
        const response = await apiClient.get("/admin/tasks");
        return response.data;
      },
      update: async (id: number | string, taskData: any) => {
        const response = await apiClient.put(`/admin/tasks/${id}`, taskData);
        return response.data;
      },
      delete: async (id: number | string) => {
        const response = await apiClient.delete(`/admin/tasks/${id}`);
        return response.data;
      },
    },
    users: {
      getAll: async () => {
        const response = await apiClient.get("/admin/users");
        return response.data;
      },
      create: async (userData: any) => {
        const response = await apiClient.post("/admin/users", userData);
        return response.data;
      },
      update: async (id: number | string, userData: any) => {
        const response = await apiClient.put(`/admin/users/${id}`, userData);
        return response.data;
      },
      delete: async (id: number | string) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
      },
    },
    query: {
      execute: async (query: string) => {
        const response = await apiClient.post("/admin/query", { query });
        return response.data;
      },
    },
  },

  // 認証関連
  auth: {
    login: async (login_id: string, password: string) => {
      const response = await apiClient.post("/auth/login", {
        login_id,
        password,
      });
      return response.data;
    },
    logout: async () => {
      const response = await apiClient.post("/auth/logout");
      return response.data;
    },
    register: async (userData: any) => {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    },
  },

  // データベース関連
  database: {
    seed: async () => {
      const response = await apiClient.post("/seed");
      return response.data;
    },
    migrate: async () => {
      const response = await apiClient.post("/migrate");
      return response.data;
    },
  },
};

export default api;
