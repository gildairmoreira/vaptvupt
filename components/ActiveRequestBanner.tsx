import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, typography, radius, shadows, spacing } from "@/constants/theme";
import { useRequestStore } from "@/store/useRequestStore";
import { useProviderStore } from "@/store/useProviderStore";
import { useAuthStore } from "@/store/useAuthStore";

const screenWidth = Dimensions.get("window").width;

export function ActiveRequestBanner() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeRequest: clientReq } = useRequestStore();
  const { activeRequestId: providerReqId } = useProviderStore();

  const [isDismissed, setIsDismissed] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  // Reseta o estado quando a solicitação muda
  useEffect(() => {
    setIsDismissed(false);
    pan.setValue({ x: 0, y: 0 });
  }, [clientReq?.id, providerReqId]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Captura apenas se arrastar mais na horizontal do que na vertical
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        // Se arrastar mais que 40% da tela ou com velocidade alta, descarta
        if (Math.abs(gestureState.dx) > screenWidth * 0.4 || Math.abs(gestureState.vx) > 1.5) {
          Animated.timing(pan, {
            toValue: { x: gestureState.dx > 0 ? screenWidth : -screenWidth, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setIsDismissed(true);
          });
        } else {
          // Volta pra posição original
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (isDismissed) return null;

  // Lógica para Cliente
  if (user?.role === "client") {
    if (!clientReq) return null;
    const isAccepted = clientReq.status !== "pending";
    return (
      <Animated.View style={[styles.wrapper, { transform: [{ translateX: pan.x }] }]} {...panResponder.panHandlers}>
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
      </Animated.View>
    );
  }

  // Lógica para Prestador
  if (user?.role === "provider") {
    if (!providerReqId) return null;
    return (
      <Animated.View style={[styles.wrapper, { transform: [{ translateX: pan.x }] }]} {...panResponder.panHandlers}>
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
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60, // abaixo do header
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
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
