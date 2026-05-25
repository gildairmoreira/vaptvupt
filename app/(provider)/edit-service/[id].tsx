import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { getProviderData, updateProviderData, ProviderData } from "@/lib/database";

export default function EditService() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id é a categoria aqui
  const { user } = useAuthStore();
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const data = await getProviderData(user!.uid);
      if (data) {
        setPrice(data.basePrice.toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      await updateProviderData(user.uid, {
        basePrice: parseFloat(price) || 0
      });
      Alert.alert("Sucesso", "Seu serviço foi atualizado com sucesso!");
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primaryContainer} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar {id}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preço Base do Serviço (R$)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>R$</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0,00"
            />
          </View>
          <Text style={styles.helpText}>
            Este valor será exibido para os clientes ao buscarem por {id}.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: typography.headline, fontSize: 20, color: colors.onSurface, textTransform: "capitalize" },
  form: { padding: spacing.xl, gap: spacing["2xl"] },
  inputGroup: { gap: spacing.sm },
  label: { fontFamily: typography.headline, fontSize: 16, color: colors.onSurface },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceHigh, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 56 },
  currency: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.onSurfaceVariant, marginRight: spacing.xs },
  input: { flex: 1, fontFamily: typography.bodyBold, fontSize: 18, color: colors.onSurface },
  helpText: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceMuted, lineHeight: 20 },
  saveBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center", ...shadows.card },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.onPrimary },
});
