<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
$command = escapeshellcmd('python ai/task_suggestion.py ' . escapeshellarg(json_encode($data)));
$output = shell_exec($command);
echo $output;