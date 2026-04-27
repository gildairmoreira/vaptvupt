import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeAvailableProviders, ProviderData } from "@/lib/database";

const { width } = Dimensions.get("window");

const TOP_CATEGORIES = [
  { key: "plumbing", label: "Encanador", iconName: "tool" },
  { key: "electrical", label: "Eletricista", iconName: "zap" },
  { key: "cleaning", label: "Faxina", iconName: "wind" },
  { key: "assembly", label: "Montagem", iconName: "package" },
] as const;

export default function ClientHome() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    };
    requestLocation();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAvailableProviders((data) => {
      setProviders(data);
    });
    return unsubscribe;
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PROVIDER') {
        setSelectedProvider(data.payload);
      }
    } catch (e) {
      console.error("Error parsing message from webview", e);
    }
  };

  const handleSearch = () => {
    router.push("/(client)/map");
  };

  const centerMap = () => {
    const target = selectedProvider?.location || initialLocation;
    if (target && webviewRef.current) {
      webviewRef.current.injectJavaScript(`
        if (window.map) {
          window.map.setView([${target.latitude}, ${target.longitude}], 15);
        }
        true;
      `);
    }
  };

  const bhCoords = { latitude: -19.9167, longitude: -43.9345 };
  const initialLocation = userLocation || bhCoords;

  const generateMapHtml = () => {
    const providersJson = JSON.stringify(providers.filter(p => p.location));
    const center = initialLocation;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; background-color: ${colors.baseSurface}; }
            #map { width: 100vw; height: 100vh; }
            .leaflet-control-attribution { display: none; }
            
            .marker-badge {
              width: 36px; height: 36px; border-radius: 18px;
              background-color: ${colors.surfaceLowest};
              display: flex; justify-content: center; align-items: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border: 2px solid ${colors.primaryContainer};
              color: ${colors.primaryContainer};
              font-size: 20px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            window.map = L.map('map', { zoomControl: false }).setView([${center.latitude}, ${center.longitude}], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(window.map);
            
            var userIcon = L.divIcon({
              html: '<div style="width:16px;height:16px;background-color:#2196F3;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
              className: '',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            L.marker([${center.latitude}, ${center.longitude}], {icon: userIcon}).addTo(window.map);

            var providers = ${providersJson};
            providers.forEach(function(p) {
              var iconEmoji = '👤';
              if (p.categories.includes("cleaning")) iconEmoji = '🧹';
              if (p.categories.includes("plumbing")) iconEmoji = '🔧';
              if (p.categories.includes("electrical")) iconEmoji = '⚡';
              if (p.categories.includes("assembly")) iconEmoji = '📦';
              if (p.categories.includes("painting")) iconEmoji = '🎨';
              if (p.categories.includes("gardening")) iconEmoji = '🌱';

              var iconHtml = '<div class="marker-badge">' + iconEmoji + '</div>';
              var icon = L.divIcon({ html: iconHtml, className: '', iconSize: [36, 36], iconAnchor: [18, 36] });
              var marker = L.marker([p.location.latitude, p.location.longitude], {icon: icon}).addTo(window.map);
              
              marker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PROVIDER', payload: p }));
              });
            });
          </script>
        </body>
      </html>
    `;
  };

  const firstName = user?.name?.split(" ")[0] || "você";

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: generateMapHtml() }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        onMessage={handleMessage}
        bounces={false}
        originWhitelist={['*']}
      />

      <View style={[styles.floatingHeader, { top: Math.max(insets.top, 20) + spacing.sm }]}>
        <View style={styles.greetingPill}>
          <Text style={styles.greetingText}>Bom dia, {firstName} <Feather name="sun" size={14} color={colors.onSurface} /></Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/(client)/profile")} style={styles.avatarBtn}>
          {user?.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.locationBtn, { bottom: (selectedProvider ? 400 : 280) + Math.max(insets.bottom, 20) }]}
        onPress={centerMap}
      >
        <Feather name="crosshair" size={20} color={colors.onSurface} />
      </TouchableOpacity>

      {/* Card de Prestador Selecionado */}
      {selectedProvider && (
        <View style={[styles.selectedCard, { bottom: Math.max(insets.bottom, 20) + 120 }]}>
          <TouchableOpacity 
            style={styles.closeCardBtn} 
            onPress={() => setSelectedProvider(null)}
          >
            <Feather name="x" size={20} color={colors.onSurfaceMuted} />
          </TouchableOpacity>
          
          <View style={styles.providerRow}>
            <View style={styles.providerAvatarSmall}>
              <Text style={{ fontSize: 24 }}>👷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerNameText}>{selectedProvider.name}</Text>
              <Text style={styles.providerInfoText}>⭐ {selectedProvider.rating} • R$ {selectedProvider.basePrice}/base</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewProfileBtn}
            onPress={() => router.push(`/(client)/provider/${selectedProvider.uid}`)}
          >
            <Text style={styles.viewProfileBtnText}>Ver Perfil e Contratar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <View style={styles.dragIndicator} />
        <Text style={styles.sheetTitle}>Do que você precisa?</Text>
        
        <TouchableOpacity style={styles.searchBar} onPress={handleSearch} activeOpacity={0.85}>
          <View style={styles.searchIconBox}>
            <Feather name="search" size={16} color={colors.primaryContainer} />
          </View>
          <Text style={styles.searchPlaceholder}>Para onde? (Insira o endereço)</Text>
          <View style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.categoriesGrid}>
          {TOP_CATEGORIES.map(cat => (
             <TouchableOpacity key={cat.key} style={styles.categoryItem} onPress={() => router.push(`/(client)/map?q=${cat.label}`)} activeOpacity={0.7}>
               <View style={styles.categoryIconWrap}>
                 <Feather name={cat.iconName} size={28} color={colors.onSurface} />
               </View>
               <Text style={styles.categoryLabel}>{cat.label}</Text>
             </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  floatingHeader: { position: "absolute", left: spacing.xl, right: spacing.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 10 },
  greetingPill: { backgroundColor: colors.surfaceLowest, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, ...shadows.card },
  greetingText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.bodyMd, color: colors.onSurface },
  avatarBtn: { ...shadows.card },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.surfaceLowest },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.surfaceLowest },
  avatarInitial: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
  locationBtn: { position: "absolute", right: spacing.xl, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceLowest, justifyContent: "center", alignItems: "center", ...shadows.card, zIndex: 10 },
  
  selectedCard: { position: "absolute", left: spacing.xl, right: spacing.xl, backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.lg, ...shadows.float, zIndex: 11 },
  closeCardBtn: { position: "absolute", top: 12, right: 12, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  providerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  providerAvatarSmall: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  providerNameText: { fontFamily: typography.headline, fontSize: 18, color: colors.onSurface },
  providerInfoText: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceVariant },
  viewProfileBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 14, alignItems: "center" },
  viewProfileBtnText: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.onPrimary },

  bottomSheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.surfaceLowest, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, ...shadows.float, elevation: 20 },
  dragIndicator: { width: 40, height: 4, backgroundColor: colors.surfaceHighest, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg },
  sheetTitle: { fontFamily: typography.headline, fontSize: 22, color: colors.onSurface, marginBottom: spacing.lg },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLow, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.xl },
  searchIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceLowest, justifyContent: "center", alignItems: "center", marginRight: spacing.sm },
  searchPlaceholder: { flex: 1, fontFamily: typography.bodyBold, fontSize: 15, color: colors.onSurfaceVariant },
  searchBtn: { backgroundColor: colors.surfaceLowest, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, ...shadows.card },
  searchBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurface },
  categoriesGrid: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md },
  categoryItem: { alignItems: "center", width: (width - spacing.xl * 2) / 4.5 },
  categoryIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceLow, justifyContent: "center", alignItems: "center", marginBottom: spacing.xs },
  categoryLabel: { fontFamily: typography.label, fontSize: 12, color: colors.onSurfaceVariant, textAlign: "center" },
});
