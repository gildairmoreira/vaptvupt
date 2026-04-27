import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { getProviderData, ProviderData } from "@/lib/database";

export default function MyServices() {
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const data = await getProviderData(user!.uid);
      setProvider(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primaryContainer} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Serviços</Text>
      </View>

      <FlatList
        data={provider?.categories || []}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Você ainda não anunciou nenhum serviço.</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => router.push("/(provider)/profile")}
            >
              <Text style={styles.addBtnText}>Anunciar Agora</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={{ fontSize: 24 }}>🛠️</Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item}</Text>
              <Text style={styles.servicePrice}>R$ {provider?.basePrice || 0} / base</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => router.push(`/(provider)/edit-service/${item}`)}
            >
              <Feather name="edit-2" size={18} color={colors.primaryContainer} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: typography.headline, fontSize: 20, color: colors.onSurface },
  list: { padding: spacing.xl },
  serviceCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.card },
  serviceIcon: { width: 50, height: 50, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  serviceInfo: { flex: 1 },
  serviceName: { fontFamily: typography.headline, fontSize: 16, color: colors.onSurface, textTransform: "capitalize" },
  servicePrice: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceVariant },
  editBtn: { padding: spacing.sm },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyText: { fontFamily: typography.body, fontSize: 16, color: colors.onSurfaceMuted, textAlign: "center", marginBottom: spacing.xl },
  addBtn: { backgroundColor: colors.primaryContainer, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.full },
  addBtnText: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.onPrimary },
});
