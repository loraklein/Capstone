import React from 'react';
import FloatingActionButton from './FloatingActionButton';

interface AddProjectButtonProps {
  onPress: () => void;
}

export default function AddProjectButton({ onPress }: AddProjectButtonProps) {
  return (
    <FloatingActionButton
      onPress={onPress}
      icon="add"
      position="bottom-right"
      label="Add New Project"
    />
  );
} 