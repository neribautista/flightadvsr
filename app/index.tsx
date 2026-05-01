// app/index.tsx — FlightAdvsr main AI chat screen
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { sendMessage, FlightResult, DestinationVisaInfo } from '@/services/aiService';
import FlightCard from '@/components/FlightCard';
import VisaBanner from '@/components/VisaBanner';
import PassportSelector from '@/components/PassportSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  flights?: FlightResult[];
  destinationVisa?: DestinationVisaInfo;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'New York → London',
  'Los Angeles → Tokyo',
  'Dubai → Singapore',
  'Paris → New York',
];

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  content: "Hello! I'm FlightAdvsr — your global AI flight companion.\n\nTell me where you'd like to fly and I'll search flights, check visa requirements for your passport, and flag any entry restrictions along the way.\n\nWhere would you like to go?",
  timestamp: new Date(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [passport, setPassport] = useState('US');
  const [showPassport, setShowPassport] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const history = [...messages, userMsg]
        .filter(m => m.id !== 'greeting')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendMessage(history, passport);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        flights: response.flights,
        destinationVisa: response.destinationVisa,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
      scrollToBottom();
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't connect. Please check your API key in .env.local and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, passport]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={styles.msgWrapper}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          {!isUser && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>FA</Text>
            </View>
          )}
          <View style={[styles.bubbleContent, isUser ? styles.bubbleContentUser : styles.bubbleContentAI]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
              {item.content}
            </Text>
          </View>
        </View>

        {item.destinationVisa && (
          <View style={styles.resultsContainer}>
            <VisaBanner visa={item.destinationVisa} />
          </View>
        )}

        {item.flights && item.flights.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>{item.flights.length} flights found</Text>
              <Text style={styles.resultsSub}>Prices per person · Economy</Text>
            </View>
            {item.flights.map(f => (
              <FlightCard key={f.id} flight={f} />
            ))}
          </View>
        )}
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Nav ── */}
        <View style={styles.navbar}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>FA</Text>
            </View>
            <View>
              <Text style={styles.navLogo}>
                Flight<Text style={styles.navAccent}>Advsr</Text>
              </Text>
              <Text style={styles.navSub}>Global AI flight advisor</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.passportBtn}
            onPress={() => setShowPassport(v => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.passportBtnIcon}>🛂</Text>
            <Text style={styles.passportBtnText}>{passport}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Passport panel ── */}
        {showPassport && (
          <View style={styles.passportPanel}>
            <Text style={styles.passportPanelTitle}>Your passport</Text>
            <PassportSelector
              value={passport}
              onChange={code => { setPassport(code); setShowPassport(false); }}
            />
            <Text style={styles.passportHint}>
              Visa requirements are calculated based on your passport.
            </Text>
          </View>
        )}

        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* ── Typing indicator ── */}
        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>FA</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={styles.typingText}>Searching flights & checking visa requirements…</Text>
            </View>
          </View>
        )}

        {/* ── Quick prompts ── */}
        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickScroll}
            contentContainerStyle={styles.quickContent}
          >
            {QUICK_PROMPTS.map(q => (
              <TouchableOpacity
                key={q}
                style={styles.quickChip}
                onPress={() => handleSend(q)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickChipIcon}>✈</Text>
                <Text style={styles.quickChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Where would you like to fly?"
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },

  // Nav
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navLogo: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  navAccent: { color: Colors.accent },
  navSub: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  passportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  passportBtnIcon: { fontSize: 13 },
  passportBtnText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Passport panel
  passportPanel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  passportPanelTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  passportHint: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 4,
  },

  // Messages
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  msgWrapper: { marginBottom: 18 },

  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bubbleUser: { flexDirection: 'row-reverse' },

  aiBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.accentDark,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  bubbleContent: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 13,
    borderWidth: 0.5,
  },
  bubbleContentAI: {
    backgroundColor: Colors.bgCard,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleContentUser: {
    backgroundColor: Colors.accentDeep,
    borderColor: Colors.borderActive,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  bubbleTextUser: { color: '#fff' },

  // Results
  resultsContainer: { marginTop: 12 },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
    paddingLeft: 2,
  },
  resultsTitle: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  resultsSub: {
    color: Colors.textMuted,
    fontSize: 11,
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  typingText: {
    color: Colors.textMuted,
    fontSize: 13,
  },

  // Quick prompts
  quickScroll: { maxHeight: 48 },
  quickContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  quickChipIcon: {
    fontSize: 11,
    color: Colors.accent,
  },
  quickChipText: {
    color: Colors.textSub,
    fontSize: 12,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accentDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
