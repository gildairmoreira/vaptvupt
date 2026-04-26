// Redirect inteligente baseado em auth state e role — VaptVupt
// Redireciona para onboarding, client home ou provider dashboard

import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { colors } from "@/constants/theme";
import SplashView from "@/components/SplashView";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Exibe spinner enquanto Firebase verifica sessão
  if (isLoading) {
    return <SplashView />;
  }

  // Não autenticado — vai para onboarding
  if (!isAuthenticated || !user) {
    return <Redirect href="/welcome" />;
  }

  // Autenticado — redireciona pela role
  if (user.role === "provider") {
    return <Redirect href="/(provider)" />;
  }

  return <Redirect href="/(client)" />;
}
