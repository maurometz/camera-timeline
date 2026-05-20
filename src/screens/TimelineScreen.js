import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <AntDesign name="picture" size={72} color="#ddd" />
      <Text style={styles.emptyTitle}>Nenhuma foto ainda</Text>
      <Text style={styles.emptyText}>Vá à aba Câmera e tire sua primeira foto!</Text>
    </View>
  );
}

export default function TimelineScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setEntries(data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchEntries(); }, []));

  const openModal = (entry) => {
    setSelectedEntry(entry);
    setDescriptionInput(entry.description || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEntry(null);
  };

  const saveDescription = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    const { error } = await supabase
      .from('timeline_entries')
      .update({ description: descriptionInput })
      .eq('id', selectedEntry.id);

    if (!error) {
      setEntries(prev =>
        prev.map(item =>
          item.id === selectedEntry.id ? { ...item, description: descriptionInput } : item
        )
      );
      closeModal();
    } else {
      alert('Erro ao salvar descrição.');
    }
    setSaving(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)} activeOpacity={0.85}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
        ) : (
          <Text style={styles.placeholderText}>Toque para adicionar uma descrição</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && entries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, entries.length === 0 && styles.listEmpty]}
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        refreshing={loading}
        onRefresh={fetchEntries}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <AntDesign name="close" size={20} color="#fff" />
          </TouchableOpacity>

          {selectedEntry && (
            <>
              <Image
                source={{ uri: selectedEntry.image_url }}
                style={styles.modalImage}
                resizeMode="contain"
              />

              <View style={styles.editContainer}>
                <Text style={styles.modalDateText}>{formatDate(selectedEntry.created_at)}</Text>

                <TextInput
                  style={styles.input}
                  value={descriptionInput}
                  onChangeText={setDescriptionInput}
                  placeholder="O que estava acontecendo?"
                  placeholderTextColor="#aaa"
                  multiline
                />

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={saveDescription}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveButtonText}>Salvar descrição</Text>
                  }
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: 240,
  },
  infoContainer: {
    padding: 14,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    flex: 1,
    width: '100%',
  },
  editContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  modalDateText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#222',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  saveButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
