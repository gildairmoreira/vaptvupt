import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { getProviderData, updateProviderData, ProviderData } from "@/lib/database";
import { strings } from "@/constants/localization";

export default function EditService() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id é a categoria aqui
  const { user } = useAuthStore();
  
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const data = await getProviderData(user!.uid);
      if (data) {
        setPrice(data.basePrice ? data.basePrice.toString() : "");
        setDescription(data.bio || "");
        if (data.location) {
          setLocation(data.location);
        } else {
          // Busca localização atual se não tiver
          setIsLocating(true);
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            let loc = await Location.getCurrentPositionAsync({});
            setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
          setIsLocating(false);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      await updateProviderData(user.uid, {
        basePrice: parseFloat(price.replace(",", ".")) || 0,
        bio: description.trim(),
        location: location || undefined
      });
      Alert.alert("Sucesso", "Seu serviço foi atualizado com sucesso!");
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const mapHtml = location ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var marker = L.marker([${location.latitude}, ${location.longitude}], {draggable: true}).addTo(map);
          
          marker.on('dragend', function(e) {
            var position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: position.lat,
              longitude: position.lng
            }));
          });
        </script>
      </body>
    </html>
  ` : '';

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primaryContainer} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar {strings.categories[id as keyof typeof strings.categories] || id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preço Base do Serviço (R$)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>R$</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0,00"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição / Sua Bio</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholder="Descreva sua experiência, ferramentas, etc."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Local base de atendimento</Text>
          <Text style={styles.helpText}>Esta é a localização usada para calcular a distância até o cliente.</Text>
          
          <TouchableOpacity 
            style={styles.mapBtn}
            onPress={() => setIsMapVisible(true)}
            disabled={isLocating}
          >
            <Feather name="map-pin" size={20} color={colors.primaryContainer} />
            <Text style={styles.mapBtnText}>
              {isLocating ? "Obtendo localização..." : location ? "Alterar no Mapa" : "Definir no Mapa"}
            </Text>
          </TouchableOpacity>
          {location && (
            <Text style={styles.coordsText}>
              Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal do Mapa */}
      <Modal visible={isMapVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.baseSurface }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajuste o pino no local exato</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Concluído</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {location && (
              <WebView
                source={{ html: mapHtml }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.latitude && data.longitude) {
                      setLocation({ latitude: data.latitude, longitude: data.longitude });
                    }
                  } catch (e) {}
                }}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: typography.headline, fontSize: 20, color: colors.onSurface, textTransform: "capitalize" },
  form: { padding: spacing.xl, gap: spacing.xl },
  inputGroup: { gap: spacing.sm },
  label: { fontFamily: typography.headline, fontSize: 16, color: colors.onSurface },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceHigh, borderRadius: radius.md, paddingHorizontal: spacing.md },
  currency: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.onSurfaceVariant, marginRight: spacing.sm },
  input: { flex: 1, height: 50, fontFamily: typography.body, fontSize: 16, color: colors.onSurface },
  textArea: { height: 120, backgroundColor: colors.surfaceHigh, borderRadius: radius.md, padding: spacing.md },
  helpText: { fontFamily: typography.body, fontSize: 12, color: colors.onSurfaceMuted, marginTop: 4 },
  mapBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.surfaceHigh, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.sm },
  mapBtnText: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.primaryContainer },
  coordsText: { fontFamily: typography.body, fontSize: 12, color: colors.onSurfaceVariant, textAlign: "center", marginTop: spacing.xs },
  saveBtn: { backgroundColor: colors.primaryContainer, height: 56, borderRadius: radius.full, justifyContent: "center", alignItems: "center", marginTop: spacing.xl },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.onPrimary },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.md, backgroundColor: colors.baseSurface },
  modalTitle: { fontFamily: typography.headline, fontSize: 16, color: colors.onSurface },
  closeBtn: { padding: spacing.sm },
  closeBtnText: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.primaryContainer }
});
