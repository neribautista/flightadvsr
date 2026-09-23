import React, { useRef, useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Scenery from '../components/Scenery';

const BLUE = '#2270ec';
const BLUE_DARK = '#1b5fd6';
const NAVY = '#0e1d3d';
const MUTED = '#5c6b82';
const BORDER = '#e5ecf6';
const BG = '#f6f9fe';
const GREEN = '#34b862';
const RED = '#ec4b5f';

const comparison = [
  ['Find Flights', true, true],
  ['Multi-City Planning', true, true],
  ['Visa Requirements Check', false, true],
  ['Transit Visa Information', false, true],
  ['Entry Requirements & Rules', false, true],
  ['Smart Route Suggestions', false, true],
  ['Travel Timeline & Alerts', false, true],
] as const;

const features = [
  [
    'passport',
    'Check Visa Requirements',
    'See what documents you need, including transit and entry requirements, before you book.',
  ],
  [
    'map-marker-path',
    'Plan Multi-City Trips',
    'Easily plan complex trips with multiple destinations and get the best routes.',
  ],
  [
    'shield-check-outline',
    'Know Before You Go',
    'Get helpful travel alerts, transit visa info, and country-specific rules — all in one place.',
  ],
] as const;

type SectionKey = 'home' | 'how' | 'features' | 'about';

const navItems: [SectionKey, string][] = [
  ['home', 'Home'],
  ['how', 'How It Works'],
  ['features', 'Features'],
  ['about', 'About'],
];

function CTAButton({
  label = 'Start Planning for Free',
  variant = 'primary',
  size = 'large',
  showArrow = true,
}: {
  label?: string;
  variant?: 'primary' | 'light';
  size?: 'small' | 'large';
  showArrow?: boolean;
}) {
  const light = variant === 'light';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/onboarding/traveler')}
      style={[
        styles.cta,
        size === 'small' && styles.ctaSmall,
        light && styles.ctaLight,
      ]}
    >
      <Text
        style={[
          styles.ctaText,
          size === 'small' && styles.ctaTextSmall,
          light && styles.ctaLightText,
        ]}
      >
        {label}
      </Text>

      {showArrow && (
        <Ionicons
          name="arrow-forward"
          size={size === 'small' ? 15 : 18}
          color={light ? BLUE : '#fff'}
        />
      )}
    </TouchableOpacity>
  );
}

function Brand() {
  return (
    <View style={styles.brand}>
      <Ionicons
        name="airplane"
        size={26}
        color={BLUE}
        style={styles.brandIcon}
      />
      <Text style={styles.brandText}>
        Flight<Text style={styles.brandBold}>ADVSR</Text>
      </Text>
    </View>
  );
}

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const mobile = width < 760;

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<SectionKey, number>>({
    home: 0,
    how: 0,
    features: 0,
    about: 0,
  });
  const [active, setActive] = useState<SectionKey>('home');

  const trackSection =
    (key: SectionKey) =>
    (event: { nativeEvent: { layout: { y: number } } }) => {
      sectionY.current[key] = event.nativeEvent.layout.y;
    };

  const scrollTo = (key: SectionKey) => {
    setActive(key);
    scrollRef.current?.scrollTo({
      y: Math.max(0, sectionY.current[key] - 16),
      animated: true,
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.page}
      contentContainerStyle={styles.pageContent}
    >
      {/* Hero, including the header */}
      <LinearGradient
        colors={['#f7faff', '#edf4fe']}
        style={styles.heroBand}
        onLayout={trackSection('home')}
      >
        <Scenery
          style={[
            styles.scenery,
            mobile ? styles.heroSceneryMobile : styles.heroScenery,
          ]}
        />

        <View style={[styles.shell, mobile && styles.shellMobile]}>
          <View style={styles.header}>
            <Brand />

            {!mobile && (
              <View style={styles.navLinks}>
                {navItems.map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => scrollTo(key)}
                    style={styles.navItem}
                  >
                    <Text
                      style={[
                        styles.navText,
                        active === key && styles.navTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                    <View
                      style={[
                        styles.navUnderline,
                        active === key && styles.navUnderlineActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <CTAButton
              size="small"
              showArrow={false}
              label={mobile ? 'Start Planning' : 'Start Planning for Free'}
            />
          </View>

          <View style={[styles.hero, mobile && styles.heroMobile]}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>
                AI-POWERED TRAVEL PLANNER
              </Text>
            </View>

            <Text style={[styles.heroTitle, mobile && styles.heroTitleMobile]}>
              Plan Smarter.
            </Text>
            <Text
              style={[
                styles.heroTitle,
                styles.heroTitleAccent,
                mobile && styles.heroTitleMobile,
              ]}
            >
              Travel Further.
            </Text>

            <Text style={[styles.heroBody, mobile && styles.heroBodyMobile]}>
              FlightADVSR helps you find the right flights, understand visa
              requirements, and plan your trip with confidence — all in one
              place.
            </Text>

            <CTAButton />
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.shell, mobile && styles.shellMobile]}>
        {/* Comparison */}
        <View style={styles.section} onLayout={trackSection('features')}>
          <Text style={[styles.sectionTitle, mobile && styles.sectionTitleMobile]}>
            Why Travelers Choose FlightADVSR
          </Text>

          <View style={styles.compareCard}>
            <View style={[styles.compareRow, styles.compareHeadRow]}>
              <Text style={[styles.compareFeature, styles.compareHeadText]}>
                Features
              </Text>
              <View style={styles.compareCell}>
                <Text style={styles.compareHeadText}>Google Flights</Text>
              </View>
              <View style={[styles.compareCell, styles.oursHead]}>
                <Ionicons name="airplane" size={16} color="#fff" />
                <Text style={styles.oursHeadText}>FlightADVSR</Text>
              </View>
            </View>

            {comparison.map(([name, google, ours], index) => (
              <View
                key={name}
                style={[
                  styles.compareRow,
                  index === comparison.length - 1 && styles.compareRowLast,
                ]}
              >
                <Text
                  style={[
                    styles.compareFeature,
                    mobile && styles.compareFeatureMobile,
                  ]}
                >
                  {name}
                </Text>
                <View style={styles.compareCell}>
                  <CompareMark value={google} />
                </View>
                <View style={[styles.compareCell, styles.oursCell]}>
                  <CompareMark value={ours} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Feature cards */}
        <View style={styles.section} onLayout={trackSection('how')}>
          <Text style={[styles.sectionTitle, mobile && styles.sectionTitleMobile]}>
            Built for Smarter Travel Planning
          </Text>
          <Text style={styles.sectionSubtitle}>
            Get the right information, make better decisions, and travel with
            confidence — anywhere in the world.
          </Text>

          <View style={[styles.cardGrid, mobile && styles.cardGridMobile]}>
            {features.map(([icon, title, body]) => (
              <View key={title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color={BLUE}
                  />
                </View>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureBody}>{body}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Closing banner */}
      <View
        style={[styles.bannerWrap, mobile && styles.shellMobile]}
        onLayout={trackSection('about')}
      >
        <LinearGradient
          colors={['#2a6fec', '#4f8ef2', '#9cc3f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={[styles.banner, mobile && styles.bannerMobile]}
        >
          <Scenery
            tone="onBlue"
            style={[
              styles.scenery,
              mobile ? styles.bannerSceneryMobile : styles.bannerScenery,
            ]}
          />

          <View style={styles.bannerCopy}>
            <Text style={[styles.bannerTitle, mobile && styles.bannerTitleMobile]}>
              Know Before You Go
            </Text>
            <Text style={styles.bannerBody}>
              Stop discovering visa problems after booking your flights. Plan
              ahead with real-time travel info, visa requirements and smart
              route suggestions.
            </Text>
            <CTAButton variant="light" />
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

function CompareMark({ value }: { value: boolean }) {
  return value ? (
    <Ionicons name="checkmark-circle" size={21} color={GREEN} />
  ) : (
    <Ionicons name="close" size={21} color={RED} />
  );
}

const shadow = Platform.select({
  web: { boxShadow: '0 12px 32px rgba(34, 76, 140, 0.08)' } as any,
  default: {
    shadowColor: '#224c8c',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  pageContent: { paddingBottom: 40 },

  shell: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  shellMobile: { paddingHorizontal: 16 },

  // Header
  header: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { transform: [{ rotate: '-30deg' }] },
  brandText: { fontSize: 22, fontWeight: '600', color: BLUE, letterSpacing: -0.3 },
  brandBold: { fontWeight: '800', color: BLUE_DARK },
  navLinks: { flexDirection: 'row', gap: 36 },
  navItem: { alignItems: 'center', paddingTop: 6 },
  navText: { color: '#43536b', fontSize: 14, fontWeight: '500' },
  navTextActive: { color: NAVY, fontWeight: '700' },
  navUnderline: { marginTop: 8, height: 3, width: 26, borderRadius: 2 },
  navUnderlineActive: { backgroundColor: BLUE },

  // Buttons
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: BLUE,
    borderRadius: 999,
    paddingHorizontal: 28,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...shadow,
  },
  ctaSmall: { height: 42, paddingHorizontal: 20, alignSelf: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaTextSmall: { fontSize: 14 },
  ctaLight: { backgroundColor: '#fff' },
  ctaLightText: { color: BLUE },

  // Hero
  heroBand: { width: '100%', overflow: 'hidden' },
  scenery: { position: 'absolute', right: 0, bottom: 0 },
  heroScenery: { top: 60, width: '62%' },
  heroSceneryMobile: { height: 240, width: '100%' },
  hero: { paddingTop: 36, paddingBottom: 72, maxWidth: 520 },
  heroMobile: { paddingTop: 20, paddingBottom: 250, maxWidth: undefined },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1ecfd',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 22,
  },
  eyebrowText: {
    color: BLUE_DARK,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: NAVY,
    fontSize: 64,
    lineHeight: 68,
    fontWeight: '800',
    letterSpacing: -2,
  },
  heroTitleAccent: { color: BLUE, marginBottom: 22 },
  heroTitleMobile: { fontSize: 44, lineHeight: 50, letterSpacing: -1.2 },
  heroBody: {
    color: MUTED,
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 30,
  },
  heroBodyMobile: { fontSize: 16, lineHeight: 25 },

  // Sections
  section: { paddingTop: 56 },
  sectionTitle: {
    color: NAVY,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 28,
  },
  sectionTitleMobile: { fontSize: 25 },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    marginTop: -14,
    marginBottom: 32,
  },

  // Comparison table
  compareCard: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    ...shadow,
  },
  compareRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  compareRowLast: { borderBottomWidth: 0 },
  compareHeadRow: { minHeight: 54 },
  compareFeature: {
    flex: 1.4,
    alignSelf: 'center',
    paddingHorizontal: 24,
    color: '#2c3b52',
    fontSize: 14,
  },
  compareFeatureMobile: { paddingHorizontal: 14, fontSize: 13 },
  compareHeadText: {
    color: '#2c3b52',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  compareCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
  },
  oursHead: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderLeftColor: '#3b82f6',
  },
  oursHeadText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  oursCell: { backgroundColor: '#f1f6ff' },

  // Feature cards
  cardGrid: { flexDirection: 'row', gap: 18 },
  cardGridMobile: { flexDirection: 'column' },
  featureCard: {
    flex: 1,
    padding: 28,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    ...shadow,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e6effd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: { color: NAVY, fontSize: 19, fontWeight: '700', marginBottom: 10 },
  featureBody: { color: MUTED, fontSize: 15, lineHeight: 23 },

  // Banner
  bannerWrap: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  banner: {
    borderRadius: 22,
    minHeight: 220,
    paddingHorizontal: 48,
    paddingVertical: 40,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bannerMobile: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 170 },
  bannerScenery: { top: 0, width: '55%' },
  bannerSceneryMobile: { height: 170, width: '100%' },
  bannerCopy: { maxWidth: 460 },
  bannerTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  bannerTitleMobile: { fontSize: 30 },
  bannerBody: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
});
