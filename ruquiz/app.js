






































const RULES = {
  hard:   "자음으로 끝나는 남성명사는 끝에 <b class='cy'>-ы</b>를 붙여요.",
  a:      "<b class='cy'>-а</b>로 끝나는 명사(대부분 여성명사)는 -а를 <b class='cy'>-ы</b>로 바꿔요.",
  seven:  "<b class='cy'>к · г · х · ж · ш · щ · ч</b> 뒤에는 ы를 쓸 수 없어서 대신 <b class='cy'>-и</b>를 써요. (7글자 철자 규칙)",
  o:      "<b class='cy'>-о</b>로 끝나는 중성명사는 -о를 <b class='cy'>-а</b>로 바꿔요.",
  e:      "<b class='cy'>-е</b>로 끝나는 중성명사는 -е를 <b class='cy'>-я</b>로 바꿔요.",
  soft:   "<b class='cy'>-ь, -й, -я</b>로 끝나는 명사는 끝을 떼고 <b class='cy'>-и</b>를 붙여요.",
  ie:     "<b class='cy'>-ие → -ия</b>, <b class='cy'>-ия → -ии</b>, <b class='cy'>-ье → -ья</b>로 바뀌어요.",
  stressA:"일부 남성명사는 -ы 대신 강세가 오는 <b class='cy'>-а / -я</b>를 붙여요. 규칙이 아니라 외워야 하는 그룹이에요.",
  fleet:  "마지막 음절의 <b class='cy'>о / е</b>가 복수형에서 빠져요. (출몰모음)",
  ya:     "단어 뒤에 <b class='cy'>-ья</b>가 붙는 특수 그룹이에요.",
  mya:    "<b class='cy'>-мя</b>로 끝나는 중성명사는 <b class='cy'>-мена</b>가 돼요.",
  onok:   "새끼 동물 <b class='cy'>-ёнок / -онок</b>은 복수에서 <b class='cy'>-ята / -ата</b>가 돼요.",
  anin:   "사람을 뜻하는 <b class='cy'>-анин / -янин</b>은 <b class='cy'>-ане / -яне</b>가 돼요.",
  supp:   "아예 다른 단어로 바뀌어요. 통째로 외우는 수밖에 없어요.",
  er:     "<b class='cy'>мать, дочь</b>는 복수에서 <b class='cy'>-ер-</b>가 들어가요.",
  es:     "<b class='cy'>небо, чудо</b>는 <b class='cy'>-еса</b>가 붙는 특수형이에요.",
  tse:    "<b class='cy'>-це</b>로 끝나는 중성명사는 <b class='cy'>-ца</b>가 돼요. (ц 뒤라서 -я 대신 -а)",
  irr:    "불규칙 복수형이에요. 단어째로 기억해 두세요."
};

const S7 = "кгхжшщч", VOW = "аеёиоуыэюяьй";
const norm = s => s.replace(/ё/g,"е");
function autoRule(sg, pl){
  const s = norm(sg), p = norm(pl), L = s.slice(-1), cut = s.slice(0,-1);
  if((s.endsWith("ие") || s.endsWith("ье")) && p===cut+"я") return "ie";
  if(s.endsWith("ия") && p===cut+"и") return "ie";
  if(s.endsWith("це") && p===cut+"а") return "tse";
  if(L==="о" && p===cut+"а") return "o";
  if(L==="е" && p===cut+"я") return "e";
  if(L==="а" && p===cut+"ы") return "a";
  if(L==="а" && p===cut+"и" && S7.includes(cut.slice(-1))) return "seven";
  if("ьйя".includes(L) && p===cut+"и") return "soft";
  if(!VOW.includes(L) && p===s+"ы") return "hard";
  if(!VOW.includes(L) && p===s+"и" && S7.includes(L)) return "seven";
  return "irr";
}
function genWrong(sg, pl, rule){
  const sw = {"ы":"и","и":"ы","а":"ы","я":"и","е":"ы"};
  const L = pl.slice(-1), b = pl.slice(0,-1), sL = sg.slice(-1);
  let c;
  if(sg.endsWith("ие")) c = [sg.slice(0,-1)+"и", sg, sg.slice(0,-2)+"ий"];
  else if(sg.endsWith("ия")) c = [sg.slice(0,-1)+"е", sg, sg.slice(0,-2)+"ий"];
  else if(rule==="fleet") c = [sg+(S7.includes(sL) ? "и" : "ы"), b+(sw[L]||"ы"), sg];
  else if(L==="а" && !VOW.includes(sL)) c = [sg+"и", sg, sg+"ов"];
  else c = [b+(sw[L]||"ы"), sg, b+"ов"];
  c = c.concat([b+"ей", sg+"ы", b+"а"]);
  return [...new Set(c)].filter(x => x!==pl).slice(0,3);
}
function mk(arr){
  return arr.map(x => {
    let w;
    if(typeof x === "string"){ const [ru,ko,pl,rule,note] = x.split("|"); w = {ru,ko,pl,rule,note}; }
    else { const [ru,ko,pl,wrong,rule,note] = x; w = {ru,ko,pl,wrong,rule,note}; }
    if(!w.rule) w.rule = autoRule(w.ru, w.pl);
    if(!w.wrong) w.wrong = genWrong(w.ru, w.pl, w.rule);
    if(!w.note && w.pl.includes("ё") && !w.ru.includes("ё")) w.note = "복수형에서 강세가 옮겨 가면서 е가 ё로 바뀌어요.";
    return w;
  });
}


const DATA = {
  beginner:{ label:"초급", desc:"처음 배우는 생활 단어", words: mk([
    ["учитель","선생님","учителя",["учителы","учительи","учителов"],"stressA","-ь로 끝나지만 예외적으로 -я가 붙어요. (учителя́)"],
    ["университет","대학교","университеты",["университети","университета","университетов"],"hard"],
    ["яблоко","사과","яблоки",["яблока","яблокы","яблоков"],"irr","중성 -о인데 예외적으로 -и가 붙어요."],
    ["собака","개, 강아지","собаки",["собакы","собака","собаков"],"seven"],
    ["студент","대학생","студенты",["студенти","студента","студентов"],"hard"],
    ["книга","책","книги",["книгы","книга","книгов"],"seven"],
    ["стол","책상","столы",["столи","стола","столов"],"hard"],
    ["ручка","펜","ручки",["ручкы","ручка","ручков"],"seven"],
    ["окно","창문","окна",["окны","окни","окно"],"o"],
    ["мама","엄마","мамы",["мами","мама","мамов"],"a"],
    ["отец","아버지","отцы",["отецы","отци","отеца"],"fleet"],
    ["мать","어머니","матери",["мати","матьи","мата"],"er"],
    ["сын","아들","сыновья",["сына","сыновы","сынья"],"ya","-овья가 붙어요."],
    ["дочь","딸","дочери",["дочи","дочьи","доча"],"er"],
    ["брат","형제","братья",["браты","брата","братьи"],"ya"],
    ["друг","친구","друзья",["другы","друзи","друга"],"ya","г가 з로 바뀌는 것까지 주의하세요."],
    ["человек","사람","люди",["человекы","человека","людьи"],"supp"],
    ["ребёнок","아이","дети",["ребёнки","ребёнка","детьи"],"supp"],
    ["машина","자동차","машины",["машини","машина","машинов"],"a"],
    ["кошка","고양이","кошки",["кошкы","кошка","кошков"],"seven"],
    ["дом","집","дома",["домы","доми","домов"],"stressA"],
    ["город","도시","города",["городы","городи","городов"],"stressA"],
    ["слово","단어","слова",["словы","слови","слово"],"o"],
    ["комната","방","комнаты",["комнати","комната","комнатов"],"a"],
    ["школа","학교","школы",["школи","школа","школов"],"a"],
    ["сумка","가방","сумки",["сумкы","сумка","сумков"],"seven"],
    ["телефон","전화기","телефоны",["телефони","телефона","телефонов"],"hard"],
    ["стул","의자","стулья",["стулы","стула","стулии"],"ya"],
    ["день","날, 하루","дни",["дени","деня","дней"],"fleet"],
    ["неделя","일주일","недели",["неделы","неделя","неделей"],"soft"],
    ["имя","이름","имена",["имени","имии","имён"],"mya"],
    ["врач","의사","врачи",["врачы","врача","врачей"],"seven"],
    "сестра|자매|сёстры",
    "папа|아빠|папы",
    "бабушка|할머니|бабушки",
    "дедушка|할아버지|дедушки",
    "семья|가족|семьи",
    "подруга|(여자) 친구|подруги",
    "мальчик|소년|мальчики",
    "девочка|소녀|девочки",
    "женщина|여자|женщины",
    "мужчина|남자|мужчины",
    "кот|수고양이|коты",
    "рыба|물고기|рыбы",
    "птица|새|птицы",
    "лошадь|말(동물)|лошади",
    "банан|바나나|бананы",
    "апельсин|오렌지|апельсины",
    "помидор|토마토|помидоры",
    "огурец|오이|огурцы|fleet",
    "конфета|사탕|конфеты",
    "чашка|찻잔|чашки",
    "стакан|유리컵|стаканы",
    "тарелка|접시|тарелки",
    "ложка|숟가락|ложки",
    "вилка|포크|вилки",
    "кровать|침대|кровати",
    "дверь|문|двери",
    "стена|벽|стены",
    "квартира|아파트(집)|квартиры",
    "кухня|부엌|кухни",
    "магазин|가게|магазины",
    "улица|거리|улицы",
    "рынок|시장|рынки|fleet",
    "аптека|약국|аптеки",
    "больница|병원|больницы",
    "ресторан|식당|рестораны",
    "театр|극장|театры",
    "автобус|버스|автобусы",
    "самолёт|비행기|самолёты",
    "велосипед|자전거|велосипеды",
    "билет|표, 티켓|билеты",
    "урок|수업|уроки",
    "газета|신문|газеты",
    "фильм|영화|фильмы",
    "песня|노래|песни",
    "игра|게임, 놀이|игры",
    "мяч|공|мячи",
    "компьютер|컴퓨터|компьютеры",
    "вопрос|질문|вопросы",
    "ответ|대답|ответы",
    "задача|문제, 과제|задачи",
    "страна|나라|страны",
    "река|강|реки",
    "гора|산|горы",
    "озеро|호수|озёра",
    "месяц|달(月)|месяцы",
    "ночь|밤|ночи",
    "рука|손, 팔|руки",
    "нога|다리, 발|ноги",
    "голова|머리|головы",
    "зуб|이(치아)|зубы",
    "рубашка|셔츠|рубашки",
    "куртка|재킷|куртки",
    "работа|일, 직장|работы",
    "инженер|엔지니어|инженеры",
    "праздник|명절, 축제|праздники",
    "ключ|열쇠|ключи",
    "торт|케이크|торты",
    "лимон|레몬|лимоны",
    ["журнал","잡지","журналы",["журнали","журнала","журналов"],"hard"],
    ["музей","박물관","музеи",["музейы","музея","музеев"],"soft"],
    ["словарь","사전","словари",["словаря","словары","словарей"],"soft"],
    ["парк","공원","парки",["паркы","парка","парков"],"seven"],
    ["письмо","편지","письма",["письмы","письми","письмо"],"o"],
    ["глаз","눈(신체)","глаза",["глазы","глази","глазов"],"stressA"],
    ["море","바다","моря",["мори","моры","морей"],"e"],
    ["паспорт","여권","паспорта",["паспорты","паспорти","паспортов"],"stressA"],
    ["здание","건물","здания",["здании","здание","зданий"],"ie"],
    ["площадь","광장","площади",["площадя","площадьи","площадей"],"soft"],
    ["лекция","강의","лекции",["лекцыи","лекция","лекций"],"ie"],
    ["тетрадь","공책","тетради",["тетрадя","тетрадьи","тетрадей"],"soft"],
    ["карандаш","연필","карандаши",["карандашы","карандаша","карандашей"],"seven"],
    ["муж","남편","мужья",["мужы","мужа","мужей"],"ya"],
    ["сосед","이웃","соседи",["соседы","соседа","соседов"],"irr","딱딱한 자음으로 끝나는데 예외적으로 -и가 붙어요."],
    ["время","시간, 시대","времена",["времени","времии","времён"],"mya"],
    "упражнение|연습 문제|упражнения",
    "концерт|콘서트|концерты",
    "год|해, 년(年)|годы|hard|구어에서는 года́라고도 해요.",
    "институт|연구소|институты",
    "суп|수프|супы",
    "костюм|정장|костюмы",
    "стих|시(한 편)|стихи",
    "студентка|(여)대학생|студентки",
    "сигарета|담배|сигареты",
    "профессор|교수|профессора|stressA",
    "преподаватель|(대학) 강사|преподаватели",
    "портфель|서류가방|портфели",
    "жена|아내|жёны",
    "дядя|아저씨, 삼촌|дяди",
    "трамвай|전차|трамваи",
    "плащ|우비, 망토|плащи",
    "кинотеатр|영화관|кинотеатры",
    "библиотека|도서관|библиотеки",
    "вокзал|기차역|вокзалы",
    "банк|은행|банки",
    "санаторий|요양원, 리조트|санатории",
    "почта|우체국|почты",
    "общежитие|기숙사|общежития",
    "фирма|회사|фирмы",
    "офис|사무실|офисы",
    "завод|공장|заводы",
    "стадион|경기장|стадионы",
    "балет|발레|балеты",
    "опера|오페라|оперы",
    "учебник|교과서|учебники",
    ["платье","원피스","платья",["платьи","платье","платьев"],"ie"]
  ])},
  intermediate:{ label:"중급", desc:"일상에서 자주 쓰는 단어", words: mk([
    ["подарок","선물","подарки",["подароки","подаркы","подарка"],"fleet"],
    ["щенок","새끼 강아지","щенки",["щеноки","щенкы","щенка"],"fleet","щенята라고도 해요."],
    ["котёнок","새끼 고양이","котята",["котёнки","котёнкы","котёнка"],"onok"],
    ["ухо","귀","уши",["ухи","ухы","уха"],"irr","х가 ш로 바뀌어요."],
    ["плечо","어깨","плечи",["плеча","плечы","плечо"],"irr","중성 -о인데 -и가 붙어요."],
    ["лес","숲","леса",["лесы","леси","лесов"],"stressA"],
    ["дерево","나무","деревья",["деревы","деревов","деревьи"],"ya"],
    ["лист","나뭇잎","листья",["листа","листи","листьи"],"ya","종이 ‘장’이라는 뜻일 때는 листы예요."],
    ["цветок","꽃","цветы",["цветоки","цветокы","цветка"],"irr","-ок이 통째로 빠져요."],
    ["небо","하늘","небеса",["неба","небы","небесы"],"es"],
    ["поезд","기차","поезда",["поезды","поезди","поездов"],"stressA"],
    ["вечер","저녁","вечера",["вечеры","вечери","вечеров"],"stressA"],
    ["нож","칼","ножи",["ножы","ножа","ножей"],"seven"],
    "остров|섬|острова|stressA",
    ["берег","해안, 강가","берега",["берегы","берег","берегов"],"stressA"],
    "адрес|주소|адреса|stressA",
    "номер|번호|номера|stressA",
    "голос|목소리|голоса|stressA",
    ["повар","요리사","повара",["повари","повар","поваров"],"stressA"],
    "носок|양말|носки|fleet",
    "рот|입|рты|fleet",
    "платок|손수건|платки|fleet",
    "звонок|벨, 전화|звонки|fleet",
    "потолок|천장|потолки|fleet",
    "угол|모서리|углы|fleet",
    "палец|손가락|пальцы|fleet",
    "певец|가수|певцы|fleet",
    "продавец|판매원|продавцы|fleet",
    "рисунок|그림|рисунки|fleet",
    "кошелёк|지갑|кошельки|fleet|ё가 빠지고 그 자리에 ь가 남아요.",
    "иностранец|외국인|иностранцы|fleet",
    "заяц|토끼|зайцы|fleet|я가 빠지면서 й로 바뀌어요.",
    "ошибка|실수|ошибки",
    "открытка|엽서|открытки",
    "игрушка|장난감|игрушки",
    "зонт|우산|зонты",
    "зеркало|거울|зеркала",
    "полотенце|수건|полотенца",
    "сердце|심장, 마음|сердца",
    "лицо|얼굴|лица",
    "место|장소, 자리|места",
    "облако|구름|облака",
    "поле|들판|поля",
    "блюдо|요리(음식)|блюда",
    "задание|숙제, 과제|задания",
    "предложение|문장, 제안|предложения",
    "объявление|공고, 안내문|объявления",
    "экскурсия|견학, 투어|экскурсии",
    "станция|역|станции",
    "фамилия|성(姓)|фамилии",
    "аудитория|강의실|аудитории",
    "путешествие|여행|путешествия",
    "понедельник|월요일|понедельники",
    "музыкант|음악가|музыканты",
    "писатель|작가|писатели",
    "художник|화가|художники",
    "водитель|운전기사|водители",
    "спортсмен|운동선수|спортсмены",
    "турист|관광객|туристы",
    "гость|손님|гости",
    "волк|늑대|волки",
    "медведь|곰|медведи",
    "гриб|버섯|грибы",
    "ягода|베리, 열매|ягоды",
    "орех|견과|орехи",
    "овощ|채소|овощи",
    "фрукт|과일|фрукты",
    "холодильник|냉장고|холодильники",
    "шкаф|옷장|шкафы",
    "диван|소파|диваны",
    "этаж|층|этажи",
    "лестница|계단|лестницы",
    "сад|정원|сады",
    "дорога|길|дороги",
    "деревня|시골 마을|деревни",
    "столица|수도|столицы",
    "граница|국경|границы",
    "выставка|전시회|выставки",
    "новость|소식|новости",
    "статья|기사(글)|статьи",
    "мост|다리(교량)|мосты"
  ])},
  advanced:{ label:"고급", desc:"학술·사회·문어 단어", words: mk([
    ["исследование","연구","исследования",["исследовании","исследование","исследований"],"ie"],
    ["явление","현상","явления",["явлении","явление","явлений"],"ie"],
    ["условие","조건","условия",["условии","условие","условий"],"ie"],
    ["событие","사건","события",["событии","событие","событий"],"ie"],
    ["достижение","성과","достижения",["достижении","достижение","достижений"],"ie"],
    ["поколение","세대","поколения",["поколении","поколение","поколений"],"ie"],
    ["предприятие","기업","предприятия",["предприятии","предприятие","предприятий"],"ie"],
    ["растение","식물","растения",["растении","растение","растений"],"ie"],
    ["общество","사회","общества",["обществы","обществи","общество"],"o"],
    ["правительство","정부","правительства",["правительствы","правительстви","правительство"],"o"],
    ["закон","법","законы",["закони","закона","законов"],"hard"],
    ["опыт","실험","опыты",["опыти","опыта","опытов"],"hard"],
    ["ген","유전자","гены",["гени","гена","генов"],"hard"],
    ["клетка","세포","клетки",["клеткы","клетка","клеток"],"seven"],
    ["белок","단백질","белки",["белоки","белкы","белка"],"fleet"],
    ["корень","뿌리","корни",["корени","кореня","корней"],"fleet"],
    ["стебель","줄기","стебли",["стебели","стебеля","стеблей"],"fleet"],
    ["семя","씨앗","семена",["семени","семии","семян"],"mya"],
    ["урожай","수확","урожаи",["урожайы","урожая","урожаев"],"soft"],
    ["гражданин","시민","граждане",["гражданины","граждани","гражданина"],"anin"],
    ["крестьянин","농민","крестьяне",["крестьянины","крестьяни","крестьянина"],"anin"],
    ["англичанин","영국인","англичане",["англичанины","англичанини","англичанина"],"anin"],
    ["хозяин","주인","хозяева",["хозяины","хозяини","хозяина"],"irr","-ин이 빠지고 -ева가 붙는 특수형이에요."],
    ["господин","신사, ~님","господа",["господины","господини","господина"],"irr","-ин이 빠지고 -а가 붙어요."],
    ["герой","영웅","герои",["героы","героя","героев"],"soft"],
    ["чудо","기적","чудеса",["чуда","чуды","чудесы"],"es"],
    ["медвежонок","새끼 곰","медвежата",["медвежонки","медвежонкы","медвежонка"],"onok"],
    ["знамя","깃발","знамёна",["знамени","знамии","знамён"],"mya"],
    "организация|단체, 조직|организации",
    "система|체계, 시스템|системы",
    "структура|구조|структуры",
    "функция|기능|функции",
    "теория|이론|теории",
    "гипотеза|가설|гипотезы",
    "метод|방법|методы",
    "результат|결과|результаты",
    "образец|시료, 견본|образцы|fleet",
    "признак|특징, 징후|признаки",
    "свойство|성질|свойства",
    "вещество|물질|вещества",
    "молекула|분자|молекулы",
    "фермент|효소|ферменты",
    "мутация|돌연변이|мутации",
    "вид|종(種)|виды",
    "организм|생물체|организмы",
    "ткань|(생체) 조직, 천|ткани",
    "плод|열매|плоды",
    "почва|토양|почвы",
    "удобрение|비료|удобрения",
    "сорт|품종|сорта|stressA",
    "исследователь|연구자|исследователи",
    "доказательство|증거|доказательства",
    "вывод|결론|выводы",
    "понятие|개념|понятия",
    "значение|의미|значения",
    "отношение|관계|отношения",
    "решение|결정, 해결|решения",
    "мнение|의견|мнения",
    "чувство|감정|чувства",
    "идея|아이디어, 사상|идеи",
    "ценность|가치|ценности",
    "возможность|가능성|возможности",
    "способность|능력|способности",
    "право|권리|права",
    "суд|법원|суды",
    "партия|정당|партии",
    "государство|국가|государства",
    "реформа|개혁|реформы",
    "кризис|위기|кризисы",
    "конфликт|갈등|конфликты",
    "налог|세금|налоги",
    "доход|수입, 소득|доходы",
    "товар|상품|товары",
    "заявление|신청서, 성명|заявления",
    "требование|요구|требования",
    "памятник|기념비|памятники",
    "век|세기|века|stressA",
    "эпоха|시대|эпохи",
    "поэт|시인|поэты",
    "произведение|작품|произведения",
    "роман|장편소설|романы",
    "стихотворение|시(詩)|стихотворения",
    "судьба|운명|судьбы",
    "душа|영혼|души",
    "мечта|꿈, 소망|мечты",
    "слеза|눈물|слёзы",
    "волна|파도|волны",
    "племя|부족|племена|mya",
    "вождь|지도자, 족장|вожди",
    "царь|황제(차르)|цари",
    "рыцарь|기사(騎士)|рыцари",
    "армянин|아르메니아인|армяне|anin",
    "славянин|슬라브인|славяне|anin",
    "горожанин|도시 주민|горожане|anin",
    "цыплёнок|병아리|цыплята|onok",
    "телёнок|송아지|телята|onok",
    "мастер|장인, 명인|мастера|stressA",
    ["перо","깃털","перья",["пера","перы","перьи"],"ya","-о를 떼고 -ья가 붙어요."],
    ["крыло","날개","крылья",["крыла","крылы","крыльи"],"ya","-о를 떼고 -ья가 붙어요."],
    ["князь","공작(公爵)","князья",["князы","князя","князьи"],"ya"]
  ])}
};

const STRESS_RAW = `учИтель|учителЯ
университЕт|университЕты
Яблоко|Яблоки
собАка|собАки
студЕнт|студЕнты
кнИга|кнИги
стол|столЫ
рУчка|рУчки
окнО|Окна
мАма|мАмы
отЕц|отцЫ
мать|мАтери
сын|сыновьЯ
дочь|дОчери
брат|брАтья
друг|друзьЯ
человЕк|лЮди
ребёнок|дЕти
машИна|машИны
кОшка|кОшки
дом|домА
гОрод|городА
слОво|словА
кОмната|кОмнаты
шкОла|шкОлы
сУмка|сУмки
телефОн|телефОны
стул|стУлья
день|дни
недЕля|недЕли
Имя|именА
врач|врачИ
сестрА|сёстры
пАпа|пАпы
бАбушка|бАбушки
дЕдушка|дЕдушки
семьЯ|сЕмьи
подрУга|подрУги
мАльчик|мАльчики
дЕвочка|дЕвочки
жЕнщина|жЕнщины
мужчИна|мужчИны
кот|котЫ
рЫба|рЫбы
птИца|птИцы
лОшадь|лОшади
банАн|банАны
апельсИн|апельсИны
помидОр|помидОры
огурЕц|огурцЫ
конфЕта|конфЕты
чАшка|чАшки
стакАн|стакАны
тарЕлка|тарЕлки
лОжка|лОжки
вИлка|вИлки
кровАть|кровАти
дверь|двЕри
стенА|стЕны
квартИра|квартИры
кУхня|кУхни
магазИн|магазИны
Улица|Улицы
рЫнок|рЫнки
аптЕка|аптЕки
больнИца|больнИцы
ресторАн|ресторАны
теАтр|теАтры
автОбус|автОбусы
самолёт|самолёты
велосипЕд|велосипЕды
билЕт|билЕты
урОк|урОки
газЕта|газЕты
фильм|фИльмы
пЕсня|пЕсни
игрА|Игры
мяч|мячИ
компьЮтер|компьЮтеры
вопрОс|вопрОсы
отвЕт|отвЕты
задАча|задАчи
странА|стрАны
рекА|рЕки
горА|гОры
Озеро|озёра
мЕсяц|мЕсяцы
ночь|нОчи
рукА|рУки
ногА|нОги
головА|гОловы
зуб|зУбы
рубАшка|рубАшки
кУртка|кУртки
рабОта|рабОты
инженЕр|инженЕры
прАздник|прАздники
ключ|ключИ
торт|тОрты
лимОн|лимОны
журнАл|журнАлы
музЕй|музЕи
словАрь|словарИ
парк|пАрки
письмО|пИсьма
подАрок|подАрки
щенОк|щенкИ
котёнок|котЯта
глаз|глазА
Ухо|Уши
плечО|плЕчи
лес|лесА
дЕрево|дерЕвья
лист|лИстья
цветОк|цветЫ
нЕбо|небесА
мОре|морЯ
пОезд|поездА
пАспорт|паспортА
вЕчер|вечерА
здАние|здАния
плОщадь|плОщади
лЕкция|лЕкции
тетрАдь|тетрАди
карандАш|карандашИ
плАтье|плАтья
нож|ножИ
муж|мужьЯ
сосЕд|сосЕди
врЕмя|временА
Остров|островА
бЕрег|берегА
Адрес|адресА
нОмер|номерА
гОлос|голосА
пОвар|поварА
носОк|носкИ
рот|рты
платОк|платкИ
звонОк|звонкИ
потолОк|потолкИ
Угол|углЫ
пАлец|пАльцы
певЕц|певцЫ
продавЕц|продавцЫ
рисУнок|рисУнки
кошелёк|кошелькИ
инострАнец|инострАнцы
зАяц|зАйцы
ошИбка|ошИбки
открЫтка|открЫтки
игрУшка|игрУшки
зонт|зонтЫ
зЕркало|зеркалА
полотЕнце|полотЕнца
сЕрдце|сердцА
лицО|лИца
мЕсто|местА
Облако|облакА
пОле|полЯ
блЮдо|блЮда
задАние|задАния
упражнЕние|упражнЕния
предложЕние|предложЕния
объявлЕние|объявлЕния
экскУрсия|экскУрсии
стАнция|стАнции
фамИлия|фамИлии
аудитОрия|аудитОрии
путешЕствие|путешЕствия
понедЕльник|понедЕльники
музыкАнт|музыкАнты
писАтель|писАтели
худОжник|худОжники
водИтель|водИтели
спортсмЕн|спортсмЕны
турИст|турИсты
гость|гОсти
волк|вОлки
медвЕдь|медвЕди
гриб|грибЫ
Ягода|Ягоды
орЕх|орЕхи
Овощ|Овощи
фрукт|фрУкты
холодИльник|холодИльники
шкаф|шкафЫ
дивАн|дивАны
этАж|этажИ
лЕстница|лЕстницы
сад|садЫ
дорОга|дорОги
дерЕвня|дерЕвни
столИца|столИцы
гранИца|гранИцы
вЫставка|вЫставки
концЕрт|концЕрты
нОвость|нОвости
статьЯ|статьИ
мост|мостЫ
исслЕдование|исслЕдования
явлЕние|явлЕния
услОвие|услОвия
собЫтие|собЫтия
достижЕние|достижЕния
поколЕние|поколЕния
предприЯтие|предприЯтия
растЕние|растЕния
Общество|Общества
правИтельство|правИтельства
закОн|закОны
Опыт|Опыты
ген|гЕны
клЕтка|клЕтки
белОк|белкИ
кОрень|кОрни
стЕбель|стЕбли
сЕмя|семенА
урожАй|урожАи
гражданИн|грАждане
крестьЯнин|крестьЯне
англичАнин|англичАне
хозЯин|хозЯева
господИн|господА
герОй|герОи
чУдо|чудесА
медвежОнок|медвежАта
знАмя|знамёна
организАция|организАции
систЕма|систЕмы
структУра|структУры
фУнкция|фУнкции
теОрия|теОрии
гипОтеза|гипОтезы
мЕтод|мЕтоды
результАт|результАты
образЕц|образцЫ
прИзнак|прИзнаки
свОйство|свОйства
веществО|веществА
молЕкула|молЕкулы
фермЕнт|фермЕнты
мутАция|мутАции
вид|вИды
органИзм|органИзмы
ткань|ткАни
плод|плодЫ
пОчва|пОчвы
удобрЕние|удобрЕния
сорт|сортА
исслЕдователь|исслЕдователи
доказАтельство|доказАтельства
вЫвод|вЫводы
понЯтие|понЯтия
значЕние|значЕния
отношЕние|отношЕния
решЕние|решЕния
мнЕние|мнЕния
чУвство|чУвства
идЕя|идЕи
цЕнность|цЕнности
возмОжность|возмОжности
спосОбность|спосОбности
прАво|правА
суд|судЫ
пАртия|пАртии
госудАрство|госудАрства
рефОрма|рефОрмы
крИзис|крИзисы
конфлИкт|конфлИкты
налОг|налОги
дохОд|дохОды
товАр|товАры
заявлЕние|заявлЕния
трЕбование|трЕбования
пАмятник|пАмятники
век|векА
эпОха|эпОхи
поЭт|поЭты
произведЕние|произведЕния
ромАн|ромАны
стихотворЕние|стихотворЕния
судьбА|сУдьбы
душА|дУши
мечтА|мечтЫ
слезА|слёзы
волнА|вОлны
плЕмя|племенА
вождь|вождИ
царь|царИ
рЫцарь|рЫцари
армянИн|армЯне
славянИн|славЯне
горожАнин|горожАне
цыплёнок|цыплЯта
телёнок|телЯта
мАстер|мастерА
перО|пЕрья
крылО|крЫлья
князь|князьЯ
год|гОды
инститУт|инститУты
суп|супЫ
костЮм|костЮмы
стих|стихИ
студЕнтка|студЕнтки
сигарЕта|сигарЕты
профЕссор|профессорА
преподавАтель|преподавАтели
портфЕль|портфЕли
женА|жёны
дЯдя|дЯди
трамвАй|трамвАи
плащ|плащИ
кинотеАтр|кинотеАтры
библиотЕка|библиотЕки
вокзАл|вокзАлы
банк|бАнки
санатОрий|санатОрии
пОчта|пОчты
общежИтие|общежИтия
фИрма|фИрмы
Офис|Офисы
завОд|завОды
стадиОн|стадиОны
балЕт|балЕты
Опера|Оперы
учЕбник|учЕбники`;

const EXC = { stressA:"-а / -я 복수", fleet:"출몰모음", ya:"-ья 복수", mya:"-мя → -мена", onok:"-ёнок → -ята", anin:"-анин → -ане", supp:"완전히 다른 단어", er:"-ер- 삽입", es:"-еса 복수", irr:"불규칙" };
const excBadge = w => EXC[w.rule] ? `<span class="exc">예외 복수형 · ${EXC[w.rule]}</span>` : "";
const ACC = "\u0301";
const acc = s => s.replace(/[АЕИОУЫЭЮЯ]/g, c => c.toLowerCase() + ACC);
const STRESS = {};
STRESS_RAW.split("\n").forEach(l => { const [a,b] = l.split("|"); STRESS[a.toLowerCase()] = [acc(a), acc(b)]; });
Object.values(DATA).forEach(d => d.words.forEach(w => { const st = STRESS[w.ru] || [w.ru, w.pl]; w.ruS = st[0]; w.plS = st[1]; }));

const LL_AUDIO = {};   /* 원어민 녹음 · audio-native.json 팩에서 채워요 */
const TTS_AUDIO = {};  /* 음성 합성 여성(baya) · audio-tts.json 팩에서 채워요 */
const TTS_AUDIO_M = {};  /* 음성 합성 남성(eugene) · audio-tts-m.json 팩에서 채워요 */
const LL_CREDITS = [["университет", "Svetlov Artem", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Svetlov_Artem-%D0%A3%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%82%D0%B5%D1%82.wav"], ["яблоко", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D1%8F%D0%B1%D0%BB%D0%BE%D0%BA%D0%BE.wav"], ["собака", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%81%D0%BE%D0%B1%D0%B0%D0%BA%D0%B0.wav"], ["стол", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush_(Reda_Kerbouche)-%D1%81%D1%82%D0%BE%D0%BB.wav"], ["мама", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BC%D0%B0%D0%BC%D0%B0.wav"], ["отец", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BE%D1%82%D0%B5%D1%86.wav"], ["сын", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%81%D1%8B%D0%BD.wav"], ["дочь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B4%D0%BE%D1%87%D1%8C.wav"], ["брат", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D1%80%D0%B0%D1%82.wav"], ["братья", "DomesticFrog", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DomesticFrog-%D0%B1%D1%80%D0%B0%D1%82%D1%8C%D1%8F.wav"], ["друг", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B4%D1%80%D1%83%D0%B3.wav"], ["человек", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D1%87%D0%B5%D0%BB%D0%BE%D0%B2%D0%B5%D0%BA.wav"], ["люди", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%BB%D1%8E%D0%B4%D0%B8.wav"], ["кошка", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%BA%D0%BE%D1%88%D0%BA%D0%B0.wav"], ["дом", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B4%D0%BE%D0%BC.wav"], ["город", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BE%D1%80%D0%BE%D0%B4.wav"], ["слово", "Tatiana moocit", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_moocit-%D1%81%D0%BB%D0%BE%D0%B2%D0%BE.wav"], ["день", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B4%D0%B5%D0%BD%D1%8C.wav"], ["неделя", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F.wav"], ["имена", "Jordónus", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Jord%C3%B3nus-%D0%B8%D0%BC%D0%B5%D0%BD%D0%B0.wav"], ["врач", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D1%80%D0%B0%D1%87.wav"], ["папа", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%B0%D0%BF%D0%B0.wav"], ["бабушка", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B0%D0%B1%D1%83%D1%88%D0%BA%D0%B0.wav"], ["женщина", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%B6%D0%B5%CC%81%D0%BD%D1%89%D0%B8%D0%BD%D0%B0.wav"], ["женщины", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%B6%D0%B5%CC%81%D0%BD%D1%89%D0%B8%D0%BD%D1%8B.wav"], ["кот", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BA%D0%BE%D1%82.wav"], ["коты", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BA%D0%BE%D1%82%D1%8B.wav"], ["банан", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B1%D0%B0%D0%BD%D0%B0%D0%BD.wav"], ["апельсин", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B0%D0%BF%D0%B5%D0%BB%D1%8C%D1%81%D0%B8%D0%BD.wav"], ["помидор", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%BF%D0%BE%D0%BC%D0%B8%D0%B4%D0%BE%D1%80.wav"], ["помидоры", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%BF%D0%BE%D0%BC%D0%B8%D0%B4%D0%BE%D1%80%D1%8B.wav"], ["огурец", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%BE%D0%B3%D1%83%D1%80%D0%B5%D1%86.wav"], ["огурцы", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%BE%D0%B3%D1%83%D1%80%D1%86%D1%8B.wav"], ["вилка", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B8%D0%BB%D0%BA%D0%B0.wav"], ["дверь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B4%D0%B2%D0%B5%D1%80%D1%8C.wav"], ["аптека", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D0%BF%D1%82%D0%B5%D0%BA%D0%B0.wav"], ["больница", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D1%86%D0%B0.wav"], ["автобус", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D0%B2%D1%82%D0%BE%D0%B1%D1%83%D1%81.wav"], ["велосипед", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4.wav"], ["билет", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B8%D0%BB%D0%B5%D1%82.wav"], ["фильм", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%84%D0%B8%D0%BB%D1%8C%D0%BC.wav"], ["компьютер", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%BA%D0%BE%D0%BC%D0%BF%D1%8C%D1%8E%D1%82%D0%B5%D1%80.wav"], ["гора", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BE%D1%80%D0%B0.wav"], ["ночь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BD%D0%BE%D1%87%D1%8C.wav"], ["рука", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%80%D1%83%D0%BA%D0%B0.wav"], ["нога", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%BD%D0%BE%D0%B3%D0%B0.wav"], ["куртка", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BA%D1%83%D1%80%D1%82%D0%BA%D0%B0.wav"], ["лимон", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BB%D0%B8%D0%BC%D0%BE%D0%BD.wav"], ["словарь", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C.wav"], ["глаз", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BB%D0%B0%D0%B7.wav"], ["лес", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BB%D0%B5%D1%81.wav"], ["небеса", "DomesticFrog", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DomesticFrog-%D0%BD%D0%B5%D0%B1%D0%B5%D1%81%D0%B0.wav"], ["вечер", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B5%D1%87%D0%B5%D1%80.wav"], ["платье", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%BB%D0%B0%D1%82%D1%8C%D0%B5.wav"], ["остров", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BE%D1%81%D1%82%D1%80%D0%BE%D0%B2.wav"], ["берег", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B5%D1%80%D0%B5%D0%B3.wav"], ["адрес", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D0%B4%D1%80%D0%B5%D1%81.wav"], ["голос", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BE%D0%BB%D0%BE%D1%81.wav"], ["носок", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BD%D0%BE%D1%81%D0%BE%D0%BA.wav"], ["рот", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%80%D0%BE%D1%82.wav"], ["угол", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%83%D0%B3%D0%BE%D0%BB.wav"], ["блюдо", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BB%D1%8E%D0%B4%D0%BE.wav"], ["блюда", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BB%D1%8E%D0%B4%D0%B0.wav"], ["задание", "Vikodist", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Vikodist-%D0%B7%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5.wav"], ["аудитория", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D1%83%D0%B4%D0%B8%D1%82%D0%BE%D1%80%D0%B8%D1%8F.wav"], ["понедельник", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D0%BF%D0%BE%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA.wav"], ["волк", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%BE%D0%BB%D0%BA.wav"], ["волки", "Nobody178", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Nobody178-%D0%B2%D0%BE%D0%BB%D0%BA%D0%B8.wav"], ["медведи", "Nobody178", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Nobody178-%D0%BC%D0%B5%D0%B4%D0%B2%D0%B5%D0%B4%D0%B8.wav"], ["гриб", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B3%D1%80%D0%B8%D0%B1.wav"], ["грибы", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B3%D1%80%D0%B8%D0%B1%D1%8B.wav"], ["овощи", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D0%BE%D0%B2%D0%BE%D1%89%D0%B8.wav"], ["фрукты", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D1%84%D1%80%D1%83%D0%BA%D1%82%D1%8B.wav"], ["холодильник", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D1%85%D0%BE%D0%BB%D0%BE%D0%B4%D0%B8%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA.wav"], ["холодильники", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D1%85%D0%BE%D0%BB%D0%BE%D0%B4%D0%B8%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%B8.wav"], ["шкаф", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%88%D0%BA%D0%B0%D1%84.wav"], ["лестница", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%BB%D0%B5%D1%81%D1%82%D0%BD%D0%B8%D1%86%D0%B0.wav"], ["сад", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%81%D0%B0%D0%B4.wav"], ["граница", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0.wav"], ["границы", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D1%8B.wav"], ["мост", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BC%D0%BE%D1%81%D1%82.wav"], ["растения", "Irina", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Irina_(%D0%9D%D0%B5%D0%B9%D1%88%D0%BB%D0%BE%D1%82%D1%81%D0%BA%D0%B8%D0%B9)-%D0%A0%D0%B0%D1%81%D1%82%D0%B5%D0%BD%D0%B8%D1%8F.wav"], ["белок", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B5%D0%BB%D0%BE%D0%BA.wav"], ["крестьянин", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%BA%D1%80%D0%B5%D1%81%D1%82%D1%8C%D1%8F%D0%BD%D0%B8%D0%BD.wav"], ["англичанин", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D1%87%D0%B0%D0%BD%D0%B8%D0%BD.wav"], ["медвежонок", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D0%BC%D0%B5%D0%B4%D0%B2%D0%B5%D0%B6%D0%BE%D0%BD%D0%BE%D0%BA.wav"], ["вещество", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B5%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%BE.wav"], ["фермент", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D1%84%D0%B5%D1%80%D0%BC%D0%B5%D0%BD%D1%82.wav"], ["мутация", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D0%BC%D1%83%D1%82%D0%B0%D1%86%D0%B8%D1%8F.wav"], ["вид", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B8%D0%B4.wav"], ["государство", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%BE.wav"], ["государства", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%B0.wav"], ["век", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B5%D0%BA.wav"], ["царь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%86%D0%B0%D1%80%D1%8C.wav"], ["армянин", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D1%80%D0%BC%D1%8F%D0%BD%D0%B8%D0%BD.wav"], ["цыплёнок", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D1%86%D1%8B%D0%BF%D0%BB%D1%91%D0%BD%D0%BE%D0%BA.wav"], ["князь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BA%D0%BD%D1%8F%D0%B7%D1%8C.wav"], ["год", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BE%D0%B4.wav"], ["суп", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%81%D1%83%D0%BF.wav"], ["стихи", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D1%81%D1%82%D0%B8%D1%85%D0%B8.wav"], ["профессор", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%BF%D1%80%D0%BE%D1%84%D0%B5%D1%81%D1%81%D0%BE%D1%80.wav"], ["жена", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B6%D0%B5%D0%BD%D0%B0.wav"], ["дядя", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B4%D1%8F%D0%B4%D1%8F.wav"], ["библиотека", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0.wav"], ["банк", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B0%D0%BD%D0%BA.wav"], ["балет", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B0%D0%BB%D0%B5%D1%82.wav"], ["говорить", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%B8%D1%82%D1%8C.wav"], ["жить", "Hwizzkid", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Hwizzkid-%D0%B6%D0%B8%D1%82%D1%8C.wav"], ["говорят", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D1%8F%D1%82.wav"], ["видеть", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B8%D0%B4%D0%B5%D1%82%D1%8C.wav"], ["брать", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D1%80%D0%B0%D1%82%D1%8C.wav"], ["бежать", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B5%D0%B6%D0%B0%D1%82%D1%8C.wav"], ["россия", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F.wav"], ["россии", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D0%B8.wav"], ["байкал", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B1%D0%B0%D0%B9%D0%BA%D0%B0%D0%BB.wav"], ["пол", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%BE%D0%BB.wav"], ["аэропорт", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B0%D1%8D%D1%80%D0%BE%D0%BF%D0%BE%D1%80%D1%82.wav"], ["европа", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%95%D0%B2%D1%80%D0%BE%D0%BF%D0%B0.wav"], ["германия", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%93%D0%B5%D1%80%D0%BC%D0%B0%D0%BD%D0%B8%D1%8F.wav"], ["италия", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%98%D1%82%D0%B0%D0%BB%D0%B8%D1%8F.wav"], ["холодильнике", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D1%85%D0%BE%D0%BB%D0%BE%D0%B4%D0%B8%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%B5.wav"], ["крым", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%9A%D1%80%D1%8B%D0%BC.wav"], ["порт", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%BE%D1%80%D1%82.wav"], ["снег", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%81%D0%BD%D0%B5%D0%B3.wav"], ["конференция", "Niklitov", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Niklitov-%D0%BA%D0%BE%D0%BD%D1%84%D0%B5%D1%80%D0%B5%D0%BD%D1%86%D0%B8%D1%8F.wav"], ["сибирь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%A1%D0%B8%D0%B1%D0%B8%D1%80%D1%8C.wav"], ["кипр", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%9A%D0%B8%D0%BF%D1%80.wav"], ["антон", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%90%D0%BD%D1%82%D0%BE%D0%BD.wav"], ["антона", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%90%D0%BD%D1%82%D0%BE%D0%BD%D0%B0.wav"], ["сок", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%81%D0%BE%D0%BA.wav"], ["чай", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%87%D0%B0%D0%B9.wav"], ["вода", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B2%D0%BE%D0%B4%D0%B0.wav"], ["молоко", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D0%BC%D0%BE%D0%BB%D0%BE%D0%BA%D0%BE.wav"], ["меня", "DomesticFrog", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DomesticFrog-%D0%BC%D0%B5%D0%BD%D1%8F.wav"], ["его", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B5%D0%B3%D0%BE.wav"], ["её", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B5%D1%91.wav"], ["их", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%B8%D1%85.wav"], ["лёд", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BB%D1%91%D0%B4.wav"], ["воду", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B2%D0%BE%D0%B4%D1%83.wav"], ["антоне", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%90%D0%BD%D1%82%D0%BE%D0%BD%D0%B5.wav"], ["доме", "Infovarius", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Infovarius-%D0%B4%D0%BE%D0%BC%D0%B5.wav"], ["мне", "Rominf", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Rominf-%D0%BC%D0%BD%D0%B5.wav"], ["тебе", "DomesticFrog", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DomesticFrog-%D1%82%D0%B5%D0%B1%D0%B5.wav"], ["он", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BE%D0%BD.wav"], ["нём", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BD%D1%91%D0%BC.wav"], ["она", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BE%D0%BD%D0%B0.wav"], ["ней", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BD%D0%B5%D0%B9.wav"], ["они", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%BE%D0%BD%D0%B8.wav"], ["биология", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B8%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%8F.wav"], ["английский язык", "DomesticFrog", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DomesticFrog-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D1%8F%D0%B7%D1%8B%D0%BA.wav"], ["что", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%87%D1%82%D0%BE.wav"], ["где", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%B4%D0%B5.wav"], ["как", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BA%D0%B0%D0%BA.wav"], ["нет", "Tatiana moocit", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_moocit-%D0%BD%D0%B5%D1%82.wav"], ["спасибо", "Butko", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Butko-%D1%81%D0%BF%D0%B0%D1%81%D0%B8%D0%B1%D0%BE.wav"], ["извините", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B8%D0%B7%D0%B2%D0%B8%D0%BD%D0%B8%D1%82%D0%B5.wav"], ["один", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%BE%D0%B4%D0%B8%D0%BD.wav"], ["два", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%B4%D0%B2%D0%B0.wav"], ["пять", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%BF%D1%8F%D1%82%D1%8C.wav"], ["семь", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%81%D0%B5%D0%BC%D1%8C.wav"], ["восемь", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%B2%D0%BE%D1%81%D0%B5%D0%BC%D1%8C.wav"], ["девять", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%B4%D0%B5%D0%B2%D1%8F%D1%82%D1%8C.wav"], ["десять", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D0%B4%D0%B5%D1%81%D1%8F%D1%82%D1%8C.wav"], ["мясо", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D0%BC%D1%8F%D1%81%D0%BE.wav"], ["картофель", "Irina", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Irina_(%D0%9D%D0%B5%D0%B9%D1%88%D0%BB%D0%BE%D1%82%D1%81%D0%BA%D0%B8%D0%B9)-%D0%9A%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D1%8C.wav"], ["рис", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%80%D0%B8%D1%81.wav"], ["виноград", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%B2%D0%B8%D0%BD%D0%BE%D0%B3%D1%80%D0%B0%D0%B4.wav"], ["брюки", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D1%80%D1%8E%D0%BA%D0%B8.wav"], ["три", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%82%D1%80%D0%B8.wav"], ["четыре", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%87%D0%B5%D1%82%D1%8B%D1%80%D0%B5.wav"], ["шесть", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%88%D0%B5%D1%81%D1%82%D1%8C.wav"], ["сто", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D1%81%D1%82%D0%BE.wav"], ["тысяча", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D1%82%D1%8B%D1%81%D1%8F%D1%87%D0%B0.wav"], ["здравствуйте", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B7%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5.wav"], ["привет", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82.wav"], ["пока", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%BE%D0%BA%D0%B0.wav"], ["пожалуйста", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%BE%D0%B6%D0%B0%D0%BB%D1%83%D0%B9%D1%81%D1%82%D0%B0.wav"], ["большой", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BE%D0%BB%D1%8C%D1%88%D0%BE%D0%B9.wav"], ["русский", "Baidax", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Baidax-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9.wav"], ["но", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BD%D0%BE.wav"], ["или", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B8%D0%BB%D0%B8.wav"], ["потому что", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%BE%D1%82%D0%BE%D0%BC%D1%83_%D1%87%D1%82%D0%BE.wav"], ["лето", "XANA000", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-XANA000-%D0%BB%D0%B5%D1%82%D0%BE.wav"], ["зима", "XANA000", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-XANA000-%D0%B7%D0%B8%D0%BC%D0%B0.wav"], ["весна", "XANA000", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-XANA000-%D0%B2%D0%B5%D1%81%D0%BD%D0%B0.wav"], ["осень", "XANA000", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-XANA000-%D0%BE%D1%81%D0%B5%D0%BD%D1%8C.wav"], ["час", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%87%D0%B0%D1%81.wav"], ["хлеб", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%85%D0%BB%D0%B5%D0%B1.wav"], ["кофе", "1Apollinariya1", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-1Apollinariya1-%D0%BA%D0%BE%D1%84%D0%B5.wav"], ["день рождения", "DomesticFrog", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DomesticFrog-%D0%B4%D0%B5%D0%BD%D1%8C_%D1%80%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D1%8F.wav"], ["важный", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B0%D0%B6%D0%BD%D1%8B%D0%B9.wav"], ["весёлый", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%B5%D1%81%D1%91%D0%BB%D1%8B%D0%B9.wav"], ["быстрый", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D1%8B%D1%81%D1%82%D1%80%D1%8B%D0%B9.wav"], ["близкий", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BB%D0%B8%D0%B7%D0%BA%D0%B8%D0%B9.wav"], ["быстро", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D1%8B%D1%81%D1%82%D1%80%D0%BE.wav"], ["вместе", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B2%D0%BC%D0%B5%D1%81%D1%82%D0%B5.wav"], ["мир", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BC%D0%B8%D1%80.wav"], ["народ", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BD%D0%B0%D1%80%D0%BE%D0%B4.wav"], ["отпуск", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BE%D1%82%D0%BF%D1%83%D1%81%D0%BA.wav"], ["болезнь", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BE%D0%BB%D0%B5%D0%B7%D0%BD%D1%8C.wav"], ["правда", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D0%BF%D1%80%D0%B0%D0%B2%D0%B4%D0%B0.wav"], ["болеть", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BE%D0%BB%D0%B5%D1%82%D1%8C.wav"], ["бояться", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%BE%D1%8F%D1%82%D1%8C%D1%81%D1%8F.wav"], ["словаре", "Lvova", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Lvova-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D0%B5.wav"], ["первый", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%BF%D0%B5%D1%80%D0%B2%D1%8B%D0%B9.wav"], ["пятый", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%BF%D1%8F%D1%82%D1%8B%D0%B9.wav"], ["юбка", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D1%8E%D0%B1%D0%BA%D0%B0.wav"], ["блузка", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D0%B1%D0%BB%D1%83%D0%B7%D0%BA%D0%B0.wav"], ["белый", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B1%D0%B5%D0%BB%D1%8B%D0%B9.wav"], ["голубой", "Tatiana Kerbush", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Tatiana_Kerbush-%D0%B3%D0%BE%D0%BB%D1%83%D0%B1%D0%BE%D0%B9.wav"], ["жёлтый", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D0%B6%D1%91%D0%BB%D1%82%D1%8B%D0%B9.wav"], ["зелёный", "Sofia Sycheva", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Sofia_Sycheva-%D0%B7%D0%B5%D0%BB%D1%91%D0%BD%D1%8B%D0%B9.wav"], ["красный", "Sofia Sycheva", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Sofia_Sycheva-%D0%BA%D1%80%D0%B0%D1%81%D0%BD%D1%8B%D0%B9.wav"], ["коричневый", "Sofia Sycheva", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Sofia_Sycheva-%D0%BA%D0%BE%D1%80%D0%B8%D1%87%D0%BD%D0%B5%D0%B2%D1%8B%D0%B9.wav"], ["оранжевый", "Sofia Sycheva", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Sofia_Sycheva-%D0%BE%D1%80%D0%B0%D0%BD%D0%B6%D0%B5%D0%B2%D1%8B%D0%B9.wav"], ["розовый", "Sofia Sycheva", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Sofia_Sycheva-%D1%80%D0%BE%D0%B7%D0%BE%D0%B2%D1%8B%D0%B9.wav"], ["серый", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D1%81%D0%B5%D1%80%D1%8B%D0%B9.wav"], ["синий", "DoctorandusManhattan", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-DoctorandusManhattan-%D1%81%D0%B8%D0%BD%D0%B8%D0%B9.wav"], ["фиолетовый", "Cinemantique", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Cinemantique-%D1%84%D0%B8%D0%BE%D0%BB%D0%B5%D1%82%D0%BE%D0%B2%D1%8B%D0%B9.wav"], ["чёрный", "Sofia Sycheva", "CC0", "https://commons.wikimedia.org/wiki/File:LL-Q7737_(rus)-Sofia_Sycheva-%D1%87%D1%91%D1%80%D0%BD%D1%8B%D0%B9.wav"], ["зонт", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%BE%D0%BD%D1%82.ogg"], ["палец", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B0%D0%BB%D0%B5%D1%86.ogg"], ["о", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE.ogg"], ["а", "위키미디어 공용", "Public domain", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B0.ogg"], ["в", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2.ogg"], ["и", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8.ogg"], ["язык", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8F%D0%B7%D1%8B%D0%BA.ogg"], ["я", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8F.ogg"], ["знать", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%BD%D0%B0%D1%82%D1%8C.ogg"], ["по-русски", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8.ogg"], ["птица", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%82%D0%B8%D1%86%D0%B0.ogg"], ["хорошо", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D0%BE%D1%80%D0%BE%D1%88%D0%BE.ogg"], ["спать", "Audio sample provided by The Shtooka Project", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BF%D0%B0%D1%82%D1%8C.ogg"], ["играть", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%B3%D1%80%D0%B0%D1%82%D1%8C.ogg"], ["работа", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0.ogg"], ["сердце", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D1%80%D0%B4%D1%86%D0%B5.ogg"], ["да", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B0.ogg"], ["озеро", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B7%D0%B5%D1%80%D0%BE.ogg"], ["мой", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BE%D0%B9.ogg"], ["щенок", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%89%D0%B5%D0%BD%D0%BE%D0%BA.ogg"], ["ручка", "The Shtooka Project", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D1%83%D1%87%D0%BA%D0%B0.ogg"], ["дешёвый", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D1%88%D1%91%D0%B2%D1%8B%D0%B9.ogg"], ["голова", "The Shtooka Project", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0.ogg"], ["часто", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D0%B0%D1%81%D1%82%D0%BE.ogg"], ["мы", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%8B.ogg"], ["делать", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D0%BB%D0%B0%D1%82%D1%8C.ogg"], ["господин", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B8%D0%BD.ogg"], ["дерево", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE.ogg"], ["стена", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B5%D0%BD%D0%B0.ogg"], ["там", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B0%D0%BC.ogg"], ["давать", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B0%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["москва", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0.ogg"], ["лошадь", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%BE%D1%88%D0%B0%D0%B4%D1%8C.ogg"], ["сумка", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%83%D0%BC%D0%BA%D0%B0.ogg"], ["минута", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B8%D0%BD%D1%83%D1%82%D0%B0.ogg"], ["это", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8D%D1%82%D0%BE.ogg"], ["ты", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%8B.ogg"], ["вы", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%8B.ogg"], ["игра", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%B3%D1%80%D0%B0.ogg"], ["книга", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BD%D0%B8%D0%B3%D0%B0.ogg"], ["открывать", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%82%D0%BA%D1%80%D1%8B%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["твой", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B2%D0%BE%D0%B9.ogg"], ["ваш", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%B0%D1%88.ogg"], ["наш", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%88.ogg"], ["мальчик", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D0%BB%D1%8C%D1%87%D0%B8%D0%BA.ogg"], ["окно", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%BA%D0%BD%D0%BE.ogg"], ["не", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B5.ogg"], ["девочка", "The Shtooka Project", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D0%B2%D0%BE%D1%87%D0%BA%D0%B0.ogg"], ["здесь", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B4%D0%B5%D1%81%D1%8C.ogg"], ["облако", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D0%BB%D0%B0%D0%BA%D0%BE.ogg"], ["река", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D0%BA%D0%B0.ogg"], ["америка", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%90%D0%BC%D0%B5%D1%80%D0%B8%D0%BA%D0%B0.ogg"], ["имя", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%BC%D1%8F.ogg"], ["море", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BE%D1%80%D0%B5.ogg"], ["перо", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B5%D1%80%D0%BE.ogg"], ["карандаш", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B0%D1%80%D0%B0%D0%BD%D0%B4%D0%B0%D1%88.ogg"], ["сразу", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%80%D0%B0%D0%B7%D1%83.ogg"], ["школа", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%88%D0%BA%D0%BE%D0%BB%D0%B0.ogg"], ["мать", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D1%82%D1%8C.ogg"], ["время", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%80%D0%B5%D0%BC%D1%8F.ogg"], ["хороший", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D0%BE%D1%80%D0%BE%D1%88%D0%B8%D0%B9.ogg"], ["вокзал", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D0%BA%D0%B7%D0%B0%D0%BB.ogg"], ["номер", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%BE%D0%BC%D0%B5%D1%80.ogg"], ["есть", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B5%D1%81%D1%82%D1%8C.ogg"], ["театр", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B5%D0%B0%D1%82%D1%80.ogg"], ["этот", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8D%D1%82%D0%BE%D1%82.ogg"], ["на", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0.ogg"], ["площадь", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C.ogg"], ["место", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D1%81%D1%82%D0%BE.ogg"], ["часы", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D0%B0%D1%81%D1%8B.ogg"], ["цветок", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%86%D0%B2%D0%B5%D1%82%D0%BE%D0%BA.ogg"], ["ребёнок", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D0%B1%D1%91%D0%BD%D0%BE%D0%BA.ogg"], ["дети", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D1%82%D0%B8.ogg"], ["юг", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8E%D0%B3.ogg"], ["ухо", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%85%D0%BE.ogg"], ["комната", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BC%D0%BD%D0%B0%D1%82%D0%B0.ogg"], ["молодой", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BE%D0%BB%D0%BE%D0%B4%D0%BE%D0%B9.ogg"], ["любить", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D1%8E%D0%B1%D0%B8%D1%82%D1%8C.ogg"], ["север", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%B2%D0%B5%D1%80.ogg"], ["мужчина", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%83%D0%B6%D1%87%D0%B8%D0%BD%D0%B0.ogg"], ["восток", "The Shtooka Project", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D0%BA.ogg"], ["запад", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%BF%D0%B0%D0%B4.ogg"], ["крыло", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%80%D1%8B%D0%BB%D0%BE.ogg"], ["друзья", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D1%80%D1%83%D0%B7%D1%8C%D1%8F.ogg"], ["иван", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%98%D0%B2%D0%B0%D0%BD.ogg"], ["нож", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%BE%D0%B6.ogg"], ["нас", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%81.ogg"], ["рыба", "Gulnara Streit", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D1%8B%D0%B1%D0%B0.ogg"], ["волга", "Сергей Сахно, Vion Nicolas", "CC BY 3.0 us", "https://commons.wikimedia.org/wiki/File:Ru-%D0%92%D0%BE%D0%BB%D0%B3%D0%B0.ogg"], ["улица", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%BB%D0%B8%D1%86%D0%B0.ogg"], ["родина", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%BE%D0%B4%D0%B8%D0%BD%D0%B0.ogg"], ["душа", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D1%83%D1%88%D0%B0.ogg"], ["следующий", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BB%D0%B5%D0%B4%D1%83%D1%8E%D1%89%D0%B8%D0%B9.ogg"], ["новый", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9.ogg"], ["общество", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%BE.ogg"], ["уже", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%B6%D0%B5.ogg"], ["система", "위키미디어 공용", "CC BY 2.0 fr", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0.ogg"], ["телёнок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B5%D0%BB%D1%91%D0%BD%D0%BE%D0%BA.ogg"], ["который", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B%D0%B9.ogg"], ["мнение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["обедать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D0%B5%D0%B4%D0%B0%D1%82%D1%8C.ogg"], ["идти", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%B4%D1%82%D0%B8.ogg"], ["лист", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B8%D1%81%D1%82.ogg"], ["кровать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["страна", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B0.ogg"], ["песня", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B5%D1%81%D0%BD%D1%8F.ogg"], ["погода", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%B3%D0%BE%D0%B4%D0%B0.ogg"], ["мечта", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D1%87%D1%82%D0%B0.ogg"], ["газета", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%B0%D0%B7%D0%B5%D1%82%D0%B0.ogg"], ["кто", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%82%D0%BE.ogg"], ["гость", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D1%81%D1%82%D1%8C.ogg"], ["телефон", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD.ogg"], ["кухня", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%83%D1%85%D0%BD%D1%8F.ogg"], ["зуб", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D1%83%D0%B1.ogg"], ["роман", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%BE%D0%BC%D0%B0%D0%BD.ogg"], ["месяц", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D1%81%D1%8F%D1%86.ogg"], ["когда", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%B3%D0%B4%D0%B0.ogg"], ["муж", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%83%D0%B6.ogg"], ["плохой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%BE%D1%85%D0%BE%D0%B9.ogg"], ["последний", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D0%BD%D0%B8%D0%B9.ogg"], ["третий", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%80%D0%B5%D1%82%D0%B8%D0%B9.ogg"], ["красивый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%80%D0%B0%D1%81%D0%B8%D0%B2%D1%8B%D0%B9.ogg"], ["суд", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%83%D0%B4.ogg"], ["далёкий", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B0%D0%BB%D1%91%D0%BA%D0%B8%D0%B9.ogg"], ["урок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%80%D0%BE%D0%BA.ogg"], ["теория", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F.ogg"], ["какой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B0%D0%BA%D0%BE%D0%B9.ogg"], ["чей", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D0%B5%D0%B9.ogg"], ["студент", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D1%83%D0%B4%D0%B5%D0%BD%D1%82.ogg"], ["ещё", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B5%D1%89%D1%91.ogg"], ["очень", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%87%D0%B5%D0%BD%D1%8C.ogg"], ["пить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B8%D1%82%D1%8C.ogg"], ["журнал", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B6%D1%83%D1%80%D0%BD%D0%B0%D0%BB.ogg"], ["герой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%B5%D1%80%D0%BE%D0%B9.ogg"], ["история", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8F.ogg"], ["сидеть", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B8%D0%B4%D0%B5%D1%82%D1%8C.ogg"], ["мыть", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%8B%D1%82%D1%8C.ogg"], ["дорога", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D1%80%D0%BE%D0%B3%D0%B0.ogg"], ["почему", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%87%D0%B5%D0%BC%D1%83.ogg"], ["право", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B0%D0%B2%D0%BE.ogg"], ["мочь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BE%D1%87%D1%8C.ogg"], ["второй", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%82%D0%BE%D1%80%D0%BE%D0%B9.ogg"], ["маленький", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D0%BB%D0%B5%D0%BD%D1%8C%D0%BA%D0%B8%D0%B9.ogg"], ["много", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE.ogg"], ["пальто", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B0%D0%BB%D1%8C%D1%82%D0%BE.ogg"], ["этаж", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8D%D1%82%D0%B0%D0%B6.ogg"], ["ходить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D0%BE%D0%B4%D0%B8%D1%82%D1%8C.ogg"], ["сколько", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BA%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE.ogg"], ["хотеть", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D0%BE%D1%82%D0%B5%D1%82%D1%8C.ogg"], ["только", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE.ogg"], ["письмо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B8%D1%81%D1%8C%D0%BC%D0%BE.ogg"], ["сегодня", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%B3%D0%BE%D0%B4%D0%BD%D1%8F.ogg"], ["сейчас", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%B9%D1%87%D0%B0%D1%81.ogg"], ["потом", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%82%D0%BE%D0%BC.ogg"], ["учить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%87%D0%B8%D1%82%D1%8C.ogg"], ["куда", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%83%D0%B4%D0%B0.ogg"], ["семя", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%BC%D1%8F.ogg"], ["другой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D1%80%D1%83%D0%B3%D0%BE%D0%B9.ogg"], ["находить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%85%D0%BE%D0%B4%D0%B8%D1%82%D1%8C.ogg"], ["читать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C.ogg"], ["учиться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%87%D0%B8%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["рассказывать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B0%D1%81%D1%81%D0%BA%D0%B0%D0%B7%D1%8B%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["поезд", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%B5%D0%B7%D0%B4.ogg"], ["иногда", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%BD%D0%BE%D0%B3%D0%B4%D0%B0.ogg"], ["самолёт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B0%D0%BC%D0%BE%D0%BB%D1%91%D1%82.ogg"], ["метро", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D1%82%D1%80%D0%BE.ogg"], ["поле", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BB%D0%B5.ogg"], ["завод", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%B2%D0%BE%D0%B4.ogg"], ["наука", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%83%D0%BA%D0%B0.ogg"], ["собрание", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BE%D0%B1%D1%80%D0%B0%D0%BD%D0%B8%D0%B5.ogg"], ["писать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C.ogg"], ["можно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE.ogg"], ["чудо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D1%83%D0%B4%D0%BE.ogg"], ["поэт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%8D%D1%82.ogg"], ["учитель", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%87%D0%B8%D1%82%D0%B5%D0%BB%D1%8C.ogg"], ["ножницы", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%BE%D0%B6%D0%BD%D0%B8%D1%86%D1%8B.ogg"], ["всегда", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%81%D0%B5%D0%B3%D0%B4%D0%B0.ogg"], ["ресторан", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D1%81%D1%82%D0%BE%D1%80%D0%B0%D0%BD.ogg"], ["обычно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D1%8B%D1%87%D0%BD%D0%BE.ogg"], ["медведь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D0%B4%D0%B2%D0%B5%D0%B4%D1%8C.ogg"], ["работать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D1%82%D1%8C.ogg"], ["сосед", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BE%D1%81%D0%B5%D0%B4.ogg"], ["интересный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D0%BD%D1%8B%D0%B9.ogg"], ["семья", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%BC%D1%8C%D1%8F.ogg"], ["плечо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%B5%D1%87%D0%BE.ogg"], ["дело", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D0%BB%D0%BE.ogg"], ["лицо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B8%D1%86%D0%BE.ogg"], ["нельзя", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B5%D0%BB%D1%8C%D0%B7%D1%8F.ogg"], ["курить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D1%83%D1%80%D0%B8%D1%82%D1%8C.ogg"], ["помогать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BC%D0%BE%D0%B3%D0%B0%D1%82%D1%8C.ogg"], ["утро", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%82%D1%80%D0%BE.ogg"], ["завтра", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0.ogg"], ["вчера", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%87%D0%B5%D1%80%D0%B0.ogg"], ["почта", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%87%D1%82%D0%B0.ogg"], ["кончать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BD%D1%87%D0%B0%D1%82%D1%8C.ogg"], ["слушать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BB%D1%83%D1%88%D0%B0%D1%82%D1%8C.ogg"], ["организация", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%80%D0%B3%D0%B0%D0%BD%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F.ogg"], ["гостиница", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D1%81%D1%82%D0%B8%D0%BD%D0%B8%D1%86%D0%B0.ogg"], ["надо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D0%B4%D0%BE.ogg"], ["плод", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%BE%D0%B4.ogg"], ["орех", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%80%D0%B5%D1%85.ogg"], ["ошибка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%B0.ogg"], ["магазин", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D0%B3%D0%B0%D0%B7%D0%B8%D0%BD.ogg"], ["заяц", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D1%8F%D1%86.ogg"], ["нравиться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["седьмой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%B4%D1%8C%D0%BC%D0%BE%D0%B9.ogg"], ["шестой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%88%D0%B5%D1%81%D1%82%D0%BE%D0%B9.ogg"], ["четвёртый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D0%B5%D1%82%D0%B2%D1%91%D1%80%D1%82%D1%8B%D0%B9.ogg"], ["восьмой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D1%81%D1%8C%D0%BC%D0%BE%D0%B9.ogg"], ["девятый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D0%B2%D1%8F%D1%82%D1%8B%D0%B9.ogg"], ["десятый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D1%81%D1%8F%D1%82%D1%8B%D0%B9.ogg"], ["музей", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%83%D0%B7%D0%B5%D0%B9.ogg"], ["кино", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B8%D0%BD%D0%BE.ogg"], ["совет", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BE%D0%B2%D0%B5%D1%82.ogg"], ["идея", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%B4%D0%B5%D1%8F.ogg"], ["станция", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B0%D0%BD%D1%86%D0%B8%D1%8F.ogg"], ["кончаться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BD%D1%87%D0%B0%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["поздно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%B7%D0%B4%D0%BD%D0%BE.ogg"], ["ехать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B5%D1%85%D0%B0%D1%82%D1%8C.ogg"], ["снова", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BD%D0%BE%D0%B2%D0%B0.ogg"], ["вопрос", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81.ogg"], ["жизнь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B6%D0%B8%D0%B7%D0%BD%D1%8C.ogg"], ["экзамен", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8D%D0%BA%D0%B7%D0%B0%D0%BC%D0%B5%D0%BD.ogg"], ["понимать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BD%D0%B8%D0%BC%D0%B0%D1%82%D1%8C.ogg"], ["очки", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%87%D0%BA%D0%B8.ogg"], ["литература", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B0.ogg"], ["конечно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BD%D0%B5%D1%87%D0%BD%D0%BE.ogg"], ["давно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B0%D0%B2%D0%BD%D0%BE.ogg"], ["мало", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D0%BB%D0%BE.ogg"], ["анна", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%90%D0%BD%D0%BD%D0%B0.ogg"], ["гражданин", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D1%80%D0%B0%D0%B6%D0%B4%D0%B0%D0%BD%D0%B8%D0%BD.ogg"], ["старый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B0%D1%80%D1%8B%D0%B9.ogg"], ["машина", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D0%B0.ogg"], ["дача", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B0%D1%87%D0%B0.ogg"], ["ключ", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BB%D1%8E%D1%87.ogg"], ["стул", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D1%83%D0%BB.ogg"], ["трамвай", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%80%D0%B0%D0%BC%D0%B2%D0%B0%D0%B9.ogg"], ["ложка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0.ogg"], ["помнить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BC%D0%BD%D0%B8%D1%82%D1%8C.ogg"], ["далеко", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B0%D0%BB%D0%B5%D0%BA%D0%BE.ogg"], ["никогда", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B8%D0%BA%D0%BE%D0%B3%D0%B4%D0%B0.ogg"], ["мысль", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%8B%D1%81%D0%BB%D1%8C.ogg"], ["праздник", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B0%D0%B7%D0%B4%D0%BD%D0%B8%D0%BA.ogg"], ["ответ", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%82%D0%B2%D0%B5%D1%82.ogg"], ["рубашка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D1%83%D0%B1%D0%B0%D1%88%D0%BA%D0%B0.ogg"], ["главный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D1%8B%D0%B9.ogg"], ["кафе", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B0%D1%84%D0%B5.ogg"], ["закон", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD.ogg"], ["общежитие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D1%89%D0%B5%D0%B6%D0%B8%D1%82%D0%B8%D0%B5.ogg"], ["редко", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D0%B4%D0%BA%D0%BE.ogg"], ["звать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["фрукт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D1%80%D1%83%D0%BA%D1%82.ogg"], ["завтракать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA%D0%B0%D1%82%D1%8C.ogg"], ["учёный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%87%D1%91%D0%BD%D1%8B%D0%B9.ogg"], ["тёплый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%91%D0%BF%D0%BB%D1%8B%D0%B9.ogg"], ["добрый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D0%B1%D1%80%D1%8B%D0%B9.ogg"], ["холодный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D0%BE%D0%BB%D0%BE%D0%B4%D0%BD%D1%8B%D0%B9.ogg"], ["петь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B5%D1%82%D1%8C.ogg"], ["опера", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%BF%D0%B5%D1%80%D0%B0.ogg"], ["мастер", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B0%D1%81%D1%82%D0%B5%D1%80.ogg"], ["радио", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B0%D0%B4%D0%B8%D0%BE.ogg"], ["центр", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%86%D0%B5%D0%BD%D1%82%D1%80.ogg"], ["статья", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F.ogg"], ["полотенце", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BB%D0%BE%D1%82%D0%B5%D0%BD%D1%86%D0%B5.ogg"], ["задача", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0.ogg"], ["фабрика", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D0%B0%D0%B1%D1%80%D0%B8%D0%BA%D0%B0.ogg"], ["вождь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D0%B6%D0%B4%D1%8C.ogg"], ["слеза", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BB%D0%B5%D0%B7%D0%B0.ogg"], ["отвечать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%82%D0%B2%D0%B5%D1%87%D0%B0%D1%82%D1%8C.ogg"], ["тоже", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%BE%D0%B6%D0%B5.ogg"], ["стакан", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B0%D0%BA%D0%B0%D0%BD.ogg"], ["художник", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D1%83%D0%B4%D0%BE%D0%B6%D0%BD%D0%B8%D0%BA.ogg"], ["плохо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%BE%D1%85%D0%BE.ogg"], ["небо", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B5%D0%B1%D0%BE.ogg"], ["сестра", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D1%81%D1%82%D1%80%D0%B0.ogg"], ["корень", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D1%8C.ogg"], ["стоять", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%BE%D1%8F%D1%82%D1%8C.ogg"], ["отдыхать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%82%D0%B4%D1%8B%D1%85%D0%B0%D1%82%D1%8C.ogg"], ["дорогой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D1%80%D0%BE%D0%B3%D0%BE%D0%B9.ogg"], ["здание", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5.ogg"], ["здоровье", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5.ogg"], ["зеркало", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B5%D1%80%D0%BA%D0%B0%D0%BB%D0%BE.ogg"], ["лекарство", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B5%D0%BA%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%BE.ogg"], ["музыка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%83%D0%B7%D1%8B%D0%BA%D0%B0.ogg"], ["налог", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D0%BB%D0%BE%D0%B3.ogg"], ["растение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B0%D1%81%D1%82%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["поколение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BA%D0%BE%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["решение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["горячий", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D1%80%D1%8F%D1%87%D0%B8%D0%B9.ogg"], ["жаркий", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B6%D0%B0%D1%80%D0%BA%D0%B8%D0%B9.ogg"], ["цветы", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%86%D0%B2%D0%B5%D1%82%D1%8B.ogg"], ["трудный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%80%D1%83%D0%B4%D0%BD%D1%8B%D0%B9.ogg"], ["возможность", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D0%B7%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C.ogg"], ["конфета", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BD%D1%84%D0%B5%D1%82%D0%B0.ogg"], ["помощь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C.ogg"], ["произведение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["овощ", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B2%D0%BE%D1%89.ogg"], ["выставка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%8B%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B0.ogg"], ["свободный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%BD%D1%8B%D0%B9.ogg"], ["закрывать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%BA%D1%80%D1%8B%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["смотреть", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BC%D0%BE%D1%82%D1%80%D0%B5%D1%82%D1%8C.ogg"], ["предложение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["ценность", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%86%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D1%8C.ogg"], ["подарок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D0%BE%D0%BA.ogg"], ["свойство", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B2%D0%BE%D0%B9%D1%81%D1%82%D0%B2%D0%BE.ogg"], ["рынок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D1%8B%D0%BD%D0%BE%D0%BA.ogg"], ["доход", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D1%85%D0%BE%D0%B4.ogg"], ["инженер", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%BD%D0%B6%D0%B5%D0%BD%D0%B5%D1%80.ogg"], ["котёнок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D1%82%D1%91%D0%BD%D0%BE%D0%BA.ogg"], ["чувство", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D1%83%D0%B2%D1%81%D1%82%D0%B2%D0%BE.ogg"], ["товар", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%BE%D0%B2%D0%B0%D1%80.ogg"], ["нужный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D1%83%D0%B6%D0%BD%D1%8B%D0%B9.ogg"], ["счастливый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%87%D0%B0%D1%81%D1%82%D0%BB%D0%B8%D0%B2%D1%8B%D0%B9.ogg"], ["клетка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BB%D0%B5%D1%82%D0%BA%D0%B0.ogg"], ["способность", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BF%D0%BE%D1%81%D0%BE%D0%B1%D0%BD%D0%BE%D1%81%D1%82%D1%8C.ogg"], ["музыкант", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%83%D0%B7%D1%8B%D0%BA%D0%B0%D0%BD%D1%82.ogg"], ["столица", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%BE%D0%BB%D0%B8%D1%86%D0%B0.ogg"], ["звонок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B2%D0%BE%D0%BD%D0%BE%D0%BA.ogg"], ["костюм", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D1%81%D1%82%D1%8E%D0%BC.ogg"], ["событие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BE%D0%B1%D1%8B%D1%82%D0%B8%D0%B5.ogg"], ["медленный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D0%B4%D0%BB%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9.ogg"], ["думать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D1%83%D0%BC%D0%B0%D1%82%D1%8C.ogg"], ["партия", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D1%8F.ogg"], ["занятие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D0%B8%D0%B5.ogg"], ["искать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D1%81%D0%BA%D0%B0%D1%82%D1%8C.ogg"], ["сигарета", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B8%D0%B3%D0%B0%D1%80%D0%B5%D1%82%D0%B0.ogg"], ["фамилия", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D0%B0%D0%BC%D0%B8%D0%BB%D0%B8%D1%8F.ogg"], ["проблема", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%BE%D0%B1%D0%BB%D0%B5%D0%BC%D0%B0.ogg"], ["ферма", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D0%B5%D1%80%D0%BC%D0%B0.ogg"], ["исследование", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D1%81%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5.ogg"], ["стебель", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B5%D0%B1%D0%B5%D0%BB%D1%8C.ogg"], ["почва", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%87%D0%B2%D0%B0.ogg"], ["строить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D1%80%D0%BE%D0%B8%D1%82%D1%8C.ogg"], ["подруга", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%B4%D1%80%D1%83%D0%B3%D0%B0.ogg"], ["ягода", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8F%D0%B3%D0%BE%D0%B4%D0%B0.ogg"], ["коллега", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BB%D0%BB%D0%B5%D0%B3%D0%B0.ogg"], ["стадион", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B0%D0%B4%D0%B8%D0%BE%D0%BD.ogg"], ["опыт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%BF%D1%8B%D1%82.ogg"], ["домашний", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D0%BC%D0%B0%D1%88%D0%BD%D0%B8%D0%B9.ogg"], ["тарелка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B0%D1%80%D0%B5%D0%BB%D0%BA%D0%B0.ogg"], ["изучать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%B7%D1%83%D1%87%D0%B0%D1%82%D1%8C.ogg"], ["готовить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%B8%D1%82%D1%8C.ogg"], ["семинар", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%B5%D0%BC%D0%B8%D0%BD%D0%B0%D1%80.ogg"], ["плащ", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%B0%D1%89.ogg"], ["портфель", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%80%D1%82%D1%84%D0%B5%D0%BB%D1%8C.ogg"], ["лекция", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B5%D0%BA%D1%86%D0%B8%D1%8F.ogg"], ["лежать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B5%D0%B6%D0%B0%D1%82%D1%8C.ogg"], ["покупать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BA%D1%83%D0%BF%D0%B0%D1%82%D1%8C.ogg"], ["ждать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B6%D0%B4%D0%B0%D1%82%D1%8C.ogg"], ["парк", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B0%D1%80%D0%BA.ogg"], ["приглашать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B8%D0%B3%D0%BB%D0%B0%D1%88%D0%B0%D1%82%D1%8C.ogg"], ["плакать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%B0%D0%BA%D0%B0%D1%82%D1%8C.ogg"], ["концерт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D0%BD%D1%86%D0%B5%D1%80%D1%82.ogg"], ["звонить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B2%D0%BE%D0%BD%D0%B8%D1%82%D1%8C.ogg"], ["спрашивать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BF%D1%80%D0%B0%D1%88%D0%B8%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["заниматься", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["чашка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D0%B0%D1%88%D0%BA%D0%B0.ogg"], ["пример", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80.ogg"], ["смеяться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BC%D0%B5%D1%8F%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["слышать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BB%D1%8B%D1%88%D0%B0%D1%82%D1%8C.ogg"], ["встречать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%81%D1%82%D1%80%D0%B5%D1%87%D0%B0%D1%82%D1%8C.ogg"], ["умный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%BC%D0%BD%D1%8B%D0%B9.ogg"], ["квартира", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80%D0%B0.ogg"], ["хозяин", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%85%D0%BE%D0%B7%D1%8F%D0%B8%D0%BD.ogg"], ["начальник", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%87%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA.ogg"], ["писатель", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D0%B5%D0%BB%D1%8C.ogg"], ["судьба", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%83%D0%B4%D1%8C%D0%B1%D0%B0.ogg"], ["открытка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%82%D0%BA%D1%80%D1%8B%D1%82%D0%BA%D0%B0.ogg"], ["учебник", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%87%D0%B5%D0%B1%D0%BD%D0%B8%D0%BA.ogg"], ["чужой", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%87%D1%83%D0%B6%D0%BE%D0%B9.ogg"], ["институт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%BD%D1%81%D1%82%D0%B8%D1%82%D1%83%D1%82.ogg"], ["платок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%B0%D1%82%D0%BE%D0%BA.ogg"], ["зарплата", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D1%80%D0%BF%D0%BB%D0%B0%D1%82%D0%B0.ogg"], ["предприятие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B5%D0%B4%D0%BF%D1%80%D0%B8%D1%8F%D1%82%D0%B8%D0%B5.ogg"], ["результат", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D0%B7%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%82.ogg"], ["рисунок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA.ogg"], ["спортсмен", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BF%D0%BE%D1%80%D1%82%D1%81%D0%BC%D0%B5%D0%BD.ogg"], ["условие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D0%B5.ogg"], ["лёгкий", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D1%91%D0%B3%D0%BA%D0%B8%D0%B9.ogg"], ["наверное", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D0%B2%D0%B5%D1%80%D0%BD%D0%BE%D0%B5.ogg"], ["образец", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86.ogg"], ["тетрадь", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B5%D1%82%D1%80%D0%B0%D0%B4%D1%8C.ogg"], ["правительство", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D1%82%D0%B2%D0%BE.ogg"], ["старший", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D0%B0%D1%80%D1%88%D0%B8%D0%B9.ogg"], ["рисовать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B8%D1%81%D0%BE%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["паспорт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B0%D1%81%D0%BF%D0%BE%D1%80%D1%82.ogg"], ["уши", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%88%D0%B8.ogg"], ["потолок", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D1%82%D0%BE%D0%BB%D0%BE%D0%BA.ogg"], ["путешествие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%83%D1%82%D0%B5%D1%88%D0%B5%D1%81%D1%82%D0%B2%D0%B8%D0%B5.ogg"], ["турист", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%83%D1%80%D0%B8%D1%81%D1%82.ogg"], ["фирма", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D0%B8%D1%80%D0%BC%D0%B0.ogg"], ["диван", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B8%D0%B2%D0%B0%D0%BD.ogg"], ["медленно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%B5%D0%B4%D0%BB%D0%B5%D0%BD%D0%BD%D0%BE.ogg"], ["недавно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B5%D0%B4%D0%B0%D0%B2%D0%BD%D0%BE.ogg"], ["нужно", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D1%83%D0%B6%D0%BD%D0%BE.ogg"], ["вставать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%81%D1%82%D0%B0%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["вывод", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D1%8B%D0%B2%D0%BE%D0%B4.ogg"], ["занятый", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D1%8B%D0%B9.ogg"], ["одеваться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B4%D0%B5%D0%B2%D0%B0%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["кошелёк", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%BE%D1%88%D0%B5%D0%BB%D1%91%D0%BA.ogg"], ["лаборатория", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B0%D0%B1%D0%BE%D1%80%D0%B0%D1%82%D0%BE%D1%80%D0%B8%D1%8F.ogg"], ["достижение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D1%81%D1%82%D0%B8%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["торт", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%BE%D1%80%D1%82.ogg"], ["требование", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D1%80%D0%B5%D0%B1%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5.ogg"], ["грустный", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D1%80%D1%83%D1%81%D1%82%D0%BD%D1%8B%D0%B9.ogg"], ["иностранец", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%BD%D0%BE%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B5%D1%86.ogg"], ["офис", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%84%D0%B8%D1%81.ogg"], ["преподаватель", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%B0%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C.ogg"], ["игрушка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B8%D0%B3%D1%80%D1%83%D1%88%D0%BA%D0%B0.ogg"], ["надеяться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D0%B4%D0%B5%D1%8F%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["факультет", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D0%B0%D0%BA%D1%83%D0%BB%D1%8C%D1%82%D0%B5%D1%82.ogg"], ["джинсы", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B6%D0%B8%D0%BD%D1%81%D1%8B.ogg"], ["кинотеатр", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B8%D0%BD%D0%BE%D1%82%D0%B5%D0%B0%D1%82%D1%80.ogg"], ["разница", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B0%D0%B7%D0%BD%D0%B8%D1%86%D0%B0.ogg"], ["лечить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B5%D1%87%D0%B8%D1%82%D1%8C.ogg"], ["танцевать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%82%D0%B0%D0%BD%D1%86%D0%B5%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["урожай", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D1%80%D0%BE%D0%B6%D0%B0%D0%B9.ogg"], ["объявление", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D1%8A%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["советовать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BE%D0%B2%D0%B5%D1%82%D0%BE%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["объяснять", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D0%B1%D1%8A%D1%8F%D1%81%D0%BD%D1%8F%D1%82%D1%8C.ogg"], ["повторять", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%B2%D1%82%D0%BE%D1%80%D1%8F%D1%82%D1%8C.ogg"], ["возвращаться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B2%D0%BE%D0%B7%D0%B2%D1%80%D0%B0%D1%89%D0%B0%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["памятник", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%B0%D0%BC%D1%8F%D1%82%D0%BD%D0%B8%D0%BA.ogg"], ["лишний", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BB%D0%B8%D1%88%D0%BD%D0%B8%D0%B9.ogg"], ["мяч", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D1%8F%D1%87.ogg"], ["значение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["начинаться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%87%D0%B8%D0%BD%D0%B0%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["студентка", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D1%82%D1%83%D0%B4%D0%B5%D0%BD%D1%82%D0%BA%D0%B0.ogg"], ["начинать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%B0%D1%87%D0%B8%D0%BD%D0%B0%D1%82%D1%8C.ogg"], ["гулять", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D1%83%D0%BB%D1%8F%D1%82%D1%8C.ogg"], ["забывать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D0%B1%D1%8B%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["улыбаться", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%BB%D1%8B%D0%B1%D0%B0%D1%82%D1%8C%D1%81%D1%8F.ogg"], ["узнавать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%B7%D0%BD%D0%B0%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["младший", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BC%D0%BB%D0%B0%D0%B4%D1%88%D0%B8%D0%B9.ogg"], ["явление", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["продавец", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B2%D0%B5%D1%86.ogg"], ["упражнение", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%BF%D1%80%D0%B0%D0%B6%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["просить", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%BE%D1%81%D0%B8%D1%82%D1%8C.ogg"], ["ужинать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%B6%D0%B8%D0%BD%D0%B0%D1%82%D1%8C.ogg"], ["решать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D0%B5%D1%88%D0%B0%D1%82%D1%8C.ogg"], ["фотографировать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C.ogg"], ["организм", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BE%D1%80%D0%B3%D0%B0%D0%BD%D0%B8%D0%B7%D0%BC.ogg"], ["понятие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BE%D0%BD%D1%8F%D1%82%D0%B8%D0%B5.ogg"], ["признак", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%80%D0%B8%D0%B7%D0%BD%D0%B0%D0%BA.ogg"], ["заявление", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B0%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5.ogg"], ["новость", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C.ogg"], ["доказательство", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D1%82%D0%B2%D0%BE.ogg"], ["спектакль", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%81%D0%BF%D0%B5%D0%BA%D1%82%D0%B0%D0%BA%D0%BB%D1%8C.ogg"], ["экскурсия", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%8D%D0%BA%D1%81%D0%BA%D1%83%D1%80%D1%81%D0%B8%D1%8F.ogg"], ["горожанин", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B3%D0%BE%D1%80%D0%BE%D0%B6%D0%B0%D0%BD%D0%B8%D0%BD.ogg"], ["убирать", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%83%D0%B1%D0%B8%D1%80%D0%B0%D1%82%D1%8C.ogg"], ["другие", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D1%80%D1%83%D0%B3%D0%B8%D0%B5.ogg"], ["птицы", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D1%82%D0%B8%D1%86%D1%8B.ogg"], ["рыбы", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D1%80%D1%8B%D0%B1%D1%8B.ogg"], ["плоды", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BF%D0%BB%D0%BE%D0%B4%D1%8B.ogg"], ["карандаши", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%BA%D0%B0%D1%80%D0%B0%D0%BD%D0%B4%D0%B0%D1%88%D0%B8.ogg"], ["деревня", "위키미디어 공용", "라이선스는 원본 페이지 참조", "https://commons.wikimedia.org/wiki/File:Ru-%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BD%D1%8F.ogg"]];
const llKey = t => String(t).replace(/\u0301/g,"").toLowerCase();
/* 강세 표기 키를 먼저 찾아요 (до́ма / дома́처럼 강세가 다른 같은 철자 구분) */
const findIn = (P, t) => { const s = String(t).normalize("NFC").toLowerCase(); return P[s] ? s : (P[llKey(t)] ? llKey(t) : null); };
let VOICE = "native";   /* "native": 원어민 녹음 먼저 · "tts": 음성 합성 먼저 (없으면 서로 대신해요) */
let TTS_G = "f";        /* 음성 합성 목소리: "f" 여성 baya · "m" 남성 eugene */
function pickAudio(t){
  const P = TTS_G==="m" && Object.keys(TTS_AUDIO_M).length ? TTS_AUDIO_M : TTS_AUDIO;
  const n = findIn(LL_AUDIO, t), s = findIn(P, t);
  const nat = n ? { kind:"native", key:"n:" + n, src:LL_AUDIO[n] } : null, syn = s ? { kind:"tts", key:"t" + TTS_G + ":" + s, src:P[s] } : null;
  return VOICE==="tts" ? (syn || nat) : (nat || syn);
}
const hasLL = t => !!pickAudio(t);
let llPlayer = null;
function speakBtn(t, label){
  const a = pickAudio(t);
  if(!a && !sp()) return "";
  const kind = a ? a.kind : "device", desc = { native:"원어민 녹음", tts:"음성 합성", device:"기기 음성" }[kind];
  return `<button class="speak${kind==="native" ? " native" : kind==="tts" ? " synth" : ""}" data-act="speak" data-v="${t}" aria-label="${label} (${desc})" title="${desc}">${IC.speaker}</button>`;
}
const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
let ruVoice = null;
const sp = () => canSpeak && !!ruVoice;
function pickVoice(){
  if(!canSpeak) return;
  try{
    const vs = speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang));
    const v = vs.find(v => /google/i.test(v.name)) || vs.find(v => /natural|neural|online/i.test(v.name)) || vs[0] || null;
    const changed = (v && v.name) !== (ruVoice && ruVoice.name);
    ruVoice = v;
    if(changed && typeof app !== "undefined" && app.innerHTML){ if(!G) renderSetup(); else if(!G.done) renderQ(); }
  }catch(e){}
}
function ttsSpeak(t){
  if(!sp()) return false;
  try{
    if(speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.voice = ruVoice; u.lang = ruVoice.lang; u.rate = 0.85;
    speechSynthesis.speak(u); return true;
  }catch(e){ return false; }
}
/* 녹음 재생: blob URL <audio> → Web Audio → 기기 음성 순서로 시도 (iOS·내장 브라우저 대비) */
let AC = null;
const AUD_URL = {}, AUD_BUF = {};
function audBytes(src){ const bin = atob(src.slice(src.indexOf(",")+1)); const u = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u; }
function audUrl(key, src){
  if(!AUD_URL[key]){ try{ AUD_URL[key] = URL.createObjectURL(new Blob([audBytes(src)], {type:"audio/mpeg"})); }catch(e){ AUD_URL[key] = src; } }
  return AUD_URL[key];
}
function acWake(){
  try{ const C = window.AudioContext || window.webkitAudioContext; if(!C) return null; if(!AC) AC = new C(); if(AC.state==="suspended") AC.resume(); return AC; }catch(e){ return null; }
}
async function playWA(key, src){
  const ac = acWake(); if(!ac) throw new Error("no webaudio");
  if(!AUD_BUF[key]) AUD_BUF[key] = await new Promise((res, rej) => ac.decodeAudioData(audBytes(src).buffer, res, rej));
  const s = ac.createBufferSource(); s.buffer = AUD_BUF[key]; s.connect(ac.destination); s.start(0);
}
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);

let iosHinted = false;
function toast(msg){
  let el = document.getElementById("toast");
  if(!el){ el = document.createElement("div"); el.id = "toast"; el.setAttribute("role","status"); document.body.appendChild(el); }
  el.textContent = msg; el.className = "show";
  clearTimeout(toast.t); toast.t = setTimeout(() => { el.className = ""; }, 4200);
}
function speak(t){
  if(IS_IOS && !iosHinted){ iosHinted = true; toast("소리가 안 들리면 무음 모드를 끄고 볼륨을 올려 보세요."); }
  const A = pickAudio(t), key = A ? A.key : llKey(t), src = A ? A.src : null;
  try{ if(canSpeak && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel(); }catch(e){}
  try{ if(llPlayer) llPlayer.pause(); }catch(e){}
  if(!src){ if(!ttsSpeak(t)) toast("이 기기에는 러시아어 음성이 없어서 읽어 줄 수 없어요."); return; }
  acWake();   /* 탭한 순간에 오디오를 깨워 둬야 iOS가 막지 않아요 */
  let done = false;
  const fallback = () => {
    if(done) return; done = true;
    playWA(key, src).catch(() => { if(!ttsSpeak(t)) toast("소리를 재생하지 못했어요."); });
  };
  try{
    const a = new Audio(); a.preload = "auto"; a.src = audUrl(key, src);
    a.onerror = fallback; llPlayer = a;
    const p = a.play();
    if(p && p.then) p.then(() => { done = true; }).catch(fallback);
  }catch(e){ fallback(); }
}

function extLinks(form){
  const e = encodeURIComponent(form), w = encodeURIComponent(String(form).replace(/\u0301/g,""));
  return `<a href="https://dict.naver.com/rukodict/russian/#/search?query=${e}" target="_blank" rel="noopener">네이버 사전</a><a href="https://ru.wiktionary.org/wiki/${w}" target="_blank" rel="noopener">위키낱말사전</a><a href="https://forvo.com/word/${e}/#ru" target="_blank" rel="noopener">Forvo</a><a href="https://translate.google.com/?sl=ru&tl=ko&text=${e}&op=translate" target="_blank" rel="noopener">구글 번역</a>`;
}

function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function highlight(w){
  let i=0; while(i<w.ru.length && i<w.pl.length && w.ru[i]===w.pl[i]) i++;
  const t = w.plS.match(/.\u0301?/gu);
  if(i===0) return `<mark>${w.plS}</mark>`;
  return t.slice(0,i).join("") + (i<t.length ? `<mark>${t.slice(i).join("")}</mark>` : "");
}
/* 주관식 채점: 띄어쓰기·문장부호 무시, 여러 뜻 중 하나만 맞아도 정답, 끝에 붙은 '들/이에요/예요/입니다/이다/다'는 떼고 비교 */
const clean = s => s.replace(/[\s.,!?~()'"·]/g,"").toLowerCase();
function variants(ko){
  const out = new Set(), BL = ["동물","신체","여자","생체","어디에서","무엇을"];
  ko.split(",").forEach(part => {
    part = part.trim();
    const main = part.replace(/\([^)]*\)/g,"").replace(/~/g,"");
    out.add(clean(main));
    out.add(clean(part));
    [...part.matchAll(/\(([^)]*)\)/g)].forEach(m => {
      const p = m[1].trim();
      if(/^[가-힣\s]+$/.test(p) && p.length>=2 && !BL.includes(p)) out.add(clean(p));
    });
  });
  out.delete("");
  return out;
}
function checkText(input, ko){
  const x = clean(input); if(!x) return false;
  const v = variants(ko); if(v.has(x)) return true;
  for(const suf of ["이에요","예요","입니다","이다","들","다"]) if(x.endsWith(suf) && v.has(x.slice(0,-suf.length))) return true;
  if(v.has(x+"다")) return true;
  if(x.endsWith("해요") && v.has(x.slice(0,-2)+"하다")) return true;
  return false;
}

/* ================= 공통 데이터 ================= */
const V3 = {"langs": [{"adj": "ру́сский", "adv": "по-ру́сски", "advP": "по-русски", "ko": "러시아어", "wrong": ["русский", "по-русский", "русски"]}, {"adj": "коре́йский", "adv": "по-коре́йски", "advP": "по-корейски", "ko": "한국어", "wrong": ["корейский", "по-корейский", "корейски"]}, {"adj": "англи́йский", "adv": "по-англи́йски", "advP": "по-английски", "ko": "영어", "wrong": ["английский", "по-английский", "английски"]}, {"adj": "кита́йский", "adv": "по-кита́йски", "advP": "по-китайски", "ko": "중국어", "wrong": ["китайский", "по-китайский", "китайски"]}, {"adj": "не́мецкий", "adv": "по-не́мецки", "advP": "по-немецки", "ko": "독일어", "wrong": ["немецкий", "по-немецкий", "немецки"]}, {"adj": "францу́зский", "adv": "по-францу́зски", "advP": "по-французски", "ko": "프랑스어", "wrong": ["французский", "по-французский", "французски"]}, {"adj": "япо́нский", "adv": "по-япо́нски", "advP": "по-японски", "ko": "일본어", "wrong": ["японский", "по-японский", "японски"]}, {"adj": "испа́нский", "adv": "по-испа́нски", "advP": "по-испански", "ko": "스페인어", "wrong": ["испанский", "по-испанский", "испански"]}], "verbs": [{"lt": "{L}로 읽어요", "endnote": "", "inf": "чита́ть", "infP": "читать", "ko": "읽다", "type": "c1", "forms": ["чита́ю", "чита́ешь", "чита́ет", "чита́ем", "чита́ете", "чита́ют"], "formsP": ["читаю", "читаешь", "читает", "читаем", "читаете", "читают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 읽어요", "objs": ["книга", "газета", "журнал", "письмо", "учебник", "стихотворение"]}, {"lt": "", "endnote": "", "inf": "знать", "infP": "знать", "ko": "알다", "type": "c1", "forms": ["зна́ю", "зна́ешь", "зна́ет", "зна́ем", "зна́ете", "зна́ют"], "formsP": ["знаю", "знаешь", "знает", "знаем", "знаете", "знают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 알아요", "objs": ["Анна", "Антон", "брат", "сестра", "учитель", "сосед", "адрес", "русский_язык", "английский_язык", "*"]}, {"lt": "{L}를 알아들어요", "endnote": "", "inf": "понима́ть", "infP": "понимать", "ko": "이해하다", "type": "c1", "forms": ["понима́ю", "понима́ешь", "понима́ет", "понима́ем", "понима́ете", "понима́ют"], "formsP": ["понимаю", "понимаешь", "понимает", "понимаем", "понимаете", "понимают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 이해해요", "objs": ["вопрос", "учитель", "преподаватель", "слово", "*"]}, {"lt": "", "endnote": "", "inf": "де́лать", "infP": "делать", "ko": "하다, 만들다", "type": "c1", "forms": ["де́лаю", "де́лаешь", "де́лает", "де́лаем", "де́лаете", "де́лают"], "formsP": ["делаю", "делаешь", "делает", "делаем", "делаете", "делают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 해요", "objs": ["упражнение", "задание", "работа"]}, {"lt": "", "endnote": "", "inf": "рабо́тать", "infP": "работать", "ko": "일하다", "type": "c1", "forms": ["рабо́таю", "рабо́таешь", "рабо́тает", "рабо́таем", "рабо́таете", "рабо́тают"], "formsP": ["работаю", "работаешь", "работает", "работаем", "работаете", "работают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "отвеча́ть", "infP": "отвечать", "ko": "대답하다", "type": "c1", "forms": ["отвеча́ю", "отвеча́ешь", "отвеча́ет", "отвеча́ем", "отвеча́ете", "отвеча́ют"], "formsP": ["отвечаю", "отвечаешь", "отвечает", "отвечаем", "отвечаете", "отвечают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "спра́шивать", "infP": "спрашивать", "ko": "묻다", "type": "c1", "forms": ["спра́шиваю", "спра́шиваешь", "спра́шивает", "спра́шиваем", "спра́шиваете", "спра́шивают"], "formsP": ["спрашиваю", "спрашиваешь", "спрашивает", "спрашиваем", "спрашиваете", "спрашивают"], "note": "", "lvl": "beginner", "tr": "{o}에게 물어봐요", "objs": ["учитель", "мама", "папа", "друг", "сосед", "профессор", "*"]}, {"lt": "", "endnote": "", "inf": "слу́шать", "infP": "слушать", "ko": "듣다", "type": "c1", "forms": ["слу́шаю", "слу́шаешь", "слу́шает", "слу́шаем", "слу́шаете", "слу́шают"], "formsP": ["слушаю", "слушаешь", "слушает", "слушаем", "слушаете", "слушают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 들어요", "objs": ["музыка", "песня", "лекция", "концерт"]}, {"lt": "", "endnote": "", "inf": "ду́мать", "infP": "думать", "ko": "생각하다", "type": "c1", "forms": ["ду́маю", "ду́маешь", "ду́мает", "ду́маем", "ду́маете", "ду́мают"], "formsP": ["думаю", "думаешь", "думает", "думаем", "думаете", "думают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "игра́ть", "infP": "играть", "ko": "놀다, (경기·게임을) 하다", "type": "c1", "forms": ["игра́ю", "игра́ешь", "игра́ет", "игра́ем", "игра́ете", "игра́ют"], "formsP": ["играю", "играешь", "играет", "играем", "играете", "играют"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "гуля́ть", "infP": "гулять", "ko": "산책하다", "type": "c1", "forms": ["гуля́ю", "гуля́ешь", "гуля́ет", "гуля́ем", "гуля́ете", "гуля́ют"], "formsP": ["гуляю", "гуляешь", "гуляет", "гуляем", "гуляете", "гуляют"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "отдыха́ть", "infP": "отдыхать", "ko": "쉬다", "type": "c1", "forms": ["отдыха́ю", "отдыха́ешь", "отдыха́ет", "отдыха́ем", "отдыха́ете", "отдыха́ют"], "formsP": ["отдыхаю", "отдыхаешь", "отдыхает", "отдыхаем", "отдыхаете", "отдыхают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "за́втракать", "infP": "завтракать", "ko": "아침 먹다", "type": "c1", "forms": ["за́втракаю", "за́втракаешь", "за́втракает", "за́втракаем", "за́втракаете", "за́втракают"], "formsP": ["завтракаю", "завтракаешь", "завтракает", "завтракаем", "завтракаете", "завтракают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "обе́дать", "infP": "обедать", "ko": "점심 먹다", "type": "c1", "forms": ["обе́даю", "обе́даешь", "обе́дает", "обе́даем", "обе́даете", "обе́дают"], "formsP": ["обедаю", "обедаешь", "обедает", "обедаем", "обедаете", "обедают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "у́жинать", "infP": "ужинать", "ko": "저녁 먹다", "type": "c1", "forms": ["у́жинаю", "у́жинаешь", "у́жинает", "у́жинаем", "у́жинаете", "у́жинают"], "formsP": ["ужинаю", "ужинаешь", "ужинает", "ужинаем", "ужинаете", "ужинают"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "изуча́ть", "infP": "изучать", "ko": "(무엇을) 공부하다, 연구하다", "type": "c1", "forms": ["изуча́ю", "изуча́ешь", "изуча́ет", "изуча́ем", "изуча́ете", "изуча́ют"], "formsP": ["изучаю", "изучаешь", "изучает", "изучаем", "изучаете", "изучают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 공부해요", "objs": ["русский_язык", "корейский_язык", "английский_язык", "история", "грамматика", "биология", "музыка", "литература"]}, {"lt": "", "endnote": "", "inf": "повторя́ть", "infP": "повторять", "ko": "반복하다, 복습하다", "type": "c1", "forms": ["повторя́ю", "повторя́ешь", "повторя́ет", "повторя́ем", "повторя́ете", "повторя́ют"], "formsP": ["повторяю", "повторяешь", "повторяет", "повторяем", "повторяете", "повторяют"], "note": "", "lvl": "beginner", "tr": "{o}{을} 복습해요", "objs": ["слово", "упражнение", "урок"]}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요) 어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "жить", "infP": "жить", "ko": "살다", "type": "irr", "forms": ["живу́", "живёшь", "живёт", "живём", "живёте", "живу́т"], "formsP": ["живу", "живёшь", "живёт", "живём", "живёте", "живут"], "note": "어간에 -в-가 들어가고, 강세가 어미에 와요. (живу́, живёшь)", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요) 어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "звать", "infP": "звать", "ko": "부르다", "type": "irr", "forms": ["зову́", "зовёшь", "зовёт", "зовём", "зовёте", "зову́т"], "formsP": ["зову", "зовёшь", "зовёт", "зовём", "зовёте", "зовут"], "note": "어간이 зов-로 바뀌어요. «Как вас зову́т?»의 зову́т가 они 형태예요.", "lvl": "beginner", "tr": "{o}{을} 불러요", "objs": ["брат", "сестра", "мама", "папа", "сын", "дочь", "дедушка", "*"]}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (учу́сь, у́чится)", "inf": "учи́ться", "infP": "учиться", "ko": "(어디에서) 배우다, 다니다", "type": "c2s", "forms": ["учу́сь", "у́чишься", "у́чится", "у́чимся", "у́читесь", "у́чатся"], "formsP": ["учусь", "учишься", "учится", "учимся", "учитесь", "учатся"], "note": "ч 뒤라서 я는 -у́сь, они는 -атся가 돼요. 강세는 я만 끝에 오고 나머지는 앞(у́-)에 와요. ‘어디에서 배우는지’(в шко́ле, в университе́те)를 말할 때 써요.", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "{L}로 말해요", "endnote": "", "inf": "говори́ть", "infP": "говорить", "ko": "말하다", "type": "c2", "forms": ["говорю́", "говори́шь", "говори́т", "говори́м", "говори́те", "говоря́т"], "formsP": ["говорю", "говоришь", "говорит", "говорим", "говорите", "говорят"], "note": "", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "есть", "infP": "есть", "ko": "먹다", "type": "irr", "forms": ["ем", "ешь", "ест", "еди́м", "еди́те", "едя́т"], "formsP": ["ем", "ешь", "ест", "едим", "едите", "едят"], "note": "완전히 불규칙한 동사예요. 통째로 외워 두세요.", "lvl": "beginner", "tr": "{o}{을} 먹어요", "objs": ["суп", "рыба", "торт", "конфета", "яблоко"]}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요)", "inf": "пить", "infP": "пить", "ko": "마시다", "type": "irr", "forms": ["пью", "пьёшь", "пьёт", "пьём", "пьёте", "пьют"], "formsP": ["пью", "пьёшь", "пьёт", "пьём", "пьёте", "пьют"], "note": "и가 빠지고 ь가 들어가요. (пью, пьёшь)", "lvl": "beginner", "tr": "{o}{을} 마셔요", "objs": ["сок", "чай", "вода", "молоко"]}, {"lt": "", "endnote": "", "inf": "звони́ть", "infP": "звонить", "ko": "전화하다", "type": "c2", "forms": ["звоню́", "звони́шь", "звони́т", "звони́м", "звони́те", "звоня́т"], "formsP": ["звоню", "звонишь", "звонит", "звоним", "звоните", "звонят"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "смотре́ть", "infP": "смотреть", "ko": "(의지를 갖고) 보다", "type": "c2", "forms": ["смотрю́", "смо́тришь", "смо́трит", "смо́трим", "смо́трите", "смо́трят"], "formsP": ["смотрю", "смотришь", "смотрит", "смотрим", "смотрите", "смотрят"], "note": "я만 끝에 강세가 오고, 나머지는 강세가 앞(смо́-)으로 옮겨 가요. 교재: ви́деть는 ‘눈에 보이다(see)’, смотре́ть는 ‘의지를 갖고 보다(watch)’예요. 둘 다 2식(говорить형)이에요.", "lvl": "beginner", "tr": "{o}{을} 봐요", "objs": ["фильм", "балет", "опера"]}, {"lt": "", "endnote": "", "inf": "стро́ить", "infP": "строить", "ko": "짓다, 세우다", "type": "c2", "forms": ["стро́ю", "стро́ишь", "стро́ит", "стро́им", "стро́ите", "стро́ят"], "formsP": ["строю", "строишь", "строит", "строим", "строите", "строят"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 지어요", "objs": ["дом", "мост", "школа", "здание", "больница"]}, {"lt": "", "endnote": "", "inf": "по́мнить", "infP": "помнить", "ko": "기억하다", "type": "c2", "forms": ["по́мню", "по́мнишь", "по́мнит", "по́мним", "по́мните", "по́мнят"], "formsP": ["помню", "помнишь", "помнит", "помним", "помните", "помнят"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 기억해요", "objs": ["адрес", "слово", "учитель", "*"]}, {"lt": "", "endnote": "", "inf": "кури́ть", "infP": "курить", "ko": "담배를 피우다", "type": "c2", "forms": ["курю́", "ку́ришь", "ку́рит", "ку́рим", "ку́рите", "ку́рят"], "formsP": ["курю", "куришь", "курит", "курим", "курите", "курят"], "note": "я만 끝에 강세가 오고, 나머지는 강세가 앞(ку́-)으로 옮겨 가요.", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "стоя́ть", "infP": "стоять", "ko": "서 있다", "type": "c2", "forms": ["стою́", "стои́шь", "стои́т", "стои́м", "стои́те", "стоя́т"], "formsP": ["стою", "стоишь", "стоит", "стоим", "стоите", "стоят"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "учи́ть", "infP": "учить", "ko": "가르치다, 외우다", "type": "c2sp", "forms": ["учу́", "у́чишь", "у́чит", "у́чим", "у́чите", "у́чат"], "formsP": ["учу", "учишь", "учит", "учим", "учите", "учат"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 외워요", "objs": ["слово", "песня", "стихотворение", "русский_язык"]}, {"lt": "", "endnote": "", "inf": "лежа́ть", "infP": "лежать", "ko": "누워 있다, 놓여 있다", "type": "c2sp", "forms": ["лежу́", "лежи́шь", "лежи́т", "лежи́м", "лежи́те", "лежа́т"], "formsP": ["лежу", "лежишь", "лежит", "лежим", "лежите", "лежат"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "слы́шать", "infP": "слышать", "ko": "듣다(들리다)", "type": "c2sp", "forms": ["слы́шу", "слы́шишь", "слы́шит", "слы́шим", "слы́шите", "слы́шат"], "formsP": ["слышу", "слышишь", "слышит", "слышим", "слышите", "слышат"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "люби́ть", "infP": "любить", "ko": "좋아하다, 사랑하다", "type": "c2l", "forms": ["люблю́", "лю́бишь", "лю́бит", "лю́бим", "лю́бите", "лю́бят"], "formsP": ["люблю", "любишь", "любит", "любим", "любите", "любят"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 좋아해요", "objs": ["мама", "папа", "сестра", "брат", "бабушка", "дедушка", "музыка", "литература", "кошка", "собака", "*"]}, {"lt": "", "endnote": "", "inf": "гото́вить", "infP": "готовить", "ko": "요리하다, 준비하다", "type": "c2l", "forms": ["гото́влю", "гото́вишь", "гото́вит", "гото́вим", "гото́вите", "гото́вят"], "formsP": ["готовлю", "готовишь", "готовит", "готовим", "готовите", "готовят"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 만들어요", "objs": ["суп", "торт", "рыба"]}, {"lt": "", "endnote": "", "inf": "спать", "infP": "спать", "ko": "자다", "type": "c2l", "forms": ["сплю", "спишь", "спит", "спим", "спи́те", "спят"], "formsP": ["сплю", "спишь", "спит", "спим", "спите", "спят"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "ви́деть", "infP": "видеть", "ko": "(눈에) 보이다", "type": "c2mut", "forms": ["ви́жу", "ви́дишь", "ви́дит", "ви́дим", "ви́дите", "ви́дят"], "formsP": ["вижу", "видишь", "видит", "видим", "видите", "видят"], "note": "д → ж 자음 교체는 я(ви́жу)에서만 일어나요. 교재: ви́деть는 ‘눈에 보이다(see)’, смотре́ть는 ‘의지를 갖고 보다(watch)’예요. 둘 다 2식(говорить형)이에요.", "lvl": "beginner", "tr": "{o}{을} 봐요", "objs": ["дом", "машина", "море", "мост", "сестра", "брат", "девочка", "человек", "*"]}, {"lt": "", "endnote": "", "inf": "ходи́ть", "infP": "ходить", "ko": "(걸어서) 다니다", "type": "c2mut", "forms": ["хожу́", "хо́дишь", "хо́дит", "хо́дим", "хо́дите", "хо́дят"], "formsP": ["хожу", "ходишь", "ходит", "ходим", "ходите", "ходят"], "note": "д → ж에 더해, я만 끝에 강세가 오고 나머지는 앞(хо́-)에 와요.", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "сиде́ть", "infP": "сидеть", "ko": "앉아 있다", "type": "c2mut", "forms": ["сижу́", "сиди́шь", "сиди́т", "сиди́м", "сиди́те", "сидя́т"], "formsP": ["сижу", "сидишь", "сидит", "сидим", "сидите", "сидят"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (занима́юсь, занима́ется)", "inf": "занима́ться", "infP": "заниматься", "ko": "공부하다, 운동하다", "type": "c1s", "forms": ["занима́юсь", "занима́ешься", "занима́ется", "занима́емся", "занима́етесь", "занима́ются"], "formsP": ["занимаюсь", "занимаешься", "занимается", "занимаемся", "занимаетесь", "занимаются"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (одева́юсь, одева́ется)", "inf": "одева́ться", "infP": "одеваться", "ko": "옷을 입다", "type": "c1s", "forms": ["одева́юсь", "одева́ешься", "одева́ется", "одева́емся", "одева́етесь", "одева́ются"], "formsP": ["одеваюсь", "одеваешься", "одевается", "одеваемся", "одеваетесь", "одеваются"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (возвраща́юсь, возвраща́ется)", "inf": "возвраща́ться", "infP": "возвращаться", "ko": "돌아오다", "type": "c1s", "forms": ["возвраща́юсь", "возвраща́ешься", "возвраща́ется", "возвраща́емся", "возвраща́етесь", "возвраща́ются"], "formsP": ["возвращаюсь", "возвращаешься", "возвращается", "возвращаемся", "возвращаетесь", "возвращаются"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (улыба́юсь, улыба́ется)", "inf": "улыба́ться", "infP": "улыбаться", "ko": "미소 짓다", "type": "c1s", "forms": ["улыба́юсь", "улыба́ешься", "улыба́ется", "улыба́емся", "улыба́етесь", "улыба́ются"], "formsP": ["улыбаюсь", "улыбаешься", "улыбается", "улыбаемся", "улыбаетесь", "улыбаются"], "note": "", "lvl": "intermediate", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "покупа́ть", "infP": "покупать", "ko": "사다", "type": "c1", "forms": ["покупа́ю", "покупа́ешь", "покупа́ет", "покупа́ем", "покупа́ете", "покупа́ют"], "formsP": ["покупаю", "покупаешь", "покупает", "покупаем", "покупаете", "покупают"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 사요", "objs": ["книга", "газета", "торт", "ручка", "словарь", "сумка", "машина", "учебник", "рубашка", "платье", "костюм"]}, {"lt": "", "endnote": "", "inf": "открыва́ть", "infP": "открывать", "ko": "열다", "type": "c1", "forms": ["открыва́ю", "открыва́ешь", "открыва́ет", "открыва́ем", "открыва́ете", "открыва́ют"], "formsP": ["открываю", "открываешь", "открывает", "открываем", "открываете", "открывают"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 열어요", "objs": ["окно", "дверь", "сумка"]}, {"lt": "", "endnote": "", "inf": "закрыва́ть", "infP": "закрывать", "ko": "닫다", "type": "c1", "forms": ["закрыва́ю", "закрыва́ешь", "закрыва́ет", "закрыва́ем", "закрыва́ете", "закрыва́ют"], "formsP": ["закрываю", "закрываешь", "закрывает", "закрываем", "закрываете", "закрывают"], "note": "", "lvl": "intermediate", "tr": "{o}{을} 닫아요", "objs": ["окно", "дверь", "сумка"]}, {"lt": "{L}로 써요", "endnote": "어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "писа́ть", "infP": "писать", "ko": "쓰다", "type": "irr", "forms": ["пишу́", "пи́шешь", "пи́шет", "пи́шем", "пи́шете", "пи́шут"], "formsP": ["пишу", "пишешь", "пишет", "пишем", "пишете", "пишут"], "note": "с가 ш로 바뀌어요. 강세는 я만 끝에 오고 나머지는 앞(пи́-)에 와요.", "lvl": "advanced", "tr": "{o}{을} 써요", "objs": ["письмо", "книга", "упражнение", "слово", "стихотворение"]}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요) 어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "идти́", "infP": "идти", "ko": "(걸어서) 가다", "type": "irr", "forms": ["иду́", "идёшь", "идёт", "идём", "идёте", "иду́т"], "formsP": ["иду", "идёшь", "идёт", "идём", "идёте", "идут"], "note": "어간 ид-에 강세 있는 어미가 붙어요. 걸어서 가면 идти́, 차를 타고 가면 е́хать예요.", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "е́хать", "infP": "ехать", "ko": "(차를 타고) 가다", "type": "irr", "forms": ["е́ду", "е́дешь", "е́дет", "е́дем", "е́дете", "е́дут"], "formsP": ["еду", "едешь", "едет", "едем", "едете", "едут"], "note": "어간이 ед-로 바뀌어요. 교통수단은 на + 전치격으로 말해요: е́ду на авто́бусе (버스를 타고 가요).", "lvl": "beginner", "tr": "", "objs": []}, {"lt": "", "endnote": "어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "мочь", "infP": "мочь", "ko": "할 수 있다", "type": "irr", "forms": ["могу́", "мо́жешь", "мо́жет", "мо́жем", "мо́жете", "мо́гут"], "formsP": ["могу", "можешь", "может", "можем", "можете", "могут"], "note": "я와 они는 г(могу́, мо́гут), 나머지는 ж가 나와요.", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "хоте́ть", "infP": "хотеть", "ko": "원하다", "type": "irr", "forms": ["хочу́", "хо́чешь", "хо́чет", "хоти́м", "хоти́те", "хотя́т"], "formsP": ["хочу", "хочешь", "хочет", "хотим", "хотите", "хотят"], "note": "단수는 1식처럼(хочу́, хо́чешь), 복수는 2식처럼(хоти́м, хотя́т) 변하는 섞인 형태예요.", "lvl": "advanced", "tr": "{o}{을} 원해요", "objs": ["суп", "торт", "рыба", "конфета", "яблоко"]}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요) 어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "брать", "infP": "брать", "ko": "가지다, 집다", "type": "irr", "forms": ["беру́", "берёшь", "берёт", "берём", "берёте", "беру́т"], "formsP": ["беру", "берёшь", "берёт", "берём", "берёте", "берут"], "note": "어간이 бер-로 바뀌어요.", "lvl": "advanced", "tr": "{o}{을} 집어요", "objs": ["книга", "ручка", "словарь", "газета", "ключ", "учебник"]}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요) 어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "ждать", "infP": "ждать", "ko": "기다리다", "type": "irr", "forms": ["жду", "ждёшь", "ждёт", "ждём", "ждёте", "ждут"], "formsP": ["жду", "ждёшь", "ждёт", "ждём", "ждёте", "ждут"], "note": "а가 빠지고 강세가 어미에 와요.", "lvl": "advanced", "tr": "{o}{을} 기다려요", "objs": ["мама", "брат", "друг", "бабушка", "дедушка", "автобус", "трамвай", "*"]}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요)", "inf": "петь", "infP": "петь", "ko": "노래하다", "type": "irr", "forms": ["пою́", "поёшь", "поёт", "поём", "поёте", "пою́т"], "formsP": ["пою", "поёшь", "поёт", "поём", "поёте", "поют"], "note": "어간이 по-로 바뀌어요.", "lvl": "advanced", "tr": "{o}{을} 불러요", "objs": ["песня"]}, {"lt": "", "endnote": "", "inf": "мыть", "infP": "мыть", "ko": "씻다", "type": "irr", "forms": ["мо́ю", "мо́ешь", "мо́ет", "мо́ем", "мо́ете", "мо́ют"], "formsP": ["мою", "моешь", "моет", "моем", "моете", "моют"], "note": "ы가 о로 바뀌어요.", "lvl": "advanced", "tr": "{o}{을} 씻어요", "objs": ["окно", "чашка", "машина", "тарелка"]}, {"lt": "", "endnote": "어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "иска́ть", "infP": "искать", "ko": "찾다", "type": "irr", "forms": ["ищу́", "и́щешь", "и́щет", "и́щем", "и́щете", "и́щут"], "formsP": ["ищу", "ищешь", "ищет", "ищем", "ищете", "ищут"], "note": "ск가 щ로 바뀌어요. 강세는 я만 끝에 와요.", "lvl": "advanced", "tr": "{o}{을} 찾아요", "objs": ["ключ", "книга", "кошка", "собака", "сестра", "словарь", "учебник", "рубашка", "*"]}, {"lt": "", "endnote": "어간이 자음으로 끝나서 я는 -у, они는 -ут가 붙어요. (모음 뒤였다면 -ю, -ют)", "inf": "пла́кать", "infP": "плакать", "ko": "울다", "type": "irr", "forms": ["пла́чу", "пла́чешь", "пла́чет", "пла́чем", "пла́чете", "пла́чут"], "formsP": ["плачу", "плачешь", "плачет", "плачем", "плачете", "плачут"], "note": "к가 ч로 바뀌어요.", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "бежа́ть", "infP": "бежать", "ko": "달리다", "type": "irr", "forms": ["бегу́", "бежи́шь", "бежи́т", "бежи́м", "бежи́те", "бегу́т"], "formsP": ["бегу", "бежишь", "бежит", "бежим", "бежите", "бегут"], "note": "я와 они는 г(бегу́, бегу́т), 나머지는 ж + 2식 어미예요.", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요)", "inf": "дава́ть", "infP": "давать", "ko": "주다", "type": "ava", "forms": ["даю́", "даёшь", "даёт", "даём", "даёте", "даю́т"], "formsP": ["даю", "даёшь", "даёт", "даём", "даёте", "дают"], "note": "", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요)", "inf": "встава́ть", "infP": "вставать", "ko": "일어나다", "type": "ava", "forms": ["встаю́", "встаёшь", "встаёт", "встаём", "встаёте", "встаю́т"], "formsP": ["встаю", "встаёшь", "встаёт", "встаём", "встаёте", "встают"], "note": "", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "어미에 강세가 와서 1식 어미의 е가 ё로 바뀌어요: -ёшь, -ёт, -ём, -ёте. (ё는 항상 강세를 받고 ‘요’ 소리가 나요)", "inf": "узнава́ть", "infP": "узнавать", "ko": "알아보다, 알게 되다", "type": "ava", "forms": ["узнаю́", "узнаёшь", "узнаёт", "узнаём", "узнаёте", "узнаю́т"], "formsP": ["узнаю", "узнаёшь", "узнаёт", "узнаём", "узнаёте", "узнают"], "note": "", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "рисова́ть", "infP": "рисовать", "ko": "그리다", "type": "ova", "forms": ["рису́ю", "рису́ешь", "рису́ет", "рису́ем", "рису́ете", "рису́ют"], "formsP": ["рисую", "рисуешь", "рисует", "рисуем", "рисуете", "рисуют"], "note": "", "lvl": "advanced", "tr": "{o}{을} 그려요", "objs": ["дом", "кошка", "море", "город", "мама", "*"]}, {"lt": "", "endnote": "", "inf": "танцева́ть", "infP": "танцевать", "ko": "춤추다", "type": "ova", "forms": ["танцу́ю", "танцу́ешь", "танцу́ет", "танцу́ем", "танцу́ете", "танцу́ют"], "formsP": ["танцую", "танцуешь", "танцует", "танцуем", "танцуете", "танцуют"], "note": "", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "фотографи́ровать", "infP": "фотографировать", "ko": "사진을 찍다", "type": "ova", "forms": ["фотографи́рую", "фотографи́руешь", "фотографи́рует", "фотографи́руем", "фотографи́руете", "фотографи́руют"], "formsP": ["фотографирую", "фотографируешь", "фотографирует", "фотографируем", "фотографируете", "фотографируют"], "note": "", "lvl": "advanced", "tr": "{o}{을} 찍어요", "objs": ["дом", "море", "город", "сестра", "площадь", "*"]}, {"lt": "", "endnote": "", "inf": "путеше́ствовать", "infP": "путешествовать", "ko": "여행하다", "type": "ova", "forms": ["путеше́ствую", "путеше́ствуешь", "путеше́ствует", "путеше́ствуем", "путеше́ствуете", "путеше́ствуют"], "formsP": ["путешествую", "путешествуешь", "путешествует", "путешествуем", "путешествуете", "путешествуют"], "note": "", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "сове́товать", "infP": "советовать", "ko": "조언하다", "type": "ova", "forms": ["сове́тую", "сове́туешь", "сове́тует", "сове́туем", "сове́туете", "сове́туют"], "formsP": ["советую", "советуешь", "советует", "советуем", "советуете", "советуют"], "note": "", "lvl": "advanced", "tr": "", "objs": []}, {"lt": "", "endnote": "", "inf": "расска́зывать", "infP": "рассказывать", "ko": "(누구에게) 이야기해 주다, 들려주다", "type": "c1", "forms": ["расска́зываю", "расска́зываешь", "расска́зывает", "расска́зываем", "расска́зываете", "расска́зывают"], "formsP": ["рассказываю", "рассказываешь", "рассказывает", "рассказываем", "рассказываете", "рассказывают"], "note": "чита́ть와 같은 1식 규칙 동사예요. Ба́бушка расска́зывает исто́рию. (할머니가 이야기를 들려주세요.)", "lvl": "beginner", "tr": "{o}{을} 이야기해 줘요", "objs": ["история"]}, {"lt": "", "endnote": "", "inf": "начина́ть", "infP": "начинать", "ko": "시작하다", "type": "c1", "forms": ["начина́ю", "начина́ешь", "начина́ет", "начина́ем", "начина́ете", "начина́ют"], "formsP": ["начинаю", "начинаешь", "начинает", "начинаем", "начинаете", "начинают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 시작해요", "objs": ["урок", "работа", "лекция", "упражнение"]}, {"lt": "", "endnote": "", "inf": "конча́ть", "infP": "кончать", "ko": "끝내다", "type": "c1", "forms": ["конча́ю", "конча́ешь", "конча́ет", "конча́ем", "конча́ете", "конча́ют"], "formsP": ["кончаю", "кончаешь", "кончает", "кончаем", "кончаете", "кончают"], "note": "", "lvl": "beginner", "tr": "{o}{을} 끝내요", "objs": ["урок", "работа", "упражнение", "задание"]}, {"lt": "", "endnote": "", "inf": "встреча́ть", "infP": "встречать", "ko": "만나다, 맞이하다", "type": "c1", "forms": ["встреча́ю", "встреча́ешь", "встреча́ет", "встреча́ем", "встреча́ете", "встреча́ют"], "formsP": ["встречаю", "встречаешь", "встречает", "встречаем", "встречаете", "встречают"], "note": "사람을 목적어로 자주 써서, 살아 있는 남성명사는 대격에서 -а가 붙어요: встреча́ю дру́га.", "lvl": "beginner", "tr": "{o}{을} 만나요", "objs": ["друг", "мама", "брат", "сестра", "бабушка", "дедушка", "*"]}, {"lt": "", "endnote": "", "inf": "приглаша́ть", "infP": "приглашать", "ko": "초대하다", "type": "c1", "forms": ["приглаша́ю", "приглаша́ешь", "приглаша́ет", "приглаша́ем", "приглаша́ете", "приглаша́ют"], "formsP": ["приглашаю", "приглашаешь", "приглашает", "приглашаем", "приглашаете", "приглашают"], "note": "사람을 목적어로 자주 써서, 살아 있는 남성명사는 대격에서 -а가 붙어요: приглаша́ю Анто́на.", "lvl": "beginner", "tr": "{o}{을} 초대해요", "objs": ["друг", "Анна", "Антон", "сестра", "сосед", "учитель", "*"]}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (начина́ется, начина́ются)", "inf": "начина́ться", "infP": "начинаться", "ko": "시작되다", "type": "c1s", "forms": ["—", "—", "начина́ется", "—", "—", "начина́ются"], "formsP": ["—", "—", "начинается", "—", "—", "начинаются"], "note": "начина́ть(시작하다) + -ся = 시작되다. 주어가 수업·영화 같은 ‘일’이라서 3인칭(он · она · оно / они)으로만 써요: Уро́к начина́ется. (수업이 시작돼요)", "lvl": "beginner", "tr": "", "objs": [], "only3": true, "base": "начинать"}, {"lt": "", "endnote": "-ся는 어미가 모음으로 끝나면 -сь, 자음으로 끝나면 -ся가 돼요. (конча́ется, конча́ются)", "inf": "конча́ться", "infP": "кончаться", "ko": "끝나다", "type": "c1s", "forms": ["—", "—", "конча́ется", "—", "—", "конча́ются"], "formsP": ["—", "—", "кончается", "—", "—", "кончаются"], "note": "конча́ть(끝내다) + -ся = 끝나다. 3인칭으로만 써요: Фильм конча́ется. (영화가 끝나요)", "lvl": "beginner", "tr": "", "objs": [], "only3": true, "base": "кончать"}], "objs": {"книга": {"anim": false, "nom": "кни́га", "nomP": "книга", "ko": "책", "kind": "fa", "acc": "кни́гу", "accP": "книгу", "wrong": ["книга", "книге", "книги"], "note": "", "pt": "을"}, "газета": {"anim": false, "nom": "газе́та", "nomP": "газета", "ko": "신문", "kind": "fa", "acc": "газе́ту", "accP": "газету", "wrong": ["газета", "газете", "газеты"], "note": "", "pt": "을"}, "журнал": {"anim": false, "nom": "журна́л", "nomP": "журнал", "ko": "잡지", "kind": "minan", "acc": "журна́л", "accP": "журнал", "wrong": ["журнала", "журнале", "журналу"], "note": "", "pt": "를"}, "письмо": {"anim": false, "nom": "письмо́", "nomP": "письмо", "ko": "편지", "kind": "neut", "acc": "письмо́", "accP": "письмо", "wrong": ["письма", "письме", "письму"], "note": "", "pt": "를"}, "Анна": {"anim": true, "nom": "А́нна", "nomP": "Анна", "ko": "안나", "kind": "fa", "acc": "А́нну", "accP": "Анну", "wrong": ["Анна", "Анне", "Анны"], "note": "", "pt": "를"}, "Антон": {"anim": true, "nom": "Анто́н", "nomP": "Антон", "ko": "안톤", "kind": "manim", "acc": "Анто́на", "accP": "Антона", "wrong": ["Антон", "Антоне", "Антону"], "note": "", "pt": "을"}, "брат": {"anim": true, "nom": "брат", "nomP": "брат", "ko": "형", "kind": "manim", "acc": "бра́та", "accP": "брата", "wrong": ["брат", "брате", "брату"], "note": "", "pt": "을"}, "сестра": {"anim": true, "nom": "сестра́", "nomP": "сестра", "ko": "누나", "kind": "fa", "acc": "сестру́", "accP": "сестру", "wrong": ["сестра", "сестре", "сестры"], "note": "", "pt": "를"}, "учитель": {"anim": true, "nom": "учи́тель", "nomP": "учитель", "ko": "선생님", "kind": "manim", "acc": "учи́теля", "accP": "учителя", "wrong": ["учитель", "учителе", "учителю"], "note": "", "pt": "을"}, "сосед": {"anim": true, "nom": "сосе́д", "nomP": "сосед", "ko": "이웃", "kind": "manim", "acc": "сосе́да", "accP": "соседа", "wrong": ["сосед", "соседе", "соседу"], "note": "", "pt": "을"}, "адрес": {"anim": false, "nom": "а́дрес", "nomP": "адрес", "ko": "주소", "kind": "minan", "acc": "а́дрес", "accP": "адрес", "wrong": ["адреса", "адресе", "адресу"], "note": "", "pt": "를"}, "вопрос": {"anim": false, "nom": "вопро́с", "nomP": "вопрос", "ko": "질문", "kind": "minan", "acc": "вопро́с", "accP": "вопрос", "wrong": ["вопроса", "вопросе", "вопросу"], "note": "", "pt": "을"}, "преподаватель": {"anim": true, "nom": "преподава́тель", "nomP": "преподаватель", "ko": "강사", "kind": "manim", "acc": "преподава́теля", "accP": "преподавателя", "wrong": ["преподаватель", "преподавателе", "преподавателю"], "note": "", "pt": "를"}, "слово": {"anim": false, "nom": "сло́во", "nomP": "слово", "ko": "단어", "kind": "neut", "acc": "сло́во", "accP": "слово", "wrong": ["слова", "слове", "слову"], "note": "", "pt": "를"}, "упражнение": {"anim": false, "nom": "упражне́ние", "nomP": "упражнение", "ko": "연습 문제", "kind": "neut", "acc": "упражне́ние", "accP": "упражнение", "wrong": ["упражнения", "упражнении", "упражнению"], "note": "", "pt": "를"}, "задание": {"anim": false, "nom": "зада́ние", "nomP": "задание", "ko": "과제", "kind": "neut", "acc": "зада́ние", "accP": "задание", "wrong": ["задания", "задании", "заданию"], "note": "", "pt": "를"}, "работа": {"anim": false, "nom": "рабо́та", "nomP": "работа", "ko": "일", "kind": "fa", "acc": "рабо́ту", "accP": "работу", "wrong": ["работа", "работе", "работы"], "note": "", "pt": "을"}, "музыка": {"anim": false, "nom": "му́зыка", "nomP": "музыка", "ko": "음악", "kind": "fa", "acc": "му́зыку", "accP": "музыку", "wrong": ["музыка", "музыке", "музыки"], "note": "", "pt": "을"}, "песня": {"anim": false, "nom": "пе́сня", "nomP": "песня", "ko": "노래", "kind": "fya", "acc": "пе́сню", "accP": "песню", "wrong": ["песня", "песне", "песни"], "note": "", "pt": "를"}, "мама": {"anim": true, "nom": "ма́ма", "nomP": "мама", "ko": "엄마", "kind": "fa", "acc": "ма́му", "accP": "маму", "wrong": ["мама", "маме", "мамы"], "note": "", "pt": "를"}, "папа": {"anim": true, "nom": "па́па", "nomP": "папа", "ko": "아빠", "kind": "fam", "acc": "па́пу", "accP": "папу", "wrong": ["папа", "папе", "папы"], "note": "", "pt": "를"}, "профессор": {"anim": true, "nom": "профе́ссор", "nomP": "профессор", "ko": "교수님", "kind": "manim", "acc": "профе́ссора", "accP": "профессора", "wrong": ["профессор", "профессоре", "профессору"], "note": "", "pt": "을"}, "друг": {"anim": true, "nom": "друг", "nomP": "друг", "ko": "친구", "kind": "manim", "acc": "дру́га", "accP": "друга", "wrong": ["друг", "друге", "другу"], "note": "", "pt": "를"}, "сын": {"anim": true, "nom": "сын", "nomP": "сын", "ko": "아들", "kind": "manim", "acc": "сы́на", "accP": "сына", "wrong": ["сын", "сыне", "сыну"], "note": "", "pt": "을"}, "дочь": {"anim": true, "nom": "дочь", "nomP": "дочь", "ko": "딸", "kind": "fsoft", "acc": "дочь", "accP": "дочь", "wrong": ["дочери", "дочью", "дочка"], "note": "дочь는 사람이지만 -ь로 끝나는 여성명사라서 모양이 그대로예요.", "pt": "을"}, "дедушка": {"anim": true, "nom": "де́душка", "nomP": "дедушка", "ko": "할아버지", "kind": "fam", "acc": "де́душку", "accP": "дедушку", "wrong": ["дедушка", "дедушке", "дедушки"], "note": "", "pt": "를"}, "бабушка": {"anim": true, "nom": "ба́бушка", "nomP": "бабушка", "ko": "할머니", "kind": "fa", "acc": "ба́бушку", "accP": "бабушку", "wrong": ["бабушка", "бабушке", "бабушки"], "note": "", "pt": "를"}, "кошка": {"anim": true, "nom": "ко́шка", "nomP": "кошка", "ko": "고양이", "kind": "fa", "acc": "ко́шку", "accP": "кошку", "wrong": ["кошка", "кошке", "кошки"], "note": "", "pt": "를"}, "собака": {"anim": true, "nom": "соба́ка", "nomP": "собака", "ko": "개", "kind": "fa", "acc": "соба́ку", "accP": "собаку", "wrong": ["собака", "собаке", "собаки"], "note": "", "pt": "를"}, "фильм": {"anim": false, "nom": "фильм", "nomP": "фильм", "ko": "영화", "kind": "minan", "acc": "фильм", "accP": "фильм", "wrong": ["фильма", "фильме", "фильму"], "note": "", "pt": "를"}, "балет": {"anim": false, "nom": "бале́т", "nomP": "балет", "ko": "발레", "kind": "minan", "acc": "бале́т", "accP": "балет", "wrong": ["балета", "балете", "балету"], "note": "", "pt": "를"}, "опера": {"anim": false, "nom": "о́пера", "nomP": "опера", "ko": "오페라", "kind": "fa", "acc": "о́перу", "accP": "оперу", "wrong": ["опера", "опере", "оперы"], "note": "", "pt": "를"}, "дом": {"anim": false, "nom": "дом", "nomP": "дом", "ko": "집", "kind": "minan", "acc": "дом", "accP": "дом", "wrong": ["дома", "доме", "дому"], "note": "", "pt": "을"}, "машина": {"anim": false, "nom": "маши́на", "nomP": "машина", "ko": "차", "kind": "fa", "acc": "маши́ну", "accP": "машину", "wrong": ["машина", "машине", "машины"], "note": "", "pt": "를"}, "море": {"anim": false, "nom": "мо́ре", "nomP": "море", "ko": "바다", "kind": "neut", "acc": "мо́ре", "accP": "море", "wrong": ["моря", "морю", "мори"], "note": "", "pt": "를"}, "мост": {"anim": false, "nom": "мост", "nomP": "мост", "ko": "다리", "kind": "minan", "acc": "мост", "accP": "мост", "wrong": ["моста", "мосте", "мосту"], "note": "", "pt": "를"}, "суп": {"anim": false, "nom": "суп", "nomP": "суп", "ko": "수프", "kind": "minan", "acc": "суп", "accP": "суп", "wrong": ["супа", "супе", "супу"], "note": "", "pt": "를"}, "торт": {"anim": false, "nom": "торт", "nomP": "торт", "ko": "케이크", "kind": "minan", "acc": "торт", "accP": "торт", "wrong": ["торта", "торте", "торту"], "note": "", "pt": "를"}, "рыба": {"anim": false, "nom": "ры́ба", "nomP": "рыба", "ko": "생선", "kind": "fa", "acc": "ры́бу", "accP": "рыбу", "wrong": ["рыба", "рыбе", "рыбы"], "note": "", "pt": "을"}, "школа": {"anim": false, "nom": "шко́ла", "nomP": "школа", "ko": "학교", "kind": "fa", "acc": "шко́лу", "accP": "школу", "wrong": ["школа", "школе", "школы"], "note": "", "pt": "를"}, "здание": {"anim": false, "nom": "зда́ние", "nomP": "здание", "ko": "건물", "kind": "neut", "acc": "зда́ние", "accP": "здание", "wrong": ["здания", "здании", "зданию"], "note": "", "pt": "을"}, "больница": {"anim": false, "nom": "больни́ца", "nomP": "больница", "ko": "병원", "kind": "fa", "acc": "больни́цу", "accP": "больницу", "wrong": ["больница", "больнице", "больницы"], "note": "", "pt": "을"}, "ручка": {"anim": false, "nom": "ру́чка", "nomP": "ручка", "ko": "펜", "kind": "fa", "acc": "ру́чку", "accP": "ручку", "wrong": ["ручка", "ручке", "ручки"], "note": "", "pt": "을"}, "словарь": {"anim": false, "nom": "слова́рь", "nomP": "словарь", "ko": "사전", "kind": "minan", "acc": "слова́рь", "accP": "словарь", "wrong": ["словаря", "словаре", "словарю"], "note": "", "pt": "을"}, "сумка": {"anim": false, "nom": "су́мка", "nomP": "сумка", "ko": "가방", "kind": "fa", "acc": "су́мку", "accP": "сумку", "wrong": ["сумка", "сумке", "сумки"], "note": "", "pt": "을"}, "окно": {"anim": false, "nom": "окно́", "nomP": "окно", "ko": "창문", "kind": "neut", "acc": "окно́", "accP": "окно", "wrong": ["окна", "окне", "окну"], "note": "", "pt": "을"}, "дверь": {"anim": false, "nom": "дверь", "nomP": "дверь", "ko": "문", "kind": "fsoft", "acc": "дверь", "accP": "дверь", "wrong": ["дверю", "двери", "дверью"], "note": "", "pt": "을"}, "тетрадь": {"anim": false, "nom": "тетра́дь", "nomP": "тетрадь", "ko": "공책", "kind": "fsoft", "acc": "тетра́дь", "accP": "тетрадь", "wrong": ["тетрадю", "тетради", "тетрадью"], "note": "", "pt": "을"}, "автобус": {"anim": false, "nom": "авто́бус", "nomP": "автобус", "ko": "버스", "kind": "minan", "acc": "авто́бус", "accP": "автобус", "wrong": ["автобуса", "автобусе", "автобусу"], "note": "", "pt": "를"}, "трамвай": {"anim": false, "nom": "трамва́й", "nomP": "трамвай", "ko": "전차", "kind": "minan", "acc": "трамва́й", "accP": "трамвай", "wrong": ["трамвая", "трамвае", "трамваю"], "note": "", "pt": "를"}, "ключ": {"anim": false, "nom": "ключ", "nomP": "ключ", "ko": "열쇠", "kind": "minan", "acc": "ключ", "accP": "ключ", "wrong": ["ключа", "ключе", "ключу"], "note": "", "pt": "를"}, "конфета": {"anim": false, "nom": "конфе́та", "nomP": "конфета", "ko": "사탕", "kind": "fa", "acc": "конфе́ту", "accP": "конфету", "wrong": ["конфета", "конфете", "конфеты"], "note": "", "pt": "을"}, "яблоко": {"anim": false, "nom": "я́блоко", "nomP": "яблоко", "ko": "사과", "kind": "neut", "acc": "я́блоко", "accP": "яблоко", "wrong": ["яблока", "яблоке", "яблоку"], "note": "", "pt": "를"}, "сок": {"anim": false, "nom": "сок", "nomP": "сок", "ko": "주스", "kind": "minan", "acc": "сок", "accP": "сок", "wrong": ["сока", "соке", "соку"], "note": "", "pt": "를"}, "чай": {"anim": false, "nom": "чай", "nomP": "чай", "ko": "차", "kind": "minan", "acc": "чай", "accP": "чай", "wrong": ["чая", "чае", "чаю"], "note": "", "pt": "를"}, "лекция": {"anim": false, "nom": "ле́кция", "nomP": "лекция", "ko": "강의", "kind": "fya", "acc": "ле́кцию", "accP": "лекцию", "wrong": ["лекция", "лекцие", "лекции"], "note": "", "pt": "를"}, "концерт": {"anim": false, "nom": "конце́рт", "nomP": "концерт", "ko": "콘서트", "kind": "minan", "acc": "конце́рт", "accP": "концерт", "wrong": ["концерта", "концерте", "концерту"], "note": "", "pt": "를"}, "вода": {"anim": false, "nom": "вода́", "nomP": "вода", "ko": "물", "kind": "fa", "acc": "во́ду", "accP": "воду", "wrong": ["вода", "воде", "воды"], "note": "강세가 앞으로 옮겨 가요. (вода́ → во́ду)", "pt": "을"}, "молоко": {"anim": false, "nom": "молоко́", "nomP": "молоко", "ko": "우유", "kind": "neut", "acc": "молоко́", "accP": "молоко", "wrong": ["молока", "молоке", "молоку"], "note": "", "pt": "를"}, "чашка": {"anim": false, "nom": "ча́шка", "nomP": "чашка", "ko": "찻잔", "kind": "fa", "acc": "ча́шку", "accP": "чашку", "wrong": ["чашка", "чашке", "чашки"], "note": "", "pt": "을"}, "тарелка": {"anim": false, "nom": "таре́лка", "nomP": "тарелка", "ko": "접시", "kind": "fa", "acc": "таре́лку", "accP": "тарелку", "wrong": ["тарелка", "тарелке", "тарелки"], "note": "", "pt": "를"}, "город": {"anim": false, "nom": "го́род", "nomP": "город", "ko": "도시", "kind": "minan", "acc": "го́род", "accP": "город", "wrong": ["города", "городе", "городу"], "note": "", "pt": "를"}, "площадь": {"anim": false, "nom": "пло́щадь", "nomP": "площадь", "ko": "광장", "kind": "fsoft", "acc": "пло́щадь", "accP": "площадь", "wrong": ["площадю", "площади", "площадью"], "note": "", "pt": "을"}, "урок": {"anim": false, "nom": "уро́к", "nomP": "урок", "ko": "수업", "kind": "minan", "acc": "уро́к", "accP": "урок", "wrong": ["урока", "уроке", "уроку"], "note": "", "pt": "을"}, "история": {"anim": false, "nom": "исто́рия", "nomP": "история", "ko": "역사", "kind": "fya", "acc": "исто́рию", "accP": "историю", "wrong": ["история", "историе", "истории"], "note": "", "pt": "를"}, "грамматика": {"anim": false, "nom": "грамма́тика", "nomP": "грамматика", "ko": "문법", "kind": "fa", "acc": "грамма́тику", "accP": "грамматику", "wrong": ["грамматика", "грамматике", "грамматики"], "note": "", "pt": "을"}, "биология": {"anim": false, "nom": "биоло́гия", "nomP": "биология", "ko": "생물학", "kind": "fya", "acc": "биоло́гию", "accP": "биологию", "wrong": ["биология", "биологие", "биологии"], "note": "", "pt": "을"}, "учебник": {"anim": false, "nom": "уче́бник", "nomP": "учебник", "ko": "교과서", "kind": "minan", "acc": "уче́бник", "accP": "учебник", "wrong": ["учебника", "учебнике", "учебнику"], "note": "", "pt": "를"}, "рубашка": {"anim": false, "nom": "руба́шка", "nomP": "рубашка", "ko": "셔츠", "kind": "fa", "acc": "руба́шку", "accP": "рубашку", "wrong": ["рубашка", "рубашке", "рубашки"], "note": "", "pt": "를"}, "платье": {"anim": false, "nom": "пла́тье", "nomP": "платье", "ko": "원피스", "kind": "neut", "acc": "пла́тье", "accP": "платье", "wrong": ["платья", "платью", "платьи"], "note": "", "pt": "를"}, "костюм": {"anim": false, "nom": "костю́м", "nomP": "костюм", "ko": "정장", "kind": "minan", "acc": "костю́м", "accP": "костюм", "wrong": ["костюма", "костюме", "костюму"], "note": "", "pt": "을"}, "девочка": {"anim": true, "nom": "де́вочка", "nomP": "девочка", "ko": "소녀", "kind": "fa", "acc": "де́вочку", "accP": "девочку", "wrong": ["девочка", "девочке", "девочки"], "note": "", "pt": "를"}, "человек": {"anim": true, "nom": "челове́к", "nomP": "человек", "ko": "사람", "kind": "manim", "acc": "челове́ка", "accP": "человека", "wrong": ["человек", "человеке", "человеку"], "note": "", "pt": "을"}, "литература": {"anim": false, "nom": "литерату́ра", "nomP": "литература", "ko": "문학", "kind": "fa", "acc": "литерату́ру", "accP": "литературу", "wrong": ["литература", "литературе", "литературы"], "note": "", "pt": "을"}, "стихотворение": {"anim": false, "nom": "стихотворе́ние", "nomP": "стихотворение", "ko": "시", "kind": "neut", "acc": "стихотворе́ние", "accP": "стихотворение", "wrong": ["стихотворения", "стихотворении", "стихотворению"], "note": "", "pt": "를"}, "русский_язык": {"nom": "ру́сский язы́к", "nomP": "русский язык", "ko": "러시아어", "kind": "langnp", "acc": "ру́сский язы́к", "accP": "русский язык", "wrong": ["русского языка", "русском языке", "русскому языку"], "note": "", "pt": "를"}, "корейский_язык": {"nom": "коре́йский язы́к", "nomP": "корейский язык", "ko": "한국어", "kind": "langnp", "acc": "коре́йский язы́к", "accP": "корейский язык", "wrong": ["корейского языка", "корейском языке", "корейскому языку"], "note": "", "pt": "를"}, "английский_язык": {"nom": "англи́йский язы́к", "nomP": "английский язык", "ko": "영어", "kind": "langnp", "acc": "англи́йский язы́к", "accP": "английский язык", "wrong": ["английского языка", "английском языке", "английскому языку"], "note": "", "pt": "를"}, "китайский_язык": {"nom": "кита́йский язы́к", "nomP": "китайский язык", "ko": "중국어", "kind": "langnp", "acc": "кита́йский язы́к", "accP": "китайский язык", "wrong": ["китайского языка", "китайском языке", "китайскому языку"], "note": "", "pt": "를"}, "немецкий_язык": {"nom": "не́мецкий язы́к", "nomP": "немецкий язык", "ko": "독일어", "kind": "langnp", "acc": "не́мецкий язы́к", "accP": "немецкий язык", "wrong": ["немецкого языка", "немецком языке", "немецкому языку"], "note": "", "pt": "를"}, "французский_язык": {"nom": "францу́зский язы́к", "nomP": "французский язык", "ko": "프랑스어", "kind": "langnp", "acc": "францу́зский язы́к", "accP": "французский язык", "wrong": ["французского языка", "французском языке", "французскому языку"], "note": "", "pt": "를"}, "японский_язык": {"nom": "япо́нский язы́к", "nomP": "японский язык", "ko": "일본어", "kind": "langnp", "acc": "япо́нский язы́к", "accP": "японский язык", "wrong": ["японского языка", "японском языке", "японскому языку"], "note": "", "pt": "를"}, "испанский_язык": {"nom": "испа́нский язы́к", "nomP": "испанский язык", "ko": "스페인어", "kind": "langnp", "acc": "испа́нский язы́к", "accP": "испанский язык", "wrong": ["испанского языка", "испанском языке", "испанскому языку"], "note": "", "pt": "를"}}, "pron": [{"subj": "я", "ko": "나", "acc": "меня́", "accP": "меня", "opts": ["меня", "я", "мне", "мной"], "pt": "를"}, {"subj": "ты", "ko": "너", "acc": "тебя́", "accP": "тебя", "opts": ["тебя", "ты", "тебе", "тобой"], "pt": "를"}, {"subj": "он", "ko": "그", "acc": "его́", "accP": "его", "opts": ["его", "он", "ему", "им"], "pt": "를"}, {"subj": "она", "ko": "그녀", "acc": "её", "accP": "её", "opts": ["её", "она", "ей", "ею"], "pt": "를"}, {"subj": "мы", "ko": "우리", "acc": "нас", "accP": "нас", "opts": ["нас", "мы", "нам", "нами"], "pt": "를"}, {"subj": "вы", "ko": "당신", "acc": "вас", "accP": "вас", "opts": ["вас", "вы", "вам", "вами"], "pt": "을"}, {"subj": "они", "ko": "그들", "acc": "их", "accP": "их", "opts": ["их", "они", "им", "ими"], "pt": "을"}], "places": [{"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "апте́ка", "nomP": "аптека", "ko": "약국", "koLoc": "약국", "prep": "в", "form": "апте́ке", "formP": "аптеке", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["аптека", "аптеку", "аптеки"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "банк", "nomP": "банк", "ko": "은행", "koLoc": "은행", "prep": "в", "form": "ба́нке", "formP": "банке", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["банк", "банку", "банка"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "библиоте́ка", "nomP": "библиотека", "ko": "도서관", "koLoc": "도서관", "prep": "в", "form": "библиоте́ке", "formP": "библиотеке", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["библиотека", "библиотеку", "библиотеки"], "frames": ["lib", "be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "больни́ца", "nomP": "больница", "ko": "병원", "koLoc": "병원", "prep": "в", "form": "больни́це", "formP": "больнице", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["больница", "больницу", "больницы"], "frames": ["work", "be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "фи́рма", "nomP": "фирма", "ko": "회사", "koLoc": "회사", "prep": "в", "form": "фи́рме", "formP": "фирме", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["фирма", "фирму", "фирмы"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "магази́н", "nomP": "магазин", "ko": "가게", "koLoc": "가게", "prep": "в", "form": "магази́не", "formP": "магазине", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["магазин", "магазину", "магазина"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "общежи́тие", "nomP": "общежитие", "ko": "기숙사", "koLoc": "기숙사", "prep": "в", "form": "общежи́тии", "formP": "общежитии", "cat": "in_bld", "fr": "pii", "fleet": false, "wrong": ["общежития", "общежитию", "общежитие"], "frames": ["live", "be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "шко́ла", "nomP": "школа", "ko": "학교", "koLoc": "학교", "prep": "в", "form": "шко́ле", "formP": "школе", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["школа", "школу", "школы"], "frames": ["study", "work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "парк", "nomP": "парк", "ko": "공원", "koLoc": "공원", "prep": "в", "form": "па́рке", "formP": "парке", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["парк", "парку", "парка"], "frames": ["walk"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "университе́т", "nomP": "университет", "ko": "대학", "koLoc": "대학", "prep": "в", "form": "университе́те", "formP": "университете", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["университет", "университету", "университета"], "frames": ["study", "work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "институ́т", "nomP": "институт", "ko": "연구소", "koLoc": "연구소", "prep": "в", "form": "институ́те", "formP": "институте", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["институт", "институту", "института"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "о́фис", "nomP": "офис", "ko": "사무실", "koLoc": "사무실", "prep": "в", "form": "о́фисе", "formP": "офисе", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["офис", "офису", "офиса"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "музе́й", "nomP": "музей", "ko": "박물관", "koLoc": "박물관", "prep": "в", "form": "музе́е", "formP": "музее", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["музей", "музею", "музея"], "frames": ["work", "be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "рестора́н", "nomP": "ресторан", "ko": "레스토랑", "koLoc": "레스토랑", "prep": "в", "form": "рестора́не", "formP": "ресторане", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["ресторан", "ресторану", "ресторана"], "frames": ["eat", "work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "кинотеа́тр", "nomP": "кинотеатр", "ko": "영화관", "koLoc": "영화관", "prep": "в", "form": "кинотеа́тре", "formP": "кинотеатре", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["кинотеатр", "кинотеатру", "кинотеатра"], "frames": ["be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Коре́я", "nomP": "Корея", "ko": "한국", "koLoc": "한국", "prep": "в", "form": "Коре́е", "formP": "Корее", "cat": "in_country", "fr": "pe", "fleet": false, "wrong": ["Корея", "Корею", "Кореи"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Росси́я", "nomP": "Россия", "ko": "러시아", "koLoc": "러시아", "prep": "в", "form": "Росси́и", "formP": "России", "cat": "in_country", "fr": "pii", "fleet": false, "wrong": ["Россие", "Россию", "Россия"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Кита́й", "nomP": "Китай", "ko": "중국", "koLoc": "중국", "prep": "в", "form": "Кита́е", "formP": "Китае", "cat": "in_country", "fr": "pe", "fleet": false, "wrong": ["Китай", "Китаю", "Китая"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Москва́", "nomP": "Москва", "ko": "모스크바", "koLoc": "모스크바", "prep": "в", "form": "Москве́", "formP": "Москве", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["Москва", "Москву", "Москвы"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Су́здаль", "nomP": "Суздаль", "ko": "수즈달", "koLoc": "수즈달", "prep": "в", "form": "Су́здале", "formP": "Суздале", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["Суздаль", "Суздалю", "Суздаля"], "frames": ["live", "rest"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "санато́рий", "nomP": "санаторий", "ko": "요양원", "koLoc": "요양원", "prep": "в", "form": "санато́рии", "formP": "санатории", "cat": "in_bld", "fr": "pii", "fleet": false, "wrong": ["санаторие", "санатория", "санаторий"], "frames": ["rest"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "го́род", "nomP": "город", "ko": "도시", "koLoc": "도시", "prep": "в", "form": "го́роде", "formP": "городе", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["город", "городу", "города"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "дере́вня", "nomP": "деревня", "ko": "시골 마을", "koLoc": "시골 마을", "prep": "в", "form": "дере́вне", "formP": "деревне", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["деревня", "деревню", "деревни"], "frames": ["live", "rest"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "портфе́ль", "nomP": "портфель", "ko": "서류가방", "koLoc": "서류가방", "prep": "в", "form": "портфе́ле", "formP": "портфеле", "cat": "in_thing", "fr": "pe", "fleet": false, "wrong": ["портфель", "портфелю", "портфеля"], "frames": ["small"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "уче́бник", "nomP": "учебник", "ko": "교과서", "koLoc": "교과서", "prep": "в", "form": "уче́бнике", "formP": "учебнике", "cat": "in_text", "fr": "pe", "fleet": false, "wrong": ["учебник", "учебнику", "учебника"], "frames": ["text"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "вокза́л", "nomP": "вокзал", "ko": "기차역", "koLoc": "기차역", "prep": "на", "form": "вокза́ле", "formP": "вокзале", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["вокзал", "вокзалу", "вокзала"], "frames": ["work", "be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "заво́д", "nomP": "завод", "ko": "공장", "koLoc": "공장", "prep": "на", "form": "заво́де", "formP": "заводе", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["завод", "заводу", "завода"], "frames": ["work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "по́чта", "nomP": "почта", "ko": "우체국", "koLoc": "우체국", "prep": "на", "form": "по́чте", "formP": "почте", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["почта", "почту", "почты"], "frames": ["work", "be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "стадио́н", "nomP": "стадион", "ko": "경기장", "koLoc": "경기장", "prep": "на", "form": "стадио́не", "formP": "стадионе", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["стадион", "стадиону", "стадиона"], "frames": ["be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "уро́к", "nomP": "урок", "ko": "수업", "koLoc": "수업", "prep": "на", "form": "уро́ке", "formP": "уроке", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["урок", "уроку", "урока"], "frames": ["event"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "конце́рт", "nomP": "концерт", "ko": "콘서트", "koLoc": "콘서트", "prep": "на", "form": "конце́рте", "formP": "концерте", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["концерт", "концерту", "концерта"], "frames": ["event"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ле́кция", "nomP": "лекция", "ko": "강의", "koLoc": "강의", "prep": "на", "form": "ле́кции", "formP": "лекции", "cat": "on_event", "fr": "pii", "fleet": false, "wrong": ["лекцие", "лекцию", "лекция"], "frames": ["event"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "пло́щадь", "nomP": "площадь", "ko": "광장", "koLoc": "광장", "prep": "на", "form": "пло́щади", "formP": "площади", "cat": "on_street", "fr": "pif", "fleet": false, "wrong": ["площаде", "площадь", "площадью"], "frames": ["walk"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "бале́т", "nomP": "балет", "ko": "발레", "koLoc": "발레", "prep": "на", "form": "бале́те", "formP": "балете", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["балет", "балету", "балета"], "frames": ["event"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "о́пера", "nomP": "опера", "ko": "오페라", "koLoc": "오페라", "prep": "на", "form": "о́пере", "formP": "опере", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["опера", "оперу", "оперы"], "frames": ["event"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "мо́ре", "nomP": "море", "ko": "바다", "koLoc": "바닷가", "prep": "на", "form": "мо́ре", "formP": "море", "cat": "on_water", "fr": "psame", "fleet": false, "wrong": ["мори", "морю", "моря"], "frames": ["live", "rest"], "note": "на мо́ре는 ‘바닷가에서, 바다로 놀러 가서’라는 뜻이에요. -е로 끝나서 모양이 그대로예요.", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "у́лица", "nomP": "улица", "ko": "거리", "koLoc": "거리", "prep": "на", "form": "у́лице", "formP": "улице", "cat": "on_street", "fr": "pe", "fleet": false, "wrong": ["улица", "улицу", "улицы"], "frames": ["walk"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "о́стров", "nomP": "остров", "ko": "섬", "koLoc": "섬", "prep": "на", "form": "о́строве", "formP": "острове", "cat": "on_island", "fr": "pe", "fleet": false, "wrong": ["остров", "острову", "острова"], "frames": ["live", "rest"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Байка́л", "nomP": "Байкал", "ko": "바이칼 호수", "koLoc": "바이칼 호숫가", "prep": "на", "form": "Байка́ле", "formP": "Байкале", "cat": "on_water", "fr": "pe", "fleet": false, "wrong": ["Байкал", "Байкалу", "Байкала"], "frames": ["rest"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Сахали́н", "nomP": "Сахалин", "ko": "사할린", "koLoc": "사할린", "prep": "на", "form": "Сахали́не", "formP": "Сахалине", "cat": "on_island", "fr": "pe", "fleet": false, "wrong": ["Сахалин", "Сахалину", "Сахалина"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Камча́тка", "nomP": "Камчатка", "ko": "캄차카", "koLoc": "캄차카", "prep": "на", "form": "Камча́тке", "formP": "Камчатке", "cat": "on_island", "fr": "pe", "fleet": false, "wrong": ["Камчатка", "Камчатку", "Камчатки"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "восто́к", "nomP": "восток", "ko": "동쪽", "koLoc": "동쪽", "prep": "на", "form": "восто́ке", "formP": "востоке", "cat": "on_dir", "fr": "pe", "fleet": false, "wrong": ["восток", "востоку", "востока"], "frames": ["live"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "стол", "nomP": "стол", "ko": "책상", "koLoc": "책상", "prep": "на", "form": "столе́", "formP": "столе", "cat": "on_surf", "fr": "pe", "fleet": false, "wrong": ["стол", "столу", "стола"], "frames": ["small"], "note": "강세가 어미로 옮겨 가요. (стол → на столе́)", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "лес", "nomP": "лес", "ko": "숲", "koLoc": "숲", "prep": "в", "form": "лесу́", "formP": "лесу", "cat": "in_nature", "fr": "pu", "fleet": false, "wrong": ["лесе", "лес", "леса"], "frames": ["walk"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "сад", "nomP": "сад", "ko": "정원", "koLoc": "정원", "prep": "в", "form": "саду́", "formP": "саду", "cat": "in_nature", "fr": "pu", "fleet": false, "wrong": ["саде", "сад", "сада"], "frames": ["walk"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "шкаф", "nomP": "шкаф", "ko": "옷장", "koLoc": "옷장", "prep": "в", "form": "шкафу́", "formP": "шкафу", "cat": "in_thing", "fr": "pu", "fleet": false, "wrong": ["шкафе", "шкаф", "шкафа"], "frames": ["small"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "мост", "nomP": "мост", "ko": "다리", "koLoc": "다리 위", "prep": "на", "form": "мосту́", "formP": "мосту", "cat": "on_surf", "fr": "pu", "fleet": false, "wrong": ["мосте", "мост", "моста"], "frames": ["be"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "바닥에 있어요", "nom": "пол", "nomP": "пол", "ko": "바닥", "koLoc": "바닥", "prep": "на", "form": "полу́", "formP": "полу", "cat": "on_surf", "fr": "pu", "fleet": false, "wrong": ["поле", "пол", "пола"], "frames": ["big"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "бе́рег", "nomP": "берег", "ko": "해안, 강가", "koLoc": "강가", "prep": "на", "form": "берегу́", "formP": "берегу", "cat": "on_water", "fr": "pu", "fleet": false, "wrong": ["береге", "берег", "берега"], "frames": ["walk"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "구석에 있어요", "nom": "у́гол", "nomP": "угол", "ko": "구석", "koLoc": "구석", "prep": "в", "form": "углу́", "formP": "углу", "cat": "in_thing", "fr": "pu", "fleet": true, "wrong": ["уголе", "угле", "угол"], "frames": ["big"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "аэропо́рт", "nomP": "аэропорт", "ko": "공항", "koLoc": "공항", "prep": "в", "form": "аэропорту́", "formP": "аэропорту", "cat": "in_bld", "fr": "pu", "fleet": false, "wrong": ["аэропорте", "аэропорт", "аэропорта"], "frames": ["be", "work"], "note": "", "lvl": "beginner"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "теа́тр", "nomP": "театр", "ko": "극장", "koLoc": "극장", "prep": "в", "form": "теа́тре", "formP": "театре", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["театр", "театру", "театра"], "frames": ["work", "be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "кварти́ра", "nomP": "квартира", "ko": "아파트(집)", "koLoc": "아파트", "prep": "в", "form": "кварти́ре", "formP": "квартире", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["квартира", "квартиру", "квартиры"], "frames": ["live", "be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ко́мната", "nomP": "комната", "ko": "방", "koLoc": "방", "prep": "в", "form": "ко́мнате", "formP": "комнате", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["комната", "комнату", "комнаты"], "frames": ["be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "аудито́рия", "nomP": "аудитория", "ko": "강의실", "koLoc": "강의실", "prep": "в", "form": "аудито́рии", "formP": "аудитории", "cat": "in_bld", "fr": "pii", "fleet": false, "wrong": ["аудиторие", "аудиторию", "аудитория"], "frames": ["lib", "be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "лаборато́рия", "nomP": "лаборатория", "ko": "실험실", "koLoc": "실험실", "prep": "в", "form": "лаборато́рии", "formP": "лаборатории", "cat": "in_bld", "fr": "pii", "fleet": false, "wrong": ["лабораторие", "лабораторию", "лаборатория"], "frames": ["work"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "гости́ница", "nomP": "гостиница", "ko": "호텔", "koLoc": "호텔", "prep": "в", "form": "гости́нице", "formP": "гостинице", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["гостиница", "гостиницу", "гостиницы"], "frames": ["be", "work"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "центр", "nomP": "центр", "ko": "시내, 중심", "koLoc": "시내", "prep": "в", "form": "це́нтре", "formP": "центре", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["центр", "центру", "центра"], "frames": ["live", "work"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Сеу́л", "nomP": "Сеул", "ko": "서울", "koLoc": "서울", "prep": "в", "form": "Сеу́ле", "formP": "Сеуле", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["Сеул", "Сеулу", "Сеула"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Пуса́н", "nomP": "Пусан", "ko": "부산", "koLoc": "부산", "prep": "в", "form": "Пуса́не", "formP": "Пусане", "cat": "in_city", "fr": "pe", "fleet": false, "wrong": ["Пусан", "Пусану", "Пусана"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Евро́па", "nomP": "Европа", "ko": "유럽", "koLoc": "유럽", "prep": "в", "form": "Евро́пе", "formP": "Европе", "cat": "in_country", "fr": "pe", "fleet": false, "wrong": ["Европа", "Европу", "Европы"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Аме́рика", "nomP": "Америка", "ko": "미국", "koLoc": "미국", "prep": "в", "form": "Аме́рике", "formP": "Америке", "cat": "in_country", "fr": "pe", "fleet": false, "wrong": ["Америка", "Америку", "Америки"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Япо́ния", "nomP": "Япония", "ko": "일본", "koLoc": "일본", "prep": "в", "form": "Япо́нии", "formP": "Японии", "cat": "in_country", "fr": "pii", "fleet": false, "wrong": ["Японие", "Японию", "Япония"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Герма́ния", "nomP": "Германия", "ko": "독일", "koLoc": "독일", "prep": "в", "form": "Герма́нии", "formP": "Германии", "cat": "in_country", "fr": "pii", "fleet": false, "wrong": ["Германие", "Германию", "Германия"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Ита́лия", "nomP": "Италия", "ko": "이탈리아", "koLoc": "이탈리아", "prep": "в", "form": "Ита́лии", "formP": "Италии", "cat": "in_country", "fr": "pii", "fleet": false, "wrong": ["Италие", "Италию", "Италия"], "frames": ["live", "rest"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "холоди́льник", "nomP": "холодильник", "ko": "냉장고", "koLoc": "냉장고", "prep": "в", "form": "холоди́льнике", "formP": "холодильнике", "cat": "in_thing", "fr": "pe", "fleet": false, "wrong": ["холодильник", "холодильнику", "холодильника"], "frames": ["food"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "су́мка", "nomP": "сумка", "ko": "가방", "koLoc": "가방", "prep": "в", "form": "су́мке", "formP": "сумке", "cat": "in_thing", "fr": "pe", "fleet": false, "wrong": ["сумка", "сумку", "сумки"], "frames": ["small"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "кни́га", "nomP": "книга", "ko": "책", "koLoc": "책", "prep": "в", "form": "кни́ге", "formP": "книге", "cat": "in_text", "fr": "pe", "fleet": false, "wrong": ["книга", "книгу", "книги"], "frames": ["text"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "тетра́дь", "nomP": "тетрадь", "ko": "공책", "koLoc": "공책", "prep": "в", "form": "тетра́ди", "formP": "тетради", "cat": "in_text", "fr": "pif", "fleet": false, "wrong": ["тетраде", "тетрадь", "тетрадью"], "frames": ["text"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "письмо́", "nomP": "письмо", "ko": "편지", "koLoc": "편지", "prep": "в", "form": "письме́", "formP": "письме", "cat": "in_text", "fr": "pe", "fleet": false, "wrong": ["письмо", "письму", "письма"], "frames": ["text"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "рабо́та", "nomP": "работа", "ko": "직장", "koLoc": "직장", "prep": "на", "form": "рабо́те", "formP": "работе", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["работа", "работу", "работы"], "frames": ["be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ры́нок", "nomP": "рынок", "ko": "시장", "koLoc": "시장", "prep": "на", "form": "ры́нке", "formP": "рынке", "cat": "on_open", "fr": "pe", "fleet": true, "wrong": ["рыноке", "рынок", "рынку"], "frames": ["work"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ста́нция", "nomP": "станция", "ko": "역", "koLoc": "역", "prep": "на", "form": "ста́нции", "formP": "станции", "cat": "on_open", "fr": "pii", "fleet": false, "wrong": ["станцие", "станцию", "станция"], "frames": ["be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ку́хня", "nomP": "кухня", "ko": "부엌", "koLoc": "부엌", "prep": "на", "form": "ку́хне", "formP": "кухне", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["кухня", "кухню", "кухни"], "frames": ["eat", "be"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "экску́рсия", "nomP": "экскурсия", "ko": "견학", "koLoc": "견학", "prep": "на", "form": "экску́рсии", "formP": "экскурсии", "cat": "on_event", "fr": "pii", "fleet": false, "wrong": ["экскурсие", "экскурсию", "экскурсия"], "frames": ["event"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "вы́ставка", "nomP": "выставка", "ko": "전시회", "koLoc": "전시회", "prep": "на", "form": "вы́ставке", "formP": "выставке", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["выставка", "выставку", "выставки"], "frames": ["event"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "заня́тие", "nomP": "занятие", "ko": "수업(교습)", "koLoc": "수업", "prep": "на", "form": "заня́тии", "formP": "занятии", "cat": "on_event", "fr": "pii", "fleet": false, "wrong": ["занятия", "занятию", "занятие"], "frames": ["event"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "экза́мен", "nomP": "экзамен", "ko": "시험", "koLoc": "시험", "prep": "на", "form": "экза́мене", "formP": "экзамене", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["экзамен", "экзамену", "экзамена"], "frames": ["event"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "стена́", "nomP": "стена", "ko": "벽", "koLoc": "벽", "prep": "на", "form": "стене́", "formP": "стене", "cat": "on_surf", "fr": "pe", "fleet": false, "wrong": ["стена", "стену", "стены"], "frames": ["wall"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "стул", "nomP": "стул", "ko": "의자", "koLoc": "의자", "prep": "на", "form": "сту́ле", "formP": "стуле", "cat": "on_surf", "fr": "pe", "fleet": false, "wrong": ["стул", "стулу", "стула"], "frames": ["big"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "дива́н", "nomP": "диван", "ko": "소파", "koLoc": "소파", "prep": "на", "form": "дива́не", "formP": "диване", "cat": "on_surf", "fr": "pe", "fleet": false, "wrong": ["диван", "дивану", "дивана"], "frames": ["big"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "крова́ть", "nomP": "кровать", "ko": "침대", "koLoc": "침대", "prep": "на", "form": "крова́ти", "formP": "кровати", "cat": "on_surf", "fr": "pif", "fleet": false, "wrong": ["кровате", "кровать", "кроватью"], "frames": ["big"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "се́вер", "nomP": "север", "ko": "북쪽", "koLoc": "북쪽", "prep": "на", "form": "се́вере", "formP": "севере", "cat": "on_dir", "fr": "pe", "fleet": false, "wrong": ["север", "северу", "севера"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "юг", "nomP": "юг", "ko": "남쪽", "koLoc": "남쪽", "prep": "на", "form": "ю́ге", "formP": "юге", "cat": "on_dir", "fr": "pe", "fleet": false, "wrong": ["юг", "югу", "юга"], "frames": ["live", "rest"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "за́пад", "nomP": "запад", "ko": "서쪽", "koLoc": "서쪽", "prep": "на", "form": "за́паде", "formP": "западе", "cat": "on_dir", "fr": "pe", "fleet": false, "wrong": ["запад", "западу", "запада"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Ура́л", "nomP": "Урал", "ko": "우랄 지역", "koLoc": "우랄 지역", "prep": "на", "form": "Ура́ле", "formP": "Урале", "cat": "on_mount", "fr": "pe", "fleet": false, "wrong": ["Урал", "Уралу", "Урала"], "frames": ["live"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Кавка́з", "nomP": "Кавказ", "ko": "캅카스 지역", "koLoc": "캅카스 지역", "prep": "на", "form": "Кавка́зе", "formP": "Кавказе", "cat": "on_mount", "fr": "pe", "fleet": false, "wrong": ["Кавказ", "Кавказу", "Кавказа"], "frames": ["live", "rest"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Во́лга", "nomP": "Волга", "ko": "볼가강", "koLoc": "볼가 강가", "prep": "на", "form": "Во́лге", "formP": "Волге", "cat": "on_water", "fr": "pe", "fleet": false, "wrong": ["Волга", "Волгу", "Волги"], "frames": ["live", "rest"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "да́ча", "nomP": "дача", "ko": "별장(다차)", "koLoc": "별장", "prep": "на", "form": "да́че", "formP": "даче", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["дача", "дачу", "дачи"], "frames": ["rest", "eat"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Крым", "nomP": "Крым", "ko": "크림반도", "koLoc": "크림반도", "prep": "в", "form": "Крыму́", "formP": "Крыму", "cat": "in_country", "fr": "pu", "fleet": false, "wrong": ["Крыме", "Крым", "Крыма"], "frames": ["live", "rest"], "note": "반도지만 на가 아니라 в를 써요: в Крыму́.", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "порт", "nomP": "порт", "ko": "항구", "koLoc": "항구", "prep": "в", "form": "порту́", "formP": "порту", "cat": "in_bld", "fr": "pu", "fleet": false, "wrong": ["порте", "порт", "порта"], "frames": ["work"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "снег", "nomP": "снег", "ko": "눈(雪)", "koLoc": "눈 속", "prep": "в", "form": "снегу́", "formP": "снегу", "cat": "in_nature", "fr": "pu", "fleet": false, "wrong": ["снеге", "снег", "снега"], "frames": ["snow"], "note": "", "lvl": "intermediate"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "конфере́нция", "nomP": "конференция", "ko": "학회", "koLoc": "학회", "prep": "на", "form": "конфере́нции", "formP": "конференции", "cat": "on_event", "fr": "pii", "fleet": false, "wrong": ["конференцие", "конференцию", "конференция"], "frames": ["event"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "собра́ние", "nomP": "собрание", "ko": "회의", "koLoc": "회의", "prep": "на", "form": "собра́нии", "formP": "собрании", "cat": "on_event", "fr": "pii", "fleet": false, "wrong": ["собрания", "собранию", "собрание"], "frames": ["event"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "семина́р", "nomP": "семинар", "ko": "세미나", "koLoc": "세미나", "prep": "на", "form": "семина́ре", "formP": "семинаре", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["семинар", "семинару", "семинара"], "frames": ["event"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "факульте́т", "nomP": "факультет", "ko": "단과대학", "koLoc": "단과대학", "prep": "на", "form": "факульте́те", "formP": "факультете", "cat": "on_work", "fr": "pe", "fleet": false, "wrong": ["факультет", "факультету", "факультета"], "frames": ["study", "work"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ка́федра", "nomP": "кафедра", "ko": "학과", "koLoc": "학과", "prep": "на", "form": "ка́федре", "formP": "кафедре", "cat": "on_work", "fr": "pe", "fleet": false, "wrong": ["кафедра", "кафедру", "кафедры"], "frames": ["work"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "фе́рма", "nomP": "ферма", "ko": "농장", "koLoc": "농장", "prep": "на", "form": "фе́рме", "formP": "ферме", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["ферма", "ферму", "фермы"], "frames": ["work"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "тепли́ца", "nomP": "теплица", "ko": "온실", "koLoc": "온실", "prep": "в", "form": "тепли́це", "formP": "теплице", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["теплица", "теплицу", "теплицы"], "frames": ["work"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "аспиранту́ра", "nomP": "аспирантура", "ko": "박사과정(대학원)", "koLoc": "박사과정", "prep": "в", "form": "аспиранту́ре", "formP": "аспирантуре", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["аспирантура", "аспирантуру", "аспирантуры"], "frames": ["study"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "магистрату́ра", "nomP": "магистратура", "ko": "석사과정", "koLoc": "석사과정", "prep": "в", "form": "магистрату́ре", "formP": "магистратуре", "cat": "in_bld", "fr": "pe", "fleet": false, "wrong": ["магистратура", "магистратуру", "магистратуры"], "frames": ["study"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "спекта́кль", "nomP": "спектакль", "ko": "공연(연극)", "koLoc": "공연", "prep": "на", "form": "спекта́кле", "formP": "спектакле", "cat": "on_event", "fr": "pe", "fleet": false, "wrong": ["спектакль", "спектаклю", "спектакля"], "frames": ["event"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "ро́дина", "nomP": "родина", "ko": "고향, 조국", "koLoc": "고향", "prep": "на", "form": "ро́дине", "formP": "родине", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["родина", "родину", "родины"], "frames": ["live"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Сиби́рь", "nomP": "Сибирь", "ko": "시베리아", "koLoc": "시베리아", "prep": "в", "form": "Сиби́ри", "formP": "Сибири", "cat": "in_country", "fr": "pif", "fleet": false, "wrong": ["Сибире", "Сибирь", "Сибирью"], "frames": ["live"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Кипр", "nomP": "Кипр", "ko": "키프로스섬", "koLoc": "키프로스섬", "prep": "на", "form": "Ки́пре", "formP": "Кипре", "cat": "on_island", "fr": "pe", "fleet": false, "wrong": ["Кипр", "Кипру", "Кипра"], "frames": ["live", "rest"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "Аля́ска", "nomP": "Аляска", "ko": "알래스카", "koLoc": "알래스카", "prep": "на", "form": "Аля́ске", "formP": "Аляске", "cat": "on_island", "fr": "pe", "fleet": false, "wrong": ["Аляска", "Аляску", "Аляски"], "frames": ["live"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "фа́брика", "nomP": "фабрика", "ko": "공장(경공업)", "koLoc": "공장", "prep": "на", "form": "фа́брике", "formP": "фабрике", "cat": "on_open", "fr": "pe", "fleet": false, "wrong": ["фабрика", "фабрику", "фабрики"], "frames": ["work"], "note": "", "lvl": "advanced"}, {"kind": "loc", "popts": ["в", "на"], "exc": "", "koT": "", "nom": "лёд", "nomP": "лёд", "ko": "얼음", "koLoc": "얼음", "prep": "на", "form": "льду", "formP": "льду", "cat": "on_surf", "fr": "pu", "fleet": true, "wrong": ["лёде", "льде", "лёд"], "frames": ["big"], "note": "", "lvl": "advanced"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "ма́ма", "nomP": "мама", "ko": "엄마", "koLoc": "엄마", "prep": "о", "form": "ма́ме", "formP": "маме", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["мама", "маму", "мамы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "па́па", "nomP": "папа", "ko": "아빠", "koLoc": "아빠", "prep": "о", "form": "па́пе", "formP": "папе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["папа", "папу", "папы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "брат", "nomP": "брат", "ko": "형", "koLoc": "형", "prep": "о", "form": "бра́те", "formP": "брате", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["брат", "брату", "брата"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "сестра́", "nomP": "сестра", "ko": "누나", "koLoc": "누나", "prep": "о", "form": "сестре́", "formP": "сестре", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["сестра", "сестру", "сестры"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "друг", "nomP": "друг", "ko": "친구", "koLoc": "친구", "prep": "о", "form": "дру́ге", "formP": "друге", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["друг", "другу", "друга"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "семья́", "nomP": "семья", "ko": "가족", "koLoc": "가족", "prep": "о", "form": "семье́", "formP": "семье", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["семья", "семью", "семьи"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "рабо́та", "nomP": "работа", "ko": "일, 직장", "koLoc": "일", "prep": "о", "form": "рабо́те", "formP": "работе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["работа", "работу", "работы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "шко́ла", "nomP": "школа", "ko": "학교", "koLoc": "학교", "prep": "о", "form": "шко́ле", "formP": "школе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["школа", "школу", "школы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "университе́т", "nomP": "университет", "ko": "대학", "koLoc": "대학", "prep": "об", "form": "университе́те", "formP": "университете", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["университет", "университету", "университета"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "А́нна", "nomP": "Анна", "ko": "안나", "koLoc": "안나", "prep": "об", "form": "А́нне", "formP": "Анне", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Анна", "Анну", "Анны"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Анто́н", "nomP": "Антон", "ko": "안톤", "koLoc": "안톤", "prep": "об", "form": "Анто́не", "formP": "Антоне", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Антон", "Антону", "Антона"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Ива́н", "nomP": "Иван", "ko": "이반", "koLoc": "이반", "prep": "об", "form": "Ива́не", "formP": "Иване", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Иван", "Ивану", "Ивана"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Ни́на", "nomP": "Нина", "ko": "니나", "koLoc": "니나", "prep": "о", "form": "Ни́не", "formP": "Нине", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Нина", "Нину", "Нины"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "уро́к", "nomP": "урок", "ko": "수업", "koLoc": "수업", "prep": "об", "form": "уро́ке", "formP": "уроке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["урок", "уроку", "урока"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "о́пера", "nomP": "опера", "ko": "오페라", "koLoc": "오페라", "prep": "об", "form": "о́пере", "formP": "опере", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["опера", "оперу", "оперы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "учи́тель", "nomP": "учитель", "ko": "선생님", "koLoc": "선생님", "prep": "об", "form": "учи́теле", "formP": "учителе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["учитель", "учителю", "учителя"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "институ́т", "nomP": "институт", "ko": "연구소", "koLoc": "연구소", "prep": "об", "form": "институ́те", "formP": "институте", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["институт", "институту", "института"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Москва́", "nomP": "Москва", "ko": "모스크바", "koLoc": "모스크바", "prep": "о", "form": "Москве́", "formP": "Москве", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Москва", "Москву", "Москвы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Росси́я", "nomP": "Россия", "ko": "러시아", "koLoc": "러시아", "prep": "о", "form": "Росси́и", "formP": "России", "cat": "about", "fr": "pii", "fleet": false, "wrong": ["Россие", "Россию", "Россия"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Коре́я", "nomP": "Корея", "ko": "한국", "koLoc": "한국", "prep": "о", "form": "Коре́е", "formP": "Корее", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Корея", "Корею", "Кореи"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Евро́па", "nomP": "Европа", "ko": "유럽", "koLoc": "유럽", "prep": "о", "form": "Евро́пе", "formP": "Европе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Европа", "Европу", "Европы"], "frames": ["about"], "note": "Е는 ‘йе’ 소리로 시작해서, 모음 글자라도 об가 아니라 о를 써요.", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "Аме́рика", "nomP": "Америка", "ko": "미국", "koLoc": "미국", "prep": "об", "form": "Аме́рике", "formP": "Америке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["Америка", "Америку", "Америки"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "фильм", "nomP": "фильм", "ko": "영화", "koLoc": "영화", "prep": "о", "form": "фи́льме", "formP": "фильме", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["фильм", "фильму", "фильма"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "кни́га", "nomP": "книга", "ko": "책", "koLoc": "책", "prep": "о", "form": "кни́ге", "formP": "книге", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["книга", "книгу", "книги"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "му́зыка", "nomP": "музыка", "ko": "음악", "koLoc": "음악", "prep": "о", "form": "му́зыке", "formP": "музыке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["музыка", "музыку", "музыки"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "письмо́", "nomP": "письмо", "ko": "편지", "koLoc": "편지", "prep": "о", "form": "письме́", "formP": "письме", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["письмо", "письму", "письма"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "дом", "nomP": "дом", "ko": "집", "koLoc": "집", "prep": "о", "form": "до́ме", "formP": "доме", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["дом", "дому", "дома"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "го́род", "nomP": "город", "ko": "도시", "koLoc": "도시", "prep": "о", "form": "го́роде", "formP": "городе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["город", "городу", "города"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "예외 · -ер- 삽입", "koT": "", "nom": "мать", "nomP": "мать", "ko": "어머니", "koLoc": "어머니", "prep": "о", "form": "ма́тери", "formP": "матери", "cat": "about", "fr": "pexc", "fleet": false, "wrong": ["мати", "мате", "мать"], "frames": ["about"], "note": "мать는 전치격에서 -ер-가 들어가요. (мать → о ма́тери)", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "예외 · -ер- 삽입", "koT": "", "nom": "дочь", "nomP": "дочь", "ko": "딸", "koLoc": "딸", "prep": "о", "form": "до́чери", "formP": "дочери", "cat": "about", "fr": "pexc", "fleet": false, "wrong": ["дочи", "доче", "дочь"], "frames": ["about"], "note": "дочь는 전치격에서 -ер-가 들어가요. (дочь → о до́чери)", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "ребёнок", "nomP": "ребёнок", "ko": "아기", "koLoc": "아기", "prep": "о", "form": "ребёнке", "formP": "ребёнке", "cat": "about", "fr": "pe", "fleet": true, "wrong": ["ребёноке", "ребёнок", "ребёнку"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "студе́нт", "nomP": "студент", "ko": "대학생", "koLoc": "대학생", "prep": "о", "form": "студе́нте", "formP": "студенте", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["студент", "студенту", "студента"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "исто́рия", "nomP": "история", "ko": "역사, 이야기", "koLoc": "역사", "prep": "об", "form": "исто́рии", "formP": "истории", "cat": "about", "fr": "pii", "fleet": false, "wrong": ["историе", "историю", "история"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "예외 · -мя → -мени", "koT": "", "nom": "и́мя", "nomP": "имя", "ko": "이름", "koLoc": "이름", "prep": "об", "form": "и́мени", "formP": "имени", "cat": "about", "fr": "pexc", "fleet": false, "wrong": ["име", "имя", "имене"], "frames": ["about"], "note": "-мя로 끝나는 중성명사는 전치격에서 -мени가 돼요. (и́мя → об и́мени)", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "упражне́ние", "nomP": "упражнение", "ko": "연습 문제", "koLoc": "연습 문제", "prep": "об", "form": "упражне́нии", "formP": "упражнении", "cat": "about", "fr": "pii", "fleet": false, "wrong": ["упражнения", "упражнению", "упражнение"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "окно́", "nomP": "окно", "ko": "창문", "koLoc": "창문", "prep": "об", "form": "окне́", "formP": "окне", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["окно", "окну", "окна"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "экза́мен", "nomP": "экзамен", "ko": "시험", "koLoc": "시험", "prep": "об", "form": "экза́мене", "formP": "экзамене", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["экзамен", "экзамену", "экзамена"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "уче́бник", "nomP": "учебник", "ko": "교과서", "koLoc": "교과서", "prep": "об", "form": "уче́бнике", "formP": "учебнике", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["учебник", "учебнику", "учебника"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "литерату́ра", "nomP": "литература", "ko": "문학", "koLoc": "문학", "prep": "о", "form": "литерату́ре", "formP": "литературе", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["литература", "литературу", "литературы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "стихотворе́ние", "nomP": "стихотворение", "ko": "시", "koLoc": "시", "prep": "о", "form": "стихотворе́нии", "formP": "стихотворении", "cat": "about", "fr": "pii", "fleet": false, "wrong": ["стихотворения", "стихотворению", "стихотворение"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "руба́шка", "nomP": "рубашка", "ko": "셔츠", "koLoc": "셔츠", "prep": "о", "form": "руба́шке", "formP": "рубашке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["рубашка", "рубашку", "рубашки"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "пла́тье", "nomP": "платье", "ko": "원피스", "koLoc": "원피스", "prep": "о", "form": "пла́тье", "formP": "платье", "cat": "about", "fr": "psame", "fleet": false, "wrong": ["платья", "платью", "платьи"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "костю́м", "nomP": "костюм", "ko": "정장", "koLoc": "정장", "prep": "о", "form": "костю́ме", "formP": "костюме", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["костюм", "костюму", "костюма"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "де́вочка", "nomP": "девочка", "ko": "소녀", "koLoc": "소녀", "prep": "о", "form": "де́вочке", "formP": "девочке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["девочка", "девочку", "девочки"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "челове́к", "nomP": "человек", "ko": "사람", "koLoc": "사람", "prep": "о", "form": "челове́ке", "formP": "человеке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["человек", "человеку", "человека"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "ба́бушка", "nomP": "бабушка", "ko": "할머니", "koLoc": "할머니", "prep": "о", "form": "ба́бушке", "formP": "бабушке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["бабушка", "бабушку", "бабушки"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": true, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "де́душка", "nomP": "дедушка", "ko": "할아버지", "koLoc": "할아버지", "prep": "о", "form": "де́душке", "formP": "дедушке", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["дедушка", "дедушку", "дедушки"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "газе́та", "nomP": "газета", "ko": "신문", "koLoc": "신문", "prep": "о", "form": "газе́те", "formP": "газете", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["газета", "газету", "газеты"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"anim": false, "kind": "about", "popts": ["о", "об"], "exc": "", "koT": "", "nom": "слова́рь", "nomP": "словарь", "ko": "사전", "koLoc": "사전", "prep": "о", "form": "словаре́", "formP": "словаре", "cat": "about", "fr": "pe", "fleet": false, "wrong": ["словарь", "словарю", "словаря"], "frames": ["about"], "note": "강세가 어미로 옮겨 가요. (слова́рь → о словаре́)", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "예외 · обо мне́", "koT": "", "pidx": 0, "nom": "я", "nomP": "я", "ko": "나", "koLoc": "나", "prep": "обо", "form": "мне", "formP": "мне", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["меня", "я", "мной"], "frames": ["about"], "note": "‘나에 대해’만 특별히 обо мне́라고 해요. (о мне는 발음하기 불편해서 о에 о가 하나 더 붙어요)", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 1, "nom": "ты", "nomP": "ты", "ko": "너", "koLoc": "너", "prep": "о", "form": "тебе́", "formP": "тебе", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["тебя", "ты", "тобой"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 2, "nom": "он", "nomP": "он", "ko": "그", "koLoc": "그", "prep": "о", "form": "нём", "formP": "нём", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["него", "его", "ним"], "frames": ["about"], "note": "он은 전치사 뒤에서 앞에 н이 붙어 нём이 돼요.", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 3, "nom": "она", "nomP": "она", "ko": "그녀", "koLoc": "그녀", "prep": "о", "form": "ней", "formP": "ней", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["неё", "её", "она"], "frames": ["about"], "note": "она는 전치사 뒤에서 앞에 н이 붙어 ней가 돼요.", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 4, "nom": "мы", "nomP": "мы", "ko": "우리", "koLoc": "우리", "prep": "о", "form": "нас", "formP": "нас", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["нам", "нами", "мы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 5, "nom": "вы", "nomP": "вы", "ko": "당신", "koLoc": "당신", "prep": "о", "form": "вас", "formP": "вас", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["вам", "вами", "вы"], "frames": ["about"], "note": "", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 6, "nom": "они", "nomP": "они", "ko": "그들", "koLoc": "그들", "prep": "о", "form": "них", "formP": "них", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["их", "ними", "они"], "frames": ["about"], "note": "они는 전치사 뒤에서 앞에 н이 붙어 них가 돼요.", "lvl": "beginner"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "예외 · обо мне́", "koT": "", "pidx": 0, "nom": "я", "nomP": "я", "ko": "나", "koLoc": "나", "prep": "обо", "form": "мне", "formP": "мне", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["меня", "я", "мной"], "frames": ["about"], "note": "‘나에 대해’만 특별히 обо мне́라고 해요. (о мне는 발음하기 불편해서 о에 о가 하나 더 붙어요)", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 1, "nom": "ты", "nomP": "ты", "ko": "너", "koLoc": "너", "prep": "о", "form": "тебе́", "formP": "тебе", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["тебя", "ты", "тобой"], "frames": ["about"], "note": "", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 2, "nom": "он", "nomP": "он", "ko": "그", "koLoc": "그", "prep": "о", "form": "нём", "formP": "нём", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["него", "его", "ним"], "frames": ["about"], "note": "он은 전치사 뒤에서 앞에 н이 붙어 нём이 돼요.", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 3, "nom": "она", "nomP": "она", "ko": "그녀", "koLoc": "그녀", "prep": "о", "form": "ней", "formP": "ней", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["неё", "её", "она"], "frames": ["about"], "note": "она는 전치사 뒤에서 앞에 н이 붙어 ней가 돼요.", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 4, "nom": "мы", "nomP": "мы", "ko": "우리", "koLoc": "우리", "prep": "о", "form": "нас", "formP": "нас", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["нам", "нами", "мы"], "frames": ["about"], "note": "", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 5, "nom": "вы", "nomP": "вы", "ko": "당신", "koLoc": "당신", "prep": "о", "form": "вас", "formP": "вас", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["вам", "вами", "вы"], "frames": ["about"], "note": "", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 6, "nom": "они", "nomP": "они", "ko": "그들", "koLoc": "그들", "prep": "о", "form": "них", "formP": "них", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["их", "ними", "они"], "frames": ["about"], "note": "они는 전치사 뒤에서 앞에 н이 붙어 них가 돼요.", "lvl": "intermediate"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "예외 · обо мне́", "koT": "", "pidx": 0, "nom": "я", "nomP": "я", "ko": "나", "koLoc": "나", "prep": "обо", "form": "мне", "formP": "мне", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["меня", "я", "мной"], "frames": ["about"], "note": "‘나에 대해’만 특별히 обо мне́라고 해요. (о мне는 발음하기 불편해서 о에 о가 하나 더 붙어요)", "lvl": "advanced"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 1, "nom": "ты", "nomP": "ты", "ko": "너", "koLoc": "너", "prep": "о", "form": "тебе́", "formP": "тебе", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["тебя", "ты", "тобой"], "frames": ["about"], "note": "", "lvl": "advanced"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 2, "nom": "он", "nomP": "он", "ko": "그", "koLoc": "그", "prep": "о", "form": "нём", "formP": "нём", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["него", "его", "ним"], "frames": ["about"], "note": "он은 전치사 뒤에서 앞에 н이 붙어 нём이 돼요.", "lvl": "advanced"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 3, "nom": "она", "nomP": "она", "ko": "그녀", "koLoc": "그녀", "prep": "о", "form": "ней", "formP": "ней", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["неё", "её", "она"], "frames": ["about"], "note": "она는 전치사 뒤에서 앞에 н이 붙어 ней가 돼요.", "lvl": "advanced"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 4, "nom": "мы", "nomP": "мы", "ko": "우리", "koLoc": "우리", "prep": "о", "form": "нас", "formP": "нас", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["нам", "нами", "мы"], "frames": ["about"], "note": "", "lvl": "advanced"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 5, "nom": "вы", "nomP": "вы", "ko": "당신", "koLoc": "당신", "prep": "о", "form": "вас", "formP": "вас", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["вам", "вами", "вы"], "frames": ["about"], "note": "", "lvl": "advanced"}, {"kind": "pron", "popts": ["о", "об", "обо"], "exc": "", "koT": "", "pidx": 6, "nom": "они", "nomP": "они", "ko": "그들", "koLoc": "그들", "prep": "о", "form": "них", "formP": "них", "cat": "about", "fr": "ppron", "fleet": false, "wrong": ["их", "ними", "они"], "frames": ["about"], "note": "они는 전치사 뒤에서 앞에 н이 붙어 них가 돼요.", "lvl": "advanced"}], "frames": {"work": [["А́нна рабо́тает", "안나는", "{L}에서 일해요", -1], ["Па́па рабо́тает", "아빠는", "{L}에서 일해요", -1], ["Мы рабо́таем", "우리는", "{L}에서 일해요", -1]], "study": [["Брат у́чится", "형은", "{L}에서 공부해요", -1], ["Студе́нты у́чатся", "학생들은", "{L}에서 공부해요", -1], ["Я учу́сь", "나는", "{L}에서 공부해요", -1]], "eat": [["Мы обе́даем", "우리는", "{L}에서 점심을 먹어요", -1], ["Они́ у́жинают", "그들은", "{L}에서 저녁을 먹어요", -1], ["Я за́втракаю", "나는", "{L}에서 아침을 먹어요", -1]], "walk": [["Де́ти гуля́ют", "아이들은", "{L}에서 산책해요", -1], ["Мы гуля́ем", "우리는", "{L}에서 산책해요", -1]], "live": [["Мы живём", "우리는", "{L}에 살아요", -1], ["Оле́г живёт", "올레그는", "{L}에 살아요", -1], ["Они́ живу́т", "그들은", "{L}에 살아요", -1]], "rest": [["Они́ отдыха́ют", "그들은", "{L}에서 쉬어요", -1], ["Мы отдыха́ем", "우리는", "{L}에서 쉬어요", -1]], "event": [["Студе́нты сейча́с", "학생들은 지금", "{L}에 와 있어요", -1], ["Ни́на сейча́с", "니나는 지금", "{L}에 와 있어요", -1]], "be": [["Ни́на сейча́с", "니나는 지금", "{L}에 있어요", -1], ["Па́па сейча́с", "아빠는 지금", "{L}에 있어요", -1]], "small": [["Ключ", "열쇠는", "{T}", -1], ["Телефо́н", "전화기는", "{T}", -1], ["Ру́чка", "펜은", "{T}", -1]], "big": [["Ко́шка", "고양이는", "{T}", -1], ["Соба́ка", "개는", "{T}", -1]], "food": [["Суп", "수프는", "{T}", -1], ["Торт", "케이크는", "{T}", -1]], "lib": [["Студе́нты занима́ются", "학생들은", "{L}에서 공부해요", -1], ["Я чита́ю", "나는", "{L}에서 책을 읽어요", -1]], "text": [["Отве́т", "정답은", "{L}에 있어요", -1], ["Э́то сло́во", "이 단어는", "{L}에 있어요", -1]], "wall": [["Ка́рта", "지도는", "{L}에 걸려 있어요", -1], ["Фо́то", "사진은", "{L}에 걸려 있어요", -1]], "snow": [["Соба́ка", "개는", "{L}에 있어요", -1], ["Ключ", "열쇠는", "{L}에 있어요", -1]], "about": [["Мы говори́м", "우리는", "{L}에 대해 이야기해요", 4, "вы говори́те", "너희는", "{Q} 이야기해요"], ["Я ду́маю", "나는", "{L}에 대해 생각해요", 0, "ты ду́маешь", "너는", "{Q} 생각해요"], ["Он чита́ет", "그는", "{L}에 대해 읽어요", 2, "он чита́ет", "그는", "{Q} 읽어요"], ["Она́ пи́шет", "그녀는", "{L}에 대해 써요", 3, "она́ пи́шет", "그녀는", "{Q} 써요"], ["Студе́нты спра́шивают", "학생들은", "{L}에 대해 물어봐요", -1, "студе́нты спра́шивают", "학생들은", "{Q} 물어봐요"], ["Ма́ма говори́т", "엄마는", "{L}에 대해 이야기해요", -1, "ма́ма говори́т", "엄마는", "{Q} 이야기해요"]]}};
const PERS = [["я","나는"],["ты","너는"],["он","그는"],["она","그녀는"],["мы","우리는"],["вы","당신은"],["они","그들은"]];
const PIDX = [0,1,2,2,3,4,5];
const PGRP = [1,2,3,3,1,2,3];
const PROW = ["я","ты","он / она","мы","вы","они"];
const NUM = ["①","②","③"];
const LV = { beginner:"초급", intermediate:"중급", advanced:"고급" };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const pick1 = a => a[Math.floor(Math.random()*a.length)];

/* 공통으로 갈린 부분에 밑줄 표시 (base는 강세 없는 기준형) */
function hlFrom(basePlain, stressed){
  const t = stressed.match(/.\u0301?/gu), p = stressed.replace(/\u0301/g,"");
  let i=0; while(i<basePlain.length && i<p.length && basePlain[i].toLowerCase()===p[i].toLowerCase()) i++;
  if(i>=t.length) return stressed;
  if(i===0) return `<mark>${stressed}</mark>`;
  return t.slice(0,i).join("") + `<mark>${t.slice(i).join("")}</mark>`;
}
const badge = t => `<span class="exc">${t}</span>`;

/* ---------- 문항 파트 ---------- */
function meanPart(ko, pool, s){
  const mine = variants(ko);
  const clash = x => [...variants(x)].some(v => mine.has(v));
  const others = shuffle([...new Set(pool.filter(x => x!==ko && !clash(x)))]).slice(0,3);
  return { key:"m", title:"뜻은?", short:"뜻", type: s.ans==="text" ? "text" : "mc",
           opts: shuffle([ko, ...others]), ans:ko, cyr:false, val:null, pick:null, typed:"", gaveUp:false, overridden:false };
}
function pickPart(key, title, short, opts, ans, cyr, fixed){
  return { key, title, short, type: opts.length===2 ? "two" : "mc", opts: fixed ? opts : shuffle(opts), ans, cyr, val:null, pick:null };
}

/* ================= 1) 복수형 ================= */
const MPL = {
  tab:"복수형", h1:"복수형 퀴즈", ru:"множественное число", unit:"단어",
  lead:"러시아어 단어를 보고 뜻과 복수형을 맞혀 보세요.",
  levels(){ return Object.fromEntries(Object.entries(DATA).map(([k,d]) => [k,{label:d.label, desc:d.desc, items:d.words}])); },
  segs(){ return [
    ["game","게임 종류",[["both","뜻 + 복수형 같이"],["meaning","뜻만 맞히기"]]],
    ["ans","뜻 답하는 방식",[["mc","객관식 (4지선다)"],["text","주관식 (직접 입력)"]]]
  ]; },
  summary: s => `${s.game==="both" ? "뜻 + 복수형" : "뜻만"} · 뜻 ${s.ans==="text" ? "주관식" : "객관식"}`,
  build(w, pool, s){
    const parts = [meanPart(w.ko, pool.map(x => x.ko), s)];
    if(s.game==="both") parts.push(pickPart("p","복수형은?","복수형",[w.pl, ...w.wrong], w.pl, true));
    return { w, parts };
  },
  prompt: q => `<div class="word"><span class="w" lang="ru">${q.w.ruS}</span>${speakBtn(q.w.ruS,"발음 듣기")}</div>`,
  feedback: q => `
    <div class="pair" lang="ru"><span>${q.w.ruS}</span><span class="arr">→</span><span>${highlight(q.w)}</span>${speakBtn(q.w.plS,"복수형 발음 듣기")}</div>
    ${EXC[q.w.rule] ? `<div>${excBadge(q.w)}</div>` : ""}
    <p class="mean">${q.w.ko}</p>
    <div class="ext"><span lang="ru">${q.w.ruS}</span>${extLinks(q.w.ru)}</div>
    <div class="ext"><span lang="ru">${q.w.plS}</span>${extLinks(q.w.pl)}</div>
    <p class="rule">${RULES[q.w.rule]}</p>
    ${q.w.note ? `<p class="note">${q.w.note}</p>` : ""}`,
  itemKey: q => "pl:" + q.w.ru,
  wrongLine: q => ({ ru:`${q.w.ruS} → ${q.w.plS}${EXC[q.w.rule] ? `<br>${excBadge(q.w)}` : ""}`, ko:q.w.ko }),
  best:{ store:"ruPluralBest2", key: s => `${s.level}_${s.game}_${s.ans}` },
  rules: () => `<details class="rules"><summary>복수형 규칙 한눈에 보기</summary><ul>
      <li>${RULES.hard} <span class="cy">стол → столы</span></li>
      <li>${RULES.a} <span class="cy">мама → мамы</span></li>
      <li>${RULES.seven} <span class="cy">книга → книги</span></li>
      <li>${RULES.soft} <span class="cy">словарь → словари</span></li>
      <li>${RULES.o} <span class="cy">окно → окна</span></li>
      <li>${RULES.e} <span class="cy">море → моря</span></li>
      <li><span class="exc">예외</span>${RULES.stressA} <span class="cy">дом → дома</span></li>
      <li><span class="exc">예외</span>${RULES.fleet} <span class="cy">отец → отцы</span></li>
      <li><span class="exc">예외</span>${RULES.ya} <span class="cy">брат → братья</span></li>
      <li><span class="exc">예외</span>그 밖에 <span class="cy">мать → матери, имя → имена, человек → люди, яблоко → яблоки</span>처럼 규칙을 따르지 않는 단어는 답을 확인할 때 ‘예외 복수형’ 표시가 붙어요.</li>
    </ul></details>`
};

/* ================= 2) 동사 변화 (+대격 문장) ================= */
const VRULE = {
  c1:   "1식 (читать형) 동사예요. -ть를 떼고 <b class='cy'>-ю, -ешь, -ет, -ем, -ете, -ют</b>를 붙여요.",
  c1s:  "1식 + -ся(재귀) 동사예요. 1식 어미 뒤에 모음이면 <b class='cy'>-сь</b>, 자음이면 <b class='cy'>-ся</b>를 붙여요: <span class='cy'>-юсь, -ешься, -ется, -емся, -етесь, -ются</span>.",
  c2:   "2식 (говорить형) 동사예요. -ить / -еть / -ять를 떼고 <b class='cy'>-ю, -ишь, -ит, -им, -ите, -ят</b>를 붙여요.",
  c2sp: "2식 동사인데 <b class='cy'>ж · ш · ч · щ</b> 뒤라서 я는 <b class='cy'>-у</b>, они는 <b class='cy'>-ат</b>를 써요. (철자 규칙)",
  c2s:  "2식 + -ся(재귀) 동사예요. 2식 어미(-ю, -ишь, -ит …)를 붙인 뒤 끝에 <span class='cy'>-сь / -ся</span>를 붙여요.",
  c2l:  "2식 동사인데 <b>я 형태에만 л</b>이 들어가요. 어간이 <span class='cy'>б · в · м · п · ф</span>로 끝날 때 생겨요. (люблю́, гото́влю, сплю)",
  c2mut:"2식 동사인데 <b>я 형태에서만 자음이 바뀌어요</b>: <span class='cy'>д → ж, с → ш, т → ч, ст → щ</span>. (ви́жу, хожу́)",
  ova:  "-овать / -евать 동사는 <b class='cy'>-ова- / -ева-</b>가 <b class='cy'>-у-</b>로 바뀌고 1식 어미가 붙어요. (рисова́ть → рису́ю)",
  ava:  "-авать 동사는 <b class='cy'>-ва-</b>가 빠지고 강세 있는 어미 <span class='cy'>-ю́, -ёшь, -ёт …</span>가 붙어요. (дава́ть → даю́)",
  irr:  "불규칙 동사예요. 다만 대부분은 어간 모양만 바뀌고, 어미는 아래 ‘어미’ 설명처럼 규칙대로 붙어요."
};
const VEXC = { c2l:"예외 변화 · я에 л 삽입", c2mut:"예외 변화 · я에서 자음 교체", ova:"예외 변화 · -овать → -ую", ava:"예외 변화 · -авать → -аю", irr:"예외 변화 · 불규칙 동사" };
const ARULE = {
  fa:   "<b class='cy'>-а</b>로 끝나는 명사는 대격에서 <b class='cy'>-у</b>가 돼요.",
  fam:  "남성명사지만 <b class='cy'>-а</b>로 끝나서, 여성명사처럼 <b class='cy'>-а → -у</b>가 돼요.",
  fya:  "<b class='cy'>-я</b>로 끝나는 명사는 대격에서 <b class='cy'>-ю</b>가 돼요.",
  fsoft:"<b class='cy'>-ь</b>로 끝나는 여성명사는 대격이 주격과 똑같아요.",
  minan:"사물을 뜻하는 남성명사는 대격이 주격과 똑같아요.",
  neut: "중성명사는 대격이 주격과 똑같아요.",
  langnp:"‘~어(언어)’를 뜻하는 язы́к는 사물 남성명사라서 대격이 주격과 똑같아요: <span class='cy'>Я изуча́ю ру́сский язы́к.</span>",
  manim:"사람·동물을 뜻하는 남성명사는 대격에서 <b class='cy'>-а</b>가 붙어요. (-ь, -й로 끝나면 <b class='cy'>-я</b>)",
  pron: "인칭대명사의 대격은 모양이 완전히 바뀌어요: <span class='cy'>я → меня́, ты → тебя́, он → его́, она → её, мы → нас, вы → вас, они → их</span>"
};
const LRULE = "‘~어로, ~말로’는 <b class='cy'>по-</b> + 나라 이름 형용사에서 끝의 <b class='cy'>-й</b>를 뗀 형태예요: <span class='cy'>ру́сский → по-ру́сски</span>. 하이픈(-)을 꼭 넣어요. (говори́ть, понима́ть, чита́ть, писа́ть 뒤에 자주 와요)";
const AEXC = { manim:"예외 대격 · 살아 있는 남성명사", pron:"대명사 대격 · 통째로 외우기" };

function vObj(v, si, key){
  const k = key || pick1(v.objs);
  if(k!=="*"){ const o = V3.objs[k]; return { ...o, opts:[o.accP, ...o.wrong] }; }
  const ok = [0,1,2,3,4,5,6].filter(i => i!==si && (PGRP[si]===3 ? true : PGRP[i]!==PGRP[si]));
  const pr = V3.pron[pick1(ok)];
  const others = shuffle(V3.pron.filter(x => x.accP!==pr.accP).map(x => x.accP)).slice(0,3);
  return { nom:pr.subj, nomP:pr.subj, ko:pr.ko, kind:"pron", acc:pr.acc, accP:pr.accP, opts:[pr.accP, ...others], pt:pr.pt, note:"" };
}
const QW = { кого:"кого́", что:"что" };
const qRu = q => `${cap(q.anim ? "кого́" : "что")} ${PERS[q.sq][0]} ${q.v.forms[q.fq]}?`;
const qKo = q => { const w = q.anim ? "누구" : "무엇";
  return `${PERS[q.sq][1]} ${q.v.tr.replace("{o}", w).replace("{을}", josa(w,"을","를"))}?`; };
const QACC = "<b>кто / что의 대격</b>: 사람·동물을 물으면 <b class='cy'>кого́</b>, 사물을 물으면 <b class='cy'>что</b>예요. что는 대격도 주격과 똑같아요.";
function koSentence(q){
  const v = q.v, o = q.obj;
  if(q.lang) return `${PERS[q.si][1]} ${v.lt.replace("{L}", q.lang.ko)}.`;
  return `${PERS[q.si][1]} ${v.tr.replace("{o}", o.ko).replace("{을}", o.pt)}.`;
}
function ruSentence(q, mark){
  const f = q.v.forms[q.fi], o = q.obj;
  const vf = mark ? vHL(f) : f;
  if(q.lang) return `${cap(PERS[q.si][0])} ${vf} ${mark ? `<mark>${q.lang.adv}</mark>` : q.lang.adv}.`;
  const of = mark ? hlFrom(o.nomP, o.acc) : o.acc;
  return `${cap(PERS[q.si][0])} ${vf} ${of}.`;
}
/* 동사 인칭 어미만 표시 */
const VEND = /(ешься|ёшься|ишься|етесь|ётесь|итесь|ются|утся|ятся|атся|ется|ётся|ится|емся|ёмся|имся|юсь|усь|ешь|ёшь|ишь|ете|ёте|ите|ет|ёт|ит|ем|ём|им|ют|ут|ят|ат|ю|у)$/;
function vHL(f){
  const t = f.match(/.\u0301?/gu), m = f.replace(/\u0301/g,"").match(VEND);
  if(!m) return f;
  const k = t.length - m[1].length;
  return t.slice(0,k).join("") + `<mark>${t.slice(k).join("")}</mark>`;
}
function conjTable(v, fi){
  return `<table class="conj" lang="ru"><tbody>${v.forms.map((f,i) =>
    `<tr class="${i===fi ? "on" : ""}"><th>${PROW[i]}</th><td>${vHL(f)}</td></tr>`).join("")}</tbody></table>`;
}
const MVB = {
  tab:"동사", h1:"동사 변화 퀴즈", ru:"спряжение глаголов", unit: s => s.game==="sent" ? "문장" : "동사",
  lead:"주어에 맞는 동사 형태와 동사 뜻을 맞혀 보세요. ‘문장 + 대격’에서는 목적어 대격, ‘~어로(по-ру́сски)’, 의문사 кого́ / что 질문도 함께 연습해요.",
  levels(s){
    const desc = { beginner:"수업에서 배운 동사 전부 (1식 читать형 · 2식 говорить형 · 불규칙 · -ся)", intermediate:"2식 동사 (говорить형) · -ся 동사", advanced:"불규칙 · -овать · -авать 동사" };
    return Object.fromEntries(Object.keys(LV).map(k => [k,{ label:LV[k], desc:desc[k],
      items: s.game==="sent"
        ? V3.verbs.filter(v => v.lvl===k).flatMap(v => [
            ...v.objs.flatMap(ok => Array(ok==="*" ? 3 : 1).fill(0).map(() => ({ v, ok, ko:v.ko }))),
            ...(v.lt ? [0,1,2].map(() => ({ v, lang:true, ko:v.ko })) : []),
            ...(v.objs.some(k => k!=="*") ? [0,1].map(() => ({ v, qq:true, ko:v.ko })) : []) ])   /* 대답 문장 → 의문사(кого́ / что) 질문 */
        : V3.verbs.filter(v => v.lvl===k) }]));
  },
  segs(s){ return [
    ["game","게임 종류",[["both","뜻 + 변화형"],["form","변화형만"],["meaning","뜻만"],["sent","문장 + 대격"]]],
    ...(s.game==="both" || s.game==="meaning" ? [["ans","뜻 답하는 방식",[["mc","객관식 (4지선다)"],["text","주관식 (직접 입력)"]]]] : [])
  ]; },
  summary: s => ({both:"뜻 + 변화형", form:"변화형만", meaning:"뜻만", sent:"문장 + 대격"})[s.game] + (s.game==="both"||s.game==="meaning" ? ` · 뜻 ${s.ans==="text" ? "주관식" : "객관식"}` : ""),
  build(it, pool, s){
    const v = it.v || it;
    const si = v.only3 ? pick1([2,3,6]) : Math.floor(Math.random()*7), fi = PIDX[si];
    const others = v.only3   /* 3인칭 전용(-ся): 다른 수 + -ся 없는 형태를 보기로 */
      ? [v.formsP[fi===2 ? 5 : 2], v.formsP[2].replace(/ся$/,""), v.formsP[5].replace(/ся$/,"")]
      : shuffle([0,1,2,3,4,5].filter(i => i!==fi)).slice(0,3).map(i => v.formsP[i]);
    const fPart = (title, short) => pickPart("f", title, short, [v.formsP[fi], ...others], v.formsP[fi], true);
    if(s.game==="sent" && it.qq){
      const si = pick1([0,4,2,3,6]), sq = si===0 ? 1 : si===4 ? 5 : si, fq = PIDX[sq];
      const obj = vObj(v, si, pick1(v.objs));
      const anim = obj.kind==="pron" || !!obj.anim;
      const others = shuffle([0,1,2,3,4,5].filter(i => i!==fq)).slice(0,3).map(i => v.formsP[i]);
      const q = { v, si, fi:PIDX[si], sq, fq, obj, anim, qq:true, sent:true, parts:[] };
      q.parts.push(pickPart("w","의문사는?","의문사",["кого","что","кто","о ком"], anim ? "кого" : "что", true));
      q.parts.push(pickPart("f",`동사 형태는? <span class="cy">(${v.inf})</span>`,"동사",[v.formsP[fq], ...others], v.formsP[fq], true));
      return q;
    }
    if(s.game==="sent" && it.lang){
      const lg = pick1(V3.langs);
      const q = { v, si, fi, lang:lg, sent:true, parts:[] };
      q.parts.push(fPart(`동사 형태는? <span class="cy">(${v.inf})</span>`, "동사"));
      q.parts.push(pickPart("l", `‘${lg.ko}로’는?`, "~말로", [lg.advP, ...lg.wrong], lg.advP, true));
      return q;
    }
    if(s.game==="sent"){
      const q = { v, si, fi, obj:vObj(v, si, it.ok), sent:true, parts:[] };
      q.parts.push(fPart(`동사 형태는? <span class="cy">(${v.inf})</span>`, "동사"));
      q.parts.push(pickPart("o", `목적어 대격은? <span class="cy">(${q.obj.nom})</span>`, "대격", q.obj.opts, q.obj.accP, true));
      return q;
    }
    const parts = [];
    if(s.game!=="form") parts.push(meanPart(v.ko, pool.map(x => x.ko), s));
    if(s.game!=="meaning") parts.push(fPart(`<span class="cy subjt">${PERS[si][0]}</span> + 변화형은?`, "변화형"));
    return { v, si, fi, parts };
  },
  prompt(q){
    if(q.qq) return `<p class="hint">대답이 이 문장이 되도록 질문을 만들어 보세요</p><p class="answerline" lang="ru">${ruSentence(q,false)}</p>
      <p class="sent" lang="ru"><span class="slot"><span class="gap">?</span><small>의문사</small></span> ${PERS[q.sq][0]} <span class="slot"><span class="gap">?</span><small>${q.v.inf}</small></span>?</p>`;
    if(!q.sent) return `<div class="word"><span class="w" lang="ru">${q.v.inf}</span>${speakBtn(q.v.inf,"동사 원형 발음 듣기")}</div>`;
    return `<p class="sent" lang="ru">${cap(PERS[q.si][0])} <span class="slot"><span class="gap">?</span><small>${q.v.inf}</small></span> <span class="slot"><span class="gap">?</span><small>${q.lang ? `${q.lang.ko}로` : q.obj.nom}</small></span>.</p>`;
  },
  feedback(q){
    const v = q.v, f = v.forms[q.fi];
    const vb = VEXC[v.type] ? `<div>${badge(VEXC[v.type])}</div>` : "";
    const onlyMean = !q.parts.some(p => p.key==="f");
    if(!q.sent) return `
      ${onlyMean ? `<div class="pair" lang="ru"><span>${v.inf}</span>${speakBtn(v.inf,"동사 원형 발음 듣기")}</div>`
        : `<div class="pair" lang="ru"><span class="subjw">${PERS[q.si][0]}</span><span>${vHL(f)}</span>${speakBtn(f,"변화형 발음 듣기")}</div>`}
      ${vb}
      <p class="mean"><span class="cy">${v.inf}</span> · ${v.ko}</p>
      ${conjTable(v, onlyMean ? -1 : q.fi)}
      <div class="ext"><span lang="ru">${v.inf}</span>${extLinks(v.infP)}</div>
      <p class="rule">${VRULE[v.type]}</p>
      ${v.note ? `<p class="note">${v.note}</p>` : ""}
      ${v.endnote ? `<p class="note"><b>어미</b> · ${v.endnote}</p>` : ""}`;
    if(q.qq) return `
      <div class="pair" lang="ru"><span><mark>${cap(q.anim ? "кого́" : "что")}</mark> ${PERS[q.sq][0]} ${vHL(v.forms[q.fq])}?</span>${speakBtn(qRu(q),"질문 듣기")}</div>
      <p class="tr">${qKo(q)}</p>
      <p class="note">대답: <span class="cy">${ruSentence(q,false)}</span> (${koSentence(q)})</p>
      <p class="rule">${QACC} 여기서는 <b>${q.obj.acc}</b>${q.anim ? "가 사람(동물)이라서 кого́" : "가 사물이라서 что"}를 써요.</p>
      <div class="blk"><h4>동사 <span class="cy">${v.inf}</span> · ${v.ko}</h4>${vb}${conjTable(v, q.fq)}<p class="rule">${VRULE[v.type]}</p>${v.note ? `<p class="note">${v.note}</p>` : ""}${v.endnote ? `<p class="note"><b>어미</b> · ${v.endnote}</p>` : ""}</div>`;
    const o = q.obj || {}, ab = AEXC[o.kind] ? `<div>${badge(AEXC[o.kind])}</div>` : "";
    const second = q.lang
      ? `<div class="blk"><h4>‘${q.lang.ko}로’ <span class="cy">${q.lang.adj} → <mark>${q.lang.adv}</mark></span></h4><p class="rule">${LRULE}</p></div>`
      : `<div class="blk"><h4>목적어 <span class="cy">${o.nom} → ${hlFrom(o.nomP, o.acc)}</span> · ${o.ko}</h4>${ab}<p class="rule">${ARULE[o.kind]}</p>${o.note ? `<p class="note">${o.note}</p>` : ""}</div>`;
    return `
      <div class="pair" lang="ru"><span>${ruSentence(q, true)}</span>${speakBtn(ruSentence(q,false),"문장 듣기")}</div>
      <p class="tr">${koSentence(q)}</p>
      <div class="blk"><h4>동사 <span class="cy">${v.inf}</span> · ${v.ko}</h4>${vb}${conjTable(v, q.fi)}<p class="rule">${VRULE[v.type]}</p>${v.note ? `<p class="note">${v.note}</p>` : ""}${v.endnote ? `<p class="note"><b>어미</b> · ${v.endnote}</p>` : ""}</div>
      ${second}`;
  },
  itemKey: q => "vb:" + q.v.infP + (q.qq ? ":q" : q.lang ? ":lang" : q.sent ? ":" + q.obj.nomP : ""),
  wrongLine(q){
    const exc = [VEXC[q.v.type], q.sent && q.obj && AEXC[q.obj.kind]].filter(Boolean).map(badge).join(" ");
    if(q.qq) return { ru:`${qRu(q)}${exc ? `<br>${exc}` : ""}`, ko:qKo(q) };
    if(q.sent) return { ru:`${ruSentence(q,false)}${exc ? `<br>${exc}` : ""}`, ko:koSentence(q) };
    return { ru:`${PERS[q.si][0]} ${q.v.forms[q.fi]}${exc ? `<br>${exc}` : ""}`, ko:`${q.v.inf} · ${q.v.ko}` };
  },
  best:{ store:"ruQuizBest3", key: s => `verb_${s.level}_${s.game}_${s.ans}` },
  rules: () => `<details class="rules"><summary>동사 변화 · 대격 규칙 한눈에 보기</summary><ul>
      <li>${VRULE.c1} <span class="cy">чита́ть → чита́ю, чита́ешь … чита́ют</span></li>
      <li><b>1식의 я · они 어미 (-ю/-ют ↔ -у/-ут)</b>: 강세와는 상관없고 <b>어간 끝 글자</b>로 정해져요. 어간이 모음으로 끝나면 <span class="cy">-ю, -ют</span>(<span class="cy">чита́-ю, чита́-ют / да-ю́</span>), 자음으로 끝나면 <span class="cy">-у, -ут</span>(<span class="cy">жив-у́, жив-у́т / е́д-у, е́д-ут</span>)예요. ю는 ‘й + у’ 소리라서 모음 뒤에서만 써요.</li>
      <li><b>ж · ш · ч · щ 뒤는 항상 -у</b>: 철자 규칙 때문에 이 네 글자 뒤에는 ю, я를 못 써요. 1식이든 2식이든 я는 <span class="cy">-у</span>, они는 1식 <span class="cy">-ут</span> · 2식 <span class="cy">-ат</span>가 돼요. (<span class="cy">пишу́, пи́шут / учу́, у́чат / лежу́, лежа́т</span>)</li>
      <li><b>1식의 -ё- 어미</b>: 1식 동사에서 <b>어미에 강세가 올 때만</b> ты · он · мы · вы 어미의 е가 ё로 바뀌어요: <span class="cy">-ёшь, -ёт, -ём, -ёте</span>. ё는 항상 강세를 받아요. 강세가 어간에 있으면 е 그대로예요(<span class="cy">чита́ешь</span>). я · они 어미(-ю/-у, -ют/-ут)는 그대로예요. <span class="cy">жить → живу́, живёшь, живёт, живём, живёте, живу́т</span> (ждать, брать, идти́, пить, петь, дава́ть도 같아요)</li>
      <li>${VRULE.c2} <span class="cy">говори́ть → говорю́, говори́шь … говоря́т</span></li>
      <li>${VRULE.c1s} <span class="cy">занима́ться → занима́юсь …</span></li>
      <li>${VRULE.c2sp} <span class="cy">учи́ть → учу́, у́чат</span></li>
      <li><span class="exc">예외</span>${VRULE.c2l}</li>
      <li><span class="exc">예외</span>${VRULE.c2mut}</li>
      <li><span class="exc">예외</span>${VRULE.ova}</li>
      <li><span class="exc">예외</span>${VRULE.ava}</li>
      <li><span class="exc">예외</span>жить, писа́ть, хоте́ть, есть 같은 불규칙 동사는 답을 확인할 때 ‘예외 변화’ 표시가 붙어요.</li>
    </ul><ul class="sub">
      <li><b>대격(목적어)</b>: ${ARULE.fa} <span class="cy">кни́га → кни́гу</span></li>
      <li>${ARULE.fya} <span class="cy">пе́сня → пе́сню</span></li>
      <li>${ARULE.minan} ${ARULE.neut} ${ARULE.fsoft} <span class="cy">фильм, письмо́, дверь</span></li>
      <li><span class="exc">예외</span>${ARULE.manim} <span class="cy">брат → бра́та</span></li>
      <li><span class="exc">예외</span>${ARULE.pron}</li>
      <li>${QACC} <span class="cy">Кого́ ты ждёшь? — Я жду ма́му. / Что ты чита́ешь? — Я чита́ю кни́гу.</span></li>
      <li>${ARULE.langnp}</li>
      <li><b>‘~어로’</b>: ${LRULE} <span class="cy">Я говорю́ по-коре́йски.</span></li>
    </ul></details>`
};

/* ================= 3) 전치격 + в/на ================= */
const PCAT = {
  in_bld:"건물·기관 ‘안’에서는 기본 전치사 <b class='cy'>в</b>를 써요.",
  in_country:"나라·넓은 지역 이름에는 <b class='cy'>в</b>를 써요.",
  in_city:"도시·마을 같은 지역에는 <b class='cy'>в</b>를 써요.",
  in_thing:"가방·옷장처럼 ‘~ 안에’라는 뜻이면 <b class='cy'>в</b>를 써요.",
  in_text:"책·편지 ‘안에 (쓰여) 있다’는 뜻이라서 <b class='cy'>в</b>를 써요.",
  in_nature:"숲·정원처럼 둘러싸인 공간에는 <b class='cy'>в</b>를 써요.",
  on_open:"이 단어는 в가 아니라 <b class='cy'>на</b>와 함께 써요. 규칙보다는 단어째로 외워 두세요.",
  on_event:"수업·강의·콘서트처럼 ‘행사’를 뜻하는 말에는 <b class='cy'>на</b>를 써요.",
  on_street:"거리·광장에는 <b class='cy'>на</b>를 써요.",
  on_island:"섬·반도에는 <b class='cy'>на</b>를 써요.",
  on_water:"바다·호수·강·물가에는 <b class='cy'>на</b>를 써요. (‘그 가에서’라는 느낌)",
  on_dir:"방위(동서남북)에는 <b class='cy'>на</b>를 써요.",
  on_surf:"책상·바닥·벽처럼 ‘~ 위에, ~ 표면에’라는 뜻이면 <b class='cy'>на</b>를 써요.",
  on_mount:"산악 지역 이름(Ура́л, Кавка́з)에는 <b class='cy'>на</b>를 써요.",
  on_work:"단과대학·학과 같은 학교 조직에는 <b class='cy'>на</b>를 써요.",
  about:"‘~에 대해’라고 말할 때는 <b class='cy'>о</b>를 써요. <span class='cy'>а · о · у · э · и</span> 소리로 시작하는 단어 앞에서는 발음하기 편하게 <b class='cy'>об</b>가 돼요. (е · ё · ю · я 앞은 그대로 о)"
};
const PFR = {
  pe:"대부분의 명사는 전치격에서 <b class='cy'>-е</b>가 돼요. 자음 뒤에는 그냥 붙이고, -а · -я · -о · -й · -ь(남성)는 떼고 붙여요.",
  pii:"<b class='cy'>-ия · -ие · -ий</b>로 끝나는 명사는 <b class='cy'>-ии</b>가 돼요.",
  pif:"<b class='cy'>-ь</b>로 끝나는 여성명사는 <b class='cy'>-и</b>가 돼요.",
  psame:"<b class='cy'>-е</b>로 끝나는 중성명사는 전치격도 <b class='cy'>-е</b>라서 모양이 그대로예요.",
  pu:"제2 전치격: 일부 남성명사는 장소를 말할 때 -е 대신 강세 있는 <b class='cy'>-у́</b>를 받아요. 단어째로 외워 두세요.",
  pexc:"규칙에서 벗어나는 형태예요. 아래 설명을 확인하세요.",
  ppron:"인칭대명사의 전치격은 모양이 완전히 바뀌어요: <span class='cy'>обо мне́, о тебе́, о нём, о ней, о нас, о вас, о них</span>"
};
const PPREP = ["мне","тебе","нём","ней","нас","вас","них"];
const QPREP = "<b>кто / что의 전치격</b>: 사람에 대해 물으면 <b class='cy'>о ком</b>, 사물·일에 대해 물으면 <b class='cy'>о чём</b>이에요.";
function prepBadges(p){
  const b = [];
  if(p.prep==="на" && p.cat!=="on_surf") b.push("на를 쓰는 단어");
  if(p.exc) b.push(p.exc);
  if(p.kind==="pron") b.push("대명사 전치격 · 통째로 외우기");
  if(p.nomP==="Крым") b.push("예외 · 반도지만 в");
  if(p.fr==="pu") b.push("제2 전치격 -у́");
  if(p.fleet) b.push("출몰모음");
  return b;
}
function pKoTail(p, tpl){
  const thing = p.koT || `${p.koLoc} ${p.prep==="на" ? "위에" : "안에"} 있어요`;
  return tpl.replace("{L}", p.koLoc).replace("{T}", thing);
}
const MPR = {
  tab:"전치격", h1:"전치격 퀴즈", ru:"предложный падеж", unit:"단어",
  lead:"장소(‘~에서, ~에’ → в / на)와 ‘~에 대해’(о / об)를 말할 때 어떤 전치사를 쓰는지, 명사가 어떻게 바뀌는지 맞혀 보세요.",
  levels(){
    const desc = { beginner:"교재 범위: в / на 장소 · о / об (~에 대해) · 제2 전치격 -у", intermediate:"집 안 물건 · 나라 · 방위 · 행사", advanced:"학교·연구 관련 · 지역 이름" };
    const rep = { beginner:3, intermediate:2, advanced:1 };   /* 대명사 전치격은 여러 번 나오게 */
    return Object.fromEntries(Object.keys(LV).map(k => [k,{ label:LV[k], desc:desc[k],
      items: V3.places.filter(p => p.lvl===k).flatMap(p => p.kind==="pron" ? Array(rep[k]).fill(p) : p.kind==="about" ? [p, { qq:true, p, ko:p.ko }] : [p]) }]));
  },
  segs(){ return [
    ["game","게임 종류",[["both","전치사 + 형태"],["prep","전치사만"]]],
    ["view","문제 모양",[["word","단어로"],["sent","문장으로"]]]
  ]; },
  summary: s => `${s.game==="both" ? "전치사 + 형태" : "전치사만"} · ${s.view==="sent" ? "문장" : "단어"}`,
  build(p, pool, s){
    if(p.qq){
      const P = p.p, ok = V3.frames.about.filter(f => !f[0].replace(/\u0301/g,"").toLowerCase().includes(P.nomP.toLowerCase()));
      const q = { p:P, qq:true, fr:pick1(ok), parts:[] };
      q.parts.push(pickPart("w","의문사는?","의문사",["о ком","о чём","кого","что"], P.anim ? "о ком" : "о чём", true, true));
      return q;
    }
    const q = { p, sent: s.view==="sent", parts:[] };
    if(q.sent){
      const fk = pick1(p.frames);
      const ok = V3.frames[fk].filter(f => f[3]<0 || f[3]!==p.pidx).filter(f => !f[0].replace(/\u0301/g,"").toLowerCase().includes(p.nomP.toLowerCase()));
      q.fr = pick1(ok.length ? ok : V3.frames[fk]);
    }
    const pt = p.kind==="loc" ? "в 와 на 중에 무엇을 쓸까요?" : p.kind==="pron" ? "о / об / обо 중에 무엇을 쓸까요? <span class='cy'>(바뀐 형태 앞에 붙여요)</span>" : "о 와 об 중에 무엇을 쓸까요? <span class='cy'>(바뀐 형태 앞에 붙여요)</span>";
    const prPart = pickPart("pr", pt, "전치사", p.popts, p.prep, true, true);
    q.showForm = s.game!=="both" && p.kind!=="loc";   /* 전치사만 풀 때 о/об는 바뀐 형태를 보여 줘야 고를 수 있어요 */
    if(s.game!=="both" || p.kind==="loc") q.parts.push(prPart);
    if(s.game==="both"){
      const wr = p.kind==="pron" ? shuffle(PPREP.filter(x => x!==p.formP)).slice(0,3) : p.wrong;   /* 대명사는 보기를 전부 전치격 대명사로 */
      q.parts.push(pickPart("f","전치격 형태는?","형태",[p.formP, ...wr], p.formP, true));
      if(p.kind!=="loc") q.parts.push(prPart);   /* о / об / обо는 바뀐 형태를 보고 고르도록 형태 → 전치사 순서 */
    }
    return q;
  },
  prompt(q){
    const p = q.p;
    if(q.qq) return `<p class="hint">대답이 이 문장이 되도록 질문을 만들어 보세요</p><p class="answerline" lang="ru">${q.fr[0]} ${p.prep} ${p.form}.</p>
      <p class="sent" lang="ru"><span class="slot"><span class="gap">?</span><small>의문사</small></span> ${q.fr[4]}?</p>`;
    const hint = (p.kind==="loc" ? `📍 장소 · ${p.ko}` : `💬 ~에 대해 · ${p.ko}`) + (q.showForm ? ` · 전치격 <span class="cy">${p.form}</span>` : "");
    if(!q.sent) return `<div class="word"><span class="w" lang="ru">${p.nom}</span>${speakBtn(p.nom,"발음 듣기")}</div><p class="hint">${hint}</p>`;
    return `<p class="sent" lang="ru">${q.fr[0]} <span class="slot"><span class="gap">?</span><small>${p.nom}</small></span>.</p><p class="hint">${hint}</p>`;
  },
  phrase: q => `${q.p.prep} ${q.p.form}`,
  feedback(q){
    if(q.qq){ const P = q.p, w = P.anim ? "О ком" : "О чём", ru = `${w} ${q.fr[4]}?`;
      return `<div class="pair" lang="ru"><span><mark>${w}</mark> ${q.fr[4]}?</span>${speakBtn(ru,"질문 듣기")}</div>
        <p class="tr">${q.fr[5]} ${q.fr[6].replace("{Q}", P.anim ? "누구에 대해" : "무엇에 대해")}?</p>
        <p class="note">대답: <span class="cy">${q.fr[0]} ${P.prep} ${P.form}.</span> (${q.fr[1]} ${pKoTail(P, q.fr[2])}.)</p>
        <p class="rule">${QPREP} 여기서는 <b>${P.nom}</b>${P.anim ? "가 사람이라서 о ком" : "가 사물·일이라서 о чём"}을 써요.</p>`; }
    const p = q.p, ph = `${p.prep} ${p.kind==="pron" ? p.form : hlFrom(p.nomP, p.form)}`, phPlain = `${p.prep} ${p.form}`;
    const bs = prepBadges(p);
    return `
      <div class="pair" lang="ru"><span>${ph}</span>${hasLL(p.form) ? speakBtn(p.form,"발음 듣기") : speakBtn(phPlain,"발음 듣기")}</div>
      ${bs.length ? `<div>${bs.map(badge).join(" ")}</div>` : ""}
      <p class="mean"><span class="cy">${p.nom}</span> · ${p.ko}</p>
      ${q.sent ? `<p class="sentfull" lang="ru"><span>${q.fr[0]} ${ph}.</span>${speakBtn(`${q.fr[0]} ${phPlain}.`,"문장 듣기")}</p><p class="tr">${q.fr[1]} ${pKoTail(p, q.fr[2])}.</p>` : ""}
      <p class="rule"><b>전치사</b> · ${PCAT[p.cat]}</p>
      <p class="rule" style="margin-top:8px"><b>형태</b> · ${p.fleet ? "마지막 음절의 모음(о / е / ё)이 빠지는 출몰모음 단어예요. " : ""}${PFR[p.fr]}</p>
      ${p.note ? `<p class="note">${p.note}</p>` : ""}
      ${p.kind==="pron" ? "" : `<div class="ext"><span lang="ru">${p.nom}</span>${extLinks(p.nomP)}</div>`}`;
  },
  itemKey: q => (q.qq ? "pr:q:" : "pr:" + q.p.kind + ":") + q.p.nomP,
  wrongLine(q){
    if(q.qq) return { ru:`${q.p.anim ? "О ком" : "О чём"} ${q.fr[4]}?`, ko:`${q.fr[5]} ${q.fr[6].replace("{Q}", q.p.anim ? "누구에 대해" : "무엇에 대해")}?` };
    const bs = prepBadges(q.p);
    return { ru:`${q.p.prep} ${q.p.form}${bs.length ? `<br>${bs.map(badge).join(" ")}` : ""}`, ko:`${q.p.nom} · ${q.p.ko}` };
  },
  best:{ store:"ruQuizBest3", key: s => `prep_${s.level}_${s.game}_${s.view}` },
  rules: () => `<details class="rules"><summary>전치격 · в / на 규칙 한눈에 보기</summary><ul>
      <li><b>형태</b>: ${PFR.pe} <span class="cy">шко́ла → в шко́ле, парк → в па́рке</span></li>
      <li>${PFR.pii} <span class="cy">Росси́я → в Росси́и, общежи́тие → в общежи́тии</span></li>
      <li>${PFR.pif} <span class="cy">пло́щадь → на пло́щади</span></li>
      <li><span class="exc">예외</span>${PFR.pu} <span class="cy">лес → в лесу́, шкаф → в шкафу́, мост → на мосту́</span></li>
    </ul><ul class="sub">
      <li><b>전치사</b>: 기본은 <b class="cy">в</b>예요. 건물·나라·도시 ‘안’이면 в를 써요.</li>
      <li><span class="exc">예외</span><b class="cy">на</b>를 쓰는 경우는 따로 외워요: 역·우체국·공장·경기장 같은 정해진 단어, 수업·강의·콘서트 같은 행사, 거리·광장, 섬·반도, 바다·호수·강, 동서남북, ‘~ 위에’.</li>
      <li>참고: ‘집에서’는 보통 в до́ме가 아니라 <span class="cy">до́ма</span>라는 부사를 써요. (Они́ до́ма.)</li>
    </ul><ul class="sub">
      <li><b>‘~에 대해’</b>: ${PCAT.about} <span class="cy">о ма́ме, об А́нне, о Евро́пе</span></li>
      <li><span class="exc">예외</span>${PFR.ppron}</li>
      <li>${QPREP} <span class="cy">О ком вы говори́те? — Мы говори́м о ма́ме. / О чём ты ду́маешь? — Я ду́маю о кни́ге.</span></li>
    </ul></details>`
};

/* ================= 0) 단어 뜻 ================= */
const VOCAB = [{"w": "я", "wP": "я", "ko": "나", "pos": "pron", "lvl": "beginner", "ex": ["[Я] студент.", "나는 대학생이에요."]}, {"w": "ты", "wP": "ты", "ko": "너", "pos": "pron", "lvl": "beginner", "ex": ["[Ты] читаешь книгу?", "너는 책을 읽고 있어?"]}, {"w": "он", "wP": "он", "ko": "그", "pos": "pron", "lvl": "beginner", "ex": ["[Он] живёт в Москве.", "그는 모스크바에 살아요."]}, {"w": "она́", "wP": "она", "ko": "그녀", "pos": "pron", "lvl": "beginner", "ex": ["[Она] работает в банке.", "그녀는 은행에서 일해요."]}, {"w": "оно́", "wP": "оно", "ko": "그것", "pos": "pron", "lvl": "beginner", "ex": ["Это письмо? — Да, [оно] здесь.", "이거 편지예요? — 네, 그건 여기 있어요."]}, {"w": "мы", "wP": "мы", "ko": "우리(들)", "pos": "pron", "lvl": "beginner", "ex": ["[Мы] гуляем в парке.", "우리는 공원에서 산책해요."]}, {"w": "вы", "wP": "вы", "ko": "당신, 너희들", "pos": "pron", "lvl": "beginner", "ex": ["[Вы] говорите по-русски?", "러시아어 하세요?"]}, {"w": "они́", "wP": "они", "ko": "그들", "pos": "pron", "lvl": "beginner", "ex": ["[Они] обедают в ресторане.", "그들은 레스토랑에서 점심을 먹어요."]}, {"w": "меня́", "wP": "меня", "ko": "나를", "pos": "pron", "lvl": "beginner", "ex": ["[Меня] зовут Антон.", "제 이름은 안톤이에요. (사람들이 나를 안톤이라고 불러요)"]}, {"w": "тебя́", "wP": "тебя", "ko": "너를", "pos": "pron", "lvl": "beginner", "ex": ["Я знаю [тебя].", "나는 너를 알아."]}, {"w": "вас", "wP": "вас", "ko": "당신을", "pos": "pron", "lvl": "beginner", "ex": ["Как [вас] зовут?", "이름이 뭐예요? (사람들이 당신을 뭐라고 불러요?)"]}, {"w": "нас", "wP": "нас", "ko": "우리를", "pos": "pron", "lvl": "beginner", "ex": ["Мама ждёт [нас].", "엄마가 우리를 기다려요."]}, {"w": "обо мне́", "wP": "обо мне", "ko": "나에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Он думает [обо мне].", "그는 나에 대해 생각해요."]}, {"w": "о тебе́", "wP": "о тебе", "ko": "너에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Мы говорим [о тебе].", "우리는 너에 대해 이야기해."]}, {"w": "о нём", "wP": "о нём", "ko": "그에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Я часто думаю [о нём].", "나는 그에 대해 자주 생각해요."]}, {"w": "о ней", "wP": "о ней", "ko": "그녀에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Брат говорит [о ней].", "형은 그녀에 대해 이야기해요."]}, {"w": "о нас", "wP": "о нас", "ko": "우리에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Учитель говорит [о нас].", "선생님이 우리에 대해 이야기해요."]}, {"w": "о вас", "wP": "о вас", "ko": "당신에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Мы говорим [о вас].", "우리는 당신에 대해 이야기해요."]}, {"w": "о них", "wP": "о них", "ko": "그들에 대해", "pos": "pron", "lvl": "beginner", "ex": ["Мама думает [о них].", "엄마는 그들에 대해 생각해요."]}, {"w": "его́", "wP": "его", "ko": "그의, 그를", "pos": "pron", "lvl": "beginner", "ex": ["Это [его] книга.", "이건 그의 책이에요."]}, {"w": "её", "wP": "её", "ko": "그녀의, 그녀를", "pos": "pron", "lvl": "beginner", "ex": ["Это [её] сумка.", "이건 그녀의 가방이에요."]}, {"w": "их", "wP": "их", "ko": "그들의, 그들을", "pos": "pron", "lvl": "beginner", "ex": ["Это [их] дом.", "이건 그들의 집이에요."]}, {"w": "мой", "wP": "мой", "ko": "나의", "pos": "pron", "lvl": "beginner", "ex": ["Это [мой] брат.", "이 사람은 내 형이에요."]}, {"w": "твой", "wP": "твой", "ko": "너의", "pos": "pron", "lvl": "beginner", "ex": ["Это [твой] словарь?", "이거 네 사전이야?"]}, {"w": "наш", "wP": "наш", "ko": "우리의", "pos": "pron", "lvl": "beginner", "ex": ["Это [наш] университет.", "이건 우리 대학교예요."]}, {"w": "ваш", "wP": "ваш", "ko": "당신의, 너희의", "pos": "pron", "lvl": "beginner", "ex": ["Это [ваш] паспорт?", "이거 당신 여권이에요?"]}, {"w": "кто", "wP": "кто", "ko": "누구", "pos": "func", "lvl": "beginner", "ex": ["[Кто] это? — Это Иван.", "이 사람은 누구예요? — 이반이에요."]}, {"w": "что", "wP": "что", "ko": "무엇", "pos": "func", "lvl": "beginner", "ex": ["[Что] это? — Это книга.", "이건 뭐예요? — 책이에요."]}, {"w": "кого́", "wP": "кого", "ko": "누구를", "pos": "func", "lvl": "beginner", "ex": ["[Кого] ты ждёшь?", "너는 누구를 기다려?"]}, {"w": "о ком", "wP": "о ком", "ko": "누구에 대해", "pos": "func", "lvl": "beginner", "ex": ["[О ком] вы говорите?", "누구에 대해 이야기해요?"]}, {"w": "о чём", "wP": "о чём", "ko": "무엇에 대해", "pos": "func", "lvl": "beginner", "ex": ["[О чём] ты думаешь?", "너는 무엇에 대해 생각해?"]}, {"w": "где", "wP": "где", "ko": "어디에", "pos": "func", "lvl": "beginner", "ex": ["[Где] почта?", "우체국이 어디에 있어요?"]}, {"w": "куда́", "wP": "куда", "ko": "어디로", "pos": "func", "lvl": "beginner", "ex": ["[Куда] вы идёте?", "어디로 가세요?"]}, {"w": "когда́", "wP": "когда", "ko": "언제", "pos": "func", "lvl": "beginner", "ex": ["[Когда] урок?", "수업은 언제예요?"]}, {"w": "как", "wP": "как", "ko": "어떻게", "pos": "func", "lvl": "beginner", "ex": ["[Как] дела?", "어떻게 지내요?"]}, {"w": "како́й", "wP": "какой", "ko": "어떤", "pos": "func", "lvl": "beginner", "ex": ["[Какой] это журнал?", "이건 어떤 잡지예요?"]}, {"w": "чей", "wP": "чей", "ko": "누구의", "pos": "func", "lvl": "beginner", "ex": ["[Чей] это словарь?", "이건 누구의 사전이에요?"]}, {"w": "кото́рый", "wP": "который", "ko": "(관계대명사) ~하는, ~인", "pos": "pron", "lvl": "beginner", "ex": ["Это студент, [который] живёт в Москве.", "이 사람은 모스크바에 사는 대학생이에요."]}, {"w": "э́тот", "wP": "этот", "ko": "이 (남성 명사 앞)", "pos": "pron", "lvl": "beginner", "ex": ["[Этот] костюм новый.", "이 정장은 새것이에요."]}, {"w": "э́та", "wP": "эта", "ko": "이 (여성 명사 앞)", "pos": "pron", "lvl": "beginner", "ex": ["[Эта] книга интересная.", "이 책은 재미있어요."]}, {"w": "э́то", "wP": "это", "ko": "이것, 이 (중성 명사 앞)", "pos": "pron", "lvl": "beginner", "ex": ["[Это] моя сестра.", "이 사람은 제 누나예요."]}, {"w": "э́ти", "wP": "эти", "ko": "이것들, 이 (복수 명사 앞)", "pos": "pron", "lvl": "beginner", "ex": ["[Эти] брюки чёрные.", "이 바지는 검은색이에요."]}, {"w": "здесь", "wP": "здесь", "ko": "여기에", "pos": "func", "lvl": "beginner", "ex": ["Мама [здесь].", "엄마는 여기에 있어요."]}, {"w": "сего́дня", "wP": "сегодня", "ko": "오늘", "pos": "func", "lvl": "beginner", "ex": ["[Сегодня] мы отдыхаем.", "오늘 우리는 쉬어요."]}, {"w": "да", "wP": "да", "ko": "네(긍정)", "pos": "func", "lvl": "beginner", "ex": ["[Да], это мой дом.", "네, 이건 우리 집이에요."]}, {"w": "нет", "wP": "нет", "ko": "아니요", "pos": "func", "lvl": "beginner", "ex": ["[Нет], это не мой словарь.", "아니요, 이건 제 사전이 아니에요."]}, {"w": "не", "wP": "не", "ko": "~이 아니다(부정)", "pos": "func", "lvl": "beginner", "ex": ["Он [не] студент, а учитель.", "그는 대학생이 아니라 선생님이에요."]}, {"w": "в", "wP": "в", "ko": "~안에, ~에서", "pos": "func", "lvl": "beginner", "ex": ["Брат живёт [в] Корее.", "형은 한국에 살아요."]}, {"w": "на", "wP": "на", "ko": "~위에, ~에서", "pos": "func", "lvl": "beginner", "ex": ["Сестра работает [на] почте.", "누나는 우체국에서 일해요."]}, {"w": "о", "wP": "о", "ko": "~에 대해", "pos": "func", "lvl": "beginner", "ex": ["Мы говорим [о] музыке.", "우리는 음악에 대해 이야기해요."]}, {"w": "по-ру́сски", "wP": "по-русски", "ko": "러시아어로", "pos": "func", "lvl": "beginner", "ex": ["Я говорю [по-русски].", "나는 러시아어를 해요."]}, {"w": "спаси́бо", "wP": "спасибо", "ko": "고맙습니다, 감사합니다", "pos": "phr", "lvl": "beginner", "ex": ["[Спасибо]! — Пожалуйста.", "고맙습니다! — 천만에요."]}, {"w": "извини́те", "wP": "извините", "ko": "미안합니다, 실례합니다", "pos": "phr", "lvl": "beginner", "ex": ["[Извините], где банк?", "실례합니다, 은행이 어디예요?"]}, {"w": "До свида́ния!", "wP": "До свидания!", "ko": "안녕히 가세요(헤어질 때)", "pos": "phr", "lvl": "beginner", "ex": ["[До свидания], Нина!", "안녕히 가세요, 니나!"]}, {"w": "Как вас зову́т?", "wP": "Как вас зовут?", "ko": "이름이 뭐예요?", "pos": "phr", "lvl": "beginner", "ex": ["— [Как вас зовут?] — Меня зовут Иван.", "— 이름이 뭐예요? — 제 이름은 이반이에요."]}, {"w": "познако́мьтесь", "wP": "познакомьтесь", "ko": "서로 인사하세요", "pos": "phr", "lvl": "beginner", "ex": ["[Познакомьтесь], это мой друг Антон.", "서로 인사하세요, 이쪽은 제 친구 안톤이에요."]}, {"w": "оди́н", "wP": "один", "ko": "하나, 1", "pos": "num", "lvl": "beginner", "n": 1, "ex": ["[Один] плюс один — два.", "1 더하기 1은 2예요."]}, {"w": "два", "wP": "два", "ko": "둘, 2", "pos": "num", "lvl": "beginner", "n": 2, "ex": ["[Два] плюс два — четыре.", "2 더하기 2는 4예요."]}, {"w": "три", "wP": "три", "ko": "셋, 3", "pos": "num", "lvl": "beginner", "n": 3, "ex": ["[Три] плюс три — шесть.", "3 더하기 3은 6이에요."]}, {"w": "четы́ре", "wP": "четыре", "ko": "넷, 4", "pos": "num", "lvl": "beginner", "n": 4, "ex": ["[Четыре] плюс один — пять.", "4 더하기 1은 5예요."]}, {"w": "пять", "wP": "пять", "ko": "다섯, 5", "pos": "num", "lvl": "beginner", "n": 5, "ex": ["[Пять] плюс пять — десять.", "5 더하기 5는 10이에요."]}, {"w": "шесть", "wP": "шесть", "ko": "여섯, 6", "pos": "num", "lvl": "beginner", "n": 6, "ex": ["[Шесть] минус два — четыре.", "6 빼기 2는 4예요."]}, {"w": "семь", "wP": "семь", "ko": "일곱, 7", "pos": "num", "lvl": "beginner", "n": 7, "ex": ["[Семь] плюс два — девять.", "7 더하기 2는 9예요."]}, {"w": "во́семь", "wP": "восемь", "ko": "여덟, 8", "pos": "num", "lvl": "beginner", "n": 8, "ex": ["[Восемь] плюс два — десять.", "8 더하기 2는 10이에요."]}, {"w": "де́вять", "wP": "девять", "ko": "아홉, 9", "pos": "num", "lvl": "beginner", "n": 9, "ex": ["[Девять] минус три — шесть.", "9 빼기 3은 6이에요."]}, {"w": "де́сять", "wP": "десять", "ko": "열, 10", "pos": "num", "lvl": "beginner", "n": 10, "ex": ["[Десять] минус один — девять.", "10 빼기 1은 9예요."]}, {"w": "пе́рвый", "wP": "первый", "ko": "첫 번째, 1번째", "pos": "ord", "lvl": "beginner", "n": 1, "ex": ["Это [первый] урок.", "이건 첫 번째 수업이에요."]}, {"w": "второ́й", "wP": "второй", "ko": "두 번째, 2번째", "pos": "ord", "lvl": "beginner", "n": 2, "ex": ["Это [вторая] книга.", "이건 두 번째 책이에요."]}, {"w": "тре́тий", "wP": "третий", "ko": "세 번째, 3번째", "pos": "ord", "lvl": "beginner", "n": 3, "ex": ["Это [третья] лекция.", "이건 세 번째 강의예요."]}, {"w": "четвёртый", "wP": "четвёртый", "ko": "네 번째, 4번째", "pos": "ord", "lvl": "beginner", "n": 4, "ex": ["Это [четвёртый] вопрос.", "이건 네 번째 질문이에요."]}, {"w": "пя́тый", "wP": "пятый", "ko": "다섯 번째, 5번째", "pos": "ord", "lvl": "beginner", "n": 5, "ex": ["Это [пятое] упражнение.", "이건 다섯 번째 연습 문제예요."]}, {"w": "шесто́й", "wP": "шестой", "ko": "여섯 번째, 6번째", "pos": "ord", "lvl": "beginner", "n": 6, "ex": ["Это [шестой] автобус.", "이건 6번 버스예요."]}, {"w": "седьмо́й", "wP": "седьмой", "ko": "일곱 번째, 7번째", "pos": "ord", "lvl": "beginner", "n": 7, "ex": ["Это [седьмой] трамвай.", "이건 7번 전차예요."]}, {"w": "восьмо́й", "wP": "восьмой", "ko": "여덟 번째, 8번째", "pos": "ord", "lvl": "beginner", "n": 8, "ex": ["Это [восьмая] школа.", "이건 제8학교예요."]}, {"w": "девя́тый", "wP": "девятый", "ko": "아홉 번째, 9번째", "pos": "ord", "lvl": "beginner", "n": 9, "ex": ["Это [девятый] дом.", "이건 아홉 번째 집이에요."]}, {"w": "деся́тый", "wP": "десятый", "ko": "열 번째, 10번째", "pos": "ord", "lvl": "beginner", "n": 10, "ex": ["Это [десятая] неделя.", "이번이 열 번째 주예요."]}, {"w": "звать", "wP": "звать", "ko": "부르다", "pos": "v", "lvl": "beginner", "ex": ["Меня [зовут] Нина.", "제 이름은 니나예요."]}, {"w": "чита́ть", "wP": "читать", "ko": "읽다", "pos": "v", "lvl": "beginner", "ex": ["Я [читаю] газету.", "나는 신문을 읽어요."]}, {"w": "за́втракать", "wP": "завтракать", "ko": "아침 먹다", "pos": "v", "lvl": "beginner", "ex": ["Мы [завтракаем] дома.", "우리는 집에서 아침을 먹어요."]}, {"w": "обе́дать", "wP": "обедать", "ko": "점심 먹다", "pos": "v", "lvl": "beginner", "ex": ["Они [обедают] в кафе.", "그들은 카페에서 점심을 먹어요."]}, {"w": "у́жинать", "wP": "ужинать", "ko": "저녁 먹다", "pos": "v", "lvl": "beginner", "ex": ["Папа [ужинает] в ресторане.", "아빠는 레스토랑에서 저녁을 먹어요."]}, {"w": "гуля́ть", "wP": "гулять", "ko": "산책하다", "pos": "v", "lvl": "beginner", "ex": ["Дети [гуляют] в парке.", "아이들이 공원에서 산책해요."]}, {"w": "отдыха́ть", "wP": "отдыхать", "ko": "쉬다", "pos": "v", "lvl": "beginner", "ex": ["Мы [отдыхаем] на море.", "우리는 바닷가에서 쉬어요."]}, {"w": "жить", "wP": "жить", "ko": "살다", "pos": "v", "lvl": "beginner", "ex": ["Я [живу] в Корее.", "나는 한국에 살아요."]}, {"w": "рабо́тать", "wP": "работать", "ko": "일하다", "pos": "v", "lvl": "beginner", "ex": ["Мама [работает] в больнице.", "엄마는 병원에서 일해요."]}, {"w": "учи́ться", "wP": "учиться", "ko": "(어디에서) 배우다, 다니다", "pos": "v", "lvl": "beginner", "ex": ["Брат [учится] в университете.", "형은 대학교에 다녀요."]}, {"w": "говори́ть", "wP": "говорить", "ko": "말하다", "pos": "v", "lvl": "beginner", "ex": ["Анна [говорит] по-русски.", "안나는 러시아어를 해요."]}, {"w": "изуча́ть", "wP": "изучать", "ko": "(무엇을) 공부하다, 연구하다", "pos": "v", "lvl": "beginner", "ex": ["Я [изучаю] русский язык.", "나는 러시아어를 공부해요."]}, {"w": "есть", "wP": "есть", "ko": "먹다", "pos": "v", "lvl": "beginner", "ex": ["Я [ем] суп.", "나는 수프를 먹어요."]}, {"w": "пить", "wP": "пить", "ko": "마시다", "pos": "v", "lvl": "beginner", "ex": ["Мы [пьём] чай.", "우리는 차를 마셔요."]}, {"w": "вода́", "wP": "вода", "ko": "물", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это холодная [вода].", "이건 차가운 물이에요."]}, {"w": "год", "wP": "год", "ko": "해, 년(年)", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Новый [год] — большой праздник.", "새해는 큰 명절이에요."]}, {"w": "институ́т", "wP": "институт", "ko": "연구소", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Отец работает в [институте].", "아버지는 연구소에서 일해요."]}, {"w": "кино́", "wP": "кино", "ko": "영화(관)", "pos": "n", "lvl": "beginner", "g": "n", "gx": "외래어라서 모양은 안 바뀌지만 중성이에요.", "ex": ["Мы идём в [кино].", "우리는 영화 보러 가요."]}, {"w": "кни́га", "wP": "книга", "ko": "책", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это интересная [книга].", "이건 재미있는 책이에요."]}, {"w": "сок", "wP": "сок", "ko": "주스", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Я пью [сок].", "나는 주스를 마셔요."]}, {"w": "суп", "wP": "суп", "ko": "수프", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мама готовит [суп].", "엄마가 수프를 만들어요."]}, {"w": "газе́та", "wP": "газета", "ko": "신문", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Папа читает [газету].", "아빠는 신문을 읽어요."]}, {"w": "день", "wP": "день", "ko": "날, 낮", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Сегодня хороший [день].", "오늘은 좋은 날이에요."]}, {"w": "де́ти", "wP": "дети", "ko": "아이들", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["[Дети] в школе.", "아이들은 학교에 있어요."]}, {"w": "костю́м", "wP": "костюм", "ko": "정장", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это мой новый [костюм].", "이건 내 새 정장이에요."]}, {"w": "мать", "wP": "мать", "ko": "어머니", "pos": "n", "lvl": "beginner", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Моя [мать] — врач.", "우리 어머니는 의사예요."]}, {"w": "му́зыка", "wP": "музыка", "ko": "음악", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Я люблю [музыку].", "나는 음악을 좋아해요."]}, {"w": "пе́сня", "wP": "песня", "ko": "노래", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это красивая [песня].", "이건 아름다운 노래예요."]}, {"w": "письмо́", "wP": "письмо", "ko": "편지", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Я пишу [письмо].", "나는 편지를 써요."]}, {"w": "семья́", "wP": "семья", "ko": "가족", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это моя [семья].", "이건 우리 가족이에요."]}, {"w": "стихи́", "wP": "стихи", "ko": "시(복수)", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Сестра читает [стихи].", "누나는 시를 읽어요."]}, {"w": "студе́нт", "wP": "студент", "ko": "(남)대학생", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Антон — [студент].", "안톤은 대학생이에요."]}, {"w": "студе́нтка", "wP": "студентка", "ko": "(여)대학생", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Нина — [студентка].", "니나는 대학생이에요."]}, {"w": "журна́л", "wP": "журнал", "ko": "잡지", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это новый [журнал].", "이건 새 잡지예요."]}, {"w": "музе́й", "wP": "музей", "ko": "박물관", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мы в [музее].", "우리는 박물관에 있어요."]}, {"w": "слова́рь", "wP": "словарь", "ko": "사전", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Где мой [словарь]?", "내 사전 어디 있어?"]}, {"w": "ма́ма", "wP": "мама", "ko": "엄마", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["[Мама] дома.", "엄마는 집에 있어요."]}, {"w": "тетра́дь", "wP": "тетрадь", "ko": "공책", "pos": "n", "lvl": "beginner", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это моя [тетрадь].", "이건 내 공책이에요."]}, {"w": "мо́ре", "wP": "море", "ko": "바다", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Там красивое [море].", "저기 바다가 아름다워요."]}, {"w": "вре́мя", "wP": "время", "ko": "시간", "pos": "n", "lvl": "beginner", "g": "n", "gx": "-мя로 끝나는 명사는 중성이에요.", "ex": ["[Время] — деньги.", "시간은 돈이에요."]}, {"w": "и́мя", "wP": "имя", "ko": "이름", "pos": "n", "lvl": "beginner", "g": "n", "gx": "-мя로 끝나는 명사는 중성이에요.", "ex": ["Иван — красивое [имя].", "이반은 예쁜 이름이에요."]}, {"w": "дочь", "wP": "дочь", "ko": "딸", "pos": "n", "lvl": "beginner", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это моя [дочь].", "이 아이는 내 딸이에요."]}, {"w": "ночь", "wP": "ночь", "ko": "밤", "pos": "n", "lvl": "beginner", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Сейчас [ночь].", "지금은 밤이에요."]}, {"w": "учи́тель", "wP": "учитель", "ko": "(초·중·고) 선생님", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Мой брат — [учитель].", "우리 형은 선생님이에요."]}, {"w": "преподава́тель", "wP": "преподаватель", "ko": "(대학) 강사", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это наш [преподаватель].", "이분은 우리 강사님이에요."]}, {"w": "портфе́ль", "wP": "портфель", "ko": "서류가방", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Газета в [портфеле].", "신문은 서류가방 안에 있어요."]}, {"w": "брат", "wP": "брат", "ko": "남자 형제", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мой [брат] — студент.", "우리 형은 대학생이에요."]}, {"w": "сестра́", "wP": "сестра", "ko": "여자 형제", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Моя [сестра] живёт в Москве.", "우리 누나는 모스크바에 살아요."]}, {"w": "университе́т", "wP": "университет", "ko": "대학교", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Я учусь в [университете].", "나는 대학교에 다녀요."]}, {"w": "па́па", "wP": "папа", "ko": "아빠", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-а / -я로 끝나지만 남자를 뜻해서 남성이에요.", "ex": ["[Папа] работает в банке.", "아빠는 은행에서 일해요."]}, {"w": "ру́чка", "wP": "ручка", "ko": "펜", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это моя [ручка].", "이건 내 펜이에요."]}, {"w": "ра́дио", "wP": "радио", "ko": "라디오", "pos": "n", "lvl": "beginner", "g": "n", "gx": "외래어라서 모양은 안 바뀌지만 중성이에요.", "ex": ["Мы слушаем [радио].", "우리는 라디오를 들어요."]}, {"w": "сигаре́та", "wP": "сигарета", "ko": "담배", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это не [сигарета], а ручка.", "이건 담배가 아니라 펜이에요."]}, {"w": "сын", "wP": "сын", "ko": "아들", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это мой [сын].", "이 아이는 내 아들이에요."]}, {"w": "профе́ссор", "wP": "профессор", "ko": "교수", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Наш [профессор] работает в институте.", "우리 교수님은 연구소에서 일하세요."]}, {"w": "дом", "wP": "дом", "ko": "집", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это мой [дом].", "이건 우리 집이에요."]}, {"w": "дя́дя", "wP": "дядя", "ko": "삼촌, 아저씨", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-а / -я로 끝나지만 남자를 뜻해서 남성이에요.", "ex": ["Мой [дядя] — врач.", "우리 삼촌은 의사예요."]}, {"w": "трамва́й", "wP": "трамвай", "ko": "전차(트램)", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это новый [трамвай].", "이건 새 전차예요."]}, {"w": "ма́льчик", "wP": "мальчик", "ko": "소년", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["[Мальчик] читает книгу.", "소년이 책을 읽어요."]}, {"w": "каранда́ш", "wP": "карандаш", "ko": "연필", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это красный [карандаш].", "이건 빨간 연필이에요."]}, {"w": "врач", "wP": "врач", "ko": "의사", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Моя мама — [врач].", "우리 엄마는 의사예요."]}, {"w": "де́душка", "wP": "дедушка", "ko": "할아버지", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-а / -я로 끝나지만 남자를 뜻해서 남성이에요.", "ex": ["[Дедушка] отдыхает дома.", "할아버지는 집에서 쉬세요."]}, {"w": "ба́бушка", "wP": "бабушка", "ko": "할머니", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["[Бабушка] готовит обед.", "할머니가 점심을 준비하세요."]}, {"w": "сло́во", "wP": "слово", "ko": "단어", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Это новое [слово].", "이건 새 단어예요."]}, {"w": "зда́ние", "wP": "здание", "ko": "건물", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Это большое [здание].", "이건 큰 건물이에요."]}, {"w": "упражне́ние", "wP": "упражнение", "ko": "연습 문제", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Это трудное [упражнение].", "이건 어려운 연습 문제예요."]}, {"w": "окно́", "wP": "окно", "ko": "창문", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Я открываю [окно].", "나는 창문을 열어요."]}, {"w": "неде́ля", "wP": "неделя", "ko": "일주일, 한 주", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это хорошая [неделя].", "좋은 한 주예요."]}, {"w": "шко́ла", "wP": "школа", "ko": "학교", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Сын учится в [школе].", "아들은 학교에 다녀요."]}, {"w": "де́вочка", "wP": "девочка", "ko": "소녀", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["[Девочка] поёт песню.", "소녀가 노래를 불러요."]}, {"w": "мужчи́на", "wP": "мужчина", "ko": "남자", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-а / -я로 끝나지만 남자를 뜻해서 남성이에요.", "ex": ["Этот [мужчина] — мой папа.", "이 남자는 우리 아빠예요."]}, {"w": "плащ", "wP": "плащ", "ko": "우비, 망토", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это мой новый [плащ].", "이건 내 새 우비예요."]}, {"w": "кинотеа́тр", "wP": "кинотеатр", "ko": "영화관", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мы в [кинотеатре].", "우리는 영화관에 있어요."]}, {"w": "библиоте́ка", "wP": "библиотека", "ko": "도서관", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Студенты в [библиотеке].", "학생들은 도서관에 있어요."]}, {"w": "вокза́л", "wP": "вокзал", "ko": "기차역", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Папа на [вокзале].", "아빠는 기차역에 있어요."]}, {"w": "пло́щадь", "wP": "площадь", "ko": "광장", "pos": "n", "lvl": "beginner", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это Красная [площадь].", "여기는 붉은 광장이에요."]}, {"w": "банк", "wP": "банк", "ko": "은행", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Где [банк]?", "은행이 어디예요?"]}, {"w": "муж", "wP": "муж", "ko": "남편", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Её [муж] — профессор.", "그녀의 남편은 교수예요."]}, {"w": "друг", "wP": "друг", "ko": "친구", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это мой [друг] Антон.", "이쪽은 내 친구 안톤이에요."]}, {"w": "стул", "wP": "стул", "ko": "의자", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это новый [стул].", "이건 새 의자예요."]}, {"w": "сосе́д", "wP": "сосед", "ko": "이웃", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мой [сосед] — студент.", "내 이웃은 대학생이에요."]}, {"w": "я́блоко", "wP": "яблоко", "ko": "사과", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Я ем [яблоко].", "나는 사과를 먹어요."]}, {"w": "го́род", "wP": "город", "ko": "도시", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Москва — большой [город].", "모스크바는 큰 도시예요."]}, {"w": "па́спорт", "wP": "паспорт", "ko": "여권", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Где мой [паспорт]?", "내 여권 어디 있어?"]}, {"w": "глаз", "wP": "глаз", "ko": "눈(신체)", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["У неё голубые [глаза].", "그녀는 눈이 파래요."]}, {"w": "челове́к", "wP": "человек", "ko": "사람", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это хороший [человек].", "이 사람은 좋은 사람이에요."]}, {"w": "ребёнок", "wP": "ребёнок", "ko": "아이, 아기", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["[Ребёнок] спит.", "아기가 자요."]}, {"w": "жена́", "wP": "жена", "ko": "아내", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это моя [жена].", "이 사람은 제 아내예요."]}, {"w": "мя́со", "wP": "мясо", "ko": "고기", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Я не ем [мясо].", "나는 고기를 안 먹어요."]}, {"w": "карто́фель", "wP": "картофель", "ko": "감자", "pos": "n", "lvl": "beginner", "g": "m", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Мама готовит [картофель].", "엄마가 감자 요리를 해요."]}, {"w": "рис", "wP": "рис", "ko": "쌀", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мы едим [рис].", "우리는 밥(쌀)을 먹어요."]}, {"w": "виногра́д", "wP": "виноград", "ko": "포도", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Дети едят [виноград].", "아이들이 포도를 먹어요."]}, {"w": "часы́", "wP": "часы", "ko": "시계", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Это мои новые [часы].", "이건 내 새 시계예요."]}, {"w": "очки́", "wP": "очки", "ko": "안경", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Где мои [очки]?", "내 안경 어디 있어?"]}, {"w": "но́жницы", "wP": "ножницы", "ko": "가위", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["[Ножницы] на столе.", "가위는 책상 위에 있어요."]}, {"w": "брю́ки", "wP": "брюки", "ko": "바지", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Брат покупает [брюки].", "형이 바지를 사요."]}, {"w": "санато́рий", "wP": "санаторий", "ko": "요양원, 리조트", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Дедушка отдыхает в [санатории].", "할아버지는 요양원에서 쉬세요."]}, {"w": "по́чта", "wP": "почта", "ko": "우체국", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["[Почта] здесь.", "우체국은 여기에 있어요."]}, {"w": "общежи́тие", "wP": "общежитие", "ko": "기숙사", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Студенты живут в [общежитии].", "학생들은 기숙사에 살아요."]}, {"w": "апте́ка", "wP": "аптека", "ko": "약국", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Где [аптека]?", "약국이 어디예요?"]}, {"w": "больни́ца", "wP": "больница", "ko": "병원", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это новая [больница].", "이건 새 병원이에요."]}, {"w": "фи́рма", "wP": "фирма", "ko": "회사", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Брат работает в [фирме].", "형은 회사에서 일해요."]}, {"w": "кафе́", "wP": "кафе", "ko": "카페", "pos": "n", "lvl": "beginner", "g": "n", "gx": "외래어라서 모양은 안 바뀌지만 중성이에요.", "ex": ["Мы обедаем в [кафе].", "우리는 카페에서 점심을 먹어요."]}, {"w": "магази́н", "wP": "магазин", "ko": "가게, 상점", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мама в [магазине].", "엄마는 가게에 있어요."]}, {"w": "парк", "wP": "парк", "ko": "공원", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это красивый [парк].", "이건 아름다운 공원이에요."]}, {"w": "о́фис", "wP": "офис", "ko": "사무실", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Папа в [офисе].", "아빠는 사무실에 있어요."]}, {"w": "рестора́н", "wP": "ресторан", "ko": "레스토랑", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это хороший [ресторан].", "이건 좋은 레스토랑이에요."]}, {"w": "заво́д", "wP": "завод", "ko": "공장", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Дядя работает на [заводе].", "삼촌은 공장에서 일해요."]}, {"w": "стадио́н", "wP": "стадион", "ko": "경기장", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мы на [стадионе].", "우리는 경기장에 있어요."]}, {"w": "уро́к", "wP": "урок", "ko": "수업", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Студенты на [уроке].", "학생들은 수업 중이에요."]}, {"w": "конце́рт", "wP": "концерт", "ko": "콘서트", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Мы на [концерте].", "우리는 콘서트에 와 있어요."]}, {"w": "ле́кция", "wP": "лекция", "ko": "강의", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это интересная [лекция].", "이건 재미있는 강의예요."]}, {"w": "бале́т", "wP": "балет", "ko": "발레", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Я люблю [балет].", "나는 발레를 좋아해요."]}, {"w": "о́пера", "wP": "опера", "ko": "오페라", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Мама слушает [оперу].", "엄마는 오페라를 들어요."]}, {"w": "стол", "wP": "стол", "ko": "책상", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Книга на [столе].", "책은 책상 위에 있어요."]}, {"w": "джи́нсы", "wP": "джинсы", "ko": "청바지", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Это мои синие [джинсы].", "이건 내 파란 청바지예요."]}, {"w": "ю́бка", "wP": "юбка", "ko": "치마", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это красная [юбка].", "이건 빨간 치마예요."]}, {"w": "блу́зка", "wP": "блузка", "ko": "블라우스", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Это белая [блузка].", "이건 흰 블라우스예요."]}, {"w": "но́вый", "wP": "новый", "ko": "새로운", "pos": "adj", "lvl": "beginner", "ex": ["Это [новый] журнал.", "이건 새 잡지예요."]}, {"w": "ста́рый", "wP": "старый", "ko": "낡은, 오래된, 늙은", "pos": "adj", "lvl": "beginner", "ex": ["Это [старый] дом.", "이건 오래된 집이에요."]}, {"w": "молодо́й", "wP": "молодой", "ko": "젊은", "pos": "adj", "lvl": "beginner", "ex": ["Он [молодой] учитель.", "그는 젊은 선생님이에요."]}, {"w": "ста́рший", "wP": "старший", "ko": "나이가 더 많은", "pos": "adj", "lvl": "beginner", "ex": ["Это мой [старший] брат.", "이 사람은 우리 형이에요."]}, {"w": "мла́дший", "wP": "младший", "ko": "나이가 더 어린", "pos": "adj", "lvl": "beginner", "ex": ["Это моя [младшая] сестра.", "이 아이는 내 여동생이에요."]}, {"w": "ма́ленький", "wP": "маленький", "ko": "작은", "pos": "adj", "lvl": "beginner", "ex": ["Это [маленькая] комната.", "이건 작은 방이에요."]}, {"w": "большо́й", "wP": "большой", "ko": "큰", "pos": "adj", "lvl": "beginner", "ex": ["Это [большой] стадион.", "이건 큰 경기장이에요."]}, {"w": "хоро́ший", "wP": "хороший", "ko": "좋은", "pos": "adj", "lvl": "beginner", "ex": ["Это [хороший] фильм.", "이건 좋은 영화예요."]}, {"w": "плохо́й", "wP": "плохой", "ko": "나쁜", "pos": "adj", "lvl": "beginner", "ex": ["Сегодня [плохая] погода.", "오늘은 날씨가 나빠요."]}, {"w": "горя́чий", "wP": "горячий", "ko": "뜨거운", "pos": "adj", "lvl": "beginner", "ex": ["Это [горячий] чай.", "이건 뜨거운 차예요."]}, {"w": "холо́дный", "wP": "холодный", "ko": "차가운, 추운", "pos": "adj", "lvl": "beginner", "ex": ["Сегодня [холодный] день.", "오늘은 추운 날이에요."]}, {"w": "интере́сный", "wP": "интересный", "ko": "재미있는", "pos": "adj", "lvl": "beginner", "ex": ["Это [интересный] урок.", "이건 재미있는 수업이에요."]}, {"w": "неинтере́сный", "wP": "неинтересный", "ko": "재미없는", "pos": "adj", "lvl": "beginner", "ex": ["Это [неинтересный] фильм.", "이건 재미없는 영화예요."]}, {"w": "краси́вый", "wP": "красивый", "ko": "아름다운", "pos": "adj", "lvl": "beginner", "ex": ["Это [красивое] платье.", "이건 예쁜 원피스예요."]}, {"w": "некраси́вый", "wP": "некрасивый", "ko": "추한, 못생긴", "pos": "adj", "lvl": "beginner", "ex": ["Это [некрасивый] костюм.", "이건 못생긴 정장이에요."]}, {"w": "друго́й", "wP": "другой", "ko": "다른", "pos": "adj", "lvl": "beginner", "ex": ["Это [другая] книга.", "이건 다른 책이에요."]}, {"w": "чужо́й", "wP": "чужой", "ko": "타인의, 낯선", "pos": "adj", "lvl": "beginner", "ex": ["Это [чужая] сумка.", "이건 남의 가방이에요."]}, {"w": "ли́шний", "wP": "лишний", "ko": "남는, 잉여의", "pos": "adj", "lvl": "beginner", "ex": ["У меня [лишний] билет.", "나한테 남는 표가 있어요."]}, {"w": "дома́шний", "wP": "домашний", "ko": "집의, 집에서 만든", "pos": "adj", "lvl": "beginner", "ex": ["Это [домашнее] задание.", "이건 숙제예요."]}, {"w": "бе́лый", "wP": "белый", "ko": "흰", "pos": "adj", "lvl": "beginner", "ex": ["Это [белая] рубашка.", "이건 흰 셔츠예요."]}, {"w": "голубо́й", "wP": "голубой", "ko": "하늘색의, 푸른", "pos": "adj", "lvl": "beginner", "ex": ["Это [голубая] машина.", "이건 하늘색 자동차예요."]}, {"w": "жёлтый", "wP": "жёлтый", "ko": "노란", "pos": "adj", "lvl": "beginner", "ex": ["Это [жёлтый] автобус.", "이건 노란 버스예요."]}, {"w": "зелёный", "wP": "зелёный", "ko": "초록색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [зелёный] парк.", "이건 초록빛 공원이에요."]}, {"w": "кра́сный", "wP": "красный", "ko": "빨간", "pos": "adj", "lvl": "beginner", "ex": ["Это [красная] ручка.", "이건 빨간 펜이에요."]}, {"w": "кори́чневый", "wP": "коричневый", "ko": "갈색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [коричневый] стол.", "이건 갈색 책상이에요."]}, {"w": "ора́нжевый", "wP": "оранжевый", "ko": "주황색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [оранжевый] сок.", "이건 주황색 주스예요."]}, {"w": "ро́зовый", "wP": "розовый", "ko": "분홍색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [розовое] платье.", "이건 분홍색 원피스예요."]}, {"w": "се́рый", "wP": "серый", "ko": "회색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [серая] кошка.", "이건 회색 고양이예요."]}, {"w": "си́ний", "wP": "синий", "ko": "파란, 청색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [синие] джинсы.", "이건 파란 청바지예요."]}, {"w": "фиоле́товый", "wP": "фиолетовый", "ko": "보라색의", "pos": "adj", "lvl": "beginner", "ex": ["Это [фиолетовая] юбка.", "이건 보라색 치마예요."]}, {"w": "чёрный", "wP": "чёрный", "ko": "검은", "pos": "adj", "lvl": "beginner", "ex": ["Это [чёрное] пальто.", "이건 검은 코트예요."]}, {"w": "пальто́", "wP": "пальто", "ko": "코트", "pos": "n", "lvl": "beginner", "g": "n", "gx": "외래어라서 모양은 안 바뀌지만 중성이에요.", "ex": ["Это моё новое [пальто].", "이건 내 새 코트예요."]}, {"w": "пла́тье", "wP": "платье", "ko": "원피스", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Сестра покупает [платье].", "누나가 원피스를 사요."]}, {"w": "руба́шка", "wP": "рубашка", "ko": "셔츠", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Где моя [рубашка]?", "내 셔츠 어디 있어?"]}, {"w": "лю́ди", "wP": "люди", "ko": "사람들", "pos": "n", "lvl": "beginner", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Здесь живут хорошие [люди].", "여기에는 좋은 사람들이 살아요."]}, {"w": "уче́бник", "wP": "учебник", "ko": "교과서", "pos": "n", "lvl": "beginner", "g": "m", "gx": "", "ex": ["Это мой [учебник].", "이건 내 교과서예요."]}, {"w": "литерату́ра", "wP": "литература", "ko": "문학", "pos": "n", "lvl": "beginner", "g": "f", "gx": "", "ex": ["Я изучаю русскую [литературу].", "나는 러시아 문학을 공부해요."]}, {"w": "стихотворе́ние", "wP": "стихотворение", "ko": "시(한 편)", "pos": "n", "lvl": "beginner", "g": "n", "gx": "", "ex": ["Это красивое [стихотворение].", "이건 아름다운 시예요."]}, {"w": "Москва́", "wP": "Москва", "ko": "모스크바", "pos": "name", "lvl": "beginner", "ex": ["Мы живём в [Москве].", "우리는 모스크바에 살아요."]}, {"w": "Ива́н", "wP": "Иван", "ko": "이반(남자 이름)", "pos": "name", "lvl": "beginner", "ex": ["Это [Иван]. Он студент.", "이 사람은 이반이에요. 그는 대학생이에요."]}, {"w": "Су́здаль", "wP": "Суздаль", "ko": "수즈달(러시아 도시)", "pos": "name", "lvl": "beginner", "ex": ["Мы отдыхаем в [Суздале].", "우리는 수즈달에서 쉬어요."]}, {"w": "Кита́й", "wP": "Китай", "ko": "중국", "pos": "name", "lvl": "beginner", "ex": ["Брат живёт в [Китае].", "형은 중국에 살아요."]}, {"w": "Коре́я", "wP": "Корея", "ko": "한국", "pos": "name", "lvl": "beginner", "ex": ["[Корея] — моя страна.", "한국은 내 나라예요."]}, {"w": "Росси́я", "wP": "Россия", "ko": "러시아", "pos": "name", "lvl": "beginner", "ex": ["[Россия] — большая страна.", "러시아는 큰 나라예요."]}, {"w": "сто", "wP": "сто", "ko": "백, 100", "pos": "num", "lvl": "intermediate", "ex": ["[Сто] — это много.", "100은 많은 거예요."]}, {"w": "ты́сяча", "wP": "тысяча", "ko": "천, 1000", "pos": "num", "lvl": "intermediate", "ex": ["[Тысяча] — это очень много.", "1000은 아주 많은 거예요."]}, {"w": "здра́вствуйте", "wP": "здравствуйте", "ko": "안녕하세요", "pos": "phr", "lvl": "intermediate", "ex": ["[Здравствуйте]! Как вас зовут?", "안녕하세요! 이름이 뭐예요?"]}, {"w": "приве́т", "wP": "привет", "ko": "안녕(친한 사이 인사)", "pos": "phr", "lvl": "intermediate", "ex": ["[Привет], Антон!", "안녕, 안톤!"]}, {"w": "пока́", "wP": "пока", "ko": "잘 가, 안녕(친한 사이 작별)", "pos": "phr", "lvl": "intermediate", "ex": ["[Пока], до завтра!", "잘 가, 내일 봐!"]}, {"w": "пожа́луйста", "wP": "пожалуйста", "ko": "부탁합니다, 천만에요", "pos": "phr", "lvl": "intermediate", "ex": ["Спасибо! — [Пожалуйста].", "고마워요! — 천만에요."]}, {"w": "тру́дный", "wP": "трудный", "ko": "어려운", "pos": "adj", "lvl": "intermediate", "ex": ["Это [трудный] вопрос.", "이건 어려운 질문이에요."]}, {"w": "лёгкий", "wP": "лёгкий", "ko": "쉬운, 가벼운", "pos": "adj", "lvl": "intermediate", "ex": ["Это [лёгкое] упражнение.", "이건 쉬운 연습 문제예요."]}, {"w": "ру́сский", "wP": "русский", "ko": "러시아의", "pos": "adj", "lvl": "intermediate", "ex": ["Я изучаю [русский] язык.", "나는 러시아어를 공부해요."]}, {"w": "коре́йский", "wP": "корейский", "ko": "한국의", "pos": "adj", "lvl": "intermediate", "ex": ["Это [корейский] ресторан.", "이건 한국 식당이에요."]}, {"w": "хорошо́", "wP": "хорошо", "ko": "잘, 좋게", "pos": "adv", "lvl": "intermediate", "ex": ["Он [хорошо] говорит по-русски.", "그는 러시아어를 잘해요."]}, {"w": "пло́хо", "wP": "плохо", "ko": "나쁘게, 서툴게", "pos": "adv", "lvl": "intermediate", "ex": ["Я [плохо] понимаю по-русски.", "나는 러시아어를 잘 못 알아들어요."]}, {"w": "сейча́с", "wP": "сейчас", "ko": "지금", "pos": "adv", "lvl": "intermediate", "ex": ["[Сейчас] я обедаю.", "지금 나는 점심을 먹고 있어요."]}, {"w": "за́втра", "wP": "завтра", "ko": "내일", "pos": "adv", "lvl": "intermediate", "ex": ["[Завтра] мы отдыхаем.", "내일 우리는 쉬어요."]}, {"w": "вчера́", "wP": "вчера", "ko": "어제", "pos": "adv", "lvl": "intermediate", "ex": ["[Вчера] я был дома.", "어제 나는 집에 있었어요."]}, {"w": "всегда́", "wP": "всегда", "ko": "항상", "pos": "adv", "lvl": "intermediate", "ex": ["Он [всегда] читает газету.", "그는 항상 신문을 읽어요."]}, {"w": "никогда́", "wP": "никогда", "ko": "결코(한 번도) ~않다", "pos": "adv", "lvl": "intermediate", "ex": ["Я [никогда] не курю.", "나는 절대 담배를 피우지 않아요."]}, {"w": "ча́сто", "wP": "часто", "ko": "자주", "pos": "adv", "lvl": "intermediate", "ex": ["Мы [часто] гуляем в парке.", "우리는 자주 공원에서 산책해요."]}, {"w": "ре́дко", "wP": "редко", "ko": "드물게", "pos": "adv", "lvl": "intermediate", "ex": ["Папа [редко] отдыхает.", "아빠는 좀처럼 쉬지 않아요."]}, {"w": "о́чень", "wP": "очень", "ko": "매우", "pos": "adv", "lvl": "intermediate", "ex": ["Это [очень] интересная книга.", "이건 아주 재미있는 책이에요."]}, {"w": "мно́го", "wP": "много", "ko": "많이", "pos": "adv", "lvl": "intermediate", "ex": ["Он [много] работает.", "그는 일을 많이 해요."]}, {"w": "ма́ло", "wP": "мало", "ko": "적게, 조금", "pos": "adv", "lvl": "intermediate", "ex": ["Она [мало] спит.", "그녀는 잠을 조금밖에 안 자요."]}, {"w": "там", "wP": "там", "ko": "거기에", "pos": "adv", "lvl": "intermediate", "ex": ["Где словарь? — [Там].", "사전은 어디 있어요? — 저기요."]}, {"w": "до́ма", "wP": "дома", "ko": "집에(서)", "pos": "adv", "lvl": "intermediate", "ex": ["Вечером мы [дома].", "저녁에 우리는 집에 있어요."]}, {"w": "пото́м", "wP": "потом", "ko": "그다음에, 나중에", "pos": "adv", "lvl": "intermediate", "ex": ["Сначала мы обедаем, а [потом] гуляем.", "먼저 점심을 먹고, 그다음에 산책해요."]}, {"w": "уже́", "wP": "уже", "ko": "이미, 벌써", "pos": "adv", "lvl": "intermediate", "ex": ["Он [уже] дома.", "그는 벌써 집에 있어요."]}, {"w": "ещё", "wP": "ещё", "ko": "아직, 더", "pos": "adv", "lvl": "intermediate", "ex": ["Она [ещё] спит.", "그녀는 아직 자고 있어요."]}, {"w": "то́же", "wP": "тоже", "ko": "~도, 역시", "pos": "adv", "lvl": "intermediate", "ex": ["Я [тоже] студент.", "나도 대학생이에요."]}, {"w": "то́лько", "wP": "только", "ko": "오직, 단지", "pos": "adv", "lvl": "intermediate", "ex": ["Я говорю [только] по-русски.", "나는 러시아어만 해요."]}, {"w": "почему́", "wP": "почему", "ko": "왜", "pos": "func", "lvl": "intermediate", "ex": ["[Почему] ты не спишь?", "왜 안 자?"]}, {"w": "ско́лько", "wP": "сколько", "ko": "얼마나, 몇", "pos": "func", "lvl": "intermediate", "ex": ["[Сколько] это стоит?", "이거 얼마예요?"]}, {"w": "и", "wP": "и", "ko": "그리고", "pos": "func", "lvl": "intermediate", "ex": ["Брат [и] сестра дома.", "형과 누나는 집에 있어요."]}, {"w": "а", "wP": "а", "ko": "그런데, 한편", "pos": "func", "lvl": "intermediate", "ex": ["Я студент, [а] он учитель.", "나는 대학생이고, 그는 선생님이에요."]}, {"w": "но", "wP": "но", "ko": "하지만", "pos": "func", "lvl": "intermediate", "ex": ["Это старый дом, [но] красивый.", "이건 오래된 집이지만 예뻐요."]}, {"w": "и́ли", "wP": "или", "ko": "또는", "pos": "func", "lvl": "intermediate", "ex": ["Чай [или] кофе?", "차 아니면 커피?"]}, {"w": "потому́ что", "wP": "потому что", "ko": "왜냐하면", "pos": "func", "lvl": "intermediate", "ex": ["Я дома, [потому что] я болею.", "나는 아파서 집에 있어요."]}, {"w": "у́тро", "wP": "утро", "ko": "아침", "pos": "n", "lvl": "intermediate", "g": "n", "gx": "", "ex": ["Доброе [утро]!", "좋은 아침이에요!"]}, {"w": "ве́чер", "wP": "вечер", "ko": "저녁", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Добрый [вечер]!", "좋은 저녁이에요!"]}, {"w": "ме́сяц", "wP": "месяц", "ko": "달, 월(月)", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Отпуск — один [месяц].", "휴가는 한 달이에요."]}, {"w": "ле́то", "wP": "лето", "ko": "여름", "pos": "n", "lvl": "intermediate", "g": "n", "gx": "", "ex": ["Сейчас [лето].", "지금은 여름이에요."]}, {"w": "зима́", "wP": "зима", "ko": "겨울", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["В Москве холодная [зима].", "모스크바는 겨울이 추워요."]}, {"w": "весна́", "wP": "весна", "ko": "봄", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["[Весна] — красивое время.", "봄은 아름다운 계절이에요."]}, {"w": "о́сень", "wP": "осень", "ko": "가을", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["[Осень] в Корее красивая.", "한국의 가을은 아름다워요."]}, {"w": "час", "wP": "час", "ko": "한 시간, ~시(時)", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Урок — один [час].", "수업은 한 시간이에요."]}, {"w": "мину́та", "wP": "минута", "ko": "분(分)", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Одну [минуту]!", "잠깐만요!"]}, {"w": "страна́", "wP": "страна", "ko": "나라", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Корея — красивая [страна].", "한국은 아름다운 나라예요."]}, {"w": "язы́к", "wP": "язык", "ko": "언어, 혀", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Русский [язык] трудный?", "러시아어는 어려워요?"]}, {"w": "рабо́та", "wP": "работа", "ko": "일, 직장", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Папа на [работе].", "아빠는 직장에 있어요."]}, {"w": "ко́мната", "wP": "комната", "ko": "방", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Это моя [комната].", "이건 내 방이에요."]}, {"w": "кварти́ра", "wP": "квартира", "ko": "아파트(집)", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Это наша новая [квартира].", "이건 우리 새 아파트예요."]}, {"w": "дверь", "wP": "дверь", "ko": "문", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Я открываю [дверь].", "나는 문을 열어요."]}, {"w": "маши́на", "wP": "машина", "ko": "자동차", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Это наша [машина].", "이건 우리 차예요."]}, {"w": "авто́бус", "wP": "автобус", "ko": "버스", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Я жду [автобус].", "나는 버스를 기다려요."]}, {"w": "метро́", "wP": "метро", "ko": "지하철", "pos": "n", "lvl": "intermediate", "g": "n", "gx": "외래어라서 모양은 안 바뀌지만 중성이에요.", "ex": ["Мы едем на [метро].", "우리는 지하철을 타고 가요."]}, {"w": "у́лица", "wP": "улица", "ko": "거리", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Дети на [улице].", "아이들은 밖(거리)에 있어요."]}, {"w": "хлеб", "wP": "хлеб", "ko": "빵", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Я покупаю [хлеб].", "나는 빵을 사요."]}, {"w": "молоко́", "wP": "молоко", "ko": "우유", "pos": "n", "lvl": "intermediate", "g": "n", "gx": "", "ex": ["Ребёнок пьёт [молоко].", "아기가 우유를 마셔요."]}, {"w": "чай", "wP": "чай", "ko": "차(茶)", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Вы пьёте [чай]?", "차 마시나요?"]}, {"w": "ко́фе", "wP": "кофе", "ko": "커피", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "кофе는 -е로 끝나지만 남성이에요.", "ex": ["Я пью [кофе].", "나는 커피를 마셔요."]}, {"w": "вопро́с", "wP": "вопрос", "ko": "질문", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["У меня [вопрос].", "질문이 있어요."]}, {"w": "отве́т", "wP": "ответ", "ko": "대답", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Это правильный [ответ].", "이게 맞는 답이에요."]}, {"w": "пого́да", "wP": "погода", "ko": "날씨", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["Сегодня хорошая [погода].", "오늘은 날씨가 좋아요."]}, {"w": "телефо́н", "wP": "телефон", "ko": "전화(기)", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Где мой [телефон]?", "내 휴대폰 어디 있어?"]}, {"w": "фильм", "wP": "фильм", "ko": "영화", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Мы смотрим [фильм].", "우리는 영화를 봐요."]}, {"w": "фо́то", "wP": "фото", "ko": "사진", "pos": "n", "lvl": "intermediate", "g": "n", "gx": "외래어라서 모양은 안 바뀌지만 중성이에요.", "ex": ["Это моё [фото].", "이건 내 사진이에요."]}, {"w": "рука́", "wP": "рука", "ko": "손, 팔", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["У меня болит [рука].", "손(팔)이 아파요."]}, {"w": "нога́", "wP": "нога", "ko": "발, 다리", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["У меня болит [нога].", "다리가 아파요."]}, {"w": "голова́", "wP": "голова", "ko": "머리", "pos": "n", "lvl": "intermediate", "g": "f", "gx": "", "ex": ["У меня болит [голова].", "머리가 아파요."]}, {"w": "де́ньги", "wP": "деньги", "ko": "돈", "pos": "n", "lvl": "intermediate", "g": "pl", "gx": "복수로만 쓰거나 복수형인 단어예요.", "ex": ["Где мои [деньги]?", "내 돈 어디 있지?"]}, {"w": "пода́рок", "wP": "подарок", "ko": "선물", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Это [подарок] для тебя.", "이건 너를 위한 선물이야."]}, {"w": "пра́здник", "wP": "праздник", "ko": "명절, 축제", "pos": "n", "lvl": "intermediate", "g": "m", "gx": "", "ex": ["Сегодня [праздник].", "오늘은 명절이에요."]}, {"w": "день рожде́ния", "wP": "день рождения", "ko": "생일", "pos": "n", "lvl": "intermediate", "ex": ["Сегодня мой [день рождения].", "오늘은 내 생일이에요."]}, {"w": "знать", "wP": "знать", "ko": "알다", "pos": "v", "lvl": "beginner", "ex": ["Я [знаю] Анну.", "나는 안나를 알아요."]}, {"w": "понима́ть", "wP": "понимать", "ko": "이해하다", "pos": "v", "lvl": "beginner", "ex": ["Вы [понимаете] по-русски?", "러시아어 알아들으세요?"]}, {"w": "де́лать", "wP": "делать", "ko": "하다, 만들다", "pos": "v", "lvl": "beginner", "ex": ["Что ты [делаешь]?", "너 뭐 해?"]}, {"w": "ду́мать", "wP": "думать", "ko": "생각하다", "pos": "v", "lvl": "beginner", "ex": ["Я [думаю] о маме.", "나는 엄마를 생각해요."]}, {"w": "слу́шать", "wP": "слушать", "ko": "듣다", "pos": "v", "lvl": "beginner", "ex": ["Мы [слушаем] музыку.", "우리는 음악을 들어요."]}, {"w": "смотре́ть", "wP": "смотреть", "ko": "(의지를 갖고) 보다", "pos": "v", "lvl": "beginner", "ex": ["Дети [смотрят] фильм.", "아이들이 영화를 봐요."]}, {"w": "люби́ть", "wP": "любить", "ko": "사랑하다, 좋아하다", "pos": "v", "lvl": "intermediate", "ex": ["Я [люблю] маму.", "나는 엄마를 사랑해요."]}, {"w": "хоте́ть", "wP": "хотеть", "ko": "원하다", "pos": "v", "lvl": "intermediate", "ex": ["Я [хочу] кофе.", "나는 커피를 마시고 싶어요."]}, {"w": "мочь", "wP": "мочь", "ko": "할 수 있다", "pos": "v", "lvl": "intermediate", "ex": ["Я не [могу] спать.", "나는 잠을 잘 수가 없어요."]}, {"w": "идти́", "wP": "идти", "ko": "(걸어서) 가다", "pos": "v", "lvl": "beginner", "ex": ["Я [иду] в школу.", "나는 학교에 가고 있어요."]}, {"w": "е́хать", "wP": "ехать", "ko": "(차를 타고) 가다", "pos": "v", "lvl": "beginner", "ex": ["Мы [едем] в Москву.", "우리는 모스크바에 가요(타고)."]}, {"w": "писа́ть", "wP": "писать", "ko": "쓰다", "pos": "v", "lvl": "intermediate", "ex": ["Сестра [пишет] стихи.", "누나는 시를 써요."]}, {"w": "спра́шивать", "wP": "спрашивать", "ko": "묻다", "pos": "v", "lvl": "beginner", "ex": ["Учитель [спрашивает] студента.", "선생님이 학생에게 질문해요."]}, {"w": "отвеча́ть", "wP": "отвечать", "ko": "대답하다", "pos": "v", "lvl": "beginner", "ex": ["Студент [отвечает] на вопрос.", "학생이 질문에 대답해요."]}, {"w": "покупа́ть", "wP": "покупать", "ko": "사다", "pos": "v", "lvl": "intermediate", "ex": ["Мама [покупает] хлеб.", "엄마가 빵을 사요."]}, {"w": "спать", "wP": "спать", "ko": "자다", "pos": "v", "lvl": "intermediate", "ex": ["Я [сплю] дома.", "나는 집에서 자요."]}, {"w": "ви́деть", "wP": "видеть", "ko": "(눈에) 보이다", "pos": "v", "lvl": "beginner", "ex": ["Я [вижу] море.", "바다가 보여요."]}, {"w": "игра́ть", "wP": "играть", "ko": "놀다, (게임을) 하다", "pos": "v", "lvl": "beginner", "ex": ["Дети [играют] в парке.", "아이들이 공원에서 놀아요."]}, {"w": "петь", "wP": "петь", "ko": "노래하다", "pos": "v", "lvl": "intermediate", "ex": ["Она [поёт] песню.", "그녀는 노래를 불러요."]}, {"w": "звони́ть", "wP": "звонить", "ko": "전화하다", "pos": "v", "lvl": "intermediate", "ex": ["Я [звоню] маме.", "나는 엄마에게 전화해요."]}, {"w": "ждать", "wP": "ждать", "ko": "기다리다", "pos": "v", "lvl": "intermediate", "ex": ["Мы [ждём] автобус.", "우리는 버스를 기다려요."]}, {"w": "помога́ть", "wP": "помогать", "ko": "돕다", "pos": "v", "lvl": "intermediate", "ex": ["Я [помогаю] маме.", "나는 엄마를 도와요."]}, {"w": "начина́ть", "wP": "начинать", "ko": "시작하다", "pos": "v", "lvl": "beginner", "ex": ["Мы [начинаем] урок.", "우리는 수업을 시작해요."]}, {"w": "конча́ть", "wP": "кончать", "ko": "끝내다", "pos": "v", "lvl": "beginner", "ex": ["Мы [кончаем] работу.", "우리는 일을 끝내요."]}, {"w": "ва́жный", "wP": "важный", "ko": "중요한", "pos": "adj", "lvl": "advanced", "ex": ["Это [важный] вопрос.", "이건 중요한 질문이에요."]}, {"w": "гла́вный", "wP": "главный", "ko": "주요한, 가장 중요한", "pos": "adj", "lvl": "advanced", "ex": ["Это [главная] улица.", "이건 중심가예요."]}, {"w": "ну́жный", "wP": "нужный", "ko": "필요한", "pos": "adj", "lvl": "advanced", "ex": ["Это [нужная] книга.", "이건 필요한 책이에요."]}, {"w": "свобо́дный", "wP": "свободный", "ko": "자유로운, 한가한", "pos": "adj", "lvl": "advanced", "ex": ["У меня [свободный] день.", "오늘은 한가한 날이에요."]}, {"w": "за́нятый", "wP": "занятый", "ko": "바쁜", "pos": "adj", "lvl": "advanced", "ex": ["Он [занятый] человек.", "그는 바쁜 사람이에요."]}, {"w": "счастли́вый", "wP": "счастливый", "ko": "행복한", "pos": "adj", "lvl": "advanced", "ex": ["Это [счастливый] день.", "행복한 날이에요."]}, {"w": "гру́стный", "wP": "грустный", "ko": "슬픈", "pos": "adj", "lvl": "advanced", "ex": ["Это [грустная] песня.", "이건 슬픈 노래예요."]}, {"w": "весёлый", "wP": "весёлый", "ko": "즐거운, 명랑한", "pos": "adj", "lvl": "advanced", "ex": ["Это [весёлый] праздник.", "즐거운 명절이에요."]}, {"w": "у́мный", "wP": "умный", "ko": "똑똑한", "pos": "adj", "lvl": "advanced", "ex": ["Она [умная] девочка.", "그녀는 똑똑한 아이예요."]}, {"w": "до́брый", "wP": "добрый", "ko": "친절한, 착한", "pos": "adj", "lvl": "advanced", "ex": ["Он [добрый] человек.", "그는 착한 사람이에요."]}, {"w": "тёплый", "wP": "тёплый", "ko": "따뜻한", "pos": "adj", "lvl": "advanced", "ex": ["Сегодня [тёплый] день.", "오늘은 따뜻한 날이에요."]}, {"w": "жа́ркий", "wP": "жаркий", "ko": "더운", "pos": "adj", "lvl": "advanced", "ex": ["Это [жаркое] лето.", "더운 여름이에요."]}, {"w": "дорого́й", "wP": "дорогой", "ko": "비싼, 소중한", "pos": "adj", "lvl": "advanced", "ex": ["Это [дорогая] машина.", "이건 비싼 차예요."]}, {"w": "дешёвый", "wP": "дешёвый", "ko": "값싼", "pos": "adj", "lvl": "advanced", "ex": ["Это [дешёвый] телефон.", "이건 싼 휴대폰이에요."]}, {"w": "бы́стрый", "wP": "быстрый", "ko": "빠른", "pos": "adj", "lvl": "advanced", "ex": ["Это [быстрый] поезд.", "이건 빠른 기차예요."]}, {"w": "ме́дленный", "wP": "медленный", "ko": "느린", "pos": "adj", "lvl": "advanced", "ex": ["Это [медленный] автобус.", "이건 느린 버스예요."]}, {"w": "бли́зкий", "wP": "близкий", "ko": "가까운", "pos": "adj", "lvl": "advanced", "ex": ["Это мой [близкий] друг.", "이 사람은 내 가까운 친구예요."]}, {"w": "далёкий", "wP": "далёкий", "ko": "먼", "pos": "adj", "lvl": "advanced", "ex": ["Это [далёкая] страна.", "그곳은 먼 나라예요."]}, {"w": "после́дний", "wP": "последний", "ko": "마지막의", "pos": "adj", "lvl": "advanced", "ex": ["Это [последний] урок.", "이건 마지막 수업이에요."]}, {"w": "сле́дующий", "wP": "следующий", "ko": "다음의", "pos": "adj", "lvl": "advanced", "ex": ["Это [следующий] вопрос.", "이게 다음 질문이에요."]}, {"w": "ра́но", "wP": "рано", "ko": "일찍", "pos": "adv", "lvl": "advanced", "ex": ["Я встаю [рано].", "나는 일찍 일어나요."]}, {"w": "по́здно", "wP": "поздно", "ko": "늦게", "pos": "adv", "lvl": "advanced", "ex": ["Уже [поздно].", "벌써 늦었어요."]}, {"w": "бы́стро", "wP": "быстро", "ko": "빨리", "pos": "adv", "lvl": "advanced", "ex": ["Он [быстро] говорит.", "그는 말을 빨리 해요."]}, {"w": "ме́дленно", "wP": "медленно", "ko": "천천히", "pos": "adv", "lvl": "advanced", "ex": ["Говорите [медленно], пожалуйста.", "천천히 말해 주세요."]}, {"w": "далеко́", "wP": "далеко", "ko": "멀리", "pos": "adv", "lvl": "advanced", "ex": ["Вокзал [далеко]?", "기차역이 멀어요?"]}, {"w": "на́до", "wP": "надо", "ko": "~해야 한다", "pos": "adv", "lvl": "advanced", "ex": ["Мне [надо] работать.", "나는 일해야 해요."]}, {"w": "мо́жно", "wP": "можно", "ko": "~해도 된다", "pos": "adv", "lvl": "advanced", "ex": ["Здесь [можно] курить?", "여기서 담배 피워도 돼요?"]}, {"w": "нельзя́", "wP": "нельзя", "ko": "~하면 안 된다", "pos": "adv", "lvl": "advanced", "ex": ["Здесь [нельзя] курить.", "여기서는 담배를 피우면 안 돼요."]}, {"w": "ну́жно", "wP": "нужно", "ko": "필요하다", "pos": "adv", "lvl": "advanced", "ex": ["Мне [нужно] лекарство.", "나는 약이 필요해요."]}, {"w": "наве́рное", "wP": "наверное", "ko": "아마", "pos": "adv", "lvl": "advanced", "ex": ["Он, [наверное], дома.", "그는 아마 집에 있을 거예요."]}, {"w": "коне́чно", "wP": "конечно", "ko": "물론", "pos": "adv", "lvl": "advanced", "ex": ["[Конечно], я понимаю.", "물론이죠, 이해해요."]}, {"w": "вме́сте", "wP": "вместе", "ko": "함께", "pos": "adv", "lvl": "advanced", "ex": ["Мы работаем [вместе].", "우리는 함께 일해요."]}, {"w": "сно́ва", "wP": "снова", "ko": "다시", "pos": "adv", "lvl": "advanced", "ex": ["Мы [снова] на море.", "우리는 다시 바닷가에 와 있어요."]}, {"w": "сра́зу", "wP": "сразу", "ko": "곧바로", "pos": "adv", "lvl": "advanced", "ex": ["Он [сразу] отвечает.", "그는 곧바로 대답해요."]}, {"w": "иногда́", "wP": "иногда", "ko": "가끔", "pos": "adv", "lvl": "advanced", "ex": ["[Иногда] мы обедаем в кафе.", "가끔 우리는 카페에서 점심을 먹어요."]}, {"w": "обы́чно", "wP": "обычно", "ko": "보통, 대개", "pos": "adv", "lvl": "advanced", "ex": ["[Обычно] я завтракаю дома.", "보통 나는 집에서 아침을 먹어요."]}, {"w": "давно́", "wP": "давно", "ko": "오래전에", "pos": "adv", "lvl": "advanced", "ex": ["Я [давно] живу здесь.", "나는 오래전부터 여기 살아요."]}, {"w": "неда́вно", "wP": "недавно", "ko": "최근에", "pos": "adv", "lvl": "advanced", "ex": ["Он [недавно] живёт в Москве.", "그는 모스크바에 산 지 얼마 안 됐어요."]}, {"w": "жизнь", "wP": "жизнь", "ko": "삶, 인생", "pos": "n", "lvl": "advanced", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это моя [жизнь].", "이게 내 인생이에요."]}, {"w": "мир", "wP": "мир", "ko": "세계, 평화", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Это большой [мир].", "세상은 넓어요."]}, {"w": "де́ло", "wP": "дело", "ko": "일, 용무", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["Как [дела]?", "어떻게 지내요? (일들은 어때요?)"]}, {"w": "исто́рия", "wP": "история", "ko": "역사, 이야기", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Я изучаю [историю].", "나는 역사를 공부해요."]}, {"w": "наро́д", "wP": "народ", "ko": "국민, 민중", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Русский [народ] любит музыку.", "러시아 사람들은 음악을 좋아해요."]}, {"w": "о́бщество", "wP": "общество", "ko": "사회", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["Это наше [общество].", "이게 우리 사회예요."]}, {"w": "пробле́ма", "wP": "проблема", "ko": "문제", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Это не [проблема].", "그건 문제가 아니에요."]}, {"w": "реше́ние", "wP": "решение", "ko": "결정, 해결", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["Это хорошее [решение].", "이건 좋은 결정이에요."]}, {"w": "мысль", "wP": "мысль", "ko": "생각", "pos": "n", "lvl": "advanced", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это хорошая [мысль].", "좋은 생각이에요."]}, {"w": "путеше́ствие", "wP": "путешествие", "ko": "여행", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["Это интересное [путешествие].", "재미있는 여행이에요."]}, {"w": "по́езд", "wP": "поезд", "ko": "기차", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Мы едем на [поезде].", "우리는 기차를 타고 가요."]}, {"w": "самолёт", "wP": "самолёт", "ko": "비행기", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Это большой [самолёт].", "이건 큰 비행기예요."]}, {"w": "биле́т", "wP": "билет", "ko": "표, 티켓", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Где мой [билет]?", "내 표 어디 있어?"]}, {"w": "о́тпуск", "wP": "отпуск", "ko": "휴가", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Сейчас у меня [отпуск].", "지금 나는 휴가 중이에요."]}, {"w": "зарпла́та", "wP": "зарплата", "ko": "월급", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["У него хорошая [зарплата].", "그는 월급이 좋아요."]}, {"w": "нача́льник", "wP": "начальник", "ko": "상사", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Мой [начальник] — молодой человек.", "우리 상사는 젊은 사람이에요."]}, {"w": "колле́га", "wP": "коллега", "ko": "동료", "pos": "n", "lvl": "advanced", "ex": ["Это моя [коллега] Анна.", "이쪽은 제 동료 안나예요."]}, {"w": "лека́рство", "wP": "лекарство", "ko": "약", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["Это хорошее [лекарство].", "이건 좋은 약이에요."]}, {"w": "здоро́вье", "wP": "здоровье", "ko": "건강", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["[Здоровье] — это главное.", "건강이 제일 중요해요."]}, {"w": "боле́знь", "wP": "болезнь", "ko": "병, 질병", "pos": "n", "lvl": "advanced", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Это серьёзная [болезнь].", "심각한 병이에요."]}, {"w": "сове́т", "wP": "совет", "ko": "조언", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Спасибо за [совет].", "조언 고마워요."]}, {"w": "по́мощь", "wP": "помощь", "ko": "도움", "pos": "n", "lvl": "advanced", "g": "f", "gx": "-ь로 끝나는 명사는 성을 따로 외워야 해요.", "ex": ["Спасибо за [помощь].", "도와줘서 고마워요."]}, {"w": "пра́вда", "wP": "правда", "ko": "진실, 사실", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Это [правда]?", "그거 사실이에요?"]}, {"w": "оши́бка", "wP": "ошибка", "ko": "실수, 오류", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Это моя [ошибка].", "이건 내 실수예요."]}, {"w": "приме́р", "wP": "пример", "ko": "예, 보기", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Это хороший [пример].", "좋은 예예요."]}, {"w": "ра́зница", "wP": "разница", "ko": "차이", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Какая [разница]?", "무슨 차이가 있어요?"]}, {"w": "иссле́дование", "wP": "исследование", "ko": "연구", "pos": "n", "lvl": "advanced", "g": "n", "gx": "", "ex": ["Это важное [исследование].", "이건 중요한 연구예요."]}, {"w": "нау́ка", "wP": "наука", "ko": "과학", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Я люблю [науку].", "나는 과학을 좋아해요."]}, {"w": "учёный", "wP": "учёный", "ko": "과학자, 학자", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["Мой папа — [учёный].", "우리 아빠는 과학자예요."]}, {"w": "лаборато́рия", "wP": "лаборатория", "ko": "실험실", "pos": "n", "lvl": "advanced", "g": "f", "gx": "", "ex": ["Я работаю в [лаборатории].", "나는 실험실에서 일해요."]}, {"w": "о́пыт", "wP": "опыт", "ko": "경험, 실험", "pos": "n", "lvl": "advanced", "g": "m", "gx": "", "ex": ["У него большой [опыт].", "그는 경험이 많아요."]}, {"w": "расска́зывать", "wP": "рассказывать", "ko": "(누구에게) 이야기해 주다, 들려주다", "pos": "v", "lvl": "beginner", "ex": ["Бабушка [рассказывает] историю.", "할머니가 이야기를 들려주세요."]}, {"w": "объясня́ть", "wP": "объяснять", "ko": "설명하다", "pos": "v", "lvl": "advanced", "ex": ["Учитель [объясняет] урок.", "선생님이 수업 내용을 설명해요."]}, {"w": "реша́ть", "wP": "решать", "ko": "결정하다, (문제를) 풀다", "pos": "v", "lvl": "advanced", "ex": ["Я [решаю] задачу.", "나는 문제를 풀어요."]}, {"w": "забыва́ть", "wP": "забывать", "ko": "잊다", "pos": "v", "lvl": "advanced", "ex": ["Я часто [забываю] слова.", "나는 단어를 자주 잊어버려요."]}, {"w": "по́мнить", "wP": "помнить", "ko": "기억하다", "pos": "v", "lvl": "advanced", "ex": ["Я [помню] этот день.", "나는 그날을 기억해요."]}, {"w": "встреча́ть", "wP": "встречать", "ko": "만나다, 맞이하다", "pos": "v", "lvl": "beginner", "ex": ["Мы [встречаем] друга на вокзале.", "우리는 역에서 친구를 마중해요."]}, {"w": "гото́вить", "wP": "готовить", "ko": "요리하다, 준비하다", "pos": "v", "lvl": "advanced", "ex": ["Мама [готовит] ужин.", "엄마가 저녁을 준비해요."]}, {"w": "убира́ть", "wP": "убирать", "ko": "청소하다, 치우다", "pos": "v", "lvl": "advanced", "ex": ["Я [убираю] комнату.", "나는 방을 청소해요."]}, {"w": "мыть", "wP": "мыть", "ko": "씻다", "pos": "v", "lvl": "advanced", "ex": ["Я [мою] руки.", "나는 손을 씻어요."]}, {"w": "брать", "wP": "брать", "ko": "가지다, 집다", "pos": "v", "lvl": "advanced", "ex": ["Я [беру] книгу.", "나는 책을 집어요."]}, {"w": "дава́ть", "wP": "давать", "ko": "주다", "pos": "v", "lvl": "advanced", "ex": ["Мама [даёт] сыну яблоко.", "엄마가 아들에게 사과를 줘요."]}, {"w": "проси́ть", "wP": "просить", "ko": "부탁하다", "pos": "v", "lvl": "advanced", "ex": ["Он [просит] книгу.", "그는 책을 달라고 부탁해요."]}, {"w": "сове́товать", "wP": "советовать", "ko": "조언하다", "pos": "v", "lvl": "advanced", "ex": ["Я [советую] тебе читать.", "너에게 책 읽기를 권해."]}, {"w": "боле́ть", "wP": "болеть", "ko": "아프다", "pos": "v", "lvl": "advanced", "ex": ["Я [болею].", "나는 아파요."]}, {"w": "лечи́ть", "wP": "лечить", "ko": "치료하다", "pos": "v", "lvl": "advanced", "ex": ["Врач [лечит] людей.", "의사는 사람들을 치료해요."]}, {"w": "путеше́ствовать", "wP": "путешествовать", "ko": "여행하다", "pos": "v", "lvl": "advanced", "ex": ["Мы любим [путешествовать].", "우리는 여행하는 걸 좋아해요."]}, {"w": "наде́яться", "wP": "надеяться", "ko": "바라다, 희망하다", "pos": "v", "lvl": "advanced", "ex": ["Я [надеюсь], что всё хорошо.", "다 잘 되길 바라요."]}, {"w": "нра́виться", "wP": "нравиться", "ko": "마음에 들다", "pos": "v", "lvl": "advanced", "ex": ["Мне [нравится] Москва.", "나는 모스크바가 마음에 들어요."]}, {"w": "боя́ться", "wP": "бояться", "ko": "무서워하다", "pos": "v", "lvl": "advanced", "ex": ["Я [боюсь] собак.", "나는 개를 무서워해요."]}, {"w": "улыба́ться", "wP": "улыбаться", "ko": "미소 짓다", "pos": "v", "lvl": "advanced", "ex": ["Девочка [улыбается].", "소녀가 미소 지어요."]}, {"w": "смея́ться", "wP": "смеяться", "ko": "웃다", "pos": "v", "lvl": "advanced", "ex": ["Дети [смеются].", "아이들이 웃어요."]}, {"w": "пла́кать", "wP": "плакать", "ko": "울다", "pos": "v", "lvl": "advanced", "ex": ["Ребёнок [плачет].", "아기가 울어요."]}, {"w": "танцева́ть", "wP": "танцевать", "ko": "춤추다", "pos": "v", "lvl": "advanced", "ex": ["Она хорошо [танцует].", "그녀는 춤을 잘 춰요."]}, {"w": "рисова́ть", "wP": "рисовать", "ko": "그리다", "pos": "v", "lvl": "advanced", "ex": ["Мальчик [рисует] дом.", "소년이 집을 그려요."]}, {"w": "фотографи́ровать", "wP": "фотографировать", "ko": "사진을 찍다", "pos": "v", "lvl": "advanced", "ex": ["Я [фотографирую] море.", "나는 바다 사진을 찍어요."]}, {"w": "иска́ть", "wP": "искать", "ko": "찾다", "pos": "v", "lvl": "advanced", "ex": ["Я [ищу] ключ.", "나는 열쇠를 찾고 있어요."]}, {"w": "находи́ть", "wP": "находить", "ko": "찾아내다, 발견하다", "pos": "v", "lvl": "advanced", "ex": ["Он всегда [находит] ответ.", "그는 항상 답을 찾아내요."]}, {"w": "приглаша́ть", "wP": "приглашать", "ko": "초대하다", "pos": "v", "lvl": "beginner", "ex": ["Я [приглашаю] друга.", "나는 친구를 초대해요."]}, {"w": "начина́ться", "wP": "начинаться", "ko": "시작되다", "pos": "v", "lvl": "beginner", "ex": ["Урок [начинается].", "수업이 시작돼요."]}, {"w": "конча́ться", "wP": "кончаться", "ko": "끝나다", "pos": "v", "lvl": "beginner", "ex": ["Фильм [кончается].", "영화가 끝나요."]}];
const DEM = { m:"э́тот", f:"э́та", n:"э́то", pl:"э́ти" };
const DEMP = { m:"этот", f:"эта", n:"это", pl:"эти" };
const GNAME = { m:"남성", f:"여성", n:"중성", pl:"복수" };
const GREASON = { m:"남성 명사는 자음 · -й · (일부) -ь로 끝나요 → <b class='cy'>э́тот</b>",
  f:"여성 명사는 -а · -я · (일부) -ь로 끝나요 → <b class='cy'>э́та</b>",
  n:"중성 명사는 -о · -е · -мя로 끝나요 → <b class='cy'>э́то</b>",
  pl:"복수 명사에는 성과 상관없이 <b class='cy'>э́ти</b>를 써요." };
const KNUM = ["","하나","둘","셋","넷","다섯","여섯","일곱","여덟","아홉","열"];
const KORD = ["","첫 번째","두 번째","세 번째","네 번째","다섯 번째","여섯 번째","일곱 번째","여덟 번째","아홉 번째","열 번째"];
const numLabel = w => w.pos==="ord" ? `${w.n}번째 (${KORD[w.n]})` : `${w.n} (${KNUM[w.n]})`;
const NUMS = () => VOCAB.filter(w => w.n);
const numFind = (pos, n) => NUMS().find(w => w.pos===pos && w.n===n);
function numNear(pos, n, k){
  const c = [n-1, n+1, n-2, n+2, n-3, n+3].filter(x => x>=1 && x<=10);
  return shuffle(c.slice(0,4)).slice(0,k).map(x => numFind(pos, x));
}
/* 문장 속 두 단어: 한국어 문장을 보고 주어·목적어에 들어갈 러시아어 고르기 */
const SUBJ = [["ма́ма","엄마"],["па́па","아빠"],["брат","형"],["сестра́","누나"],["де́душка","할아버지"],["ба́бушка","할머니"],
  ["друг","친구"],["сын","아들"],["дочь","딸"],["учи́тель","선생님"],["студе́нт","대학생"],["студе́нтка","여대생"],["де́вочка","소녀"],
  ["ма́льчик","소년"],["врач","의사"],["профе́ссор","교수님"],["сосе́д","이웃"],["А́нна","안나"],["Анто́н","안톤"]];
const josa = (ko, a, b) => { const c = ko.charCodeAt(ko.length-1); return (c>=0xAC00 && c<=0xD7A3 && (c-0xAC00)%28) ? a : b; };
function sentItems(lv){
  const order = ["beginner","intermediate","advanced"], upto = order.slice(0, order.indexOf(lv)+1);
  return V3.verbs.filter(v => upto.includes(v.lvl) && v.tr).flatMap(v => v.objs.filter(k => k!=="*").map(k => ({ v, ok:k, ko:v.ko })));
}
function buildTwo(it){
  const v = it.v, o = V3.objs[it.ok];
  const subs = SUBJ.filter(x => x[0].replace(/\u0301/g,"")!==o.nomP);
  const s = pick1(subs);
  const sOpts = [s[0].replace(/\u0301/g,""), ...shuffle(subs.filter(x => x!==s && x[1]!==s[1])).slice(0,3).map(x => x[0].replace(/\u0301/g,""))];
  const pool = v.objs.filter(k => k!=="*" && k!==it.ok).map(k => V3.objs[k]).filter(x => x.ko!==o.ko);
  const extra = shuffle(Object.values(V3.objs).filter(x => x.ko!==o.ko && !pool.includes(x) && x.kind!=="langnp"));
  const oWrong = [...new Set([...shuffle(pool), ...extra].map(x => x.accP))].filter(x => x!==o.accP).slice(0,3);
  const q = { two:true, v, o, s, w:{ w:v.inf, wP:v.infP }, parts:[] };
  q.parts.push(pickPart("s", `‘${s[1]}’는?`, "①", sOpts, sOpts[0], true));
  q.parts.push(pickPart("o", `‘${o.ko}’는?`, "②", [o.accP, ...oWrong], o.accP, true));
  return q;
}
const twoKo = (q, mark) => { const s = q.s[1], ob = q.o.ko;
  const S = mark ? `<mark class="k1">${s}</mark>` : s, O = mark ? `<mark class="k2">${ob}</mark>` : ob;
  return `${S}${josa(s,"이","가")} ${q.v.tr.replace("{o}", O).replace("{을}", q.o.pt)}.`; };
const twoRu = q => `${cap(q.s[0])} ${q.v.forms[2]} ${q.o.acc}.`;
function twoPrompt(q){
  return `<p class="kosent">${twoKo(q, true)}</p>
    <p class="sent" lang="ru"><span class="slot"><span class="gap">?</span><small>①</small></span> ${q.v.forms[2]} <span class="slot"><span class="gap">?</span><small>②</small></span>.</p>`;
}
function twoFeedback(q){
  const ch = q.o.accP!==q.o.nomP;
  return `<div class="pair" lang="ru"><span>${twoRu(q)}</span>${speakBtn(twoRu(q),"문장 듣기")}</div>
    <p class="tr">${twoKo(q, false)}</p>
    <table class="conj" lang="ru"><tbody>
      <tr><th>① ${q.s[1]}</th><td>${q.s[0]}</td></tr>
      <tr><th>② ${q.o.ko}</th><td>${ch ? `${q.o.nom} → <mark>${q.o.acc}</mark>` : q.o.acc}</td></tr>
      <tr><th>${q.v.ko}</th><td>${q.v.inf} → ${q.v.forms[2]}</td></tr>
    </tbody></table>
    ${ch ? `<p class="note">목적어 자리라서 대격으로 바뀌었어요: ${q.o.nom} → ${q.o.acc}</p>` : ""}`;
}
/* 수식어 게임: 형용사(뜻 + 형태) · 지시(э́тот) · 소유(мой …) */
const MODD = {"rel": {"forms": ["кото́рый", "кото́рая", "кото́рое", "кото́рые"], "formsP": ["который", "которая", "которое", "которые"], "nouns": [{"w": "брат", "wP": "брат", "ko": "형, 남동생", "g": "m", "c": "p", "note": ""}, {"w": "сестра́", "wP": "сестра", "ko": "누나, 여동생", "g": "f", "c": "p", "note": ""}, {"w": "друг", "wP": "друг", "ko": "친구", "g": "m", "c": "p", "note": ""}, {"w": "студе́нт", "wP": "студент", "ko": "대학생", "g": "m", "c": "p", "note": ""}, {"w": "студе́нтка", "wP": "студентка", "ko": "여대생", "g": "f", "c": "p", "note": ""}, {"w": "учи́тель", "wP": "учитель", "ko": "선생님", "g": "m", "c": "p", "note": "учи́тель는 -ь로 끝나지만 남성이에요."}, {"w": "па́па", "wP": "папа", "ko": "아빠", "g": "m", "c": "p", "note": "па́па는 -а로 끝나지만 남자라서 남성이에요."}, {"w": "де́душка", "wP": "дедушка", "ko": "할아버지", "g": "m", "c": "p", "note": "де́душка는 -а로 끝나지만 남자라서 남성이에요."}, {"w": "ма́ма", "wP": "мама", "ko": "엄마", "g": "f", "c": "p", "note": ""}, {"w": "де́вочка", "wP": "девочка", "ko": "소녀", "g": "f", "c": "p", "note": ""}, {"w": "ма́льчик", "wP": "мальчик", "ko": "소년", "g": "m", "c": "p", "note": ""}, {"w": "дочь", "wP": "дочь", "ko": "딸", "g": "f", "c": "p", "note": "дочь는 -ь로 끝나는 여성 명사예요."}, {"w": "студе́нты", "wP": "студенты", "ko": "대학생들", "g": "pl", "c": "p", "note": ""}, {"w": "лю́ди", "wP": "люди", "ko": "사람들", "g": "pl", "c": "p", "note": "лю́ди는 челове́к의 복수예요."}, {"w": "кни́га", "wP": "книга", "ko": "책", "g": "f", "c": "t", "note": ""}, {"w": "журна́л", "wP": "журнал", "ko": "잡지", "g": "m", "c": "t", "note": ""}, {"w": "газе́та", "wP": "газета", "ko": "신문", "g": "f", "c": "t", "note": ""}, {"w": "письмо́", "wP": "письмо", "ko": "편지", "g": "n", "c": "t", "note": ""}, {"w": "слова́рь", "wP": "словарь", "ko": "사전", "g": "m", "c": "t", "note": "слова́рь는 -ь로 끝나지만 남성이에요."}, {"w": "тетра́дь", "wP": "тетрадь", "ko": "공책", "g": "f", "c": "t", "note": "тетра́дь는 -ь로 끝나는 여성 명사예요."}, {"w": "телефо́н", "wP": "телефон", "ko": "전화기", "g": "m", "c": "t", "note": ""}, {"w": "ключ", "wP": "ключ", "ko": "열쇠", "g": "m", "c": "t", "note": ""}, {"w": "ру́чка", "wP": "ручка", "ko": "펜", "g": "f", "c": "t", "note": ""}, {"w": "пла́тье", "wP": "платье", "ko": "원피스", "g": "n", "c": "t", "note": ""}, {"w": "пальто́", "wP": "пальто", "ko": "코트", "g": "n", "c": "t", "note": "пальто́는 외래어라서 모양은 안 바뀌지만 중성이에요."}, {"w": "брю́ки", "wP": "брюки", "ko": "바지", "g": "pl", "c": "t", "note": "брю́ки는 복수로만 쓰는 명사예요."}, {"w": "очки́", "wP": "очки", "ko": "안경", "g": "pl", "c": "t", "note": "очки́는 복수로만 쓰는 명사예요."}, {"w": "часы́", "wP": "часы", "ko": "시계", "g": "pl", "c": "t", "note": "часы́는 복수로만 쓰는 명사예요."}], "cl": {"p": [["живёт в Москве́", "живу́т в Москве́", "모스크바에 사는"], ["рабо́тает в библиоте́ке", "рабо́тают в библиоте́ке", "도서관에서 일하는"], ["у́чится в университе́те", "у́чатся в университе́те", "대학에 다니는"], ["говори́т по-ру́сски", "говоря́т по-ру́сски", "러시아어를 하는"], ["чита́ет газе́ту", "чита́ют газе́ту", "신문을 읽는"], ["лю́бит му́зыку", "лю́бят му́зыку", "음악을 좋아하는"], ["отдыха́ет в па́рке", "отдыха́ют в па́рке", "공원에서 쉬는"]], "t": [["лежи́т на столе́", "лежа́т на столе́", "책상 위에 있는"], ["лежи́т в су́мке", "лежа́т в су́мке", "가방 안에 있는"], ["лежи́т на сту́ле", "лежа́т на сту́ле", "의자 위에 있는"]]}}, "adjs": [{"w": "но́вый", "wP": "новый", "ko": "새로운", "forms": ["но́вый", "но́вая", "но́вое", "но́вые"], "formsP": ["новый", "новая", "новое", "новые"], "t": "hard", "naive": ["новый", "новая", "новое", "новые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "ста́рый", "wP": "старый", "ko": "낡은, 오래된, 늙은", "forms": ["ста́рый", "ста́рая", "ста́рое", "ста́рые"], "formsP": ["старый", "старая", "старое", "старые"], "t": "hard", "naive": ["старый", "старая", "старое", "старые"], "cats": ["clothes", "obj", "person"], "q": 0, "note": ""}, {"w": "молодо́й", "wP": "молодой", "ko": "젊은", "forms": ["молодо́й", "молода́я", "молодо́е", "молоды́е"], "formsP": ["молодой", "молодая", "молодое", "молодые"], "t": "oy", "naive": ["молодый", "молодая", "молодое", "молодые"], "cats": ["person"], "q": 0, "note": ""}, {"w": "ста́рший", "wP": "старший", "ko": "나이가 더 많은", "forms": ["ста́рший", "ста́ршая", "ста́ршее", "ста́ршие"], "formsP": ["старший", "старшая", "старшее", "старшие"], "t": "sib", "naive": ["старшый", "старшая", "старшое", "старшые"], "cats": ["sibling"], "q": 0, "note": ""}, {"w": "мла́дший", "wP": "младший", "ko": "나이가 더 어린", "forms": ["мла́дший", "мла́дшая", "мла́дшее", "мла́дшие"], "formsP": ["младший", "младшая", "младшее", "младшие"], "t": "sib", "naive": ["младшый", "младшая", "младшое", "младшые"], "cats": ["sibling"], "q": 0, "note": ""}, {"w": "ма́ленький", "wP": "маленький", "ko": "작은", "forms": ["ма́ленький", "ма́ленькая", "ма́ленькое", "ма́ленькие"], "formsP": ["маленький", "маленькая", "маленькое", "маленькие"], "t": "kgh", "naive": ["маленькый", "маленькая", "маленькое", "маленькые"], "cats": ["clothes", "obj", "person"], "q": 0, "note": ""}, {"w": "большо́й", "wP": "большой", "ko": "큰", "forms": ["большо́й", "больша́я", "большо́е", "больши́е"], "formsP": ["большой", "большая", "большое", "большие"], "t": "oy_sp", "naive": ["большый", "большая", "большое", "большые"], "cats": ["obj", "person"], "q": 0, "note": ""}, {"w": "хоро́ший", "wP": "хороший", "ko": "좋은", "forms": ["хоро́ший", "хоро́шая", "хоро́шее", "хоро́шие"], "formsP": ["хороший", "хорошая", "хорошее", "хорошие"], "t": "sib", "naive": ["хорошый", "хорошая", "хорошое", "хорошые"], "cats": ["clothes", "content", "food", "obj", "person"], "q": 0, "note": ""}, {"w": "плохо́й", "wP": "плохой", "ko": "나쁜", "forms": ["плохо́й", "плоха́я", "плохо́е", "плохи́е"], "formsP": ["плохой", "плохая", "плохое", "плохие"], "t": "oy_sp", "naive": ["плохый", "плохая", "плохое", "плохые"], "cats": ["clothes", "content", "food", "obj", "person"], "q": 0, "note": ""}, {"w": "горя́чий", "wP": "горячий", "ko": "뜨거운", "forms": ["горя́чий", "горя́чая", "горя́чее", "горя́чие"], "formsP": ["горячий", "горячая", "горячее", "горячие"], "t": "sib", "naive": ["горячый", "горячая", "горячое", "горячые"], "cats": ["food"], "q": 0, "note": ""}, {"w": "холо́дный", "wP": "холодный", "ko": "차가운, 추운", "forms": ["холо́дный", "холо́дная", "холо́дное", "холо́дные"], "formsP": ["холодный", "холодная", "холодное", "холодные"], "t": "hard", "naive": ["холодный", "холодная", "холодное", "холодные"], "cats": ["food"], "q": 0, "note": ""}, {"w": "интере́сный", "wP": "интересный", "ko": "재미있는", "forms": ["интере́сный", "интере́сная", "интере́сное", "интере́сные"], "formsP": ["интересный", "интересная", "интересное", "интересные"], "t": "hard", "naive": ["интересный", "интересная", "интересное", "интересные"], "cats": ["content"], "q": 0, "note": ""}, {"w": "неинтере́сный", "wP": "неинтересный", "ko": "재미없는", "forms": ["неинтере́сный", "неинтере́сная", "неинтере́сное", "неинтере́сные"], "formsP": ["неинтересный", "неинтересная", "неинтересное", "неинтересные"], "t": "hard", "naive": ["неинтересный", "неинтересная", "неинтересное", "неинтересные"], "cats": ["content"], "q": 0, "note": ""}, {"w": "краси́вый", "wP": "красивый", "ko": "아름다운", "forms": ["краси́вый", "краси́вая", "краси́вое", "краси́вые"], "formsP": ["красивый", "красивая", "красивое", "красивые"], "t": "hard", "naive": ["красивый", "красивая", "красивое", "красивые"], "cats": ["clothes", "obj", "person"], "q": 0, "note": ""}, {"w": "некраси́вый", "wP": "некрасивый", "ko": "추한, 못생긴", "forms": ["некраси́вый", "некраси́вая", "некраси́вое", "некраси́вые"], "formsP": ["некрасивый", "некрасивая", "некрасивое", "некрасивые"], "t": "hard", "naive": ["некрасивый", "некрасивая", "некрасивое", "некрасивые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "друго́й", "wP": "другой", "ko": "다른", "forms": ["друго́й", "друга́я", "друго́е", "други́е"], "formsP": ["другой", "другая", "другое", "другие"], "t": "oy_sp", "naive": ["другый", "другая", "другое", "другые"], "cats": ["clothes", "content", "food", "obj", "person"], "q": 0, "note": ""}, {"w": "чужо́й", "wP": "чужой", "ko": "타인의, 낯선", "forms": ["чужо́й", "чужа́я", "чужо́е", "чужи́е"], "formsP": ["чужой", "чужая", "чужое", "чужие"], "t": "oy_sp", "naive": ["чужый", "чужая", "чужое", "чужые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "ли́шний", "wP": "лишний", "ko": "남는, 잉여의", "forms": ["ли́шний", "ли́шняя", "ли́шнее", "ли́шние"], "formsP": ["лишний", "лишняя", "лишнее", "лишние"], "t": "soft", "naive": ["лишный", "лишная", "лишное", "лишные"], "cats": ["spare"], "q": 0, "note": ""}, {"w": "дома́шний", "wP": "домашний", "ko": "집의, 집에서 만든", "forms": ["дома́шний", "дома́шняя", "дома́шнее", "дома́шние"], "formsP": ["домашний", "домашняя", "домашнее", "домашние"], "t": "soft", "naive": ["домашный", "домашная", "домашное", "домашные"], "cats": ["home"], "q": 0, "note": ""}, {"w": "бе́лый", "wP": "белый", "ko": "흰", "forms": ["бе́лый", "бе́лая", "бе́лое", "бе́лые"], "formsP": ["белый", "белая", "белое", "белые"], "t": "hard", "naive": ["белый", "белая", "белое", "белые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "голубо́й", "wP": "голубой", "ko": "하늘색의, 푸른", "forms": ["голубо́й", "голуба́я", "голубо́е", "голубы́е"], "formsP": ["голубой", "голубая", "голубое", "голубые"], "t": "oy", "naive": ["голубый", "голубая", "голубое", "голубые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "жёлтый", "wP": "жёлтый", "ko": "노란", "forms": ["жёлтый", "жёлтая", "жёлтое", "жёлтые"], "formsP": ["жёлтый", "жёлтая", "жёлтое", "жёлтые"], "t": "hard", "naive": ["жёлтый", "жёлтая", "жёлтое", "жёлтые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "зелёный", "wP": "зелёный", "ko": "초록색의", "forms": ["зелёный", "зелёная", "зелёное", "зелёные"], "formsP": ["зелёный", "зелёная", "зелёное", "зелёные"], "t": "hard", "naive": ["зелёный", "зелёная", "зелёное", "зелёные"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "кра́сный", "wP": "красный", "ko": "빨간", "forms": ["кра́сный", "кра́сная", "кра́сное", "кра́сные"], "formsP": ["красный", "красная", "красное", "красные"], "t": "hard", "naive": ["красный", "красная", "красное", "красные"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "кори́чневый", "wP": "коричневый", "ko": "갈색의", "forms": ["кори́чневый", "кори́чневая", "кори́чневое", "кори́чневые"], "formsP": ["коричневый", "коричневая", "коричневое", "коричневые"], "t": "hard", "naive": ["коричневый", "коричневая", "коричневое", "коричневые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "ора́нжевый", "wP": "оранжевый", "ko": "주황색의", "forms": ["ора́нжевый", "ора́нжевая", "ора́нжевое", "ора́нжевые"], "formsP": ["оранжевый", "оранжевая", "оранжевое", "оранжевые"], "t": "hard", "naive": ["оранжевый", "оранжевая", "оранжевое", "оранжевые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "ро́зовый", "wP": "розовый", "ko": "분홍색의", "forms": ["ро́зовый", "ро́зовая", "ро́зовое", "ро́зовые"], "formsP": ["розовый", "розовая", "розовое", "розовые"], "t": "hard", "naive": ["розовый", "розовая", "розовое", "розовые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "се́рый", "wP": "серый", "ko": "회색의", "forms": ["се́рый", "се́рая", "се́рое", "се́рые"], "formsP": ["серый", "серая", "серое", "серые"], "t": "hard", "naive": ["серый", "серая", "серое", "серые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "си́ний", "wP": "синий", "ko": "파란, 청색의", "forms": ["си́ний", "си́няя", "си́нее", "си́ние"], "formsP": ["синий", "синяя", "синее", "синие"], "t": "soft", "naive": ["синый", "синая", "синое", "синые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "фиоле́товый", "wP": "фиолетовый", "ko": "보라색의", "forms": ["фиоле́товый", "фиоле́товая", "фиоле́товое", "фиоле́товые"], "formsP": ["фиолетовый", "фиолетовая", "фиолетовое", "фиолетовые"], "t": "hard", "naive": ["фиолетовый", "фиолетовая", "фиолетовое", "фиолетовые"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "чёрный", "wP": "чёрный", "ko": "검은", "forms": ["чёрный", "чёрная", "чёрное", "чёрные"], "formsP": ["чёрный", "чёрная", "чёрное", "чёрные"], "t": "hard", "naive": ["чёрный", "чёрная", "чёрное", "чёрные"], "cats": ["clothes", "obj"], "q": 0, "note": ""}, {"w": "како́й", "wP": "какой", "ko": "어떤", "forms": ["како́й", "кака́я", "како́е", "каки́е"], "formsP": ["какой", "какая", "какое", "какие"], "t": "oy_sp", "naive": ["какый", "какая", "какое", "какые"], "cats": ["clothes", "content", "food", "obj", "person"], "q": 1, "note": "의문형용사예요. 대상이 어떤지(성질·상태)를 물어요: Кака́я э́то кни́га? (이건 어떤 책이에요?)"}, {"w": "чей", "wP": "чей", "ko": "누구의", "forms": ["чей", "чья", "чьё", "чьи"], "formsP": ["чей", "чья", "чьё", "чьи"], "t": "chey", "naive": ["чей", "чья", "чьё", "чьи"], "cats": ["clothes", "content", "food", "obj", "person"], "q": 1, "note": "의문형용사예요. 누구의 것인지(소유)를 물어요: Чья э́то кни́га? (이건 누구의 책이에요?)"}], "nouns": [{"w": "костю́м", "wP": "костюм", "ko": "정장", "g": "m", "cats": ["clothes"], "note": ""}, {"w": "руба́шка", "wP": "рубашка", "ko": "셔츠", "g": "f", "cats": ["clothes"], "note": ""}, {"w": "пла́тье", "wP": "платье", "ko": "원피스", "g": "n", "cats": ["clothes"], "note": ""}, {"w": "пальто́", "wP": "пальто", "ko": "코트", "g": "n", "cats": ["clothes"], "note": "пальто́는 외래어라서 모양은 안 바뀌지만 중성이에요."}, {"w": "ю́бка", "wP": "юбка", "ko": "치마", "g": "f", "cats": ["clothes"], "note": ""}, {"w": "брю́ки", "wP": "брюки", "ko": "바지", "g": "pl", "cats": ["clothes"], "note": "брю́ки는 복수로만 쓰는 명사예요."}, {"w": "джи́нсы", "wP": "джинсы", "ko": "청바지", "g": "pl", "cats": ["clothes"], "note": "джи́нсы는 복수로만 쓰는 명사예요."}, {"w": "блу́зка", "wP": "блузка", "ko": "블라우스", "g": "f", "cats": ["clothes"], "note": ""}, {"w": "дом", "wP": "дом", "ko": "집", "g": "m", "cats": ["obj"], "note": ""}, {"w": "маши́на", "wP": "машина", "ko": "자동차", "g": "f", "cats": ["obj"], "note": ""}, {"w": "кни́га", "wP": "книга", "ko": "책", "g": "f", "cats": ["obj", "content"], "note": ""}, {"w": "су́мка", "wP": "сумка", "ko": "가방", "g": "f", "cats": ["obj"], "note": ""}, {"w": "слова́рь", "wP": "словарь", "ko": "사전", "g": "m", "cats": ["obj"], "note": "слова́рь는 -ь로 끝나지만 남성이에요."}, {"w": "тетра́дь", "wP": "тетрадь", "ko": "공책", "g": "f", "cats": ["obj"], "note": "тетра́дь는 -ь로 끝나는 여성 명사예요."}, {"w": "телефо́н", "wP": "телефон", "ko": "전화기", "g": "m", "cats": ["obj"], "note": ""}, {"w": "окно́", "wP": "окно", "ko": "창문", "g": "n", "cats": ["obj"], "note": ""}, {"w": "го́род", "wP": "город", "ko": "도시", "g": "m", "cats": ["obj"], "note": ""}, {"w": "журна́л", "wP": "журнал", "ko": "잡지", "g": "m", "cats": ["content"], "note": ""}, {"w": "фильм", "wP": "фильм", "ko": "영화", "g": "m", "cats": ["content"], "note": ""}, {"w": "уро́к", "wP": "урок", "ko": "수업", "g": "m", "cats": ["content"], "note": ""}, {"w": "ле́кция", "wP": "лекция", "ko": "강의", "g": "f", "cats": ["content"], "note": ""}, {"w": "письмо́", "wP": "письмо", "ko": "편지", "g": "n", "cats": ["content"], "note": ""}, {"w": "исто́рия", "wP": "история", "ko": "이야기", "g": "f", "cats": ["content"], "note": ""}, {"w": "газе́та", "wP": "газета", "ko": "신문", "g": "f", "cats": ["content"], "note": ""}, {"w": "челове́к", "wP": "человек", "ko": "사람", "g": "m", "cats": ["person"], "note": ""}, {"w": "учи́тель", "wP": "учитель", "ko": "선생님", "g": "m", "cats": ["person"], "note": "учи́тель는 -ь로 끝나지만 남성이에요."}, {"w": "ма́ма", "wP": "мама", "ko": "엄마", "g": "f", "cats": ["person"], "note": ""}, {"w": "па́па", "wP": "папа", "ko": "아빠", "g": "m", "cats": ["person"], "note": "па́па는 -а로 끝나지만 남자라서 남성이에요."}, {"w": "де́душка", "wP": "дедушка", "ko": "할아버지", "g": "m", "cats": ["person"], "note": "де́душка는 -а로 끝나지만 남자라서 남성이에요."}, {"w": "ма́льчик", "wP": "мальчик", "ko": "소년", "g": "m", "cats": ["person"], "note": ""}, {"w": "де́вочка", "wP": "девочка", "ko": "소녀", "g": "f", "cats": ["person"], "note": ""}, {"w": "друг", "wP": "друг", "ko": "친구", "g": "m", "cats": ["person"], "note": ""}, {"w": "де́ти", "wP": "дети", "ko": "아이들", "g": "pl", "cats": ["person"], "note": "де́ти는 복수 명사예요."}, {"w": "брат", "wP": "брат", "ko": "형, 남동생", "g": "m", "cats": ["sibling", "person"], "note": ""}, {"w": "сестра́", "wP": "сестра", "ko": "언니, 누나, 여동생", "g": "f", "cats": ["sibling", "person"], "note": ""}, {"w": "сын", "wP": "сын", "ko": "아들", "g": "m", "cats": ["sibling", "person"], "note": ""}, {"w": "дочь", "wP": "дочь", "ko": "딸", "g": "f", "cats": ["sibling", "person"], "note": "дочь는 -ь로 끝나는 여성 명사예요."}, {"w": "суп", "wP": "суп", "ko": "수프", "g": "m", "cats": ["food"], "note": ""}, {"w": "чай", "wP": "чай", "ko": "차", "g": "m", "cats": ["food"], "note": ""}, {"w": "ко́фе", "wP": "кофе", "ko": "커피", "g": "m", "cats": ["food"], "note": "ко́фе는 -е로 끝나지만 남성이에요."}, {"w": "молоко́", "wP": "молоко", "ko": "우유", "g": "n", "cats": ["food"], "note": ""}, {"w": "вода́", "wP": "вода", "ko": "물", "g": "f", "cats": ["food"], "note": ""}, {"w": "зада́ние", "wP": "задание", "ko": "과제", "g": "n", "cats": ["home"], "note": ""}, {"w": "рабо́та", "wP": "работа", "ko": "일", "g": "f", "cats": ["home"], "note": ""}, {"w": "ко́шка", "wP": "кошка", "ko": "고양이", "g": "f", "cats": ["home"], "note": ""}, {"w": "хлеб", "wP": "хлеб", "ko": "빵", "g": "m", "cats": ["home", "food"], "note": ""}, {"w": "биле́т", "wP": "билет", "ko": "표", "g": "m", "cats": ["spare"], "note": ""}, {"w": "вопро́с", "wP": "вопрос", "ko": "질문", "g": "m", "cats": ["spare"], "note": ""}, {"w": "сло́во", "wP": "слово", "ko": "단어", "g": "n", "cats": ["spare"], "note": ""}, {"w": "де́ньги", "wP": "деньги", "ko": "돈", "g": "pl", "cats": ["spare"], "note": "де́ньги는 복수로만 쓰는 명사예요."}], "poss": [{"w": "мой", "wP": "мой", "ko": "나의", "forms": ["мой", "моя́", "моё", "мои́"], "formsP": ["мой", "моя", "моё", "мои"]}, {"w": "твой", "wP": "твой", "ko": "너의", "forms": ["твой", "твоя́", "твоё", "твои́"], "formsP": ["твой", "твоя", "твоё", "твои"]}, {"w": "наш", "wP": "наш", "ko": "우리의", "forms": ["наш", "на́ша", "на́ше", "на́ши"], "formsP": ["наш", "наша", "наше", "наши"]}, {"w": "ваш", "wP": "ваш", "ko": "당신의", "forms": ["ваш", "ва́ша", "ва́ше", "ва́ши"], "formsP": ["ваш", "ваша", "ваше", "ваши"]}, {"w": "его́", "wP": "его", "ko": "그의", "forms": null, "formsP": null}, {"w": "её", "wP": "её", "ko": "그녀의", "forms": null, "formsP": null}, {"w": "их", "wP": "их", "ko": "그들의", "forms": null, "formsP": null}], "dem": {"w": "э́тот", "ko": "이", "forms": ["э́тот", "э́та", "э́то", "э́ти"], "formsP": ["этот", "эта", "это", "эти"]}};
const GI = { m:0, f:1, n:2, pl:3 };
const ATYPE = {
  hard:"기본 어미예요: <b class='cy'>-ый / -ая / -ое / -ые</b>",
  oy:"-о́й 형용사는 모든 형태에서 어미에 강세가 와요: <b class='cy'>-о́й / -а́я / -о́е / -ы́е</b>",
  oy_sp:"-о́й 형용사라서 어미에 강세가 오고, 어간이 к · г · х · ж · ш로 끝나서 복수는 <b class='cy'>-и́е</b>예요: <b class='cy'>-о́й / -а́я / -о́е / -и́е</b>",
  kgh:"к · г · х 뒤에는 ы 대신 и를 써요: <b class='cy'>-ий / -ая / -ое / -ие</b>",
  sib:"ж · ч · ш · щ 뒤에는 ы 대신 и, 강세 없는 о 대신 е를 써요: <b class='cy'>-ий / -ая / -ее / -ие</b>",
  soft:"연변화 형용사(-ний)예요: <b class='cy'>-ий / -яя / -ее / -ие</b>",
  chey:"чей는 불규칙하게 바뀌어요: <b class='cy'>чей / чья / чьё / чьи</b>"
};
const AXL = { oy:"예외 어미 · -о́й (어미 강세)", oy_sp:"예외 어미 · -о́й + 복수 -и́е", kgh:"예외 어미 · к·г·х 뒤 -ий", sib:"예외 어미 · ж·ч·ш·щ 뒤 -ий / -ее", soft:"예외 어미 · 연변화 -ний", chey:"예외 · 불규칙 의문형용사" };
const GNAME4 = ["남성","여성","중성","복수"];
const koFirst = k => k.split(",")[0].replace(/\(.*?\)/g,"").trim();
const cpref = arr => { let p = arr[0]; for(const x of arr) while(!x.startsWith(p)) p = p.slice(0,-1); return p; };
function adjItems(){ return MODD.adjs.filter(a => !a.q).map(a => ({ t:"adj", a, ko:a.ko })); }
function modItems(){   /* 대명사 탭: 의문 · 지시 · 소유 · 관계 */
  const vp = MODD.poss.filter(p => p.formsP), fp = MODD.poss.filter(p => !p.formsP);
  return [ ...MODD.adjs.filter(a => a.q).flatMap(a => Array(3).fill(0).map(() => ({ t:"adj", a, ko:a.ko }))),   /* 의문형용사 како́й, чей: 뜻 + 형태 */
    ...Array(8).fill(0).map(() => ({ t:"dem", p:MODD.dem, ko:"이" })),
    ...vp.flatMap(p => Array(3).fill(0).map(() => ({ t:"poss", p, ko:p.ko }))),
    ...fp.flatMap(p => Array(2).fill(0).map(() => ({ t:"poss", p, ko:p.ko }))),
    ...Array(14).fill(0).map(() => ({ t:"rel", ko:"관계대명사" })) ];   /* кото́рый (주격) */
}
function buildMod(it, s){
  if(it.t==="adj"){
    const a = it.a, n = pick1(MODD.nouns.filter(x => x.cats.some(c => a.cats.includes(c)))), gi = GI[n.g], ans = a.formsP[gi];
    let wrong = shuffle(a.formsP.filter((x,i) => i!==gi));
    if(a.naive[gi]!==ans) wrong = [a.naive[gi], ...wrong.slice(0,2)];   /* 철자·강세 규칙을 안 지킨 함정 보기 */
    const mine = variants(a.ko), clash = x => [...variants(x)].some(v => mine.has(v));
    const others = (a.q && relatedKos(a.wP, a.ko)) || shuffle(MODD.adjs.filter(x => x!==a && !x.q && !clash(x.ko)).map(x => x.ko)).slice(0,3);   /* 의문형용사는 의문사끼리 */
    return { mod:"adj", a, n, gi, parts:[
      { key:"m", title:`‘${a.w}’의 뜻은?`, short:"뜻", type: s.ans==="text" ? "text" : "mc", opts: shuffle([a.ko, ...others]), ans:a.ko, cyr:false, val:null, pick:null, typed:"", gaveUp:false, overridden:false },
      pickPart("f","알맞은 형태는?","형태",[ans, ...wrong], ans, true) ] };
  }
  if(it.t==="rel"){
    const R = MODD.rel, n = pick1(R.nouns), gi = GI[n.g], cl = pick1(R.cl[n.c]);
    return { mod:"rel", n, gi, cl, parts:[ pickPart("f","알맞은 형태는?","형태", R.formsP, R.formsP[gi], true, true) ] };
  }
  const p = it.p, n = pick1(MODD.nouns), gi = GI[n.g];
  if(p.formsP && it.t==="poss"){   /* 소유형용사: 성(같은 단어 다른 형태) + 사람(같은 성 다른 사람)을 함께 */
    const ans = p.formsP[gi];
    const otherPerson = shuffle(MODD.poss.filter(x => x!==p).map(x => x.formsP ? x.formsP[gi] : x.wP)).filter(x => x!==ans).slice(0,2);
    const otherGender = shuffle(p.formsP.filter((x,i) => i!==gi && !otherPerson.includes(x))).slice(0,1);
    return { mod:it.t, p, n, gi, parts:[ pickPart("f","알맞은 형태는?","형태", [ans, ...otherPerson, ...otherGender], ans, true) ] };
  }
  if(p.formsP) return { mod:it.t, p, n, gi, parts:[ pickPart("f","알맞은 형태는?","형태", p.formsP, p.formsP[gi], true, true) ] };
  const trap = { "его":"ему", "её":"ей", "их":"им" }[p.wP];
  return { mod:"fixed", p, n, gi, parts:[ pickPart("f","알맞은 형태는?","형태", ["его","её","их", trap], p.wP, true) ] };
}
const relRu = (q, mark) => `Э́то ${q.n.w}, ${mark ? hlFrom("котор", MODD.rel.forms[q.gi]) : MODD.rel.forms[q.gi]} ${q.gi===3 ? q.cl[1] : q.cl[0]}.`;
const relKo = q => `${q.cl[2]} ${q.n.ko}${josa(q.n.ko,"이에요","예요")}.`;
const RELRULE = "관계대명사 <b class='cy'>кото́рый</b>는 앞 명사(선행사)의 <b>성·수</b>에 맞추고, 관계절 안에서 주어 역할이면 <b>주격</b>을 써요: 남성 <b class='cy'>кото́рый</b> · 여성 <b class='cy'>кото́рая</b> · 중성 <b class='cy'>кото́рое</b> · 복수 <b class='cy'>кото́рые</b> (형용사 -ый / -ая / -ое / -ые와 같아요). 앞에는 쉼표를 찍어요.";
/* 의문형용사 → 질문 문장, 소유형용사 → «Э́то … » 문장으로 */
const modSentType = q => (q.mod==="adj" && q.a.q) ? "ask" : (q.mod==="poss" || q.mod==="fixed") ? "this" : "";
const capH = h => h.replace(/^(<mark>)?(.)/u, (m, a, c) => (a || "") + c.toUpperCase());
function modSentRu(q, fh){
  return modSentType(q)==="ask" ? `${capH(fh)} э́то ${q.n.w}?` : `Э́то ${fh} ${q.n.w}.`;
}
function modSentKo(q){
  const kp = q.mod==="adj" ? koFirst(q.a.ko) : q.p.ko, end = josa(q.n.ko,"이에요","예요");
  return modSentType(q)==="ask" ? `이건 ${kp} ${q.n.ko}${end}?` : `이건 ${kp} ${q.n.ko}${end}.`;
}
function modPrompt(q){
  if(q.mod==="rel") return `<p class="sent" lang="ru">Э́то ${q.n.w}, <span class="slot"><span class="gap">?</span><small>кото́рый</small></span> ${q.gi===3 ? q.cl[1] : q.cl[0]}.</p>`;
  const cue = q.mod==="adj" ? `<span class="cy">${q.a.w}</span>` : `(${q.p.ko})`;
  const slot = `<span class="slot"><span class="gap">?</span><small>${cue}</small></span>`;
  if(modSentType(q)==="ask") return `<p class="sent" lang="ru">${slot} э́то ${q.n.w}?</p>`;
  if(modSentType(q)==="this") return `<p class="sent" lang="ru">Э́то ${slot} ${q.n.w}.</p>`;
  return `<p class="sent" lang="ru"><span class="slot"><span class="gap">?</span><small>${cue}</small></span> ${q.n.w}</p>`;
}
function modForm(q){ return q.mod==="rel" ? MODD.rel.forms[q.gi] : q.mod==="adj" ? q.a.forms[q.gi] : q.p.forms ? q.p.forms[q.gi] : q.p.w; }
function modBadges(q){
  const b = [];
  if(q.mod==="adj" && AXL[q.a.t]) b.push(AXL[q.a.t]);
  if(q.mod==="fixed") b.push("형태 고정 · его́ / её / их");
  if(q.n.note) b.push(`명사 예외 · ${GNAME4[q.gi]}`);
  return b;
}
const GRAM_ROLE = q => q.mod==="poss" ? "소유형용사" : q.mod==="fixed" ? "소유형용사" : q.mod==="dem" ? "지시형용사" : q.mod==="rel" ? "관계대명사" : (q.a && q.a.q) ? "의문형용사" : "형용사";
const gramChip = (w, tags) => `<span class="gram"><b lang="ru">${w}</b>${tags.filter(Boolean).map(t => `<i>${t}</i>`).join("")}</span>`;
const gramRow = list => list.length ? `<div class="grams" aria-label="문법 정보">${list.map(([w, t]) => gramChip(w, t)).join("")}</div>` : "";
const modGram = q => gramRow([[modForm(q), [GRAM_ROLE(q), "주격", q.mod==="fixed" ? "" : GNAME4[q.gi]]]]);
function modFeedback(q){
  if(q.mod==="rel"){ const bs = modBadges(q);
    return `<div class="pair" lang="ru"><span>${relRu(q, true)}</span>${speakBtn(relRu(q,false),"문장 듣기")}</div>
      ${modGram(q)}
      ${bs.length ? `<div>${bs.map(badge).join(" ")}</div>` : ""}
      <p class="tr">${relKo(q)}</p>
      <table class="conj" lang="ru"><tbody>${MODD.rel.forms.map((x,i) => `<tr class="${i===q.gi ? "on" : ""}"><th>${GNAME4[i]}</th><td>${hlFrom("котор", x)}</td></tr>`).join("")}</tbody></table>
      <p class="rule"><b>${q.n.w}</b>는 ${GNAME4[q.gi]}${q.gi===3 ? "" : " 명사"} → ${RELRULE}</p>
      ${q.gi===3 ? `<p class="note">선행사가 복수라서 관계절 동사도 복수형(${q.cl[1].split(" ")[0]})이에요.</p>` : ""}
      ${q.n.note ? `<p class="note">${q.n.note}</p>` : ""}`; }
  const f = modForm(q), forms = q.mod==="adj" ? q.a.forms : q.p.forms;
  const stem = forms ? cpref((q.mod==="adj" ? q.a.formsP : q.p.formsP)) : "";
  const fh = forms ? hlFrom(stem, f) : `<mark>${f}</mark>`;
  const koP = q.mod==="adj" ? koFirst(q.a.ko) : q.p.ko;
  const bs = modBadges(q);
  const rule = q.mod==="adj" ? ATYPE[q.a.t]
    : q.mod==="fixed" ? "его́(그의) · её(그녀의) · их(그들의)는 꾸미는 명사의 성·수와 상관없이 <b>모양이 그대로</b>예요."
    : `꾸미는 명사의 성·수에 맞춰 바뀌어요: 남성 <b class='cy'>${q.p.forms[0]}</b> · 여성 <b class='cy'>${q.p.forms[1]}</b> · 중성 <b class='cy'>${q.p.forms[2]}</b> · 복수 <b class='cy'>${q.p.forms[3]}</b>`;
  const st = modSentType(q);
  return `<div class="pair" lang="ru"><span>${st ? modSentRu(q, fh) : `${fh} ${q.n.w}`}</span>${speakBtn(st ? modSentRu(q, f) : `${f} ${q.n.w}`,"발음 듣기")}</div>
    ${modGram(q)}
    ${bs.length ? `<div>${bs.map(badge).join(" ")}</div>` : ""}
    <p class="mean">${st ? modSentKo(q) : `${koP} ${q.n.ko}`}${q.mod==="adj" ? ` <span class="pos">· ${q.a.w} = ${q.a.ko}</span>` : ""}</p>
    ${forms ? `<table class="conj" lang="ru"><tbody>${forms.map((x,i) => `<tr class="${i===q.gi ? "on" : ""}"><th>${GNAME4[i]}</th><td>${hlFrom(stem, x)}</td></tr>`).join("")}</tbody></table>` : ""}
    <p class="rule"><b>${q.n.w}</b>는 ${GNAME4[q.gi]}${q.gi===3 ? "" : " 명사"} → ${rule}</p>
    ${q.mod==="adj" && q.a.note ? `<p class="note">${q.a.note}</p>` : ""}
    ${q.n.note ? `<p class="note">${q.n.note}</p>` : ""}`;
}
function buildNum(w){
  const other = numFind(w.pos==="ord" ? "num" : "ord", w.n), near = numNear(w.pos, w.n, 2), set = [w, other, ...near];
  const toRu = Math.random() < .5;
  return { w, num:true, toRu, parts:[ toRu ? pickPart("n","러시아어로는?","숫자", set.map(x => x.wP), w.wP, true)
                                         : pickPart("n","뜻은?","숫자", set.map(numLabel), numLabel(w), false) ] };
}
/* 대명사류 뜻 문제: 관련 있는 것끼리만 보기로 (같은 사람 → 같은 무리 → 같은 집안) */
const PGROUPS = {
  pers:["я","ты","он","она","оно","мы","вы","они"],
  acc:["меня","тебя","его","её","нас","вас","их"],
  prep:["обо мне","о тебе","о нём","о ней","о нас","о вас","о них"],
  poss:["мой","твой","наш","ваш"],
  dem:["этот","эта","это","эти"],
  q:["кто","что","кого","о ком","о чём","какой","чей","который"]
};
const PFAM = { pers:["pers","acc","prep","poss"], acc:["pers","acc","poss","prep"], prep:["prep","pers","acc"], poss:["poss","acc","pers"], dem:["dem","pers","poss"], q:["q"] };
const PSAME = [["я","меня","обо мне","мой"],["ты","тебя","о тебе","твой"],["он","его","о нём"],["она","её","о ней"],["мы","нас","о нас","наш"],
  ["вы","вас","о вас","ваш"],["они","их","о них"],["кто","кого","о ком","чей"],["что","о чём","какой"],["какой","чей","который"]];
function relatedKos(wP, ko){
  const grp = Object.keys(PGROUPS).find(g => PGROUPS[g].includes(wP)); if(!grp) return null;
  const mine = variants(ko), clash = x => x===ko || [...variants(x)].some(v => mine.has(v));
  const koOf = p => { const v = VOCAB.find(x => x.wP===p); return v ? v.ko : null; };
  const tiers = [ PSAME.filter(s => s.includes(wP)).flat(), PGROUPS[grp], ...PFAM[grp].map(g => PGROUPS[g]) ];
  const out = [];
  for(const t of tiers) for(const p of shuffle([...t])){ const k = koOf(p); if(p!==wP && k && !clash(k) && !out.includes(k)) out.push(k); if(out.length>=2 && t===tiers[0]) break; }
  return out.length>=3 ? out.slice(0,3) : null;
}
/* 단어 예문: [ ] 안이 그 단어 */
function exBlock(w){
  if(!w.ex) return "";
  const html = w.ex[0].replace(/\[(.+?)\]/g, "<mark>$1</mark>"), plainS = w.ex[0].replace(/[\[\]]/g, "");
  return `<div class="exs"><span class="exl">예문</span><p class="exru" lang="ru"><span>${html}</span>${speakBtn(plainS,"예문 듣기")}</p><p class="exko">${w.ex[1]}</p></div>`;
}
const POSL = { ord:"서수", n:"명사", v:"동사", adj:"형용사", adv:"부사", pron:"대명사", num:"수사", phr:"인사·표현", func:"의문사·전치사 등", name:"고유명사" };
const MVOC = {
  tab:"단어", h1:"단어 뜻 퀴즈", ru:"слова́", unit: s => s.game==="meaning" && s.mode==="two" ? "문장" : "단어",
  lead:"러시아어 단어를 보고 뜻을 맞혀 보세요. ‘복수형’은 뜻과 복수형, ‘형용사’는 뜻 · 명사에 맞는 형태 · 반의어, ‘숫자’는 기수 · 서수를 연습해요.",
  levels(s){
    const two = s.game==="meaning" && s.mode==="two";
    const desc = two ? { beginner:"초급 동사로 만든 문장", intermediate:"초급 + 중급 동사로 만든 문장", advanced:"모든 동사로 만든 문장 (먹다·마시다 등 포함)" }
      : { beginner:"교재 단어장 (보내 주신 사진 속 단어 전부)", intermediate:"자주 쓰는 기초 단어 · 형용사 · 부사 · 동사", advanced:"한 단계 위 생활 · 학업 단어" };
    if(s.game==="mod") return { beginner:{ label:"교재 범위", desc:"교재 형용사 31개 (뜻 + 남성·여성·중성·복수 형태)", items: adjItems() } };
    if(s.game==="num") return { beginner:{ label:"1 ~ 10", desc:"기수(하나, 둘 …) · 서수(첫 번째, 두 번째 …) 20개", items: NUMS() } };
    return Object.fromEntries(Object.keys(LV).map(k => [k,{ label:LV[k], desc:desc[k], items: s.game==="meaning" && s.mode==="two" ? sentItems(k) : VOCAB.filter(w => w.lvl===k) }]));
  },
  segs(s){ return [
    ["game","게임 종류",[["meaning","뜻 맞히기"],["plural","복수형"],["adj","형용사"],["num","숫자 (기수 · 서수)"]]],
    ...(s.game==="meaning" ? [["mode","뜻 맞히기 방식",[["one","한 단어씩"],["two","문장 속 두 단어"]]]] : []),
    ...((s.game==="meaning" && s.mode!=="two") || s.game==="mod" ? [["ans", s.game==="mod" ? "형용사 뜻 답하는 방식" : "답하는 방식",[["mc","객관식 (4지선다)"],["text","주관식 (직접 입력)"]]]] : [])
  ]; },
  summary: s => s.game==="mod" ? "형용사 (뜻 + 형태)" : s.game==="num" ? "숫자 (기수 · 서수)" : s.game==="meaning" && s.mode==="two" ? "문장 속 두 단어" : s.game==="dem" ? "э́тот / э́та / э́то / э́ти" : `뜻 ${s.ans==="text" ? "주관식" : "객관식"}`,
  build(w, pool, s){
    if(s.game==="mod") return buildMod(w, s);
    if(s.game==="num") return buildNum(w);
    if(s.game==="meaning" && s.mode==="two") return buildTwo(w);
    const rel = relatedKos(w.wP, w.ko);
    if(rel) return { w, parts:[{ key:"m", title:"뜻은?", short:"뜻", type: s.ans==="text" ? "text" : "mc", opts: shuffle([w.ko, ...rel]), ans:w.ko, cyr:false, val:null, pick:null, typed:"", gaveUp:false, overridden:false }] };
    if(w.n){   /* 숫자: 같은 숫자의 기수/서수와 이웃 숫자를 보기로 */
      const other = numFind(w.pos==="ord" ? "num" : "ord", w.n), near = numNear(w.pos, w.n, 2);
      const opts = [w, other, ...near].map(x => x.ko);
      return { w, parts:[{ key:"m", title:"뜻은?", short:"뜻", type: s.ans==="text" ? "text" : "mc", opts: shuffle(opts), ans:w.ko, cyr:false, val:null, pick:null, typed:"", gaveUp:false, overridden:false }] };
    }
    if(s.game==="dem") return { w, dem:true, parts:[ pickPart("d","알맞은 ‘이’는?","этот·эта…",["этот","эта","это","эти"], DEMP[w.g], true, true) ] };
    const mine = variants(w.ko), clash = x => x===w.ko || [...variants(x)].some(v => mine.has(v));
    const same = shuffle([...new Set(pool.filter(x => x.pos===w.pos && !clash(x.ko)).map(x => x.ko))]);
    const other = shuffle([...new Set(pool.filter(x => x.pos!==w.pos && !clash(x.ko)).map(x => x.ko))]);
    const wrong = [...same, ...other.filter(x => !same.includes(x))].slice(0,3);
    return { w, parts:[{ key:"m", title:"뜻은?", short:"뜻", type: s.ans==="text" ? "text" : "mc", opts: shuffle([w.ko, ...wrong]), ans:w.ko, cyr:false, val:null, pick:null, typed:"", gaveUp:false, overridden:false }] };
  },
  prompt: q => q.mod ? modPrompt(q)
    : q.num ? (q.toRu ? `<div class="word"><span class="w">${numLabel(q.w)}</span></div>` : `<div class="word"><span class="w" lang="ru">${q.w.w}</span>${speakBtn(q.w.w,"발음 듣기")}</div>`)
    : q.two ? twoPrompt(q)
    : q.dem
    ? `<p class="sent" lang="ru"><span class="slot"><span class="gap">?</span></span> ${q.w.w}${speakBtn(q.w.w,"발음 듣기")}</p>`
    : `<div class="word"><span class="w" lang="ru">${q.w.w}</span>${speakBtn(q.w.w,"발음 듣기")}</div>`,
  feedback: q => q.mod ? modFeedback(q) : q.two ? twoFeedback(q) : q.w.n ? (() => {
      const c = numFind("num", q.w.n), o = numFind("ord", q.w.n);
      return `<div class="pair" lang="ru"><span>${q.w.w}</span>${speakBtn(q.w.w,"발음 듣기")}</div>
      <p class="mean">${q.w.ko} <span class="pos">· ${q.w.pos==="ord" ? "서수 (순서)" : "기수 (개수)"}</span></p>
      <table class="conj" lang="ru"><tbody>
        <tr class="${q.w.pos==="num" ? "on" : ""}"><th>기수 ${q.w.n}</th><td>${c.w}</td></tr>
        <tr class="${q.w.pos==="ord" ? "on" : ""}"><th>서수 ${q.w.n}번째</th><td>${o.w}</td></tr>
      </tbody></table>
      <p class="rule">${q.w.pos==="ord"
        ? "서수는 형용사처럼 성에 따라 끝이 바뀌어요: <span class='cy'>пе́рвый уро́к, пе́рвая кни́га, пе́рвое письмо́</span>. (тре́тий만 <span class='cy'>тре́тья, тре́тье</span>로 특별해요)"
        : q.w.n<=2 ? "1과 2는 성에 따라 모양이 바뀌어요: <span class='cy'>оди́н дом, одна́ кни́га, одно́ окно́ / два до́ма, две кни́ги</span>."
        : "기수는 ‘몇 개’를 말할 때, 서수는 ‘몇 번째’를 말할 때 써요."}</p>
      ${q.num ? "" : exBlock(q.w)}`; })()
    : q.dem ? `
    <div class="pair" lang="ru"><span><mark>${DEM[q.w.g]}</mark> ${q.w.w}</span>${speakBtn(`${DEM[q.w.g]} ${q.w.w}`,"발음 듣기")}</div>
    ${q.w.gx && !q.w.gx.startsWith("-мя") ? `<div>${badge(`예외 · ${GNAME[q.w.g]}`)}</div>` : ""}
    <p class="mean">이 ${q.w.ko.split(",")[0].replace(/\(.*?\)/g,"").trim()} <span class="pos">· ${GNAME[q.w.g]}${q.w.g==="pl" ? "" : " 명사"}</span></p>
    <p class="rule">${GREASON[q.w.g]}</p>
    ${q.w.gx ? `<p class="note">${q.w.gx}</p>` : ""}` : `
    <div class="pair" lang="ru"><span>${q.w.w}</span>${speakBtn(q.w.w,"발음 듣기")}</div>
    <p class="mean">${q.w.ko} <span class="pos">· ${POSL[q.w.pos]}</span></p>
    ${exBlock(q.w)}
    <div class="ext"><span lang="ru">${q.w.w}</span>${extLinks(q.w.wP)}</div>`,
  itemKey: q => q.mod ? `mod:${q.mod}:${q.mod==="rel" ? q.n.wP : (q.a || q.p).wP}` : q.num ? `num:${q.w.wP}` : q.two ? `two:${q.v.infP}:${q.o.nomP}` : (q.dem ? "dem:" : "wd:") + q.w.wP,
  wrongLine: q => q.mod==="rel" ? ({ ru:`${relRu(q,false)}${modBadges(q).length ? `<br>${modBadges(q).map(badge).join(" ")}` : ""}`, ko:relKo(q) })
    : q.mod ? ({ ru:`${modSentType(q) ? modSentRu(q, modForm(q)) : `${modForm(q)} ${q.n.w}`}${modBadges(q).length ? `<br>${modBadges(q).map(badge).join(" ")}` : ""}`, ko: modSentType(q) ? modSentKo(q) : `${q.mod==="adj" ? koFirst(q.a.ko) : q.p.ko} ${q.n.ko}` })
    : q.num ? ({ ru:q.w.w, ko:numLabel(q.w) }) : q.two ? ({ ru:twoRu(q), ko:twoKo(q, false) }) : q.dem ? ({ ru:`${DEM[q.w.g]} ${q.w.w}${q.w.gx && !q.w.gx.startsWith("-мя") ? `<br>${badge(`예외 · ${GNAME[q.w.g]}`)}` : ""}`, ko:`${q.w.ko} · ${GNAME[q.w.g]}` })
    : ({ ru:q.w.w, ko:`${q.w.ko} · ${POSL[q.w.pos]}` }),
  best:{ store:"ruQuizBest3", key: s => s.game==="mod" ? `vocmod_${s.ans}` : s.game==="num" ? "vocnum" : s.game==="meaning" && s.mode==="two" ? `vocsent_${s.level}` : s.game==="dem" ? `vocdem_${s.level}` : `voc_${s.level}_${s.ans}` },
  rules: () => `<details class="rules"><summary>단어 구성 안내</summary><ul>
      <li><b>초급</b>: 보내 주신 교재 사진(1·2과 단어장, 명사의 성, 복수형, 전치사 в/на, 동사 표)에 나온 단어 전부와, 대화에서 배웠다고 하신 жить · рабо́тать · учи́ться · говори́ть · изуча́ть 등이에요.</li>
      <li><b>중급</b>: 초급과 비슷한 수준에서 가장 자주 쓰는 단어예요. 숫자, 인사, 기본 형용사·부사·동사, 때·날씨·몸 관련 명사가 들어 있어요.</li>
      <li><b>고급</b>: 한 단계 위의 자주 쓰는 단어예요. 감정·성질 형용사, ‘해야 한다 / 해도 된다’ 같은 표현, 학업·직장·건강 관련 단어가 들어 있어요.</li>
      <li>객관식 보기는 되도록 같은 품사(명사끼리, 동사끼리)에서 나오고, 뜻이 겹치는 단어는 함께 나오지 않아요.</li>
    </ul><ul class="sub">
      <li><b>‘이’ 게임</b>: 명사의 성에 맞춰 골라요. ${GREASON.m} / ${GREASON.f} / ${GREASON.n} / ${GREASON.pl}</li>
      <li><b>관계대명사</b>: ${RELRULE} <span class="cy">Э́то студе́нтка, кото́рая живёт в Москве́.</span></li>
      <li><span class="exc">예외</span>па́па, де́душка처럼 -а로 끝나도 남자면 남성(э́тот), -ь 명사는 성을 외워야 하고(э́тот день, э́та ночь), ко́фе는 남성, кафе́ · пальто́ 같은 외래어는 중성이에요.</li>
    </ul></details>`
};

/* ================= 대명사 (인칭대명사 격 · 소유 · 지시 · 의문 · 관계) ================= */
const PCASE = ["주격","대격","전치격"], PCASEH = ["~은/는, ~이/가","~을/를","о + ~에 대해"];
const PTAB = [
  { n:"я",   ko:["나는","나를","나에 대해"],     f:["я","меня́","обо мне́"] },
  { n:"ты",  ko:["너는","너를","너에 대해"],     f:["ты","тебя́","о тебе́"] },
  { n:"он",  ko:["그는","그를","그에 대해"],     f:["он","его́","о нём"] },
  { n:"она́", ko:["그녀는","그녀를","그녀에 대해"], f:["она́","её","о ней"] },
  { n:"мы",  ko:["우리는","우리를","우리에 대해"], f:["мы","нас","о нас"] },
  { n:"вы",  ko:["당신은","당신을","당신에 대해"], f:["вы","вас","о вас"] },
  { n:"они́", ko:["그들은","그들을","그들에 대해"], f:["они́","их","о них"] } ];
const QTAB = [
  { n:"кто", ko:["누가","누구를","누구에 대해"], f:["кто","кого́","о ком"] },
  { n:"что", ko:["무엇이","무엇을","무엇에 대해"], f:["что","что","о чём"] } ];
const P0 = s => s.replace(/\u0301/g,"");
const PNOTE = {
  "я|2":"‘나에 대해’만 о가 아니라 <b class='cy'>обо</b>를 써요: обо мне́.",
  "он|2":"он · она · они는 전치사 뒤에서 앞에 <b class='cy'>н</b>이 붙어요: о нём, о ней, о них.",
  "она́|2":"он · она · они는 전치사 뒤에서 앞에 <b class='cy'>н</b>이 붙어요: о нём, о ней, о них.",
  "они́|2":"он · она · они는 전치사 뒤에서 앞에 <b class='cy'>н</b>이 붙어요: о нём, о ней, о них.",
  "мы|1":"нас는 대격과 전치격(о нас) 모양이 같아요.", "мы|2":"нас는 대격과 전치격(о нас) 모양이 같아요.",
  "вы|1":"вас는 대격과 전치격(о вас) 모양이 같아요.", "вы|2":"вас는 대격과 전치격(о вас) 모양이 같아요.",
  "он|1":"его́(그를)는 소유형용사 его́(그의)와 모양이 같아요. её · их도 마찬가지예요.",
  "она́|1":"её(그녀를)는 소유형용사 её(그녀의)와 모양이 같아요.", "они́|1":"их(그들을)는 소유형용사 их(그들의)와 모양이 같아요.",
  "кто|1":"사람·동물을 물을 때는 кто → <b class='cy'>кого́</b>예요.",
  "что|1":"что는 대격도 주격과 똑같이 <b class='cy'>что</b>예요.",
  "кто|2":"사람에 대해 물을 때 <b class='cy'>о ком</b>, 사물·일에 대해 물을 때 <b class='cy'>о чём</b>이에요.",
  "что|2":"사람에 대해 물을 때 <b class='cy'>о ком</b>, 사물·일에 대해 물을 때 <b class='cy'>о чём</b>이에요."
};
const PEXC = { "я|2":"예외 · обо мне́", "он|2":"전치사 뒤 н-", "она́|2":"전치사 뒤 н-", "они́|2":"전치사 뒤 н-" };
const QTRAP = { "кто|0":["кого","что","о ком"], "кто|1":["кто","что","о ком"], "кто|2":["о чём","кого","кто"],
                "что|0":["кто","кого","о чём"], "что|1":["кого","кто","о чём"], "что|2":["о ком","что","кого"] };
function caseItems(){ return [...PTAB.flatMap(r => [0,1,2].map(c => ({ t:"pcase", r, c, ko:r.ko[c] }))),
                              ...QTAB.flatMap(r => [0,1,2].map(c => ({ t:"pcase", r, c, q:true, ko:r.ko[c] })))]; }
function buildCase(it){
  const r = it.r, c = it.c, ans = P0(r.f[c]);
  const wrong = it.q ? QTRAP[`${r.n}|${c}`] : shuffle(PTAB.filter(x => x!==r).map(x => P0(x.f[c]))).slice(0,3);
  return { pc:true, r, c, q:!!it.q, parts:[ pickPart("c", `러시아어로는? <span class="cy">(${PCASE[c]})</span>`, PCASE[c], [ans, ...wrong], ans, true) ] };
}
function caseTable(q){
  const T = q.q ? QTAB : PTAB;
  return `<table class="conj ptab" lang="ru"><thead><tr><th></th>${PCASE.map((h,i) => `<th class="${i===q.c ? "hc" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${T.map(x =>
    `<tr class="${x===q.r ? "on" : ""}"><th>${x.ko[0].replace(/[은는이가]$/,"")}</th>${x.f.map((f,i) => `<td>${x===q.r && i===q.c ? `<mark>${f}</mark>` : f}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
const MPRON = {
  tab:"대명사", h1:"대명사 퀴즈", ru:"местоиме́ния", unit:"문제",
  lead:"인칭대명사와 кто / что의 격(주격 · 대격 · 전치격), 그리고 소유 · 지시 · 의문 · 관계 표현을 한곳에서 연습해요. 문장 속 연습은 동사 · 전치격 탭에도 그대로 있어요.",
  levels(s){
    const d = { case:"я · ты · он … · кто · что의 주격 / 대격 / 전치격 (27문제)", det:"мой · твой · наш · ваш · его́ · её · их · э́тот · како́й · чей · кото́рый",
                all:"인칭대명사 격 + 소유 · 지시 · 의문 · 관계 전부" }[s.game];
    const items = s.game==="case" ? caseItems() : s.game==="det" ? modItems() : [...caseItems(), ...modItems()];
    return { beginner:{ label:"교재 범위", desc:d, items } };
  },
  segs(s){ return [
    ["game","게임 종류",[["case","인칭대명사 · кто/что 격"],["det","소유 · 지시 · 의문 · 관계"],["all","전부 섞기"]]],
    ...(s.game!=="case" ? [["ans","의문형용사(како́й · чей) 뜻 답하는 방식",[["mc","객관식"],["text","주관식"]]]] : [])
  ]; },
  summary: s => ({ case:"인칭대명사 · кто/что 격", det:"소유 · 지시 · 의문 · 관계", all:"전부 섞기" })[s.game],
  build(it, pool, s){ return it.t==="pcase" ? buildCase(it) : buildMod(it, s); },
  prompt(q){
    if(q.pc) return `<div class="word"><span class="w">${q.r.ko[q.c]}</span></div><p class="hint">${PCASE[q.c]} · ${PCASEH[q.c]}</p>`;
    return modPrompt(q);
  },
  feedback(q){
    if(!q.pc) return modFeedback(q);
    const k = `${q.r.n}|${q.c}`, f = q.r.f[q.c];
    return `<div class="pair" lang="ru"><span>${f}</span>${speakBtn(f,"발음 듣기")}</div>
      ${PEXC[k] ? `<div>${badge(PEXC[k])}</div>` : ""}
      <p class="mean">${q.r.ko[q.c]} <span class="pos">· ${PCASE[q.c]}</span></p>
      ${caseTable(q)}
      ${PNOTE[k] ? `<p class="rule">${PNOTE[k]}</p>` : ""}`;
  },
  itemKey: q => q.pc ? `pc:${P0(q.r.n)}:${q.c}` : MVOC.itemKey(q),
  wrongLine: q => q.pc ? ({ ru:`${q.r.f[q.c]}${PEXC[`${q.r.n}|${q.c}`] ? `<br>${badge(PEXC[`${q.r.n}|${q.c}`])}` : ""}`, ko:`${q.r.ko[q.c]} · ${PCASE[q.c]}` }) : MVOC.wrongLine(q),
  best:{ store:"ruQuizBest3", key: s => `pron_${s.game}_${s.ans}` },
  rules: () => `<details class="rules"><summary>대명사 표 한눈에 보기</summary>
      ${caseTable({ r:null, c:-1 })}
      ${caseTable({ q:true, r:null, c:-1 })}
      <ul>
        <li>${PNOTE["я|2"]}</li><li>${PNOTE["он|2"]}</li><li>нас · вас는 대격과 전치격 모양이 같고, его́ · её · их(~를)는 소유형용사(~의)와 모양이 같아요.</li>
        <li><b>소유형용사</b> мой · твой · наш · ваш는 명사의 성·수에 맞춰 바뀌어요(мой / моя́ / моё / мои́). его́ · её · их는 안 바뀌어요.</li>
        <li><b>지시형용사</b> э́тот / э́та / э́то / э́ти, <b>의문형용사</b> како́й / кака́я / како́е / каки́е · чей / чья / чьё / чьи도 명사의 성·수에 맞춰요.</li>
        <li><b>관계대명사</b>: ${RELRULE}</li>
      </ul></details>`
};

/* ================= 종합 문제: 한 문장에 여러 문법을 함께 ================= */
const VBY = Object.fromEntries(V3.verbs.map(v => [v.infP, v]));
const LVORD = ["beginner","intermediate","advanced"];
const upto = lv => lv==="mixed" ? LVORD : LVORD.slice(0, LVORD.indexOf(lv)+1);
const PLMAP = (() => { const m = {}; Object.values(DATA).forEach(d => d.words.forEach(w => { m[w.ru] = w; })); return m; })();
const POSSK = { "мой":"내", "твой":"네", "наш":"우리", "ваш":"당신", "его":"그의", "её":"그녀의", "их":"그들의" };
const cslot = cue => `<span class="slot"><span class="gap">?</span><small>${cue}</small></span>`;
function vOpts(v, fi){ return [v.formsP[fi], ...shuffle([0,1,2,3,4,5].filter(i => i!==fi)).slice(0,3).map(i => v.formsP[i])]; }
function possOpts(p, gi){
  if(!p.formsP){ const trap = { "его":"ему", "её":"ей", "их":"им" }[p.wP]; return [p.wP, ...["его","её","их"].filter(x => x!==p.wP), trap]; }
  const ans = p.formsP[gi];
  const op = shuffle(MODD.poss.filter(x => x!==p).map(x => x.formsP ? x.formsP[gi] : x.wP)).filter(x => x!==ans).slice(0,2);
  const og = shuffle(p.formsP.filter((x,i) => i!==gi && !op.includes(x))).slice(0,1);
  return [ans, ...op, ...og];
}
function adjOpts(a, gi){
  const ans = a.formsP[gi]; let w = shuffle(a.formsP.filter((x,i) => i!==gi));
  if(a.naive[gi]!==ans) w = [a.naive[gi], ...w.slice(0,2)];
  return [ans, ...w.slice(0,3)];
}
const possForm = (p, gi) => p.forms ? p.forms[gi] : p.w;
const mkq = (o) => ({ comp:true, M:MCOMP, ...o });
const vNote = (v, f, subj) => `<b>동사</b> · ${v.inf} → <span class="cy">${f}</span> (${subj}) — ${VRULE[v.type]}`;

const COMP = {
  /* A. 동사 + 전치사 + 전치격 */
  vprep(lv){
    const VMAP = { work:["работать"], live:["жить"], study:["учиться"], rest:["отдыхать"], walk:["гулять"], eat:["обедать","ужинать","завтракать"] };
    const ps = V3.places.filter(p => p.kind==="loc" && upto(lv).includes(p.lvl) && p.frames.some(k => VMAP[k]));
    const p = pick1(ps), k = pick1(p.frames.filter(k => VMAP[k])), v = VBY[pick1(VMAP[k])];
    const si = Math.floor(Math.random()*7), fi = PIDX[si], f = v.forms[fi];
    const tail = V3.frames[k][0][2].replace("{L}", p.koLoc);
    const subj = cap(PERS[si][0]);
    return mkq({ key:`vprep:${p.nomP}`, cat:"종합 · 동사+전치사+전치격",
      prompt:`<p class="sent" lang="ru">${subj} ${cslot(v.inf)} ${cslot("в / на")} ${cslot(p.nom)}.</p>`,
      ru:`${subj} ${vHL(f)} <mark>${p.prep}</mark> ${hlFrom(p.nomP, p.form)}.`, plain:`${subj} ${f} ${p.prep} ${p.form}.`,
      ko:`${PERS[si][1]} ${tail}.`,
      notes:[vNote(v, f, PERS[si][0]), `<b>전치사</b> · ${PCAT[p.cat]}`, `<b>형태</b> · ${PFR[p.fr]}`],
      badges:[VEXC[v.type], ...prepBadges(p)].filter(Boolean),
      parts:[ pickPart("v","동사 형태는?","동사", vOpts(v, fi), v.formsP[fi], true),
              pickPart("p","전치사는?","전치사", ["в","на"], p.prep, true, true),
              pickPart("n","명사 형태는?","전치격", [p.formP, ...p.wrong], p.formP, true) ] });
  },
  /* B. 동사 + о + 대명사 전치격 */
  vpron(lv){
    const VS = [["думать","생각해요"],["говорить","이야기해요"],["читать","읽어요"],["спрашивать","물어봐요"], ...(upto(lv).includes("advanced") ? [["писать","써요"]] : [])];
    const [vk, kt] = pick1(VS), v = VBY[vk];
    const si = Math.floor(Math.random()*7), fi = PIDX[si], oi = pick1([0,1,2,3,4,5,6].filter(i => PIDX[i]!==fi && PTAB[i]));
    const R = PTAB[oi], f = v.forms[fi], subj = cap(PERS[si][0]);
    const ans = P0(R.f[2]), others = shuffle(PTAB.filter(x => x!==R).map(x => P0(x.f[2]))).slice(0,3);
    return mkq({ key:`vpron:${vk}:${P0(R.n)}`, cat:"종합 · 동사+대명사 전치격",
      prompt:`<p class="sent" lang="ru">${subj} ${cslot(v.inf)} ${cslot(`о + ${R.n}`)}.</p>`,
      ru:`${subj} ${vHL(f)} <mark>${R.f[2]}</mark>.`, plain:`${subj} ${f} ${R.f[2]}.`,
      ko:`${PERS[si][1]} ${R.ko[2]} ${kt}.`,
      notes:[vNote(v, f, PERS[si][0]), `<b>대명사 전치격</b> · ${R.n} → <span class="cy">${R.f[2]}</span>${PNOTE[`${R.n}|2`] ? ` — ${PNOTE[`${R.n}|2`]}` : ""}`],
      badges:[VEXC[v.type], PEXC[`${R.n}|2`]].filter(Boolean),
      parts:[ pickPart("v","동사 형태는?","동사", vOpts(v, fi), v.formsP[fi], true),
              pickPart("o","‘~에 대해’는?","대명사", [ans, ...others], ans, true) ] });
  },
  /* C. 소유형용사 + 주어 + 동사 + 대격 */
  possv(lv){
    const vs = V3.verbs.filter(v => upto(lv).includes(v.lvl) && v.objs.some(k => k!=="*"));
    const v = pick1(vs), ok = pick1(v.objs.filter(k => k!=="*")), o = V3.objs[ok];
    const n = pick1(MODD.rel.nouns.filter(x => x.c==="p" && x.wP!==o.nomP)), gi = GI[n.g], fi = gi===3 ? 5 : 2;
    const p = pick1(MODD.poss), pf = possForm(p, gi), f = v.forms[fi];
    return mkq({ key:`possv:${v.infP}:${ok}`, cat:"종합 · 소유+동사+대격",
      prompt:`<p class="sent" lang="ru">${cslot(`(${p.ko})`)} ${n.w} ${cslot(v.inf)} ${cslot(o.nom)}.</p>`,
      ru:`<mark>${cap(pf)}</mark> ${n.w} ${vHL(f)} ${hlFrom(o.nomP, o.acc)}.`, plain:`${cap(pf)} ${n.w} ${f} ${o.acc}.`,
      ko:`${p.ko} ${koFirst(n.ko)}${josa(koFirst(n.ko),"이","가")} ${v.tr.replace("{o}", o.ko).replace("{을}", o.pt)}.`,
      notes:[`<b>소유형용사</b> · ${n.w}는 ${GNAME4[gi]}${gi===3 ? "" : " 명사"}라서 <span class="cy">${pf}</span>${p.formsP ? "" : " (его́ · её · их는 안 바뀌어요)"}`,
             vNote(v, f, gi===3 ? "они" : "он / она"), `<b>목적어</b> · ${o.nom} → <span class="cy">${o.acc}</span> — ${ARULE[o.kind]}`],
      badges:[n.note ? `명사 예외 · ${GNAME4[gi]}` : "", VEXC[v.type], AEXC[o.kind]].filter(Boolean),
      grams:[[pf, ["소유형용사", "주격", p.formsP ? GNAME4[gi] : "", "주어를 꾸밈"]], [o.acc, ["목적어", "대격"]]],
      parts:[ pickPart("p","소유형용사는?","소유", possOpts(p, gi), p.formsP ? p.formsP[gi] : p.wP, true),
              pickPart("v","동사 형태는?","동사", vOpts(v, fi), v.formsP[fi], true),
              pickPart("o","목적어(대격)는?","대격", [o.accP, ...o.wrong], o.accP, true) ] });
  },
  /* D. 지시 + 형용사 + 명사 — 소유 (Э́тот но́вый журна́л — мой.) */
  demadj(){
    const adjs = MODD.adjs.filter(a => !a.q && a.wP!=="чужой" && !a.cats.every(c => c==="person" || c==="sibling"));   /* ‘남의 ~ — 내 거’ 같은 모순 방지 */
    const a = pick1(adjs), ns = MODD.nouns.filter(x => x.cats.some(c => a.cats.includes(c)) && !x.cats.some(c => c==="person" || c==="sibling"));
    const n = pick1(ns), gi = GI[n.g], p = pick1(MODD.poss), df = MODD.dem.forms[gi], af = a.forms[gi], pf = possForm(p, gi);
    const stem = cpref(a.formsP);
    return mkq({ key:`demadj:${a.wP}`, cat:"종합 · 이+형용사+소유",
      prompt:`<p class="sent" lang="ru">${cslot("(이)")} ${cslot(a.w)} ${n.w} — ${cslot(`(${p.ko})`)}.</p>`,
      ru:`<mark>${cap(df)}</mark> ${hlFrom(stem, af)} ${n.w} — <mark>${pf}</mark>.`, plain:`${cap(df)} ${af} ${n.w} — ${pf}.`,
      ko:`이 ${koFirst(a.ko)} ${koFirst(n.ko)}${josa(koFirst(n.ko),"은","는")} ${POSSK[p.wP]} 거예요.`,
      notes:[`<b>${n.w}</b>는 ${GNAME4[gi]}${gi===3 ? "" : " 명사"} → 세 단어 모두 ${GNAME4[gi]}형으로 맞춰요.`, `<b>형용사</b> · ${ATYPE[a.t]}`, ...(n.note ? [n.note] : [])],
      badges:[AXL[a.t], n.note ? `명사 예외 · ${GNAME4[gi]}` : ""].filter(Boolean),
      grams:[[df, ["지시형용사", "주격", GNAME4[gi]]], [af, ["형용사", "주격", GNAME4[gi]]], [pf, ["소유형용사", "주격", p.formsP ? GNAME4[gi] : "", "술어"]]],
      parts:[ pickPart("d","‘이’는?","지시", MODD.dem.formsP, MODD.dem.formsP[gi], true, true),
              pickPart("a","형용사 형태는?","형용사", adjOpts(a, gi), a.formsP[gi], true),
              pickPart("p","‘~의 것’은?","소유", possOpts(p, gi), p.formsP ? p.formsP[gi] : p.wP, true) ] });
  },
  /* E. 소유 + 형용사 + 복수형 (Э́то мои́ но́вые кни́ги.) */
  pladj(){
    const ns = MODD.nouns.filter(x => x.g!=="pl" && PLMAP[x.wP] && !x.cats.some(c => c==="person" || c==="sibling"));
    const n = pick1(ns), W = PLMAP[n.wP];
    const a = pick1(MODD.adjs.filter(a => !a.q && a.wP!=="чужой" && a.cats.some(c => n.cats.includes(c))));
    const p = pick1(MODD.poss), pf = possForm(p, 3), af = a.forms[3];
    return mkq({ key:`pladj:${n.wP}`, cat:"종합 · 소유+형용사+복수형",
      prompt:`<p class="sent" lang="ru">Э́то ${cslot(`(${p.ko})`)} ${cslot(a.w)} ${cslot(n.w)}.</p>`,
      ru:`Э́то <mark>${pf}</mark> ${hlFrom(cpref(a.formsP), af)} ${highlight(W)}.`, plain:`Э́то ${pf} ${af} ${W.plS}.`,
      ko:`이건 ${p.ko} ${koFirst(a.ko)} ${koFirst(n.ko)}들이에요.`,
      notes:[`<b>복수형</b> · ${W.ruS} → <span class="cy">${W.plS}</span> — ${RULES[W.rule]}${W.note ? ` ${W.note}` : ""}`,
             `<b>형용사 복수</b> · ${ATYPE[a.t]}`, `<b>소유형용사 복수</b> · <span class="cy">${pf}</span>${p.formsP ? "" : " (모양 고정)"}`],
      badges:[EXC[W.rule] ? `예외 복수형 · ${EXC[W.rule]}` : "", AXL[a.t]].filter(Boolean),
      grams:[[pf, ["소유형용사", "주격", "복수"]], [af, ["형용사", "주격", "복수"]], [W.plS, ["명사", "주격", "복수"]]],
      parts:[ pickPart("p","소유형용사는?","소유", possOpts(p, 3), p.formsP ? p.formsP[3] : p.wP, true),
              pickPart("a","형용사 형태는?","형용사", adjOpts(a, 3), a.formsP[3], true),
              pickPart("n","명사 복수형은?","복수형", [W.pl, ...W.wrong], W.pl, true) ] });
  },
  /* F. 한국어 문장 → 주어 + 동사 + 목적어 모두 */
  full(lv){
    const vs = V3.verbs.filter(v => upto(lv).includes(v.lvl) && v.objs.some(k => k!=="*"));
    const v = pick1(vs), ok = pick1(v.objs.filter(k => k!=="*")), o = V3.objs[ok];
    let subjRu, subjKo, sOpts, sAns, fi;
    if(Math.random() < .5){
      const si = Math.floor(Math.random()*7); fi = PIDX[si];
      subjRu = PERS[si][0]; subjKo = PERS[si][1]; sAns = subjRu;
      sOpts = [sAns, ...shuffle(PERS.map(x => x[0]).filter(x => x!==sAns)).slice(0,3)];
    } else {
      const s = pick1(SUBJ.filter(x => P0(x[0])!==o.nomP)); fi = 2;
      subjRu = s[0]; subjKo = `${s[1]}${josa(s[1],"이","가")}`; sAns = P0(s[0]);
      sOpts = [sAns, ...shuffle(SUBJ.filter(x => x!==s && x[1]!==s[1])).slice(0,3).map(x => P0(x[0]))];
    }
    const f = v.forms[fi];
    const pool = v.objs.filter(k => k!=="*" && k!==ok).map(k => V3.objs[k]).filter(x => x.ko!==o.ko);
    const oW = [...new Set([...shuffle(pool).map(x => x.accP), ...o.wrong])].filter(x => x!==o.accP).slice(0,3);
    const koS = `${subjKo} ${v.tr.replace("{o}", `<mark>${o.ko}</mark>`).replace("{을}", o.pt)}.`;
    return mkq({ key:`full:${v.infP}:${ok}`, cat:"종합 · 한국어 → 러시아어 문장",
      prompt:`<p class="kosent">${koS.replace(subjKo, `<mark>${subjKo}</mark>`)}</p><p class="sent" lang="ru">${cslot("①")} ${cslot("②")} ${cslot("③")}.</p>`,
      ru:`${cap(subjRu)} ${vHL(f)} ${hlFrom(o.nomP, o.acc)}.`, plain:`${cap(subjRu)} ${f} ${o.acc}.`,
      ko:koS.replace(/<[^>]+>/g,""),
      notes:[vNote(v, f, P0(subjRu)), `<b>목적어</b> · ${o.nom} → <span class="cy">${o.acc}</span> — ${ARULE[o.kind]}`],
      badges:[VEXC[v.type], AEXC[o.kind]].filter(Boolean),
      parts:[ pickPart("s","주어는?","주어", sOpts, sAns, true),
              pickPart("v","동사는?","동사", vOpts(v, fi), v.formsP[fi], true),
              pickPart("o","목적어는?","목적어", [o.accP, ...oW], o.accP, true) ] });
  },
  /* G. 질문 만들기: о ком / о чём + 동사 형태 */
  askv(lv){
    const P = pick1(V3.places.filter(p => p.kind==="about")), FA = V3.frames.about;
    const META = [["говорить",4],["думать",1],["читать",2],["писать",2],["спрашивать",5],["говорить",2]];
    const idxs = FA.map((f,i) => i).filter(i => !P0(FA[i][0]).toLowerCase().includes(P.nomP.toLowerCase()) && (META[i][0]!=="писать" || upto(lv).includes("advanced")));
    const i = pick1(idxs), fr = FA[i], v = VBY[META[i][0]], fi = META[i][1];
    const qsub = fr[4].split(" ").slice(0, -1).join(" "), w = P.anim ? "о ком" : "о чём", W = P.anim ? "О ком" : "О чём";
    return mkq({ key:`askv:${P.nomP}`, cat:"종합 · 질문 만들기",
      prompt:`<p class="hint">대답이 이 문장이 되도록 질문을 만들어 보세요</p><p class="answerline" lang="ru">${fr[0]} ${P.prep} ${P.form}.</p>
        <p class="sent" lang="ru">${cslot("의문사")} ${qsub} ${cslot(v.inf)}?</p>`,
      ru:`<mark>${W}</mark> ${qsub} ${vHL(v.forms[fi])}?`, plain:`${W} ${qsub} ${v.forms[fi]}?`,
      ko:`${fr[5]} ${fr[6].replace("{Q}", P.anim ? "누구에 대해" : "무엇에 대해")}?`,
      notes:[`대답: <span class="cy">${fr[0]} ${P.prep} ${P.form}.</span>`, QPREP, vNote(v, v.forms[fi], qsub)],
      badges:[VEXC[v.type]].filter(Boolean),
      parts:[ pickPart("w","의문사는?","의문사", ["о ком","о чём","кого","что"], w, true, true),
              pickPart("v","동사 형태는?","동사", vOpts(v, fi), v.formsP[fi], true) ] });
  }
};
const COMP_CATS = [["vprep","종합 · 동사+전치사+전치격"],["vpron","종합 · 동사+대명사 전치격"],["possv","종합 · 소유+동사+대격"],
  ["demadj","종합 · 이+형용사+소유"],["pladj","종합 · 소유+형용사+복수형"],["full","종합 · 한국어 → 러시아어 문장"],["askv","종합 · 질문 만들기"]];
const MCOMP = {
  build: (x) => { const q = COMP[x.kind](x.lv); q.M = MCOMP; return q; },
  prompt: q => q.prompt,
  feedback: q => `<div class="pair" lang="ru"><span>${q.ru}</span>${speakBtn(q.plain,"문장 듣기")}</div>
    ${q.grams ? gramRow(q.grams) : ""}
    ${q.badges.length ? `<div>${q.badges.map(badge).join(" ")}</div>` : ""}
    <p class="tr">${q.ko}</p>
    ${q.notes.map(n => `<p class="rule" style="margin-top:8px">${n}</p>`).join("")}`,
  itemKey: q => `comp:${q.key}`,
  wrongLine: q => ({ ru:`${q.plain}${q.badges.length ? `<br>${q.badges.map(badge).join(" ")}` : ""}`, ko:q.ko })
};

/* ================= 종합 시험: 모든 탭의 문제를 골고루 ================= */
const EXAM_CAP = 25;   /* 분야마다 최대 몇 문제를 후보로 넣을지 */
function examCats(lv){
  const pick = (M, s) => { const L = LVS(M, s); return (L[lv] || Object.values(L)[0]).items; };
  return [
    { cat:"단어 뜻",          M:MVOC,  s:{ game:"meaning", mode:"one", ans:"mc" } },
    { cat:"문장 속 두 단어",   M:MVOC,  s:{ game:"meaning", mode:"two", ans:"mc" } },
    { cat:"형용사",           M:MVOC,  s:{ game:"mod", ans:"mc" } },
    { cat:"숫자",             M:MVOC,  s:{ game:"num", ans:"mc" } },
    { cat:"대명사 격",         M:MPRON, s:{ game:"case", ans:"mc" } },
    { cat:"소유·지시·의문·관계", M:MPRON, s:{ game:"det", ans:"mc" } },
    { cat:"복수형",           M:MPL,   s:{ game:"both", ans:"mc" } },
    { cat:"동사 변화",         M:MVB,   s:{ game:"both", ans:"mc" } },
    { cat:"동사 문장·대격",     M:MVB,   s:{ game:"sent", ans:"mc" } },
    { cat:"전치격",           M:MPR,   s:{ game:"both", view:"word", ans:"mc" } },
    { cat:"전치격 문장",       M:MPR,   s:{ game:"both", view:"sent", ans:"mc" } },
    { cat:"어디에서·어디로",    M:MPR,   s:{ game:"mix", ans:"mc" } }
  ].map(c => ({ ...c, pool: pick(c.M, { ...c.s, level:lv }) }));
}
const MEXAM = {
  tab:"시험", h1:"종합 시험", ru:"экза́мен", unit:"문제",
  lead:"지금까지 만든 모든 탭의 문제가 골고루 섞여 나와요. 한 문장에서 동사 · 전치사 · 격 · 소유 · 형용사 · 복수형을 동시에 맞히는 ‘종합’ 문제도 함께 나와요. 끝나면 분야별 점수를 보여 줘요.",
  levels(){
    const desc = { beginner:"초급 범위 + 형용사 · 숫자 · 대명사", intermediate:"중급 범위 + 형용사 · 숫자 · 대명사", advanced:"고급 범위 + 형용사 · 숫자 · 대명사", mixed:"초 · 중 · 고 전부" };
    const lab = { beginner:"초급", intermediate:"중급", advanced:"고급", mixed:"통합" };
    return Object.fromEntries(Object.keys(lab).map(lv => [lv, { label:lab[lv], desc:desc[lv],
      items: [ ...examCats(lv).flatMap(c => shuffle([...c.pool]).slice(0, EXAM_CAP).map(it => ({ exam:true, cat:c.cat, M:c.M, s:c.s, pool:c.pool, it, ko:it.ko }))),
               ...COMP_CATS.flatMap(([kind, cat]) => Array(EXAM_CAP).fill(0).map(() => ({ exam:true, comp:true, kind, lv, cat, ko:cat }))) ] }]));
  },
  segs(){ return []; },
  summary: () => "종합 시험",
  build(x){
    if(x.comp){ const q = MCOMP.build(x); q.cat = x.cat; return q; }
    const q = x.M.build(x.it, x.pool, { ...x.s, level:"beginner" }); q.M = x.M; q.cat = x.cat; return q; },
  prompt: q => q.M.prompt(q), feedback: q => q.M.feedback(q), itemKey: q => q.M.itemKey(q), wrongLine: q => q.M.wrongLine(q),
  best:{ store:"ruQuizBest3", key: s => `exam_${s.level}` },
  rules: () => `<details class="rules"><summary>시험 구성 안내</summary><ul>
      <li>11개 단일 분야(단어 뜻, 문장 속 두 단어, 형용사, 숫자, 대명사 격, 소유·지시·의문·관계, 복수형, 동사 변화, 동사 문장·대격, 전치격, 전치격 문장)에서 골고루 뽑아요.</li>
      <li>여기에 7가지 <b>종합 문제</b>가 섞여요: 동사+전치사+전치격(Мы живём в Коре́е), 동사+대명사 전치격(Он ду́мает обо мне́), 소유+동사+대격(Мой брат чита́ет газе́ту), 이+형용사+소유(Э́тот но́вый журна́л — мой), 소유+형용사+복수형(Э́то мои́ но́вые кни́ги), 한국어 → 러시아어 문장(주어·동사·목적어), 질문 만들기(О ком ты ду́маешь?).</li>
      <li>난이도는 단어 · 복수형 · 동사 · 전치격에 적용되고, 형용사 · 숫자 · 대명사는 항상 같은 범위에서 나와요.</li>
      <li>모든 문제는 객관식이에요. 끝나면 분야별 정답 수가 나오고, 틀린 문제만 다시 풀 수 있어요.</li>
    </ul></details>`
};
const qM = q => q.M || MOD[G.tab];


/* ================= 형용사 탭 ================= */
const ANTO = [["новый","старый"],["молодой","старый"],["старший","младший"],["маленький","большой"],["хороший","плохой"],
  ["горячий","холодный"],["интересный","неинтересный"],["красивый","некрасивый"]];
const ADJBY = w => MODD.adjs.find(a => a.wP===w);
function antoItems(){ return ANTO.flatMap(([x,y]) => [{ t:"anto", a:ADJBY(x), b:ADJBY(y), ko:ADJBY(x).ko }, { t:"anto", a:ADJBY(y), b:ADJBY(x), ko:ADJBY(y).ko }]); }
const MADJ = {
  tab:"형용사", h1:"형용사 퀴즈", ru:"прилага́тельные", unit:"문제",
  lead:"교재 형용사로 뜻, 명사에 맞는 형태(남성 · 여성 · 중성 · 복수), 반의어를 연습해요.",
  levels(s){
    const d = { both:"교재 형용사 31개 · 뜻 + 형태", form:"교재 형용사 31개 · 명사에 맞는 형태만", meaning:"교재 형용사 31개 · 뜻만", anto:"교재 반의어 8쌍 (양방향 16문제)" }[s.game];
    return { beginner:{ label:"교재 범위", desc:d, items: s.game==="anto" ? antoItems() : adjItems() } };
  },
  segs(s){ return [
    ["game","게임 종류",[["both","뜻 + 형태"],["form","형태만"],["meaning","뜻만"],["anto","반의어"]]],
    ...(s.game==="both" || s.game==="meaning" ? [["ans","뜻 답하는 방식",[["mc","객관식 (4지선다)"],["text","주관식 (직접 입력)"]]]] : [])
  ]; },
  summary: s => ({ both:"뜻 + 형태", form:"형태만", meaning:"뜻만", anto:"반의어" })[s.game],
  build(it, pool, s){
    if(it.t==="anto"){
      const others = shuffle(MODD.adjs.filter(x => !x.q && x!==it.a && x!==it.b && !ANTO.some(p => p.includes(it.a.wP) && p.includes(x.wP)))).slice(0,3);
      return { anto:true, a:it.a, b:it.b, parts:[ pickPart("x","반대말은?","반의어", [it.b.wP, ...others.map(x => x.wP)], it.b.wP, true) ] };
    }
    const q = buildMod(it, s);
    if(s.game==="form") q.parts = q.parts.filter(p => p.key==="f");
    if(s.game==="meaning"){ q.parts = q.parts.filter(p => p.key==="m"); q.parts[0].title = "뜻은?"; q.monly = true; }
    return q;
  },
  prompt(q){
    if(q.anto) return `<div class="word"><span class="w" lang="ru">${q.a.w}</span>${speakBtn(q.a.w,"발음 듣기")}</div><p class="hint">반대말을 골라 보세요</p>`;
    if(q.monly) return `<div class="word"><span class="w" lang="ru">${q.a.w}</span>${speakBtn(q.a.w,"발음 듣기")}</div>`;
    return modPrompt(q);
  },
  feedback(q){
    if(!q.anto) return modFeedback(q);
    return `<div class="pair" lang="ru"><span>${q.a.w}</span><span class="arr">↔</span><span>${q.b.w}</span>${speakBtn(q.b.w,"발음 듣기")}</div>
      <p class="mean">${q.a.ko} ↔ ${q.b.ko}</p>
      ${q.a.wP==="старый" || q.b.wP==="старый" ? `<p class="rule">ста́рый는 물건에 쓰면 ‘낡은, 오래된’(↔ но́вый), 사람에 쓰면 ‘늙은’(↔ молодо́й)이에요.</p>` : ""}
      ${q.b.wP.startsWith("не") || q.a.wP.startsWith("не") ? `<p class="rule">앞에 <b class='cy'>не-</b>를 붙이면 반대말이 되는 경우가 있어요: интере́сный → неинтере́сный.</p>` : ""}`;
  },
  itemKey: q => q.anto ? `adj:anto:${q.a.wP}` : MVOC.itemKey(q),
  wrongLine: q => q.anto ? ({ ru:`${q.a.w} ↔ ${q.b.w}`, ko:`${koFirst(q.a.ko)} ↔ ${koFirst(q.b.ko)}` }) : MVOC.wrongLine(q),
  best:{ store:"ruQuizBest3", key: s => `adj_${s.game}_${s.ans}` },
  rules: () => `<details class="rules"><summary>형용사 규칙 한눈에 보기</summary><ul>
      <li>${ATYPE.hard} <span class="cy">но́вый, но́вая, но́вое, но́вые</span></li>
      <li><span class="exc">예외</span>${ATYPE.oy} <span class="cy">молодо́й, голубо́й</span></li>
      <li><span class="exc">예외</span>${ATYPE.oy_sp} <span class="cy">большо́й, плохо́й, друго́й, чужо́й</span></li>
      <li><span class="exc">예외</span>${ATYPE.kgh} <span class="cy">ма́ленький</span></li>
      <li><span class="exc">예외</span>${ATYPE.sib} <span class="cy">хоро́ший, горя́чий, ста́рший, мла́дший</span></li>
      <li><span class="exc">예외</span>${ATYPE.soft} <span class="cy">си́ний, ли́шний, дома́шний</span></li>
    </ul><ul class="sub">
      <li><b>반의어</b>: ${ANTO.map(([x,y]) => `<span class="cy">${ADJBY(x).w} ↔ ${ADJBY(y).w}</span>`).join(" · ")}</li>
    </ul></details>`
};


/* ================= 단어 탭 안의 ‘복수형’ 게임 (예전 복수형 탭) ================= */
(() => {
  const o = { levels:MVOC.levels, segs:MVOC.segs, summary:MVOC.summary, build:MVOC.build, rules:MVOC.rules, unit:MVOC.unit, best:MVOC.best };
  const isPl = s => !!s && s.game==="plural";
  const isAdj = s => !!s && s.game==="adj";
  const as = s => ({ ...s, game: s.amode || "both" });
  MVOC.levels = s => isPl(s) ? MPL.levels() : isAdj(s) ? MADJ.levels(as(s)) : o.levels.call(MVOC, s);
  MVOC.segs = s => isAdj(s) ? [ ...o.segs.call(MVOC, s).filter(x => x[0]==="game"),
    ["amode","형용사 방식",[["both","뜻 + 형태"],["form","형태만"],["meaning","뜻만"],["anto","반의어"],["sent","문장 (Э́то …)"]]],
    ...(as(s).game==="both" || as(s).game==="meaning" ? [["ans","뜻 답하는 방식",[["mc","객관식 (4지선다)"],["text","주관식 (직접 입력)"]]]] : []) ]
    : !isPl(s) ? o.segs.call(MVOC, s) : [ ...o.segs.call(MVOC, s).filter(x => x[0]==="game"),
    ["pmode","복수형 방식",[["both","뜻 + 복수형"],["only","복수형만"]]],
    ...(s.pmode!=="only" ? [["ans","뜻 답하는 방식",[["mc","객관식 (4지선다)"],["text","주관식 (직접 입력)"]]]] : []) ];
  MVOC.summary = s => isAdj(s) ? `형용사 · ${MADJ.summary(as(s))}` : !isPl(s) ? o.summary(s) : s.pmode==="only" ? "복수형만" : `뜻 + 복수형 · 뜻 ${s.ans==="text" ? "주관식" : "객관식"}`;
  MVOC.unit = s => isPl(s) ? "단어" : isAdj(s) ? "문제" : (typeof o.unit==="function" ? o.unit(s) : o.unit);
  MVOC.build = (w, pool, s) => {
    if(isAdj(s)){ const q = MADJ.build(w, pool, as(s)); q.M = MADJ; return q; }
    if(!isPl(s)) return o.build.call(MVOC, w, pool, s);
    const q = MPL.build(w, pool, { ...s, game:"both" });
    if(s.pmode==="only") q.parts = q.parts.filter(p => p.key==="p");
    q.M = MPL; return q;
  };
  MVOC.rules = () => isPl(ST.vocab) ? MPL.rules() : isAdj(ST.vocab) ? MADJ.rules() : o.rules();
  Object.defineProperty(MVOC, "best", { configurable:true, get(){   /* 예전 복수형 탭 최고 기록을 그대로 이어 써요 */
    if(isAdj(ST.vocab)) return { store:"ruQuizBest3", key: s => `adj_${s.amode || "both"}_${s.ans}` };
    return isPl(ST.vocab) ? { store:"ruPluralBest2", key: s => `${s.level}_${s.pmode==="only" ? "only" : "both"}_${s.ans}` } : o.best; } });
})();


/* ================= 형용사 게임: 문장 (Э́то + 소유 + 형용사 + 명사) ================= */
(() => {
  const o = { levels:MADJ.levels, summary:MADJ.summary, build:MADJ.build, prompt:MADJ.prompt, feedback:MADJ.feedback, itemKey:MADJ.itemKey, wrongLine:MADJ.wrongLine };
  const isS = s => !!s && s.game==="sent";
  const PERSC = ["person","sibling"];
  const ru = (q, mark) => { const pf = q.p ? possForm(q.p, q.gi) : "", af = q.a.forms[q.gi];
    const P = q.p ? (mark ? `<mark>${pf}</mark> ` : `${pf} `) : "", A = mark ? hlFrom(cpref(q.a.formsP), af) : af;
    return `Э́то ${P}${A} ${q.n.w}.`; };
  const ko = q => { const nk = koFirst(q.n.ko), who = q.n.cats.some(c => PERSC.includes(c)) ? "이 사람은" : "이건";
    return `${who} ${q.p ? q.p.ko + " " : ""}${koFirst(q.a.ko)} ${nk}${josa(nk,"이에요","예요")}.`; };
  MADJ.levels = s => isS(s) ? { beginner:{ label:"교재 범위", desc:"Э́то + 소유 + 형용사 + 명사 (교재 연습문제 4번 형식) · 형용사 31개", items: adjItems() } } : o.levels.call(MADJ, s);
  MADJ.summary = s => isS(s) ? "문장 (Э́то …)" : o.summary(s);
  MADJ.build = (it, pool, s) => {
    if(!isS(s) || it.t!=="adj") return o.build.call(MADJ, it, pool, s);
    const a = it.a, n = pick1(MODD.nouns.filter(x => x.cats.some(c => a.cats.includes(c)))), gi = GI[n.g];
    const p = a.wP==="чужой" ? null : pick1(MODD.poss);   /* ‘남의’ + ‘나의’는 모순이라 소유형용사 없이 */
    const parts = [];
    if(p) parts.push(pickPart("p", `소유형용사는? <span class="cy">(${p.ko})</span>`, "소유", possOpts(p, gi), p.formsP ? p.formsP[gi] : p.wP, true));
    parts.push(pickPart("a", `형용사 형태는? <span class="cy">(${a.w})</span>`, "형용사", adjOpts(a, gi), a.formsP[gi], true));
    return { asent:true, a, n, gi, p, parts };
  };
  MADJ.prompt = q => !q.asent ? o.prompt.call(MADJ, q) :
    `<p class="sent" lang="ru">Э́то ${q.p ? cslot(`(${q.p.ko})`) : ""} ${cslot(q.a.w)} ${q.n.w}.</p>`;
  MADJ.feedback = q => { if(!q.asent) return o.feedback.call(MADJ, q);
    const bs = [AXL[q.a.t], q.n.note ? `명사 예외 · ${GNAME4[q.gi]}` : "", q.p && !q.p.formsP ? "형태 고정 · его́ / её / их" : ""].filter(Boolean);
    return `<div class="pair" lang="ru"><span>${ru(q, true)}</span>${speakBtn(ru(q, false),"문장 듣기")}</div>
      ${gramRow([...(q.p ? [[possForm(q.p, q.gi), ["소유형용사", "주격", q.p.formsP ? GNAME4[q.gi] : ""]]] : []), [q.a.forms[q.gi], ["형용사", "주격", GNAME4[q.gi]]]])}
      ${bs.length ? `<div>${bs.map(badge).join(" ")}</div>` : ""}
      <p class="tr">${ko(q)}</p>
      <table class="conj" lang="ru"><tbody>${q.a.forms.map((x,i) => `<tr class="${i===q.gi ? "on" : ""}"><th>${GNAME4[i]}</th><td>${hlFrom(cpref(q.a.formsP), x)}</td></tr>`).join("")}</tbody></table>
      <p class="rule"><b>${q.n.w}</b>는 ${GNAME4[q.gi]}${q.gi===3 ? "" : " 명사"} → 소유형용사와 형용사를 모두 ${GNAME4[q.gi]}형으로 맞춰요. ${ATYPE[q.a.t]}</p>
      ${q.n.note ? `<p class="note">${q.n.note}</p>` : ""}`; };
  MADJ.itemKey = q => q.asent ? `adj:sent:${q.a.wP}` : o.itemKey(q);
  MADJ.wrongLine = q => q.asent ? ({ ru: ru(q, false), ko: ko(q) }) : o.wrongLine(q);
})();

/* ================= 전치격 탭: 어디로 (куда́ · в / на + 대격) ================= */
const DIRCATS = new Set(["in_bld","in_country","in_city","on_open","on_event","on_street","on_island","on_water","on_mount","on_dir","on_work","in_nature"]);
const RIDE = new Set(["in_country","in_city","on_island","on_water","on_mount","on_dir"]);
function accOfPlace(p){
  if(/а$/.test(p.nomP)) return p.nom.replace(/а(́?)$/, "у$1");
  if(/я$/.test(p.nomP)) return p.nom.replace(/я(́?)$/, "ю$1");
  return p.nom;
}
const accText = p => /а$/.test(p.nomP) ? "-а로 끝나는 명사는 대격에서 <b class='cy'>-у</b>가 돼요."
  : /я$/.test(p.nomP) ? "-я로 끝나는 명사는 대격에서 <b class='cy'>-ю</b>가 돼요."
  : "사물을 뜻하는 남성 · 중성 명사와 -ь 여성 명사는 대격이 주격과 같아서 모양이 그대로예요.";
function buildDir(p, where){
  const acc = accOfPlace(p), accP = P0(acc);
  const ride = RIDE.has(p.cat) || (p.cat!=="on_event" && Math.random() < .3);
  const v = VBY[ride ? "ехать" : "идти"];
  let ru0, ko;
  if(where){ const ks = p.frames.filter(k => V3.frames[k]); const fr = pick1(V3.frames[pick1(ks)]); ru0 = fr[0]; ko = `${fr[1]} ${pKoTail(p, fr[2])}.`; }
  else { const si = Math.floor(Math.random()*7); ru0 = `${cap(PERS[si][0])} ${v.forms[PIDX[si]]}`; ko = `${PERS[si][1]} ${p.koLoc}에 ${ride ? "(타고) " : ""}가요.`; }
  const ans = where ? p.formP : accP;
  const opts = [...new Set([ans, where ? accP : p.formP, p.nomP, ...p.wrong])].slice(0,4);
  return { dir:true, where, p, acc, ride, v, ru0, ko, parts:[
    pickPart("pr","в 와 на 중에 무엇을 쓸까요?","전치사",["в","на"], p.prep, true, true),
    pickPart("f","명사 형태는?", where ? "전치격" : "대격", opts, ans, true) ] };
}
const DIRRULE = "<b>어디에서(где́)</b>는 в / на + <b>전치격</b>(в шко́ле), <b>어디로(куда́)</b>는 같은 в / на + <b>대격</b>(в шко́лу)이에요. в를 쓸지 на를 쓸지는 둘 다 똑같아요.";
(() => {
  const o = { levels:MPR.levels, segs:MPR.segs, summary:MPR.summary, build:MPR.build, prompt:MPR.prompt, feedback:MPR.feedback, itemKey:MPR.itemKey, wrongLine:MPR.wrongLine, rules:MPR.rules };
  const isD = s => !!s && (s.game==="dir" || s.game==="mix");
  const G = ["game","게임 종류",[["both","전치사 + 형태"],["prep","전치사만"],["dir","어디로 (в/на + 대격)"],["mix","어디에서 vs 어디로"]]];
  MPR.lead += " ‘어디로(куда́)’는 в / на + 대격으로 연습해요.";
  MPR.levels = s => { const L = o.levels.call(MPR, s); if(!isD(s)) return L;
    const d = s.game==="dir" ? "장소로 가요: Я иду́ в шко́лу. (в / на + 대격)" : "어디에서(전치격)와 어디로(대격)가 섞여 나와요";
    return Object.fromEntries(Object.entries(L).map(([k,v]) => [k, { ...v, desc:d, items: v.items.filter(p => p && p.kind==="loc" && DIRCATS.has(p.cat) && p.nomP!=="снег") }])); };
  MPR.segs = s => isD(s) ? [G] : o.segs.call(MPR, s).map(x => x[0]==="game" ? G : x);
  MPR.summary = s => s && s.game==="dir" ? "어디로 (в/на + 대격)" : s && s.game==="mix" ? "어디에서 vs 어디로" : o.summary(s);
  MPR.build = (p, pool, s) => isD(s) ? buildDir(p, s.game==="dir" ? false : Math.random() < .5) : o.build.call(MPR, p, pool, s);
  MPR.prompt = q => !q.dir ? o.prompt.call(MPR, q) :
    `<p class="sent" lang="ru">${q.ru0} ${cslot("в / на")} ${cslot(q.p.nom)}.</p><p class="hint">${q.p.ko}</p>`;
  MPR.feedback = q => { if(!q.dir) return o.feedback.call(MPR, q);
    const p = q.p, f = q.where ? p.form : q.acc;
    const bs = [p.prep==="на" ? "на를 쓰는 단어" : "", q.where && p.fr==="pu" ? "제2 전치격 -у́" : "", ...(q.where ? [] : [])].filter(Boolean);
    return `<div class="pair" lang="ru"><span>${q.ru0} <mark>${p.prep}</mark> ${hlFrom(p.nomP, f)}.</span>${speakBtn(`${q.ru0} ${p.prep} ${f}.`,"문장 듣기")}</div>
      ${bs.length ? `<div>${bs.map(badge).join(" ")}</div>` : ""}
      <p class="tr">${q.ko}</p>
      <p class="rule">${q.where ? "<b>어디에서(где́)</b> → в / на + <b>전치격</b>. " + PFR[p.fr] : "<b>어디로(куда́)</b> → в / на + <b>대격</b>. " + accText(p)}</p>
      <p class="rule" style="margin-top:8px"><b>전치사</b> · ${PCAT[p.cat]}</p>
      <p class="note">비교: <span class="cy">${p.prep} ${p.form}</span> (어디에서) ↔ <span class="cy">${p.prep} ${q.acc}</span> (어디로)</p>
      ${q.where ? "" : `<p class="note"><span class="cy">${q.v.inf}</span> · ${q.ride ? "차를 타고 가요" : "걸어서 가요"}</p>`}`; };
  MPR.itemKey = q => q.dir ? `dir:${q.where ? "w" : "t"}:${q.p.nomP}` : o.itemKey(q);
  MPR.wrongLine = q => q.dir ? ({ ru:`${q.ru0} ${q.p.prep} ${q.where ? q.p.form : q.acc}.`, ko:q.ko }) : o.wrongLine(q);
  MPR.rules = () => o.rules() + `<details class="rules"><summary>어디로(куда́) · 대격 규칙</summary><ul>
      <li>${DIRRULE}</li>
      <li>대격 모양: -а → <b class='cy'>-у</b> (шко́ла → в шко́лу), -я → <b class='cy'>-ю</b> (Росси́я → в Росси́ю), 나머지(남성 · 중성 · -ь 여성)는 그대로 (парк → в парк, мо́ре → на мо́ре).</li>
      <li>제2 전치격 단어도 어디로는 그냥 대격이에요: в лесу́ (숲에서) ↔ в лес (숲으로).</li>
      <li>걸어서 가면 <span class='cy'>идти́</span> (иду́ …), 차를 타고 가면 <span class='cy'>е́хать</span> (е́ду …).</li>
    </ul></details>`;
})();

/* ================= 엔진 ================= */
/* 복수형 · 형용사는 단어 메뉴 안에 있던 게임을 각자 메뉴로 꺼냈어요. 기록 키는 그대로예요. */
MVOC.h1 = "단어 뜻";
MVOC.lead = "러시아어 단어를 보고 뜻을 맞혀 보세요. ‘문장 속 두 단어’는 문장 안의 동사와 목적어 뜻을 함께 맞히고, ‘숫자’는 기수와 서수를 연습해요.";
{ const segs0 = MVOC.segs;
  MVOC.segs = s => segs0(s).map(x => x[0]==="game" ? [x[0], "연습 방식", x[2].filter(o => o[0]!=="plural" && o[0]!=="adj")] : x); }
function subMod(game, o){
  const fx = s => ({ ...s, game });
  return { ...o,
    unit: s => MVOC.unit(fx(s)), levels: s => MVOC.levels(fx(s)),
    segs: s => MVOC.segs(fx(s)).filter(x => x[0]!=="game").map(x => (x[0]==="pmode" || x[0]==="amode") ? [x[0], "연습 방식", x[2]] : x),
    summary: s => MVOC.summary(fx(s)).replace(/^형용사 · /, ""),
    build: (w, pool, s) => MVOC.build(w, pool, fx(s)),
    prompt: q => q.M.prompt(q), feedback: q => q.M.feedback(q), itemKey: q => q.M.itemKey(q), wrongLine: q => q.M.wrongLine(q) };
}
const MPLT = subMod("plural", { tab:"복수형", h1:"복수형", ru:"мно́жественное число́",
  lead:"단어를 보고 뜻과 복수형을 맞혀 보세요. -ы / -и 기본 규칙부터 출몰모음, -а / -я 복수, 완전히 다른 단어로 바뀌는 예외까지 다뤄요.",
  rules: () => MPL.rules(), best:{ store:"ruPluralBest2", key: s => `${s.level}_${s.pmode==="only" ? "only" : "both"}_${s.ans}` } });
const MADJT = subMod("adj", { tab:"형용사", h1:"형용사", ru:"прилага́тельные",
  lead:"교재 형용사로 뜻, 명사에 맞는 형태(남성 · 여성 · 중성 · 복수), 반의어를 연습해요. ‘문장’에서는 Э́то + 소유 + 형용사 + 명사로 풀어요.",
  rules: () => MADJ.rules(), best:{ store:"ruQuizBest3", key: s => `adj_${s.amode || "both"}_${s.ans}` } });
MPRON.h1 = "대명사"; MVB.h1 = "동사 변화"; MPR.h1 = "전치격"; MEXAM.tab = "종합 시험";
MVB.segs = (f => s => f(s).map(x => x[0]==="game" ? [x[0], "연습 방식", x[2]] : x))(MVB.segs);
MPR.segs = (f => s => f(s).map(x => x[0]==="game" ? [x[0], "연습 방식", x[2]] : x))(MPR.segs);
MPRON.segs = (f => s => f(s).map(x => x[0]==="game" ? [x[0], "연습 방식", x[2]] : x))(MPRON.segs);
const MOD = { vocab:MVOC, plural:MPLT, adj:MADJT, pron:MPRON, verb:MVB, prep:MPR, exam:MEXAM };
let TAB = "vocab";
const ST = {
  vocab: { level:"beginner", game:"meaning", mode:"one", ans:"mc", count:10 },
  plural:{ level:"beginner", pmode:"both", ans:"mc", count:10 },
  adj:   { level:"beginner", amode:"both", ans:"mc", count:10 },
  pron:  { level:"beginner", game:"all", ans:"mc", count:10 },
  verb:  { level:"beginner", game:"both", ans:"mc", count:10 },
  prep:  { level:"beginner", game:"both", view:"word", count:10 },
  exam:  { level:"beginner", count:20 }
};
const app = document.getElementById("app");
let G = null;

/* ================= 기록: Claude 계정(서버) + 기기 캐시 ================= */
const RKEY = "ruQuizRec4";
let REC = { v:1, best:{}, items:{}, upd:0 };
let RSTATE = "local", RREF = null, RDOWN = null, rWriting = false, rPending = false, rTimer = null;
let RDB = null, RUID = null, lTimer = null;   /* 풀이 내역(세션별) 저장용 */
function recLoadLocal(){
  try{ const x = JSON.parse(localStorage.getItem(RKEY)||"null"); if(x && x.best) REC = { v:1, best:x.best||{}, items:x.items||{}, upd:x.upd||0 }; }catch(e){}
  for(const st of ["ruPluralBest2","ruQuizBest3"]){   /* 예전 기기 기록 옮기기 */
    try{ const b = JSON.parse(localStorage.getItem(st)||"{}")||{}; for(const [k,v] of Object.entries(b)){ const kk = st+"|"+k; if(!(REC.best[kk]>=v)) REC.best[kk] = v; } }catch(e){}
  }
}
function recSaveLocal(){ try{ localStorage.setItem(RKEY, JSON.stringify(REC)); }catch(e){} }
function recMerge(a, b){
  const out = { v:1, best:{ ...(a.best||{}) }, items:{ ...(a.items||{}) }, upd:Math.max(a.upd||0, b.upd||0) };
  for(const [k,v] of Object.entries(b.best||{})) if(typeof v==="number" && !(out.best[k]>=v)) out.best[k] = v;
  for(const [k,v] of Object.entries(b.items||{})){ const o = out.items[k]; if(Array.isArray(v) && (!o || (v[2]||0) > (o[2]||0))) out.items[k] = v; }
  return out;
}
function recSchedule(){
  REC.upd = Date.now(); recSaveLocal();
  if(!RREF) return;
  clearTimeout(rTimer); rTimer = setTimeout(recFlush, 1500);
}
async function recFlush(){
  if(!RREF) return;
  if(rWriting){ rPending = true; return; }
  rWriting = true;
  try{ await RREF.set(JSON.parse(JSON.stringify(REC))); if(RSTATE!=="server"){ RSTATE = "server"; refreshSetup(); } }
  catch(err){
    if(err && err.code==="unavailable"){ setTimeout(recFlush, 2000 + Math.random()*2000); }
    else { RSTATE = "error"; refreshSetup(); }
  }
  rWriting = false;
  if(rPending){ rPending = false; recFlush(); }
}
const refreshSetup = () => { if(!G && app.innerHTML) renderSetup(); };
async function recConnect(){
  if(!(window.claude && typeof window.claude.use==="function")) return;
  try{
    const [db, user, dl] = await Promise.all([window.claude.use("db"), window.claude.use("user"), window.claude.use("downloads")]);
    RDOWN = dl;
    if(!db || !user) return;
    const id = await user.id(); if(!id) return;
    RSTATE = "loading"; refreshSetup();
    RDB = db; RUID = id;
    const ref = db.doc("data/users/" + id + "/progress");
    const snap = await ref.get();
    if(snap.exists){ REC = recMerge(snap.data(), REC); }
    RREF = ref; recSaveLocal();
    RSTATE = "server"; refreshSetup();
    await recFlush();
  }catch(err){ RSTATE = "error"; refreshSetup(); }
}
/* 통합판: 초급 · 중급 · 고급이 있는 게임에는 ‘통합’ 난이도를 자동으로 붙여요 */
function LVS(M, s){
  const lv = M.levels(s);
  if(lv.mixed || !(lv.beginner && lv.intermediate && lv.advanced)) return lv;
  let items;
  if(lv.advanced.items.length && lv.advanced.items.every(x => x.v && x.ok) && M===MVOC) items = lv.advanced.items;   /* 문장 속 두 단어는 이미 누적 */
  else {
    const all = [...lv.beginner.items, ...lv.intermediate.items, ...lv.advanced.items], cnt = new Map();
    items = all.filter(x => { if(x && x.kind==="pron"){ const c = (cnt.get(x.nomP) || 0) + 1; cnt.set(x.nomP, c); return c<=3; } return true; });   /* 대명사 전치격 반복은 최대 3번 */
  }
  return { ...lv, mixed:{ label:"통합", desc:"초급 · 중급 · 고급이 모두 섞여 나와요", items } };
}
function getBest(M){
  const out = {}, pre = M.best.store + "|";
  for(const [k,v] of Object.entries(REC.best)) if(k.startsWith(pre)) out[k.slice(pre.length)] = v;
  return out;
}
function setBest(M, key, val){
  const k = M.best.store + "|" + key;
  if(!(REC.best[k]>=val)){ REC.best[k] = val; recSchedule(); }
}
const stripTags = h => String(h).replace(/<br>/g," / ").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
function logItem(q, ok, k){
  try{
    const M = qM(q), wl = M.wrongLine(q);
    const miss = q.parts.filter(p => !p.val).map(p => [p.short, p.type==="text" ? (p.gaveUp ? "(모르겠어요)" : p.typed) : p.opts[p.pick], p.ans]);
    G.log.push({ k, ok: ok ? 1 : 0, t: Date.now(), a: stripTags(wl.ru).slice(0,160), ko: stripTags(wl.ko).slice(0,80), ...(miss.length ? { x: miss } : {}) });
    clearTimeout(lTimer); lTimer = setTimeout(logFlush, 2000);
  }catch(err){}
}
async function logFlush(){
  if(!RDB || !RUID || !G || !G.log || !G.log.length) return;
  const M = MOD[G.tab], s = G.s || ST[G.tab];
  try{
    await RDB.doc(`data/users/${RUID}/sessions/${G.sid}`).set({
      tab: M.tab, mode: M.summary(s), level: (LVS(M,s)[s.level] || {}).label || "", retry: G.retry ? 1 : 0,
      start: Number(G.sid), end: Date.now(), n: G.log.length,
      score: G.items.reduce((a,q) => a + qScore(q), 0), max: G.items.reduce((a,q) => a + qMax(q), 0),
      items: G.log.slice(-250) });
  }catch(err){}
}
function recItem(q, ok){
  const k = qM(q).itemKey(q); if(!k) return;
  logItem(q, ok, k);
  const o = REC.items[k] || [0,0,0];
  REC.items[k] = [o[0] + (ok ? 0 : 1), o[1] + (ok ? 1 : 0), Date.now()];
  recSchedule();
}
async function recBackup(){
  const d = new Date(), stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const name = `russian-quiz-backup-${stamp}.json`, data = JSON.stringify(REC);
  if(RDOWN){ try{ await RDOWN.save({ filename:name, data }); }catch(err){} return; }
  try{ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type:"application/json" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast("백업 파일을 저장했어요."); }catch(err){ toast("이 브라우저에서는 파일을 저장할 수 없어요."); }
}
function recRestore(file){
  const r = new FileReader();
  r.onload = () => {
    try{
      const x = JSON.parse(r.result);
      if(!x || typeof x!=="object" || typeof x.best!=="object" || typeof x.items!=="object") throw 0;
      REC = recMerge(REC, x); recSchedule(); if(RREF) recFlush();
      toast("백업을 불러와서 지금 기록과 합쳤어요.");
      refreshSetup();
    }catch(e){ toast("이 파일은 퀴즈 백업 파일이 아니에요. russian-quiz-backup으로 시작하는 파일을 골라 주세요."); }
  };
  r.readAsText(file);
}
/* ================= 화면: 홈 · 설정 · 퀴즈 · 결과 · 오답 노트 · 정보 ================= */
const svgI = (d, cls) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const IC = {
  back:   svgI('<path d="M15 5l-7 7 7 7"/>'),
  close:  svgI('<path d="M6 6l12 12M18 6L6 18"/>'),
  chev:   svgI('<path d="M9 6l6 6-6 6"/>', "sm"),
  home:   svgI('<path d="M4 10.5L12 4l8 6.5V20H4z"/><path d="M10 20v-6h4v6"/>'),
  note:   svgI('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h5"/>'),
  info:   svgI('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  cloud:  svgI('<path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 11 3.5 3.5 0 0 0 7 18z"/>', "sm"),
  device: svgI('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>', "sm"),
  check:  svgI('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  x:      svgI('<path d="M7 7l10 10M17 7L7 17"/>'),
  flame:  svgI('<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.8.3 1.6 1 2.6 2.3 3.1C11 9 11 6 12 3z"/>', "sm"),
  speaker:svgI('<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  play:   svgI('<path d="M8 5.5v13l10.5-6.5z"/>', "sm"),
  down:   svgI('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>', "sm"),
  up:     svgI('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19h14"/>', "sm")
};

const CATS = {
  vocab: { grp:"어휘", tile:"сло́во",     desc:"뜻 맞히기 · 문장 속 두 단어 · 숫자" },
  plural:{ grp:"문법", tile:"-ы<br>-и",   desc:"뜻과 복수형 · 출몰모음 · 예외 복수형" },
  adj:   { grp:"문법", tile:"-ый<br>-ая", desc:"명사에 맞는 형태 · 반의어 · Э́то 문장" },
  pron:  { grp:"문법", tile:"мой",        desc:"인칭대명사 격 · 소유 · 지시 · 의문 · 관계" },
  verb:  { grp:"문법", tile:"-ю<br>-ешь", desc:"현재형 변화 · 뜻 · 문장 속 대격" },
  prep:  { grp:"문법", tile:"в / на",     desc:"어디에서 · ~에 대해 · 어디로" },
  exam:  { grp:"실전", tile:"всё",        desc:"모든 분야를 섞은 시험 · 분야별 점수" }
};
const GRPS = ["어휘","문법","실전"];
const MODEK = ["game","mode","amode","pmode"];   /* 연습 방식은 목록으로, 나머지는 토글로 */
let VIEW = "home", LAST = null, QUIT = false;

/* 설정 · 마지막으로 한 메뉴는 이 기기에 기억해요 */
const PKEY = "ruQuizUI1";
function prefsLoad(){
  try{
    const p = JSON.parse(localStorage.getItem(PKEY) || "null"); if(!p) return;
    for(const [k,v] of Object.entries(p.st || {})) if(ST[k] && v && typeof v==="object")
      for(const [kk,vv] of Object.entries(v)) if(kk in ST[k]) ST[k][kk] = vv;
    if(MOD[p.tab]) TAB = p.tab;
    if(MOD[p.last]) LAST = p.last;
    if(p.voice==="tts" || p.voice==="native") VOICE = p.voice;
    if(p.ttsg==="f" || p.ttsg==="m") TTS_G = p.ttsg;
  }catch(e){}
}
function prefsSave(){ try{ localStorage.setItem(PKEY, JSON.stringify({ st:ST, tab:TAB, last:LAST, voice:VOICE, ttsg:TTS_G })); }catch(e){} }

const LMEMO = new Map();
function levelsMeta(k, s = ST[k]){
  const id = k + JSON.stringify({ ...s, count:0, level:0 });
  if(!LMEMO.has(id)){
    const L = LVS(MOD[k], s);
    LMEMO.set(id, Object.fromEntries(Object.entries(L).map(([lk,d]) => [lk, { label:d.label, desc:d.desc, n:d.items.length }])));
  }
  return LMEMO.get(id);
}
function normalize(k){
  const M = MOD[k], s = ST[k];
  for(let i=0; i<3; i++) for(const [key,,opts] of M.segs(s)) if(!opts.some(o => String(o[0])===String(s[key]))) s[key] = opts[0][0];
  const L = levelsMeta(k); if(!L[s.level]) s.level = Object.keys(L)[0];
  if(![10,20,50,"all"].includes(s.count)) s.count = 10;
}
const unitOf = (M, s) => typeof M.unit==="function" ? M.unit(s) : M.unit;
function bestVal(k, lv, s = ST[k]){
  const M = MOD[k], v = REC.best[M.best.store + "|" + M.best.key({ ...s, level:lv })];
  return typeof v==="number" ? v : null;
}
function statsAll(){
  let ok = 0, bad = 0;
  for(const v of Object.values(REC.items)) if(Array.isArray(v)){ bad += v[0]||0; ok += v[1]||0; }
  return { n:Object.keys(REC.items).length, acc: ok+bad ? Math.round(ok/(ok+bad)*100) : null };
}

/* ---------- 오답 노트: 틀린 횟수가 맞힌 횟수 이상인 문제 ---------- */
const REVIEW = {
  vocab: [["단어 뜻", { game:"meaning", mode:"one" }], ["문장 속 두 단어", { game:"meaning", mode:"two" }], ["숫자", { game:"num" }]],
  plural:[["복수형", { pmode:"both" }]],
  adj:   [["형용사", { amode:"both" }], ["형용사 반의어", { amode:"anto" }], ["형용사 문장", { amode:"sent" }]],
  pron:  [["대명사", { game:"all" }]],
  verb:  [["동사 변화", { game:"both" }], ["동사 문장 · 대격", { game:"sent" }]],
  prep:  [["전치격", { game:"both", view:"word" }], ["어디에서 · 어디로", { game:"mix" }]]
};
const isWeak = v => Array.isArray(v) && v[0] > 0 && v[0] >= v[1];
let WMEMO = null;
function weakGroups(){
  if(WMEMO && WMEMO.upd===REC.upd && WMEMO.n===Object.keys(REC.items).length) return WMEMO.g;
  const weak = new Set(Object.entries(REC.items).filter(([,v]) => isWeak(v)).map(([k]) => k));
  const g = [], seen = new Set();
  if(weak.size) for(const [tab, confs] of Object.entries(REVIEW)) for(const [label, ov] of confs){
    const M = MOD[tab], s = { ...ST[tab], ...ov, ans:"mc" };
    let L; try{ L = LVS(M, s); }catch(e){ continue; }
    const pool = (L.mixed || Object.values(L)[0]).items, small = pool.slice(0, 40), found = [];
    for(const it of pool) for(let t=0; t<2; t++){
      let q, key;
      try{ q = M.build(it, small, s); key = (q.M || M).itemKey(q); }catch(e){ break; }
      if(weak.has(key) && !seen.has(key)){ seen.add(key); found.push({ key, it, q, v:REC.items[key] }); }
    }
    if(found.length){
      found.sort((a,b) => (b.v[0]-b.v[1]) - (a.v[0]-a.v[1]) || (b.v[2]||0) - (a.v[2]||0));
      g.push({ tab, label, ov, items:found });
    }
  }
  WMEMO = { upd:REC.upd, n:Object.keys(REC.items).length, g };
  return g;
}
const weakCount = () => weakGroups().reduce((a,g) => a + g.items.length, 0);
function startReview(gi){
  const g = weakGroups()[gi]; if(!g) return;
  TAB = g.tab;
  startGame(g.items.map(x => x.it), true, { ...ST[g.tab], ...g.ov }, "오답 복습 · " + g.label);
}

/* ---------- 공통 조각 ---------- */
const bar = (inner, cls) => `<header class="appbar${cls ? " " + cls : ""}"><div class="wrap">${inner}</div></header>`;
function tabbar(){
  const wc = weakCount();
  return `<nav class="tabbar" aria-label="메뉴"><div class="wrap">${[["home","학습",IC.home],["records","오답 노트",IC.note],["info","정보",IC.info]].map(([v,l,ic]) =>
    `<button data-act="view" data-v="${v}"${VIEW===v ? ' aria-current="page"' : ""}>${ic}<span>${l}</span>${v==="records" && wc ? `<span class="dot">${wc>99 ? "99+" : wc}</span>` : ""}</button>`).join("")}</div></nav>`;
}
function syncChip(){
  const [t, ic, cls] = { local:["이 기기에 저장", IC.device, ""], loading:["계정 연결 중", IC.cloud, ""], server:["계정에 저장됨", IC.cloud, "on"], error:["기기에만 저장", IC.device, "err"] }[RSTATE];
  return `<button class="chip ${cls}" data-act="view" data-v="records">${ic}${t}</button>`;
}
const SYNCMSG = () => ({ local:"이 기기에만 저장돼요.", loading:"Claude 계정과 연결하는 중이에요.",
  server:"Claude 계정에 저장되고 있어요. 휴대폰과 PC에서 같은 기록을 써요.", error:"Claude 계정에 저장하지 못했어요. 이 기기에는 저장되고 있어요." })[RSTATE];

/* ---------- 홈 ---------- */
function catCard(k){
  const M = MOD[k], s = ST[k], c = CATS[k]; normalize(k);
  const L = levelsMeta(k);
  const meter = Object.keys(L).map(lv => { const b = bestVal(k, lv, s);
    return `<i class="${b===100 ? "full" : ""}" style="--p:${b||0}%" title="${L[lv].label} · ${b==null ? "기록 없음" : "최고 " + b + "%"}"></i>`; }).join("");
  return `<button class="cat" data-act="open" data-v="${k}">
    <span class="tile" lang="ru">${c.tile}</span>
    <span class="tx"><b>${M.tab}<small lang="ru">${M.ru}</small></b><span>${c.desc}</span>
      <span class="meter" role="img" aria-label="난이도별 최고 점수">${meter}</span></span>
    <span class="chev">${IC.chev}</span></button>`;
}
function homeView(){
  const st = statsAll(), wc = weakCount();
  const k = LAST || "vocab", M = MOD[k], s = ST[k]; normalize(k);
  const L = levelsMeta(k), lv = L[s.level], b = bestVal(k, s.level, s);
  const n = s.count==="all" ? lv.n : Math.min(s.count, lv.n);
  return bar(`<div class="brand"><span class="ru" lang="ru">Ру́сский язы́к</span><b>러시아어 문법 퀴즈</b></div>${syncChip()}`) + `
  <main class="screen wrap">
    ${updBanner()}
    <section class="resume">
      <div><div class="eyebrow">${LAST ? "이어서 하기" : "처음이라면 여기부터"}</div>
        <h2>${M.tab} · ${M.summary(s)}</h2>
        <p>${Object.keys(L).length>1 ? lv.label + " · " : ""}${n}문제${b!=null ? ` · 최고 ${b}%` : ""}</p></div>
      <div class="row"><button class="btn go" data-act="quick" data-v="${k}">${IC.play}바로 시작</button><button class="btn alt" data-act="open" data-v="${k}">설정 바꾸기</button></div>
    </section>
    <section class="stats" aria-label="내 기록">
      <div><b>${st.n}</b><span>푼 문제</span></div>
      <div><b>${st.acc==null ? "–" : st.acc + "%"}</b><span>정답률</span></div>
      <button data-act="view" data-v="records"><b class="${wc ? "hot" : ""}">${wc}</b><span>복습할 문제</span></button>
    </section>
    ${GRPS.map(g => { const ks = Object.keys(CATS).filter(k => CATS[k].grp===g);
      return `<section class="grp"><h2>${g}</h2><div class="cats${ks.length>1 ? " two" : ""}">${ks.map(catCard).join("")}</div></section>`; }).join("")}
  </main>` + tabbar();
}

/* ---------- 메뉴별 설정 ---------- */
function catView(){
  const k = TAB, M = MOD[k], s = ST[k]; normalize(k);
  const L = levelsMeta(k), lk = Object.keys(L), unit = unitOf(M, s);
  const on = (key, v) => String(s[key])===String(v);
  const field = ([key, title, opts]) => MODEK.includes(key)
    ? `<section class="field"><h2>${title}</h2><div class="choices${opts.length===2 ? " two" : ""}">${opts.map(([v,l]) =>
        `<button class="choice" data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${on(key,v)}"><span class="rd"></span><span class="tx"><b>${l}</b></span></button>`).join("")}</div></section>`
    : `<section class="field"><h2>${title}</h2><div class="seg" role="group">${opts.map(([v,l]) =>
        `<button data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${on(key,v)}">${l}</button>`).join("")}</div>
        ${key==="ans" && s.ans==="text" ? `<p class="help">띄어쓰기와 ‘-들, -이에요’ 같은 끝말은 무시하고 채점해요. 뜻이 여러 개면 하나만 맞혀도 정답이에요. 그래도 오답으로 나오면 ‘내 답도 맞아요’를 눌러 정답 처리할 수 있어요.</p>` : ""}</section>`;
  const levels = lk.length>1
    ? `<section class="field"><h2>난이도</h2><div class="choices">${lk.map(lv => { const d = L[lv], b = bestVal(k, lv, s);
        return `<button class="choice" data-act="set" data-k="level" data-v="${lv}" aria-pressed="${s.level===lv}"><span class="rd"></span>
          <span class="tx"><b>${d.label}</b><small>${d.desc} · ${d.n}${unit}</small></span>
          <span class="best${b!=null ? " hit" : ""}">${b!=null ? `최고 ${b}%` : ""}</span></button>`; }).join("")}</div></section>`
    : `<section class="field"><h2>범위</h2><p class="help">${L[lk[0]].desc} · ${L[lk[0]].n}${unit}</p></section>`;
  const n = s.count==="all" ? L[s.level].n : Math.min(s.count, L[s.level].n);
  return bar(`<button class="iconbtn" data-act="back" aria-label="뒤로">${IC.back}</button><span class="ttl">${M.tab}</span>`) + `
  <main class="screen wrap">
    <section class="hero"><span class="ru" lang="ru">${M.ru}</span><h1>${M.h1}</h1><p>${M.lead}</p></section>
    ${M.segs(s).map(field).join("")}
    ${levels}
    ${field(["count","문제 수",[[10,"10"],[20,"20"],[50,"50"],["all","전체"]]])}
    <section class="field"><h2>알아 두기</h2><div class="rulestack">${M.rules()}</div></section>
  </main>
  <div class="dock"><div class="wrap"><button class="btn primary" data-act="start">${IC.play}시작하기 <span class="count">· ${n}문제</span></button></div></div>`;
}

/* ---------- 오답 노트 ---------- */
function recordsView(){
  const gs = weakGroups(), st = statsAll();
  const groups = gs.length ? gs.map((g, gi) => { const M = MOD[g.tab], shown = g.items.slice(0, 3);
      return `<section class="rgrp"><header><h2>${g.label}<small>${g.items.length}</small></h2>
        <button class="btn primary sm" data-act="review" data-v="${gi}">${IC.play}복습하기</button></header>
        <ul class="list">${shown.map(x => { let l; try{ l = (x.q.M || M).wrongLine(x.q); }catch(e){ l = { ru:esc(x.key), ko:"" }; }
          return `<li><span class="cy" lang="ru">${l.ru}</span><span class="ko">${l.ko}<span class="parts"><i>${x.v[0]}번 틀림 · ${x.v[1]}번 맞힘</i></span></span></li>`; }).join("")}
          ${g.items.length>shown.length ? `<li class="more">외 ${g.items.length - shown.length}문제는 복습하기에서 함께 나와요</li>` : ""}</ul></section>`; }).join("")
    : `<div class="empty">${IC.check}<h2>복습할 문제가 없어요</h2><p>퀴즈에서 틀린 문제가 여기에 모여요. 맞힌 횟수가 틀린 횟수보다 많아지면 목록에서 빠져요.</p></div>`;
  return bar(`<span class="ttl">오답 노트</span>${syncChip()}`) + `
  <main class="screen wrap">
    <section class="hero"><p>틀린 횟수가 맞힌 횟수와 같거나 더 많은 문제를 분야별로 모았어요. 복습하기를 누르면 그 문제만 다시 풀어요.</p></section>
    ${groups}
    <section class="panelcard"><h2>${RSTATE==="server" ? IC.cloud : IC.device}기록 저장</h2>
      <p>${SYNCMSG()} 지금까지 푼 문제 ${st.n}개의 정답 · 오답 횟수와 최고 점수가 저장돼 있어요. 퀴즈가 업데이트돼도 기록은 그대로예요.</p>
      <div class="row">${RDOWN || window.RQ ? `<button class="btn secondary sm" data-act="backup">${IC.down}백업 파일 받기</button>` : ""}
        <label class="btn secondary sm filebtn">${IC.up}백업 불러오기<input type="file" accept=".json,application/json" id="recfile" hidden></label></div>
    </section>
  </main>` + tabbar();
}

/* ---------- 정보 ---------- */
function infoView(){
  return bar(`<span class="ttl">정보</span>`) + `
  <main class="screen wrap">
    <section class="hero"><p>발음 설정, 앱 버전, 채점 방식, 키보드 단축키를 정리했어요.</p></section>
    <section class="panelcard"><h2>${IC.speaker}발음 듣기</h2>
      <div class="field"><h3 class="fh">먼저 들려줄 발음</h3><div class="seg" role="group">
        <button data-act="voice" data-v="native" aria-pressed="${VOICE==="native"}">원어민 녹음</button>
        <button data-act="voice" data-v="tts" aria-pressed="${VOICE==="tts"}">음성 합성</button></div></div>
      <div class="field"><h3 class="fh">음성 합성 목소리</h3><div class="seg" role="group">
        <button data-act="ttsg" data-v="f" aria-pressed="${TTS_G==="f"}">여성</button>
        <button data-act="ttsg" data-v="m" aria-pressed="${TTS_G==="m"}">남성</button>
        <button class="play" data-act="ttsprev" data-v="газе́та" aria-label="고른 합성 목소리로 газе́та 들어 보기" title="들어 보기">${IC.speaker}</button></div></div>
      <ul class="legend">
        <li><span class="speak native sm">${IC.speaker}</span><span><b>원어민 녹음</b> · 위키미디어 공용(Lingua Libre · 위키낱말사전) ${Object.keys(LL_AUDIO).length}개</span></li>
        <li><span class="speak synth sm">${IC.speaker}</span><span><b>음성 합성</b> · Silero 러시아어 신경망 음성(여성 · 남성), 앱의 강세 표기와 발음 예외대로 읽어요 · ${Object.keys(TTS_AUDIO).length}개</span></li>
        <li><span class="speak sm">${IC.speaker}</span><span><b>기기 음성</b> · 문장처럼 미리 만들어 둘 수 없는 것만 ${sp() ? `기기 음성 ‘${esc(ruVoice.name)}’로 읽어요` : "읽어요 (이 기기에는 러시아어 음성이 없어서 버튼이 안 보여요)"}</span></li>
      </ul>
      <p>고른 쪽에 소리가 없는 단어는 다른 쪽 소리로 들려줘요. 정확한 발음은 답을 확인한 뒤 나오는 네이버 사전 · 위키낱말사전 · Forvo 링크로도 들을 수 있어요.</p></section>
    ${appPanel()}
    <section class="panelcard"><h2>채점과 단축키</h2>
      <p>주관식은 띄어쓰기와 ‘-들, -이에요’ 같은 끝말을 무시하고 채점해요. 뜻이 여러 개면 하나만 맞혀도 정답이에요. 오답으로 나와도 맞다고 생각하면 ‘내 답도 맞아요’를 누르세요.</p>
      <p>키보드: <span class="kbd">1</span>–<span class="kbd">4</span> 보기 고르기 · <span class="kbd">Enter</span> 확인 · 다음 문제 · <span class="kbd">Esc</span> 그만하기</p></section>
    <details class="panel"><summary>원어민 녹음 출처 · ${LL_CREDITS.length}개</summary><div class="body">
      <p>녹음은 Wikimedia Commons에 올라온 Lingua Libre · 위키낱말사전 원어민 녹음을 짧게 다듬어(앞뒤 무음 제거 · 압축) 넣었어요. 각 파일의 라이선스를 따르고, 이름을 누르면 원본 파일 페이지가 열려요.</p>
      <ul class="credits">${LL_CREDITS.map(([w,spk,lic,u]) => `<li lang="ru"><a href="${u}" target="_blank" rel="noopener">${esc(w)}</a> — ${esc(spk)}, ${esc(lic)}</li>`).join("")}</ul>
    </div></details>
    <details class="panel"><summary>음성 합성 출처</summary><div class="body">
      <p>합성 음성은 <a href="https://github.com/snakers4/silero-models" target="_blank" rel="noopener">Silero Models</a>의 러시아어 v5.6 모델(여성 baya · 남성 eugene)로 만들었어요. 라이선스: CC BY-NC 4.0 (비영리 개인 학습용).</p>
      <p>모든 녹음은 음소 인식(wav2vec2)으로 실제 들리는 소리를 받아 적어 표준 발음과 비교했어요. 틀린 합성 음성은 다시 만들고, 첫소리부터 틀린 원어민 녹음은 뺐어요.</p>
    </div></details>
  </main>` + tabbar();
}

/* ---------- 오프라인 파일 전용: 자동 업데이트 (window.RQ는 파일의 부트스트랩이 만들어요) ----------
   인터넷에 연결되면 version.json을 보고, 바뀐 부분(앱 코드 · 소리 팩)만 받아 브라우저에 저장해요.
   소리 팩은 받자마자 적용되고, 앱 코드는 다음에 열 때(또는 ‘지금 적용’을 누르면) 적용돼요. */
const UPD_SRC = (() => { try{ return localStorage.getItem("rq-src"); }catch(e){ return null; } })()
  || "https://raw.githubusercontent.com/HSleem1110/hs/claude/video-completion-automation-wq7tsc/ruquiz/";
const PACKS = { native: LL_AUDIO, tts: TTS_AUDIO, ttsm: TTS_AUDIO_M }, PACK_INFO = {};
const UPD = { state:"idle", msg:"", next:null };
const verCmp = (a, b) => { a = String(a).split(".").map(Number); b = String(b).split(".").map(Number);
  for(let i=0; i<Math.max(a.length, b.length); i++){ const d = (a[i]||0) - (b[i]||0); if(d) return d; } return 0; };
const idb = () => new Promise((res, rej) => { const q = indexedDB.open("ruquiz-app", 1);
  q.onupgradeneeded = () => q.result.createObjectStore("kv"); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
const idbGet = k => idb().then(d => new Promise((res, rej) => { const q = d.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }));
const idbPut = (k, v) => idb().then(d => new Promise((res, rej) => { const tx = d.transaction("kv", "readwrite"); tx.objectStore("kv").put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }));
async function loadPacks(){
  for(const name of Object.keys(PACKS)){
    const el = document.getElementById("pack-" + name);
    let rec = null;
    if(window.RQ){ try{ rec = await idbGet("pack:" + name); }catch(e){} }
    const useRec = rec && (!el || verCmp(rec.ver, el.dataset.ver || "0") >= 0);
    const ext = !useRec && !el && window.RQ_PACKS ? RQ_PACKS[name] : null;   /* 아티팩트: 팩을 따로 올린 파일(pack-*.js)에서 */
    if(ext){ Object.assign(PACKS[name], ext); PACK_INFO[name] = { hash:"ext" }; continue; }
    const txt = useRec ? rec.data : el ? el.textContent : null;
    if(!txt) continue;
    try{ Object.assign(PACKS[name], JSON.parse(txt)); PACK_INFO[name] = { hash: useRec ? rec.hash : el.dataset.hash }; }catch(e){}
  }
}
async function fetchText(name){
  const r = await fetch(UPD_SRC + name + "?t=" + Date.now(), { cache:"no-store" });
  if(!r.ok) throw new Error(r.status); return r.text();
}
const updSet = (state, msg) => { UPD.state = state; UPD.msg = msg; window.dispatchEvent(new Event("rq-change")); };
async function updCheck(manual){
  if(!window.RQ || UPD.state==="checking" || UPD.state==="downloading") return;
  if(UPD.state==="ready" && !manual) return;
  updSet("checking", manual ? "확인하는 중…" : UPD.msg);
  try{
    const v = JSON.parse(await fetchText("version.json"));
    const newer = verCmp(v.ver, RQ.ver) > 0;
    const packs = Object.entries(v.packs || {}).filter(([n, p]) => PACKS[n] && (!PACK_INFO[n] || PACK_INFO[n].hash !== p.hash));
    if(!newer && !packs.length){ updSet(UPD.next ? "ready" : "latest", UPD.next ? UPD.msg : `최신 버전이에요 · ${new Date().toLocaleString("ko-KR")} 확인`); return; }
    updSet("downloading", `새 버전 ${v.ver}을 받는 중…`);
    for(const [n, p] of packs){
      const data = await fetchText(p.file), obj = JSON.parse(data);
      await idbPut("pack:" + n, { ver:v.ver, hash:p.hash, data });
      Object.keys(PACKS[n]).forEach(k => delete PACKS[n][k]); Object.assign(PACKS[n], obj); PACK_INFO[n] = { hash:p.hash };
    }
    if(newer){
      const [css, js] = await Promise.all([fetchText(v.css), fetchText(v.js)]);
      await idbPut("app", { ver:v.ver, css, js, at:Date.now() });
      UPD.next = v;
      updSet("ready", `새 버전 ${v.ver}을 받았어요. 다음에 열 때 자동으로 적용돼요.`);
    } else updSet("latest", `소리를 새로 받았어요 · 버전 ${RQ.ver}`);
  }catch(e){
    updSet(navigator.onLine ? "error" : "offline", navigator.onLine ? "업데이트 서버에 연결하지 못했어요. 나중에 자동으로 다시 확인해요." : "인터넷에 연결되어 있지 않아요. 지금 버전으로 계속 풀 수 있어요.");
  }
}
async function updSaveFile(){
  try{
    updSet("downloading", "최신 파일을 받는 중…");
    const v = JSON.parse(await fetchText("version.json")), h = await fetchText(v.html);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([h], { type:"text/html" })); a.download = "russian-quiz.html";
    document.body.appendChild(a); a.click(); a.remove();
    updSet(UPD.next ? "ready" : "latest", `최신 파일(${v.ver})을 저장했어요.`);
  }catch(e){ updSet("error", "파일을 받지 못했어요. 인터넷 연결을 확인해 주세요."); }
}
function startUpdater(){
  if(!window.RQ) return;
  RQ.check = updCheck; RQ.apply = () => location.reload(); RQ.saveFile = updSaveFile; RQ.available = null;   /* 예전 부트스트랩의 버튼도 새 방식으로 */
  const missing = Object.keys(PACKS).some(n => !PACK_INFO[n]);
  if(navigator.onLine) setTimeout(() => updCheck(false), missing ? 300 : 1500);
  window.addEventListener("online", () => updCheck(false));
  setInterval(() => { if(navigator.onLine) updCheck(false); }, 6 * 3600 * 1000);
}
function updBanner(){
  if(!window.RQ) return "";
  if(UPD.state==="downloading") return `<section class="updbar busy"><div class="tx"><b>업데이트 받는 중</b><span>${esc(UPD.msg)}</span></div></section>`;
  if(UPD.state!=="ready" || !UPD.next) return "";
  return `<section class="updbar"><div class="tx"><b>새 버전 ${esc(UPD.next.ver)} 준비됨</b><span>${esc((UPD.next.notes || []).join(" · "))}</span></div>
    <button class="btn primary sm" data-act="rqapply">지금 적용</button></section>`;
}
function appPanel(){
  if(!window.RQ) return "";
  const busy = UPD.state==="checking" || UPD.state==="downloading";
  return `<section class="panelcard"><h2>앱 버전 <small class="vtag">${esc(RQ.ver)}</small></h2>
    <p>이 파일은 인터넷 없이도 문제를 풀 수 있어요. 인터넷에 연결되면 새 버전을 스스로 받아 두고, 다음에 열 때 적용해요. 파일을 다시 받을 필요가 없어요. 새 버전은 Claude에게 수정을 부탁하면 저장소(GitHub)에 올라가요.</p>
    <p class="status">${esc(UPD.msg || "")}</p>
    <div class="row"><button class="btn secondary sm" data-act="rqcheck"${busy ? " disabled" : ""}>지금 확인</button>
      ${UPD.state==="ready" ? `<button class="btn primary sm" data-act="rqapply">지금 적용</button>` : `<button class="btn secondary sm" data-act="rqsave"${busy ? " disabled" : ""}>${IC.down}파일로 저장</button>`}</div>
    <p class="help">기록은 이 브라우저에 저장돼요. 다른 기기나 Claude 앱과 옮기려면 ‘오답 노트 → 백업 파일 받기 / 불러오기’를 쓰세요.</p>
  </section>`;
}

function render(){
  if(G && !G.done) return renderQ();
  document.body.classList.toggle("has-tabbar", VIEW!=="cat");
  app.innerHTML = VIEW==="cat" ? catView() : VIEW==="records" ? recordsView() : VIEW==="info" ? infoView() : homeView();
}
function renderSetup(){ G = null; QUIT = false; render(); }

/* ---------- 퀴즈 ---------- */
function startGame(list, isRetry, sIn, label){
  const M = MOD[TAB], s = sIn || ST[TAB], lvs = LVS(M, s), pool = (lvs[s.level] || Object.values(lvs)[0]).items;
  let items = shuffle(list || pool);
  if(!list && s.count!=="all") items = items.slice(0, s.count);
  if(!items.length){ toast("이 설정에는 문제가 없어요."); return; }
  G = { tab:TAB, s, list: list || null, label: label || "", retry:!!isRetry, idx:0, streak:0, done:false, sid:String(Date.now()), log:[],
        items: items.map(it => { const q = M.build(it, pool, s); q.item = it; return q; }) };
  QUIT = false;
  if(!isRetry){ LAST = TAB; prefsSave(); }
  document.body.classList.remove("has-tabbar");
  renderQ(); window.scrollTo(0,0);
}

const qScore = q => q.parts.filter(p => p.val).length;
const qMax = q => q.parts.length;
const isDone = q => q.parts.every(p => p.val!==null);
const totalScore = () => G.items.reduce((a,q) => a + qScore(q), 0);
const textPart = q => q.parts.find(p => p.type==="text");
const answered = () => G.items.filter(isDone).length;

function partHTML(q, pi){
  const p = q.parts[pi];
  if(p.type==="text"){
    if(p.val===null) return `<div class="typed">
        <input id="tin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="한국어 뜻 입력" value="${esc(p.typed)}" aria-label="뜻 입력">
        <button class="go" data-act="submit">확인</button>
      </div>
      <button class="linkbtn" data-act="giveup">모르겠어요</button>`;
    return `<div class="myans ${p.val ? "ok" : "no"}">
        <span>${p.gaveUp ? "모르겠어요" : `내 답: <b>${esc(p.typed)}</b>`}</span>
        <span class="mark">${p.val ? (p.overridden ? "정답 처리함" : "정답") : "오답"}</span>
      </div>
      ${!p.val || p.overridden ? `<p class="answer">정답: <b>${p.ans}</b></p>` : ""}
      ${!p.val && !p.gaveUp ? `<button class="linkbtn" data-act="override">내 답도 맞아요</button>` : ""}`;
  }
  return `<div class="opts${p.type==="two" ? " two" : ""}">${p.opts.map((o,i) => {
    let cls = "";
    if(p.val!==null) cls = o===p.ans ? "right" : (i===p.pick ? "wrong" : "dim");
    return `<button class="opt ${p.cyr ? "cyr" : ""} ${cls}" data-act="pick" data-p="${pi}" data-v="${i}" ${p.cyr ? 'lang="ru"' : ""} ${p.val!==null ? "disabled" : ""}><span class="k">${i+1}</span>${o}</button>`;
  }).join("")}</div>`;
}

function feedbackHTML(q){
  const sc = qScore(q), mx = qMax(q), perfect = sc===mx;
  return `<div class="fb">
    <p class="verdict ${perfect ? "ok" : "no"}">${perfect ? IC.check : IC.x}${perfect ? (mx>1 ? "모두 맞혔어요" : "정답이에요") : (sc ? `${mx}개 중 ${sc}개 맞혔어요` : "틀렸어요")}</p>
    ${qM(q).feedback(q)}
  </div>`;
}

const quitSheet = () => { const a = answered();
  return `<div class="scrim" data-act="stay"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="qt">
    <h2 id="qt">퀴즈를 그만할까요?</h2>
    <p>${a ? `지금까지 푼 ${a}문제는 기록과 오답 노트에 남아요. 최고 점수는 끝까지 풀어야 저장돼요.` : "아직 푼 문제가 없어요."}</p>
    <button class="btn primary" data-act="stay">계속 풀기</button>
    <button class="btn secondary" data-act="quit">그만하기</button>
  </div></div>`; };

function renderQ(){
  const q = G.items[G.idx], n = G.items.length, M = MOD[G.tab];
  const tin = document.getElementById("tin"), tp = textPart(q);
  if(tin && tp && tp.val===null) tp.typed = tin.value;
  const multi = q.parts.length>1, firstPick = q.parts.find(p => p.type!=="text"), done = isDone(q), last = G.idx===n-1;
  const passed = G.idx + (done ? 1 : 0);
  app.innerHTML = bar(`<button class="iconbtn" data-act="askquit" aria-label="그만하기">${IC.close}</button>
      <div class="progress" role="progressbar" aria-label="진행" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${passed}"><span style="width:${passed/n*100}%"></span></div>
      <span class="qcount">${G.idx+1} / ${n}</span>`, "qbar") + `
    <main class="screen wrap">
      <div class="qmeta"><span class="tag">${G.label || M.tab}</span>
        <span class="right">${G.streak>=2 ? `<span class="streak">${IC.flame}${G.streak}연속</span>` : ""}<span>점수 <b>${totalScore()}</b></span></span></div>
      <div class="card">
        ${q.cat ? `<p class="cattag">${q.cat}</p>` : ""}${qM(q).prompt(q)}
        ${q.parts.map((p,i) => `<section class="sec"><h3>${multi ? NUM[i]+" " : ""}${p.title}</h3>${partHTML(q,i)}</section>`).join("")}
        ${done ? feedbackHTML(q) : ""}
      </div>
      <p class="keys">${tp ? "뜻 입력 후 Enter로 확인" : ""}${tp && firstPick ? " · " : ""}${firstPick ? `숫자 키로 선택${q.parts.filter(p => p.type!=="text").length>1 ? " (위에서부터 차례로)" : ""}` : ""} · 다 풀면 Enter로 다음 · Esc로 그만하기</p>
    </main>
    ${done ? `<div class="dock"><div class="wrap"><button class="btn primary next" data-act="next">${last ? "결과 보기" : "다음 문제"}</button></div></div>` : ""}
    ${QUIT ? quitSheet() : ""}`;
  if(QUIT){ const b = app.querySelector(".sheet .btn"); if(b) b.focus({preventScroll:true}); return; }
  const inp = document.getElementById("tin");
  if(inp){ inp.focus({preventScroll:true}); inp.setSelectionRange(inp.value.length, inp.value.length); }
  else if(done){
    const nb = app.querySelector(".next"); if(nb) nb.focus({preventScroll:true});
    const fb = app.querySelector(".fb"); if(fb && fb.getBoundingClientRect().top > innerHeight*0.6) fb.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start" });
  }
}

function afterAnswer(q){
  if(isDone(q)){ G.streak = qScore(q)===qMax(q) ? G.streak+1 : 0; if(!q.recorded){ q.recorded = true; recItem(q, qScore(q)===qMax(q)); } }
  renderQ();
}
function answerPick(pi, i){
  const q = G.items[G.idx], p = q.parts[pi];
  if(!p || p.type==="text" || p.val!==null || i>=p.opts.length) return;
  p.pick = i; p.val = p.opts[i]===p.ans; afterAnswer(q);
}
function answerText(giveUp){
  const q = G.items[G.idx], p = textPart(q); if(!p || p.val!==null) return;
  const inp = document.getElementById("tin"), val = inp ? inp.value.trim() : "";
  if(!giveUp && !val){ if(inp) inp.focus(); return; }
  p.typed = val; p.gaveUp = !!giveUp; p.val = giveUp ? false : checkText(val, p.ans); afterAnswer(q);
}
function override(){
  const q = G.items[G.idx], p = textPart(q); if(!p || p.val!==false || p.gaveUp) return;
  const wasDone = isDone(q);
  p.val = true; p.overridden = true;
  if(wasDone && qScore(q)===qMax(q)) G.streak++;
  renderQ();
}
function next(){
  const q = G.items[G.idx]; if(!isDone(q)) return;
  G.idx++;
  if(G.idx>=G.items.length) renderEnd(); else { renderQ(); window.scrollTo(0,0); }
}
function askQuit(){
  if(!answered()){ G = null; render(); window.scrollTo(0,0); return; }
  QUIT = true; renderQ();
}

/* ---------- 결과 ---------- */
function renderEnd(){
  G.done = true; QUIT = false;
  const M = MOD[G.tab], s = G.s, n = G.items.length;
  const max = G.items.reduce((a,q) => a + qMax(q), 0), pct = Math.round(totalScore()/max*100);
  if(!G.retry) setBest(M, M.best.key(s), pct);
  clearTimeout(lTimer); logFlush();
  const head = pct===100 ? "전부 맞혔어요" : pct>=80 ? "잘했어요" : pct>=50 ? "절반 넘게 맞혔어요" : "조금 더 연습해 봐요";
  const msg = pct===100 ? (G.retry ? "틀렸던 문제를 모두 맞혔어요." : "다음 난이도에 도전해 보세요.")
    : pct>=80 ? "틀린 문제만 한 번 더 보면 좋아요."
    : pct>=50 ? "틀린 문제를 다시 풀어 보세요."
    : "‘알아 두기’의 규칙을 한 번 훑어보고 다시 도전해 보세요.";
  const keys = []; G.items.forEach(q => q.parts.forEach(p => { if(!keys.some(k => k.key===p.key)) keys.push({ key:p.key, short:p.short }); }));
  const multi = G.items.some(q => q.parts.length>1);
  const cats = [...new Set(G.items.map(q => q.cat).filter(Boolean))];
  const cell = (label, ok, all) => `<div><span>${label}</span><b class="${ok===all ? "full" : ""}">${ok} / ${all}</b></div>`;
  const tally = cats.length
    ? cats.map(c => { const qs = G.items.filter(q => q.cat===c); return cell(c, qs.filter(q => qScore(q)===qMax(q)).length, qs.length); }).join("")
    : keys.map(k => { const has = G.items.filter(q => q.parts.some(p => p.key===k.key)); return cell(k.short, has.filter(q => q.parts.find(p => p.key===k.key).val).length, has.length); }).join("")
      + (multi ? cell("모두 맞힘", G.items.filter(q => qScore(q)===qMax(q)).length, n) : "");
  const wrong = G.items.filter(q => qScore(q) < qMax(q));
  G.lastWrong = wrong.map(q => q.item);
  const lv = (levelsMeta(G.tab, s)[s.level] || {}).label;
  const R = 52, C = 2*Math.PI*R;
  app.innerHTML = bar(`<button class="iconbtn" data-act="home" aria-label="닫기">${IC.close}</button><span class="ttl">결과</span>`) + `
  <main class="screen wrap">
    <section class="result">
      <div class="ring ${pct>=80 ? "hi" : pct<50 ? "lo" : ""}" role="img" aria-label="점수 ${pct}%">
        <svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="${R}"/>${pct ? `<circle class="val" cx="60" cy="60" r="${R}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(2)}"/>` : ""}</svg>
        <div class="num"><span>${pct}<small>%</small></span></div></div>
      <h1>${head}</h1><p>${msg}</p>
      <span class="ctx">${G.label || M.tab}${!G.label && lv && Object.keys(levelsMeta(G.tab, s)).length>1 ? " · " + lv : ""} · ${M.summary(s)} · ${n}문제</span>
    </section>
    <section class="field"><h2>${cats.length ? "분야별 정답" : "항목별 정답"}</h2><div class="tally">${tally}</div></section>
    ${wrong.length ? `<section class="field"><h2>틀린 문제 ${wrong.length}개</h2><ul class="list">${wrong.map(q => { const l = qM(q).wrongLine(q);
      return `<li><span class="cy" lang="ru">${l.ru}</span><span class="ko">${l.ko}<span class="parts">${q.cat ? `<i>${q.cat}</i>` : ""}${q.parts.filter(p => !p.val).map(p => `<i>${p.short}</i>`).join("")}</span></span></li>`; }).join("")}</ul></section>` : ""}
  </main>
  <div class="dock"><div class="wrap">
    ${wrong.length ? `<button class="btn primary" data-act="retry">틀린 ${wrong.length}문제 다시 풀기</button>` : ""}
    <button class="btn ${wrong.length ? "secondary" : "primary"}" data-act="again">${G.list ? "같은 문제로 다시" : "같은 설정으로 다시"}</button>
  </div></div>`;
  window.scrollTo(0,0);
}

/* ---------- 입력 ---------- */
app.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if(!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  if(a==="view"){ VIEW = v; G = null; render(); window.scrollTo(0,0); }
  else if(a==="open"){ TAB = v; VIEW = "cat"; prefsSave(); render(); window.scrollTo(0,0); }
  else if(a==="back"){ VIEW = "home"; render(); window.scrollTo(0,0); }
  else if(a==="set"){ const k = el.dataset.k; ST[TAB][k] = (k==="count" && v!=="all") ? Number(v) : v; normalize(TAB); prefsSave(); render(); }
  else if(a==="quick"){ TAB = v; normalize(v); startGame(); }
  else if(a==="start"){ startGame(); }
  else if(a==="again"){ TAB = G.tab; if(G.list) startGame(G.list, G.retry, G.s, G.label); else startGame(null, false, G.s); }
  else if(a==="retry"){ TAB = G.tab; startGame(G.lastWrong, true, G.s, "틀린 문제 다시 풀기"); }
  else if(a==="review"){ startReview(Number(v)); }
  else if(a==="home"){ G = null; QUIT = false; render(); window.scrollTo(0,0); }
  else if(a==="askquit"){ askQuit(); }
  else if(a==="stay"){ if(el.classList.contains("scrim") && e.target!==el) return; QUIT = false; renderQ(); }
  else if(a==="quit"){ clearTimeout(lTimer); logFlush(); G = null; QUIT = false; render(); window.scrollTo(0,0); }
  else if(a==="pick"){ answerPick(Number(el.dataset.p), Number(v)); }
  else if(a==="submit"){ answerText(false); }
  else if(a==="giveup"){ answerText(true); }
  else if(a==="override"){ override(); }
  else if(a==="next"){ next(); }
  else if(a==="speak"){ speak(v); }
  else if(a==="backup"){ recBackup(); }
  else if(a==="rqcheck"){ updCheck(true); }
  else if(a==="rqapply"){ location.reload(); }
  else if(a==="rqsave"){ updSaveFile(); }
  else if(a==="voice"){ VOICE = v; prefsSave(); render(); }
  else if(a==="ttsg"){ TTS_G = v; prefsSave(); render(); }
  else if(a==="ttsprev"){ const v0 = VOICE; VOICE = "tts"; speak(v); VOICE = v0; }
});
window.addEventListener("rq-change", () => { if(!G) render(); });

document.addEventListener("keydown", e => {
  if(!G || G.done) return;
  if(e.key==="Escape"){ if(QUIT){ QUIT = false; renderQ(); } else askQuit(); e.preventDefault(); return; }
  if(QUIT) return;
  const q = G.items[G.idx];
  const inInput = document.activeElement && document.activeElement.id==="tin";
  if(inInput){
    if(e.key==="Enter" && !e.isComposing){ answerText(false); e.preventDefault(); }
    return;
  }
  if(/^[1-4]$/.test(e.key)){
    const pi = q.parts.findIndex(p => p.type!=="text" && p.val===null);
    if(pi>=0){ answerPick(pi, Number(e.key)-1); e.preventDefault(); }
  } else if(e.key==="Enter" && isDone(q) && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-act]:not(.next)"))){ next(); e.preventDefault(); }
});

app.addEventListener("change", e => { if(e.target && e.target.id==="recfile" && e.target.files && e.target.files[0]) recRestore(e.target.files[0]); });
recLoadLocal();
prefsLoad();
{ const h = (location.hash || "").slice(1); if(MOD[h]){ TAB = h; VIEW = "cat"; } else if(h==="records" || h==="info") VIEW = h; }
pickVoice();
if(canSpeak){ try{ speechSynthesis.addEventListener("voiceschanged", pickVoice); }catch(e){ speechSynthesis.onvoiceschanged = pickVoice; } }
loadPacks().catch(() => {}).then(() => { renderSetup(); recConnect(); startUpdater(); });

