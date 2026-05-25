import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { useProviderStore } from "@/store/useProviderStore";
import { subscribeRequest, ServiceRequest } from "@/lib/database";

const { width } = Dimensions.get("window");
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function ProviderRequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { acceptRequest, declineRequest, isLoading } = useProviderStore();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [providerLocation, setProviderLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeRequest(id, setRequest);
    return unsub;
  }, [id]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setProviderLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const handleAccept = async () => {
    if (!id || !user?.uid) return;
    await acceptRequest(id, user.uid);
  };

  const handleDecline = async () => {
    if (!id) return;
    await declineRequest(id);
    router.back();
  };

  const generateMapHtml = () => {
    if (!request?.location || !providerLocation) return "";
    const isAccepted = request.status !== 'pending';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100vw; height: 100vh; }
            
            .marker-client { width: 24px; height: 24px; background-color: ${colors.primaryContainer}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
            .marker-provider { width: 20px; height: 20px; background-color: #2196F3; border-radius: 50%; border: 3px solid white; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            window.alert = function() {};

            function initMap() {
              var clientPos = { lat: ${request.location.latitude}, lng: ${request.location.longitude} };
              var providerPos = { lat: ${providerLocation.latitude}, lng: ${providerLocation.longitude} };
              
              var map = new google.maps.Map(document.getElementById('map'), {
                center: clientPos,
                zoom: 15,
                disableDefaultUI: true,
                styles: [
                  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
                  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
                  { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "off" }] },
                  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] }
                ]
              });
              
              var CustomMarker = function(latlng, map, className) {
                this.latlng_ = latlng;
                this.className_ = className;
                this.setMap(map);
              };
              CustomMarker.prototype = new google.maps.OverlayView();
              CustomMarker.prototype.draw = function() {
                var div = this.div_;
                if (!div) {
                  div = this.div_ = document.createElement('div');
                  div.className = this.className_;
                  div.style.position = 'absolute';
                  var panes = this.getPanes();
                  panes.overlayImage.appendChild(div);
                }
                var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
                if (point) {
                  div.style.left = (point.x - (this.className_ === 'marker-client' ? 15 : 13)) + 'px';
                  div.style.top = (point.y - (this.className_ === 'marker-client' ? 15 : 13)) + 'px';
                }
              };

              new CustomMarker(new google.maps.LatLng(clientPos.lat, clientPos.lng), map, 'marker-client');

              if (${isAccepted}) {
                new CustomMarker(new google.maps.LatLng(providerPos.lat, providerPos.lng), map, 'marker-provider');
                
                var flightPath = new google.maps.Polyline({
                  path: [providerPos, clientPos],
                  geodesic: true,
                  strokeColor: '${colors.primaryContainer}',
                  strokeOpacity: 0,
                  icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, scale: 4, strokeColor: '${colors.primaryContainer}', strokeWeight: 4 },
                    offset: '0',
                    repeat: '20px'
                  }],
                });
                flightPath.setMap(map);
                
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(providerPos);
                bounds.extend(clientPos);
                map.fitBounds(bounds, { padding: 50 });
              }
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
        </body>
      </html>
    `;
  };

  if (!request) return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  const isPending = request.status === 'pending';

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isPending ? "Nova Solicitação" : "Em Atendimento"}</Text>
      </View>

      <View style={styles.mapContainer}>
        {providerLocation ? (
          <WebView
            ref={webviewRef}
            source={{ html: generateMapHtml() }}
            style={styles.map}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator color={colors.primaryContainer} />
          </View>
        )}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceType}>{request.serviceType}</Text>
          {request.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>⚡ URGENTE</Text>
            </View>
          )}
        </View>
        <Text style={styles.description}>{request.description}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Valor Estimado</Text>
          <Text style={styles.priceValue}>R$ {request.estimatedPrice}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {isPending ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} disabled={isLoading}>
              <Text style={styles.declineBtnText}>Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.acceptBtnText}>Aceitar Serviço</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.chatBtn} 
            onPress={() => router.push(`/(provider)/chat/${id}?cid=${request.clientId}`)}
          >
            <Text style={styles.chatBtnText}>💬 Abrir Chat com Cliente</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerTitle: { fontFamily: typography.headline, fontSize: typography.sizes.titleMd, color: colors.onSurface },
  
  mapContainer: { height: 300, backgroundColor: colors.surfaceHigh, marginBottom: spacing.lg, overflow: "hidden" },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },

  detailsCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, marginHorizontal: spacing.xl, gap: spacing.md, ...shadows.float },
  serviceInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  urgentBadge: { backgroundColor: "#fff0e6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  urgentText: { fontFamily: typography.bodyBold, fontSize: 11, color: colors.warning },
  serviceType: { fontFamily: typography.display, fontSize: typography.sizes.titleMd, color: colors.onSurface, textTransform: "capitalize" },
  description: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22 },
  
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.surfaceHigh, paddingTop: spacing.md, marginTop: spacing.xs },
  priceLabel: { fontFamily: typography.body, fontSize: typography.sizes.bodySm, color: colors.onSurfaceMuted },
  priceValue: { fontFamily: typography.headline, fontSize: typography.sizes.titleSm, color: colors.primaryContainer },

  footer: { marginTop: "auto", paddingHorizontal: spacing.xl, paddingBottom: spacing["2xl"] },
  actions: { flexDirection: "row", gap: spacing.md },
  declineBtn: { flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: radius.full, paddingVertical: 18, alignItems: "center" },
  declineBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onSurfaceVariant },
  acceptBtn: { flex: 2, backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center" },
  acceptBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
  
  chatBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center", ...shadows.card },
  chatBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
});
