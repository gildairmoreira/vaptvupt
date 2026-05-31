// Carteira do Prestador — VaptVupt (v1 — layout base)
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useProviderStore } from "@/store/useProviderStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function Wallet() {
  const { balance, loadBalance } = useProviderStore();
  const { user } = useAuthStore();

  // Carrega saldo real do banco ao abrir a carteira
  useEffect(() => {
    if (user?.uid) {
      loadBalance(user.uid);
    }
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{strings.wallet.title}</Text>

      {/* Card de saldo */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{strings.wallet.balance}</Text>
        <Text style={styles.balanceValue}>
          R$ {balance.toFixed(2).replace(".", ",")}
        </Text>
        <TouchableOpacity style={styles.withdrawBtn}>
          <Text style={styles.withdrawBtnText}>{strings.wallet.withdraw}</Text>
          <Text style={styles.withdrawBadge}>{strings.wallet.withdrawComingSoon}</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico vazio */}
      <Text style={styles.sectionTitle}>{strings.wallet.history}</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>💰</Text>
        <Text style={styles.emptyText}>{strings.wallet.noHistory}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface, paddingHorizontal: spacing.xl },
  title: { fontFamily: typography.display, fontSize: typography.sizes.titleLg, color: colors.onSurface, marginTop: spacing.base, marginBottom: spacing.xl },
  balanceCard: { backgroundColor: colors.primaryContainer, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl, alignItems: "center", gap: spacing.md, ...shadows.float },
  balanceLabel: { fontFamily: typography.label, fontSize: typography.sizes.bodyMd, color: "rgba(255,255,255,0.8)" },
  balanceValue: { fontFamily: typography.display, fontSize: 40, color: colors.onPrimary },
  withdrawBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.full },
  withdrawBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodyMd, color: colors.onPrimary },
  withdrawBadge: { backgroundColor: "rgba(255,255,255,0.3)", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, fontFamily: typography.label, fontSize: typography.sizes.caption, color: colors.onPrimary },
  sectionTitle: { fontFamily: typography.headline, fontSize: typography.sizes.titleSm, color: colors.onSurface, marginBottom: spacing.md },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceMuted, textAlign: "center" },
});
