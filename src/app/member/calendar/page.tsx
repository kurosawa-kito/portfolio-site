"use client";

import { useState, useEffect } from "react";
import { Box, Input, Textarea, Button as ChakraButton } from "@chakra-ui/react";
import { Container, Row, Col } from "react-bootstrap";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [todo, setTodo] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch(`/api/daily-logs?date=${selectedDate}`);
      const data = await res.json();
      const log = data[0] || {};
      setTodo(log.todo || "");
      setDone(log.done || "");
    };
    fetchLogs();
  }, [selectedDate]);

  const saveLog = async () => {
    await fetch("/api/daily-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: selectedDate,
        todo,
        done,
      }),
    });
  };

  return (
    <Container>
      <Row>
        <Col>
          <Box p={4}>
            <h1 className="text-2xl font-bold mb-4">カレンダービュー</h1>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              mb={4}
            />
            <Textarea
              placeholder="今日の予定"
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              mb={4}
            />
            <Textarea
              placeholder="今日の成果"
              value={done}
              onChange={(e) => setDone(e.target.value)}
              mb={4}
            />
            <ChakraButton colorScheme="blue" onClick={saveLog}>
              保存
            </ChakraButton>
          </Box>
        </Col>
      </Row>
    </Container>
  );
}
