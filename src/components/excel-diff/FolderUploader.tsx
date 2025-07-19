import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Icon,
  Flex,
  Progress,
  List,
  ListItem,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { parseExcelFile } from "@/lib/excel-diff/parser";
import { useExcelDiffStore } from "@/contexts/DiffContext";
import { v4 as uuidv4 } from "uuid";
import { saveExcelFile } from "@/lib/excel-diff/storage";

interface FolderUploaderProps {
  onComplete: () => void;
}

interface UploadStatus {
  fileName: string;
  status: "pending" | "success" | "error";
  message?: string;
}

const FolderUploader: React.FC<FolderUploaderProps> = ({ onComplete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileStatuses, setFileStatuses] = useState<UploadStatus[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { addToHistory } = useExcelDiffStore();

  const handleFolderSelect = () => {
    if (directoryInputRef.current) {
      directoryInputRef.current.click();
    }
  };

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    setFileStatuses([]);
    setSuccessCount(0);
    onOpen();

    // Excelファイルのみをフィルタリング
    const excelFiles = Array.from(files).filter(
      (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls"),
    );

    if (excelFiles.length === 0) {
      toast({
        title: "エラー",
        description: "フォルダ内にExcelファイルが見つかりませんでした",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsUploading(false);
      return;
    }

    // 処理状態の初期化
    const initialStatuses: UploadStatus[] = excelFiles.map((file) => ({
      fileName: file.name,
      status: "pending",
    }));
    setFileStatuses(initialStatuses);

    let successFiles = 0;

    // 各ファイルを処理
    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];

      try {
        // Excelファイルの解析
        const excelData = await parseExcelFile(file);

        // ファイルの保存
        await saveExcelFile(excelData);

        // 履歴に追加
        addToHistory({
          id: excelData.id || uuidv4(),
          name: file.name,
          path: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          size: file.size,
        });

        // 状態の更新
        successFiles++;
        setSuccessCount(successFiles);

        // 進捗の更新
        const newProgress = Math.floor(((i + 1) / excelFiles.length) * 100);
        setProgress(newProgress);

        // ステータスの更新
        setFileStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[i] = {
            fileName: file.name,
            status: "success",
          };
          return newStatuses;
        });
      } catch (error) {
        console.error(`ファイル ${file.name} の処理に失敗しました`, error);

        // ステータスの更新
        setFileStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[i] = {
            fileName: file.name,
            status: "error",
            message: "ファイルの解析に失敗しました",
          };
          return newStatuses;
        });

        // 進捗の更新
        const newProgress = Math.floor(((i + 1) / excelFiles.length) * 100);
        setProgress(newProgress);
      }
    }

    setIsUploading(false);

    // 完了メッセージ
    toast({
      title: "アップロード完了",
      description: `${successFiles}/${excelFiles.length} ファイルが正常に処理されました`,
      status: successFiles === excelFiles.length ? "success" : "warning",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleClose = () => {
    onClose();
    if (directoryInputRef.current) {
      directoryInputRef.current.value = "";
    }
    onComplete();
  };

  return (
    <>
      <Button
        leftIcon={
          <Icon viewBox="0 0 20 20" boxSize={5}>
            <path
              fill="currentColor"
              d="M2 4a2 2 0 012-2h4.586A2 2 0 0110 2.586l1.414 1.414A2 2 0 0113.414 5H16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v10h12V7h-2.586a2 2 0 01-1.414-.586L10 4.586A2 2 0 008.586 4H4z"
            />
          </Icon>
        }
        colorScheme="blue"
        variant="outline"
        onClick={handleFolderSelect}
        isLoading={isUploading}
        loadingText="アップロード中"
      >
        フォルダを選択
      </Button>
      <input
        type="file"
        style={{ display: "none" }}
        ref={directoryInputRef}
        multiple
        onChange={handleFolderUpload}
        {...({ webkitdirectory: "true" } as any)}
      />

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>フォルダアップロード</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                {isUploading
                  ? "Excelファイルをアップロードしています..."
                  : `アップロード完了: ${successCount} ファイル処理されました`}
              </Text>

              <Progress value={progress} size="sm" colorScheme="blue" />

              <List spacing={2}>
                {fileStatuses.map((status, index) => (
                  <ListItem
                    key={index}
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={
                      status.status === "success"
                        ? "green.200"
                        : status.status === "error"
                          ? "red.200"
                          : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm">{status.fileName}</Text>
                      <Badge
                        colorScheme={
                          status.status === "success"
                            ? "green"
                            : status.status === "error"
                              ? "red"
                              : "gray"
                        }
                      >
                        {status.status === "success"
                          ? "成功"
                          : status.status === "error"
                            ? "エラー"
                            : "処理中"}
                      </Badge>
                    </Flex>

                    {status.message && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {status.message}
                      </Text>
                    )}
                  </ListItem>
                ))}
              </List>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleClose}>閉じる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FolderUploader;
