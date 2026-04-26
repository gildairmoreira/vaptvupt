// Detalhe do Prestador — VaptVupt
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { useRequestStore } from "@/store/useRequestStore";
import { getProvider, getProviderReviews, ProviderData, Review } from "@/lib/database";
import { formatDistance, estimateETA, getDistanceKm } from "@/lib/geo";

export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { sendRequest, selectProvider, activeRequestId } = useRequestStore();

  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [providerData, reviewData, locResult] = await Promise.all([
        getProvider(id),
        getProviderReviews(id),
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null),
      ]);
      setProvider(providerData);
      setReviews(reviewData);
      if (locResult) setUserLocation([locResult.coords.latitude, locResult.coords.longitude]);
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleRequest = async () => {
    if (!user?.uid || !provider) return;
    if (!userLocation) {
      Alert.alert("Localização necessária", strings.errors.locationPermission);
      return;
    }
    setIsSending(true);
    try {
      selectProvider(provider);
      const requestId = await sendRequest(
        user.uid,
        { latitude: userLocation[0], longitude: userLocation[1] }
      );
      router.push(`/(client)/request/${requestId}`);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar sua solicitação. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );
  if (!provider) return null;

  const distance = userLocation && provider.location
    ? getDistanceKm(userLocation, [provider.location.latitude, provider.location.longitude])
    : null;
  const eta = distance !== null ? estimateETA(distance) : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header com back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {provider.photoUrl
              ? <Image source={{ uri: provider.photoUrl }} style={styles.avatar} />
              : <View style={styles.avatarPlaceholder}><Text style={{ fontSize: 56 }}>👷</Text></View>}
            {provider.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.badgesRow}>
            {provider.verified && (
              <View style={styles.bgOkBadge}>
                <Text style={styles.bgOkText}>✓ {strings.provider.backgroundOk}</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {provider.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({provider.reviewCount || 0} {strings.provider.ratings})</Text>
          </View>
        </View>

        {/* Chips de categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {provider.categories.map((c) => (
            <View key={c} style={styles.catChip}><Text style={styles.catChipText}>{c}</Text></View>
          ))}
        </ScrollView>

        {/* Cards de info */}
        <View style={styles.infoRow}>
          {provider.basePrice && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{strings.provider.basePrice}</Text>
              <Text style={styles.infoValue}>R$ {provider.basePrice}</Text>
            </View>
          )}
          {eta && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{strings.provider.eta}</Text>
              <Text style={styles.infoValue}>{eta}</Text>
            </View>
          )}
          {distance !== null && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Distância</Text>
              <Text style={styles.infoValue}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {provider.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>{strings.provider.bio}</Text>
            <Text style={styles.bioText}>{provider.bio}</Text>
          </View>
        )}

        {/* Avaliações */}
        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>{strings.provider.reviews}</Text>
            {reviews.slice(0, 3).map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <Text style={styles.reviewStars}>{"⭐".repeat(r.rating)}</Text>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão fixo de solicitar */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.requestBtn, (!provider.available || isSending) && styles.requestBtnDisabled]}
          onPress={handleRequest}
          disabled={!provider.available || isSending}
          activeOpacity={0.85}
        >
          {isSending
            ? <ActivityIndicator color={colors.onPrimary} />
            : <Text style={styles.requestBtnText}>
                {provider.available ? strings.provider.requestService : strings.provider.notAvailable}
              </Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl },
  header: { paddingTop: spacing.base, paddingBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 18, color: colors.onSurface },
  avatarSection: { alignItems: "center", paddingVertical: spacing.xl },
  avatarWrapper: { position: "relative", marginBottom: spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#f0e8e0", justifyContent: "center", alignItems: "center" },
  verifiedBadge: { position: "absolute", bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryContainer, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.surfaceLowest },
  verifiedBadgeText: { color: colors.onPrimary, fontSize: 14, fontFamily: typography.bodyBold },
  providerName: { fontFamily: typography.display, fontSize: typography.sizes.titleLg, color: colors.onSurface, textAlign: "center", marginBottom: spacing.sm },
  badgesRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  bgOkBadge: { backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  bgOkText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.caption, color: colors.onSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  ratingText: { fontFamily: typography.headline, fontSize: typography.sizes.bodyMd, color: colors.onSurface },
  reviewCount: { fontFamily: typography.body, fontSize: typography.sizes.bodySm, color: colors.onSurfaceMuted },
  categoriesRow: { marginBottom: spacing.xl },
  catChip: { backgroundColor: colors.surfaceHigh, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, marginRight: spacing.sm },
  catChipText: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurfaceVariant, textTransform: "capitalize" },
  infoRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  infoCard: { flex: 1, backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", gap: 4, ...shadows.card },
  infoLabel: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceMuted },
  infoValue: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onSurface },
  bioSection: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: typography.headline, fontSize: typography.sizes.bodyMd, color: colors.onSurface, marginBottom: spacing.sm },
  bioText: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22 },
  reviewsSection: { marginBottom: spacing.xl },
  reviewCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 4, ...shadows.card },
  reviewStars: { fontSize: 14 },
  reviewComment: { fontFamily: typography.body, fontSize: typography.sizes.bodySm, color: colors.onSurfaceVariant },
  ctaContainer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.xl, backgroundColor: "rgba(249,249,249,0.95)", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  requestBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center" },
  requestBtnDisabled: { opacity: 0.4 },
  requestBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
});
