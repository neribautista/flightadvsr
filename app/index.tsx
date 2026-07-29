import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#61718a';
const BORDER = '#e7edf5';
const BG = '#f8fbff';

const features = [
  ['airplane-outline', 'Multi-City Planner', 'Plan complex itineraries across multiple countries.'],
  ['earth-outline', 'Interactive World Map', 'Visualize your route with real-time visa status for every country.'],
  ['document-text-outline', 'Visa Checker', 'Instantly check visa requirements based on your nationality.'],
  ['git-compare-outline', 'Transit Rules', 'Know if you need a transit visa for layovers.'],
  ['clipboard-outline', 'Entry Requirements', 'Stay updated on passport, health, and entry rules.'],
  ['calendar-outline', 'Travel Timeline', 'See when to apply for visas and plan with ease.'],
  ['share-social-outline', 'Smart Route Suggestions', 'Get alternative routes with better visa outcomes.'],
  ['information-circle-outline', 'Country Information', 'Explore country guides, alerts, and travel tips.'],
] as const;

const steps = [
  ['map-outline', 'Build Your Trip', 'Add your destinations and dates. We’ll map your multi-country itinerary.'],
  ['search-outline', 'We Analyze Your Route', 'We check visa requirements, transit rules, and entry criteria for every stop.'],
  ['shield-checkmark-outline', 'Travel With Confidence', 'Know exactly what you need before you book—no more visa surprises.'],
] as const;

const testimonials = [
  ['Sophie L.', '🇨🇦 Canada', 'FlightADVSR saved me from a costly visa mistake. Now I always know before I book!'],
  ['Daniel K.', '🇦🇺 Australia', 'The visa checker and transit rules feature are game changers for multi-country trips.'],
  ['Maria P.', '🇵🇭 Philippines', 'Finally, a travel tool that shows the whole picture—not just flights.'],
] as const;

const comparison = [
  ['Find Flights', true, true],
  ['Multi-City Planning', true, true],
  ['Visa Requirements Check', false, true],
  ['Transit Visa Information', false, true],
  ['Entry Requirements & Rules', false, true],
  ['Smart Route Suggestions', false, true],
  ['Travel Timeline & Alerts', false, true],
] as const;

function CTAButton({
  label = 'Start Planning for Free',
  light = false,
}: {
  label?: string;
  light?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/onboarding/traveler')}
      style={[styles.cta, light && styles.ctaLight]}
    >
      <Text style={[styles.ctaText, light && styles.ctaLightText]}>
        {label}
      </Text>

      <Ionicons
        name="arrow-forward"
        size={17}
        color={light ? BLUE : '#fff'}
      />
    </TouchableOpacity>
  );
}

function Brand() {
  return (
    <View style={styles.brand}>
      <LinearGradient colors={['#49a4ff', '#1d69ed']} style={styles.brandMark}>
        <Ionicons name="airplane" size={19} color="#fff" />
      </LinearGradient>
      <Text style={styles.brandText}>Flight<Text style={{ color: BLUE }}>ADVSR</Text></Text>
    </View>
  );
}

function Header({ mobile }: { mobile: boolean }) {
  return (
    <View style={styles.header}>
      <Brand />
      {!mobile && (
        <View style={styles.navLinks}>
          {/* {['Features', 'How It Works', 'Destinations', 'Pricing', 'Resources⌄'].map((item) => (
            <Text key={item} style={styles.navText}>{item}</Text>
          ))} */}
        </View>
      )}
      <View style={styles.headerActions}>
        {/* {!mobile && <Text style={styles.login}>Log in</Text>} */}
        <CTAButton />
      </View>
    </View>
  );
}
function TemporaryComponent() {
  return (
    <View style={{ padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10 }}>
      <Text style={{ color: '#333', fontSize: 16 }}>This is a temporary component.</Text>
    </View>
  );
}
function RouteMap({ mobile }: { mobile: boolean }) {
  const points = mobile
    ? [
        { left: '8%', top: 145, city: 'New York', status: 'Visa Free', tone: 'green' },
        { left: '31%', top: 103, city: 'Paris', status: 'Visa Free', tone: 'green' },
        { left: '52%', top: 142, city: 'Istanbul', status: 'eVisa', tone: 'yellow' },
        { left: '70%', top: 105, city: 'Tokyo', status: 'Visa Free', tone: 'green' },
        { left: '84%', top: 230, city: 'Manila', status: 'Visa Required', tone: 'red' },
      ]
    : [
        { left: '8%', top: 150, city: 'New York', status: 'Visa Free', tone: 'green' },
        { left: '31%', top: 112, city: 'Paris', status: 'Visa Free', tone: 'green' },
        { left: '52%', top: 155, city: 'Istanbul', status: 'eVisa', tone: 'yellow' },
        { left: '70%', top: 112, city: 'Tokyo', status: 'Visa Free', tone: 'green' },
        { left: '87%', top: 225, city: 'Manila', status: 'Visa Required', tone: 'red' },
      ];

  return (
    <View style={[styles.mapCard, mobile && styles.mapCardMobile]}>
      <View style={styles.mapGlowOne} />
      <View style={styles.mapGlowTwo} />
      <Text style={styles.mapWatermark}>WORLD ROUTE</Text>
      <View style={styles.routeLine} />
      {points.map((point, i) => (
        <View key={point.city} style={[styles.mapPoint, { left: point.left as any, top: point.top }]}>
          <View style={[styles.pin, point.tone === 'green' ? styles.pinGreen : point.tone === 'yellow' ? styles.pinYellow : styles.pinRed]}>
            <Ionicons name="location" size={18} color="#fff" />
          </View>
          <View style={styles.cityBubble}>
            <Text style={styles.cityName}>{point.city}</Text>
            <Text style={[
              styles.status,
              point.tone === 'green' ? styles.statusGreen : point.tone === 'yellow' ? styles.statusYellow : styles.statusRed,
            ]}>{point.status}</Text>
          </View>
          {i < points.length - 1 && <Ionicons name="airplane" size={18} color={BLUE} style={styles.planeIcon} />}
        </View>
      ))}
      <View style={styles.legend}>
        <Text style={styles.legendItem}>● Visa Free</Text>
        <Text style={[styles.legendItem, { color: '#d9a900' }]}>● eVisa</Text>
        <Text style={[styles.legendItem, { color: '#e94d62' }]}>● Visa Required</Text>
      </View>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const mobile = width < 760;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.shell}>
        <Header mobile={mobile} />

        <View style={[styles.hero, mobile && styles.heroMobile]}>
          <View style={[styles.heroCopy, mobile && styles.heroCopyMobile]}>
            <View style={styles.eyebrow}><Ionicons name="sparkles" size={13} color={BLUE} /><Text style={styles.eyebrowText}>TRAVEL SMARTER, STRESS LESS</Text></View>
            <Text style={[styles.heroTitle, mobile && styles.heroTitleMobile]}>Plan Multi-Country Trips Without <Text style={{ color: BLUE }}>Visa Surprises</Text></Text>
            <Text style={styles.heroBody}>Build your itinerary, compare routes, and instantly know which countries require visas before you book.</Text>
            <CTAButton />
            <View style={styles.socialProof}>
              <View style={styles.avatarStack}>{['N', 'D', 'S', 'M'].map((x, i) => <View key={i} style={[styles.avatar, { marginLeft: i ? -8 : 0 }]}><Text style={styles.avatarText}>{x}</Text></View>)}</View>
              <Text style={styles.socialText}>Join <Text style={{ color: BLUE, fontWeight: '700' }}>50,000+</Text> smart travelers{mobile ? '\n' : ' '}planning visa-safe trips</Text>
            </View>
          </View>
          <View style={[styles.heroVisual, mobile && styles.heroVisualMobile]}><RouteMap mobile={mobile} /></View>
        </View>

        <View style={styles.section}>
          <SectionTitle>How It Works</SectionTitle>
          <View style={[styles.cardGrid, mobile && styles.cardGridMobile]}>
            {steps.map(([icon, title, body], i) => (
              <View key={title} style={[styles.stepCard, mobile && styles.fullCard]}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
                <View style={styles.iconSoft}><Ionicons name={icon as any} size={28} color={BLUE} /></View>
                <View style={styles.stepText}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardBody}>{body}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Everything You Need to Travel Smarter</SectionTitle>
          <View style={[styles.featureGrid, mobile && styles.featureGridMobile]}>
            {features.map(([icon, title, body]) => (
              <View key={title} style={[styles.featureCard, mobile && styles.featureCardMobile]}>
                <View style={styles.featureIcon}><Ionicons name={icon as any} size={25} color={BLUE} /></View>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureBody}>{body}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Why Travelers Choose FlightADVSR</SectionTitle>
          <View style={styles.compareCard}>
            <View style={styles.compareRow}><Text style={[styles.compareFeature, styles.compareHead]}>Features</Text><Text style={styles.compareHead}>Google Flights</Text><Text style={[styles.compareHead, styles.oursHead]}>✈ FlightADVSR</Text></View>
            {comparison.map(([name, google, ours]) => (
              <View key={name} style={styles.compareRow}>
                <Text style={styles.compareFeature}>{name}</Text>
                <Ionicons name={google ? 'checkmark-circle' : 'close'} size={20} color={google ? '#4bc979' : '#f04d64'} />
                <View style={styles.oursCell}><Ionicons name={ours ? 'checkmark-circle' : 'close'} size={20} color="#4bc979" /></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Loved by Travelers Worldwide</SectionTitle>
          <View style={[styles.cardGrid, mobile && styles.cardGridMobile]}>
            {testimonials.map(([name, country, quote], i) => (
              <View key={name} style={[styles.testimonial, mobile && styles.fullCard]}>
                <View style={styles.testimonialTop}><View style={styles.personAvatar}><Text>{['👩🏻‍🦰','🧔🏻','👩🏻'][i]}</Text></View><View><Text style={styles.cardTitle}>{name}</Text><Text style={styles.country}>{country}</Text></View></View>
                <Text style={styles.stars}>★★★★★</Text>
                <Text style={styles.cardBody}>{quote}</Text>
              </View>
            ))}
          </View>
        </View>

        <LinearGradient colors={['#276ef1', '#5b8ff5', '#d7e7f5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomCta, mobile && styles.bottomCtaMobile]}>
          <View style={styles.bottomCopy}>
            <Text style={styles.bottomTitle}>Know Before You Go</Text>
            <Text style={styles.bottomBody}>Stop discovering visa problems after booking your flights.</Text>
            <View style={styles.benefits}><Text style={styles.benefit}>♧ Plan Smarter</Text><Text style={styles.benefit}>♢ Avoid Surprises</Text><Text style={styles.benefit}>♡ Travel Confidently</Text></View>
            <CTAButton light />
            <Text style={styles.disclaimer}>No credit card required · Free forever plan available</Text>
          </View>
          {!mobile && <View style={styles.mountain}><Text style={styles.mountainEmoji}>🏔️</Text><Text style={styles.hiker}>🥾</Text></View>}
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const shadow = Platform.select({ web: { boxShadow: '0 10px 30px rgba(37, 79, 130, 0.08)' } as any, default: {} });

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  pageContent: { alignItems: 'center' },
  shell: { width: '100%', maxWidth: 1440, backgroundColor: '#fff' },
  header: { height: 82, paddingHorizontal: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f4f8' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  brandText: { fontSize: 20, fontWeight: '800', color: NAVY },
  navLinks: { flexDirection: 'row', gap: 34 },
  navText: { color: '#26364d', fontSize: 14, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  login: { color: '#46617e', fontWeight: '600' },
  cta: { alignSelf: 'flex-start', backgroundColor: BLUE, borderRadius: 12, paddingHorizontal: 22, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...shadow },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ctaLight: { backgroundColor: '#fff' },
  ctaLightText: { color: BLUE },
  hero: { paddingHorizontal: 48, paddingVertical: 42, flexDirection: 'row', gap: 34, alignItems: 'center', backgroundColor: '#fff' },
  heroMobile: { paddingHorizontal: 24, paddingTop: 42, paddingBottom: 28, flexDirection: 'column', alignItems: 'stretch' },
  heroCopy: { width: '35%', minWidth: 350 },
  heroCopyMobile: { width: '100%', minWidth: 0 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  eyebrowText: { color: BLUE, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  heroTitle: { color: NAVY, fontSize: 52, lineHeight: 59, fontWeight: '800', letterSpacing: -1.6, marginBottom: 22 },
  heroTitleMobile: { fontSize: 42, lineHeight: 49 },
  heroBody: { color: MUTED, fontSize: 18, lineHeight: 28, marginBottom: 28, maxWidth: 500 },
  socialProof: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  avatarStack: { flexDirection: 'row', marginRight: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#d9e8fb', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: NAVY, fontWeight: '800', fontSize: 11 },
  socialText: { color: MUTED, fontSize: 12, lineHeight: 18 },
  heroVisual: { width: '65%', minHeight: 430 },
  heroVisualMobile: { width: '100%', minHeight: 390 },
  mapCard: { height: 430, borderRadius: 22, overflow: 'hidden', backgroundColor: '#eaf4ff', borderWidth: 1, borderColor: '#dcebf9', position: 'relative', ...shadow },
  mapCardMobile: { height: 390 },
  mapGlowOne: { position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(255,255,255,.7)', top: -220, left: -60 },
  mapGlowTwo: { position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(130,190,255,.15)', bottom: -250, right: -100 },
  mapWatermark: { position: 'absolute', top: 35, left: 0, right: 0, textAlign: 'center', color: 'rgba(54,124,208,.12)', fontSize: 44, letterSpacing: 12, fontWeight: '900' },
  routeLine: { position: 'absolute', left: '10%', right: '10%', top: '52%', borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#6bb0ef', transform: [{ rotate: '5deg' }] },
  mapPoint: { position: 'absolute', alignItems: 'center' },
  pin: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pinGreen: { backgroundColor: '#43c66f' }, pinYellow: { backgroundColor: '#f3ba22' }, pinRed: { backgroundColor: '#ed4258' },
  cityBubble: { backgroundColor: 'rgba(255,255,255,.95)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginTop: 4, ...shadow },
  cityName: { fontSize: 11, fontWeight: '800', color: NAVY, textAlign: 'center' },
  status: { fontSize: 9, marginTop: 2, fontWeight: '700', textAlign: 'center' },
  statusGreen: { color: '#32ac5b' }, statusYellow: { color: '#c99000' }, statusRed: { color: '#db3249' },
  planeIcon: { position: 'absolute', left: 70, top: -5, transform: [{ rotate: '10deg' }] },
  legend: { position: 'absolute', bottom: 18, alignSelf: 'center', flexDirection: 'row', gap: 18, backgroundColor: 'rgba(255,255,255,.92)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  legendItem: { color: '#34b862', fontSize: 10, fontWeight: '700' },
  section: { paddingHorizontal: 48, paddingVertical: 30, backgroundColor: BG },
  sectionTitle: { color: NAVY, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 26 },
  cardGrid: { flexDirection: 'row', gap: 16 },
  cardGridMobile: { flexDirection: 'column' },
  stepCard: { flex: 1, minHeight: 150, padding: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16, position: 'relative', ...shadow },
  fullCard: { width: '100%' },
  stepNumber: { position: 'absolute', left: 18, top: -12, width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontWeight: '800' },
  iconSoft: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
  cardTitle: { color: NAVY, fontSize: 15, fontWeight: '800', marginBottom: 7 },
  cardBody: { color: MUTED, fontSize: 12, lineHeight: 18 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  featureGridMobile: { gap: 12 },
  featureCard: { width: '24%', minHeight: 160, padding: 20, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 15, ...shadow },
  featureCardMobile: { width: '48%' },
  featureIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#edf5ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  featureTitle: { color: NAVY, fontSize: 13, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  featureBody: { color: MUTED, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  compareCard: { maxWidth: 980, width: '100%', alignSelf: 'center', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER, ...shadow },
  compareRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BORDER },
  compareFeature: { flex: 1.6, paddingHorizontal: 18, color: '#35465e', fontSize: 12, fontWeight: '600' },
  compareHead: { flex: 1, textAlign: 'center', color: NAVY, fontWeight: '800', fontSize: 12 },
  oursHead: { backgroundColor: BLUE, color: '#fff', alignSelf: 'stretch', textAlignVertical: 'center', paddingTop: 17 },
  oursCell: { flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', backgroundColor: '#eef5ff' },
  testimonial: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 20, ...shadow },
  testimonialTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  personAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eef4fa', alignItems: 'center', justifyContent: 'center' },
  country: { color: MUTED, fontSize: 11 },
  stars: { color: '#f5b900', letterSpacing: 2, marginBottom: 10 },
  bottomCta: { margin: 48, borderRadius: 20, minHeight: 250, padding: 34, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  bottomCtaMobile: { marginHorizontal: 24, marginVertical: 34 },
  bottomCopy: { flex: 1 },
  bottomTitle: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 8 },
  bottomBody: { color: 'rgba(255,255,255,.9)', fontSize: 16, marginBottom: 18 },
  benefits: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginBottom: 22 },
  benefit: { color: '#fff', fontSize: 12 },
  disclaimer: { color: 'rgba(255,255,255,.8)', fontSize: 10, marginTop: 12 },
  mountain: { width: '35%', alignItems: 'center' },
  mountainEmoji: { fontSize: 110 },
  hiker: { fontSize: 44, marginTop: -40 },
});
