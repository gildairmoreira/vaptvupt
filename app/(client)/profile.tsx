// Perfil dual-role — VaptVupt
// Toggle Modo Cliente ↔ Modo Prestador + edição de foto de perfil

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUser } from "@/lib/database";
import { updateProfilePhoto } from "@/lib/storage";
import { seedMockProviders } from "@/lib/seed";

import { Feather } from "@expo/vector-icons";

// Item de menu individual
function MenuItem({
  iconName,
  label,
  onPress,
  danger = false,
  badge,
}: {
  iconName: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <Feather name={iconName} size={20} color={danger ? colors.error : colors.onSurface} style={{ marginRight: 2 }} />
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={20} color={colors.onSurfaceMuted} />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { user, logout, updateUserData } = useAuthStore();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sair", strings.profile.logoutConfirm, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  const handleSwitchRole = async () => {
    if (!user) return;
    const newRole = user.role === "client" ? "provider" : "client";
    await updateUser(user.uid, { role: newRole });
    await updateUserData({ role: newRole });
    if (newRole === "provider") {
      router.replace("/(provider)" as never);
    } else {
      router.replace("/(client)" as never);
    }
  };

  const handleChangePhoto = async () => {
    if (!user?.uid) return;
    setIsUploadingPhoto(true);
    try {
      const newPhotoUrl = await updateProfilePhoto(user.uid);
      if (newPhotoUrl) {
        await updateUserData({ photoUrl: newPhotoUrl });
        Alert.alert("Sucesso", "Foto de perfil atualizada!");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a foto. Tente novamente.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const isProvider = user?.role === "provider";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>{strings.profile.title}</Text>

        {/* Card do usuário com avatar tocável */}
        <View style={styles.userCard}>
          <TouchableOpacity
            onPress={handleChangePhoto}
            style={styles.userAvatarWrapper}
            disabled={isUploadingPhoto}
            activeOpacity={0.8}
          >
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.userAvatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            {/* Overlay de câmera */}
            <View style={styles.cameraOverlay}>
              {isUploadingPhoto ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Feather name="camera" size={13} color={colors.onPrimary} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Usuário"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {isProvider ? "Prestador" : "Cliente"}
              </Text>
            </View>
          </View>
        </View>

        {/* Toggle de modo */}
        <TouchableOpacity
          style={styles.switchModeBtn}
          onPress={handleSwitchRole}
          activeOpacity={0.85}
        >
          <Feather name="refresh-cw" size={16} color={colors.primaryContainer} />
          <Text style={styles.switchModeText}>
            {isProvider
              ? strings.profile.modeToggleClient
              : strings.profile.modeToggle}
          </Text>
        </TouchableOpacity>

        {/* Seção: serviços */}
        <View style={styles.menuSection}>
          <MenuItem
            iconName="file-text"
            label={strings.profile.history}
            onPress={() => router.push("/(client)/history" as never)}
          />
          <MenuItem
            iconName="dollar-sign"
            label={strings.profile.wallet}
            onPress={() => {}}
            badge="Em breve"
          />
          <MenuItem
            iconName="credit-card"
            label={strings.profile.payments}
            onPress={() => {}}
            badge="Em breve"
          />
        </View>

        {/* Seção: suporte & Dev Tools */}
        <View style={styles.menuSection}>
          <MenuItem
            iconName="help-circle"
            label={strings.profile.help}
            onPress={() => {}}
          />
          <MenuItem
            iconName="cloud"
            label="Povoar Mapa (Dev Tool)"
            onPress={async () => {
              Alert.alert("Atenção", "Isso vai injetar 9 usuários de teste ao redor de você. Proceder?", [
                { text: "Cancelar", style: "cancel" },
                { 
                  text: "Sim", 
                  onPress: async () => {
                     try {
                       let lat = -23.5505;
                       let lng = -46.6333;
                       const { status } = await Location.requestForegroundPermissionsAsync();
                       if (status === "granted") {
                          const loc = await Location.getCurrentPositionAsync({});
                          lat = loc.coords.latitude;
                          lng = loc.coords.longitude;
                       }
                       const success = await seedMockProviders(lat, lng);
                       if (success) Alert.alert("Sucesso", "Mapa povoado! Volte para Início.");
                     } catch(e) { Alert.alert("Erro", "Falha."); }
                  }
                }
              ]);
            }}
          />
          <MenuItem
            iconName="log-out"
            label={strings.profile.logout}
            onPress={handleLogout}
            danger
          />
        </View>

        {/* Versão do app */}
        <Text style={styles.version}>VaptVupt v1.0.0 · Beta</Text>

        <View style={{ height: spacing["2xl"] }} />
      </ScrollView>
    </SafeAreaView>
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
  pageTitle: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.xl,
  },

  // Card do usuário
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  userAvatarWrapper: {
    position: "relative",
  },
  userAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  userAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarInitial: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleLg,
    color: colors.onPrimary,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
  cameraIcon: {
    fontSize: 13,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurface,
  },
  userEmail: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.onSurfaceMuted,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: 4,
  },
  roleBadgeText: {
    fontFamily: typography.label,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceVariant,
  },

  // Switch de modo
  switchModeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff5f2",
    borderRadius: radius.full,
    paddingVertical: 14,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  switchModeIcon: { fontSize: 18 },
  switchModeText: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodyMd,
    color: colors.primaryContainer,
  },

  // Menu sections
  menuSection: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.card,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 16,
    gap: spacing.md,
  },
  menuEmoji: { fontSize: 20 },
  menuLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
  },
  menuLabelDanger: { color: colors.error },
  menuBadge: {
    backgroundColor: colors.surfaceHighest,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  menuBadgeText: {
    fontFamily: typography.label,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceMuted,
  },
  menuArrow: {
    fontFamily: typography.body,
    fontSize: 20,
    color: colors.onSurfaceMuted,
  },

  // Footer
  version: {
    textAlign: "center",
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfacePlaceholder,
    marginTop: spacing.xl,
  },
});
