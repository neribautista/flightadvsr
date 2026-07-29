import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import StepProgress from '@/components/onboarding/StepProgress';
import { useTrip } from '../../context/TripContenxt';
import {
  CabinClass,
  DeparturePreference,
  OptimizationPriority,
} from '@/types/trip';

const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#61718a';
const BORDER = '#e7edf5';
const BG = '#f8fbff';
const GREEN = '#34b862';

const cabins: {
  label: string;
  value: CabinClass;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: 'Economy',
    value: 'economy',
    icon: 'airplane-outline',
  },
  {
    label: 'Premium Economy',
    value: 'premium_economy',
    icon: 'star-outline',
  },
  {
    label: 'Business',
    value: 'business',
    icon: 'briefcase-outline',
  },
  {
    label: 'First Class',
    value: 'first',
    icon: 'diamond-outline',
  },
];

const airlineOptions = [
  'American Airlines',
  'Delta',
  'United Airlines',
  'Emirates',
  'Qatar Airways',
  'Singapore Airlines',
  'Japan Airlines',
];

const departureOptions: {
  label: string;
  value: DeparturePreference;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: 'Any time',
    value: 'any',
    icon: 'time-outline',
  },
  {
    label: 'Morning',
    value: 'morning',
    icon: 'sunny-outline',
  },
  {
    label: 'Afternoon',
    value: 'afternoon',
    icon: 'partly-sunny-outline',
  },
  {
    label: 'Evening',
    value: 'evening',
    icon: 'moon-outline',
  },
  {
    label: 'Overnight',
    value: 'overnight',
    icon: 'cloudy-night-outline',
  },
];

const priorities: {
  label: string;
  description: string;
  value: OptimizationPriority;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: 'Best overall value',
    description:
      'Balance price, duration, comfort, and visa requirements.',
    value: 'best_value',
    icon: 'sparkles-outline',
  },
  {
    label: 'Lowest price',
    description:
      'Prioritize the cheapest available itinerary.',
    value: 'lowest_price',
    icon: 'cash-outline',
  },
  {
    label: 'Shortest duration',
    description:
      'Prioritize faster routes and shorter connections.',
    value: 'shortest_duration',
    icon: 'flash-outline',
  },
];

export default function PreferencesScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;

  const {
    preferences,
    updatePreferences,
  } = useTrip();

  const togglePreferredAirline = (
    airline: string,
  ) => {
    const selected =
      preferences.preferredAirlines.includes(
        airline,
      );

    updatePreferences({
      preferredAirlines: selected
        ? preferences.preferredAirlines.filter(
            (item) => item !== airline,
          )
        : [
            ...preferences.preferredAirlines,
            airline,
          ],
      avoidedAirlines:
        preferences.avoidedAirlines.filter(
          (item) => item !== airline,
        ),
    });
  };

  const toggleAvoidedAirline = (
    airline: string,
  ) => {
    const selected =
      preferences.avoidedAirlines.includes(
        airline,
      );

    updatePreferences({
      avoidedAirlines: selected
        ? preferences.avoidedAirlines.filter(
            (item) => item !== airline,
          )
        : [
            ...preferences.avoidedAirlines,
            airline,
          ],
      preferredAirlines:
        preferences.preferredAirlines.filter(
          (item) => item !== airline,
        ),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.brand}
            onPress={() => router.push('/')}
          >
            <LinearGradient
              colors={['#49a4ff', '#1d69ed']}
              style={styles.brandMark}
            >
              <Ionicons
                name="airplane"
                size={20}
                color="#ffffff"
              />
            </LinearGradient>

            <Text style={styles.brandText}>
              Flight
              <Text style={styles.brandAccent}>
                ADVSR
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.exitButtonText}>
              Save & exit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>
            Personalize your journey
          </Text>

          <Text style={styles.subtitle}>
            Tell us what matters most, and our AI
            will rank routes around your comfort,
            timing, and budget.
          </Text>
        </View>

        <StepProgress currentStep={3} />

        <View
          style={[
            styles.content,
            desktop
              ? styles.contentDesktop
              : styles.contentMobile,
          ]}
        >
          <View style={styles.mainColumn}>
            <PreferenceSection
              title="Cabin class"
              subtitle="Choose the cabin you want us to prioritize."
              icon="airplane-outline"
            >
              <View style={styles.optionGrid}>
                {cabins.map((cabin) => (
                  <SelectionCard
                    key={cabin.value}
                    label={cabin.label}
                    icon={cabin.icon}
                    selected={
                      preferences.cabinClass ===
                      cabin.value
                    }
                    onPress={() =>
                      updatePreferences({
                        cabinClass: cabin.value,
                      })
                    }
                  />
                ))}
              </View>
            </PreferenceSection>

            <PreferenceSection
              title="Route priority"
              subtitle="What should FlightADVSR optimize first?"
              icon="options-outline"
            >
              <View style={styles.priorityGrid}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    activeOpacity={0.8}
                    style={[
                      styles.priorityCard,
                      preferences.optimizationPriority ===
                        priority.value &&
                        styles.priorityCardSelected,
                    ]}
                    onPress={() =>
                      updatePreferences({
                        optimizationPriority:
                          priority.value,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.priorityIcon,
                        preferences.optimizationPriority ===
                          priority.value &&
                          styles.priorityIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={priority.icon}
                        size={21}
                        color={
                          preferences.optimizationPriority ===
                          priority.value
                            ? '#ffffff'
                            : BLUE
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.priorityTitle,
                        preferences.optimizationPriority ===
                          priority.value &&
                          styles.selectedText,
                      ]}
                    >
                      {priority.label}
                    </Text>

                    <Text
                      style={
                        styles.priorityDescription
                      }
                    >
                      {priority.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PreferenceSection>

            <PreferenceSection
              title="Preferred departure time"
              subtitle="Choose the time of day you prefer to fly."
              icon="time-outline"
            >
              <View style={styles.chipGrid}>
                {departureOptions.map(
                  (option) => (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.8}
                      style={[
                        styles.timeChip,
                        preferences.departurePreference ===
                          option.value &&
                          styles.timeChipSelected,
                      ]}
                      onPress={() =>
                        updatePreferences({
                          departurePreference:
                            option.value,
                        })
                      }
                    >
                      <Ionicons
                        name={option.icon}
                        size={17}
                        color={
                          preferences.departurePreference ===
                          option.value
                            ? '#ffffff'
                            : BLUE
                        }
                      />

                      <Text
                        style={[
                          styles.timeChipText,
                          preferences.departurePreference ===
                            option.value &&
                            styles.timeChipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </PreferenceSection>

            <PreferenceSection
              title="Preferred airlines"
              subtitle="Select airlines you would like us to prioritize."
              icon="heart-outline"
            >
              <View style={styles.airlineWrap}>
                {airlineOptions.map((airline) => {
                  const selected =
                    preferences.preferredAirlines.includes(
                      airline,
                    );

                  return (
                    <TouchableOpacity
                      key={airline}
                      activeOpacity={0.8}
                      style={[
                        styles.airlineChip,
                        selected &&
                          styles.airlineChipSelected,
                      ]}
                      onPress={() =>
                        togglePreferredAirline(
                          airline,
                        )
                      }
                    >
                      <Ionicons
                        name={
                          selected
                            ? 'checkmark-circle'
                            : 'add-circle-outline'
                        }
                        size={16}
                        color={
                          selected
                            ? '#ffffff'
                            : BLUE
                        }
                      />

                      <Text
                        style={[
                          styles.airlineText,
                          selected &&
                            styles.airlineTextSelected,
                        ]}
                      >
                        {airline}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </PreferenceSection>

            <PreferenceSection
              title="Airlines to avoid"
              subtitle="We will remove these airlines from preferred recommendations."
              icon="close-circle-outline"
            >
              <View style={styles.airlineWrap}>
                {airlineOptions.map((airline) => {
                  const selected =
                    preferences.avoidedAirlines.includes(
                      airline,
                    );

                  return (
                    <TouchableOpacity
                      key={airline}
                      activeOpacity={0.8}
                      style={[
                        styles.avoidChip,
                        selected &&
                          styles.avoidChipSelected,
                      ]}
                      onPress={() =>
                        toggleAvoidedAirline(
                          airline,
                        )
                      }
                    >
                      <Ionicons
                        name={
                          selected
                            ? 'close-circle'
                            : 'close-circle-outline'
                        }
                        size={16}
                        color={
                          selected
                            ? '#ffffff'
                            : '#d44b5e'
                        }
                      />

                      <Text
                        style={[
                          styles.avoidText,
                          selected &&
                            styles.airlineTextSelected,
                        ]}
                      >
                        {airline}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </PreferenceSection>
          </View>

          <View style={styles.sideColumn}>
            <PreferenceSection
              title="Stops and layovers"
              subtitle="Control how much connecting travel is acceptable."
              icon="git-branch-outline"
            >
              <Text style={styles.controlLabel}>
                Maximum stops
              </Text>

              <View style={styles.numberControl}>
                {[0, 1, 2, 3].map((value) => (
                  <TouchableOpacity
                    key={value}
                    activeOpacity={0.8}
                    style={[
                      styles.numberButton,
                      preferences.maximumStops ===
                        value &&
                        styles.numberButtonSelected,
                    ]}
                    onPress={() =>
                      updatePreferences({
                        maximumStops: value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.numberText,
                        preferences.maximumStops ===
                          value &&
                          styles.numberTextSelected,
                      ]}
                    >
                      {value === 3 ? '3+' : value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.controlLabel}>
                Maximum layover
              </Text>

              <View style={styles.numberControl}>
                {[2, 4, 6, 8, 12].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    activeOpacity={0.8}
                    style={[
                      styles.hourButton,
                      preferences.maximumLayoverHours ===
                        hours &&
                        styles.numberButtonSelected,
                    ]}
                    onPress={() =>
                      updatePreferences({
                        maximumLayoverHours:
                          hours,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.numberText,
                        preferences.maximumLayoverHours ===
                          hours &&
                          styles.numberTextSelected,
                      ]}
                    >
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PreferenceSection>

            <PreferenceSection
              title="Travel essentials"
              subtitle="Select the features your itinerary should include."
              icon="checkbox-outline"
            >
              <ToggleRow
                icon="briefcase-outline"
                title="Checked baggage"
                description="Include at least one checked bag."
                value={preferences.checkedBaggage}
                onChange={(checkedBaggage) =>
                  updatePreferences({
                    checkedBaggage,
                  })
                }
              />

              <ToggleRow
                icon="calendar-outline"
                title="Flexible dates"
                description="Search nearby dates for better value."
                value={preferences.flexibleDates}
                onChange={(flexibleDates) =>
                  updatePreferences({
                    flexibleDates,
                  })
                }
              />

              <ToggleRow
                icon="bed-outline"
                title="Hotel recommendations"
                description="Include hotel suggestions with results."
                value={preferences.includeHotels}
                onChange={(includeHotels) =>
                  updatePreferences({
                    includeHotels,
                  })
                }
              />
            </PreferenceSection>

            <PreferenceSection
              title="Accessibility or special assistance"
              subtitle="Share any needs we should account for."
              icon="accessibility-outline"
            >
              <TextInput
                style={styles.accessibilityInput}
                value={
                  preferences.accessibilityNeeds
                }
                onChangeText={(
                  accessibilityNeeds,
                ) =>
                  updatePreferences({
                    accessibilityNeeds,
                  })
                }
                multiline
                placeholder="Wheelchair assistance, dietary requirements, traveling with an infant..."
                placeholderTextColor="#9ba8b8"
              />
            </PreferenceSection>

            <LinearGradient
              colors={['#eaf3ff', '#f7faff']}
              style={styles.summaryCard}
            >
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="sparkles"
                  size={21}
                  color={BLUE}
                />
              </View>

              <Text style={styles.summaryTitle}>
                Your AI search profile
              </Text>

              <SummaryRow
                label="Cabin"
                value={formatLabel(
                  preferences.cabinClass,
                )}
              />

              <SummaryRow
                label="Priority"
                value={formatLabel(
                  preferences.optimizationPriority,
                )}
              />

              <SummaryRow
                label="Stops"
                value={`${preferences.maximumStops} maximum`}
              />

              <SummaryRow
                label="Layover"
                value={`${preferences.maximumLayoverHours} hours maximum`}
              />

              <SummaryRow
                label="Flexible dates"
                value={
                  preferences.flexibleDates
                    ? 'Enabled'
                    : 'Disabled'
                }
              />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={NAVY}
            />

            <Text style={styles.backText}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.continueButton}
            onPress={() =>
              router.push(
                '/onboarding/analyzing',
              )
            }
          >
            <Ionicons
              name="sparkles"
              size={18}
              color="#ffffff"
            />

            <Text style={styles.continueText}>
              Analyze My Trip
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={20}
            color={BLUE}
          />
        </View>

        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>
            {title}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      {children}
    </View>
  );
}

function SelectionCard({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.selectionCard,
        selected && styles.selectionCardSelected,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.selectionIcon,
          selected &&
            styles.selectionIconSelected,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={selected ? '#ffffff' : BLUE}
        />
      </View>

      <Text
        style={[
          styles.selectionLabel,
          selected && styles.selectedText,
        ]}
      >
        {label}
      </Text>

      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={18}
          color={BLUE}
        />
      )}
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={BLUE}
        />
      </View>

      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>
          {title}
        </Text>

        <Text style={styles.toggleDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: '#dfe6ef',
          true: '#9ac4fb',
        }}
        thumbColor={value ? BLUE : '#ffffff'}
      />
    </View>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

function formatLabel(value: string) {
  return value
    .split('_')
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(' ');
}

const shadow = Platform.select({
  web: {
    boxShadow:
      '0 12px 36px rgba(31, 75, 122, 0.08)',
  } as never,
  default: {
    shadowColor: '#173b67',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  page: {
    flexGrow: 1,
    backgroundColor: BG,
    paddingBottom: 40,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 42,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },

  brandText: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '800',
  },

  brandAccent: {
    color: BLUE,
  },

  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
  },

  exitButtonText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '700',
  },

  intro: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 25,
  },

  title: {
    color: NAVY,
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
  },

  subtitle: {
    maxWidth: 670,
    color: MUTED,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 9,
  },

  content: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 30,
    gap: 18,
  },

  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  contentMobile: {
    flexDirection: 'column',
  },

  mainColumn: {
    flex: 1.7,
    gap: 18,
  },

  sideColumn: {
    flex: 1,
    minWidth: 310,
    gap: 18,
  },

  section: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 20,
    ...shadow,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 17,
  },

  sectionIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#edf5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionCopy: {
    flex: 1,
  },

  sectionTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  selectionCard: {
    width: '48%',
    minHeight: 74,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  selectionCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#91bdf5',
  },

  selectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#edf5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionIconSelected: {
    backgroundColor: BLUE,
  },

  selectionLabel: {
    flex: 1,
    color: NAVY,
    fontSize: 11,
    fontWeight: '700',
  },

  selectedText: {
    color: BLUE,
  },

  priorityGrid: {
    flexDirection: 'row',
    gap: 10,
  },

  priorityCard: {
    flex: 1,
    minHeight: 150,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 15,
  },

  priorityCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#91bdf5',
  },

  priorityIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#edf5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  priorityIconSelected: {
    backgroundColor: BLUE,
  },

  priorityTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
  },

  priorityDescription: {
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 6,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  timeChip: {
    minHeight: 39,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  timeChipSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  timeChipText: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '700',
  },

  timeChipTextSelected: {
    color: '#ffffff',
  },

  airlineWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  airlineChip: {
    minHeight: 37,
    paddingHorizontal: 11,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#b9d6fa',
    backgroundColor: '#f7faff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  airlineChipSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  airlineText: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '700',
  },

  airlineTextSelected: {
    color: '#ffffff',
  },

  avoidChip: {
    minHeight: 37,
    paddingHorizontal: 11,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#f1c9d0',
    backgroundColor: '#fff8f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  avoidChipSelected: {
    backgroundColor: '#d44b5e',
    borderColor: '#d44b5e',
  },

  avoidText: {
    color: '#d44b5e',
    fontSize: 10,
    fontWeight: '700',
  },

  controlLabel: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 9,
  },

  numberControl: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 18,
  },

  numberButton: {
    width: 42,
    height: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hourButton: {
    flex: 1,
    height: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  numberButtonSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  numberText: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '800',
  },

  numberTextSelected: {
    color: '#ffffff',
  },

  toggleRow: {
    minHeight: 65,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f3f7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  toggleIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#edf5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  toggleCopy: {
    flex: 1,
    marginRight: 8,
  },

  toggleTitle: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '800',
  },

  toggleDescription: {
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  accessibilityInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    color: NAVY,
    fontSize: 11,
    textAlignVertical: 'top',
  },

  summaryCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d4e5fa',
    ...shadow,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  summaryTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },

  summaryRow: {
    minHeight: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(36,120,243,0.09)',
    paddingVertical: 8,
  },

  summaryLabel: {
    color: MUTED,
    fontSize: 10,
  },

  summaryValue: {
    flex: 1,
    color: NAVY,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
  },

  actions: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 28,
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  backButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  backText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
  },

  continueButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadow,
  },

  continueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});