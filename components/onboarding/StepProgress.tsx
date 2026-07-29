import React from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#2478f3';
const NAVY = '#102747';
const MUTED = '#8997aa';
const BORDER = '#dfe7f1';

const steps = [
  {
    number: 1,
    label: 'Traveler',
  },
  {
    number: 2,
    label: 'Trip',
  },
  {
    number: 3,
    label: 'Preferences',
  },
  {
    number: 4,
    label: 'Results',
  },
];

interface StepProgressProps {
  currentStep: number;
  analyzing?: boolean;
}

export default function StepProgress({
  currentStep,
  analyzing = false,
}: StepProgressProps) {
  const { width } = useWindowDimensions();
  const compact = width < 700;

  return (
    <View style={styles.wrapper}>
      {steps.map((step, index) => {
        const completed =
          step.number < currentStep ||
          (analyzing && step.number === 3);

        const active =
          !analyzing && step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            <View style={styles.step}>
              <View
                style={[
                  styles.circle,
                  completed && styles.completedCircle,
                  active && styles.activeCircle,
                ]}
              >
                {completed ? (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color="#ffffff"
                  />
                ) : (
                  <Text
                    style={[
                      styles.number,
                      active && styles.activeNumber,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  active && styles.activeLabel,
                  completed && styles.completedLabel,
                  compact && styles.compactLabel,
                ]}
              >
                {step.label}
              </Text>
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  completed && styles.completedLine,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  step: {
    alignItems: 'center',
    width: 92,
  },

  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: BORDER,
  },

  activeCircle: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  completedCircle: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  number: {
    color: MUTED,
    fontSize: 15,
    fontWeight: '700',
  },

  activeNumber: {
    color: '#ffffff',
  },

  label: {
    marginTop: 9,
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  compactLabel: {
    fontSize: 11,
  },

  activeLabel: {
    color: BLUE,
    fontWeight: '800',
  },

  completedLabel: {
    color: NAVY,
  },

  line: {
    flex: 1,
    minWidth: 24,
    maxWidth: 110,
    height: 2,
    marginTop: 19,
    backgroundColor: '#e8edf4',
  },

  completedLine: {
    backgroundColor: BLUE,
  },
});