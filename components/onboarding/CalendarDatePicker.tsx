import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#61718a';
const BORDER = '#e7edf5';
const BG = '#f8fbff';

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  placeholder?: string;
  hasError?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function displayDate(value: string): string {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CalendarDatePicker({
  value,
  onChange,
  minimumDate = new Date(),
  placeholder = 'Select a date',
  hasError = false,
}: CalendarDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDate(value);
  const normalizedMinimum = startOfDay(minimumDate);
  const initialMonth = selectedDate && selectedDate >= normalizedMinimum
    ? selectedDate
    : normalizedMinimum;
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let index = 0; index < firstWeekday; index += 1) cells.push(null);
    for (let day = 1; day <= count; day += 1) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [visibleMonth]);

  const previousMonthDisabled =
    visibleMonth.getFullYear() === normalizedMinimum.getFullYear() &&
    visibleMonth.getMonth() === normalizedMinimum.getMonth();

  const openCalendar = () => {
    const nextInitial = selectedDate && selectedDate >= normalizedMinimum
      ? selectedDate
      : normalizedMinimum;
    setVisibleMonth(new Date(nextInitial.getFullYear(), nextInitial.getMonth(), 1));
    setOpen(true);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.trigger, hasError && styles.errorBorder]}
        onPress={openCalendar}
      >
        <Ionicons name="calendar-outline" size={18} color={MUTED} />
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {displayDate(value) || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={17} color={MUTED} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.navButton, previousMonthDisabled && styles.navButtonDisabled]}
                disabled={previousMonthDisabled}
                onPress={() =>
                  setVisibleMonth((current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
              >
                <Ionicons name="chevron-back" size={20} color={previousMonthDisabled ? '#b8c2cf' : NAVY} />
              </TouchableOpacity>

              <Text style={styles.monthTitle}>
                {visibleMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setVisibleMonth((current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
              >
                <Ionicons name="chevron-forward" size={20} color={NAVY} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>{weekday}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((date, index) => {
                if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const normalized = startOfDay(date);
                const disabled = normalized < normalizedMinimum;
                const selected = selectedDate
                  ? formatISODate(normalized) === formatISODate(selectedDate)
                  : false;
                const today = formatISODate(normalized) === formatISODate(new Date());

                return (
                  <TouchableOpacity
                    key={formatISODate(date)}
                    style={[
                      styles.dayCell,
                      selected && styles.selectedDay,
                      today && !selected && styles.todayDay,
                    ]}
                    disabled={disabled}
                    onPress={() => {
                      onChange(formatISODate(date));
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        disabled && styles.disabledDayText,
                        selected && styles.selectedDayText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footer}>
              <Text style={styles.helperText}>Past dates are unavailable.</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
  },
  errorBorder: { borderColor: '#dc3545' },
  triggerText: { flex: 1, color: NAVY, fontSize: 15 },
  placeholder: { color: '#9ba8b8' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 39, 71, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#102747',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  navButtonDisabled: { opacity: 0.5 },
  monthTitle: { color: NAVY, fontWeight: '700', fontSize: 17 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { width: '14.2857%', textAlign: 'center', color: MUTED, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  dayText: { color: NAVY, fontSize: 14, fontWeight: '500' },
  disabledDayText: { color: '#c7cfda' },
  selectedDay: { backgroundColor: BLUE },
  selectedDayText: { color: '#ffffff', fontWeight: '700' },
  todayDay: { borderWidth: 1, borderColor: BLUE },
  footer: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 12, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  helperText: { color: MUTED, fontSize: 12 },
  closeText: { color: BLUE, fontSize: 14, fontWeight: '700' },
});
