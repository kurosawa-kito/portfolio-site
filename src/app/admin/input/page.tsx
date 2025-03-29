"use client";

import { useState } from "react";
import { Box, Input, Textarea, Button as ChakraButton } from "@chakra-ui/react";

export default function InputPage() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [sharedTitle, setSharedTitle] = useState("");
  const [sharedContent, setSharedContent] = useState("");

  const addTask = async () => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDesc,
        created_by: 1,
      }),
    });
    setTaskTitle("");
    setTaskDesc("");
  };

  const addSharedItem = async () => {
    await fetch("/api/shared-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: sharedTitle,
        content: sharedContent,
        created_by: 1,
      }),
    });
    setSharedTitle("");
    setSharedContent("");
  };

  return (
    <Box p={4}>
      <h1 className="text-2xl font-bold mb-4">タスクと共有情報の入力</h1>
      <h2 className="text-xl mb-2">タスク追加</h2>
      <Input
        placeholder="タスク名"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        mb={2}
      />
      <Textarea
        placeholder="説明"
        value={taskDesc}
        onChange={(e) => setTaskDesc(e.target.value)}
        mb={2}
      />
      <ChakraButton onClick={addTask} colorScheme="blue" mb={4}>
        タスク追加
      </ChakraButton>
      <h2 className="text-xl mb-2">共有情報追加</h2>
      <Input
        placeholder="タイトル"
        value={sharedTitle}
        onChange={(e) => setSharedTitle(e.target.value)}
        mb={2}
      />
      <Textarea
        placeholder="内容"
        value={sharedContent}
        onChange={(e) => setSharedContent(e.target.value)}
        mb={2}
      />
      <ChakraButton onClick={addSharedItem} colorScheme="blue">
        共有情報追加
      </ChakraButton>
    </Box>
  );
}
