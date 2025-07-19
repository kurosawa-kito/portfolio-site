import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { parseExcelFile } from "@/lib/excel-diff/parser";
import { useExcelDiffStore } from "@/contexts/DiffContext";
import { v4 as uuidv4 } from "uuid";

interface FileUploaderProps {
  type: "original" | "modified";
  label: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ type, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const {
    originalFile,
    modifiedFile,
    setOriginalFile,
    setModifiedFile,
    addToHistory,
  } = useExcelDiffStore();

  const currentFile = type === "original" ? originalFile : modifiedFile;
  const setFile = type === "original" ? setOriginalFile : setModifiedFile;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // ファイル形式の検証
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "エラー",
          description: "Excel形式のファイル(.xlsx, .xls)を選択してください",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        setIsUploading(true);

        // Excelファイルの解析
        const excelData = await parseExcelFile(file);

        // 状態の更新
        setFile(excelData);

        // 履歴に追加
        addToHistory({
          id: excelData.id || uuidv4(),
          name: file.name,
          path: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          size: file.size,
        });

        toast({
          title: "ファイルをアップロードしました",
          description: file.name,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("ファイルの解析に失敗しました", error);
        toast({
          title: "エラー",
          description: "ファイルの解析に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [setFile, addToHistory, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  const handleClearFile = () => {
    setFile(null);
  };

  return (
    <Box w="100%" borderWidth="1px" borderRadius="lg" p={4}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          {label}
        </Text>

        {!currentFile ? (
          <Box
            {...getRootProps()}
            borderWidth="2px"
            borderRadius="md"
            borderStyle="dashed"
            borderColor={isDragActive ? "blue.400" : "gray.300"}
            bg={isDragActive ? "blue.50" : "gray.50"}
            p={6}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.100" }}
            h="150px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <input {...getInputProps()} />
            <VStack spacing={2}>
              <Icon as={AttachmentIcon} w={8} h={8} color="gray.400" />
              <Text align="center" color="gray.500">
                {isDragActive
                  ? "ここにファイルをドロップ"
                  : "ドラッグ＆ドロップまたはクリックでファイルを選択"}
              </Text>
              <Text fontSize="sm" color="gray.400">
                .xlsx, .xlsファイルのみ
              </Text>
            </VStack>
          </Box>
        ) : (
          <Box borderWidth="1px" borderRadius="md" p={4} bg="blue.50">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">{currentFile.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {currentFile.sheets.length}シート
                </Text>
              </Box>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleClearFile}
                leftIcon={<CloseIcon />}
              >
                クリア
              </Button>
            </Flex>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FileUploader;
