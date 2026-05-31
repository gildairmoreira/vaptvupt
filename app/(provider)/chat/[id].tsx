// Chat em Tempo Real — VaptVupt (Provider)
// Mesma interface do chat do cliente, reutilizada para o prestador

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getOrCreateChat,
  sendMessage,
  subscribeMessages,
  markMessagesRead,
  ChatMessage,
  getUser,
  UserData,
} from "@/lib/database";

export default function ProviderChatScreen() {
  const { id: requestId, cid: clientId } = useLocalSearchParams<{
    id: string;
    cid: string;
  }>();
  const { user } = useAuthStore();

  const QUICK_REPLIES = [
    "Estou a caminho!",
    "Chego em 5 minutos.",
    "Pode me confirmar o endereço?",
    "Pode mandar uma foto do problema?",
    "Já estou no local."
  ];

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Inicializa o chat — para o provider, o "outro" é o cliente
  useEffect(() => {
    const init = async () => {
      if (!requestId || !user?.uid) return;

      const provId = user.uid;
      const cId = clientId || 'mock-client-1';

      // Cria ou busca chat existente
      const cid = await getOrCreateChat(requestId, cId, provId);
      setChatId(cid);

      // Carrega dados do cliente
      const other = await getUser(cId);
      setOtherUser(other);

      setIsLoading(false);
    };
    init();
  }, [requestId, clientId, user]);

  // Escuta mensagens em tempo real
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    if (user?.uid) {
      markMessagesRead(chatId, user.uid);
    }

    return unsubscribe;
  }, [chatId, user?.uid]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !chatId || !user) return;

    setInputText("");
    setIsSending(true);
    try {
      await sendMessage(chatId, {
        chatId,
        senderId: user.uid,
        senderName: user.name,
        text,
        read: false,
      });
    } catch {
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, chatId, user]);

  const formatTime = (createdAt: any): string => {
    if (!createdAt) return "";
    try {
      const date = new Date(createdAt);
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActivityIndicator
          color={colors.primaryContainer}
          style={{ marginTop: 80 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={colors.onSurface} />
        </TouchableOpacity>

        <View style={styles.headerUserInfo}>
          <View style={styles.headerAvatar}>
            {otherUser?.photoUrl ? (
              <Image source={{ uri: otherUser.photoUrl }} style={styles.headerAvatarImg} />
            ) : (
              <Text style={styles.headerAvatarInitial}>
                {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.headerName}>
              {otherUser?.name || "Carregando..."}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="user" size={10} color={colors.onSurfaceMuted} />
              <Text style={styles.headerRole}>Cliente</Text>
            </View>
          </View>
        </View>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>ao vivo</Text>
        </View>
      </View>

      {/* LISTA DE MENSAGENS */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Feather name="message-circle" size={48} color={colors.onSurfaceMuted} />
            <Text style={styles.emptyChatText}>
              Nenhuma mensagem ainda.{"\n"}Diga olá para começar!
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isOwn = item.senderId === user?.uid;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showAvatar = !isOwn && prevMsg?.senderId !== item.senderId;
          const showTime =
            index === messages.length - 1 ||
            messages[index + 1]?.senderId !== item.senderId;

          return (
            <View
              style={[
                styles.messageRow,
                isOwn ? styles.messageRowOwn : styles.messageRowOther,
              ]}
            >
              {!isOwn && (
                <View style={styles.msgAvatar}>
                  {showAvatar ? (
                    <Text style={styles.msgAvatarText}>
                      {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  ) : null}
                </View>
              )}

              <View style={styles.messageBubbleWrapper}>
                <View
                  style={[
                    styles.messageBubble,
                    isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isOwn ? styles.messageTextOwn : styles.messageTextOther,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>

                {showTime && (
                  <View
                    style={[
                      styles.messageMetaRow,
                      isOwn ? styles.messageMetaOwn : styles.messageMetaOther,
                    ]}
                  >
                    <Text style={styles.messageTime}>
                      {formatTime(item.createdAt)}
                    </Text>
                    {isOwn && (
                      <Feather 
                        name={item.read ? "check-circle" : "check"} 
                        size={10} 
                        color={colors.onSurfaceMuted} 
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* QUICK REPLIES */}
      <View style={{ backgroundColor: colors.baseSurface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesContent}>
          {QUICK_REPLIES.map(reply => (
            <TouchableOpacity key={reply} style={styles.quickReplyChip} onPress={() => handleQuickReply(reply)}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* INPUT */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputBar}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor={colors.onSurfacePlaceholder}
            style={styles.textInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isSending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Feather name="send" size={18} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.baseSurface },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLowest, gap: spacing.sm, ...shadows.card,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center",
  },
  headerUserInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryContainer, justifyContent: "center",
    alignItems: "center", overflow: "hidden",
  },
  headerAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarInitial: { fontFamily: typography.bodyBold, fontSize: typography.sizes.bodyMd, color: colors.onPrimary },
  headerName: { fontFamily: typography.headline, fontSize: typography.sizes.bodyMd, color: colors.onSurface },
  headerRole: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceMuted },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4caf50" },
  liveText: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceMuted },
  messagesList: { flexGrow: 1, paddingHorizontal: spacing.base, paddingVertical: spacing.md, gap: 4 },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: spacing.md },
  emptyChatText: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, color: colors.onSurfaceMuted, textAlign: "center", lineHeight: 22 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 2 },
  messageRowOwn: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceHigh, justifyContent: "center", alignItems: "center", marginRight: spacing.xs },
  msgAvatarText: { fontFamily: typography.bodyBold, fontSize: typography.sizes.caption, color: colors.onSurfaceVariant },
  messageBubbleWrapper: { maxWidth: "75%", gap: 2 },
  messageBubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
  messageBubbleOwn: { backgroundColor: colors.primaryContainer, borderBottomRightRadius: 4 },
  messageBubbleOther: { backgroundColor: colors.surfaceLowest, borderBottomLeftRadius: 4, ...shadows.card },
  messageText: { fontFamily: typography.body, fontSize: typography.sizes.bodyMd, lineHeight: 20 },
  messageTextOwn: { color: colors.onPrimary },
  messageTextOther: { color: colors.onSurface },
  messageMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  messageMetaOwn: { justifyContent: "flex-end" },
  messageMetaOther: { justifyContent: "flex-start" },
  messageTime: { fontFamily: typography.body, fontSize: typography.sizes.caption, color: colors.onSurfaceMuted },
  inputBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    backgroundColor: colors.surfaceLowest, gap: spacing.sm, ...shadows.card,
  },
  textInput: {
    flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontFamily: typography.body, fontSize: 16, color: colors.onSurface,
    maxHeight: 100, minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryContainer, justifyContent: "center", alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: colors.surfaceHigh, opacity: 0.5 },
  quickRepliesContent: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  quickReplyChip: { backgroundColor: colors.surfaceLowest, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.surfaceHigh, marginRight: spacing.sm },
  quickReplyText: { fontFamily: typography.body, fontSize: 14, color: colors.onSurface },
});
