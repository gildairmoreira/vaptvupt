// Histórico de Serviços — VaptVupt
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { getClientHistory, ServiceRequest } from "@/lib/database";
import { Feather } from "@expo/vector-icons";

const STATUS_MAP: Record<ServiceRequest["status"], string> = {
  pending: "Pendente",
  accepted: "Aceito",
  on_the_way: "A caminho",
  completed: "Concluído",
  canceled: "Cancelado",
};

export default function History() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const data = await getClientHistory(user.uid);
      setHistory(data);
      setIsLoading(false);
    };
    load();
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{strings.tabs.history}</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clipboard" size={48} color={colors.onSurfaceMuted} />
          <Text style={styles.emptyText}>Nenhum serviço no histórico ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardService}>{item.serviceType}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.cardStatus}>{STATUS_MAP[item.status]}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  title: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleLg,
    color: colors.onSurface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing["2xl"] },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: spacing.xs,
    ...shadows.card,
  },
  cardService: { fontFamily: typography.headline, fontSize: typography.sizes.bodyMd, color: colors.onSurface, textTransform: "capitalize" },
  cardDesc: { fontFamily: typography.body, fontSize: typography.sizes.bodySm, color: colors.onSurfaceVariant },
  cardStatus: { fontFamily: typography.label, fontSize: typography.sizes.caption, color: colors.primaryContainer },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceMuted },
});
