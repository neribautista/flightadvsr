import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

type Tone = 'light' | 'onBlue';

/**
 * Mountain range with clouds and a plane leaving a contrail.
 * `light` sits on the pale hero background, `onBlue` on the blue CTA banner.
 */
export default function Scenery({
  tone = 'light',
  style,
}: {
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  const onBlue = tone === 'onBlue';

  const far = onBlue ? ['#ffffff', 0.35, '#ffffff', 0.1] : ['#c9dcfa', 1, '#f2f7ff', 1];
  const peak = onBlue ? ['#ffffff', 0.85, '#dbe8fd', 0.35] : ['#9dbdf3', 1, '#e9f1fe', 1];
  const shade = onBlue ? '#3f7fe9' : '#6f98e6';
  const hills = onBlue ? ['#3474e6', 0.55] : ['#6a98e8', 0.55];
  const front = onBlue ? ['#2a66d9', 0.6] : ['#4a80e0', 0.5];

  return (
    <Svg
      viewBox="0 0 600 440"
      preserveAspectRatio="xMaxYMax slice"
      style={style}
    >
      <Defs>
        <LinearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={far[0] as string} stopOpacity={far[1] as number} />
          <Stop offset="1" stopColor={far[2] as string} stopOpacity={far[3] as number} />
        </LinearGradient>
        <LinearGradient id="peak" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={peak[0] as string} stopOpacity={peak[1] as number} />
          <Stop offset="1" stopColor={peak[2] as string} stopOpacity={peak[3] as number} />
        </LinearGradient>
        <LinearGradient id="trail" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={onBlue ? 0.8 : 0.95} />
        </LinearGradient>
        <LinearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient id="plane" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="1" stopColor={onBlue ? '#dce8fd' : '#c7daf8'} />
        </LinearGradient>
      </Defs>

      {/* Clouds */}
      <G fill="#ffffff" opacity={onBlue ? 0.35 : 0.9}>
        <Ellipse cx="520" cy="95" rx="60" ry="20" />
        <Ellipse cx="555" cy="80" rx="38" ry="24" />
        <Ellipse cx="495" cy="85" rx="26" ry="16" />
        <Ellipse cx="190" cy="215" rx="48" ry="12" />
        <Ellipse cx="215" cy="205" rx="26" ry="14" />
      </G>

      {/* Contrail and plane */}
      <Path
        d="M40 260 C 150 190, 260 125, 360 72"
        stroke="url(#trail)"
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
      <G transform="translate(392 66) rotate(-24) scale(0.62)">
        <Path d="M4 -4 L-18 -48 L-30 -48 L-16 -4 Z" fill="url(#plane)" />
        <Path d="M4 4 L-18 48 L-30 48 L-16 4 Z" fill={onBlue ? '#c9dbfb' : '#b3cbf3'} />
        <Path d="M-46 -4 L-58 -22 L-65 -22 L-60 -4 Z" fill="url(#plane)" />
        <Path d="M-46 4 L-58 22 L-65 22 L-60 4 Z" fill={onBlue ? '#c9dbfb' : '#b3cbf3'} />
        <Path
          d="M-64 -5 L46 -5 C 58 -5, 66 -2, 68 0 C 66 2, 58 5, 46 5 L-64 5 C -68 3, -68 -3, -64 -5 Z"
          fill="url(#plane)"
        />
        <Path d="M50 -3 L58 -2 L58 2 L50 3 Z" fill="#2b6fe8" opacity={0.7} />
      </G>

      {/* Mountains, back to front */}
      <Polygon
        points="0,440 80,420 150,380 240,262 320,305 390,215 440,250 600,190 600,440"
        fill="url(#far)"
      />
      <Polygon
        points="170,440 300,305 370,250 420,195 470,140 520,200 565,238 600,262 600,440"
        fill="url(#peak)"
      />
      <Polygon
        points="470,140 520,200 565,238 600,262 600,440 470,440 505,300 488,210"
        fill={shade}
        opacity={0.28}
      />
      <Polygon
        points="420,195 470,140 520,200 500,190 485,205 470,184 452,200 438,190"
        fill="#ffffff"
        opacity={onBlue ? 0.95 : 1}
      />
      <Polygon
        points="0,440 60,430 120,395 190,385 290,338 390,372 490,326 600,352 600,440"
        fill={hills[0] as string}
        opacity={hills[1] as number}
      />
      <Polygon
        points="0,440 80,434 140,410 280,418 430,388 600,404 600,440"
        fill={front[0] as string}
        opacity={front[1] as number}
      />
      {onBlue && (
        <Rect x="0" y="300" width="600" height="140" fill="url(#mist)" />
      )}
    </Svg>
  );
}
