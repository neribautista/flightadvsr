// components/VisaBanner.tsx — FlightAdvsr
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Colors } from '@/constants/theme';
import { DestinationVisaInfo, VisaStatus } from '@/services/aiService';

interface Props { visa: DestinationVisaInfo; }

const CONFIG: Record<VisaStatus, { icon: string; label: string; color: string; bg: string; border: string }> = {
  visa_free:       { icon: '✓', label: 'Visa-free entry',     color: Colors.success, bg: Colors.successBg, border: Colors.successBorder },
  visa_required:   { icon: '!', label: 'Visa required',       color: Colors.danger,  bg: Colors.dangerBg,  border: Colors.dangerBorder },
  e_visa:          { icon: '↗', label: 'e-Visa required',     color: Colors.warning, bg: Colors.warningBg, border: Colors.warningBorder },
  on_arrival:      { icon: '✈', label: 'Visa on arrival',     color: Colors.warning, bg: Colors.warningBg, border: Colors.warningBorder },
  visa_on_arrival: { icon: '✈', label: 'Visa on arrival',     color: Colors.warning, bg: Colors.warningBg, border: Colors.warningBorder },
  check_embassy:   { icon: '?', label: 'Verify with embassy', color: Colors.info,    bg: Colors.infoBg,    border: Colors.infoBorder },
};

export default function VisaBanner({ visa }: Props) {
  const cfg = CONFIG[visa.visaStatus] || CONFIG.check_embassy;
  return (
    <View style={[styles.banner, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <View style={[styles.iconBox, { borderColor: cfg.border }]}>
        <Text style={[styles.iconText, { color: cfg.color }]}>{cfg.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
        <Text style={styles.country}>{visa.country}</Text>
        <Text style={styles.note}>{visa.visaNote}</Text>
        {visa.stayLimit && (
          <View style={styles.stayRow}>
            <Text style={styles.stayIcon}>🕐</Text>
            <Text style={styles.stay}>Max stay: {visa.stayLimit}</Text>
          </View>
        )}
        {visa.applyUrl && visa.visaStatus !== 'visa_free' && (
          <TouchableOpacity
            style={[styles.applyBtn, { borderColor: cfg.border }]}
            onPress={() => Linking.openURL(visa.applyUrl!)}
          >
            <Text style={[styles.applyBtnText, { color: cfg.color }]}>Apply for visa →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 13,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
  },
  content: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  country: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  note: {
    color: Colors.textSub,
    fontSize: 13,
    lineHeight: 18,
  },
  stayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  stayIcon: { fontSize: 12 },
  stay: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  applyBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
