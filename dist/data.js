export const subjects = ['국어', '영어', '수학', '사회', '과학', '한국사'];
export const grades = ['고1', '고2', '고3'];
export const goals = ['내신 집중', '수능 준비', '내신·수능 균형'];
export const teachers = [
{ id:'korean', subject:'국어', name:'서지윤', line:'읽는 힘이, 답을 찾는 힘으로.', intro:'문장의 구조부터 지문의 맥락까지. 감에 의존하던 국어를 근거로 설명할 수 있는 국어로 바꿉니다.', method:['핵심 문장과 구조를 찾는 독해','문학의 맥락을 연결하는 해석','선택지의 근거를 확인하는 풀이'], quote:'답을 맞히는 순간보다, 왜 맞는지 설명하는 순간을 만듭니다.' },
{ id:'english', subject:'영어', name:'윤도현', line:'외우는 영어에서, 읽어내는 영어로.', intro:'단어와 문법을 지문 안에서 연결합니다. 한 문장의 이해가 긴 글의 흐름으로 이어지는 수업입니다.', method:['문장 단위의 구조 분석','문맥으로 넓히는 어휘 학습','근거와 논리를 찾는 유형별 독해'], quote:'문장의 길이가 길어져도, 이해하는 힘은 흔들리지 않도록.' },
{ id:'math', subject:'수학', name:'한서린', line:'개념을 연결하면, 풀이가 보인다.', intro:'공식의 출발점을 이해하고 개념 사이의 연결을 찾습니다. 처음 보는 문제에도 시작할 수 있는 힘을 기릅니다.', method:['정의에서 출발하는 개념 이해','풀이 과정을 말로 설명하기','오답 원인을 구분하는 복습'], quote:'풀이를 기억하는 학생에서, 풀이를 만드는 학생으로.' },
{ id:'social', subject:'사회', name:'정우석', line:'세상을 이해하는, 더 넓은 시선.', intro:'개념과 사례를 함께 읽습니다. 자료를 분석하고 관점을 비교하며 사회를 바라보는 기준을 세웁니다.', method:['개념과 실제 사례의 연결','도표와 자료의 핵심 분석','서로 다른 관점의 비교'], quote:'개념 하나를 배울 때마다, 세상을 읽는 시선 하나를 더합니다.' },
{ id:'science', subject:'과학', name:'강이준', line:'원리를 알면, 현상이 풀린다.', intro:'현상 속 원리부터 자료 해석까지. 질문과 설명을 반복하며 과학적 사고의 흐름을 익힙니다.', method:['현상에서 출발하는 원리 탐구','그래프와 실험 자료 해석','단위와 조건을 점검하는 문제 풀이'], quote:'왜 그런지 묻는 질문이, 스스로 푸는 힘이 됩니다.' },
{ id:'history', subject:'한국사', name:'오유진', line:'흩어진 사건을, 하나의 흐름으로.', intro:'연도 암기를 넘어 사건의 앞뒤를 연결합니다. 인과관계와 시대의 맥락으로 역사를 이해합니다.', method:['시대의 변화를 연결하는 흐름 정리','사료 속 단서 찾기','주제별 비교와 인과관계 설명'], quote:'사건 사이의 연결이 보이면, 역사는 더 오래 기억됩니다.' }
];
const gradePlan = {
'고1':{title:'기초를 단단하게, 가능성을 넓게.',focus:'고등 학습의 출발',desc:'고등학교 공부의 리듬을 만들고, 개념과 학습 습관의 기반을 다지는 과정입니다.',exam:'학교 진도에 맞춰 핵심 개념을 정리하고, 단원별 확인과 서술형 연습으로 이해를 점검합니다.',csat:'지문·자료·문제를 읽는 기본 방법을 익히며 다음 학년으로 이어질 사고력을 기릅니다.'},
'고2':{title:'쌓아온 개념을, 실력으로 연결.',focus:'심화와 확장',desc:'선택 과목과 학습 목표를 살펴보고, 개념의 깊이와 문제 적용력을 함께 넓히는 과정입니다.',exam:'학교별 범위와 선택 과목을 고려해 복습 계획을 세우고, 취약 단원을 집중 보완합니다.',csat:'기출 유형의 접근 방법을 익히고, 풀이의 근거와 시간을 함께 점검합니다.'},
'고3':{title:'흔들리지 않는, 나만의 완성.',focus:'실전과 완성',desc:'현재의 학습 상태를 점검하고, 목표에 맞춰 실전 적용과 마지막 보완에 집중하는 과정입니다.',exam:'필요한 학교 시험 범위를 압축 정리하고, 반복되는 실수를 점검합니다.',csat:'시간 안배와 문제 선택을 연습하며, 실전 후 분석을 다음 학습으로 연결합니다.'}
};
export function getCourse(grade='고1', subject='국어') {
const safeGrade=grades.includes(grade)?grade:'고1';
const teacher=teachers.find(t=>t.subject===subject)||teachers[0];
return {grade:safeGrade,subject:teacher.subject,teacher,...gradePlan[safeGrade],name:safeGrade+' '+teacher.subject+' 통합 학습 과정'};
}
export function recommend(grade,subject,goal) {
if(!grades.includes(grade)||!subjects.includes(subject)||!goals.includes(goal))return null;
const course=getCourse(grade,subject);
const focus=goal==='내신 집중'?course.exam:goal==='수능 준비'?course.csat:course.exam+' '+course.csat;
return {course,goal,focus};
}
export const news = [
{id:'winter',category:'교육 과정',date:'2026.10.01',title:'다음 학년을 준비하는 겨울 학습 로드맵',summary:'방학의 시간을 다음 학년의 자신감으로 연결하는 학습 계획을 소개합니다.',body:['겨울 학습은 현재의 빈틈을 확인하는 것에서 시작합니다. 한 학기 동안 어려웠던 개념과 반복되는 실수를 정리해 보세요.','고1은 고등 학습의 기본 습관, 고2는 선택 과목과 개념 연결, 고3은 실전 준비에 초점을 둡니다. 학년별 계획에 따라 주간 목표를 작게 나누는 것이 학습 과정의 핵심입니다.']},
{id:'feedback',category:'학습 관리',date:'2026.09.25',title:'오답을 다시 읽는 시간, 주간 피드백의 시작',summary:'틀린 문제의 수보다 틀린 이유에 집중하는 복습 방법입니다.',body:['오답의 원인을 개념 부족, 조건 해석, 풀이 과정, 시간 관리로 나누어 보세요. 다음 복습에서 무엇을 바꿔야 할지가 더 분명해집니다.','주간 피드백에서는 잘된 점 하나와 보완할 점 하나를 먼저 고릅니다. 이후 유사 문제에 다시 적용하고 학습 기록으로 남기는 흐름을 제안합니다.']},
{id:'six',category:'학원 이야기',date:'2026.09.18',title:'여섯 과목, 하나의 목표를 향해',summary:'서로 다른 과목의 공부가 학생의 성장으로 연결되는 방식.',body:['국어의 독해, 영어의 문장 이해, 수학의 개념 연결, 사회의 자료 분석, 과학의 원리 탐구, 한국사의 맥락 이해를 하나의 학습 계획 안에서 살펴봅니다.','모든 과목을 같은 방식으로 공부하기보다 과목마다 필요한 접근을 찾고, 공통으로 필요한 학습 습관을 함께 다지는 교육 방향을 제안합니다.']}
]


/* Campaign wording is invented for this local design preview.
   Replace the admission achievement with verified information before publication. */
export const announcements = [
{id:'admission2027',kind:'achievement',tab:'합격 소식',year:'2027',kicker:'2027학년도 대학입시',title:'서울대학교 수석 합격',university:'서울대학교',achievement:'수석 합격',student:'김○준',department:'컴퓨터공학부',grade:'고3',message:'너의 가능성을, 제일 높이.',action:'합격을 만드는 학습 관리',href:'/learning',requiresVerification:true},
{id:'winter2027',kind:'winter',tab:'겨울 학습',year:'2027',kicker:'2027 겨울 집중 과정',title:'이번 겨울, 너의 다음이 달라진다.',audience:'예비고1 · 예비고2 · 예비고3',message:'개념을 단단하게. 실력을 더 높이.',action:'겨울 학습 로드맵 보기',href:'/news',requiresVerification:true},
{id:'regular2027',kind:'regular',tab:'내신·수능',year:'2027',kicker:'고등 1–3학년 통합 학습',title:'내신도, 수능도. 제일답게.',action:'학년별 교육 과정 보기',href:'/courses',requiresVerification:true}
];
export const announcementStorageKey='jeil.announcements.hiddenDate';
export function seoulDateKey(date=new Date()){
return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
export function shouldShowAnnouncements(hiddenDate,date=new Date()){
return hiddenDate!==seoulDateKey(date);
}
export function getAnnouncement(index=0){
return announcements[Number.isInteger(index)?((index%announcements.length)+announcements.length)%announcements.length:0];
}

