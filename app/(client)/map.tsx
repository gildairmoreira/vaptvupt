import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { searchProviders, ProviderData } from "@/lib/database";

export default function SearchMap() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  
  const [query, setQuery] = useState(q || "");
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (q) performSearch(q);
    };
    init();
  }, [q]);

  const performSearch = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchProviders(text.trim());
      setProviders(results);
      if (results.length > 0 && webviewRef.current && results[0].location) {
        webviewRef.current.injectJavaScript(`
          if (window.map) {
            window.map.setView([${results[0].location.latitude}, ${results[0].location.longitude}], 14);
          }
          true;
        `);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'MARKER_CLICK') {
      router.push(`/(client)/provider/${data.uid}`);
    }
  };

  const generateMapHtml = () => {
    if (!userLocation) return "";
    const providersJson = JSON.stringify(providers.filter(p => p.location));
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100vw; height: 100vh; }
            .leaflet-control-attribution { display: none; }
            .marker-badge {
              width: 36px; height: 36px; border-radius: 18px;
              background-color: ${colors.surfaceLowest};
              display: flex; justify-content: center; align-items: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border: 2px solid ${colors.primaryContainer};
              color: ${colors.primaryContainer};
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            window.map = L.map('map', { zoomControl: false }).setView([${userLocation.latitude}, ${userLocation.longitude}], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(window.map);
            
            var userIcon = L.divIcon({
              html: '<div style="width:16px;height:16px;background-color:#2196F3;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
              className: '', iconSize: [22, 22], iconAnchor: [11, 11]
            });
            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon}).addTo(window.map);

            var providers = ${providersJson};
            providers.forEach(function(p) {
              var iconEmoji = '👤';
              if (p.categories.includes("cleaning")) iconEmoji = '🧹';
              if (p.categories.includes("plumbing")) iconEmoji = '🔧';
              if (p.categories.includes("electrical")) iconEmoji = '⚡';
              if (p.categories.includes("assembly")) iconEmoji = '📦';
              if (p.categories.includes("painting")) iconEmoji = '🎨';
              if (p.categories.includes("gardening")) iconEmoji = '🌱';

              var iconHtml = '<div class="marker-badge" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: \\'MARKER_CLICK\\', uid: \\'' + p.uid + '\\'}))">' + iconEmoji + '</div>';
              var icon = L.divIcon({ html: iconHtml, className: '', iconSize: [36, 36], iconAnchor: [18, 36] });
              L.marker([p.location.latitude, p.location.longitude], {icon: icon}).addTo(window.map);
            });
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      {userLocation && (
        <WebView
          ref={webviewRef}
          source={{ html: generateMapHtml() }}
          style={StyleSheet.absoluteFillObject}
          scrollEnabled={false}
          bounces={false}
          originWhitelist={['*']}
          onMessage={handleMessage}
        />
      )}

      {/* Header / Busca */}
      <View style={[styles.headerBox, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.searchInputBox}>
            <Feather name="search" size={16} color={colors.onSurfaceVariant} style={{ marginLeft: spacing.sm }} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => performSearch(query)}
              placeholder="Buscar serviços..."
              placeholderTextColor={colors.onSurfacePlaceholder}
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus={!q}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); setProviders([]); }} style={{ padding: spacing.sm }}>
                <Feather name="x" size={16} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Resultados Bottom Sheet simplificado */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <View style={styles.dragIndicator} />
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} style={{ marginVertical: spacing.xl }} />
        ) : (
          <FlatList
            data={providers}
            keyExtractor={(item) => item.uid}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum prestador encontrado.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.providerCard}
                onPress={() => router.push(`/(client)/provider/${item.uid}`)}
                activeOpacity={0.8}
              >
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.providerAvatar} />
                ) : (
                  <View style={styles.providerAvatarPlaceholder}>
                    <Text style={styles.providerAvatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{item.name}</Text>
                  <Text style={styles.providerCategory}>{item.categories.join(", ")}</Text>
                  <View style={styles.providerMeta}>
                    <Text style={styles.providerRating}>⭐ {item.rating}</Text>
                    <Text style={styles.providerPrice}>R$ {item.basePrice}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  headerBox: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.surfaceLowest, paddingBottom: spacing.sm, ...shadows.card, zIndex: 10 },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.base, marginTop: spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center", marginRight: spacing.sm },
  searchInputBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLow, borderRadius: radius.full, height: 44, paddingRight: spacing.xs },
  searchInput: { flex: 1, height: "100%", paddingHorizontal: spacing.sm, fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurface },
  bottomSheet: { position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: "50%", backgroundColor: colors.surfaceLowest, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, ...shadows.float, elevation: 20 },
  dragIndicator: { width: 40, height: 4, backgroundColor: colors.surfaceHighest, borderRadius: 2, alignSelf: "center", marginBottom: spacing.md },
  list: { flexGrow: 0 },
  emptyText: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceMuted, textAlign: "center", marginVertical: spacing.xl },
  providerCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLowest, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.surfaceHigh },
  providerAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: spacing.md },
  providerAvatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primaryContainer, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  providerAvatarInitial: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
  providerInfo: { flex: 1 },
  providerName: { fontFamily: typography.headline, fontSize: typography.sizes.bodyMd, color: colors.onSurface, marginBottom: 2 },
  providerCategory: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceVariant, textTransform: "capitalize", marginBottom: 4 },
  providerMeta: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  providerRating: { fontFamily: typography.bodyBold, fontSize: typography.sizes.caption, color: colors.onSurface },
  providerPrice: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.secondary },
});
