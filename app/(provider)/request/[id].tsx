// Aceitar/Recusar solicitação — Prestador — VaptVupt
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { useProviderStore } from "@/store/useProviderStore";
import { subscribeRequest, ServiceRequest } from "@/lib/firestore";

export default function ProviderRequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { acceptRequest, declineRequest, isLoading } = useProviderStore();
  const [request, setRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeRequest(id, setRequest);
    return unsub;
  }, [id]);

  const handleAccept = async () => {
    if (!id || !user?.uid) return;
    await acceptRequest(id, user.uid);
    router.back();
  };

  const handleDecline = async () => {
    if (!id) return;
    await declineRequest(id);
    router.back();
  };

  if (!request) return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitação</Text>
      </View>

      <View style={styles.card}>
        {request.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>⚡ {strings.dashboard.urgentBadge}</Text>
          </View>
        )}
        <Text style={styles.serviceType}>{request.serviceType}</Text>
        <Text style={styles.description}>{request.description}</Text>
        {request.estimatedPrice && (
          <Text style={styles.price}>Valor estimado: R$ {request.estimatedPrice}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} disabled={isLoading}>
          <Text style={styles.declineBtnText}>{strings.dashboard.decline}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.acceptBtnText}>{strings.dashboard.acceptNow}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface, paddingHorizontal: spacing.xl },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.base },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerTitle: { fontFamily: typography.headline, fontSize: typography.sizes.titleMd, color: colors.onSurface },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, ...shadows.float },
  urgentBadge: { alignSelf: "flex-start", backgroundColor: "#fff0e6", paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  urgentText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.caption, color: colors.warning },
  serviceType: { fontFamily: typography.display, fontSize: typography.sizes.titleMd, color: colors.onSurface, textTransform: "capitalize" },
  description: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22 },
  price: { fontFamily: typography.headline, fontSize: typography.sizes.titleSm, color: colors.primaryContainer },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: "auto", paddingBottom: spacing["2xl"] },
  declineBtn: { flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: radius.full, paddingVertical: 18, alignItems: "center" },
  declineBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onSurfaceVariant },
  acceptBtn: { flex: 2, backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center" },
  acceptBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
});
