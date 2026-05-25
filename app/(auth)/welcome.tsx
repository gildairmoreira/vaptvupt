// Onboarding — VaptVupt
// 4 slides conforme protótipos: Welcome, Express, Confiança, CTA final

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing 
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";

const { width, height } = Dimensions.get("window");

// ========================
// DADOS DOS SLIDES (conforme protótipos)
// ========================
const slides = [
  {
    id: 1,
    type: "welcome",
  },
  {
    id: 2,
    type: "express",
  },
  {
    id: 3,
    type: "trust",
  },
  {
    id: 4,
    type: "cta",
  },
];

// ========================
// COMPONENTE PRINCIPAL
// ========================
export default function Welcome() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentIndex(next);
    } else {
      router.replace("/sign-in");
    }
  };

  const skip = () => {
    router.replace("/sign-in");
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Conteúdo scrollável horizontal */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        style={{ flex: 1 }}
      >
        {/* SLIDE 1 — Welcome */}
        <SlideWelcome />
        {/* SLIDE 2 — Express */}
        <SlideExpress />
        {/* SLIDE 3 — Confiança e Qualidade */}
        <SlideTrust />
        {/* SLIDE 4 — CTA Final */}
        <SlideCTA />
      </ScrollView>

      {/* FOOTER FIXO: dots + botão + pular */}
      <View style={styles.footer}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
          <Text style={styles.counter}>{currentIndex + 1}/{slides.length}</Text>
        </View>

        {/* Botão principal */}
        <TouchableOpacity style={styles.primaryBtn} onPress={goToNext} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>
            {isLast ? strings.onboarding.start : `${strings.onboarding.next} →`}
          </Text>
        </TouchableOpacity>

        {/* Link pular */}
        {!isLast && (
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>{strings.onboarding.skip}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ========================
// SLIDE 1 — WELCOME
// ========================
function SlideWelcome() {
  return (
    <View style={[styles.slide, { backgroundColor: colors.baseSurface }]}>
      <View style={styles.logoCard}>
        <Image
          source={require("../../assets/images/logo-icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.headlineNormal}>{strings.onboarding.slide1.title}</Text>
        <Text style={styles.headlineBrand}>{strings.onboarding.slide1.titleBrand}</Text>
        <Text style={styles.subtitle}>{strings.onboarding.slide1.subtitle}</Text>
      </View>
    </View>
  );
}

// ========================
// SLIDE 2 — EXPRESS (Agilidade)
// ========================
function SlideExpress() {
  return (
    <View style={[styles.slide, { backgroundColor: colors.baseSurface }]}>
      <View style={styles.slideHeader}>
        <Image
          source={require("../../assets/images/logo-icon.png")}
          style={styles.bigLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.imageCardContainer}>
        <View style={styles.imageCard}>
          <View style={styles.expressBadge}>
            <Feather name="zap" size={14} color={colors.onSurface} />
            <Text style={styles.expressBadgeText}>{strings.onboarding.slide2.badge}</Text>
          </View>
          <View style={styles.scooterBg}>
            <Feather name="truck" size={64} color={colors.onSurfaceVariant} />
          </View>
          <View style={styles.etaBadge}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="map-pin" size={12} color={colors.onSecondary} />
              <Text style={styles.etaBadgeText}>{strings.onboarding.slide2.etaBadge}</Text>
            </View>
          </View>
        </View>
        <View style={styles.imageCardShadow} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.headlineNormal}>{strings.onboarding.slide2.title}</Text>
        <Text style={styles.headlineBrand}>{strings.onboarding.slide2.titleHighlight}</Text>
        <Text style={styles.subtitle}>{strings.onboarding.slide2.subtitle}</Text>
      </View>
    </View>
  );
}

// ========================
// SLIDE 3 — CONFIANÇA E QUALIDADE
// ========================
function SlideTrust() {
  return (
    <View style={[styles.slide, { backgroundColor: colors.baseSurface }]}>
      <View style={styles.slideHeader}>
        <Image
          source={require("../../assets/images/logo-icon.png")}
          style={styles.bigLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.trustContainer}>
        <View style={[styles.providerMiniCard, styles.cardLeft]}>
          <View style={styles.providerMiniAvatar}>
            <Feather name="user" size={20} color={colors.onSurfaceVariant} />
          </View>
          <View>
            <Text style={styles.providerMiniName}>Ricardo S.</Text>
            <Text style={styles.providerMiniRating}>⭐ 4.9</Text>
          </View>
          <View style={styles.bgOkBadge}>
            <Text style={styles.bgOkText}>
              <Feather name="check" size={12} color={colors.onSurface} /> {strings.onboarding.slide3.badge1}
            </Text>
          </View>
        </View>

        <View style={styles.verifiedCenter}>
          <Feather name="check" size={24} color={colors.onPrimary} />
        </View>

        <View style={[styles.providerMiniCard, styles.cardRight]}>
          <View style={styles.providerMiniAvatar}>
            <Feather name="user" size={20} color={colors.onSurfaceVariant} />
          </View>
          <View>
            <Text style={styles.providerMiniName}>Mariana L.</Text>
            <Text style={styles.verifiedLabel}>{strings.onboarding.slide3.badge2}</Text>
          </View>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.headlineNormal, { fontSize: 26 }]}>
          {strings.onboarding.slide3.title}
        </Text>
        <Text style={styles.subtitle}>{strings.onboarding.slide3.subtitle}</Text>
      </View>
    </View>
  );
}

// ========================
// SLIDE 4 — CTA FINAL
// ========================
function SlideCTA() {
  const rocketY = useSharedValue(0);

  useEffect(() => {
    rocketY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    );
  }, []);

  const rocketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rocketY.value }],
  }));

  return (
    <View style={[styles.slide, { backgroundColor: "#fff5f0" }]}>
      <Animated.View style={[styles.ctaIconContainer, rocketStyle]}>
        <Feather name="arrow-up-right" size={80} color={colors.primaryContainer} />
      </Animated.View>
      <View style={styles.textBlock}>
        <Text style={styles.headlineNormal}>{strings.onboarding.slide4.title}</Text>
        <Text style={styles.headlineBrand}>{strings.onboarding.slide4.titleHighlight}</Text>
        <Text style={styles.subtitle}>{strings.onboarding.slide4.subtitle}</Text>
      </View>
    </View>
  );
}

// ========================
// ESTILOS
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.baseSurface,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: "center",
  },
  slideHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  smallLogo: {
    width: 80,
    height: 28,
  },
  bigLogo: {
    width: 120,
    height: 40,
  },

  // Logo card (slide 1)
  logoCard: {
    width: 180,
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: colors.baseSurface,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing["2xl"],
    marginBottom: spacing["2xl"],
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  logoImage: {
    width: 120,
    height: 120,
  },

  // Express slide — card de imagem
  imageCardContainer: {
    width: "100%",
    height: 240,
    marginBottom: spacing.xl,
    position: "relative",
  },
  imageCard: {
    width: "90%",
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: "#e8f0e8",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  imageCardShadow: {
    position: "absolute",
    bottom: -12,
    left: 0,
    width: "80%",
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceHighest,
    zIndex: -1,
  },
  scooterBg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d4e8c2",
  },
  expressBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    zIndex: 10,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  expressBadgeIcon: {
    fontSize: 14,
  },
  expressBadgeText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.label,
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
  etaBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    zIndex: 10,
  },
  etaBadgeText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.bodySm,
    color: colors.onSecondary,
  },

  // Trust slide — cards de prestadores
  trustContainer: {
    width: "100%",
    height: 220,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
    position: "relative",
  },
  providerMiniCard: {
    position: "absolute",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: "70%",
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLeft: {
    top: 0,
    left: 0,
  },
  cardRight: {
    bottom: 0,
    right: 0,
  },
  providerMiniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  providerMiniName: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
  },
  providerMiniRating: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.onSurfaceVariant,
  },
  bgOkBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  bgOkText: {
    fontFamily: typography.bodyBold,
    fontSize: 11,
    color: colors.onSecondary,
  },
  ratingBar: {
    height: 4,
    backgroundColor: colors.primaryContainer,
    borderRadius: 2,
    marginTop: spacing.sm,
    width: "100%",
  },
  verifiedCenter: {
    position: "absolute",
    top: "30%",
    left: "30%",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  verifiedLabel: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  ratingRows: {
    marginTop: spacing.xs,
    gap: 4,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingLabel: {
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceVariant,
  },
  ratingValue: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.primaryContainer,
  },

  // CTA slide
  ctaIconContainer: {
    marginTop: spacing["3xl"],
    marginBottom: spacing["2xl"],
  },

  // Texto compartilhado
  textBlock: {
    width: "100%",
    paddingHorizontal: spacing.sm,
  },
  headlineNormal: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.onSurface,
    lineHeight: 36,
  },
  headlineBrand: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primaryContainer,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: spacing.sm,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? spacing.base : spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primaryContainer,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.surfaceHighest,
  },
  counter: {
    marginLeft: "auto",
    fontFamily: typography.label,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceMuted,
  },
  primaryBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.titleSm,
    color: colors.onPrimary,
  },
  skipBtn: {
    alignItems: "center",
    paddingBottom: spacing.sm,
  },
  skipText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceMuted,
  },
});
