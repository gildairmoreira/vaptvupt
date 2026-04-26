// Splash Screen personalizada do VaptVupt
// Exibida enquanto Firebase verifica a sessão do usuário

import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SplashView() {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrada: fade + scale
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Pulsação suave após entrada
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo animada */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Indicador de carregamento */}
      <Animated.View style={[styles.dotsRow, { opacity: opacityAnim }]}>
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </Animated.View>
    </View>
  );
}

// Dot pulsante para indicar carregamento
function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={[styles.dot, { opacity: anim }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    position: "absolute",
    bottom: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d83900",
  },
});
