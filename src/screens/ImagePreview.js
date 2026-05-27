import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

const ImagePreview = ({ fotoUri, close, confirm }) => {
  if (!fotoUri) return null;

  return <View style={styles.previewContainer}>
    <Image
      source={{ uri: fotoUri }}
      style={styles.fullScreenImage}
      contentFit="contain"
    />

    <TouchableOpacity style={styles.closeButton} onPress={close}>
      <Text style={styles.closeText}>X</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.confirmButton} onPress={confirm}>
      <Text style={styles.confirmText}>Confirmar e Enviar</Text>
    </TouchableOpacity>
  </View>
};

export default ImagePreview;