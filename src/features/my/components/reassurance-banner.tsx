import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

export const BANNER_HEIGHT = 45.116;

/**
 * v3 데이터개인정보 `Card/Rectangle 3709` — the `surface/tint` card that opens
 * the screen. v3 swapped the shield-and-lock bitmap for a 28pt `Icon/lock` and
 * set the body in 10px on two hand-broken lines. The nickname is `#6D3CFA`,
 * which v3 still draws as a bare hex rather than `brand/violet-text`; kept.
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
      <View style={{ position: 'absolute', left: scale(16.923), top: scale(14.103) }}>
        <Icon name="lock" size={scale(15.795)} color={COLOR.icon.primary} />
      </View>
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
          left: scale(45.827),
          right: scale(4),
          top: scale(5.23),
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
          left: scale(45.9),
          top: scale(23.19),
          fontSize: scale(5.641),
          lineHeight: scale(7.333),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {'모든 기록은 암호화되어 저장되고,\n동의 없이 제3자에게 제공되지 않아요.'}
      </Text>
    </View>
  );
}
