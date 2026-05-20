import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

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

    if (error) {
      console.error(error);
    } else {
      setEntries(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

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
      // Atualizar a lista localmente para refletir a mudança
      setEntries(prev => prev.map(item => 
        item.id === selectedEntry.id ? { ...item, description: descriptionInput } : item
      ));
      closeModal();
    } else {
      console.error(error);
      alert('Erro ao salvar descrição.');
    }
    setSaving(false);
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {item.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
          ) : (
            <Text style={styles.placeholderText}>Sem descrição. Toque para adicionar.</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && entries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchEntries}
      />

      {/* Modal para Visualizar Imagem em Tela Cheia e Editar Descrição */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          
          {selectedEntry && (
            <>
              <Image source={{ uri: selectedEntry.image_url }} style={styles.modalImage} resizeMode="contain" />
              
              <View style={styles.editContainer}>
                <Text style={styles.label}>Descrição da Foto:</Text>
                <TextInput
                  style={styles.input}
                  value={descriptionInput}
                  onChangeText={setDescriptionInput}
                  placeholder="O que estava acontecendo?"
                  multiline
                />
                
                <Button 
                  title={saving ? "Salvando..." : "Salvar Descrição"} 
                  onPress={saveDescription} 
                  disabled={saving}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  placeholderText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalImage: {
    flex: 1,
    width: '100%',
  },
  editContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  }
});
