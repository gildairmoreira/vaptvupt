// Tela de Login — VaptVupt
// Email + senha + Google OAuth + esqueci senha — conforme protótipo

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const { login, resetPassword, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Preencha email e senha para continuar.");
      return;
    }
    clearError();
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/");
    } catch {
      // Erro tratado na store — exibe no UI abaixo
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu email para receber o link de redefinição.");
      return;
    }
    try {
      await resetPassword(email.trim().toLowerCase());
      Alert.alert("Email enviado!", strings.auth.resetPasswordSent);
      setResetMode(false);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar o email.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoBox}>
            <Image
              source={require("../../assets/images/logo-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>{strings.appName}</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>
            {resetMode ? strings.auth.resetPassword : "Bem-vindo de volta"}
          </Text>
          <Text style={styles.subtitle}>
            {resetMode
              ? "Digite seu email para receber o link de redefinição"
              : "Entre na sua conta para continuar"}
          </Text>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{strings.auth.email}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={strings.auth.emailPlaceholder}
                placeholderTextColor={colors.onSurfacePlaceholder}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Senha */}
            {!resetMode && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{strings.auth.password}</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={strings.auth.passwordPlaceholder}
                    placeholderTextColor={colors.onSurfacePlaceholder}
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>

                {/* Esqueci senha */}
                <TouchableOpacity
                  onPress={() => setResetMode(true)}
                  style={styles.forgotBtn}
                >
                  <Text style={styles.forgotText}>{strings.auth.forgotPassword}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Erro */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Botão principal */}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
              onPress={resetMode ? handleResetPassword : handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {resetMode ? "Enviar link" : strings.auth.loginBtn}
                </Text>
              )}
            </TouchableOpacity>

            {/* Voltar do modo reset */}
            {resetMode && (
              <TouchableOpacity onPress={() => setResetMode(false)} style={styles.backBtn}>
                <Text style={styles.backText}>← Voltar para o login</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Link para cadastro */}
          {!resetMode && (
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>{strings.auth.noAccount} </Text>
              <TouchableOpacity onPress={() => router.push("/sign-up")}>
                <Text style={styles.signupLink}>{strings.auth.signupLink}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dev Bypass Buttons */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
            <TouchableOpacity onPress={() => { useAuthStore.getState().devBypass("client"); router.replace("/"); }} style={{ padding: 10, backgroundColor: "#e0e0e0", borderRadius: 8 }}>
              <Text style={{ fontFamily: typography.bodyBold }}>Mock Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { useAuthStore.getState().devBypass("provider"); router.replace("/"); }} style={{ padding: 10, backgroundColor: "#e0e0e0", borderRadius: 8 }}>
              <Text style={{ fontFamily: typography.bodyBold }}>Mock Prestador</Text>
            </TouchableOpacity>
          </View>

          {/* Termos */}
          <Text style={styles.terms}>
            {strings.auth.termsText}{" "}
            <Text style={styles.termsLink}>{strings.auth.terms}</Text>{" "}
            {strings.auth.and}{" "}
            <Text style={styles.termsLink}>{strings.auth.privacy}</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing["2xl"],
  },
  logo: {
    width: 36,
    height: 36,
  },
  appName: {
    fontFamily: typography.display,
    fontSize: typography.sizes.titleMd,
    color: colors.primaryContainer,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing["2xl"],
  },
  form: {
    gap: spacing.base,
  },
  inputWrapper: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodySm,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  forgotText: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodySm,
    color: colors.primaryContainer,
  },
  errorBox: {
    backgroundColor: "#ffebee",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.error,
  },
  primaryBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.titleSm,
    color: colors.onPrimary,
  },
  backBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  backText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.secondary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceHighest,
  },
  dividerText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodySm,
    color: colors.onSurfaceMuted,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.full,
    paddingVertical: 16,
    gap: spacing.sm,
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  googleIcon: {
    fontFamily: typography.bodyBold,
    fontSize: 20,
    color: colors.primaryContainer,
  },
  googleBtnText: {
    fontFamily: typography.label,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurface,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  signupText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
  },
  signupLink: {
    fontFamily: typography.bodyBold,
    fontSize: typography.sizes.bodyMd,
    color: colors.primaryContainer,
  },
  terms: {
    textAlign: "center",
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceMuted,
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.secondary,
    fontFamily: typography.label,
  },
});
