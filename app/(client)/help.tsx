// Ajuda e Suporte — VaptVupt (Cliente)
// Página genérica com FAQ, contato e informações de suporte

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

// Dados do FAQ organizados por seção
const FAQ_ITEMS = [
  {
    question: "Como solicitar um serviço?",
    answer:
      "Na tela inicial, toque em uma categoria ou use a busca para encontrar prestadores. Selecione o profissional desejado, adicione uma mensagem opcional e toque em 'Solicitar Serviço'.",
  },
  {
    question: "Como cancelar uma solicitação?",
    answer:
      "Na tela de acompanhamento da solicitação, toque em 'Cancelar Solicitação'. A ação é irreversível e o prestador será notificado.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Ao término do serviço, o prestador marca como concluído e você será direcionado para a tela de pagamento. Os valores são processados de forma segura pela plataforma.",
  },
  {
    question: "Como avaliar um prestador?",
    answer:
      "Após confirmar o pagamento, você pode avaliar o prestador com 1 a 5 estrelas e deixar um comentário opcional. Sua avaliação ajuda outros clientes a escolherem melhor.",
  },
  {
    question: "O que fazer se o prestador não aparecer?",
    answer:
      "Se o prestador não comparecer ou demorar além do esperado, você pode cancelar a solicitação e solicitar novamente com outro profissional. Entre em contato conosco pelo e-mail de suporte.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Utilizamos criptografia e boas práticas de segurança para proteger seus dados pessoais e de pagamento. Nunca compartilhamos suas informações sem seu consentimento.",
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
    Linking.openURL("mailto:suporte@vaptvupt.com.br?subject=Suporte VaptVupt");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/5531999999999?text=Olá, preciso de ajuda com o VaptVupt");
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
            <Feather name="headphones" size={32} color={colors.primaryContainer} />
          </View>
          <Text style={styles.supportTitle}>Como podemos te ajudar?</Text>
          <Text style={styles.supportSubtitle}>
            Confira as perguntas frequentes abaixo ou entre em contato com nossa equipe.
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
          <Feather name="shield" size={20} color={colors.primaryContainer} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Política de Privacidade</Text>
            <Text style={styles.infoText}>
              Seus dados são protegidos conforme a LGPD. Para mais detalhes, consulte nossos termos de uso.
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
  container: {
    flex: 1,
    backgroundColor: colors.baseSurface,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.base,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.headline,
    fontSize: 20,
    color: colors.onSurface,
  },

  // Banner de suporte
  supportBanner: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    gap: spacing.md,
  },
  supportIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  supportTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.onSurface,
    textAlign: "center",
  },
  supportSubtitle: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
  },

  // Seções
  sectionTitle: {
    fontFamily: typography.headline,
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },

  // Canais de contato
  contactRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.card,
  },
  contactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  contactLabel: {
    fontFamily: typography.headline,
    fontSize: 15,
    color: colors.onSurface,
  },
  contactDesc: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.onSurfaceMuted,
    textAlign: "center",
  },

  // FAQ
  faqContainer: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  faqItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHigh,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.onSurface,
    marginRight: spacing.md,
  },
  faqAnswer: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: spacing.md,
  },

  // Info cards
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  infoTitle: {
    fontFamily: typography.headline,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Footer
  footerText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
