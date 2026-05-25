// Dashboard do Prestador — VaptVupt
// Toggle de disponibilidade + métricas + feed de solicitações em tempo real

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { useProviderStore } from "@/store/useProviderStore";
import { ServiceRequest } from "@/lib/database";

export default function ProviderDashboard() {
  const { user } = useAuthStore();
  const {
    isAvailable,
    pendingRequests,
    balance,
    todayServices,
    avgRating,
    isLoading,
    toggleAvailability,
    startListening,
  } = useProviderStore();

  const [refreshing, setRefreshing] = useState(false);

  // Inicia listener de solicitações pendentes
  useEffect(() => {
    const unsubscribe = startListening();
    return unsubscribe;
  }, []);

  const handleToggle = async () => {
    if (!user?.uid) return;
    await toggleAvailability(user.uid);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const firstName = user?.name?.split(" ")[0] || "Prestador";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primaryContainer}
          />
        }
      >
        {/* ======================== */}
        {/* HEADER */}
        {/* ======================== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName}</Text>
            <Text style={styles.subGreeting}>Seu painel de controle</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <TouchableOpacity 
              onPress={() => router.push("/(provider)/my-services")}
              style={styles.headerActionBtn}
            >
              <Feather name="tool" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(provider)/profile")}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || "P"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================== */}
        {/* TOGGLE DE DISPONIBILIDADE */}
        {/* ======================== */}
        <View style={[styles.toggleCard, isAvailable && styles.toggleCardActive]}>
          <View>
            <Text style={[styles.toggleTitle, isAvailable && styles.toggleTitleActive]}>
              {isAvailable
                ? strings.dashboard.availableToggle
                : strings.dashboard.unavailableToggle}
            </Text>
            <Text style={styles.toggleSubtitle}>
              {isAvailable
                ? "Você está recebendo solicitações"
                : "Ative para receber pedidos próximos"}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggle}
            trackColor={{
              false: colors.surfaceHighest,
              true: `${colors.primaryContainer}60`,
            }}
            thumbColor={isAvailable ? colors.primaryContainer : colors.surfaceHigh}
          />
        </View>

        {/* ======================== */}
        {/* MÉTRICAS DO DIA */}
        {/* ======================== */}
        <Text style={styles.sectionTitle}>Hoje</Text>
        <View style={styles.metricsRow}>
          <MetricCard
            label="Saldo (Carteira)"
            value={`R$ ${balance.toFixed(2).replace(".", ",")}`}
            iconName="dollar-sign"
            highlight
          />
          <MetricCard
            label={strings.dashboard.completedServices}
            value={`${todayServices}`}
            iconName="check-circle"
          />
          <MetricCard
            label={strings.dashboard.avgRating}
            value={avgRating > 0 ? avgRating.toFixed(1) : "–"}
            iconName="star"
          />
        </View>

        {/* ======================== */}
        {/* FEED DE SOLICITAÇÕES */}
        {/* ======================== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{strings.dashboard.pendingRequests}</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </View>

        {!isAvailable && (
          <View style={styles.offlineNote}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="zap" size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.offlineNoteText}>
                Ative sua disponibilidade para receber solicitações
              </Text>
            </View>
          </View>
        )}

        {pendingRequests.length === 0 && isAvailable && (
          <View style={styles.emptyBox}>
            <Feather name="bell" size={40} color={colors.onSurfaceMuted} />
            <Text style={styles.emptyText}>{strings.dashboard.noRequests}</Text>
          </View>
        )}

        {pendingRequests.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            onPress={() => router.push(`/(provider)/request/${req.id}`)}
          />
        ))}

        <View style={{ height: spacing["2xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ========================
// COMPONENTE MÉTRICA
// ========================
function MetricCard({
  label,
  value,
  iconName,
  highlight = false,
}: {
  label: string;
  value: string;
  iconName: React.ComponentProps<typeof Feather>['name'];
  highlight?: boolean;
}) {
  return (
    <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
      <Feather name={iconName} size={22} color={highlight ? colors.primaryContainer : colors.onSurfaceVariant} />
      <Text style={[styles.metricValue, highlight && styles.metricValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// ========================
// COMPONENTE REQUEST CARD
// ========================
function RequestCard({
  request,
  onPress,
}: {
  request: ServiceRequest;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.requestCard} onPress={onPress} activeOpacity={0.85}>
      {/* Badges */}
      <View style={styles.requestBadgesRow}>
        {request.isUrgent && (
          <View style={styles.urgentBadge}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Feather name="zap" size={11} color={colors.warning} />
              <Text style={styles.urgentBadgeText}>{strings.dashboard.urgentBadge}</Text>
            </View>
          </View>
        )}
        <View style={styles.statusBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Feather name="clock" size={11} color={colors.onSurfaceVariant} />
            <Text style={styles.statusBadgeText}>Pendente</Text>
          </View>
        </View>
      </View>

      {/* Info do serviço */}
      <Text style={styles.requestService}>{request.serviceType}</Text>
      <Text style={styles.requestDesc} numberOfLines={2}>{request.description}</Text>

      {/* Rodapé com valor e CTA */}
      <View style={styles.requestFooter}>
        {request.estimatedPrice && (
          <Text style={styles.requestPrice}>
            R$ {request.estimatedPrice.toFixed(0)}
          </Text>
        )}
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onPress}>
            <Text style={styles.acceptBtnText}>{strings.dashboard.acceptNow}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.baseSurface,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  greeting: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleLg,
    color: colors.onSurface,
  },
  subGreeting: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.onSurfaceMuted,
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.titleSm,
    color: colors.onPrimary,
  },

  // Toggle de disponibilidade
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  toggleCardActive: {
    backgroundColor: "#fff5f2",
  },
  toggleTitle: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurfaceVariant,
  },
  toggleTitleActive: {
    color: colors.primaryContainer,
  },
  toggleSubtitle: {
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceMuted,
    marginTop: 3,
  },

  // Métricas
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: 4,
    ...shadows.card,
  },
  metricCardHighlight: {
    backgroundColor: "#fff5f2",
  },
  metricEmoji: {
    fontSize: 24,
  },
  metricValue: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleMd,
    color: colors.onSurface,
  },
  metricValueHighlight: {
    color: colors.primaryContainer,
  },
  metricLabel: {
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceMuted,
    textAlign: "center",
  },
  countBadge: {
    backgroundColor: colors.primaryContainer,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  countBadgeText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.onPrimary,
  },

  // Offline note
  offlineNote: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  offlineNoteText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },

  // Empty
  emptyBox: {
    alignItems: "center",
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceMuted,
    textAlign: "center",
  },

  // Request cards
  requestCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  requestBadgesRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  urgentBadge: {
    backgroundColor: "#fff0e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  urgentBadgeText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.warning,
    letterSpacing: 0.3,
  },
  statusBadge: {
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceVariant,
  },
  requestService: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
    textTransform: "capitalize",
  },
  requestDesc: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  requestPrice: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurface,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acceptBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  acceptBtnText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.bodySm,
    color: colors.onPrimary,
  },
});
