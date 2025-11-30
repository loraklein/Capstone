import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../../components/Icon';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Platform, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList from 'react-native-draggable-flatlist';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = SCREEN_WIDTH > 1024 ? 4 : SCREEN_WIDTH > 768 ? 3 : 2;
import CameraCapture from '../../components/CameraCapture';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import DraggablePageCard from '../../components/DraggablePageCard';
import EmptyState from '../../components/EmptyState';
import ExportPdfButton from '../../components/ExportPdfButton';
import ExportOptionsModal from '../../components/ExportOptionsModal';
import CustomPdfSettingsModal, { PdfSettings } from '../../components/CustomPdfSettingsModal';
import BookExportSettingsModal, { BookSettings } from '../../components/BookExportSettingsModal';
import ChapterManagementModal from '../../components/ChapterManagementModal';
import LineByLineTextEditor from '../../components/LineByLineTextEditor';
import PageCard from '../../components/PageCard';
import ReviewProgressBar from '../../components/ReviewProgressBar';
import PhotoSourceSelector from '../../components/PhotoSourceSelector';
import PhotoViewer from '../../components/PhotoViewer';
import PrintGuidanceModal from '../../components/PrintGuidanceModal';
import ProjectHeader from '../../components/ProjectHeader';
import ReorderWarningModal from '../../components/ReorderWarningModal';
import UploadProgressModal from '../../components/UploadProgressModal';
import WebFeaturesBanner from '../../components/WebFeaturesBanner';
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
  const { showCamera, handleAddPage, handleCameraCapture, handleCameraClose, uploadProgress } = useCameraManagement({ addPage });
  const { showPhotoViewer, selectedPage, handleViewPage, handleClosePhotoViewer } = usePhotoViewer();
  const { showDeleteModal, handleDeletePage, confirmDelete, cancelDelete, isDeleting } = useDeleteConfirmation({ deletePage, refreshProjects });
  const { isReorderMode, handleToggleReorderMode } = useReorderMode();
  const handleExportSuccess = (type: 'pdf' | 'book' | 'custom') => {
    setExportType(type);
    // Only show print guidance for book exports
    if (type === 'book') {
      setShowPrintGuidance(true);
    }
  };

  const { hasPagesWithPhotos, handleExportPdf } = usePdfExport({ projectName, description, capturedPages, generatePdf, onExportSuccess: handleExportSuccess });
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<CapturedPage | null>(null);
  const [showWebBanner, setShowWebBanner] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCustomPdfModal, setShowCustomPdfModal] = useState(false);
  const [showPrintBookModal, setShowPrintBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showPrintGuidance, setShowPrintGuidance] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'book' | 'custom'>('pdf');
  const [reviewStats, setReviewStats] = useState({ total: 0, reviewed: 0, needsAttention: 0, unreviewed: 0, percentComplete: 0 });
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unreviewed' | 'needs_attention' | 'reviewed'>('all');
  const [showReorderWarning, setShowReorderWarning] = useState(false);

  const handleBatchProcess = async () => {
    if (isBatchProcessing) return;

    setIsBatchProcessing(true);
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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

  const handleReorderModeToggle = async () => {
    // If we're exiting reorder mode, just toggle it off
    if (isReorderMode) {
      handleToggleReorderMode();
      return;
    }

    // Check if there are chapters before entering reorder mode
    try {
      const { apiService } = await import('../../utils/apiService');
      const chapters = await apiService.getProjectChapters(projectId);

      if (chapters && chapters.length > 0) {
        // Show warning modal if chapters exist
        setShowReorderWarning(true);
      } else {
        // No chapters, safe to enter reorder mode
        handleToggleReorderMode();
      }
    } catch (error) {
      console.log('Error checking chapters:', error);
      // If there's an error, allow reorder mode anyway
      handleToggleReorderMode();
    }
  };

  const handleConfirmReorder = async () => {
    // Delete all chapters
    try {
      const { apiService } = await import('../../utils/apiService');
      await apiService.deleteAllChapters(projectId);
    } catch (error) {
      console.log('Error deleting chapters:', error);
    }

    // Close modal and enter reorder mode
    setShowReorderWarning(false);
    handleToggleReorderMode();
  };

  const handleCancelReorder = () => {
    setShowReorderWarning(false);
  };

  const handleViewCombinedText = () => {
    router.push({
      pathname: '/project/combined-text' as any,
      params: {
        id: projectId,
        name: projectName,
      },
    });
  };

  const hasPagesWithText = capturedPages.some(page => page.edited_text || page.extracted_text);

  // Calculate project states for progressive disclosure
  const hasUnprocessedPages = capturedPages.some(page => !page.extracted_text && !page.edited_text);
  const hasProcessedPages = capturedPages.some(page => page.extracted_text || page.edited_text);
  const hasUnreviewedPages = reviewStats.unreviewed > 0 || reviewStats.needsAttention > 0;
  const isReviewingComplete = reviewStats.total > 0 && reviewStats.percentComplete >= 80;

  // Load review statistics
  useEffect(() => {
    const loadReviewStats = async () => {
      try {
        const { apiService } = await import('../../utils/apiService');
        const stats = await apiService.getProjectReviewStats(projectId);
        setReviewStats(stats);
      } catch (error) {
        console.log('Error loading review stats:', error);
      }
    };

    if (capturedPages.length > 0) {
      loadReviewStats();
    }
  }, [capturedPages, projectId]);

  // Filter pages based on review status
  const filteredPages = React.useMemo(() => {
    if (reviewFilter === 'all') return capturedPages;
    return capturedPages.filter(page => page.review_status === reviewFilter);
  }, [capturedPages, reviewFilter]);

  // Navigate to next unreviewed page
  const handleNextUnreviewed = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const nextPage = capturedPages.find(p =>
      p.review_status === 'unreviewed' || p.review_status === 'needs_attention'
    );

    if (nextPage) {
      handleEditText(nextPage);
    } else {
      // All pages reviewed!
      Alert.alert('All Done!', 'All pages have been reviewed. Great work!');
    }
  };

  // Check if we should show the web features banner
  useEffect(() => {
    const checkWebBanner = async () => {
      try {
        // Only show on mobile, not on web
        if (Platform.OS === 'web') return;

        const bannerDismissed = await AsyncStorage.getItem('webFeaturesBannerDismissed');
        if (bannerDismissed === 'true') return;

        // Show banner if project has at least one page with text
        if (hasPagesWithText) {
          setShowWebBanner(true);
        }
      } catch (error) {
        console.error('Error checking web banner:', error);
      }
    };

    checkWebBanner();
  }, [hasPagesWithText]);

  const handleDismissWebBanner = async () => {
    try {
      await AsyncStorage.setItem('webFeaturesBannerDismissed', 'true');
      setShowWebBanner(false);
    } catch (error) {
      console.error('Error dismissing banner:', error);
    }
  };

  const handleLearnMoreWebFeatures = () => {
    setShowWebBanner(false);
    setShowExportModal(true);
  };

  const handleExportClick = () => {
    // Show the export options modal instead of exporting directly
    setShowExportModal(true);
  };

  const handleCustomPdf = () => {
    // Open custom PDF settings modal
    setShowCustomPdfModal(true);
  };

  const handleExportCustomPdf = async (settings: PdfSettings) => {
    try {
      setShowCustomPdfModal(false);
      console.log('Exporting custom PDF with settings:', settings);
      await generatePdf(projectName, description, capturedPages, {
        customPdfSettings: settings,
      }, handleExportSuccess);
    } catch (error) {
      console.error('Error exporting custom PDF:', error);
    }
  };

  const handlePrintBook = () => {
    // Open print book settings modal
    setShowPrintBookModal(true);
  };

  const handleExportPrintBook = async (settings: BookSettings) => {
    try {
      setShowPrintBookModal(false);
      console.log('Exporting print book with settings:', settings);
      await generatePdf(projectName, description, capturedPages, {
        bookSettings: settings,
      }, handleExportSuccess);
    } catch (error) {
      console.error('Error exporting print book:', error);
    }
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
        onBack={Platform.OS !== 'web' ? () => router.push('/(tabs)') : undefined}
      />

      {/* Review Progress Bar - Only show when all pages are processed */}
      {!hasUnprocessedPages && hasProcessedPages && reviewStats.total > 0 && (
        <ReviewProgressBar
          total={reviewStats.total}
          reviewed={reviewStats.reviewed}
          needsAttention={reviewStats.needsAttention}
          unreviewed={reviewStats.unreviewed}
          percentComplete={reviewStats.percentComplete}
          onFilterChange={setReviewFilter}
          currentFilter={reviewFilter}
        />
      )}

      {/* Progressive Action Buttons */}
      {capturedPages.length > 0 && (
        <View style={[styles.reorderSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>

          {/* STAGE 1: Initial - Process Pages */}
          {hasUnprocessedPages && (
            <View style={styles.buttonRow}>
              <Pressable
                style={[
                  styles.primaryActionButton,
                  {
                    backgroundColor: isBatchProcessing ? theme.primary : theme.primary,
                    opacity: isBatchProcessing ? 0.6 : 1
                  }
                ]}
                onPress={handleBatchProcess}
                disabled={isBatchProcessing || capturedPages.length === 0}
              >
                <Icon
                  name={isBatchProcessing ? "hourglass-empty" : "auto-awesome"}
                  size={20}
                  color="white"
                />
                <Text style={styles.primaryActionButtonText}>
                  {isBatchProcessing ? 'Processing...' : 'Process All with AI'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* STAGE 2: Processing Complete - Review Text */}
          {!hasUnprocessedPages && hasProcessedPages && (
            <>
              {/* Primary action: Next Unreviewed (if any unreviewed pages) */}
              {hasUnreviewedPages && (
                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.primaryActionButton, { backgroundColor: theme.primary }]}
                    onPress={handleNextUnreviewed}
                  >
                    <Icon name="arrow-forward" size={20} color="white" />
                    <Text style={styles.primaryActionButtonText}>
                      Review Next Page
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Secondary actions row - Process All if still unprocessed pages */}
              {hasUnprocessedPages && (
                <View style={[styles.buttonRow, { marginTop: hasUnreviewedPages ? 8 : 0 }]}>
                  <Pressable
                    style={[
                      styles.secondaryActionButton,
                      {
                        backgroundColor: isBatchProcessing ? theme.primary : 'transparent',
                        opacity: isBatchProcessing ? 0.6 : 1
                      }
                    ]}
                    onPress={handleBatchProcess}
                    disabled={isBatchProcessing}
                  >
                    <Icon
                      name={isBatchProcessing ? "hourglass-empty" : "auto-awesome"}
                      size={16}
                      color={isBatchProcessing ? "white" : theme.primary}
                    />
                    <Text style={[
                      styles.secondaryActionButtonText,
                      { color: isBatchProcessing ? "white" : theme.primary }
                    ]}>
                      {isBatchProcessing ? 'Processing...' : 'Process All'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* STAGE 3: Ready to Organize and Export (show when reviewing is mostly done) */}
              {isReviewingComplete && (
                <>
                  {/* Row 1: Reorder Pages, Organize Sections */}
                  <View style={[styles.buttonRow, { marginTop: hasUnreviewedPages || hasUnprocessedPages ? 8 : 0 }]}>
                    {/* Reorder Pages */}
                    {capturedPages.length > 1 && (
                      <Pressable
                        style={[
                          styles.secondaryActionButton,
                          { backgroundColor: isReorderMode ? theme.primary : 'transparent' }
                        ]}
                        onPress={handleReorderModeToggle}
                      >
                        <Icon
                          name={isReorderMode ? "check" : "reorder"}
                          size={16}
                          color={isReorderMode ? "white" : theme.primary}
                        />
                        <Text style={[
                          styles.secondaryActionButtonText,
                          { color: isReorderMode ? "white" : theme.primary }
                        ]}>
                          {isReorderMode ? "Done" : "Reorder Pages"}
                        </Text>
                      </Pressable>
                    )}

                    {/* Organize Sections */}
                    <Pressable
                      style={styles.secondaryActionButton}
                      onPress={() => setShowChapterModal(true)}
                    >
                      <Icon name="bookmark" size={16} color={theme.primary} />
                      <Text style={[styles.secondaryActionButtonText, { color: theme.primary }]}>
                        Organize Sections
                      </Text>
                    </Pressable>
                  </View>

                  {/* Row 2: View Combined Text, Export PDF */}
                  <View style={[styles.buttonRow, { marginTop: 8 }]}>
                    {/* View Combined Text */}
                    {hasPagesWithText && (
                      <Pressable
                        style={styles.secondaryActionButton}
                        onPress={handleViewCombinedText}
                      >
                        <Icon name="description" size={16} color={theme.primary} />
                        <Text style={[styles.secondaryActionButtonText, { color: theme.primary }]}>
                          View Combined Text
                        </Text>
                      </Pressable>
                    )}

                    {/* Export PDF */}
                    {hasPagesWithPhotos && (
                      <ExportPdfButton
                        onPress={handleExportClick}
                        disabled={isGenerating}
                        isGenerating={isGenerating}
                      />
                    )}
                  </View>
                </>
              )}
            </>
          )}
        </View>
      )}

      {/* Single page handling removed - handled in main progressive section above */}

      {/* Web Features Banner - shown once after AI processing */}
      {showWebBanner && (
        <WebFeaturesBanner
          onLearnMore={handleLearnMoreWebFeatures}
          onDismiss={handleDismissWebBanner}
        />
      )}

      {isReorderMode && (
        <View style={[styles.instructionBanner, { backgroundColor: theme.secondary }]}>
          <Icon name="info-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            {Platform.OS === 'web' ? 'Use arrow buttons to reorder pages' : 'Press and hold, then drag to reorder pages'}
          </Text>
        </View>
      )}

      {capturedPages.length === 0 ? (
        <EmptyState onPress={handleAddPage} />
      ) : isReorderMode && Platform.OS === 'web' ? (
        <FlatList
          data={capturedPages}
          renderItem={({ item }) => {
            const currentIndex = capturedPages.findIndex(p => p.id === item.id);
            const handleMoveUp = () => {
              if (currentIndex > 0) {
                const newPages = [...capturedPages];
                [newPages[currentIndex - 1], newPages[currentIndex]] = [newPages[currentIndex], newPages[currentIndex - 1]];
                reorderPagesWithArray(newPages);
              }
            };
            const handleMoveDown = () => {
              if (currentIndex < capturedPages.length - 1) {
                const newPages = [...capturedPages];
                [newPages[currentIndex], newPages[currentIndex + 1]] = [newPages[currentIndex + 1], newPages[currentIndex]];
                reorderPagesWithArray(newPages);
              }
            };
            return (
              <DraggablePageCard
                page={item}
                drag={() => {}}
                isActive={false}
                onView={handleViewPage}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={currentIndex === 0}
                isLast={currentIndex === capturedPages.length - 1}
              />
            );
          }}
          keyExtractor={(item: CapturedPage) => item.id}
          contentContainerStyle={styles.pagesGrid}
          showsVerticalScrollIndicator={true}
        />
      ) : isReorderMode ? (
        <DraggableFlatList<CapturedPage>
          data={capturedPages}
          renderItem={({ item, drag, isActive }: { item: CapturedPage; drag: () => void; isActive: boolean }) => {
            const currentIndex = capturedPages.findIndex(p => p.id === item.id);
            const handleMoveUp = () => {
              if (currentIndex > 0) {
                const newPages = [...capturedPages];
                [newPages[currentIndex - 1], newPages[currentIndex]] = [newPages[currentIndex], newPages[currentIndex - 1]];
                reorderPagesWithArray(newPages);
              }
            };
            const handleMoveDown = () => {
              if (currentIndex < capturedPages.length - 1) {
                const newPages = [...capturedPages];
                [newPages[currentIndex], newPages[currentIndex + 1]] = [newPages[currentIndex + 1], newPages[currentIndex]];
                reorderPagesWithArray(newPages);
              }
            };
            return (
              <DraggablePageCard
                page={item}
                drag={drag}
                isActive={isActive}
                onView={handleViewPage}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={currentIndex === 0}
                isLast={currentIndex === capturedPages.length - 1}
              />
            );
          }}
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
          data={filteredPages}
          renderItem={({ item, index }) => (
            <View style={styles.pageCardWrapper}>
              <PageCard
                page={item}
                onView={handleViewPage}
                onDelete={handleDeletePage}
                onProcessAI={processPageWithAI}
                onEditText={handleEditText}
                isBatchProcessing={isBatchProcessing}
              />
            </View>
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

      <UploadProgressModal progress={uploadProgress} />

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
        loading={isDeleting}
      />

      {editingPage && editingPage.photo_url && (
        <LineByLineTextEditor
          visible={showTextEditor}
          page={{
            id: editingPage.id,
            photo_url: editingPage.photo_url,
            extracted_text: editingPage.extracted_text || '',
            edited_text: editingPage.edited_text,
            rotation: editingPage.rotation,
          }}
          onClose={handleCloseTextEditor}
          onSave={handleSaveEditedText}
        />
      )}

      {/* Export Options Modal */}
      <ExportOptionsModal
        visible={showExportModal}
        projectId={projectId}
        projectName={projectName}
        onQuickExport={handleExportPdf}
        onCustomPdf={handleCustomPdf}
        onPrintBook={handlePrintBook}
        onDismiss={() => setShowExportModal(false)}
      />

      {/* Custom PDF Settings Modal */}
      <CustomPdfSettingsModal
        visible={showCustomPdfModal}
        onExport={handleExportCustomPdf}
        onDismiss={() => setShowCustomPdfModal(false)}
      />

      {/* Book Export Settings Modal */}
      <BookExportSettingsModal
        visible={showPrintBookModal}
        projectId={projectId}
        projectName={projectName}
        projectDescription={description}
        onExport={handleExportPrintBook}
        onDismiss={() => setShowPrintBookModal(false)}
      />

      {/* Chapter Management Modal */}
      <ChapterManagementModal
        visible={showChapterModal}
        projectId={projectId}
        totalPages={capturedPages.length}
        onDismiss={() => setShowChapterModal(false)}
      />

      {/* Print Guidance Modal */}
      <PrintGuidanceModal
        visible={showPrintGuidance}
        exportType={exportType}
        onClose={() => setShowPrintGuidance(false)}
      />

      {/* Reorder Warning Modal */}
      <ReorderWarningModal
        visible={showReorderWarning}
        onConfirm={handleConfirmReorder}
        onCancel={handleCancelReorder}
      />
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
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    ...(SCREEN_WIDTH > 768 ? {} : { flex: 1 }), // Only stretch on mobile
  },
  primaryActionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  pageCardWrapper: {
    flex: 1,
    maxWidth: 100 / NUM_COLUMNS + '%',
    padding: 8,
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
