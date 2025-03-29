"use client";

import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split("T")[0];
      const logRes = await fetch(`/api/daily-logs?date=${date}`);
      const log = await logRes.json();
      const res = await fetch("/api/suggest_tasks.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log[0] || {}),
      });
      const data = await res.json();
      setSuggestions(data);
    };
    fetchSuggestions();
  }, []);

  return (
    <Box p={4}>
      <h1 className="text-2xl font-bold mb-4">AIタスク提案</h1>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </Box>
  );
}
