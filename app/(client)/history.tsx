// Histórico de Serviços — VaptVupt
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserRequests, ServiceRequest } from "@/lib/database";
import { Feather } from "@expo/vector-icons";
import { translateCategory } from "@/constants/localization";

const STATUS_MAP: Record<ServiceRequest["status"], string> = {
  pending: "Pendente",
  accepted: "Aceito",
  on_the_way: "A caminho",
  completed: "Concluído",
  canceled: "Cancelado",
};

export default function History() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const data = await getUserRequests(user.uid);
      setHistory(data);
      setIsLoading(false);
    };
    load();
  }, [user?.uid]);

  const activeRequests = history.filter(r => ['pending', 'accepted', 'on_the_way'].includes(r.status));
  const pastRequests = history.filter(r => !['pending', 'accepted', 'on_the_way'].includes(r.status));

  const renderRequest = (item: ServiceRequest) => {
    const isActive = ['pending', 'accepted', 'on_the_way'].includes(item.status);
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => isActive ? router.push(`/(client)/request/${item.id}`) : null}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardService}>{translateCategory(item.serviceType)}</Text>
          <View style={[styles.statusBadge, isActive && styles.statusBadgeActive]}>
            <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
              {isActive ? "Em Andamento" : "Concluído"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : "Hoje"}</Text>
          <Text style={styles.cardPrice}>R$ {item.estimatedPrice || "0,00"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{strings.tabs.history}</Text>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Feather name="clipboard" size={40} color={colors.primaryContainer} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum serviço ainda</Text>
          <Text style={styles.emptyText}>Você ainda não solicitou nenhum serviço no VaptVupt.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {activeRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Solicitações Ativas</Text>
              {activeRequests.map(r => renderRequest(r))}
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico Anterior</Text>
            {pastRequests.length > 0 ? (
              pastRequests.map(r => renderRequest(r))
            ) : (
              <Text style={styles.emptyPastText}>Nenhum serviço concluído ainda.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  scroll: { padding: spacing.xl },
  title: { fontFamily: typography.display, fontSize: 28, color: colors.onSurface, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, marginBottom: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: typography.headline, fontSize: 18, color: colors.onSurface, marginBottom: spacing.base },
  
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.card },
  cardActive: { borderColor: colors.primaryContainer, borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  cardService: { fontFamily: typography.headline, fontSize: 16, color: colors.onSurface, textTransform: "capitalize" },
  
  statusBadge: { backgroundColor: colors.surfaceHigh, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  statusBadgeActive: { backgroundColor: colors.primaryContainer + "20" },
  statusText: { fontFamily: typography.bodyBold, fontSize: 11, color: colors.onSurfaceVariant },
  statusTextActive: { color: colors.primaryContainer },
  
  cardDesc: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardDate: { fontFamily: typography.body, fontSize: 12, color: colors.onSurfaceMuted },
  cardPrice: { fontFamily: typography.headline, fontSize: 14, color: colors.onSurface },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingHorizontal: 40, marginTop: 100 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer + "15", justifyContent: "center", alignItems: "center", marginBottom: spacing.md },
  emptyTitle: { fontFamily: typography.headline, fontSize: 20, color: colors.onSurface },
  emptyText: { fontFamily: typography.body, fontSize: 15, color: colors.onSurfaceVariant, textAlign: "center" },
  emptyPastText: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceMuted, textAlign: "center", marginTop: spacing.md },
});
