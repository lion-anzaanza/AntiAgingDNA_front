import { Image, Text, View } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

export const BANNER_HEIGHT = 45.116;

/**
 * v4 데이터개인정보 `Card/Rectangle 3709` — the `surface/tint` card that opens
 * the screen. The nickname is `#6D3CFA`, which v4 draws as a bare hex rather
 * than `brand/violet-text`; kept as drawn. The 23pt gap between the lock and
 * the text is Figma's too.
 */
export function ReassuranceBanner({ nickname }: { nickname: string }) {
  return (
    <View
      style={{
        height: scale(BANNER_HEIGHT),
        borderRadius: scale(4.808),
        backgroundColor: COLOR.surface.tint,
        borderWidth: scale(0.288),
        borderColor: COLOR.border.soft,
      }}>
      <Image
        source={require('@/assets/images/my/ic-shield-lock.png')}
        style={{
          position: 'absolute',
          left: scale(10.65),
          top: scale(4.81),
          width: scale(17.567),
          height: scale(18.269),
        }}
        resizeMode="contain"
      />
      {/*
        * Figma's nickname is two characters; a real one runs past the card.
        * Bounded left and right (not `maxWidth` — see the figma-redesign skill),
        * so a long name shrinks to fit and a short one renders at 9.59.
        */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{
          position: 'absolute',
          left: scale(51.47),
          right: scale(4),
          top: scale(11.23 - 13.538 / 2),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.heading,
        }}
        className="font-plex-semibold">
        <Text style={{ color: '#6D3CFA' }}>{nickname}</Text> 님의 건강 데이터는 안전해요
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: scale(51.54),
          top: scale(17.55),
          // Figma's box is 136.6 and its first line fills it to 0.6pt; Android's
          // Plex runs ~2% wider and broke "제3자" there, so the box is 142.
          width: scale(142),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        모든 기록은 암호화되어 저장되고, 동의 없이 제3자에게 제공되지 않아요.
      </Text>
    </View>
  );
}
