import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';
import { Alert } from 'react-native';

export const updateProfilePhoto = async (uid: string): Promise<string | null> => {
  try {
    // Solicitar permissão de galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para alterar sua foto.');
      return null;
    }

    // Selecionar imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Necessário para upload via base64 arraybuffer
    });

    if (result.canceled || !result.assets[0].base64) {
      return null;
    }

    const base64Img = result.assets[0].base64;
    const ext = result.assets[0].uri.split('.').pop() || 'jpg';
    const filePath = `${uid}/${Date.now()}.${ext}`;

    // Upload para o Supabase Storage (Bucket: avatars)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, decode(base64Img), {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) {
      console.error('Erro ao subir imagem:', error.message);
      return null;
    }

    // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Atualiza tabela users com a nova photo_url
    await supabase.from('users').update({ photo_url: publicUrl }).eq('id', uid);

    return publicUrl;
  } catch (error) {
    console.error('Erro no updateProfilePhoto:', error);
    return null;
  }
};
