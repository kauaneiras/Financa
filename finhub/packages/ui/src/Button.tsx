import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function Button({ onPress, title, variant = 'primary', className = '' }: ButtonProps) {
  let bgClass = 'bg-primary';
  if (variant === 'secondary') bgClass = 'bg-gray-200 dark:bg-gray-700';
  if (variant === 'danger') bgClass = 'bg-red-500';

  let textClass = 'text-white';
  if (variant === 'secondary') textClass = 'text-gray-900 dark:text-gray-100';

  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-xl active:opacity-80 flex-row justify-center items-center ${bgClass} ${className}`}
      onPress={onPress}
    >
      <Text className={`font-semibold text-base ${textClass}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
