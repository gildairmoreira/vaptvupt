// Criar Anúncio de Serviço — Prestador — VaptVupt
// Passo 2/4 conforme protótipo: título, categoria, descrição, preço base
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { strings } from "@/constants/localization";
import { useAuthStore } from "@/store/useAuthStore";

const CATEGORIES = [
  { key: "plumbing", label: strings.categories.plumbing },
  { key: "electrical", label: strings.categories.electrical },
  { key: "cleaning", label: strings.categories.cleaning },
  { key: "painting", label: strings.categories.painting },
  { key: "assembly", label: strings.categories.assembly },
  { key: "carpentry", label: strings.categories.carpentry },
  { key: "aircon", label: strings.categories.aircon },
  { key: "gardening", label: strings.categories.gardening },
  { key: "other", label: strings.categories.other },
];

export default function CreateService() {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !category || !description.trim()) {
      Alert.alert("Atenção", "Preencha título, categoria e descrição.");
      return;
    }
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const serviceId = `${user.uid}_${Date.now()}`;
      await supabase.from("services").insert({
        id: serviceId,
        provider_id: user.uid,
        title: title.trim(),
        category,
        description: description.trim(),
        base_price: price ? parseFloat(price.replace(",", ".")) : null,
      });
      Alert.alert("Sucesso!", "Seu anúncio foi criado.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível criar o anúncio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Anúncio</Text>
        </View>

        {/* Progresso */}
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.progressStepDone]} />
          <View style={[styles.progressStep, styles.progressStepActive]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>
        <Text style={styles.progressLabel}>Passo 2 de 4 — Detalhes do serviço</Text>

        {/* Título */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Título do serviço *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Ex: Instalação elétrica residencial" placeholderTextColor={colors.onSurfacePlaceholder} style={styles.input} />
        </View>

        {/* Categoria */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Categoria *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c.key} style={[styles.catBtn, category === c.key && styles.catBtnActive]} onPress={() => setCategory(c.key)} activeOpacity={0.75}>
                <Text style={[styles.catBtnText, category === c.key && styles.catBtnTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Descrição *</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Descreva o serviço que você oferece..." placeholderTextColor={colors.onSurfacePlaceholder} style={[styles.input, styles.textarea]} multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        {/* Preço base */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Preço base (R$)</Text>
          <TextInput value={price} onChangeText={setPrice} placeholder="Ex: 150" placeholderTextColor={colors.onSurfacePlaceholder} style={styles.input} keyboardType="numeric" />
        </View>

        {/* Botão */}
        <TouchableOpacity style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]} onPress={handleSave} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryBtnText}>Salvar Anúncio</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing["2xl"] },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.base },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerTitle: { fontFamily: typography.headline, fontSize: typography.sizes.titleMd, color: colors.onSurface },
  progressBar: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceHighest },
  progressStepDone: { backgroundColor: colors.primaryContainer },
  progressStepActive: { backgroundColor: colors.primaryLight },
  progressLabel: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceMuted, marginBottom: spacing.xl },
  fieldGroup: { marginBottom: spacing.xl },
  fieldLabel: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurfaceVariant, fontWeight: "600", marginBottom: spacing.sm },
  input: { backgroundColor: colors.surfaceLowest, borderRadius: radius.md, paddingHorizontal: spacing.base, paddingVertical: 14, fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurface, ...shadows.card },
  textarea: { minHeight: 100 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catBtn: { backgroundColor: colors.surfaceLowest, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, ...shadows.card },
  catBtnActive: { backgroundColor: colors.primaryContainer },
  catBtnText: { fontFamily: typography.label, fontSize: typography.sizes.bodySm, color: colors.onSurface },
  catBtnTextActive: { color: colors.onPrimary },
  primaryBtn: { backgroundColor: colors.primaryContainer, borderRadius: radius.full, paddingVertical: 18, alignItems: "center", marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.titleSm, color: colors.onPrimary },
});
