// Ajuda e Suporte — VaptVupt (Prestador)
// Página genérica com FAQ do prestador, contato e informações de suporte

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";

// FAQ específico para prestadores
const FAQ_ITEMS = [
  {
    question: "Como criar um anúncio de serviço?",
    answer:
      "Vá até seu Perfil e toque em 'Criar Anúncio de Serviço'. Preencha título, categoria, descrição, preço e selecione sua localização base no mapa.",
  },
  {
    question: "Como funciona a disponibilidade?",
    answer:
      "No Dashboard, ative o toggle 'Ficar Disponível' para receber solicitações. Quando desligado, nenhum cliente verá você no mapa. Seu status é salvo e permanece entre sessões.",
  },
  {
    question: "Como aceitar solicitações?",
    answer:
      "Quando disponível, as solicitações aparecem no seu feed do Dashboard. Toque no card e depois em 'Aceitar Serviço' para confirmar. Você também pode recusar.",
  },
  {
    question: "Como concluir um serviço?",
    answer:
      "Após finalizar o trabalho, toque em 'Concluir Serviço' na tela de atendimento. O cliente será direcionado para pagar e avaliar seu serviço.",
  },
  {
    question: "Quando recebo meu pagamento?",
    answer:
      "Após o cliente confirmar o pagamento, 95% do valor é creditado na sua carteira. A plataforma retém 5% como taxa de serviço.",
  },
  {
    question: "Como melhorar minha avaliação?",
    answer:
      "Seja pontual, mantenha comunicação clara com o cliente e entregue um serviço de qualidade. Avaliações positivas aumentam sua visibilidade no mapa.",
  },
];

// Componente de item expansível do FAQ
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.onSurfaceVariant}
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpSupport() {
  const handleEmailSupport = () => {
    Linking.openURL("mailto:suporte@vaptvupt.com.br?subject=Suporte Prestador VaptVupt");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/5531999999999?text=Olá, sou prestador e preciso de ajuda");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
        </View>

        {/* Banner de Suporte */}
        <View style={styles.supportBanner}>
          <View style={styles.supportIconCircle}>
            <Feather name="life-buoy" size={32} color={colors.primaryContainer} />
          </View>
          <Text style={styles.supportTitle}>Central do Prestador</Text>
          <Text style={styles.supportSubtitle}>
            Tire suas dúvidas sobre o funcionamento da plataforma ou entre em contato conosco.
          </Text>
        </View>

        {/* Canais de contato */}
        <Text style={styles.sectionTitle}>Fale Conosco</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmailSupport}
            activeOpacity={0.8}
          >
            <View style={styles.contactIconWrap}>
              <Feather name="mail" size={22} color={colors.primaryContainer} />
            </View>
            <Text style={styles.contactLabel}>E-mail</Text>
            <Text style={styles.contactDesc}>suporte@vaptvupt.com.br</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: "#e8f5e9" }]}>
              <Feather name="message-circle" size={22} color="#4caf50" />
            </View>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactDesc}>Chat em tempo real</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
        <View style={styles.faqContainer}>
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>

        {/* Informações adicionais */}
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={colors.primaryContainer} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Horário de atendimento</Text>
            <Text style={styles.infoText}>
              Segunda a Sexta: 08:00 – 18:00{"\n"}
              Sábados: 08:00 – 12:00
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Feather name="percent" size={20} color={colors.primaryContainer} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Taxa da Plataforma</Text>
            <Text style={styles.infoText}>
              O VaptVupt cobra 5% sobre cada serviço concluído. O valor restante (95%) é creditado na sua carteira.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          VaptVupt v1.0.0 · © 2026 Todos os direitos reservados
        </Text>

        <View style={{ height: spacing["2xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing["2xl"] },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.base },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: typography.headline, fontSize: 20, color: colors.onSurface },
  supportBanner: { alignItems: "center", paddingVertical: spacing["2xl"], gap: spacing.md },
  supportIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer + "15", justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  supportTitle: { fontFamily: typography.display, fontSize: 24, color: colors.onSurface, textAlign: "center" },
  supportSubtitle: { fontFamily: typography.body, fontSize: 15, color: colors.onSurfaceVariant, textAlign: "center", lineHeight: 22, paddingHorizontal: spacing.xl },
  sectionTitle: { fontFamily: typography.headline, fontSize: 18, color: colors.onSurface, marginBottom: spacing.md, marginTop: spacing.md },
  contactRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  contactCard: { flex: 1, backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: spacing.base, alignItems: "center", gap: spacing.sm, ...shadows.card },
  contactIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryContainer + "15", justifyContent: "center", alignItems: "center" },
  contactLabel: { fontFamily: typography.headline, fontSize: 15, color: colors.onSurface },
  contactDesc: { fontFamily: typography.body, fontSize: 12, color: colors.onSurfaceMuted, textAlign: "center" },
  faqContainer: { backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, overflow: "hidden", marginBottom: spacing.xl, ...shadows.card },
  faqItem: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surfaceHigh },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { flex: 1, fontFamily: typography.bodyBold, fontSize: 15, color: colors.onSurface, marginRight: spacing.md },
  faqAnswer: { fontFamily: typography.body, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 22, marginTop: spacing.md },
  infoCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: spacing.base, gap: spacing.md, marginBottom: spacing.md, ...shadows.card },
  infoTitle: { fontFamily: typography.headline, fontSize: 15, color: colors.onSurface, marginBottom: 4 },
  infoText: { fontFamily: typography.body, fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 20 },
  footerText: { fontFamily: typography.body, fontSize: 12, color: colors.onSurfacePlaceholder, textAlign: "center", marginTop: spacing.xl },
});
