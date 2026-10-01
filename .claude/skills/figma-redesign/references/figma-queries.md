# v4 조회용 스크립트 (use_figma, 읽기 전용)

`use_figma` 전에 `figma-use` 스킬을 로드한다. 아래는 전부 읽기만 한다 — v4는
참조용 사본이니 **고치지 않는다.** 노드를 바꾸는 코드를 섞지 않는다.

> **v4(`1363:1533`)는 지워졌다.** 아래 스크립트는 v3 `'1307:1533'`을 읽는다(변수 이름
> `v4`는 옛 이름 그대로). 결과는 390 단위다 — 코드에 넣을 때 `220/390`을 곱한다.

## v3 화면 목록 (노드 ID)

인벤토리 "화면" 표가 기본이다. 표를 다시 맞춰야 할 때:

```js
const v3 = await figma.getNodeByIdAsync('1307:1533');
return v3.children.flatMap(sub => sub.children.map(f => `${sub.name} | ${f.name} | ${f.id}`));
```

## 사본 이후 바뀐 것 — 노드 ID의 세션 번호로 찾는다

노드 ID `A:B`의 `A`는 그 노드를 만든 편집 세션이고, 시간이 갈수록 커진다. v4 사본은
세션 `1363`에서 만들어졌으므로 **v3 안에서 `A ≥ 1363`인 노드는 사본 뒤에 새로 그린
것**이다(2026-10-01 기준 `1400`·`1401`·`1430`·`1440`·`1441`·`1451`). 부모가 새 노드가
아닌 것만 모으면 "새로 들어온 덩어리" 목록이 된다:

```js
const v3 = await figma.getNodeByIdAsync('1307:1533');
const sess = n => parseInt(n.id.split(':')[0], 10);
const out = {};
for (const f of v3.findAll(n => n.type === 'FRAME' && n.parent.type === 'SECTION')) {
  out[f.name] = f.findAll(n => sess(n) >= 1363 && !(sess(n.parent) >= 1363))
    .map(n => `${n.id} ${n.type} "${n.name}"`);
}
return out;
```

**이걸로는 기존 노드의 속성 변경(색·위치·글자)은 안 잡힌다.** ID가 그대로이기 때문이다.
그건 화면마다 에뮬레이터와 위치 비교(`verification.md`)와 글자 대조로 찾는다.

## 같은 이름의 노드를 전 프레임에서 비교

공용 컴포넌트를 고치기 전에 돌린다. `NAME`을 바꿔 쓴다(정규식). 카드류는 이름 뒤에
`/<제목>`이 붙어 있으니(`InputTime_Card/취침 기상 시각`) `^InputTime_Card(/|$)`처럼
접두어로 맞춘다.

```js
const NAME = /^(SelectButton\d?(_White)?)$/;
const v4 = await figma.getNodeByIdAsync('1307:1533'); // v3 (the v4 section is gone)
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
const v4 = await figma.getNodeByIdAsync('1307:1533'); // v3 (the v4 section is gone)
const hits = v4.findAll(n => n.type === 'TEXT' && n.characters.trim() === '←');
return hits.map(t => {
  const box = t.parent.findOne(c => c !== t && 'cornerRadius' in c && c.width < 30);
  return `${t.parent.name} | ${box ? `${box.width.toFixed(2)}x${box.height.toFixed(2)} r${box.cornerRadius}` : '-'}`;
});
```

탭 바는 프레임마다 이름이 다르다(`BottomBar1/2/3`, `Component 2`). 이럴 땐 안에
반드시 있는 글자 — 탭 바라면 `MY` 텍스트 — 로 찾고 부모를 올라간다.

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
