# v4 조회용 스크립트 (use_figma, 읽기 전용)

`use_figma` 전에 `figma-use` 스킬을 로드한다. 아래는 전부 읽기만 한다 — v4는
참조용 사본이니 **고치지 않는다.** 노드를 바꾸는 코드를 섞지 않는다.

## v4 화면 목록 (노드 ID)

인벤토리 "화면" 표가 기본이다. 표를 다시 맞춰야 할 때:

```js
const v4 = await figma.getNodeByIdAsync('1363:1533');
return v4.children.flatMap(sub => sub.children.map(f => `${sub.name} | ${f.name} | ${f.id}`));
```

## 같은 이름의 노드를 전 프레임에서 비교

공용 컴포넌트를 고치기 전에 돌린다. `NAME`을 바꿔 쓴다(정규식).

```js
const NAME = /^(SelectButton\d?(_White)?)$/;
const v4 = await figma.getNodeByIdAsync('1363:1533');
const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const frameOf = n => { let f = n; while (f.parent && f.parent.type !== 'SECTION') f = f.parent; return f.name.replace(' (v4)', ''); };
function detail(n) {
  const shapes = n.findAll(c => c.type !== 'TEXT' && 'fills' in c && c.fills.length && c.visible);
  const bg = shapes.sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const t = n.findOne(c => c.type === 'TEXT' && c.visible);
  const tf = t && t.fills[0];
  return [
    `${n.width.toFixed(1)}x${n.height.toFixed(1)}`,
    bg ? `bg ${bg.fills[0].type === 'SOLID' ? hex(bg.fills[0].color) : bg.fills[0].type} r${typeof bg.cornerRadius === 'number' ? bg.cornerRadius.toFixed(2) : 'mixed'}${bg.strokes.length ? ' stroke ' + hex(bg.strokes[0].color) : ''}${bg.effects.length ? ' fx' : ''}` : 'no-bg',
    t ? `text ${tf && tf.type === 'SOLID' ? hex(tf.color) : '?'} ${t.fontName.style || 'mixed'} ${typeof t.fontSize === 'number' ? t.fontSize.toFixed(2) : ''}` : '',
  ].join(' | ');
}
const out = {};
for (const n of v4.findAll(n => NAME.test(n.name))) {
  const key = `${n.name} @ ${frameOf(n)}`;
  const d = detail(n);
  (out[key] = out[key] || {})[d] = ((out[key] || {})[d] || 0) + 1;
}
return out;
```

이름이 없는 요소는 이 스크립트로 안 잡힌다. 그럴 땐 **안에 든 글자로 찾는다** —
뒤로가기 칩은 `←` 텍스트와 그 옆 사각형이 열쇠였다:

```js
const v4 = await figma.getNodeByIdAsync('1363:1533');
const hits = v4.findAll(n => n.type === 'TEXT' && n.characters.trim() === '←');
return hits.map(t => {
  const box = t.parent.findOne(c => c !== t && 'cornerRadius' in c && c.width < 30);
  return `${t.parent.name} | ${box ? `${box.width.toFixed(2)}x${box.height.toFixed(2)} r${box.cornerRadius}` : '-'}`;
});
```

v4 전체를 `findAll`로 돌면서 `isMask` 같은 속성을 읽을 때는 `'isMask' in n`으로
먼저 거른다 — SECTION 노드에서 읽으면 스크립트가 죽는다.

결과에서 크기가 **맥락마다 일관되게** 다르면(회원가입 필 24.8, 일지 필 18.1) 변형이고,
**같은 맥락에서** 제각각이면 실수다 — 다수결로 정해 인벤토리에 적는다.

## 섹션 스크린샷 (이름 없는 반복 요소 찾기)

```js
const n = await figma.getNodeByIdAsync('<하위 섹션 ID>');
await n.screenshot({ scale: Math.min(1.2, 1400 / Math.max(n.width, n.height)) });
return 'ok';
```

한 호출에 여러 장을 찍으면 뒤쪽 이미지가 빠질 수 있다. 빠졌으면 따로 다시 찍는다.

## 변수(토큰) 목록

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const out = [];
for (const c of cols) for (const id of c.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  out.push(`${c.name}/${v.name} ${JSON.stringify(v.valuesByMode[c.modes[0].modeId])}`);
}
return out;
```

`LifeDNA 색상`이 `COLOR`와 어긋나면 Figma 쪽이 맞다. `LifeDNA 간격·반경`은 390
단위라 쓰지 않는다.

## 에셋 대조

그림은 `download_assets`(`defaultScale: 4`)로 내보내 기존 `assets/images/` 파일과
비교한다. 둘 다 잉크 경계 상자로 잘라 같은 크기로 줄이고 나란히 놓아 **눈으로** 본다.
배경색이 달라 평균 차이는 0이 되지 않는다 — 숫자보다 그림이 기준이다.
