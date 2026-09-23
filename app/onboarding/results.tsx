import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTrip } from '../../context/TripContenxt';
import {
  askVisaAssistant,
  type VisaChatMessage,
} from '../../services/aiService';
import { openFlightBooking } from '../../services/flightService';
import type {
  FlightItinerary,
  VisaRequirement,
} from '../../types/trip';

const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#61718a';
const BORDER = '#e4ebf4';
const BG = '#f7faff';
const GREEN = '#168a4a';

type AssistantQuickAction = {
  id: 'visa' | 'transit' | 'documents' | 'flight';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  prompt: string;
};

const ASSISTANT_QUICK_ACTIONS: AssistantQuickAction[] = [
  {
    id: 'visa',
    label: 'Visa',
    icon: 'shield-checkmark-outline',
    prompt:
      'For this specific trip, what visa or travel authorization do I need? Keep the answer short.',
  },
  {
    id: 'transit',
    label: 'Transit',
    icon: 'git-branch-outline',
    prompt:
      'Review every layover in this itinerary. Do I need a transit visa or any special transit document?',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'document-text-outline',
    prompt:
      'Give me a short checklist of the documents I should prepare for this specific trip.',
  },
  {
    id: 'flight',
    label: 'Flight',
    icon: 'airplane-outline',
    prompt:
      'Briefly explain why this flight was recommended and mention the most important drawback.',
  },
];

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const duration = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const time = (value: string) => {
  const date = new Date(value.replace(' ', 'T'));

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
};

const visaLabel = (visa: VisaRequirement) =>
  ({
    visa_free: 'Visa free',
    visa_required: 'Visa required',
    evisa: 'eVisa / authorization',
    visa_on_arrival: 'Visa on arrival',
    transit_visa: 'Transit visa check',
  })[visa.status];

export default function Results() {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;

  const {
    travelerData,
    tripDetails,
    preferences,
    result,
    resetTrip,
  } = useTrip();

  const [messages, setMessages] = useState<VisaChatMessage[]>([
    {
      role: 'assistant',
      content:
        'I am looking at this trip. Choose a topic below or ask a specific question.',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const context = useMemo(
    () => ({
      travelerData,
      tripDetails,
      preferences,
      result,
    }),
    [travelerData, tripDetails, preferences, result],
  );

  if (!result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.h1}>No journey result yet</Text>

          <TouchableOpacity
            style={styles.primary}
            onPress={() => router.replace('/onboarding/traveler')}
          >
            <Text style={styles.primaryText}>Start a search</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const primaryFlight = result.primaryFlight;

  // Opens Google Flights on this exact itinerary so the traveler doesn't have
  // to search again before booking with the airline.
  const bookFlight = (flight: FlightItinerary) =>
    openFlightBooking(flight, tripDetails, preferences, result.currency);
  const firstSegment = primaryFlight.segments[0];
  const lastSegment =
    primaryFlight.segments[primaryFlight.segments.length - 1];

  const sendMessage = async (question?: string) => {
    const text = (question ?? input).trim();

    if (!text || loading) {
      return;
    }

    const nextMessages: VisaChatMessage[] = [
      ...messages,
      {
        role: 'user',
        content: text,
      },
    ];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const answer = await askVisaAssistant(nextMessages, context);

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: answer,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The Trip Assistant is temporarily unavailable. Please try again.';

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const newTrip = () => {
    resetTrip();
    router.replace('/onboarding/traveler');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR BEST JOURNEY</Text>

            <Text style={styles.h1}>
              {travelerData.origin?.code} → {tripDetails.destination?.code}
            </Text>

            <Text style={styles.sub}>
              {tripDetails.departureDate}
              {tripDetails.returnDate
                ? ` – ${tripDetails.returnDate}`
                : ''}
              {' • '}
              {tripDetails.travelers} traveler
              {tripDetails.travelers > 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.secondary}
            onPress={newTrip}
          >
            <Ionicons
              name="search-outline"
              size={17}
              color={BLUE}
            />

            <Text style={styles.secondaryText}>New search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pick}>
          <View style={styles.pickTop}>
            <View style={styles.badge}>
              <Ionicons name="trophy" size={16} color="#8b5b00" />
              <Text style={styles.badgeText}>
                {result.recommendation.label}
              </Text>
            </View>

            <Text style={styles.live}>
              {result.isLiveData ? 'LIVE FARE' : 'SAMPLE'}
            </Text>
          </View>

          <View
            style={[
              styles.flightHero,
              desktop && styles.flightHeroDesktop,
            ]}
          >
            <View style={styles.airlineRow}>
              {primaryFlight.airlineLogo ? (
                <Image
                  source={{ uri: primaryFlight.airlineLogo }}
                  style={styles.logo}
                />
              ) : (
                <View style={styles.logoFallback}>
                  <Ionicons
                    name="airplane"
                    size={22}
                    color={BLUE}
                  />
                </View>
              )}

              <View>
                <Text style={styles.airline}>
                  {firstSegment?.airline}
                </Text>

                <Text style={styles.route}>
                  {firstSegment?.departureAirport.id}{' '}
                  {time(firstSegment?.departureAirport.time)} →{' '}
                  {lastSegment?.arrivalAirport.id}{' '}
                  {time(lastSegment?.arrivalAirport.time)}
                </Text>
              </View>
            </View>

            <View style={styles.metric}>
              <Text style={styles.price}>
                {money(primaryFlight.price, result.currency)}
              </Text>

              <Text style={styles.meta}>
                {duration(primaryFlight.totalDurationMinutes)}
                {' • '}
                {primaryFlight.layovers.length === 0
                  ? 'Nonstop'
                  : `${primaryFlight.layovers.length} stop${
                      primaryFlight.layovers.length > 1 ? 's' : ''
                    }`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primary}
              onPress={() => bookFlight(primaryFlight)}
            >
              <Text style={styles.primaryText}>Continue to booking</Text>

              <Ionicons
                name="open-outline"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {primaryFlight.layovers.map((layover) => (
            <Text
              key={layover.airportCode}
              style={styles.layover}
            >
              Connection: {layover.name} ({layover.airportCode})
              {' • '}
              {duration(layover.durationMinutes)}
            </Text>
          ))}

          <Text style={styles.disclaimer}>
            Opens Google Flights with this flight, date, and cabin already
            selected. Choose a booking option to continue to the airline and
            confirm the current fare.
          </Text>
        </View>

        <View
          style={[
            styles.grid,
            desktop && styles.gridDesktop,
          ]}
        >
          <View style={styles.column}>
            <Card
              title="Why we recommend this"
              icon="sparkles-outline"
            >
              <Text style={styles.explanation}>
                {result.recommendation.explanation}
              </Text>

              {result.recommendation.reasons.map((reason, index) => (
                <View
                  key={`${reason.title}-${index}`}
                  style={styles.reason}
                >
                  <Ionicons
                    name={
                      (
                        {
                          price: 'cash-outline',
                          time: 'time-outline',
                          visa: 'shield-checkmark-outline',
                          layover: 'git-branch-outline',
                          emissions: 'leaf-outline',
                          arrival: 'sunny-outline',
                        } as Record<
                          string,
                          keyof typeof Ionicons.glyphMap
                        >
                      )[reason.icon] ?? 'checkmark-circle-outline'
                    }
                    size={20}
                    color={GREEN}
                  />

                  <View style={styles.flexOne}>
                    <Text style={styles.reasonTitle}>
                      {reason.title}
                    </Text>

                    <Text style={styles.reasonDetail}>
                      {reason.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            <Card
              title="Visa & entry"
              icon="shield-checkmark-outline"
            >
              {result.visaRequirements.map((visa) => (
                <View
                  key={visa.countryCode}
                  style={styles.visa}
                >
                  <View style={styles.visaTop}>
                    <Text style={styles.reasonTitle}>
                      {visa.countryName}
                    </Text>

                    <Text style={styles.visaStatus}>
                      {visaLabel(visa)}
                    </Text>
                  </View>

                  {visa.allowedStay ? (
                    <Text style={styles.allowed}>
                      Stay: {visa.allowedStay}
                    </Text>
                  ) : null}

                  <Text style={styles.reasonDetail}>
                    {visa.note}
                  </Text>
                </View>
              ))}
            </Card>

            {result.travelAlerts.length > 0 ? (
              <Card
                title="Travel alerts"
                icon="warning-outline"
              >
                {result.travelAlerts.map((alert, index) => (
                  <View key={index} style={styles.alert}>
                    <Ionicons
                      name={
                        alert.severity === 'critical'
                          ? 'alert-circle'
                          : 'warning'
                      }
                      size={20}
                      color={
                        alert.severity === 'critical'
                          ? '#c43232'
                          : '#d17b00'
                      }
                    />

                    <View style={styles.flexOne}>
                      <Text style={styles.reasonTitle}>
                        {alert.title}
                      </Text>

                      <Text style={styles.reasonDetail}>
                        {alert.detail}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            ) : null}
          </View>

          <View style={styles.column}>
            <Card
              title="Before you fly"
              icon="checkbox-outline"
            >
              {result.checklist.map((item) => (
                <View key={item.id} style={styles.check}>
                  <Ionicons
                    name={
                      item.required
                        ? 'square-outline'
                        : 'ellipse-outline'
                    }
                    size={20}
                    color={item.required ? BLUE : MUTED}
                  />

                  <View style={styles.flexOne}>
                    <Text style={styles.reasonTitle}>
                      {item.label}
                      {item.required ? ' • Required' : ''}
                    </Text>

                    <Text style={styles.reasonDetail}>
                      {item.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            <Card
              title="Trip Assistant"
              icon="sparkles-outline"
            >
              <Text style={styles.assistantIntro}>
                Get advice based on the passport, route, layovers, and flight
                shown on this page.
              </Text>

              <View style={styles.quickActions}>
                {ASSISTANT_QUICK_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.quickAction,
                      loading && styles.quickActionDisabled,
                    ]}
                    disabled={loading}
                    onPress={() => sendMessage(action.prompt)}
                  >
                    <Ionicons
                      name={action.icon}
                      size={17}
                      color={BLUE}
                    />

                    <Text style={styles.quickActionText}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView
                style={styles.chatScroll}
                contentContainerStyle={styles.chat}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((message, index) => (
                  <View
                    key={`${message.role}-${index}`}
                    style={[
                      styles.bubble,
                      message.role === 'user'
                        ? styles.userBubble
                        : styles.aiBubble,
                    ]}
                  >
                    {message.role === 'assistant' ? (
                      <View style={styles.assistantLabel}>
                        <View style={styles.assistantIcon}>
                          <Ionicons
                            name="sparkles"
                            size={13}
                            color={BLUE}
                          />
                        </View>

                        <Text style={styles.assistantLabelText}>
                          Trip Assistant
                        </Text>
                      </View>
                    ) : null}

                    <Text
                      style={
                        message.role === 'user'
                          ? styles.userText
                          : styles.aiText
                      }
                    >
                      {message.content}
                    </Text>
                  </View>
                ))}

                {loading ? (
                  <View
                    style={[
                      styles.bubble,
                      styles.aiBubble,
                      styles.loadingBubble,
                    ]}
                  >
                    <ActivityIndicator
                      size="small"
                      color={BLUE}
                    />

                    <Text style={styles.loadingText}>
                      Reviewing your trip…
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <KeyboardAvoidingView
                behavior={
                  Platform.OS === 'ios' ? 'padding' : undefined
                }
              >
                <View style={styles.inputRow}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask something else…"
                    placeholderTextColor="#8390a5"
                    style={styles.input}
                    multiline
                    maxLength={300}
                    returnKeyType="send"
                    blurOnSubmit
                    editable={!loading}
                    onSubmitEditing={() => sendMessage()}
                  />

                  <TouchableOpacity
                    style={[
                      styles.send,
                      (!input.trim() || loading) &&
                        styles.sendDisabled,
                    ]}
                    disabled={!input.trim() || loading}
                    onPress={() => sendMessage()}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>

              <Text style={styles.assistantDisclaimer}>
                Visa and transit guidance should be confirmed with official
                government sources and the airline.
              </Text>
            </Card>
          </View>
        </View>

        <Card
          title="Other flight options"
          icon="airplane-outline"
        >
          {result.alternativeFlights.map((flight) => (
            <FlightRow
              key={flight.id}
              flight={flight}
              currency={result.currency}
              onBook={() => bookFlight(flight)}
            />
          ))}
        </Card>

        <Text style={styles.footer}>
          Live fares can change. Visa data is planning guidance, not a
          guarantee of entry. Verify requirements with official government
          sources and the airline before booking.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Ionicons
          name={icon}
          size={20}
          color={BLUE}
        />

        <Text style={styles.cardTitleText}>
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

function FlightRow({
  flight,
  currency,
  onBook,
}: {
  flight: FlightItinerary;
  currency: string;
  onBook: () => void;
}) {
  const firstSegment = flight.segments[0];
  const lastSegment =
    flight.segments[flight.segments.length - 1];

  return (
    <View style={styles.flightRow}>
      <View style={styles.airlineRow}>
        {flight.airlineLogo ? (
          <Image
            source={{ uri: flight.airlineLogo }}
            style={styles.smallLogo}
          />
        ) : null}

        <View>
          <Text style={styles.reasonTitle}>
            {firstSegment?.airline}
          </Text>

          <Text style={styles.reasonDetail}>
            {firstSegment?.departureAirport.id}{' '}
            {time(firstSegment?.departureAirport.time)} →{' '}
            {lastSegment?.arrivalAirport.id}{' '}
            {time(lastSegment?.arrivalAirport.time)}
          </Text>

          <Text style={styles.reasonDetail}>
            {duration(flight.totalDurationMinutes)}
            {' • '}
            {flight.layovers.length === 0
              ? 'Nonstop'
              : `${flight.layovers.length} stop${
                  flight.layovers.length > 1 ? 's' : ''
                }`}
          </Text>
        </View>
      </View>

      <View style={styles.rowEnd}>
        <Text style={styles.altPrice}>
          {money(flight.price, currency)}
        </Text>

        <TouchableOpacity
          onPress={onBook}
        >
          <Text style={styles.bookLink}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  page: {
    padding: 22,
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: BLUE,
  },

  h1: {
    fontSize: 30,
    fontWeight: '900',
    color: NAVY,
  },

  sub: {
    color: MUTED,
    marginTop: 4,
  },

  secondary: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  secondaryText: {
    color: BLUE,
    fontWeight: '700',
  },

  pick: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#dce8f7',
    shadowColor: '#123',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },

  pickTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  badge: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    backgroundColor: '#fff4cf',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  badgeText: {
    fontWeight: '800',
    color: '#745000',
  },

  live: {
    fontSize: 11,
    fontWeight: '800',
    color: GREEN,
  },

  flightHero: {
    gap: 18,
    marginTop: 20,
  },

  flightHeroDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  logo: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },

  smallLogo: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },

  logoFallback: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#edf4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  airline: {
    fontSize: 21,
    fontWeight: '900',
    color: NAVY,
  },

  route: {
    color: MUTED,
    marginTop: 3,
  },

  metric: {
    minWidth: 150,
  },

  price: {
    fontSize: 28,
    fontWeight: '900',
    color: NAVY,
  },

  meta: {
    color: MUTED,
    marginTop: 3,
  },

  primary: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '800',
  },

  layover: {
    color: NAVY,
    marginTop: 12,
  },

  disclaimer: {
    fontSize: 12,
    color: MUTED,
    marginTop: 13,
  },

  grid: {
    gap: 18,
  },

  gridDesktop: {
    flexDirection: 'row',
  },

  column: {
    flex: 1,
    gap: 18,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },

  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 15,
  },

  cardTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: NAVY,
  },

  explanation: {
    color: MUTED,
    lineHeight: 21,
    marginBottom: 10,
  },

  reason: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },

  reasonTitle: {
    fontWeight: '800',
    color: NAVY,
  },

  reasonDetail: {
    color: MUTED,
    lineHeight: 19,
    marginTop: 2,
  },

  visa: {
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },

  visaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  visaStatus: {
    color: GREEN,
    fontWeight: '800',
  },

  allowed: {
    color: BLUE,
    fontWeight: '700',
    marginTop: 4,
  },

  alert: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },

  check: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },

  assistantIntro: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 13,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cfe0f8',
    backgroundColor: '#f5f9ff',
  },

  quickActionDisabled: {
    opacity: 0.5,
  },

  quickActionText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '800',
  },

  chatScroll: {
    maxHeight: 290,
    minHeight: 130,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },

  chat: {
    gap: 10,
    paddingVertical: 14,
  },

  bubble: {
    maxWidth: '90%',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: BLUE,
    borderBottomRightRadius: 5,
  },

  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4fb',
    borderBottomLeftRadius: 5,
  },

  assistantLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },

  assistantIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dceaff',
  },

  assistantLabelText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  userText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },

  aiText: {
    color: NAVY,
    fontSize: 14,
    lineHeight: 21,
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  loadingText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },

  inputRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: NAVY,
    backgroundColor: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },

  send: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendDisabled: {
    opacity: 0.45,
  },

  assistantDisclaimer: {
    color: '#7a8799',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },

  flightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },

  rowEnd: {
    alignItems: 'flex-end',
  },

  altPrice: {
    fontWeight: '900',
    fontSize: 18,
    color: NAVY,
  },

  bookLink: {
    color: BLUE,
    fontWeight: '800',
    marginTop: 5,
  },

  footer: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    paddingBottom: 20,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
  },

  flexOne: {
    flex: 1,
  },
});