// Layout das tabs do prestador — VaptVupt
// Tabs: Dashboard | Solicitações | Carteira | Perfil

import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { colors, typography } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { Feather } from "@expo/vector-icons";

// Ícones vetorais (Feather)
function TabIcon({ name, focused, color }: { name: React.ComponentProps<typeof Feather>['name']; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Feather name={name} size={focused ? 24 : 22} color={color} style={{ opacity: focused ? 1 : 0.7 }} />
    </View>
  );
}

export default function ProviderLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryContainer,
        tabBarInactiveTintColor: colors.onSurfaceMuted,
        tabBarStyle: {
          backgroundColor: colors.surfaceLowest,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#1a1c1c",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.label,
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.dashboard,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="grid" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: strings.tabs.wallet,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="dollar-sign" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: strings.tabs.profile,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="user" focused={focused} color={color} />
          ),
        }}
      />
      {/* Telas sem tab */}
      <Tabs.Screen name="request/[id]" options={{ href: null }} />
      <Tabs.Screen name="service/create" options={{ href: null }} />
    </Tabs>
  );
}
