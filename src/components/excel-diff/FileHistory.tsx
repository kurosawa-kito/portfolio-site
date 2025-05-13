import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { SearchIcon, TimeIcon, DeleteIcon } from '@chakra-ui/icons';
import { useExcelDiffStore } from '@/contexts/DiffContext';
import { HistoryFile } from '@/types/excel';
import { parseExcelFile } from '@/lib/excel-diff/parser';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { searchHistory, getExcelFile } from '@/lib/excel-diff/storage';

interface FileHistoryProps {
  type: 'original' | 'modified';
  onSelect: () => void;
}

const FileHistory: React.FC<FileHistoryProps> = ({ type, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryFile[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { 
    fileHistory, 
    setOriginalFile, 
    setModifiedFile, 
    removeFromHistory 
  } = useExcelDiffStore();
  
  const setFile = type === 'original' ? setOriginalFile : setModifiedFile;
  
  // 検索クエリが変更されたら履歴をフィルタリング
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await searchHistory(searchQuery);
        setFilteredHistory(results);
      } catch (error) {
        console.error('履歴の検索に失敗しました', error);
        setFilteredHistory([]);
      }
    };
    
    fetchData();
  }, [searchQuery, fileHistory]);
  
  // 履歴からファイルを選択
  const handleSelectFile = async (historyFile: HistoryFile) => {
    try {
      // ストレージからファイルを取得
      const excelFile = await getExcelFile(historyFile.id);
      
      if (excelFile) {
        setFile(excelFile);
        onClose();
        onSelect();
      }
    } catch (error) {
      console.error('ファイルの取得に失敗しました', error);
    }
  };
  
  // 履歴からファイルを削除
  const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    removeFromHistory(fileId);
  };
  
  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ja
      });
    } catch (e) {
      return '不明な日付';
    }
  };
  
  return (
    <>
      <Button 
        size="sm" 
        colorScheme="teal" 
        variant="outline"
        leftIcon={<TimeIcon />}
        onClick={onOpen}
      >
        履歴から選択
      </Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ファイル履歴</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="ファイル名で検索..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              {filteredHistory.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Text color="gray.500">
                    {searchQuery 
                      ? '検索結果がありません' 
                      : '履歴にファイルがありません'}
                  </Text>
                </Box>
              ) : (
                <List spacing={2}>
                  {filteredHistory.map((file) => (
                    <ListItem 
                      key={file.id} 
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleSelectFile(file)}
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="medium">{file.name}</Text>
                          <HStack spacing={3} fontSize="sm" color="gray.500">
                            <Text>{formatFileSize(file.size)}</Text>
                            <Text>{formatDate(file.uploadedAt)}</Text>
                          </HStack>
                        </Box>
                        <Tooltip label="削除" placement="top">
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e) => handleRemoveFile(e, file.id)}
                          >
                            <DeleteIcon />
                          </Button>
                        </Tooltip>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileHistory; 