import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import RecentEmptyState from '../../components/RecentEmptyState';
import RecentPageCard from '../../components/RecentPageCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useRecentPages } from '../../hooks/useRecentPages';

export default function RecentScreen() {
  const { theme } = useTheme();
  const { recentPages, isLoading, loadRecentPages, refreshRecentPages } = useRecentPages();

  React.useEffect(() => {
    loadRecentPages();
  }, [loadRecentPages]);

  // Refresh data when user navigates back to this screen
  useFocusEffect(
    React.useCallback(() => {
      refreshRecentPages();
    }, [refreshRecentPages])
  );

  const handlePagePress = (page: any) => {
    router.push({
      pathname: '/project/[id]' as any,
      params: {
        id: page.projectId,
        name: page.projectName,
        description: page.projectDescription,
        scrollToPage: page.id,
        pageNumber: page.pageNumber,
      }
    });
  };

  const renderRecentPage = ({ item }: { item: any }) => (
    <RecentPageCard 
      page={item} 
      onPress={() => handlePagePress(item)} 
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {!isLoading && recentPages.length === 0 ? (
          <RecentEmptyState />
        ) : (
          <FlatList
            data={recentPages}
            renderItem={renderRecentPage}
            keyExtractor={(item) => `${item.projectId}-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recentPagesList}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshRecentPages}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  recentPagesList: {
    paddingTop: 8,
    paddingBottom: 100,
  },
}); 