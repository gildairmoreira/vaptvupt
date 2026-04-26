// Status da Solicitação em Tempo Real — Cliente — VaptVupt
// Inclui botão de Chat para conversar com o prestador

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useRequestStore } from "@/store/useRequestStore";

const STATUS_STEPS: Array<{ key: string; label: string }> = [
  { key: "pending", label: strings.request.status.pending },
  { key: "accepted", label: strings.request.status.accepted },
  { key: "on_the_way", label: strings.request.status.on_the_way },
  { key: "completed", label: strings.request.status.completed },
];

export default function RequestStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeRequest, subscribeToRequest, cancelRequest, selectedProvider } =
    useRequestStore();

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToRequest(id);
    return unsub;
  }, [id]);

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
    router.push(
      `/(client)/chat/${id}?pid=${activeRequest.providerId}` as never
    );
  };

  if (!activeRequest)
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActivityIndicator
          color={colors.primaryContainer}
          style={{ marginTop: 80 }}
        />
      </SafeAreaView>
    );

  const currentIdx = STATUS_STEPS.findIndex(
    (s) => s.key === activeRequest.status
  );

  // Redireciona para avaliação quando concluído
  if (activeRequest.status === "completed") {
    router.push(`/(client)/rate/${id}` as never);
    return null;
  }

  const isAccepted =
    activeRequest.status === "accepted" ||
    activeRequest.status === "on_the_way";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhamento</Text>
        {/* Botão de chat — aparece quando há prestador */}
        {isAccepted && activeRequest.providerId && (
          <TouchableOpacity
            onPress={handleOpenChat}
            style={styles.chatBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.chatBtnIcon}>💬</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CARD DE STATUS */}
      <View style={styles.statusCard}>
        <Text style={styles.statusEmoji}>
          {activeRequest.status === "pending"
            ? "⏳"
            : activeRequest.status === "accepted"
            ? "✅"
            : activeRequest.status === "on_the_way"
            ? "🏃"
            : "🎉"}
        </Text>
        <Text style={styles.statusTitle}>
          {strings.request.status[activeRequest.status]}
        </Text>
        <Text style={styles.statusDesc}>
          {strings.request.statusDesc[activeRequest.status]}
        </Text>

        {/* Badge URGENTE */}
        {activeRequest.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>
              ⚡ {strings.request.urgent}
            </Text>
          </View>
        )}
      </View>

      {/* TIMELINE */}
      <View style={styles.timeline}>
        {STATUS_STEPS.slice(0, 3).map((step, idx) => (
          <View key={step.key} style={styles.timelineStep}>
            <View
              style={[
                styles.timelineDot,
                idx <= currentIdx && styles.timelineDotActive,
              ]}
            />
            {idx < 2 && (
              <View
                style={[
                  styles.timelineLine,
                  idx < currentIdx && styles.timelineLineActive,
                ]}
              />
            )}
            <Text
              style={[
                styles.timelineLabel,
                idx <= currentIdx && styles.timelineLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {/* AÇÕES INFERIORES */}
      <View style={styles.actionsRow}>
        {/* Botão Chat — visível quando aceito */}
        {isAccepted && activeRequest.providerId && (
          <TouchableOpacity
            style={styles.chatFullBtn}
            onPress={handleOpenChat}
            activeOpacity={0.85}
          >
            <Text style={styles.chatFullBtnText}>
              💬 {strings.request.chat}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botão Cancelar — apenas quando pendente */}
        {activeRequest.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>{strings.request.cancelBtn}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.baseSurface,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.base,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerTitle: {
    flex: 1,
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleMd,
    color: colors.onSurface,
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtnIcon: { fontSize: 20 },

  // Status card
  statusCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.float,
  },
  statusEmoji: { fontSize: 56 },
  statusTitle: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleLg,
    color: colors.onSurface,
    textAlign: "center",
  },
  statusDesc: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
  },
  urgentBadge: {
    backgroundColor: "#fff0e6",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  urgentBadgeText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.warning,
    letterSpacing: 0.5,
  },

  // Timeline
  timeline: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  timelineStep: { alignItems: "center", flex: 1 },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
    marginBottom: spacing.xs,
  },
  timelineDotActive: { backgroundColor: colors.primaryContainer },
  timelineLine: {
    height: 2,
    width: "100%",
    backgroundColor: colors.surfaceHighest,
    position: "absolute",
    top: 7,
    left: "50%",
    zIndex: -1,
  },
  timelineLineActive: { backgroundColor: colors.primaryContainer },
  timelineLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.onSurfaceMuted,
    textAlign: "center",
  },
  timelineLabelActive: {
    color: colors.primaryContainer,
    fontFamily: typography.label,
  },

  // Ações
  actionsRow: {
    gap: spacing.md,
    marginTop: "auto",
    marginBottom: spacing["2xl"],
  },
  chatFullBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
  },
  chatFullBtnText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.titleSm,
    color: colors.onPrimary,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodyMd,
    color: colors.error,
  },
});
