import React, { useMemo, useState } from 'react';
import {
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
import { LinearGradient } from 'expo-linear-gradient';

import StepProgress from '@/components/onboarding/StepProgress';
import CalendarDatePicker from '@/components/onboarding/CalendarDatePicker';
import { useTrip } from '../../context/TripContenxt';
import { AirportSelection } from '@/types/trip';
import { POPULAR_AIRPORTS, searchAirports } from '@/data/airports';

const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#61718a';
const BORDER = '#e7edf5';
const BG = '#f8fbff';
const ERROR = '#dc3545';
const GREEN = '#34b862';

// Shown in the route overview until the user has picked an airport.
const UNSELECTED_AIRPORT: AirportSelection = {
  code: '---',
  city: 'Not selected',
  country: '',
  label: 'Not selected',
};

type ErrorFields =
  | 'destination'
  | 'departureDate'
  | 'returnDate'
  | 'budget';

export default function TripScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;

  const {
    travelerData,
    tripDetails,
    updateTripDetails,
  } = useTrip();

  const [destinationQuery, setDestinationQuery] =
    useState(tripDetails.destination?.label ?? '');

  const [destinationOpen, setDestinationOpen] =
    useState(false);

  const [currencyOpen, setCurrencyOpen] =
    useState(false);

  const [stopPickerOpen, setStopPickerOpen] =
    useState(false);

  const [stopQuery, setStopQuery] = useState('');

  const [errors, setErrors] = useState<
    Partial<Record<ErrorFields, string>>
  >({});

  const filteredDestinations = useMemo(() => {
    const exclude = travelerData.origin
      ? [travelerData.origin.code]
      : [];

    if (!destinationQuery.trim()) {
      return POPULAR_AIRPORTS.filter(
        (airport) => !exclude.includes(airport.code),
      ).slice(0, 8);
    }

    return searchAirports(destinationQuery, {
      exclude,
      limit: 8,
    });
  }, [destinationQuery, travelerData.origin]);

  const origin =
    travelerData.origin ?? UNSELECTED_AIRPORT;

  const destination =
    tripDetails.destination ?? UNSELECTED_AIRPORT;

  const durationDays = useMemo(() => {
    if (
      !tripDetails.departureDate ||
      !tripDetails.returnDate
    ) {
      return 0;
    }

    const start = new Date(tripDetails.departureDate);
    const end = new Date(tripDetails.returnDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const difference =
      end.getTime() - start.getTime();

    return Math.max(
      0,
      Math.ceil(difference / 86400000),
    );
  }, [
    tripDetails.departureDate,
    tripDetails.returnDate,
  ]);

  const selectDestination = (
    airport: AirportSelection,
  ) => {
    updateTripDetails({
      destination: airport,
    });

    setDestinationQuery(airport.label);
    setDestinationOpen(false);

    setErrors((current) => ({
      ...current,
      destination: undefined,
    }));
  };

  const stopResults = useMemo(() => {
    const exclude = [
      origin.code,
      destination.code,
      ...tripDetails.additionalStops.map(
        (stop) => stop.code,
      ),
    ];

    return searchAirports(stopQuery, {
      exclude,
      limit: 8,
    });
  }, [
    stopQuery,
    origin.code,
    destination.code,
    tripDetails.additionalStops,
  ]);

  const addStop = (airport: AirportSelection) => {
    updateTripDetails({
      additionalStops: [
        ...tripDetails.additionalStops,
        airport,
      ],
    });

    setStopQuery('');
    setStopPickerOpen(false);
  };

  const removeStop = (code: string) => {
    updateTripDetails({
      additionalStops:
        tripDetails.additionalStops.filter(
          (stop) => stop.code !== code,
        ),
    });
  };

  const validate = () => {
    const nextErrors: Partial<
      Record<ErrorFields, string>
    > = {};

    if (!tripDetails.destination) {
      nextErrors.destination =
        'Please select a destination.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departure = tripDetails.departureDate
      ? new Date(`${tripDetails.departureDate}T00:00:00`)
      : null;
    const returning = tripDetails.returnDate
      ? new Date(`${tripDetails.returnDate}T00:00:00`)
      : null;

    if (!departure) {
      nextErrors.departureDate =
        'Please select a departure date.';
    } else if (departure < today) {
      nextErrors.departureDate =
        'Departure cannot be in the past.';
    }

    if (
      tripDetails.tripMode === 'round_trip' &&
      !returning
    ) {
      nextErrors.returnDate =
        'Please select a return date.';
    } else if (
      tripDetails.tripMode === 'round_trip' &&
      departure &&
      returning &&
      returning < departure
    ) {
      nextErrors.returnDate =
        'Return date cannot be before departure.';
    }

    if (tripDetails.budget <= 0) {
      nextErrors.budget =
        'Please enter your total trip budget.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    router.push('/onboarding/preferences');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
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
            activeOpacity={0.8}
            style={styles.exitButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.exitButtonText}>
              Save & exit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressWrap}>
          <StepProgress currentStep={2} />
        </View>

        <View
          style={[
            styles.content,
            desktop
              ? styles.contentDesktop
              : styles.contentMobile,
          ]}
        >
          <View style={styles.formPanel}>
            <TripField
              icon="airplane-outline"
              label="Where are you flying from?"
            >
              <View style={styles.readOnlyInput}>
                <Text style={styles.inputText}>
                  {origin.label}
                </Text>

                <Ionicons
                  name="checkmark"
                  size={18}
                  color={BLUE}
                />
              </View>
            </TripField>

            <TripField
              icon="location-outline"
              label="Where do you want to go?"
              error={errors.destination}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.inputButton,
                  ...(errors.destination ? [styles.errorBorder] : []),
                ]}
                onPress={() =>
                  setDestinationOpen(
                    (current) => !current,
                  )
                }
              >
                <TextInput
                  style={styles.input}
                  value={destinationQuery}
                  onChangeText={(value) => {
                    setDestinationQuery(value);
                    setDestinationOpen(true);

                    if (
                      value !==
                      tripDetails.destination?.label
                    ) {
                      updateTripDetails({
                        destination: null,
                      });
                    }
                  }}
                  placeholder="Search city, country or airport code"
                  placeholderTextColor="#9ba8b8"
                />

                <Ionicons
                  name={
                    destinationOpen
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={18}
                  color={MUTED}
                />
              </TouchableOpacity>

              {destinationOpen && (
                <View style={styles.dropdown}>
                  {filteredDestinations.map(
                    (airport) => (
                      <TouchableOpacity
                        key={airport.code}
                        activeOpacity={0.75}
                        style={styles.dropdownOption}
                        onPress={() =>
                          selectDestination(airport)
                        }
                      >
                        <View style={styles.airportIcon}>
                          <Ionicons
                            name="airplane-outline"
                            size={17}
                            color={BLUE}
                          />
                        </View>

                        <View style={styles.airportCopy}>
                          <Text
                            style={
                              styles.airportLabel
                            }
                          >
                            {airport.city} (
                            {airport.code})
                          </Text>

                          <Text
                            style={
                              styles.airportCountry
                            }
                          >
                            {airport.country}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              )}
            </TripField>

            <TripField
              icon="add-circle-outline"
              label="Would you like to visit another country?"
            >
              {stopPickerOpen ? (
                <>
                  <View style={styles.inputButton}>
                    <TextInput
                      style={styles.input}
                      value={stopQuery}
                      onChangeText={setStopQuery}
                      placeholder="Search city, country or airport code"
                      placeholderTextColor="#9ba8b8"
                      autoFocus
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setStopQuery('');
                        setStopPickerOpen(false);
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={18}
                        color={MUTED}
                      />
                    </TouchableOpacity>
                  </View>

                  {stopResults.length > 0 && (
                    <View style={styles.dropdown}>
                      {stopResults.map((airport) => (
                        <TouchableOpacity
                          key={airport.code}
                          activeOpacity={0.75}
                          style={styles.dropdownOption}
                          onPress={() => addStop(airport)}
                        >
                          <View style={styles.airportIcon}>
                            <Ionicons
                              name="airplane-outline"
                              size={17}
                              color={BLUE}
                            />
                          </View>

                          <View style={styles.airportCopy}>
                            <Text style={styles.airportLabel}>
                              {airport.city} ({airport.code})
                            </Text>

                            <Text style={styles.airportCountry}>
                              {airport.country}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.addStopButton}
                  onPress={() => setStopPickerOpen(true)}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={BLUE}
                  />

                  <Text style={styles.addStopText}>
                    Add stop
                  </Text>
                </TouchableOpacity>
              )}

              {tripDetails.additionalStops.length >
                0 && (
                <View style={styles.stopList}>
                  {tripDetails.additionalStops.map(
                    (stop, index) => (
                      <View
                        key={stop.code}
                        style={styles.stopChip}
                      >
                        <Text style={styles.stopText}>
                          {index + 1}. {stop.city} (
                          {stop.code}), {stop.country}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            removeStop(stop.code)
                          }
                        >
                          <Ionicons
                            name="close"
                            size={16}
                            color={BLUE}
                          />
                        </TouchableOpacity>
                      </View>
                    ),
                  )}
                </View>
              )}
            </TripField>

            <View style={styles.modeRow}>
              <SegmentButton
                label="Round-trip"
                selected={
                  tripDetails.tripMode ===
                  'round_trip'
                }
                onPress={() =>
                  updateTripDetails({
                    tripMode: 'round_trip',
                  })
                }
              />

              <SegmentButton
                label="One-way"
                selected={
                  tripDetails.tripMode ===
                  'one_way'
                }
                onPress={() =>
                  updateTripDetails({
                    tripMode: 'one_way',
                    returnDate: '',
                  })
                }
              />
            </View>

            <TripField
              icon="calendar-outline"
              label="When are you leaving?"
              error={errors.departureDate}
            >
              <CalendarDatePicker
                value={tripDetails.departureDate}
                minimumDate={new Date()}
                hasError={Boolean(errors.departureDate)}
                placeholder="Select departure date"
                onChange={(value) => {
                  const currentReturn = tripDetails.returnDate;
                  updateTripDetails({
                    departureDate: value,
                    returnDate:
                      currentReturn && currentReturn < value
                        ? ''
                        : currentReturn,
                  });
                  setErrors((current) => ({
                    ...current,
                    departureDate: undefined,
                    returnDate: undefined,
                  }));
                }}
              />
            </TripField>

            {tripDetails.tripMode ===
              'round_trip' && (
              <TripField
                icon="calendar-number-outline"
                label="When are you returning?"
                error={errors.returnDate}
              >
                <CalendarDatePicker
                  value={tripDetails.returnDate}
                  minimumDate={
                    tripDetails.departureDate
                      ? new Date(`${tripDetails.departureDate}T00:00:00`)
                      : new Date()
                  }
                  hasError={Boolean(errors.returnDate)}
                  placeholder="Select return date"
                  onChange={(value) => {
                    updateTripDetails({ returnDate: value });
                    setErrors((current) => ({
                      ...current,
                      returnDate: undefined,
                    }));
                  }}
                />
              </TripField>
            )}

            <TripField
              icon="people-outline"
              label="How many travelers?"
            >
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    updateTripDetails({
                      travelers: Math.max(
                        1,
                        tripDetails.travelers - 1,
                      ),
                    })
                  }
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={BLUE}
                  />
                </TouchableOpacity>

                <Text style={styles.counterValue}>
                  {tripDetails.travelers}
                </Text>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    updateTripDetails({
                      travelers:
                        tripDetails.travelers + 1,
                    })
                  }
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={BLUE}
                  />
                </TouchableOpacity>
              </View>
            </TripField>

            <TripField
              icon="wallet-outline"
              label="What is your total trip budget?"
              error={errors.budget}
            >
              <View
                style={[
                  styles.budgetRow,
                  errors.budget ? styles.errorBorder : undefined,
                ]}
              >
                <Text style={styles.currencySymbol}>
                  $
                </Text>

                <TextInput
                  style={styles.input}
                  value={
                    tripDetails.budget > 0
                      ? String(tripDetails.budget)
                      : ''
                  }
                  onChangeText={(value) => {
                    const parsed = Number(
                      value.replace(/[^0-9.]/g, ''),
                    );

                    updateTripDetails({
                      budget:
                        Number.isNaN(parsed)
                          ? 0
                          : parsed,
                    });
                  }}
                  keyboardType="numeric"
                  placeholder="5,000"
                  placeholderTextColor="#9ba8b8"
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.currencyButton}
                  onPress={() =>
                    setCurrencyOpen(
                      (current) => !current,
                    )
                  }
                >
                  <Text style={styles.currencyText}>
                    {tripDetails.currency}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={15}
                    color={MUTED}
                  />
                </TouchableOpacity>
              </View>

              {currencyOpen && (
                <View style={styles.currencyMenu}>
                  {['USD', 'EUR', 'GBP', 'PHP'].map(
                    (currency) => (
                      <TouchableOpacity
                        key={currency}
                        style={
                          styles.currencyOption
                        }
                        onPress={() => {
                          updateTripDetails({
                            currency,
                          });
                          setCurrencyOpen(false);
                        }}
                      >
                        <Text
                          style={
                            styles.currencyOptionText
                          }
                        >
                          {currency}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              )}
            </TripField>

            <TripField
              icon="chatbox-ellipses-outline"
              label="Anything else we should know?"
            >
              <TextInput
                style={styles.notesInput}
                value={tripDetails.notes}
                onChangeText={(notes) =>
                  updateTripDetails({
                    notes,
                  })
                }
                multiline
                placeholder="Preferred airlines, must-haves, celebrations, accessibility needs..."
                placeholderTextColor="#9ba8b8"
              />
            </TripField>

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

                <Text style={styles.backButtonText}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text
                  style={styles.continueButtonText}
                >
                  Next: Preferences
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <LinearGradient
            colors={['#f3f8ff', '#eaf3ff']}
            style={styles.overviewPanel}
          >
            <View style={styles.overviewHeader}>
              <View style={styles.overviewTitleRow}>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={BLUE}
                />

                <Text style={styles.overviewTitle}>
                  Your Trip Overview
                </Text>
              </View>

              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />

                <Text style={styles.liveText}>
                  Live preview
                </Text>
              </View>
            </View>

            <View style={styles.routeOverview}>
              <View style={styles.routePlace}>
                <Text style={styles.routeCode}>
                  {origin.code}
                </Text>

                <Text style={styles.routeCity}>
                  {origin.city}
                </Text>
              </View>

              <View style={styles.routeMiddle}>
                <View style={styles.routeLine} />

                <View style={styles.routePlane}>
                  <Ionicons
                    name="airplane"
                    size={20}
                    color={BLUE}
                  />
                </View>
              </View>

              <View style={styles.routePlace}>
                <Text style={styles.routeCode}>
                  {destination.code}
                </Text>

                <Text style={styles.routeCity}>
                  {destination.city}
                </Text>
              </View>
            </View>

            <View style={styles.mapArea}>
              <View style={styles.mapGlowOne} />
              <View style={styles.mapGlowTwo} />

              <View style={styles.mapPath} />

              <View
                style={[
                  styles.mapDot,
                  styles.mapDotLeft,
                ]}
              />

              <View
                style={[
                  styles.mapDot,
                  styles.mapDotRight,
                ]}
              />
            </View>

            <View style={styles.overviewStats}>
              <OverviewStat
                icon="calendar-outline"
                label="Estimated Dates"
                value={
                  tripDetails.departureDate ||
                  'Not selected'
                }
                detail={
                  durationDays > 0
                    ? `${durationDays} days`
                    : 'Add return date'
                }
              />

              <OverviewStat
                icon="wallet-outline"
                label="Budget"
                value={
                  tripDetails.budget > 0
                    ? `${tripDetails.currency} ${tripDetails.budget.toLocaleString()}`
                    : 'Not added'
                }
                detail={`${tripDetails.travelers} traveler${
                  tripDetails.travelers === 1
                    ? ''
                    : 's'
                }`}
              />
            </View>

            <View style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetTitle}>
                  Budget Tracker
                </Text>

                <Text style={styles.budgetValue}>
                  {tripDetails.currency}{' '}
                  {tripDetails.budget.toLocaleString()}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>

              <View style={styles.budgetFooter}>
                <Text style={styles.budgetFooterText}>
                  0 spent
                </Text>

                <Text style={styles.budgetFooterText}>
                  {tripDetails.budget.toLocaleString()}{' '}
                  remaining
                </Text>
              </View>
            </View>

            <Text style={styles.highlightTitle}>
              Trip Highlights
            </Text>

            <View style={styles.highlightGrid}>
              <Highlight
                icon="repeat-outline"
                label={
                  tripDetails.tripMode ===
                  'round_trip'
                    ? 'Round-trip'
                    : 'One-way'
                }
                detail={`${origin.city} → ${destination.city}`}
              />

              <Highlight
                icon="calendar-number-outline"
                label={
                  durationDays > 0
                    ? `${durationDays} days`
                    : 'Dates pending'
                }
                detail={
                  tripDetails.departureDate ||
                  'Select dates'
                }
              />

              <Highlight
                icon="person-outline"
                label={`${tripDetails.travelers} traveler${
                  tripDetails.travelers === 1
                    ? ''
                    : 's'
                }`}
                detail="Economy default"
              />
            </View>

            <View style={styles.aiNote}>
              <Ionicons
                name="sparkles"
                size={17}
                color={BLUE}
              />

              <Text style={styles.aiNoteText}>
                We will find the best flights and
                options tailored to your route.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TripField({
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
      <View style={styles.fieldIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#ffffff"
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
  );
}

function SegmentButton({
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
      activeOpacity={0.8}
      style={[
        styles.segmentButton,
        selected && styles.segmentButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.segmentText,
          selected && styles.segmentTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OverviewStat({
  icon,
  label,
  value,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.overviewStat}>
      <Ionicons
        name={icon}
        size={18}
        color={BLUE}
      />

      <View style={styles.overviewStatCopy}>
        <Text style={styles.overviewStatLabel}>
          {label}
        </Text>

        <Text style={styles.overviewStatValue}>
          {value}
        </Text>

        <Text style={styles.overviewStatDetail}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

function Highlight({
  icon,
  label,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
}) {
  return (
    <View style={styles.highlight}>
      <View style={styles.highlightIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={BLUE}
        />
      </View>

      <Text style={styles.highlightLabel}>
        {label}
      </Text>

      <Text style={styles.highlightDetail}>
        {detail}
      </Text>
    </View>
  );
}

const shadow = Platform.select({
  web: {
    boxShadow:
      '0 14px 38px rgba(31, 75, 122, 0.08)',
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
    backgroundColor: '#ffffff',
  },

  page: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 30,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 42,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4f8',
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

  progressWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },

  content: {
    width: '100%',
    maxWidth: 1450,
    alignSelf: 'center',
    paddingHorizontal: 34,
    paddingTop: 24,
    gap: 28,
  },

  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  contentMobile: {
    flexDirection: 'column',
  },

  formPanel: {
    flex: 1.7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    padding: 28,
    ...shadow,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 22,
  },

  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BLUE,
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
    marginBottom: 8,
  },

  readOnlyInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inputText: {
    flex: 1,
    color: NAVY,
    fontSize: 13,
    marginRight: 10,
  },

  inputButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  textInputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  input: {
    flex: 1,
    color: NAVY,
    fontSize: 13,
    minHeight: 46,
  },

  errorBorder: {
    borderColor: ERROR,
  },

  errorText: {
    color: ERROR,
    fontSize: 11,
    marginTop: 6,
  },

  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },

  dropdownOption: {
    minHeight: 54,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f3f7',
  },

  airportIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#edf5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  airportCopy: {
    flex: 1,
  },

  airportLabel: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '700',
  },

  airportCountry: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },

  addStopButton: {
    alignSelf: 'flex-start',
    minHeight: 39,
    borderWidth: 1,
    borderColor: '#b9d6fa',
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  addStopText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '800',
  },

  stopList: {
    marginTop: 9,
    gap: 7,
  },

  stopChip: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: '#edf5ff',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  stopText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '700',
  },

  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
    marginLeft: 48,
  },

  segmentButton: {
    minHeight: 39,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentButtonSelected: {
    backgroundColor: '#edf5ff',
    borderColor: '#b9d6fa',
  },

  segmentText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  segmentTextSelected: {
    color: BLUE,
  },

  counter: {
    width: 160,
    minHeight: 47,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  counterButton: {
    width: 46,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7faff',
  },

  counterValue: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '800',
  },

  budgetRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  currencySymbol: {
    color: MUTED,
    fontSize: 14,
    marginRight: 7,
  },

  currencyButton: {
    alignSelf: 'stretch',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  currencyText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  currencyMenu: {
    alignSelf: 'flex-end',
    width: 100,
    marginTop: 5,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },

  currencyOption: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f3f7',
  },

  currencyOptionText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '700',
  },

  notesInput: {
    minHeight: 86,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 13,
    textAlignVertical: 'top',
    color: NAVY,
    fontSize: 13,
  },

  actions: {
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  backButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  backButtonText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
  },

  continueButton: {
    minHeight: 46,
    borderRadius: 11,
    paddingHorizontal: 20,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  continueButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  overviewPanel: {
    flex: 1,
    minWidth: 320,
    borderRadius: 22,
    padding: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#deebfa',
    ...shadow,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  overviewTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '800',
  },

  liveBadge: {
    backgroundColor: '#e9faf3',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },

  liveText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: '700',
  },

  routeOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
  },

  routePlace: {
    width: 95,
    alignItems: 'center',
  },

  routeCode: {
    color: NAVY,
    fontSize: 29,
    fontWeight: '800',
  },

  routeCity: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  routeMiddle: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },

  routeLine: {
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8cb8ef',
  },

  routePlane: {
    position: 'absolute',
    alignSelf: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapArea: {
    height: 170,
    marginTop: 8,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: 'rgba(222,237,255,0.5)',
  },

  mapGlowOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.8)',
    top: -150,
    left: -70,
  },

  mapGlowTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(140,190,250,0.16)',
    right: -75,
    bottom: -120,
  },

  mapPath: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '52%',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#78aef0',
    transform: [{ rotate: '-5deg' }],
  },

  mapDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BLUE,
  },

  mapDotLeft: {
    left: '15%',
    top: '60%',
  },

  mapDotRight: {
    right: '14%',
    top: '37%',
  },

  overviewStats: {
    marginTop: 19,
    flexDirection: 'row',
    gap: 17,
  },

  overviewStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  overviewStatCopy: {
    flex: 1,
  },

  overviewStatLabel: {
    color: MUTED,
    fontSize: 9,
  },

  overviewStatValue: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },

  overviewStatDetail: {
    color: BLUE,
    fontSize: 9,
    marginTop: 3,
  },

  budgetCard: {
    marginTop: 23,
    padding: 17,
    borderRadius: 15,
    backgroundColor: '#ffffff',
  },

  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  budgetTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
  },

  budgetValue: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
  },

  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e9eff8',
    marginTop: 15,
    overflow: 'hidden',
  },

  progressFill: {
    width: '53%',
    height: '100%',
    backgroundColor: BLUE,
    borderRadius: 5,
  },

  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  budgetFooterText: {
    color: MUTED,
    fontSize: 9,
  },

  highlightTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 23,
    marginBottom: 12,
  },

  highlightGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  highlight: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },

  highlightIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  highlightLabel: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  highlightDetail: {
    color: MUTED,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
  },

  aiNote: {
    marginTop: 19,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#e7f1ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  aiNoteText: {
    flex: 1,
    color: BLUE,
    fontSize: 10,
    fontWeight: '700',
  },
});