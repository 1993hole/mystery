# A Tale of Two Nights — 오디오 매니페스트

데이터(act1~3.js)에 심어둔 `bgm`/`se` 마커에서 자동 추출. 음원 파일이 준비되면 이 규칙대로 넣으면 엔진이 자동 재생합니다.

## 파일 규칙
- **BGM**: `assets/audio/bgm/<마커>.mp3` — 루프 재생 (끊김 없이 이어지도록 loop-friendly하게)
- **SE**:  `assets/audio/se/<마커>.mp3` — 원샷 재생
- 포맷: **.mp3** 권장(브라우저 호환 최고), 128~192kbps. 용량 민감하면 .ogg 병행 가능.
- `*_fade` 마커는 **파일 불필요** — "현재 BGM 페이드아웃" 신호로 엔진이 처리.

---

## BGM (23종 — 필요 시 코어로 통합 가능)

| 마커 | 쓰이는 곳 | 분위기 |
|---|---|---|
| `ambient` | ACT1 오프닝(저택 외관) | 고요·불길 |
| `party` | ACT1 연회장 파티 | 화려·가면무도 |
| `investigation_02` | ACT2 도입(현장) | 무겁게 가라앉음 |
| `reflection` | ACT1 사색① | 정적·내성 |
| `reflection_02` | ACT2 사색② | 정적·내성 |
| `tension_02` | ACT2 루시안 자리비움 | 긴장 |
| `attic_01` | ACT2 다락 | 음산 |
| `horror_01` | ACT2 비밀공간·올리 시신 | 공포 |
| `lucian_room_01` | ACT2 루시안의 방 | 쓸쓸·비밀 |
| `horror_reflection` | ACT2 사색③ | 공포+내성 |
| `act3_intro` | ACT3 도입(올리 시신 앞) | 침중 |
| `office_01` | ACT3 집무실 | 은밀 |
| `reflection_act3` | ACT3 사색④(단서 조합) | 집중·긴박 |
| `confession_01` | ACT3 응접실 추궁 | 대치·괘종시계 |
| `iris_01` | ACT3 아이리스 사진 | 확신 |
| `final_reflection` | ACT3 사색⑤ | 결의 |
| `final_confront` | ACT3 루시안 대면 | 클라이맥스 |
| `final_choice` | ACT3 최종 선택 | 정점·정각 |
| `ending_true` | E-01 트루 엔딩 | 아이러니·여운 |
| `ending_subA` | E-02 허탈 | 허무 |
| `ending_subB` | E-03 공모 | 조용한 공범 |
| `ending_subC` | E-04 반전의 피해자 | 씁쓸 |
| `ending_subD` | E-05 미완성 | 불안 |

**엔진 처리(파일 X)**: `ending_true_fade` `ending_subB_fade` `ending_subC_fade` `ending_subD_fade` — 각 엔딩 곡을 새벽 장면에서 페이드아웃.

### 프로토타입 최소 코어(≈9곡)로 줄이려면
제작 부담을 줄이려면 아래로 묶어 재사용해도 됩니다 (마커는 그대로, 파일만 공유):
- **theme_calm** ← ambient
- **theme_party** ← party
- **theme_investigate** ← investigation_02, office_01, iris_01
- **theme_reflect** ← reflection, reflection_02, reflection_act3, final_reflection
- **theme_tension** ← tension_02, act3_intro
- **theme_dread** ← attic_01, horror_01, horror_reflection, lucian_room_01
- **theme_confront** ← confession_01, final_confront, final_choice
- **theme_ending_warm** ← ending_true, ending_subB (여운 있는 결말)
- **theme_ending_cold** ← ending_subA, ending_subC, ending_subD (허무한 결말)

*(통합 시엔 엔진 배선 때 "마커→파일" 매핑표만 알려주시면 그대로 연결합니다.)*

---

## SE (10종 — 원샷)

| 마커 | 쓰이는 곳 |
|---|---|
| `clue` | 단서 획득음 (전 ACT 공통, 가장 자주) |
| `door` | 집무실 문 여는 소리 |
| `lock` | 자물쇠 찰칵 (다락·서랍) |
| `quiet` | ACT3 도입 정적(앰비언트 컷) |
| `clock` | 응접실 괘종시계 째깍 |
| `clock_strike` | 최종 선택 — 괘종시계 정각 타종 |
| `footsteps` | 사신 코스튬 다가오는 발걸음 |
| `car_door` | 엔딩 — 차문 닫히는 소리 |
| `siren` | 트루 엔딩 — 경찰차 사이렌(먼 곳) |
| `dawn_wind` | 엔딩 — 새벽 바람 |

> 클릭음은 이미 Web Audio 합성으로 처리 중(파일 불필요).

---

## 다음 단계
파일이 준비되면(전체든, 코어 통합이든) 알려주세요. 엔진에:
- BGM 로더(루프·트랙 전환 시 크로스페이드·`_fade` 처리)
- SE 원샷 재생
- 설정에 **BGM/SE 볼륨 슬라이더** (사운드 ON/OFF는 이미 있음)
를 배선하겠습니다. 파일이 없어도 지금처럼 조용히 무시되니 게임은 정상 동작합니다.
