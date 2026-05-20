import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AntDesign from "@expo/vector-icons/AntDesign";
import { supabase } from "../lib/supabase";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export default function CameraScreen({ navigation }) {
  const [uploading, setUploading] = useState(false);
  const [flashMode, setFlashMode] = useState('auto');
  const cameraRef = useRef();
  const [permission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const toggleFlashMode = () => {
    if (flashMode === 'auto') setFlashMode('on');
    else if (flashMode === 'on') setFlashMode('off');
    else setFlashMode('auto');
  };

  const getFlashIconColor = () => {
    if (flashMode === 'on') return '#FFD700';
    if (flashMode === 'off') return '#888';
    return '#fff';
  };

  async function uploadImageToSupabase(uri) {
    try {
      setUploading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `${Date.now()}_foto.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('fotos_timeline')
        .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('fotos_timeline')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('timeline_entries')
        .insert([{ image_url: publicUrlData.publicUrl }]);

      if (insertError) throw insertError;

      Alert.alert('Foto salva!', 'A imagem foi adicionada à linha do tempo.');
      navigation.navigate('Linha do Tempo');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    } finally {
      setUploading(false);
    }
  }

  async function quandoPressionaObturador() {
    if (cameraRef.current && !uploading) {
      const foto = await cameraRef.current.takePictureAsync();
      await uploadImageToSupabase(foto.uri);
    }
  }

  if (permission === null || !permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <AntDesign name="camera" size={72} color="#444" />
        <Text style={styles.permissionTitle}>Acesso à câmera bloqueado</Text>
        <Text style={styles.permissionText}>
          Precisamos de permissão para tirar fotos e salvá-las na linha do tempo.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flashMode={flashMode} />

      <TouchableOpacity
        style={styles.flashButton}
        onPress={toggleFlashMode}
        activeOpacity={0.7}
      >
        <AntDesign name="flashlight" size={24} color={getFlashIconColor()} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.obturador, uploading && styles.obturadorDisabled]}
        onPress={quandoPressionaObturador}
        disabled={uploading}
        activeOpacity={0.7}
      >
        <View style={styles.cameraBody}>
          <View style={styles.cameraLens} />
        </View>
      </TouchableOpacity>

      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Salvando foto...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  flashButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  obturador: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  obturadorDisabled: {
    opacity: 0.4,
  },
  cameraBody: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraLens: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111',
    borderWidth: 3,
    borderColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  permissionText: {
    color: '#999',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    marginTop: 8,
    backgroundColor: '#E53935',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
