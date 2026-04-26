// Tela de Cadastro — VaptVupt
// Nome, email, senha + seleção visual de role (Cliente ou Prestador)

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

type Role = "client" | "provider";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, isLoading, error, clearError } = useAuthStore();

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Atenção", strings.errors.nameRequired);
      return;
    }
    if (!email.trim()) {
      Alert.alert("Atenção", strings.errors.emailRequired);
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Atenção", strings.errors.passwordShort);
      return;
    }
    if (!role) {
      Alert.alert("Atenção", strings.errors.roleRequired);
      return;
    }
    clearError();
    try {
      await signup(name.trim(), email.trim().toLowerCase(), password, role);
      router.replace("/");
    } catch {
      // Erro tratado na store
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/logo-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Criar sua conta</Text>
          <Text style={styles.subtitle}>Junte-se ao VaptVupt e encontre os melhores serviços</Text>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Nome */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{strings.auth.name}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={strings.auth.namePlaceholder}
                placeholderTextColor={colors.onSurfacePlaceholder}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

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
            </View>

            {/* Seleção de Role */}
            <View style={styles.roleBlock}>
              <Text style={styles.roleTitle}>{strings.auth.chooseRole}</Text>
              <View style={styles.rolePicker}>
                {/* Card Cliente */}
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    role === "client" && styles.roleCardActive,
                  ]}
                  onPress={() => setRole("client")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.roleEmoji}>👤</Text>
                  <Text style={[styles.roleLabel, role === "client" && styles.roleLabelActive]}>
                    {strings.auth.roleClient}
                  </Text>
                  <Text style={[styles.roleSubLabel, role === "client" && styles.roleSubLabelActive]}>
                    {strings.auth.roleClientSub}
                  </Text>
                  {role === "client" && (
                    <View style={styles.roleCheck}>
                      <Text style={styles.roleCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Card Prestador */}
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    role === "provider" && styles.roleCardActive,
                  ]}
                  onPress={() => setRole("provider")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.roleEmoji}>🔧</Text>
                  <Text style={[styles.roleLabel, role === "provider" && styles.roleLabelActive]}>
                    {strings.auth.roleProvider}
                  </Text>
                  <Text style={[styles.roleSubLabel, role === "provider" && styles.roleSubLabelActive]}>
                    {strings.auth.roleProviderSub}
                  </Text>
                  {role === "provider" && (
                    <View style={styles.roleCheck}>
                      <Text style={styles.roleCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Erro */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Botão criar conta */}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>{strings.auth.signupBtn}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link para login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{strings.auth.hasAccount} </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text style={styles.loginLink}>{strings.auth.loginLink}</Text>
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
    paddingTop: spacing.base,
    paddingBottom: spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: colors.onSurface,
  },
  logo: {
    width: 32,
    height: 32,
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

  // Seleção de role
  roleBlock: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  roleTitle: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurface,
  },
  rolePicker: {
    flexDirection: "row",
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: "center",
    position: "relative",
    shadowColor: "#1a1c1c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  roleCardActive: {
    backgroundColor: "#fff5f2",
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  roleLabel: {
    fontFamily: typography.headline,
    fontSize: typography.sizes.titleSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  roleLabelActive: {
    color: colors.primaryContainer,
  },
  roleSubLabel: {
    fontFamily: typography.body,
    fontSize: typography.sizes.caption,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    marginTop: 2,
  },
  roleSubLabelActive: {
    color: colors.primaryContainer,
  },
  roleCheck: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  roleCheckText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontFamily: typography.bodyBold,
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  loginText: {
    fontFamily: typography.body,
    fontSize: typography.sizes.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loginLink: {
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
