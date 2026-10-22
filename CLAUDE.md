# 러시아어 문법 퀴즈 (ruquiz)

사용자가 쓰는 러시아어 문법 퀴즈 앱이에요. 두 곳에서 같은 코드로 돌아가요.

- claude.ai 아티팩트: https://claude.ai/artifact/NyJsT8BF8dvAvj11aEn54f
- 오프라인 파일: `ruquiz/russian-quiz.html`. 인터넷이 연결되면 이 브랜치의 `ruquiz/version.json`을 보고 스스로 업데이트해요.

원본은 `ruquiz/app.js` · `ruquiz/app.css`(코드)와 소리 팩 `ruquiz/audio-native.json`(원어민 녹음) · `ruquiz/audio-tts.json`(음성 합성 여성 baya) · `ruquiz/audio-tts-m.json`(음성 합성 남성 eugene)이에요. `russian-quiz.html`은 직접 고치지 말고 `ruquiz/tools/make_file.py`로 만드세요. 오프라인 파일은 지문이 바뀐 팩만 새로 받아요.

## 규칙

- **단어를 추가하거나 바꾸면 반드시 소리도 자동으로 만들어요.** 단어를 고친 뒤 ① `python3 ruquiz/tools/audio/fetch_audio.py`(원어민 녹음), ② `python3 ruquiz/tools/audio/make_tts.py`(음성 합성, Silero v5.6 · 여성 baya와 남성 eugene 두 목소리, 앱 강세 표기대로. `pip install torch --index-url https://download.pytorch.org/whl/cpu numpy scipy` 필요), ③ `python3 ruquiz/tools/audio/qa_audio.py`(발음 검사, 아래)를 실행하세요. 사용자는 설정에서 원어민 녹음 / 음성 합성 중 먼저 들을 쪽과 합성 목소리(여성 / 남성)를 골라요. 녹음이 없는 단어를 찾아 위키미디어 공용(Lingua Libre · 위키낱말사전) 녹음을 받고, 앱에 합치고, 파일을 다시 만들어요. 위키미디어 서버 제한으로 못 받은 단어는 나중에 `--retry`로 다시 시도해요. 사용자가 꼭 지키라고 한 규칙이에요.
- **발음 예외도 하나하나 반영해요(사용자 요청).** 철자와 발음이 다른 단어(его́ → [ево́], что → [што], коне́чно → [шн], сч/жч → [щ], 묵음 вств · здн · стн · рдц, гк → [хк], -тся/-ться → [цца], 외래어 е → [э] 등)는 `make_tts.py`의 규칙(`phon`, `HARD_E`, `CHN_SHN`, `OGO_KEEP`)이 합성할 때만 발음대로 고쳐 적어요. 새 단어를 넣을 때 `make_tts.py --dry`로 바뀌는 단어를 확인하고, 규칙에 없는 예외가 있으면 규칙에 더한 뒤 다시 만드세요. 규칙이 바뀌면 그 단어만 다시 만들어져요(`tools/audio/tts-text.json`).
- **모든 녹음의 실제 발음을 자동으로 검사해요(사용자 요청).** `qa_audio.py`가 녹음에서 들리는 음소를 받아 적어(wav2vec2 음소 인식, `pip install transformers phonemizer` · `apt install espeak-ng`) 표준 발음과 자음을 비교해요. 틀린 합성 음성은 다른 입력 방식 · 같은 성별의 다른 목소리로 다시 만들어 맞는 것만 남기고(`tools/audio/tts-fix*.json`), 첫소리부터 틀린 원어민 녹음은 빼요. 새 소리를 만든 뒤에는 항상 실행하세요. Silero v4 xenia는 г로 시작하는 단어를 [б]처럼 읽어서 쓰지 않아요.
- 소리를 다듬을 때 앞의 무음을 잘라 낸 뒤 바로 압축하면 첫소리가 [b]처럼 깨져요. `fetch_audio.py` · `make_tts.py`의 `TRIM`(짧은 페이드인 + 앞 0.1초 무음)을 그대로 쓰세요. 예전 방식으로 다듬은 원어민 녹음은 `reprocess_native.py`로 원본을 다시 받아 다듬어요.
- 녹음은 그 녹음이 달린 사전 항목의 강세가 앱의 강세 표기와 같을 때만 넣어요. 강세가 둘인 같은 철자(до́ма / дома́)는 강세 표기를 키로 저장해요. 도구가 이미 그렇게 해요.
- 네이버 사전 등 약관상 수집이 금지된 곳의 음원은 넣지 않아요(저장소가 공개라 배포가 돼요). 링크로만 연결해요.
- 외부 서버에서 소리를 불러오지 않아요. 녹음은 모두 파일 안에 넣어요(아티팩트는 외부 미디어를 막고, 오프라인에서도 재생돼야 해요).

## 바꾼 것을 내보내는 순서

1. `ruquiz/app.js` · `ruquiz/app.css`를 고쳐요. 단어를 바꿨다면 `fetch_audio.py`, `make_tts.py`, `qa_audio.py`를 차례로 실행해요.
2. `ruquiz/version.json`의 `ver`를 올리고(`연.월.일.번호`, 예: `2026.10.22.2`) `notes`에 바뀐 점을 한국어로 짧게 적어요. `fetch_audio.py`는 이 단계를 스스로 해요.
3. `python3 ruquiz/tools/make_file.py --artifact <세션 스크래치 폴더>/art/artifact.html`로 오프라인 파일과 아티팩트 페이지를 함께 만들어요. 아티팩트 페이지는 16MB까지라 소리 팩은 같은 폴더의 `pack-native.js` · `pack-tts.js` · `pack-ttsm.js`로 따로 나와요.
4. 이 브랜치(`claude/video-completion-automation-wq7tsc`)에 커밋하고 푸시해요. 오프라인 파일은 이 브랜치의 raw 주소에서 업데이트를 받아요. 브랜치 이름이나 `ruquiz/` 경로를 바꾸면 사용자 파일이 업데이트를 못 받아요.
5. 그 `artifact.html`을 위 아티팩트 주소에 다시 게시해요. 소리 팩이 바뀌었으면 `pack-*.js`도 `files`로 함께 올려요.

## 기록

학습 기록은 아티팩트에서는 Claude 계정(db 기능)에, 오프라인 파일에서는 브라우저(localStorage)에 따로 저장돼요. 두 곳은 백업 파일(내보내기 · 불러오기)로 합쳐요. 기록 키(`ruQuizRec4`, `ruQuizBest3`, `ruPluralBest2`)는 바꾸지 마세요.

## 할 일

- 부사 메뉴 추가(사용자 요청): 단어 목록은 `ruquiz/tools/adverbs.json`(사용자가 준 ‘러시아어 부사 정리’ 표). 발음 검사 결과를 반영한 패치를 먼저 올린 뒤 시작해요. 단어를 넣으면 원어민 녹음 · 합성 음성 · 발음 검사를 꼭 같이 돌려요.
