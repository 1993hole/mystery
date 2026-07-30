/* A Tale of Two Nights — ACT 2 데이터 (두번의밤_ACT2 기반)
   엔진 스키마: 플래그(set/add)·entries·lock·triggers. bgm/se는 추후 오디오용 마커(현재 무동작). */
window.DATA_ACT2 = {
  "id": "act2",
  "title": "ACT 2",
  "start": "intro",

  "hub": {
    "background": "manor_entrance_night",
    "title": "그레이번 저택",
    "subtitle": "",
    "locations": [
      { "id":"ballroom", "name":"연회장", "bg":"ballroom_full_night",
        "prompt":"연회장. 손님들이 흩어진 채 웅성인다.\n누구에게 다가갈까.",
        "entries":[
          {"label":"올리에게 다가간다", "scene":"talk_oli"},
          {"label":"셀레스트에게 다가간다", "scene":"talk_celeste"},
          {"label":"아이리스에게 다가간다", "scene":"talk_iris"},
          {"label":"초대장 봉투를 살펴본다", "scene":"envelope"}
        ] },
      { "id":"hall", "name":"홀", "bg":"hall_night",
        "prompt":"홀. 누구에게 다가갈까.",
        "entries":[
          {"label":"사신 코스튬에게 다가간다", "scene":"talk_reaper"},
          {"label":"베라에게 다가간다", "scene":"talk_vera"}
        ] },
      { "id":"bar", "name":"바 코너", "bg":"bar_corner_night",
        "entries":[ {"label":"토미에게 다가간다", "scene":"talk_tommy"} ] },
      { "id":"corridor", "name":"복도", "bg":"corridor_night",
        "prompt":"복도. 무엇을 살펴볼까.",
        "entries":[
          {"label":"사일러스에게 다가간다", "scene":"talk_silas"},
          {"label":"열쇠 꾸러미를 살펴본다", "scene":"key_ring"}
        ] },
      { "id":"study", "name":"서재", "bg":"study_night",
        "entries":[ {"label":"서재를 조사한다", "scene":"study"} ] },
      { "id":"attic", "name":"다락", "bg":"attic_night", "lock":"attic_open",
        "entries":[ {"label":"다락으로 올라간다", "scene":"attic"} ] },
      { "id":"lucianroom", "name":"루시안의 방", "bg":"lucian_room_night", "lock":"lucian_room_open",
        "entries":[ {"label":"루시안의 방을 살펴본다", "scene":"lucian_room"} ] }
    ],
    "triggers": [
      { "id":"reflect2",    "when":{ "done":["study"] },                          "goto":"reflect2" },
      { "id":"lucian_away", "when":{ "done":["envelope","key_ring","study"] },     "goto":"lucian_away" },
      { "id":"oli_body",    "when":{ "done":["lucian_room"] },                     "goto":"oli_body" }
    ]
  },

  "scenes": {

    "intro": { "beats":[
      { "bg":"corridor_crime_scene_night", "bgm":"investigation_02" },
      { "text":"사람들의 말소리는 점점 작아지고, 복도는 무겁게 가라앉아 있다." },
      { "text":"에드먼드의 시신은 그대로, 옆에 루시안이 서 있다." },
      { "who":"player", "text":"루시안 씨, 조사를 도와주실 수 있나요?" },
      { "who":"lucian", "emote":"smile", "text":"물론이죠." },
      { "who":"lucian", "text":"저택 안을 살펴보고 있겠습니다. 필요한 것이 있으시면 언제든 부르십시오." },
      { "unlockUI":true },
      { "quest":{ "action":"start", "id":"M2-1", "label":"용의자들을 심문하라" } },
      { "hub":true }
    ] },

    "talk_oli": { "beats":[
      { "bg":"ballroom_corner_night" },
      { "who":"oli", "emote":"smile", "text":"당신, 뭔가 알아낸 거 있어요?" },
      { "who":"player", "text":"아직요. 올리 씨는 뭔가 보셨나요?" },
      { "who":"oli", "emote":"dark", "text":"(목소리를 낮추며) 솔직히 말해서요. 제가 사람 보는 눈이 좀 있다고 했잖아요." },
      { "who":"oli", "emote":"dark", "text":"베라 씨, 평소엔 그런 분이 아니거든요. 오늘은 어딘가… 안 맞아요. 뭔가." },
      { "who":"player", "text":"그게 다인가요?" },
      { "who":"oli", "emote":"smile", "text":"아뇨, 더 캐볼 거예요. 제가 이 사건 풀어 드릴게요. 명탐정 올리, 어때요?" },
      { "text":"가슴을 두드리며 호언장담한다." },
      { "text":"…이 분위기에 영 어울리지 않는 자신감이다." },
      { "hub":true }
    ] },

    "talk_celeste": { "beats":[
      { "bg":"ballroom_corner_night" },
      { "text":"셀레스트가 와인잔을 만지작거리며 한쪽에 서 있다. 평소보다 차분하다." },
      { "who":"player", "text":"셀레스트 씨, 잠깐 여쭤봐도 될까요." },
      { "who":"celeste", "text":"물론이죠. 이 분위기에 술 마실 기분도 아니고요." },
      { "who":"player", "text":"저번에 다락 얘기 하셨잖아요. 누군가 사라졌다는…" },
      { "who":"celeste", "emote":"dark", "text":"아, 그거요. 사실 별 얘기는 아닌데요." },
      { "who":"celeste", "emote":"dark", "text":"저 위 다락에서, 오래전에 집사 하나가 사라졌대요. 한 십 년쯤 됐을까." },
      { "who":"celeste", "emote":"dark", "text":"그 뒤로 새로 온 집사가 지금 그 사람, 루시안이죠." },
      { "who":"player", "text":"이름은요? 사라진 집사 분 이름이요." },
      { "who":"celeste", "text":"…음, 뭐였더라. A로 시작하는…" },
      { "who":"celeste", "emote":"smile", "text":"10년이나 돼서 기억이나 하겠어요? 얼굴도 가물가물해요!" },
      { "text":"셀레스트는 기억을 더듬어보다가, 결국 떠올리지는 못한다. 그녀가 민망한 듯 웃는다." },
      { "note":{ "title":"셀레스트의 증언", "body":"10년쯤 전 다락에서 집사 하나가 사라졌다고 한다. 이름은 ‘A’로 시작했다는 것만. 그 뒤 새 집사가 루시안이다." } },
      { "hub":true }
    ] },

    "talk_iris": { "beats":[
      { "bg":"ballroom_entrance_night" },
      { "text":"아이리스가 카메라를 든 채로 한쪽에 서 있다." },
      { "who":"player", "text":"사건이 벌어졌을 때, 어디 계셨나요?" },
      { "who":"iris", "text":"여기, 입구 쪽에서 단체 사진을 정리하고 있었어요. 다른 분들도 봤을 거예요." },
      { "who":"player", "text":"그 시간에 찍힌 사진이 있나요?" },
      { "who":"iris", "text":"있어요. 다만 정리가 끝나야 보여드릴 수 있어요. 시간을 좀 주세요." },
      { "who":"player", "text":"도움이 될 만한 게 찍혔을지도 모르니까, 부탁드릴게요." },
      { "who":"iris", "text":"나중에 다시 찾아오세요. 정리되면 보여드리죠." },
      { "text":"사진은 아직 보지 못했지만, 협력은 가능해 보인다." },
      { "set":{ "iris_coop":true } },
      { "hub":true }
    ] },

    "envelope": { "beats":[
      { "bg":"ballroom_invitation_table" },
      { "text":"입구 테이블에 정리되지 않은 초대장 봉투들이 남아 있다." },
      { "text":"손님들의 이름이 적혀 있는 봉투들. 무심코 한 장을 집어 든다." },
      { "text":"“베라 애쉬모어 귀하”" },
      { "text":"빠르게 흘려 썼지만 일정한 리듬이 있는 필체." },
      { "who":"player", "text":"(이 글씨… 어디서 본 것 같다.)" },
      { "clue":"invitation_envelope", "se":"clue" },
      { "hub":true }
    ] },

    "talk_reaper": { "beats":[
      { "bg":"hall_corner_night" },
      { "text":"사신 코스튬은 여전히 후드 속이다." },
      { "who":"player", "text":"혹시 사건 시각에 어디 계셨는지 여쭤도 될까요." },
      { "who":"reaper", "text":"글쎄요." },
      { "who":"player", "text":"보신 거라도 있나요?" },
      { "who":"reaper", "text":"보고 싶은 것을 봤을 뿐입니다." },
      { "text":"이런 상황에도 저런 식으로 응대하다니… 이 사람, 제정신이 아닌 것 같다." },
      { "text":"더 묻기는 어려울 듯하다." },
      { "hub":true }
    ] },

    "talk_vera": { "beats":[
      { "bg":"hall_window_night" },
      { "text":"베라가 창가에 다시 서 있다. 와인잔은 비어 있다." },
      { "who":"player", "text":"베라 씨, 괜찮으세요?" },
      { "who":"vera", "emote":"smile", "text":"괜찮아요. 이런 일에 익숙할 리 없지만요." },
      { "choice":"", "options":[
        { "label":"공감 — “많이 놀라셨을 것 같아요.”", "then":[
          { "who":"vera", "text":"…" },
          { "who":"vera", "emote":"smile", "text":"네. 좋은 분이셨으니까요." },
          { "text":"잠깐의 침묵. 들고 있던 빈 잔이 손 안에서 한 번 미세하게 흔들렸다. 그뿐이다." },
          { "who":"vera", "emote":"smile", "text":"이런 자리에서 무너지면 안 되죠. 모두가 보고 있는데." },
          { "text":"그 미소는 흠 잡을 데 없다. 그 짧은 흔들림만 빼면." },
          { "note":{ "title":"베라의 빈틈 (2)", "body":"에드먼드 이야기에 빈 잔이 미세하게 흔들렸다. 완벽한 미소 뒤의 한순간." } },
          { "add":{ "insight":1 } }
        ] },
        { "label":"직설 — “정말 어떤 사이셨어요?”", "then":[
          { "who":"vera", "emote":"tense", "text":"…(잠시) 가까웠다고 해야 할까요. 그런 단어는 어울리지 않네요." },
          { "who":"vera", "emote":"smile", "text":"오래된 사이일 뿐이에요. 그게 다예요." },
          { "text":"빈 잔이 손 안에서 굳어진다. 그녀의 손가락이 잔 가장자리를 잡는다." },
          { "text":"직설적인 질문 앞에서, 그녀의 가면은 더 단단해진다." },
          { "note":{ "title":"베라의 경계", "body":"직설적인 질문에 베라의 가면이 더 단단해졌다." } },
          { "add":{ "distance":1 } }
        ] }
      ] },
      { "quest":{ "action":"complete", "id":"M2-1", "label":"용의자들을 심문하라" } },
      { "hub":true }
    ] },

    "talk_tommy": { "beats":[
      { "bg":"bar_corner_night" },
      { "text":"토미가 같은 자리에서 술잔을 쥐고 있다. 아까보다 더 깊이 가라앉은 얼굴이다." },
      { "who":"player", "text":"토미 씨, 잠깐 얘기 좀 할 수 있을까요." },
      { "who":"tommy", "emote":"tense", "text":"…지금은 좀 힘들 것 같네요." },
      { "choice":"", "options":[
        { "label":"압박 — “뭔가 알고 계신 거죠? 말해주세요.”", "then":[
          { "who":"tommy", "emote":"tense", "text":"모릅니다. 아무것도. 저는…" },
          { "text":"토미의 반응이 완고하다. 더 이상 듣기 싫다는 듯 술잔을 들며 자리를 뜬다." },
          { "text":"이후 토미는 더 이상 입을 열지 않는다." },
          { "set":{ "tommy_closed":true } }
        ] },
        { "label":"공감 — “괜찮아요. 천천히 말씀하셔도 돼요.”", "then":[
          { "who":"tommy", "text":"…고맙습니다." },
          { "text":"한참 술잔을 만지작거리던 토미가 작게 입을 연다." },
          { "who":"tommy", "emote":"dark", "text":"저… 그… 불 꺼지기 직전에요." },
          { "who":"tommy", "emote":"dark", "text":"루시안 씨가 복도 쪽으로 가는 거 봤어요. 손에 뭔가… 들고 있었어요." },
          { "who":"tommy", "emote":"tense", "text":"(주변을 살피며) 더는 말 못해요…" },
          { "note":{ "title":"토미의 증언", "body":"불이 꺼지기 직전, 루시안이 복도 쪽으로 향하는 모습을 봤다고 한다. 손에 무언가를 쥐고 있었다고." } },
          { "set":{ "tommy_empathy":true } }, { "add":{ "insight":1 } }
        ] }
      ] },
      { "hub":true }
    ] },

    "talk_silas": { "beats":[
      { "bg":"corridor_office_front_night" },
      { "text":"사일러스가 집무실 문 앞을 서성이고 있다." },
      { "who":"player", "text":"사일러스 씨, 여기서 뭐 하시나요?" },
      { "who":"silas", "text":"에드먼드의 의무 기록을 확인하려고요. 환자의 사인은 명확해야 하니까." },
      { "who":"player", "text":"들어가 보셨나요?" },
      { "who":"silas", "text":"잠겨 있더군요." },
      { "text":"그의 등 뒤편으로, 베라가 복도 안쪽으로 걸어가는 모습이 잠깐 보였다가 사라진다." },
      { "who":"player", "text":"(어디로 가는 거지?)" },
      { "choice":"", "options":[
        { "label":"베라를 따라간다 (동선 추적)", "then":[
          { "text":"사일러스에게 짧게 인사하고 복도 끝으로 향한다." },
          { "text":"하지만 복도 끝에 베라의 모습은 이미 없다." },
          { "text":"방금까지 그녀가 서 있던 자리, 옅은 향수의 잔향만 남아 있다. 어디서 본 향수인지는 아직 모르겠다." },
          { "note":{ "title":"미스리딩 — 베라 이동", "body":"복도 안쪽으로 사라진 베라. 그 자리엔 옅은 향수의 잔향만 남아 있었다." } },
          { "add":{ "insight":1 } }
        ] },
        { "label":"사일러스에게 더 묻는다 (회피 확인)", "then":[
          { "who":"player", "text":"정말 의무 기록만 보러 오신 건가요?" },
          { "who":"silas", "emote":"smile", "text":"이 자리에서 다른 이야기는 어울리지 않아요." },
          { "who":"silas", "text":"필요한 게 있으면, 따로 묻지요." },
          { "text":"대화는 차갑게 끝난다. 하지만 그의 회피가, 도리어 더 의심스럽다." },
          { "note":{ "title":"미스리딩 — 사일러스 배회", "body":"집무실 앞을 서성이던 사일러스. 의무 기록을 운운하지만 회피가 더 의심스럽다." } },
          { "add":{ "insight":1 } }
        ] }
      ] },
      { "hub":true }
    ] },

    "key_ring": { "beats":[
      { "bg":"corridor_night" },
      { "text":"복도 끝, 청소함 위에 두툼한 열쇠 꾸러미가 놓여 있다." },
      { "text":"손에 들어 본다. 묵직하다. 여러 종류의 열쇠가 한 고리에 매달려 있다." },
      { "text":"그중 하나, 크고 오래된 형태의 열쇠가 유난히 눈에 띈다." },
      { "clue":"key_ring", "se":"clue" },
      { "hub":true }
    ] },

    "study": { "beats":[
      { "bg":"study_night" },
      { "text":"서재의 한쪽 벽이 어둡다. 유난히 손때가 묻은 책들이 모여 있다." },
      { "text":"그중 한 권을 꺼내 본다. 가죽 표지의 낡은 책. 페이지가 여러 곳 접혀 있다." },
      { "text":"접힌 페이지 한 장을 펼친다. 손등을 마주보며 누운 사람의 그림. 그 아래로 알 수 없는 문자와 절차가 빼곡하다." },
      { "who":"player", "text":"(이 자세… 어디서 봤더라.)" },
      { "clue":"occult_book", "se":"clue" },
      { "text":"책상 위로 시선을 옮긴다. 서랍 하나가 어색하게 비틀려 있다." },
      { "text":"누군가 급히 뒤지다 만 흔적이다. 책상 모서리에 어렴풋이 익숙한 향수의 잔향. …어디서 맡았더라." },
      { "who":"player", "text":"(누가 여길 다녀갔나?)" },
      { "note":{ "title":"미스리딩 — 서재 향수", "body":"서재 책상 서랍이 급히 뒤져져 있었다. 모서리에 익숙한 향수의 잔향." } },
      { "hub":true }
    ] },

    "reflect2": { "beats":[
      { "bg":"ballroom_corner_night", "bgm":"reflection_02" },
      { "text":"잠시 멈춰, 수사 노트를 다시 펼친다." },
      { "text":"…뭔가, 마음에 걸리는 게 있다." },
      { "choice":"단서 중 무엇이 가장 신경 쓰이는가", "options":[
        { "label":"쪽지와 봉투, 두 글씨가 닮은 것 같아서", "then":[
          { "text":"쪽지의 글씨. 봉투의 글씨. 빠르게 흘려 썼지만 일정한 리듬." },
          { "text":"…같은 사람의 손인 것 같다. 확신은 아직 못 하겠지만." },
          { "text":"이 저택의 누군가가 두 글씨를 모두 썼다." }
        ] },
        { "label":"의식 서적의 그림, 어딘가 본 자세 같아서", "then":[
          { "text":"책 속 그림의 자세. 손등을 복부 위에 마주하고, 다리는 가지런히." },
          { "text":"오늘 밤 본 시신과 똑같다." },
          { "text":"누군가, 그 책의 절차를 알고 그렸다. 그 사람이 그 책을 봤다." }
        ] }
      ] },
      { "text":"수사 노트를 덮는다. 아직, 알 수 없다." },
      { "add":{ "insight":1 } },
      { "hub":true }
    ] },

    "lucian_away": { "beats":[
      { "bg":"ballroom_full_night", "bgm":"tension_02" },
      { "text":"루시안이 곁으로 다가온다." },
      { "who":"lucian", "text":"알아보신 게 있나요?" },
      { "who":"player", "text":"단서를 좀 모았어요." },
      { "who":"lucian", "emote":"smile", "text":"오늘 밤이 끝나기 전에 모든 게 제자리를 찾겠죠." },
      { "who":"lucian", "text":"잠깐 자리를 비우겠습니다. 정리할 게 있어서요." },
      { "who":"player", "text":"어디로 가시는데요?" },
      { "who":"lucian", "text":"1층 파티공간을 정리하려고 합니다." },
      { "who":"lucian", "text":"아, 위쪽은 오래된 공간이라 위험할 수 있습니다. 그쪽으로는 가지 마십시오." },
      { "text":"그 말을 끝으로 루시안이 천천히 돌아선다." },
      { "text":"혹시 모르니, 다락에 들어가볼까?" },
      { "set":{ "attic_open":true } },
      { "quest":{ "action":"start", "id":"M2-2", "label":"다락의 흔적을 조사하라" } },
      { "hub":true }
    ] },

    "attic": { "beats":[
      { "bg":"attic_night", "bgm":"attic_01" },
      { "text":"다락의 문은 잠겨 있다. 아까 가져온 열쇠 꾸러미로 열 수 있을 것 같다." },
      { "choice":"", "options":[
        { "label":"문을 연다.", "then":[
          { "se":"lock" },
          { "text":"낡은 자물쇠가 열린다." },
          { "text":"오랫동안 사람의 발길이 닿지 않은 듯한 공기. 하지만 그런 것 치고는 정돈이 잘 되어 있다." },
          { "text":"다락 안에는 달리 특별한 것이 보이진 않는다." },
          { "choice":"", "options":[
            { "label":"좀 더 둘러볼까? (조사)", "then":[
              { "text":"구석의 낡은 책장 안에 오래된 서적들이 꽂혀 있다. 괜히 한 번씩 꺼내 본다." },
              { "text":"그 순간, 드르륵─ 낡은 책장 뒤 무언가 움직이는 소리가 들린다." },
              { "choice":"", "options":[
                { "label":"책장 뒤를 살펴본다. (조사)", "then":[
                  { "text":"힘을 줘 책장을 밀어보니, 어떤 공간으로 통하는 문이 나 있다." },
                  { "text":"공간으로 들어선다. 차가운 공기. 촛대와 닳아 짧아진 초. 누군가 이전에도 왔던 흔적이다." },
                  { "bg":"attic_secret_night", "bgm":"horror_01" },
                  { "text":"세로로 긴 길을 지나니, 저택에 이런 곳이 있었나 싶을 만큼 넓은 공간이 펼쳐진다." },
                  { "text":"벽면에는 여러 사람들의 사진이 걸려 있다." },
                  { "text":"바닥에는 검붉은 색으로 원이 남아 있다. 원의 한가운데는 짙은 얼룩이 보인다." },
                  { "who":"player", "text":"(이건… 뭘까.)" },
                  { "text":"원의 사방으로 어디선가 본 문양이 기록되어 있다." },
                  { "note":{ "title":"다락 — 의식의 흔적", "body":"책장 뒤 숨겨진 공간. 바닥의 검붉은 원과 얼룩, 벽을 채운 사람들의 사진, 서재에서 본 그 책. 이곳에서 무언가가 일어났다." } },
                  { "text":"한 사진 속, 청년이 미소 짓고 있다. 아래에는 ‘Alex Grey’라고 써 있다." },
                  { "who":"player", "text":"(이 사람들은 대체 누구일까?)" },
                  { "clue":"alex_photo", "se":"clue" },
                  { "set":{ "alex1":true } },
                  { "text":"사진 옆 선반 위, 가죽 표지의 책 한 권이 펼쳐져 있다." },
                  { "who":"player", "text":"(…서재에서 본 그 책이다.)" },
                  { "text":"펼쳐진 페이지는 손등을 마주보며 누운 사람의 그림. 살해 현장의 자세와 닮아 있다." },
                  { "quest":{ "action":"complete", "id":"M2-2", "label":"다락의 흔적을 조사하라" } },
                  { "add":{ "insight":1 } },
                  { "bg":"corridor_2nd_floor_night" },
                  { "text":"비밀 공간을 빠져나와 책장을 원래 자리로 돌려놓는다." },
                  { "text":"다락에서 2층으로 내려오는 좁은 계단. 평소엔 지나치지 않던 길이다." },
                  { "text":"복도 한쪽, 작은 문 하나가 살짝 열려 있다. 안에서 옅은 빛이 새어 나온다." },
                  { "text":"문 옆 명패에는 단정한 글씨로 한 줄. “L. Voss”" },
                  { "who":"player", "text":"(…루시안 씨의 방인가 보군.)" },
                  { "set":{ "lucian_room_open":true } },
                  { "quest":{ "action":"start", "id":"M2-3", "label":"그의 방을 살펴보라" } }
                ] },
                { "label":"기분 탓인가? 돌아가자. (돌아가기)", "then":[
                  { "text":"기분 탓이라 여기고 돌아선다. …그래도 어딘가 마음에 걸린다." },
                  { "hub":true, "incomplete":true }
                ] }
              ] }
            ] },
            { "label":"여긴 아무 것도 없는 것 같다. (돌아가기)", "then":[
              { "text":"별 것 없어 보여 다락을 나선다." },
              { "hub":true, "incomplete":true }
            ] }
          ] }
        ] }
      ] },
      { "hub":true }
    ] },

    "lucian_room": { "beats":[
      { "bg":"lucian_room_night", "bgm":"lucian_room_01" },
      { "text":"단정한 작은 방이다. 검소한 침대, 정리된 책상, 벽에 걸린 액자 하나." },
      { "text":"사진 속에는 두 사람이 있다. 한 명은 분명 루시안이다. 평소보다 어린 얼굴이지만 분명하다." },
      { "text":"다른 한 명은 다락 비밀 공간에서 본 사진 속 청년. 두 사람은 가까이 서서 웃고 있다." },
      { "note":{ "title":"루시안의 방 — 두 사람", "body":"루시안과, 다락의 청년 ‘알렉스’가 함께 웃고 있는 사진. 누군가는 떠났고, 누군가는 남아 기다렸다." } },
      { "text":"책상 서랍을 연다. 안에는 색이 바랜 편지 한 통." },
      { "text":"“자주 보지 못해서 미안해. 일이 정리되면 갈게. 함께 떠나자. 사랑해.” 끝에는 ‘Alex Grey’." },
      { "text":"날짜는 지금으로부터 10년 전, 10월 31일." },
      { "clue":"alex_letter", "se":"clue" },
      { "set":{ "alex3":true } },
      { "who":"player", "text":"(…오늘과 같은 날이다.)" },
      { "quest":{ "action":"complete", "id":"M2-3", "label":"그의 방을 살펴보라" } },
      { "add":{ "insight":1 } },
      { "hub":true }
    ] },

    "oli_body": { "beats":[
      { "bg":"bar_corner_inner_night", "bgm":"horror_01" },
      { "text":"바 코너 안쪽, 평소엔 잘 가지 않는 어둑한 통로." },
      { "text":"무엇인가 어둠 속에 쓰러져 있다. 가까이 다가간다." },
      { "bg":"raw:char_oli_corpse" },
      { "text":"올리다." },
      { "text":"한 손을 앞으로 뻗은 채 쓰러져 있다. 무언가를 붙잡으려던 것처럼, 급하게 무너진 자세다." },
      { "who":"player", "emote":"surprised", "text":"올리 씨…!" },
      { "text":"벽 옆 협탁 위에 와인 잔 두 개. 한 잔은 기울어진 채 흘렀고, 다른 한 잔의 가장자리에는 립스틱 자국이 또렷하다." },
      { "text":"누군가와 함께 있었다. 그것도 직전까지." },
      { "clue":"wine_glass", "se":"clue" },
      { "add":{ "distance":1 } },
      { "who":"silas", "emote":"tense", "text":"…이럴 수가." },
      { "who":"celeste", "emote":"surprised", "text":"어, 어떻게 이런…" },
      { "who":"tommy", "emote":"surprised", "text":"흐으으… 말도 안 돼. 이젠 진짜 누가 다음일지 모르는 거잖아요." },
      { "text":"베라가 한 발짝 떨어진 곳에 서 있다. 입술의 색이 평소보다 옅다." },
      { "who":"vera", "text":"…저는 줄곧 홀에 있었어요. 다들 봤죠?" },
      { "text":"그 말투는 늘 그랬듯 매끄럽다. 하지만 잔의 립스틱 자국과 그녀의 입술이 같은 색인지는, 아무도 묻지 않는다." },
      { "set":{ "tone_thriller":true } },
      { "goto":"reflect3" }
    ] },

    "reflect3": { "beats":[
      { "bg":"parlor_night", "bgm":"horror_reflection" },
      { "text":"사람들이 흩어진 사이, 잠시 응접실에 혼자 남는다." },
      { "text":"수사 노트를 펼친다. 손이 약간 떨린다." },
      { "text":"에드먼드 씨의 자세는 복부 위 두 손등이 마주하고, 발끝은 가지런했다. 서재의 그 책, 그림 속 자세와도 똑같다." },
      { "text":"다락 벽을 채운 그 청년들도. …같은 방식이, 오랜 세월 되풀이되어 왔다." },
      { "text":"그리고 올리 씨. 한 손을 앞으로 뻗은 채, 너무 갑작스럽게 무너져 있었다." },
      { "text":"수사 노트를 덮는다. 무언가가 손을 쓸 시간이 얼마 없을지 모른다." },
      { "add":{ "insight":1 } },
      { "end":true }
    ] }

  }
};
