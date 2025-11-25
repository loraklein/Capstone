import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../../components/Icon';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = SCREEN_WIDTH > 1024 ? 4 : SCREEN_WIDTH > 768 ? 3 : 2;
import CameraCapture from '../../components/CameraCapture';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import DraggablePageCard from '../../components/DraggablePageCard';
import EmptyState from '../../components/EmptyState';
import ExportPdfButton from '../../components/ExportPdfButton';
import LineByLineTextEditor from '../../components/LineByLineTextEditor';
import PageCard from '../../components/PageCard';
import PhotoSourceSelector from '../../components/PhotoSourceSelector';
import PhotoViewer from '../../components/PhotoViewer';
import ProjectHeader from '../../components/ProjectHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { useCameraManagement } from '../../hooks/useCameraManagement';
import { useCameraOrientation } from '../../hooks/useCameraOrientation';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { usePdfExport } from '../../hooks/usePdfExport';
import usePdfGeneration from '../../hooks/usePdfGeneration';
import { usePhotoViewer } from '../../hooks/usePhotoViewer';
import { useProjectPages } from '../../hooks/useProjectPages';
import { useProjects } from '../../hooks/useProjects';
import { useReorderMode } from '../../hooks/useReorderMode';
import { CapturedPage } from '../../types';

const SCROLL_DELAY_MS = 300;
const ESTIMATED_CARD_HEIGHT = 200;
const CARDS_PER_ROW = NUM_COLUMNS;

export default function ProjectDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [hasAttemptedScroll, setHasAttemptedScroll] = useState(false);
  const [isListReady, setIsListReady] = useState(false);

  const { theme } = useTheme();
  const projectId = params.id as string;
  const projectName = params.name as string || 'Untitled Project';
  const description = params.description as string || '';
  const scrollToPage = params.scrollToPage as string;

  const { capturedPages, addPage, deletePage, reorderPagesWithArray, updatePageRotation, processPageWithAI, batchProcessProject, reloadPages } = useProjectPages(projectId);
  const { refreshProjects } = useProjects();
  const { isGenerating, generatePdf } = usePdfGeneration(projectId);
  const { showCamera, handleAddPage, handleCameraCapture, handleCameraClose } = useCameraManagement({ addPage });
  const { showPhotoViewer, selectedPage, handleViewPage, handleClosePhotoViewer } = usePhotoViewer();
  const { showDeleteModal, handleDeletePage, confirmDelete, cancelDelete } = useDeleteConfirmation({ deletePage, refreshProjects });
  const { isReorderMode, handleToggleReorderMode } = useReorderMode();
  const { hasPagesWithPhotos, handleExportPdf } = usePdfExport({ projectName, description, capturedPages, generatePdf });
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<CapturedPage | null>(null);

  const handleBatchProcess = async () => {
    if (isBatchProcessing) return;
    
    setIsBatchProcessing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('Starting batch processing for project:', projectId);
      await batchProcessProject();
      console.log('Batch processing completed successfully');
    } catch (error) {
      console.log('Error batch processing project:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleEditText = (page: CapturedPage) => {
    setEditingPage(page);
    setShowTextEditor(true);
  };

  const handleSaveEditedText = async (pageId: string, editedText: string) => {
    try {
      const { apiService } = await import('../../utils/apiService');
      await apiService.updatePageText(pageId, editedText);
      // Reload pages to get updated data
      await reloadPages();
    } catch (error) {
      console.log('Error saving edited text:', error);
      throw error;
    }
  };

  const handleCloseTextEditor = () => {
    setShowTextEditor(false);
    setEditingPage(null);
  };

  useCameraOrientation(showCamera);

  const flatListRef = useRef<FlatList>(null);

  // Scroll near specific page when navigating from Recent
  useEffect(() => {
    if (scrollToPage && capturedPages.length > 0 && !hasAttemptedScroll && isListReady) {
      const pageIndex = capturedPages.findIndex(page => page.id === scrollToPage);
      
      if (pageIndex !== -1 && pageIndex < capturedPages.length) {
        // Calculate approximate offset for the target page
        // Each page card is roughly 200px tall, and we have 2 columns
        const rowIndex = Math.floor(pageIndex / CARDS_PER_ROW);
        const estimatedOffset = rowIndex * ESTIMATED_CARD_HEIGHT;
        
        setTimeout(() => {
          try {
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({
                offset: estimatedOffset,
                animated: true,
              });
            }
          } catch (error) {
            console.log('Failed to scroll to offset:', error);
          }
        }, SCROLL_DELAY_MS);
        setHasAttemptedScroll(true);
      } else {
        setHasAttemptedScroll(true);
      }
    }
  }, [scrollToPage, capturedPages, hasAttemptedScroll, isListReady]);

  // Reset scroll attempt when pages change
  useEffect(() => {
    if (capturedPages.length > 0) {
      setHasAttemptedScroll(false);
      setIsListReady(false);
    }
  }, [capturedPages.length]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ProjectHeader 
        projectName={projectName}
        description={description}
        pageCount={capturedPages.length}
        showAddButton={capturedPages.length > 0 && !isReorderMode}
        onAddPage={handleAddPage}
      />

      {capturedPages.length > 1 && (
        <View style={[styles.reorderSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <View style={styles.buttonRow}>
            <Pressable 
              style={[
                styles.reorderButton,
                { backgroundColor: isReorderMode ? theme.primary : 'transparent' }
              ]}
              onPress={handleToggleReorderMode}
            >
              <Icon 
                name={isReorderMode ? "check" : "reorder"} 
                size={16} 
                color={isReorderMode ? "white" : theme.primary} 
              />
              <Text style={[
                styles.reorderButtonText, 
                { color: isReorderMode ? "white" : theme.primary }
              ]}>
                {isReorderMode ? "Done" : "Reorder Pages"}
              </Text>
            </Pressable>

            <Pressable 
              style={[
                styles.reorderButton,
                { 
                  backgroundColor: isBatchProcessing ? theme.primary : 'transparent',
                  opacity: isBatchProcessing ? 0.6 : 1
                }
              ]}
              onPress={handleBatchProcess}
              disabled={isBatchProcessing || capturedPages.length === 0}
            >
              <Icon 
                name={isBatchProcessing ? "hourglass-empty" : "auto-awesome"} 
                size={16} 
                color={isBatchProcessing ? "white" : theme.primary} 
              />
              <Text style={[
                styles.reorderButtonText,
                { color: isBatchProcessing ? "white" : theme.primary }
              ]}>
                {isBatchProcessing ? 'Processing...' : 'Process All Pages'}
              </Text>
            </Pressable>

            {hasPagesWithPhotos && (
              <ExportPdfButton
                onPress={handleExportPdf}
                disabled={isGenerating}
                isGenerating={isGenerating}
              />
            )}
          </View>
        </View>
      )}

      {capturedPages.length === 1 && hasPagesWithPhotos && (
        <View style={[styles.exportSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <ExportPdfButton
            onPress={handleExportPdf}
            disabled={isGenerating}
            isGenerating={isGenerating}
          />
        </View>
      )}

      {isReorderMode && (
        <View style={[styles.instructionBanner, { backgroundColor: theme.secondary }]}>
          <Icon name="info-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            Press and hold, then drag to reorder pages
          </Text>
        </View>
      )}

      {capturedPages.length === 0 ? (
        <EmptyState onPress={handleAddPage} />
      ) : isReorderMode ? (
        <DraggableFlatList<CapturedPage>
          data={capturedPages}
          renderItem={({ item, drag, isActive }: { item: CapturedPage; drag: () => void; isActive: boolean }) => (
            <DraggablePageCard
              page={item}
              drag={drag}
              isActive={isActive}
              onView={handleViewPage}
            />
          )}
          keyExtractor={(item: CapturedPage) => item.id}
          onDragEnd={({ data }: { data: CapturedPage[] }) => {
            reorderPagesWithArray(data);
          }}
          contentContainerStyle={styles.pagesGrid}
          showsVerticalScrollIndicator={false}
          onLayout={() => setIsListReady(true)}
          onScrollToIndexFailed={(info: any) => {
            console.log('Failed to scroll to index:', info);
            setHasAttemptedScroll(true);
          }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={capturedPages}
          renderItem={({ item, index }) => (
            <PageCard
              page={item}
              onView={handleViewPage}
              onDelete={handleDeletePage}
              onProcessAI={processPageWithAI}
              onEditText={handleEditText}
              isBatchProcessing={isBatchProcessing}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          key={`grid-${NUM_COLUMNS}`}
          contentContainerStyle={styles.pagesGrid}
          showsVerticalScrollIndicator={false}
          onLayout={() => setIsListReady(true)}
          onScrollToIndexFailed={(info: any) => {
            console.log('Failed to scroll to index:', info);
            setHasAttemptedScroll(true);
          }}
        />
      )}



      <PhotoSourceSelector
        visible={showCamera}
        onCapture={handleCameraCapture}
        onClose={handleCameraClose}
      />

      <PhotoViewer
        visible={showPhotoViewer}
        page={selectedPage}
        onClose={handleClosePhotoViewer}
        onRotate={updatePageRotation}
      />

      <ConfirmationDialog
        visible={showDeleteModal}
        title="Delete Page"
        message="Are you sure you want to delete this page? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmStyle="destructive"
      />

      {editingPage && editingPage.photo_url && (
        <LineByLineTextEditor
          visible={showTextEditor}
          page={{
            id: editingPage.id,
            photo_url: editingPage.photo_url,
            extracted_text: editingPage.extracted_text || '',
            edited_text: editingPage.edited_text,
          }}
          onClose={handleCloseTextEditor}
          onSave={handleSaveEditedText}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reorderSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  exportSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pagesGrid: {
    paddingTop: 16,
    paddingBottom: 280,
    paddingHorizontal: 0,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
