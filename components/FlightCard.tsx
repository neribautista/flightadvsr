// components/FlightCard.tsx — FlightAdvsr global design
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Colors } from '@/constants/theme';
import { FlightResult, VisaStatus } from '@/services/aiService';

interface Props { flight: FlightResult; }

const VISA_CONFIG: Record<VisaStatus, { label: string; color: string; bg: string; border: string }> = {
  visa_free:       { label: 'Visa-free',       color: Colors.success,  bg: Colors.successBg,  border: Colors.successBorder },
  visa_required:   { label: 'Visa required',   color: Colors.danger,   bg: Colors.dangerBg,   border: Colors.dangerBorder },
  e_visa:          { label: 'e-Visa needed',   color: Colors.warning,  bg: Colors.warningBg,  border: Colors.warningBorder },
  on_arrival:      { label: 'Visa on arrival', color: Colors.warning,  bg: Colors.warningBg,  border: Colors.warningBorder },
  visa_on_arrival: { label: 'Visa on arrival', color: Colors.warning,  bg: Colors.warningBg,  border: Colors.warningBorder },
  check_embassy:   { label: 'Check embassy',   color: Colors.info,     bg: Colors.infoBg,     border: Colors.infoBorder },
};

export default function FlightCard({ flight }: Props) {
  const hasWarning = flight.stops.some(s =>
    s.visaStatus === 'visa_required' || s.visaStatus === 'e_visa' ||
    s.visaStatus === 'on_arrival' || s.visaStatus === 'visa_on_arrival'
  );

  return (
    <View style={[styles.card, hasWarning && styles.cardWarning]}>

      {/* Top row: airline + price */}
      <View style={styles.headerRow}>
        <View style={styles.airlineRow}>
          <View style={styles.airlineLogo}>
            <Text style={styles.airlineCode}>{flight.airlineCode}</Text>
          </View>
          <View>
            <Text style={styles.airlineName}>{flight.airline}</Text>
            <Text style={styles.cabinClass}>{flight.cabinClass}</Text>
          </View>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>${flight.price}</Text>
          <Text style={styles.priceSub}>per person</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Text style={styles.routeTime}>{flight.departTime}</Text>
          <Text style={styles.routeCode}>{flight.fromCode}</Text>
        </View>

        <View style={styles.routeMiddle}>
          <Text style={styles.routeDuration}>{flight.duration}</Text>
          <View style={styles.routeLineRow}>
            <View style={styles.routeCircle} />
            <View style={styles.routeBar} />
            <Text style={styles.routePlane}>✈</Text>
            <View style={styles.routeBar} />
            <View style={styles.routeCircle} />
          </View>
          <Text style={styles.stopsLabel}>
            {flight.stops.length === 0 ? 'Nonstop' : `${flight.stops.length} stop${flight.stops.length > 1 ? 's' : ''}`}
          </Text>
        </View>

        <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeTime}>{flight.arriveTime}</Text>
          <Text style={styles.routeCode}>{flight.toCode}</Text>
        </View>
      </View>

      {/* Layover visa badges */}
      {flight.stops.length > 0 && (
        <View style={styles.stopsSection}>
          <Text style={styles.stopsSectionLabel}>Layovers & transit requirements</Text>
          {flight.stops.map((stop, i) => {
            const cfg = VISA_CONFIG[stop.visaStatus] || VISA_CONFIG.check_embassy;
            return (
              <View key={i} style={[styles.stopRow, { borderColor: cfg.border, backgroundColor: cfg.bg }]}>
                <View style={styles.stopLeft}>
                  <Text style={styles.stopCode}>{stop.airportCode}</Text>
                  <Text style={styles.stopCity}>{stop.airport}</Text>
                  <Text style={styles.stopDuration}>{stop.layoverDuration}</Text>
                </View>
                <View style={styles.stopRight}>
                  <View style={[styles.visaPill, { borderColor: cfg.border }]}>
                    <View style={[styles.visaDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.visaPillText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  <Text style={styles.stopNote}>{stop.visaNote}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Book button */}
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => Linking.openURL(flight.deepLink)}
        activeOpacity={0.8}
      >
        <Text style={styles.bookBtnText}>Continue to {flight.airline}</Text>
        <Text style={styles.bookBtnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  cardWarning: {
    borderColor: Colors.warningBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  airlineLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airlineCode: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  airlineName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  cabinClass: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  priceCol: { alignItems: 'flex-end' },
  price: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  priceSub: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.borderSubtle,
    marginBottom: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  routePoint: { width: 60 },
  routeTime: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  routeCode: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 2,
  },
  routeMiddle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  routeDuration: {
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 5,
  },
  routeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  routeCircle: {
    width: 5,
    height: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    backgroundColor: 'transparent',
  },
  routeBar: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  routePlane: {
    color: Colors.accent,
    fontSize: 14,
    marginHorizontal: 5,
  },
  stopsLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  stopsSection: {
    gap: 7,
    marginBottom: 14,
  },
  stopsSectionLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stopRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 10,
    gap: 12,
  },
  stopLeft: { width: 75 },
  stopCode: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  stopCity: {
    color: Colors.textSub,
    fontSize: 11,
    marginTop: 1,
  },
  stopDuration: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  stopRight: { flex: 1 },
  visaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  visaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  visaPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stopNote: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    paddingVertical: 11,
    gap: 6,
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  bookBtnText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  bookBtnArrow: {
    color: Colors.accent,
    fontSize: 14,
  },
});
