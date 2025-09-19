import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate } from '../utils/dateUtils';

interface RecentPage {
  id: string;
  pageNumber: number;
  timestamp: Date;
  photoUri?: string;
  rotation?: number;
  projectId: string;
  projectName: string;
  projectDescription: string;
}

interface RecentPageCardProps {
  page: RecentPage;
  onPress: () => void;
}

export default function RecentPageCard({ page, onPress }: RecentPageCardProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    onPress();
  };

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.recentPageCard, { backgroundColor: theme.card }]}>
        <Pressable onPress={handlePress} style={[styles.cardContent, { borderBottomColor: theme.divider }]}>
          {page.photoUri && (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: page.photoUri }}
                style={[
                  styles.thumbnail,
                  { transform: [{ rotate: `${page.rotation || 0}deg` }] }
                ]}
                resizeMode="cover"
              />
            </View>
          )}
          
          <View style={styles.pageInfo}>
            <Text style={[styles.projectName, { color: theme.text }]}>{page.projectName}</Text>
            {page.projectDescription ? (
              <Text style={[styles.projectDescription, { color: theme.textSecondary }]}>{page.projectDescription}</Text>
            ) : null}
            <Text style={[styles.pageDetails, { color: theme.primary }]}>
              Page {page.pageNumber} • {formatDate(page.timestamp)}
            </Text>
          </View>
          
          <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 1,
    overflow: 'hidden',
  },
  recentPageCard: {
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  pageInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 15,
    marginBottom: 4,
  },
  pageDetails: {
    fontSize: 13,
    fontWeight: '400',
  },
}); 