import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const EmojiButton = ({ emoji, count, onSelect }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const handlePress = () => {
    if (selectedEmoji === emoji) {
      // Emoji is already selected, deselect it
      setSelectedEmoji(null);
      onSelect(null);
    } else {
      // Emoji is not selected, select it and deselect previous emoji if any
      setSelectedEmoji(emoji);
      onSelect(emoji);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, selectedEmoji === emoji ? styles.selected : null]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: '#cce6ff', // Background color when selected
    borderColor: '#99cfff', // Border color when selected
  },
  emoji: {
    fontSize: 24,
  },
  count: {
    marginLeft: 5,
    color: 'gray',
  },
});

export default EmojiButton;
