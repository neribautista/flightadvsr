// components/PassportSelector.tsx — FlightAdvsr
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';

const PASSPORTS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
];

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export default function PassportSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = PASSPORTS.find(p => p.code === value);
  const filtered = PASSPORTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={styles.triggerFlag}>{selected?.flag || '🌍'}</Text>
        <View style={styles.triggerMid}>
          <Text style={styles.triggerLabel}>Passport country</Text>
          <Text style={styles.triggerValue}>{selected?.name || 'Select country'}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select passport</Text>
            <TextInput
              style={styles.search}
              placeholder="Search country…"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.map(p => (
                <TouchableOpacity
                  key={p.code}
                  style={[styles.option, p.code === value && styles.optionActive]}
                  onPress={() => { onChange(p.code); setOpen(false); setSearch(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionFlag}>{p.flag}</Text>
                  <Text style={[styles.optionName, p.code === value && styles.optionNameActive]}>
                    {p.name}
                  </Text>
                  <Text style={styles.optionCode}>{p.code}</Text>
                  {p.code === value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 13,
    gap: 12,
    marginBottom: 10,
  },
  triggerFlag: { fontSize: 24 },
  triggerMid: { flex: 1 },
  triggerLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  triggerValue: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  chevron: { color: Colors.textMuted, fontSize: 20 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  search: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    color: Colors.text,
    padding: 11,
    fontSize: 14,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 12,
  },
  optionActive: { backgroundColor: Colors.accentLight },
  optionFlag: { fontSize: 22 },
  optionName: { flex: 1, color: Colors.textSub, fontSize: 14 },
  optionNameActive: { color: Colors.accent, fontWeight: '500' },
  optionCode: { color: Colors.textMuted, fontSize: 12, letterSpacing: 0.5 },
  check: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  closeBtn: {
    marginTop: 12,
    backgroundColor: Colors.accentLight,
    borderRadius: 11,
    padding: 13,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderActive,
  },
  closeBtnText: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
});
