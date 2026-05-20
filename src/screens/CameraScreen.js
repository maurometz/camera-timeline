import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AntDesign from "@expo/vector-icons/AntDesign";
import { supabase } from "../lib/supabase";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export default function CameraScreen({ navigation }) {
  const [ultimaFoto, setUltimaFoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef();
  const [permission, requestCameraPermission] = useCameraPermissions();

  async function quandoInicializa() {
    await requestCameraPermission();
  }

  useEffect(() => {
    quandoInicializa();
  }, []);

  async function uploadImageToSupabase(uri) {
    try {
      setUploading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `${Date.now()}_foto.jpg`;
      const contentType = 'image/jpeg';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fotos_timeline')
        .upload(filePath, decode(base64), { contentType });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('fotos_timeline')
        .getPublicUrl(filePath);

      const publicURL = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from('timeline_entries')
        .insert([{ image_url: publicURL }]);

      if (insertError) {
        throw insertError;
      }

      Alert.alert('Sucesso', 'Foto salva na linha do tempo!');
      setUltimaFoto(null); // Limpar a foto após o upload
      navigation.navigate('Linha do Tempo');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  }

  async function quandoPressionaObturador() {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync();
      setUltimaFoto(foto.uri);
      await uploadImageToSupabase(foto.uri);
    }
  }

  if (permission === null || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permissão de câmera não foi concedida :(</Text>
        <TouchableOpacity onPress={requestCameraPermission}>
            <Text style={{color: 'blue'}}>Solicitar permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <TouchableOpacity
        style={[styles.obturador, uploading && { opacity: 0.5 }]}
        onPress={quandoPressionaObturador}
        disabled={uploading}
      >
        <AntDesign name="aim" size={64} color={uploading ? "gray" : "red"} />
      </TouchableOpacity>
      {ultimaFoto && (
        <Image
          style={styles.cameraPreview}
          source={{ uri: ultimaFoto }}
        />
      )}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Salvando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  obturador: {
    position: "absolute",
    bottom: 24,
    left: "50%",
    zIndex: 10,
    backgroundColor: "transparent",
    width: 96,
    height: 96,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -48,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: "red",
  },
  cameraPreview: {
    width: 200,
    height: 150,
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
