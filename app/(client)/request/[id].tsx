import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useRequestStore } from "@/store/useRequestStore";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const STATUS_STEPS: Array<{ key: string; label: string }> = [
  { key: "pending", label: strings.request.status.pending },
  { key: "accepted", label: strings.request.status.accepted },
  { key: "on_the_way", label: strings.request.status.on_the_way },
  { key: "completed", label: strings.request.status.completed },
];

export default function RequestStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeRequest, subscribeToRequest, cancelRequest } = useRequestStore();

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToRequest(id);
    return unsub;
  }, [id]);

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.6, 0.3, 0]),
  }));

  const handleMinimize = () => {
    router.push("/(client)" as never);
  };

  const handleCancel = () => {
    Alert.alert(strings.request.cancelConfirm, strings.request.cancelWarning, [
      { text: "Não", style: "cancel" },
      {
        text: "Cancelar",
        style: "destructive",
        onPress: async () => {
          if (id) await cancelRequest(id);
          router.replace("/(client)" as never);
        },
      },
    ]);
  };

  const handleOpenChat = () => {
    if (!id || !activeRequest?.providerId) return;
    router.push(`/(client)/chat/${id}?pid=${activeRequest.providerId}` as never);
  };

  if (!activeRequest)
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      </SafeAreaView>
    );

  if (activeRequest.status === "completed") {
    router.push(`/(client)/rate/${id}` as never);
    return null;
  }

  const isPending = activeRequest.status === "pending";
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === activeRequest.status);
  const isAccepted = activeRequest.status === "accepted" || activeRequest.status === "on_the_way";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleMinimize}>
          <Feather name="chevron-down" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhar Solicitação</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {isAccepted && (
            <TouchableOpacity onPress={handleOpenChat} style={styles.chatHeaderBtn}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isPending ? (
        <View style={styles.searchingContainer}>
          <View style={styles.pulseWrapper}>
            <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 50 }}>🛰️</Text>
            </View>
          </View>
          <Text style={styles.searchingTitle}>Buscando o melhor profissional...</Text>
          <Text style={styles.searchingSubtitle}>
            Enviamos sua solicitação para os prestadores mais próximos de você.
          </Text>
        </View>
      ) : (
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>
            {activeRequest.status === "accepted" ? "✅" : "🏃"}
          </Text>
          <Text style={styles.statusTitle}>
            {strings.request.status[activeRequest.status]}
          </Text>
          <Text style={styles.statusDesc}>
            {strings.request.statusDesc[activeRequest.status]}
          </Text>
          {activeRequest.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>⚡ URGENTE</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.timeline}>
        {STATUS_STEPS.slice(0, 3).map((step, idx) => (
          <View key={step.key} style={styles.timelineStep}>
            <View style={[styles.timelineDot, idx <= currentIdx && styles.timelineDotActive]} />
            {idx < 2 && <View style={[styles.timelineLine, idx < currentIdx && styles.timelineLineActive]} />}
            <Text style={[styles.timelineLabel, idx <= currentIdx && styles.timelineLabelActive]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        {isPending ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancelar Solicitação</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.chatFullBtn} onPress={handleOpenChat}>
            <Text style={styles.chatFullBtnText}>💬 Conversar com o Prestador</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface, paddingHorizontal: spacing.xl },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.base },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerTitle: { flex: 1, fontFamily: typography.headline, fontSize: typography.sizes.titleMd, color: colors.onSurface },
  chatHeaderBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },

  searchingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.xl },
  pulseWrapper: { width: 120, height: 120, justifyContent: "center", alignItems: "center", marginBottom: spacing["2xl"] },
  pulseCircle: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryContainer },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceLowest, justifyContent: "center", alignItems: "center", ...shadows.float },
  searchingTitle: { fontFamily: typography.display, fontSize: 22, color: colors.onSurface, textAlign: "center", marginBottom: spacing.sm },
  searchingSubtitle: { fontFamily: typography.body, fontSize: 16, color: colors.onSurfaceVariant, textAlign: "center", lineHeight: 22 },

  statusCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing["2xl"], alignItems: "center", gap: spacing.md, marginBottom: spacing.xl, ...shadows.float },
  statusEmoji: { fontSize: 56 },
  statusTitle: { fontFamily: typography.display, fontSize: typography.sizes.titleLg, color: colors.onSurface, textAlign: "center" },
  statusDesc: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceVariant, textAlign: "center", lineHeight: 22 },
  urgentBadge: { backgroundColor: "#fff0e6", paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full },
  urgentBadgeText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.caption, color: colors.warning, letterSpacing: 0.5 },

  timeline: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", marginBottom: spacing.xl },
  timelineStep: { alignItems: "center", flex: 1 },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.surfaceHighest, marginBottom: spacing.xs },
  timelineDotActive: { backgroundColor: colors.primaryContainer },
  timelineLine: { height: 2, width: "100%", backgroundColor: colors.surfaceHighest, position: "absolute", top: 7, left: "50%", zIndex: -1 },
  timelineLineActive: { backgroundColor: colors.primaryContainer },
  timelineLabel: { fontFamily: typography.body, fontSize: 11, color: colors.onSurfaceMuted, textAlign: "center" },
  timelineLabelActive: { color: colors.primaryContainer, fontFamily: typography.label },

  footer: { gap: spacing.md, marginTop: "auto", marginBottom: spacing["2xl"] },
  chatFullBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 16, alignItems: "center" },
  chatFullBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
  cancelBtn: { borderWidth: 1, borderColor: colors.error, borderRadius: radius.full, paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodyMd, color: colors.error },
});
