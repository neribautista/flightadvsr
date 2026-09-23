import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
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
import { LinearGradient } from 'expo-linear-gradient';

import StepProgress from '../../components/onboarding/StepProgress';
import { useTrip } from '../../context/TripContenxt';
import {
  AirportSelection,
  TripType,
} from '../../types/trip';
import { COUNTRY_OPTIONS } from '../../data/countries';
import { searchAirports } from '../../data/airports';
const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#61718a';
const BORDER = '#e7edf5';
const BG = '#f8fbff';
const ERROR = '#dc3545';

const passports = COUNTRY_OPTIONS;

const availableVisas = [
  'United States Visa',
  'Schengen Visa',
  'United Kingdom Visa',
  'Canada Visa',
  'Japan Visa',
  'Australia Visa',
];

const tripTypes: {
  label: string;
  value: TripType;
}[] = [
  {
    label: 'Leisure',
    value: 'leisure',
  },
  {
    label: 'Business',
    value: 'business',
  },
  {
    label: 'Family',
    value: 'family',
  },
  {
    label: 'Study',
    value: 'study',
  },
  {
    label: 'Backpacking',
    value: 'backpacking',
  },
  {
    label: 'Other',
    value: 'other',
  },
];

type FieldName =
  | 'passport'
  | 'origin'
  | 'tripType';

export default function TravelerScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;

  const {
    travelerData,
    updateTravelerData,
  } = useTrip();

  const [passportOpen, setPassportOpen] =
    useState(false);

  const [passportSearch, setPassportSearch] =
    useState('');

  const [visaOpen, setVisaOpen] =
    useState(false);

  const [tripTypeOpen, setTripTypeOpen] =
    useState(false);

  const [originQuery, setOriginQuery] =
    useState(travelerData.origin?.label ?? '');

  const [errors, setErrors] =
    useState<Partial<Record<FieldName, string>>>({});

  const selectedPassport = useMemo(
    () =>
      passports.find(
        (passport) =>
          passport.code ===
          travelerData.passportCode,
      ),
    [travelerData.passportCode],
  );

  const filteredPassports = useMemo(() => {
    const query = passportSearch.trim().toLowerCase();
    if (!query) return passports;

    return passports.filter(
      (passport) =>
        passport.country.toLowerCase().includes(query) ||
        passport.code.toLowerCase().includes(query),
    );
  }, [passportSearch]);

  const filteredOrigins = useMemo(() => {
    const query = originQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return [];
    }

    return searchAirports(query, { limit: 8 });
  }, [originQuery]);

  const clearError = (field: FieldName) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const selectPassport = (
    passport: (typeof passports)[number],
  ) => {
    updateTravelerData({
      passportCountry: passport.country,
      passportCode: passport.code,
    });

    setPassportOpen(false);
    setPassportSearch('');
    clearError('passport');
  };

  const toggleVisa = (visa: string) => {
    const alreadySelected =
      travelerData.existingVisas.includes(visa);

    updateTravelerData({
      existingVisas: alreadySelected
        ? travelerData.existingVisas.filter(
            (item: string) => item !== visa,
          )
        : [
            ...travelerData.existingVisas,
            visa,
          ],
    });
  };

  const selectOrigin = (
    airport: AirportSelection,
  ) => {
    updateTravelerData({
      origin: airport,
    });

    setOriginQuery(airport.label);
    clearError('origin');
  };

  const selectTripType = (
    tripType: TripType,
  ) => {
    updateTravelerData({
      tripType,
    });

    setTripTypeOpen(false);
    clearError('tripType');
  };

  const validate = () => {
    const nextErrors: Partial<
      Record<FieldName, string>
    > = {};

    if (!travelerData.passportCode) {
      nextErrors.passport =
        'Please select your passport.';
    }

    if (!travelerData.origin) {
      nextErrors.origin =
        'Please select your departure airport.';
    }

    if (!travelerData.tripType) {
      nextErrors.tripType =
        'Please select a trip type.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    router.push('/onboarding/trip');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
      >
        <View style={styles.shell}>
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

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  AI
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.exitButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.exitButtonText}>
                Save & exit
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>
              Let&apos;s plan your next adventure ✈️
            </Text>

            <Text style={styles.subtitle}>
              Answer a few questions and
              FlightADVSR will build the smartest
              itinerary based on your passport,
              visas, budget, and travel
              preferences.
            </Text>
          </View>

          <StepProgress currentStep={1} />

          <View
            style={[
              styles.content,
              desktop
                ? styles.contentDesktop
                : styles.contentMobile,
            ]}
          >
            <View
              style={[
                styles.formCard,
                desktop && styles.formCardDesktop,
              ]}
            >
              <FormField
                icon="document-text-outline"
                label="What passport do you travel with?"
                error={errors.passport}
              >
                <DropdownButton
                  placeholder="Select your passport"
                  value={
                    selectedPassport
                      ? `${selectedPassport.flag} ${selectedPassport.country}`
                      : ''
                  }
                  open={passportOpen}
                  onPress={() =>
                    setPassportOpen(
                      (current) => !current,
                    )
                  }
                />

                {passportOpen && (
                  <DropdownMenu scrollable>
                    <TextInput
                      value={passportSearch}
                      onChangeText={setPassportSearch}
                      placeholder="Search by country or code"
                      placeholderTextColor="#9ca9ba"
                      style={styles.dropdownSearch}
                      autoFocus={Platform.OS === 'web'}
                    />

                    {filteredPassports.map((passport) => (
                      <DropdownOption
                        key={passport.code}
                        label={`${passport.flag} ${passport.country}`}
                        selected={
                          passport.code ===
                          travelerData.passportCode
                        }
                        onPress={() =>
                          selectPassport(passport)
                        }
                      />
                    ))}

                    {filteredPassports.length === 0 && (
                      <Text style={styles.noResultsText}>
                        No matching country found.
                      </Text>
                    )}
                  </DropdownMenu>
                )}
              </FormField>

              <FormField
                icon="id-card-outline"
                label="Do you have any visas already?"
              >
                <DropdownButton
                  placeholder="Select or type any visas you hold"
                  value={
                    travelerData.existingVisas
                      .length > 0
                      ? `${travelerData.existingVisas.length} visa${
                          travelerData.existingVisas
                            .length === 1
                            ? ''
                            : 's'
                        } selected`
                      : ''
                  }
                  open={visaOpen}
                  onPress={() =>
                    setVisaOpen(
                      (current) => !current,
                    )
                  }
                />

                {visaOpen && (
                  <DropdownMenu>
                    {availableVisas.map((visa) => (
                      <DropdownOption
                        key={visa}
                        label={visa}
                        selected={travelerData.existingVisas.includes(
                          visa,
                        )}
                        onPress={() =>
                          toggleVisa(visa)
                        }
                      />
                    ))}
                  </DropdownMenu>
                )}

                {travelerData.existingVisas
                  .length > 0 && (
                  <View style={styles.chipWrap}>
                    {travelerData.existingVisas.map(
                      (visa: string) => (
                        <Pressable
                          key={visa}
                          style={styles.chip}
                          onPress={() =>
                            toggleVisa(visa)
                          }
                        >
                          <Text
                            style={styles.chipText}
                          >
                            {visa}
                          </Text>

                          <Ionicons
                            name="close"
                            size={13}
                            color={BLUE}
                          />
                        </Pressable>
                      ),
                    )}
                  </View>
                )}
              </FormField>

              <FormField
                icon="airplane-outline"
                label="Where are you flying from?"
                error={errors.origin}
              >
                <View
                  style={[
                    styles.inputContainer,
                    errors.origin ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={MUTED}
                  />

                  <TextInput
                    style={styles.textInput}
                    value={originQuery}
                    onChangeText={(value) => {
                      setOriginQuery(value);

                      if (
                        value !==
                        travelerData.origin?.label
                      ) {
                        updateTravelerData({
                          origin: null,
                        });
                      }

                      clearError('origin');
                    }}
                    placeholder="Search city, country or airport code"
                    placeholderTextColor="#9ca9ba"
                    autoCapitalize="words"
                  />

                  <Ionicons
                    name="locate-outline"
                    size={18}
                    color={BLUE}
                  />
                </View>

                {filteredOrigins.length > 0 &&
                  !travelerData.origin && (
                    <DropdownMenu>
                      {filteredOrigins.map(
                        (airport) => (
                          <DropdownOption
                            key={airport.code}
                            label={`${airport.label} · ${airport.city}, ${airport.country}`}
                            selected={false}
                            onPress={() =>
                              selectOrigin(airport)
                            }
                          />
                        ),
                      )}
                    </DropdownMenu>
                  )}
              </FormField>

              <FormField
                icon="briefcase-outline"
                label="What type of trip is this?"
                error={errors.tripType}
              >
                <DropdownButton
                  placeholder="Select trip type"
                  value={
                    tripTypes.find(
                      (item) =>
                        item.value ===
                        travelerData.tripType,
                    )?.label ?? ''
                  }
                  open={tripTypeOpen}
                  onPress={() =>
                    setTripTypeOpen(
                      (current) => !current,
                    )
                  }
                />

                {tripTypeOpen && (
                  <DropdownMenu>
                    {tripTypes.map((tripType) => (
                      <DropdownOption
                        key={tripType.value}
                        label={tripType.label}
                        selected={
                          tripType.value ===
                          travelerData.tripType
                        }
                        onPress={() =>
                          selectTripType(
                            tripType.value,
                          )
                        }
                      />
                    ))}
                  </DropdownMenu>
                )}
              </FormField>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text
                  style={styles.continueButtonText}
                >
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>

              <View style={styles.securityRow}>
                <Ionicons
                  name="lock-closed"
                  size={14}
                  color="#9aa8b9"
                />

                <Text style={styles.securityText}>
                  Your data is secure and never
                  shared.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.visualPanel,
                desktop &&
                  styles.visualPanelDesktop,
              ]}
            >
              <View style={styles.mapGlowOne} />
              <View style={styles.mapGlowTwo} />

              <Ionicons
                name="location"
                size={48}
                color={BLUE}
                style={styles.mapPin}
              />

              <Ionicons
                name="airplane"
                size={42}
                color={BLUE}
                style={styles.mapPlane}
              />

              <View style={styles.flightPathOne} />
              <View style={styles.flightPathTwo} />

              <View style={styles.mapDotOne} />
              <View style={styles.mapDotTwo} />
              <View style={styles.mapDotThree} />
              <View style={styles.mapDotFour} />

              <View style={styles.checkCard}>
                <View style={styles.checkTitleRow}>
                  <LinearGradient
                    colors={[
                      '#dceaff',
                      '#f2eaff',
                    ]}
                    style={styles.sparkleCircle}
                  >
                    <Ionicons
                      name="sparkles"
                      size={22}
                      color={BLUE}
                    />
                  </LinearGradient>

                  <Text style={styles.checkTitle}>
                    AI will automatically check:
                  </Text>
                </View>

                {[
                  'Visa requirements',
                  'Transit restrictions',
                  'Passport validity',
                  'Best flight value',
                  'Border entry requirements',
                ].map((item) => (
                  <View
                    key={item}
                    style={styles.checkRow}
                  >
                    <View
                      style={styles.checkIcon}
                    >
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#ffffff"
                      />
                    </View>

                    <Text
                      style={styles.checkText}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormField({
  icon,
  label,
  error,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldRow}>
        <View style={styles.fieldIcon}>
          <Ionicons
            name={icon}
            size={21}
            color={NAVY}
          />
        </View>

        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>
            {label}
          </Text>

          {children}

          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function DropdownButton({
  placeholder,
  value,
  open,
  onPress,
}: {
  placeholder: string;
  value: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.dropdownButton}
      onPress={onPress}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.dropdownText,
          !value && styles.placeholderText,
        ]}
      >
        {value || placeholder}
      </Text>

      <Ionicons
        name={
          open
            ? 'chevron-up'
            : 'chevron-down'
        }
        size={18}
        color={MUTED}
      />
    </TouchableOpacity>
  );
}

function DropdownMenu({
  children,
  scrollable = false,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  if (scrollable) {
    return (
      <View style={styles.dropdownMenu}>
        <ScrollView
          style={styles.dropdownScroll}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.dropdownMenu}>
      {children}
    </View>
  );
}

function DropdownOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.dropdownOption,
        selected &&
          styles.dropdownOptionSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.dropdownOptionText,
          selected &&
            styles.dropdownOptionTextSelected,
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

const webShadow = Platform.select({
  web: {
    boxShadow:
      '0 18px 50px rgba(28, 72, 120, 0.09)',
  } as never,
  default: {},
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  page: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingBottom: 40,
  },

  shell: {
    width: '100%',
    maxWidth: 1500,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 42,
    paddingVertical: 16,
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
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

  brandText: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '800',
  },

  brandAccent: {
    color: BLUE,
  },

  aiBadge: {
    backgroundColor: '#eaf2ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  aiBadgeText: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '800',
  },

  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
  },

  exitButtonText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '700',
  },

  intro: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 30,
  },

  title: {
    color: NAVY,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1.2,
  },

  subtitle: {
    maxWidth: 720,
    marginTop: 12,
    color: MUTED,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },

  content: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    marginTop: 36,
    paddingHorizontal: 24,
    gap: 26,
  },

  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  contentMobile: {
    flexDirection: 'column',
  },

  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 30,
    ...webShadow,
  },

  formCardDesktop: {
    width: '47%',
  },

  field: {
    marginBottom: 22,
  },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },

  fieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#eaf3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  fieldContent: {
    flex: 1,
  },

  fieldLabel: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 9,
  },

  dropdownButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    flex: 1,
    color: NAVY,
    fontSize: 14,
    marginRight: 10,
  },

  placeholderText: {
    color: '#9ca9ba',
  },

  dropdownMenu: {
    marginTop: 7,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    zIndex: 20,
  },

  dropdownScroll: {
    maxHeight: 320,
  },

  dropdownSearch: {
    minHeight: 44,
    margin: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    paddingHorizontal: 12,
    color: NAVY,
    backgroundColor: BG,
    fontSize: 14,
  },

  noResultsText: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 18,
  },

  dropdownOption: {
    minHeight: 45,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f3f7',
  },

  dropdownOptionSelected: {
    backgroundColor: '#f2f7ff',
  },

  dropdownOptionText: {
    flex: 1,
    color: NAVY,
    fontSize: 13,
    marginRight: 10,
  },

  dropdownOptionTextSelected: {
    color: BLUE,
    fontWeight: '700',
  },

  inputContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  inputError: {
    borderColor: ERROR,
  },

  textInput: {
    flex: 1,
    minHeight: 48,
    color: NAVY,
    fontSize: 14,
    outlineStyle: 'none',
  } as never,

  errorText: {
    color: ERROR,
    fontSize: 12,
    marginTop: 6,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#edf5ff',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  chipText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '700',
  },

  continueButton: {
    minHeight: 54,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  securityRow: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  securityText: {
    color: '#9aa8b9',
    fontSize: 11,
  },

  visualPanel: {
    minHeight: 560,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: '#edf3fa',
    position: 'relative',
  },

  visualPanelDesktop: {
    flex: 1,
  },

  mapGlowOne: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor:
      'rgba(205, 227, 255, 0.62)',
    left: -120,
    top: 110,
  },

  mapGlowTwo: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor:
      'rgba(232, 243, 255, 0.72)',
    right: -190,
    top: -60,
  },

  mapPin: {
    position: 'absolute',
    left: '17%',
    top: '34%',
  },

  mapPlane: {
    position: 'absolute',
    right: '14%',
    top: '14%',
    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },

  flightPathOne: {
    position: 'absolute',
    width: '53%',
    top: '28%',
    left: '26%',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#77acf0',
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

  flightPathTwo: {
    position: 'absolute',
    width: '48%',
    top: '56%',
    left: '25%',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#77acf0',
    transform: [
      {
        rotate: '11deg',
      },
    ],
  },

  mapDotOne: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BLUE,
    left: '51%',
    top: '30%',
  },

  mapDotTwo: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BLUE,
    left: '60%',
    top: '39%',
  },

  mapDotThree: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BLUE,
    left: '72%',
    top: '49%',
  },

  mapDotFour: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLUE,
    left: '46%',
    top: '66%',
  },

  checkCard: {
    position: 'absolute',
    width: 345,
    maxWidth: '82%',
    right: '10%',
    bottom: 28,
    padding: 23,
    borderRadius: 18,
    backgroundColor:
      'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#edf1f7',
    ...webShadow,
  },

  checkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 18,
  },

  sparkleCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkTitle: {
    flex: 1,
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 14,
  },

  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkText: {
    color: MUTED,
    fontSize: 13,
  },
});