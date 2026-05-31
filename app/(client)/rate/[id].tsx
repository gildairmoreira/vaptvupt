import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings, translateCategory } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";
import { useProviderStore } from "@/store/useProviderStore";
import { saveReview, getProvider, ProviderData, getRequest, ServiceRequest, addProviderBalance } from "@/lib/database";
import { Feather } from "@expo/vector-icons";

export default function RateService() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { addBalance } = useProviderStore();

  const [step, setStep] = useState<"payment" | "rating">("payment");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [requestData, setRequestData] = useState<ServiceRequest | null>(null);

  // Carrega dados do prestador e da solicitação para exibição
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const req = await getRequest(id as string);
      if (req) {
        setRequestData(req);
        if (req.providerId) {
          const prov = await getProvider(req.providerId);
          setProvider(prov);
        }
      }
    };
    load();
  }, [id]);

  const handlePayment = () => {
    setIsLoading(true);
    // Simula delay de pagamento
    setTimeout(async () => {
      // Repassa 95% para o saldo do prestador no banco
      const price = requestData?.estimatedPrice || 100;
      const providerCut = price * 0.95;
      if (requestData?.providerId) {
        await addProviderBalance(requestData.providerId, providerCut);
      }
      
      setIsLoading(false);
      setStep("rating");
    }, 1200);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!user || !id) return;

    setIsLoading(true);
    try {
      await saveReview({
        requestId: id,
        clientId: user.uid,
        providerId: provider?.uid || "unknown",
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================
  // TELA DE SUCESSO — "Obrigado!"
  // ========================
  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successOuterCircle}>
            <View style={styles.successInnerCircle}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
          </View>
          <Text style={styles.successTitle}>{strings.rate.successTitle}</Text>
          <Text style={styles.successSubtitle}>{strings.rate.successSubtitle}</Text>

          <View style={styles.reviewedCard}>
            <View style={styles.reviewedAvatar}>
              {provider?.photoUrl ? (
                <Image source={{ uri: provider.photoUrl }} style={styles.reviewedAvatarImg} />
              ) : (
                <Text style={{ fontSize: 28 }}>👤</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewedName}>{provider?.name || "Prestador"}</Text>
              <Text style={styles.reviewedStars}>{"⭐".repeat(rating)}</Text>
            </View>
            <View style={styles.reviewedBadge}>
              <Text style={styles.reviewedBadgeText}>{strings.rate.reviewed}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(client)")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{strings.rate.backHome} →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========================
  // TELA DE PAGAMENTO
  // ========================
  if (step === "payment") {
    const price = requestData?.estimatedPrice || 100;
    
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pagamento do Serviço</Text>
          </View>

          <View style={styles.paymentCard}>
            <Text style={styles.paymentLabel}>Valor Total</Text>
            <Text style={styles.paymentAmount}>R$ {price.toFixed(2)}</Text>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Feather name="check-circle" size={16} color={colors.primaryContainer} />
              <Text style={styles.paymentDesc}>Serviço prestado por {provider?.name || "Profissional"}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Feather name="shield" size={16} color={colors.primaryContainer} />
              <Text style={styles.paymentDesc}>Pagamento 100% seguro pela plataforma</Text>
            </View>
          </View>

          <View style={styles.paymentMethods}>
            <Text style={styles.paymentLabel}>Método de Pagamento</Text>
            <View style={styles.methodOptionActive}>
              <Feather name="credit-card" size={24} color={colors.onSurface} />
              <Text style={styles.methodOptionText}>Cartão de Crédito (Mock)</Text>
              <Feather name="check-circle" size={20} color={colors.primaryContainer} style={{ marginLeft: "auto" }} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePayment}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Confirmar Pagamento</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ========================
  // TELA DE AVALIAÇÃO
  // ========================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(client)")} style={styles.backBtn}>
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{strings.rate.title}</Text>
        </View>

        <View style={styles.providerSection}>
          <View style={styles.avatarWrapper}>
            {provider?.photoUrl ? (
              <Image source={{ uri: provider.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ fontSize: 48 }}>👤</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓</Text>
            </View>
          </View>
          <Text style={styles.providerName}>{provider?.name || "Ricardo Mendonça"}</Text>
          <Text style={styles.providerCategory}>
            {provider?.categories?.[0] ? translateCategory(provider.categories[0]) : "Especialista"}
          </Text>
        </View>

        <View style={styles.starsCard}>
          <Text style={styles.starsQuestion}>{strings.rate.question}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} style={styles.starBtn}>
                <Text style={[styles.starIcon, star <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.tapHint}>{strings.rate.tap}</Text>
        </View>

        <Text style={styles.feedbackLabel}>{strings.rate.feedback}</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder={strings.rate.feedbackPlaceholder}
          placeholderTextColor={colors.onSurfacePlaceholder}
          style={styles.feedbackInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, rating === 0 && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryBtnText}>{strings.rate.submitBtn}</Text>
          )}
        </TouchableOpacity>
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
    paddingBottom: spacing["2xl"],
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 18,
    color: colors.onSurface,
  },
  headerTitle: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleMd,
    color: colors.onSurface,
  },

  // Prestador
  providerSection: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0e8e0",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
  verifiedBadgeText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontFamily: typography.bodyBold,
  },
  providerName: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  providerCategory: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
  },

  // Stars card
  starsCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  starsQuestion: {
    fontFamily: typography.label,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  starBtn: {
    padding: spacing.xs,
  },
  starIcon: {
    fontSize: 40,
    color: colors.surfaceHighest,
  },
  starActive: {
    color: colors.primaryContainer,
  },
  tapHint: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.primaryContainer,
  },

  // Feedback
  feedbackLabel: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  feedbackInput: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
    minHeight: 100,
    marginBottom: spacing.xl,
    ...shadows.card,
  },

  // Botão
  primaryBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.titleSm,
    color: colors.onPrimary,
  },

  // =========================
  // SUCCESS STATE
  // =========================
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
    gap: spacing.xl,
  },
  successOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fce4dc",
    justifyContent: "center",
    alignItems: "center",
  },
  successInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  successCheck: {
    fontSize: 32,
    color: colors.onPrimary,
    fontFamily: typography.bodyBold,
  },
  successTitle: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.onSurface,
    textAlign: "center",
  },
  successSubtitle: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    marginTop: -spacing.sm,
  },
  reviewedCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: spacing.md,
    ...shadows.card,
  },
  reviewedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  reviewedAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  reviewedName: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
  },
  reviewedStars: {
    fontSize: 14,
    marginTop: 2,
  },
  reviewedBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  reviewedBadgeText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.onSecondary,
    letterSpacing: 0.5,
  },

  // =========================
  // PAYMENT STATE
  // =========================
  paymentCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  paymentLabel: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceMuted,
    marginBottom: spacing.xs,
  },
  paymentAmount: {
    fontFamily: typography.display,
    fontSize: 36,
    color: colors.primaryContainer,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceHigh,
    marginVertical: spacing.md,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  paymentDesc: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  paymentMethods: {
    marginBottom: spacing["2xl"],
  },
  methodOptionActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceLowest,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    ...shadows.float,
  },
  methodOptionText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
  },
});
