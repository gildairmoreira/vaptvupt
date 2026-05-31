// Perfil do Prestador — VaptVupt (reutiliza estrutura do perfil do cliente)
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { updateUser } from "@/lib/database";

export default function ProviderProfile() {
  const { user, logout, updateUserData } = useAuthStore();
  const { mapProvider, toggleMapProvider } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert("Sair", strings.profile.logoutConfirm, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => await logout() },
    ]);
  };

  const handleSwitchToClient = async () => {
    if (!user) return;
    await updateUser(user.uid, { role: "client" });
    await updateUserData({ role: "client" });
    router.replace("/(client)");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.profile.title}</Text>

        {/* Card usuário */}
        <View style={styles.userCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() || "P"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name || "Prestador"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>🔧 Prestador</Text></View>
          </View>
        </View>

        {/* Switch para modo cliente */}
        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchToClient} activeOpacity={0.85}>
          <Text style={styles.switchBtnText}>🔄 {strings.profile.modeToggleClient}</Text>
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={toggleMapProvider}>
            <Text style={styles.menuEmoji}>🗺️</Text>
            <Text style={styles.menuLabel}>Mapa: {mapProvider === "osm" ? "OpenStreetMap" : "Google Maps"}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(provider)/service/create")}>
            <Text style={styles.menuEmoji}>➕</Text>
            <Text style={styles.menuLabel}>Criar Anúncio de Serviço</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(provider)/help" as never)}>
            <Text style={styles.menuEmoji}>❓</Text>
            <Text style={styles.menuLabel}>{strings.profile.help}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuEmoji}>🚪</Text>
            <Text style={[styles.menuLabel, { color: colors.error }]}>{strings.profile.logout}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.base },
  title: { fontFamily: typography.display, fontSize: typography.sizes.titleLg, color: colors.onSurface, marginBottom: spacing.xl },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, gap: spacing.md, ...shadows.card },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryContainer, justifyContent: "center", alignItems: "center" },
  avatarInitial: { fontFamily: typography.display, fontSize: typography.sizes.titleLg, color: colors.onPrimary },
  userName: { fontFamily: typography.headline, fontSize: typography.sizes.titleSm, color: colors.onSurface },
  userEmail: { fontFamily: typography.body, fontSize: typography.sizes.bodySm, color: colors.onSurfaceMuted },
  roleBadge: { alignSelf: "flex-start", backgroundColor: colors.surfaceHigh, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, marginTop: 4 },
  roleBadgeText: { fontFamily: typography.label, fontSize: typography.sizes.caption, color: colors.onSurfaceVariant },
  switchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fff5f2", borderRadius: radius.full, paddingVertical: 14, marginBottom: spacing.xl },
  switchBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodyMd, color: colors.primaryContainer },
  menu: { backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, marginBottom: spacing.md, overflow: "hidden", ...shadows.card },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.base, paddingVertical: 16, gap: spacing.md },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurface },
  menuArrow: { fontFamily: typography.body, fontSize: 20, color: colors.onSurfaceMuted },
});
