// app/index.tsx — FlightAdvsr Dashboard UI
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, SafeAreaView, Modal, Dimensions, Animated,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { sendMessage, FlightResult, DestinationVisaInfo } from '@/services/aiService';
import FlightCard from '@/components/FlightCard';
import VisaBanner from '@/components/VisaBanner';
import PassportSelector from '@/components/PassportSelector';

const { width: SCREEN_W } = Dimensions.get('window');
const IS_TABLET = SCREEN_W >= 768;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  flights?: FlightResult[];
  destinationVisa?: DestinationVisaInfo;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'JFK → LHR', query: 'JFK → LHR' },
  { label: 'LAX → NRT', query: 'LAX → NRT' },
  { label: 'DXB → SIN', query: 'DXB → SIN' },
  { label: 'CDG → JFK', query: 'CDG → JFK' },
];

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  content: "Hello! I'm FlightAdvsr AI — your global flight companion. Ask me about flights, visa requirements, or passport rules.",
  timestamp: new Date(),
};

const STAT_CARDS = [
  { label: 'Avg Fare',    value: '$482', sub: '↓ 12% this week', subColor: '#f87171' },
  { label: 'Routes',      value: '1.2K', sub: '↑ Live results',  subColor: '#22c55e' },
  { label: 'Visa-Free',   value: '63%',  sub: 'US passport',     subColor: '#94a3b8' },
  { label: 'Saved Today', value: '$0.09',sub: 'vs. avg price',   subColor: '#94a3b8' },
];

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard' },
];

const DEMO_FLIGHTS: FlightResult[] = [
  {
    id: 'demo1',
    airline: 'American Airlines',
    airlineCode: 'AA',
    cabinClass: 'Economy',
    price: 489,
    departTime: '08:00',
    arriveTime: '20:15',
    fromCode: 'JFK',
    toCode: 'LHR',
    duration: '7h 15m',
    stops: [],
    deepLink: 'https://aa.com',
  },
  {
    id: 'demo2',
    airline: 'Emirates',
    airlineCode: 'EK',
    cabinClass: 'Economy',
    price: 612,
    departTime: '10:30',
    arriveTime: '06:00',
    fromCode: 'JFK',
    toCode: 'NRT',
    duration: '14h 30m',
    stops: [
      {
        airportCode: 'DXB',
        airport: 'Dubai Intl',
        layoverDuration: '4h 10m',
        visaStatus: 'visa_free',
        visaNote: 'US passport: transit without visa',
      },
    ],
    deepLink: 'https://emirates.com',
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  activeNav, onNav, passport, onPassportPress,
}: {
  activeNav: number;
  onNav: (i: number) => void;
  passport: string;
  onPassportPress: () => void;
}) {
  return (
    <View style={s.sidebar}>
      <View style={s.sidebarLogo}>
        <View style={s.logoMark}><Text style={s.logoMarkText}>FA</Text></View>
        <Text style={s.logoName}>Flight<Text style={s.logoAccent}>Advsr</Text></Text>
      </View>
      <ScrollView style={s.navScroll} showsVerticalScrollIndicator={false}>
        <Text style={s.navSectionLabel}>Main</Text>
        {NAV_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[s.navItem, activeNav === i && s.navItemActive]}
            onPress={() => onNav(i)}
            activeOpacity={0.7}
          >
            <Text style={s.navIcon}>{item.icon}</Text>
            <Text style={[s.navLabel, activeNav === i && s.navLabelActive]}>{item.label}</Text>
            {item.badge && (
              <View style={s.navBadge}><Text style={s.navBadgeText}>{item.badge}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={s.passportWidget} onPress={onPassportPress} activeOpacity={0.7}>
        <Text style={s.passportFlag}>🛂</Text>
        <View style={s.passportWidgetInfo}>
          <Text style={s.passportWidgetLabel}>Passport</Text>
          <Text style={s.passportWidgetValue}>{passport}</Text>
        </View>
        <Text style={s.passportChevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={[s.statSub, { color: subColor }]}>{sub}</Text>
    </View>
  );
}

// ── Visa Info Card ────────────────────────────────────────────────────────────
function VisaInfoCard({
  flag, country, status, statusColor, statusBg, note, priceRange, onAskAI,
}: {
  flag: string; country: string; status: string; statusColor: string;
  statusBg: string; note: string; priceRange: string; onAskAI: () => void;
}) {
  return (
    <View style={s.visaInfoCard}>
      <View style={s.visaInfoTop}>
        <Text style={s.visaInfoFlag}>{flag}</Text>
        <View style={s.visaInfoMid}>
          <Text style={s.visaInfoCountry}>{country}</Text>
          <Text style={s.visaInfoNote}>{note}</Text>
        </View>
        <View style={[s.visaStatusBadge, { backgroundColor: statusBg }]}>
          <Text style={[s.visaStatusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
      <View style={s.visaInfoBottom}>
        <Text style={s.visaPrice}>{priceRange}</Text>
        <TouchableOpacity style={s.askAiBtn} onPress={onAskAI} activeOpacity={0.7}>
          <Text style={s.askAiBtnText}>Ask AI ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Right Panel ───────────────────────────────────────────────────────────────
function RightPanel({ passport, onAskAI }: { passport: string; onAskAI: (q: string) => void }) {
  return (
    <View style={s.rightPanel}>
      <View style={[s.rightCard, s.featuredCard]}>
        <Text style={s.featuredEyebrow}>✈  Featured Deal</Text>
        <Text style={s.featuredTitle}>Tokyo via Emirates</Text>
        <Text style={s.featuredSub}>Best price this week · Via Dubai (DXB) · 4h layover</Text>
        <Text style={s.featuredPrice}>$612</Text>
        <Text style={s.featuredPriceSub}>or 29,099 miles</Text>
      </View>

      <View style={s.rightCard}>
        <Text style={s.rightCardTitle}>Passport Intelligence</Text>
        <Text style={s.rightCardSub}>{passport} passport grants:</Text>
        {[
          { label: 'Visa-free countries', value: '186', color: '#22c55e' },
          { label: 'e-Visa eligible',     value: '20',  color: '#fbbf24' },
          { label: 'Visa on arrival',     value: '34',  color: '#fbbf24' },
        ].map(row => (
          <View key={row.label} style={s.passportRow}>
            <Text style={s.passportRowLabel}>{row.label}</Text>
            <Text style={[s.passportRowValue, { color: row.color }]}>{row.value}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={s.rightCardBtn}
          onPress={() => onAskAI(`Which countries can I visit visa-free with my ${passport} passport?`)}
          activeOpacity={0.7}
        >
          <Text style={s.rightCardBtnText}>Ask AI about my passport ↗</Text>
        </TouchableOpacity>
      </View>

      <View style={s.rightCard}>
        <Text style={s.rightCardTitle}>Recent Activity</Text>
        {[
          { code: 'BA', route: 'JFK → LHR · British Air',    time: '2h ago', price: '$541', bg: Colors.accentDark },
          { code: 'SQ', route: 'LAX → SIN · Singapore Air',  time: '5h ago', price: '$892', bg: '#1a2500' },
        ].map((item, i) => (
          <View key={item.code} style={[s.activityRow, i === 1 && { borderBottomWidth: 0 }]}>
            <View style={[s.activityLogo, { backgroundColor: item.bg }]}>
              <Text style={s.activityCode}>{item.code}</Text>
            </View>
            <View style={s.activityInfo}>
              <Text style={s.activityRoute}>{item.route}</Text>
              <Text style={s.activityTime}>{item.time}</Text>
            </View>
            <Text style={s.activityPrice}>{item.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ item }: { item: Message }) {
  const isUser = item.role === 'user';
  return (
    <View style={cs.msgWrapper}>
      <View style={[cs.bubble, isUser ? cs.bubbleUser : cs.bubbleAI]}>
        {!isUser && (
          <View style={cs.aiBadge}><Text style={cs.aiBadgeText}>FA</Text></View>
        )}
        <View style={[cs.bubbleContent, isUser ? cs.bubbleContentUser : cs.bubbleContentAI]}>
          <Text style={[cs.bubbleText, isUser && cs.bubbleTextUser]}>{item.content}</Text>
        </View>
      </View>
      {item.destinationVisa && (
        <View style={cs.resultsContainer}>
          <VisaBanner visa={item.destinationVisa} />
        </View>
      )}
      {item.flights && item.flights.length > 0 && (
        <View style={cs.resultsContainer}>
          <Text style={cs.resultsTitle}>{item.flights.length} flights found</Text>
          {item.flights.map(f => <FlightCard key={f.id} flight={f} />)}
        </View>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [activeNav, setActiveNav] = useState(0);
  const [passport, setPassport] = useState('US');
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(600)).current;

  const openChat = useCallback(() => {
    setChatOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 80, friction: 10,
    }).start();
  }, [slideAnim]);

  const closeChat = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 600, duration: 220, useNativeDriver: true,
    }).start(() => setChatOpen(false));
  }, [slideAnim]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text || chatInput).trim();
    if (!userText || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const history = [...messages, userMsg]
        .filter(m => m.id !== 'greeting')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendMessage(history, passport);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        flights: response.flights,
        destinationVisa: response.destinationVisa,
        timestamp: new Date(),
      }]);
      scrollToBottom();
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [chatInput, loading, messages, passport, scrollToBottom]);

  const handleAskAI = useCallback((query: string) => {
    if (!chatOpen) {
      openChat();
      setTimeout(() => handleSend(query), 400);
    } else {
      handleSend(query);
    }
  }, [chatOpen, openChat, handleSend]);

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;
    openChat();
    setTimeout(() => handleSend(searchText), 400);
  }, [searchText, openChat, handleSend]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.root}>

        {/* Sidebar — tablet only */}
        {IS_TABLET && (
          <Sidebar
            activeNav={activeNav}
            onNav={setActiveNav}
            passport={passport}
            onPassportPress={() => setShowPassportModal(true)}
          />
        )}

        {/* Main column */}
        <View style={s.main}>

          {/* Top nav */}
          <View style={s.topnav}>
            {!IS_TABLET ? (
              <View style={s.logoRow}>
                <View style={s.logoMark}><Text style={s.logoMarkText}>FA</Text></View>
                <Text style={s.logoName}>Flight<Text style={s.logoAccent}>Advsr</Text></Text>
              </View>
            ) : (
              <Text style={s.topnavTitle}>Dashboard</Text>
            )}
            <View style={s.topnavRight}>
              <TouchableOpacity
                style={s.topnavPassportBtn}
                onPress={() => setShowPassportModal(true)}
                activeOpacity={0.7}
              >
                <Text style={s.topnavPassportIcon}>🛂</Text>
                <Text style={s.topnavPassportText}>{passport}</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Dashboard body */}
          <View style={s.body}>
            <ScrollView
              style={s.scrollMain}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Search */}
              <View style={s.searchSection}>
                <Text style={s.sectionHeading}>Search Flights</Text>
                <View style={s.searchRow}>
                  <TextInput
                    style={s.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="e.g. JFK to LHR, New York to Tokyo"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                  />
                  <TouchableOpacity style={s.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
                    <Text style={s.searchBtnText}>✈ Search</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={s.chipRow}>
                    {['All', 'Nonstop', 'Cheapest', 'Visa-Free', 'Economy', 'Business'].map((c, i) => (
                      <View key={c} style={[s.chip, i === 0 && s.chipActive]}>
                        <Text style={[s.chipText, i === 0 && s.chipTextActive]}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                {STAT_CARDS.map(card => <StatCard key={card.label} {...card} />)}
              </View>

              {/* Flight Results */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Flight Results</Text>
                <View style={s.sectionDots}>
                  <View style={[s.dot, s.dotActive]} /><View style={s.dot} /><View style={s.dot} />
                </View>
              </View>
              <View style={s.flightsGrid}>
                {DEMO_FLIGHTS.map(f => <FlightCard key={f.id} flight={f} />)}
              </View>

              {/* Visa Intelligence */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Visa Intelligence</Text>
                <View style={s.sectionDots}>
                  <View style={[s.dot, s.dotActive]} /><View style={s.dot} /><View style={s.dot} />
                </View>
              </View>
              <View style={s.visaGrid}>
                <VisaInfoCard
                  flag="🇹🇭" country="Thailand" status="Visa-free"
                  statusColor="#22c55e" statusBg="rgba(34,197,94,0.12)"
                  note="US passport: up to 30 days without a visa."
                  priceRange="$231 – $888"
                  onAskAI={() => handleAskAI('Thailand visa and flights for US passport')}
                />
                <VisaInfoCard
                  flag="🇯🇵" country="Japan" status="Visa-free"
                  statusColor="#22c55e" statusBg="rgba(34,197,94,0.12)"
                  note="US passport: up to 90 days without a visa."
                  priceRange="$550 – $1,200"
                  onAskAI={() => handleAskAI('Japan flights and visa info for US passport')}
                />
              </View>

              {/* Right panel inlined on phone */}
              {!IS_TABLET && (
                <RightPanel passport={passport} onAskAI={handleAskAI} />
              )}
            </ScrollView>

            {/* Right panel alongside on tablet */}
            {IS_TABLET && (
              <RightPanel passport={passport} onAskAI={handleAskAI} />
            )}
          </View>
        </View>

        {/* ── Floating Chat Button ── */}
        <TouchableOpacity
          style={s.floatingChatBtn}
          onPress={chatOpen ? closeChat : openChat}
          activeOpacity={0.8}
        >
          <Text style={s.floatingChatEmoji}>💬</Text>
          <View style={s.floatingChatDot} />
        </TouchableOpacity>

        {/* ── Passport modal ── */}
        <Modal
          visible={showPassportModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPassportModal(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalSheet}>
              <Text style={s.modalTitle}>Select Passport</Text>
              <PassportSelector
                value={passport}
                onChange={code => { setPassport(code); setShowPassportModal(false); }}
              />
              <TouchableOpacity
                style={s.modalClose}
                onPress={() => setShowPassportModal(false)}
                activeOpacity={0.8}
              >
                <Text style={s.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ── AI Chat slide-up modal ── */}
        <Modal
          visible={chatOpen}
          animationType="none"
          transparent
          onRequestClose={closeChat}
        >
          <View style={cs.overlay} pointerEvents="box-none">
            <TouchableOpacity style={cs.overlayBg} onPress={closeChat} activeOpacity={1} />
            <Animated.View style={[cs.chatPanel, { transform: [{ translateY: slideAnim }] }]}>
              <KeyboardAvoidingView
                style={cs.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                {/* Header */}
                <View style={cs.chatHeader}>
                  <View style={cs.chatAvatar}><Text style={cs.chatAvatarText}>FA</Text></View>
                  <View style={cs.chatHeaderInfo}>
                    <Text style={cs.chatHeaderName}>FlightAdvsr AI</Text>
                    <Text style={cs.chatHeaderStatus}>● Online — AI powered</Text>
                  </View>
                  <TouchableOpacity onPress={closeChat} activeOpacity={0.7}>
                    <Text style={cs.chatCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={m => m.id}
                  renderItem={({ item }) => <ChatBubble item={item} />}
                  contentContainerStyle={cs.listContent}
                  showsVerticalScrollIndicator={false}
                />

                {/* Typing */}
                {loading && (
                  <View style={cs.typingRow}>
                    <View style={cs.aiBadge}><Text style={cs.aiBadgeText}>FA</Text></View>
                    <View style={cs.typingBubble}>
                      <ActivityIndicator size="small" color={Colors.accent} />
                      <Text style={cs.typingText}>Searching flights & checking visas…</Text>
                    </View>
                  </View>
                )}

                {/* Quick prompts */}
                {messages.length <= 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={cs.quickScroll}
                    contentContainerStyle={cs.quickContent}
                  >
                    {QUICK_PROMPTS.map(q => (
                      <TouchableOpacity
                        key={q.label}
                        style={cs.quickChip}
                        onPress={() => handleSend(q.query)}
                        activeOpacity={0.7}
                      >
                        <Text style={cs.quickChipText}>✈ {q.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Input */}
                <View style={cs.inputBar}>
                  <TextInput
                    style={cs.input}
                    value={chatInput}
                    onChangeText={setChatInput}
                    placeholder="Ask about flights or visas…"
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={300}
                    returnKeyType="send"
                    onSubmitEditing={() => handleSend()}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={[cs.sendBtn, (!chatInput.trim() || loading) && cs.sendBtnDisabled]}
                    onPress={() => handleSend()}
                    disabled={!chatInput.trim() || loading}
                    activeOpacity={0.8}
                  >
                    <Text style={cs.sendBtnText}>↑</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

// ── Dashboard Styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  root: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, flexDirection: 'column' },
  body: { flex: 1, flexDirection: 'row' },
  scrollMain: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },

  // Sidebar
  sidebar: {
    width: 210, backgroundColor: Colors.bgCard,
    borderRightWidth: 0.5, borderRightColor: Colors.border,
    paddingVertical: 20,
  },
  sidebarLogo: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 20,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  navScroll: { flex: 1, paddingTop: 14, paddingHorizontal: 10 },
  navSectionLabel: {
    fontSize: 9, color: '#8899cc', letterSpacing: 1.5,
    textTransform: 'uppercase', paddingHorizontal: 8, marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9, paddingHorizontal: 10, borderRadius: 9, marginBottom: 2,
  },
  navItemActive: { backgroundColor: Colors.accentDark },
  navIcon: { fontSize: 14, width: 18, textAlign: 'center', color: '#ffffff' },
  navLabel: { flex: 1, fontSize: 13, color: '#ffffff' },
  navLabelActive: { color: '#ffffff', fontWeight: '700' },
  navBadge: {
    backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
  },
  navBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  passportWidget: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 10, marginTop: 10,
    backgroundColor: Colors.bgElevated, borderRadius: 10,
    borderWidth: 0.5, borderColor: Colors.border, padding: 11,
  },
  passportFlag: { fontSize: 18 },
  passportWidgetInfo: { flex: 1 },
  passportWidgetLabel: { fontSize: 9, color: '#8899cc', letterSpacing: 1, textTransform: 'uppercase' },
  passportWidgetValue: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  passportChevron: { fontSize: 18, color: '#6b7fa3' },

  // Logo
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.accentDark,
    justifyContent: 'center', alignItems: 'center',
  },
  logoMarkText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  logoName: { fontSize: 16, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  logoAccent: { color: Colors.accent },

  // Top nav
  topnav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  topnavTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  topnavRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topnavPassportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.accentLight, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 0.5, borderColor: Colors.borderActive,
  },
  topnavPassportIcon: { fontSize: 13 },
  topnavPassportText: { color: Colors.accent, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bgElevated, borderWidth: 0.5, borderColor: Colors.border,
  },
  chatIconBtn: {
    backgroundColor: Colors.accentDark, borderColor: Colors.borderActive, position: 'relative',
  },
  chatIconEmoji: { fontSize: 16 },
  chatOnlineDot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#22c55e', borderWidth: 1.5, borderColor: Colors.bgCard,
  },
  floatingChatBtn: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentDark,
    borderWidth: 1,
    borderColor: Colors.borderActive,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingChatEmoji: { fontSize: 22 },
  floatingChatDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: Colors.bgCard,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.accentDark, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },

  // Search
  searchSection: { marginBottom: 18 },
  sectionHeading: { fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchInput: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 10,
    borderWidth: 0.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 10, color: Colors.text, fontSize: 13,
  },
  searchBtn: {
    backgroundColor: Colors.accentDark, borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 7 },
  chip: {
    backgroundColor: Colors.bgCard, borderRadius: 20,
    borderWidth: 0.5, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipActive: { backgroundColor: Colors.accentDark, borderColor: Colors.borderActive },
  chipText: { fontSize: 11, color: '#d0ddf5' },
  chipTextActive: { color: Colors.accent },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 11,
    borderWidth: 0.5, borderColor: Colors.border, padding: 12,
  },
  statLabel: { fontSize: 9, color: '#b0c4e0', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#ffffff', letterSpacing: -0.5 },
  statSub: { fontSize: 9, marginTop: 2 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', color: '#b8cce8',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  sectionDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent },

  // Flights
  flightsGrid: { gap: 10, marginBottom: 20 },

  // Visa cards
  visaGrid: { gap: 10, marginBottom: 20 },
  visaInfoCard: {
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.border, padding: 14,
  },
  visaInfoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  visaInfoFlag: { fontSize: 24 },
  visaInfoMid: { flex: 1 },
  visaInfoCountry: { fontSize: 13, fontWeight: '600', color: '#ffffff', marginBottom: 3 },
  visaInfoNote: { fontSize: 11, color: '#c8d8f0', lineHeight: 15 },
  visaStatusBadge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  visaStatusText: { fontSize: 10, fontWeight: '700' },
  visaInfoBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  visaPrice: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  askAiBtn: {
    borderWidth: 0.5, borderColor: Colors.borderActive, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  askAiBtnText: { fontSize: 11, color: Colors.accent, fontWeight: '600' },

  // Right panel
  rightPanel: { width: IS_TABLET ? 260 : undefined, padding: 16, gap: 12 },
  rightCard: {
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.border, padding: 14, marginBottom: 12,
  },
  featuredCard: { backgroundColor: Colors.accentDark, borderColor: Colors.borderActive },
  featuredEyebrow: { fontSize: 11, color: '#ffffff', fontWeight: '600', marginBottom: 6 },
  featuredTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  featuredSub: { fontSize: 11, color: '#cce0ff', lineHeight: 16, marginBottom: 10 },
  featuredPrice: { fontSize: 22, fontWeight: '700', color: '#ffffff', letterSpacing: -0.5 },
  featuredPriceSub: { fontSize: 10, color: '#cce0ff', marginTop: 2 },
  rightCardTitle: {
    fontSize: 10, color: '#ffffff', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 8,
  },
  rightCardSub: { fontSize: 12, color: '#e2eeff', marginBottom: 8 },
  passportRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  passportRowLabel: { fontSize: 11, color: '#d0ddf5' },
  passportRowValue: { fontSize: 11, fontWeight: '700' },
  rightCardBtn: {
    backgroundColor: Colors.bgElevated, borderRadius: 8,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 8, alignItems: 'center', marginTop: 6,
  },
  rightCardBtnText: { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: Colors.borderSubtle,
  },
  activityLogo: {
    width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  activityCode: { fontSize: 9, fontWeight: '700', color: Colors.accent },
  activityInfo: { flex: 1 },
  activityRoute: { fontSize: 11, fontWeight: '600', color: '#ffffff' },
  activityTime: { fontSize: 9, color: '#a0b4d0', marginTop: 1 },
  activityPrice: { fontSize: 12, fontWeight: '700', color: Colors.accent },

  // Passport modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 20, maxHeight: '80%', borderWidth: 0.5, borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17, fontWeight: '600', color: Colors.text, textAlign: 'center', marginBottom: 16,
  },
  modalClose: {
    marginTop: 12, backgroundColor: Colors.accentLight, borderRadius: 11, padding: 13,
    alignItems: 'center', borderWidth: 0.5, borderColor: Colors.borderActive,
  },
  modalCloseText: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
});

// ── Chat Panel Styles ─────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  chatPanel: {
    height: '75%', backgroundColor: Colors.bg,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
  },
  flex: { flex: 1 },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chatAvatar: {
    width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.accentDark,
    justifyContent: 'center', alignItems: 'center',
  },
  chatAvatarText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  chatHeaderStatus: { fontSize: 10, color: '#22c55e' },
  chatCloseText: { fontSize: 18, color: '#9aaac8', paddingHorizontal: 4 },

  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  msgWrapper: { marginBottom: 16 },
  bubble: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bubbleUser: { flexDirection: 'row-reverse' },
  aiBadge: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.accentDark,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2,
  },
  aiBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  bubbleContent: { maxWidth: '80%', borderRadius: 14, padding: 12, borderWidth: 0.5 },
  bubbleContentAI: {
    backgroundColor: Colors.bgCard, borderColor: Colors.border, borderTopLeftRadius: 4,
  },
  bubbleContentUser: {
    backgroundColor: Colors.accentDeep, borderColor: Colors.borderActive, borderTopRightRadius: 4,
  },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  resultsContainer: { marginTop: 10 },
  resultsTitle: { fontSize: 12, fontWeight: '600', color: '#b0bdd4', marginBottom: 8 },

  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 10,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  typingText: { color: '#9aaac8', fontSize: 12 },

  quickScroll: { maxHeight: 46 },
  quickContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 8, alignItems: 'center' },
  quickChip: {
    backgroundColor: Colors.bgCard, borderRadius: 20,
    borderWidth: 0.5, borderColor: Colors.border,
    paddingHorizontal: 13, paddingVertical: 7,
  },
  quickChipText: { color: '#b0bdd4', fontSize: 12 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 0.5, borderColor: Colors.border,
    color: Colors.text, fontSize: 14,
    paddingHorizontal: 16, paddingVertical: 11, maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.accentDark, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgElevated, borderWidth: 0.5, borderColor: Colors.border,
  },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
