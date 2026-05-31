// Mapa de busca com Google Maps — VaptVupt
// Busca de prestadores por texto com resultados no mapa

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings, translateCategory } from "@/constants/localization";
import { searchProviders, ProviderData } from "@/lib/database";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function SearchMap() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  
  const [query, setQuery] = useState(q || "");
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mapProvider } = useSettingsStore();

  // Atualiza a busca se vier parâmetro na URL
  useEffect(() => {
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [q]);

  // Carrega a localização do usuário apenas uma vez
  useEffect(() => {
    const loadLoc = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e) {
        console.log('Erro ao buscar localização no mapa', e);
      }
    };
    loadLoc();
  }, []);

  const performSearch = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchProviders(text.trim());
      setProviders(results);
      if (results.length > 0 && webviewRef.current && results[0].location) {
        webviewRef.current.injectJavaScript(`
          if (window.map) {
            ${mapProvider === "osm" ? `window.map.setView([${results[0].location.latitude}, ${results[0].location.longitude}], 14);` : `
            window.map.panTo({ lat: ${results[0].location.latitude}, lng: ${results[0].location.longitude} });
            window.map.setZoom(14);`}
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
    return mapProvider === "osm" ? generateOsmHtml() : generateGoogleHtml();
  };

  const generateOsmHtml = () => {
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
              width: 32px; height: 32px; border-radius: 16px;
              background-color: ${colors.surfaceLowest};
              display: flex; justify-content: center; align-items: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              border: 2px solid ${colors.primaryContainer};
            }
            .marker-badge svg { width: 16px; height: 16px; stroke: ${colors.onSurfaceVariant}; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
            .user-marker {
              width: 16px; height: 16px; background-color: #2196F3;
              border-radius: 50%; border: 3px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', { zoomControl: false }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
              icon: L.divIcon({ className: '', html: '<div class="user-marker"></div>', iconSize: [22, 22] })
            }).addTo(map);

            var providers = ${providersJson};
            var categoryIcons = {
              cleaning: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
              plumbing: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>', 
              electrical: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
              assembly: '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', 
              painting: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
              gardening: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
              aircon: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
            };
            var defaultIcon = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

            providers.forEach(function(p) {
              var iconSvg = defaultIcon;
              for (var i = 0; i < p.categories.length; i++) {
                if (categoryIcons[p.categories[i]]) { iconSvg = categoryIcons[p.categories[i]]; break; }
              }
              var marker = L.marker([p.location.latitude, p.location.longitude], {
                icon: L.divIcon({
                  className: '',
                  html: '<div class="marker-badge">' + iconSvg + '</div>',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })
              }).addTo(map);
              marker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK', uid: p.uid }));
              });
            });
          </script>
        </body>
      </html>
    `;
  };

  const generateGoogleHtml = () => {
    if (!userLocation) return "";
    const providersJson = JSON.stringify(providers.filter(p => p.location));
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100vw; height: 100vh; }
            
            .marker-badge {
              width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
              background-color: ${colors.surfaceLowest};
              display: flex; justify-content: center; align-items: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              border: 2px solid ${colors.primaryContainer};
              transform: rotate(-45deg);
              cursor: pointer;
            }
            .marker-badge svg { 
              width: 18px; height: 18px; stroke: ${colors.primaryContainer}; 
              stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; 
              transform: rotate(45deg); 
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            window.alert = function() {};

            function initMap() {
              window.map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} },
                zoom: 13,
                disableDefaultUI: true,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
                  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
                  { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "off" }] },
                  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] }
                ]
              });

              // Marcador do usuário
              new google.maps.Marker({
                position: { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} },
                map: window.map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#2196F3',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                  scale: 8
                },
                zIndex: 999
              });

              // Marcadores dos prestadores
              var providers = ${providersJson};
              var categoryIcons = {
                cleaning: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
                plumbing: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>', 
                electrical: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
                assembly: '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', 
                painting: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
                gardening: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
                aircon: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
              };
              var defaultIcon = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

              providers.forEach(function(p) {
                var iconSvg = defaultIcon;
                for (var i = 0; i < p.categories.length; i++) {
                  if (categoryIcons[p.categories[i]]) {
                    iconSvg = categoryIcons[p.categories[i]];
                    break;
                  }
                }

                var overlay = new google.maps.OverlayView();
                overlay.onAdd = function() {
                  var div = document.createElement('div');
                  div.className = 'marker-badge';
                  div.innerHTML = iconSvg;
                  div.onclick = function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK', uid: p.uid }));
                  };
                  this.div = div;
                  this.getPanes().overlayMouseTarget.appendChild(div);
                };
                overlay.draw = function() {
                  var point = this.getProjection().fromLatLngToDivPixel(
                    new google.maps.LatLng(p.location.latitude, p.location.longitude)
                  );
                  if (point) {
                    this.div.style.position = 'absolute';
                    this.div.style.left = (point.x - 16) + 'px';
                    this.div.style.top = (point.y - 32) + 'px';
                  }
                };
                overlay.onRemove = function() {
                  if (this.div) this.div.parentNode.removeChild(this.div);
                };
                overlay.setMap(window.map);
              });
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
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
                  <Text style={styles.providerCategory}>{item.categories.map(c => translateCategory(c)).join(", ")}</Text>
                  <View style={styles.providerMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Feather name="star" size={11} color={colors.onSurface} />
                      <Text style={styles.providerRating}>{item.rating}</Text>
                    </View>
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
  providerCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLowest, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm },
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
