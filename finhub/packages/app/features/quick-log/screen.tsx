import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button } from '@finhub/ui/src/Button';

export function QuickLogScreen() {
  const [amount, setAmount] = amountState('0');
  const [category, setCategory] = useState('');

  function amountState(initial: string) {
    return useState(initial);
  }

  const handleSave = () => {
    // Integração abstrata com tRPC / API Node.js / Prisma
    console.log('Saved entry:', { amount, category });
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark p-6 justify-center">
      <View className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-sans">
          Registro Rápido
        </Text>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-500 mb-2">Valor (R$)</Text>
          <TextInput
            className="w-full bg-gray-50 dark:bg-gray-800 h-14 rounded-xl px-4 text-lg text-gray-900 dark:text-gray-100"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-500 mb-2">Categoria</Text>
          <TextInput
            className="w-full bg-gray-50 dark:bg-gray-800 h-14 rounded-xl px-4 text-lg text-gray-900 dark:text-gray-100"
            value={category}
            onChangeText={setCategory}
            placeholder="Ex: Alimentação, Transporte..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <Button onPress={handleSave} title="Adicionar Despesa" className="w-full" />
      </View>
    </View>
  );
}
