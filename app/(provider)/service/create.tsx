// Criar Anúncio de Serviço — Prestador — VaptVupt
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import { createService } from "@/lib/database";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { Feather } from "@expo/vector-icons";

const CATEGORIES = [
  { key: "plumbing", label: strings.categories.plumbing },
  { key: "electrical", label: strings.categories.electrical },
  { key: "cleaning", label: strings.categories.cleaning },
  { key: "painting", label: strings.categories.painting },
  { key: "assembly", label: strings.categories.assembly },
  { key: "carpentry", label: strings.categories.carpentry },
  { key: "aircon", label: strings.categories.aircon },
  { key: "gardening", label: strings.categories.gardening },
  { key: "other", label: strings.categories.other },
];

export default function CreateService() {
  const { user } = useAuthStore();
  const webviewRef = useRef<WebView>(null);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Localização
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: -19.9166813,
    longitude: -43.9344931,
  });
  const [isLocating, setIsLocating] = useState(true);
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Busca localização atual ao abrir a tela
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsLocating(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (e) {
        console.log("Erro ao pegar localização", e);
      } finally {
        setIsLocating(false);
      }
    };
    fetchLocation();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !category || !description.trim()) {
      Alert.alert("Atenção", "Preencha título, categoria e descrição.");
      return;
    }
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      await createService({
        provider_id: user.uid,
        title: title.trim(),
        category,
        description: description.trim(),
        base_price: price ? parseFloat(price.replace(",", ".")) : null,
        location,
      });
      Alert.alert("Sucesso!", "Seu anúncio foi criado com a localização base selecionada.", [
        { text: "OK", onPress: () => router.replace("/(provider)/my-services") },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível criar o anúncio.");
    } finally {
      setIsLoading(false);
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; font-family: sans-serif; }
          #map { width: 100vw; height: 100vh; }
          .leaflet-control-attribution { display: none; }
          #search-box {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            gap: 5px;
            width: 90%;
            max-width: 400px;
          }
          #search-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
          #search-btn {
            background: #ff6b35;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div id="search-box">
          <input type="text" id="search-input" placeholder="Digite o endereço..." />
          <button id="search-btn" onclick="searchAddress()">Buscar</button>
        </div>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${location.latitude}, ${location.longitude}], 15);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);

          var customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          var marker = L.marker([${location.latitude}, ${location.longitude}], {
            icon: customIcon,
            draggable: true
          }).addTo(map);

          function updateReact(lat, lng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
          }

          marker.on('dragend', function (e) {
            var position = marker.getLatLng();
            updateReact(position.lat, position.lng);
          });

          // Move o pin com um click no mapa
          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateReact(e.latlng.lat, e.latlng.lng);
          });

          function searchAddress() {
            var query = document.getElementById('search-input').value;
            if(!query) return;
            fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query))
              .then(res => res.json())
              .then(data => {
                if(data && data.length > 0) {
                  var lat = parseFloat(data[0].lat);
                  var lon = parseFloat(data[0].lon);
                  map.setView([lat, lon], 16);
                  marker.setLatLng([lat, lon]);
                  updateReact(lat, lon);
                } else {
                  alert("Endereço não encontrado.");
                }
              });
          }
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Anúncio</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Título do serviço *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Ex: Instalação elétrica residencial" placeholderTextColor={colors.onSurfacePlaceholder} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Categoria *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c.key} style={[styles.catBtn, category === c.key && styles.catBtnActive]} onPress={() => setCategory(c.key)} activeOpacity={0.75}>
                <Text style={[styles.catBtnText, category === c.key && styles.catBtnTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Descrição *</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Descreva o serviço que você oferece..." placeholderTextColor={colors.onSurfacePlaceholder} style={[styles.input, styles.textarea]} multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Preço base (R$)</Text>
          <TextInput value={price} onChangeText={setPrice} placeholder="Ex: 150" placeholderTextColor={colors.onSurfacePlaceholder} style={styles.input} keyboardType="numeric" />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Localização de Atendimento *</Text>
          <Text style={styles.helperText}>Sua base para que os clientes te encontrem no mapa.</Text>
          <TouchableOpacity style={styles.openMapBtn} onPress={() => setIsMapVisible(true)} activeOpacity={0.85}>
            <Feather name="map-pin" size={20} color={colors.primaryContainer} />
            <Text style={styles.openMapBtnText}>Selecionar Localização no Mapa</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]} onPress={handleSave} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryBtnText}>Salvar Anúncio</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal do Mapa Fullscreen */}
      <Modal visible={isMapVisible} animationType="slide" onRequestClose={() => setIsMapVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.baseSurface }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsMapVisible(false)} style={styles.modalCloseBtn}>
              <Text style={{ fontFamily: typography.bodyBold, color: colors.onSurface }}>✕ Cancelar</Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: typography.headline, fontSize: 16 }}>Definir Base</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)} style={styles.modalConfirmBtn}>
              <Text style={{ fontFamily: typography.bodyBold, color: colors.primaryContainer }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          <WebView
            ref={webviewRef}
            source={{ html: mapHtml }}
            style={{ flex: 1 }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.latitude && data.longitude) {
                  setLocation({ latitude: data.latitude, longitude: data.longitude });
                }
              } catch (e) {
                console.log("Erro no onMessage", e);
              }
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing["2xl"] },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.base },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerTitle: { fontFamily: typography.headline, fontSize: typography.sizes.titleMd, color: colors.onSurface },
  fieldGroup: { marginBottom: spacing.xl },
  fieldLabel: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurfaceVariant, fontWeight: "600", marginBottom: spacing.sm },
  helperText: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceMuted, marginBottom: spacing.md },
  input: { backgroundColor: colors.surfaceLowest, borderRadius: radius.md, paddingHorizontal: spacing.base, paddingVertical: 14, fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurface, ...shadows.card },
  textarea: { minHeight: 100 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catBtn: { backgroundColor: colors.surfaceLowest, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, ...shadows.card },
  catBtnActive: { backgroundColor: colors.primaryContainer },
  catBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurface },
  catBtnTextActive: { color: colors.onPrimary },
  openMapBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: "#fff5f2", paddingVertical: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: "#ffe0d6" },
  openMapBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.bodyMd, color: colors.primaryContainer },
  primaryBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center", marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.surfaceLowest, borderBottomWidth: 1, borderBottomColor: colors.surfaceHigh },
  modalCloseBtn: { padding: spacing.xs },
  modalConfirmBtn: { padding: spacing.xs },
});
