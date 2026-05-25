import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, typography, radius, shadows, spacing } from "@/constants/theme";
import { useRequestStore } from "@/store/useRequestStore";
import { useProviderStore } from "@/store/useProviderStore";
import { useAuthStore } from "@/store/useAuthStore";

export function ActiveRequestBanner() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeRequest: clientReq } = useRequestStore();
  const { activeRequestId: providerReqId } = useProviderStore();

  // Lógica para Cliente
  if (user?.role === "client") {
    if (!clientReq) return null;
    const isAccepted = clientReq.status !== "pending";
    return (
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => router.push(`/(client)/request/${clientReq.id}`)}
      >
        <View style={styles.iconContainer}>
          {isAccepted ? (
            <Feather name="check-circle" size={24} color={colors.primaryContainer} />
          ) : (
            <Feather name="loader" size={24} color={colors.onSurface} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isAccepted ? "Prestador a caminho!" : "Buscando prestador..."}
          </Text>
          <Text style={styles.subtitle}>
            Toque para acompanhar o status
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.onSurfaceVariant} />
      </TouchableOpacity>
    );
  }

  // Lógica para Prestador
  if (user?.role === "provider") {
    if (!providerReqId) return null;
    return (
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => router.push(`/(provider)/request/${providerReqId}`)}
      >
        <View style={styles.iconContainer}>
          <Feather name="map-pin" size={24} color={colors.primaryContainer} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Serviço em Andamento</Text>
          <Text style={styles.subtitle}>
            Toque para ver a rota ou abrir o chat
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.onSurfaceVariant} />
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // abaixo do header
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    ...shadows.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryContainer,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.headline,
    fontSize: 16,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
