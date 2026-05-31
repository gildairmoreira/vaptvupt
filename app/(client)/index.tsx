// Home do Cliente — VaptVupt
// Mapa Google Maps + categorias + card de prestador selecionado

import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, PanResponder } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeAvailableProviders, ProviderData } from "@/lib/database";

import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const ALL_CATEGORIES = [
  { key: "plumbing", label: "Encanador", iconName: "tool" },
  { key: "electrical", label: "Eletricista", iconName: "zap" },
  { key: "cleaning", label: "Faxina", iconName: "wind" },
  { key: "assembly", label: "Montagem", iconName: "package" },
  { key: "painting", label: "Pintura", iconName: "aperture" },
  { key: "gardening", label: "Jardim", iconName: "sun" },
  { key: "aircon", label: "Ar-Cond.", iconName: "thermometer" },
  { key: "other", label: "Outros", iconName: "more-horizontal" },
] as const;

export default function ClientHome() {
  const { user } = useAuthStore();
  const { mapProvider } = useSettingsStore();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["35%", "90%"], []);
  
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

  useFocusEffect(
    useCallback(() => {
      // Limpa o provedor selecionado sempre que a tela ganha foco
      // Isso resolve o problema do popup continuar aberto ao voltar
      setSelectedProvider(null);
    }, [])
  );

  const panX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Ativar apenas se arrastar horizontalmente
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: Animated.event([null, { dx: panX }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 100) {
          Animated.timing(panX, {
            toValue: gestureState.dx > 0 ? Dimensions.get('window').width : -Dimensions.get('window').width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSelectedProvider(null);
            panX.setValue(0);
          });
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
          window.map.panTo({ lat: ${target.latitude}, lng: ${target.longitude} });
          window.map.setZoom(15);
        }
        true;
      `);
    }
  };

  const bhCoords = { latitude: -19.9167, longitude: -43.9345 };
  const initialLocation = userLocation || bhCoords;

  const generateOsmHtml = () => {
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
              width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
              background-color: ${colors.surfaceLowest};
              display: flex; justify-content: center; align-items: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              border: 2px solid ${colors.primaryContainer};
              transform: rotate(-45deg);
            }
            .marker-badge svg { 
              width: 18px; height: 18px; stroke: ${colors.primaryContainer}; 
              stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; 
              transform: rotate(45deg); 
            }
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
            var map = L.map('map', { zoomControl: false }).setView([${initialLocation.latitude}, ${initialLocation.longitude}], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            L.marker([${initialLocation.latitude}, ${initialLocation.longitude}], {
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
              p.categories.forEach(function(cat, index) {
                var iconSvg = categoryIcons[cat] || defaultIcon;
                
                var offsetLat = 0;
                var offsetLng = 0;
                if (index > 0) {
                  // create a small circle offset around the original point
                  var angle = (index * (Math.PI * 2 / 6)); 
                  offsetLat = Math.sin(angle) * 0.0002;
                  offsetLng = Math.cos(angle) * 0.0002;
                }

                var marker = L.marker([p.location.latitude + offsetLat, p.location.longitude + offsetLng], {
                  icon: L.divIcon({
                    className: '',
                    html: '<div class="marker-badge">' + iconSvg + '</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                  })
                }).addTo(map);
                
                marker.on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PROVIDER', payload: p }));
                });
              });
            });
          </script>
        </body>
      </html>
    `;
  };

  const generateGoogleHtml = () => {
    const providersJson = JSON.stringify(providers.filter(p => p.location));
    const center = initialLocation;

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
                center: { lat: ${center.latitude}, lng: ${center.longitude} },
                zoom: 14,
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

              new google.maps.Marker({
                position: { lat: ${center.latitude}, lng: ${center.longitude} },
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
                p.categories.forEach(function(cat, index) {
                  var iconSvg = categoryIcons[cat] || defaultIcon;
                  
                  var offsetLat = 0;
                  var offsetLng = 0;
                  if (index > 0) {
                    var angle = (index * (Math.PI * 2 / 6)); 
                    offsetLat = Math.sin(angle) * 0.0002;
                    offsetLng = Math.cos(angle) * 0.0002;
                  }

                  var latLng = new google.maps.LatLng(p.location.latitude + offsetLat, p.location.longitude + offsetLng);

                  var marker = new google.maps.Marker({
                    position: latLng,
                    map: window.map,
                    icon: {
                      path: 'M0,0',
                      scale: 0
                    }
                  });

                  var overlay = new google.maps.OverlayView();
                  overlay.onAdd = function() {
                    var div = document.createElement('div');
                    div.className = 'marker-badge';
                    div.innerHTML = iconSvg;
                    div.onclick = function() {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PROVIDER', payload: p }));
                    };
                    this.div = div;
                    this.getPanes().overlayMouseTarget.appendChild(div);
                  };
                  overlay.draw = function() {
                    var point = this.getProjection().fromLatLngToDivPixel(latLng);
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
              });
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
        </body>
      </html>
    `;
  };

  const generateMapHtml = () => {
    return mapProvider === "osm" ? generateOsmHtml() : generateGoogleHtml();
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
          <Text style={styles.greetingText}>Bom dia, {firstName}</Text>
          <Feather name="sun" size={14} color={colors.onSurface} style={{ marginLeft: 4 }} />
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
        style={[styles.locationBtn, { bottom: (selectedProvider ? 400 : 380) }]}
        onPress={centerMap}
      >
        <Feather name="crosshair" size={20} color={colors.onSurface} />
      </TouchableOpacity>

      {/* Card de Prestador Selecionado */}
      {selectedProvider && (
        <Animated.View 
          style={[styles.selectedCard, { bottom: 350, transform: [{ translateX: panX }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.closeCardBtn} 
            onPress={() => setSelectedProvider(null)}
          >
            <Feather name="x" size={20} color={colors.onSurfaceMuted} />
          </TouchableOpacity>
          
          <View style={styles.providerRow}>
            {selectedProvider.photoUrl ? (
              <Image source={{ uri: selectedProvider.photoUrl }} style={styles.providerAvatarSmall} />
            ) : (
              <View style={styles.providerAvatarSmall}>
                <Feather name="user" size={24} color={colors.onSurfaceVariant} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.providerNameText}>{selectedProvider.name}</Text>
              <Text style={styles.providerInfoText}>
                <Feather name="star" size={12} color={colors.onSurface} /> {selectedProvider.rating} • R$ {selectedProvider.basePrice}/base
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewProfileBtn}
            onPress={() => router.push(`/(client)/provider/${selectedProvider.uid}`)}
          >
            <Text style={styles.viewProfileBtnText}>Ver Perfil e Contratar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* BOTTOM SHEET OFICIAL */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBg}
        handleIndicatorStyle={styles.dragIndicator}
        enableOverDrag={false}
      >
        <BottomSheetScrollView 
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sheetTitle}>Do que você precisa?</Text>
          
          <TouchableOpacity style={styles.searchBar} onPress={handleSearch} activeOpacity={0.85}>
            <View style={styles.searchIconBox}>
              <Feather name="search" size={16} color={colors.primaryContainer} />
            </View>
            <Text style={styles.searchPlaceholder}>Buscar serviços...</Text>
            <View style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Buscar</Text>
            </View>
          </TouchableOpacity>

          {/* Grid de Categorias Completa */}
          <View style={styles.categoriesGrid}>
            {ALL_CATEGORIES.map(cat => (
               <TouchableOpacity key={cat.key} style={styles.categoryItem} onPress={() => router.push(`/(client)/map?q=${cat.key}`)} activeOpacity={0.7}>
                 <View style={styles.categoryIconWrap}>
                   <Feather name={cat.iconName} size={26} color={colors.onSurface} />
                 </View>
                 <Text style={styles.categoryLabel} numberOfLines={1}>{cat.label}</Text>
               </TouchableOpacity>
            ))}
          </View>

          {/* Lista de Prestadores Próximos */}
          <View style={styles.nearbySection}>
            <Text style={styles.sectionTitle}>Prestadores Online</Text>
            {providers.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum prestador próximo a você no momento.</Text>
            ) : (
              providers.map((p) => (
                <TouchableOpacity 
                  key={p.uid} 
                  style={styles.nearbyProviderCard}
                  onPress={() => router.push(`/(client)/provider/${p.uid}`)}
                  activeOpacity={0.7}
                >
                  {p.photoUrl ? (
                    <Image source={{ uri: p.photoUrl }} style={styles.nearbyAvatar} />
                  ) : (
                    <View style={styles.nearbyAvatarPlaceholder}>
                      <Feather name="user" size={20} color={colors.onSurfaceVariant} />
                    </View>
                  )}
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyName}>{p.name}</Text>
                    <Text style={styles.nearbySub}>R$ {p.basePrice} / serviço base</Text>
                  </View>
                  <View style={styles.nearbyAction}>
                    <Feather name="chevron-right" size={20} color={colors.onSurfaceMuted} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  floatingHeader: { position: "absolute", left: spacing.xl, right: spacing.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 10 },
  greetingPill: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLowest, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, ...shadows.card },
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

  bottomSheetBg: { backgroundColor: colors.surfaceLowest, borderRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  dragIndicator: { width: 40, height: 4, backgroundColor: colors.surfaceHigh, borderRadius: 2 },
  sheetTitle: { fontFamily: typography.headline, fontSize: 22, color: colors.onSurface, marginBottom: spacing.lg },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLow, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.xl },
  searchIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceLowest, justifyContent: "center", alignItems: "center", marginRight: spacing.sm },
  searchPlaceholder: { flex: 1, fontFamily: typography.bodyBold, fontSize: 15, color: colors.onSurfaceVariant },
  searchBtn: { backgroundColor: colors.surfaceLowest, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, ...shadows.card },
  searchBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurface },
  
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg },
  categoryItem: { alignItems: "center", width: "23%", marginBottom: spacing.md },
  categoryIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surfaceLow, justifyContent: "center", alignItems: "center", marginBottom: spacing.xs },
  categoryLabel: { fontFamily: typography.label, fontSize: 12, color: colors.onSurfaceVariant, textAlign: "center" },

  nearbySection: { marginTop: spacing.base },
  sectionTitle: { fontFamily: typography.headline, fontSize: 18, color: colors.onSurface, marginBottom: spacing.md },
  emptyText: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceMuted },
  nearbyProviderCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  nearbyAvatar: { width: 48, height: 48, borderRadius: 24 },
  nearbyAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  nearbyInfo: { flex: 1, marginLeft: spacing.md },
  nearbyName: { fontFamily: typography.headline, fontSize: 16, color: colors.onSurface },
  nearbySub: { fontFamily: typography.body, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 },
  nearbyAction: { paddingLeft: spacing.sm },
});
