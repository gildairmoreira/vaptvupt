import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withDelay,
  withRepeat,
  withSequence,
  Easing
} from "react-native-reanimated";
import { colors, typography } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

export default function SplashView() {
  const logoY = useSharedValue(-height / 2);
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const headlineOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Logo dropping from top
    logoY.value = withSpring(0, { damping: 12, stiffness: 90 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });

    // Text animations with delay
    textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    headlineOpacity.value = withDelay(1400, withTiming(1, { duration: 1000 }));

    // Continuous pulse for the logo
    pulseScale.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    ));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: logoY.value },
      { scale: logoScale.value * pulseScale.value }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withTiming(textOpacity.value === 1 ? 0 : 20, { duration: 800 }) }]
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <Image
          source={require("../assets/images/logo-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.textContainer}>
        <Animated.Text style={[styles.brandText, textStyle]}>
          vaptvupt
        </Animated.Text>
        <Animated.Text style={[styles.headline, headlineStyle]}>
          Onde você acha quem você precisa na hora que você quer!
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <Animated.View style={[styles.loader, { opacity: textOpacity }]}>
          <View style={styles.loaderBar} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.baseSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  brandText: {
    fontFamily: typography.display,
    fontSize: 48,
    color: colors.primaryContainer,
    marginBottom: 12,
  },
  headline: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  loader: {
    width: 200,
    height: 4,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 2,
    overflow: "hidden",
  },
  loaderBar: {
    width: "40%",
    height: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 2,
  }
});
