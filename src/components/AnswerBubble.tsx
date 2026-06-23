import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { AnswerChoice } from '../types/models';

type BubbleState = 'idle' | 'selected' | 'correct' | 'wrong';

interface Props {
  letter: NonNullable<AnswerChoice>;
  state: BubbleState;
  onPress: () => void;
  disabled?: boolean;
}

export default function AnswerBubble({ letter, state, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.bubble, styles[state]]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text style={[styles.letter, state !== 'idle' && styles.letterActive]}>
        {letter}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
  },
  idle: {
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
  },
  selected: {
    borderColor: '#3498DB',
    backgroundColor: '#3498DB',
  },
  correct: {
    borderColor: '#2ECC71',
    backgroundColor: '#2ECC71',
  },
  wrong: {
    borderColor: '#E74C3C',
    backgroundColor: '#E74C3C',
  },
  letter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  letterActive: {
    color: '#ffffff',
  },
});
