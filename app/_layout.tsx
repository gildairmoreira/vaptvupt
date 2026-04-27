// Root Layout — VaptVupt
// Inicializa fontes, Firebase Auth listener e define a estrutura de navegação

import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { LogBox } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

// Previne splash screen de esconder antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

// Silencia logs desnecessários em dev
LogBox.ignoreLogs(["Warning:", "Possible Unhandled Promise"]);

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated, isLoading, initAuthListener } = useAuthStore();

  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Inicializa listener do Auth ao montar o app
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirecionamento global baseado em Auth
  useEffect(() => {
    if (!isMounted || isLoading || !loaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inWelcome = segments[0] === "welcome";

    if (!isAuthenticated && !inAuthGroup && !inWelcome) {
      // Se não autenticado e não está na pasta (auth) ou welcome, manda pro welcome
      router.replace("/welcome");
    } else if (isAuthenticated && (inAuthGroup || inWelcome)) {
      // Se autenticado e está no login/welcome, manda pro index (que redireciona por role)
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments, isMounted, loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(provider)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
