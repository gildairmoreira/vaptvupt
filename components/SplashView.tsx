// SplashView — VaptVupt
// Tela de carregamento minimalista: apenas a logo centralizada em fundo branco

import React from "react";
import { View, StyleSheet, Image, Animated } from "react-native";

export default function SplashView() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/logo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
});
