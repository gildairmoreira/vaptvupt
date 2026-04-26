// Root Layout — VaptVupt
// Inicializa fontes, Firebase Auth listener e define a estrutura de navegação

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { LogBox } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

// Previne splash screen de esconder antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

// Silencia logs desnecessários em dev
LogBox.ignoreLogs(["Warning:", "Possible Unhandled Promise"]);

export default function RootLayout() {
  const initAuthListener = useAuthStore((s) => s.initAuthListener);

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

  // Inicializa listener do Firebase Auth ao montar o app
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

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
