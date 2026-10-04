import {teachers,subjects,grades,goals,getCourse,recommend,news,announcements,getAnnouncement,announcementStorageKey,seoulDateKey,shouldShowAnnouncements} from './data.js';
import {home,about,courses,teacherPage,learning,newsPage,coursePanel,teacherDetail,portrait,courseURL,schedulePanel,announcementPoster} from './views.js';
const main=document.querySelector('#main');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const consultDialog=document.querySelector('#consult-dialog');
const detailDialog=document.querySelector('#detail-dialog');
const menuDialog=document.querySelector('#mobile-menu');
const announcementDialog=document.querySelector('#announcement-dialog');
let announcementTimer=0, announcementAttempted=false, announcementIndex=0;
const routeLabels={'/':'홈','/about':'학원 소개','/courses':'교육 과정','/teachers':'강사진','/learning':'학습 관리','/news':'학원 소식'};
let motionContext=null, revealObserver=null, introTrigger=null, introTimeline=null, routeFrame=0;
let selectedCourse={grade:'고1',subject:'국어'};
let consultation={step:0,grade:'',subject:'',goal:''};
let lastScene=-1;
const motion=(target)=>{if(!reduceMotion.matches&&window.gsap)gsap.fromTo(target,{opacity:0,y:16},{opacity:1,y:0,duration:.35,ease:'power3.out',clearProps:'transform,opacity'});};
function closeDialogs(){for(const d of [consultDialog,detailDialog,menuDialog,announcementDialog])if(d.open)d.close();}
function updateNavigation(path){
document.querySelectorAll('.desktop-nav a,.menu-dialog nav a').forEach(a=>{
if(a.getAttribute('href')===path)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
});
}
function render(url,scroll=true){
clearTimeout(announcementTimer);
routeFrame++;
const currentFrame=routeFrame;
revealObserver?.disconnect();
motionContext?.revert();
motionContext=null;introTrigger=null;introTimeline=null;lastScene=-1;
const path=url.pathname.replace(/\/$/,'')||'/';
const params=url.searchParams;
selectedCourse=getCourse(params.get('grade'),params.get('subject'));
const renderers={'/':home,'/about':about,'/courses':()=>courses(params),'/teachers':teacherPage,'/learning':learning,'/news':newsPage};
main.innerHTML=(renderers[path]||(()=>`<section class="page-heading container"><p class="eyebrow">페이지 안내</p><h1>이 페이지를 찾을 수 없어요.</h1><p class="lead">메뉴에서 원하는 페이지를 선택해 주세요.</p><a class="button button-primary" data-route href="/">홈으로 이동</a></section>`))();
document.title=(routeLabels[path]||'페이지 안내')+' · 제일종합학원';
updateNavigation(path);
scheduleAnnouncement(path);
if(scroll)window.scrollTo({top:0,behavior:'instant'});
main.focus({preventScroll:true});
if(window.gsap&&window.ScrollTrigger){
gsap.registerPlugin(ScrollTrigger);
motionContext=gsap.context(()=>{
if(path==='/')setupIntro();
if(!reduceMotion.matches)setupReveals();
},main);
requestAnimationFrame(()=>{if(currentFrame===routeFrame)ScrollTrigger.refresh();});
}
if(path==='/teachers'){
const teacher=teachers.find(t=>t.id===params.get('teacher'));
if(teacher)setTimeout(()=>{if(currentFrame===routeFrame)showTeacher(teacher.id);},100);
}
}
function navigate(href){
const url=new URL(href,location.href);
if(url.origin!==location.origin)return;
closeDialogs();
history.pushState({},'',url);
render(url);
}
function setupReveals(){
const nodes=[...main.querySelectorAll('[data-reveal]')];
gsap.set(nodes,{opacity:0,y:30});
revealObserver=new IntersectionObserver(entries=>{
for(const entry of entries)if(entry.isIntersecting){
const el=entry.target;
if(motionContext)motionContext.add(()=>gsap.to(el,{opacity:1,y:0,duration:.7,ease:'power3.out',clearProps:'transform,opacity'}));
revealObserver.unobserve(el);
}
},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
nodes.forEach(n=>revealObserver.observe(n));
}
function sceneAccessibility(index){
if(index===lastScene)return;
lastScene=index;
main.querySelectorAll('.teacher-scene,.final-scene').forEach((node,i)=>node.setAttribute('aria-hidden',String(i!==index)));
main.querySelectorAll('[data-scene]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
}
function setupIntro(){
const intro=main.querySelector('#intro');
if(!intro)return;
if(reduceMotion.matches){
intro.querySelectorAll('.teacher-scene,.final-scene').forEach(n=>n.setAttribute('aria-hidden','false'));
return;
}
const scenes=[...intro.querySelectorAll('.teacher-scene')];
const final=intro.querySelector('.final-scene');
gsap.set(scenes.slice(1),{autoAlpha:0});
gsap.set(final,{autoAlpha:0});
introTimeline=gsap.timeline({scrollTrigger:{
id:'jeil-intro',trigger:intro,start:'top top',end:()=>'+='+window.innerHeight*(window.innerWidth<=600?5.4:6.4),
pin:true,pinSpacing:true,scrub:.65,invalidateOnRefresh:true,anticipatePin:1,
onUpdate:self=>sceneAccessibility(Math.min(6,self.animation.time()<.6?0:Math.floor(self.animation.time()-.6)+1))
}});
introTimeline.to({},{duration:.6});
for(let i=1;i<scenes.length;i++){
const at=.6+(i-1);
introTimeline.to(scenes[i-1],{autoAlpha:0,duration:.5},at)
.to(scenes[i-1].querySelector('.subject-type'),{x:-95,scale:.95,duration:.7,ease:'power2.inOut'},at)
.to(scenes[i-1].querySelector('.hero-portrait'),{x:-65,duration:.7,ease:'power2.inOut'},at)
.set(scenes[i],{autoAlpha:1},at+.1)
.fromTo(scenes[i].querySelector('.subject-type'),{x:180,scale:1.08,opacity:0},{x:0,scale:1,opacity:1,duration:.8,ease:'power3.out'},at+.1)
.fromTo(scenes[i].querySelector('.hero-portrait'),{x:150,opacity:0},{x:0,opacity:1,duration:.8,ease:'power3.out'},at+.12)
.fromTo(scenes[i].querySelector('.teacher-caption'),{y:28,opacity:0},{y:0,opacity:1,duration:.6,ease:'power2.out'},at+.25)
.fromTo(scenes[i].querySelector('.scene-watermark'),{opacity:0},{opacity:1,duration:.5},at+.3);
}
introTimeline.to(scenes[5],{autoAlpha:0,duration:.5},5.6)
.set(final,{autoAlpha:1},5.75)
.fromTo(final.querySelectorAll('.ensemble img'),{y:65,opacity:0},{y:0,opacity:1,duration:.6,stagger:.065,ease:'power3.out'},5.75)
.fromTo(final.querySelector('.final-copy'),{y:45,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out'},6.1)
.to({},{duration:.6},6.7);
introTrigger=introTimeline.scrollTrigger;
sceneAccessibility(0);
gsap.fromTo(scenes[0].querySelector('.subject-type'),{x:-55,opacity:0},{x:0,opacity:1,duration:1,ease:'power3.out'});
gsap.fromTo(scenes[0].querySelector('.hero-portrait'),{x:65,opacity:0},{x:0,opacity:1,duration:1.15,ease:'power3.out'});
gsap.fromTo(scenes[0].querySelector('.teacher-caption'),{y:25,opacity:0},{y:0,opacity:1,duration:.8,delay:.15,ease:'power3.out'});
}
function goToScene(index){
if(!introTrigger||!introTimeline)return;
const time=index===0?.15:index===6?6.95:.6+(index-1)+.78;
const top=introTrigger.start+(introTrigger.end-introTrigger.start)*(time/introTimeline.duration());
window.scrollTo({top,behavior:reduceMotion.matches?'instant':'smooth'});
}
function showTeacher(id){
const teacher=teachers.find(t=>t.id===id);
if(!teacher)return;
document.querySelector('#detail-content').innerHTML=teacherDetail(teacher);
detailDialog.setAttribute('aria-label',teacher.subject+' '+teacher.name+' 강사 소개');
if(!detailDialog.open)detailDialog.showModal();
motion('#detail-content');
}
function showNews(id){
const item=news.find(n=>n.id===id);
if(!item)return;
document.querySelector('#detail-content').innerHTML=`<article class="news-modal"><p class="eyebrow">${item.category}</p><h2>${item.title}</h2><p class="news-date">${item.date}</p>${item.body.map(p=>`<p>${p}</p>`).join('')}</article>`;
detailDialog.setAttribute('aria-label',item.title);
if(!detailDialog.open)detailDialog.showModal();
motion('#detail-content');
}
function updateCourse(type,value){
if(type==='grade'&&!grades.includes(value)||type==='subject'&&!subjects.includes(value))return;
selectedCourse=getCourse(type==='grade'?value:selectedCourse.grade,type==='subject'?value:selectedCourse.subject);
document.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grade===selectedCourse.grade)));
document.querySelectorAll('[data-subject]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.subject===selectedCourse.subject)));
document.querySelector('#course-panel').innerHTML=coursePanel(selectedCourse);
const url=new URL(location.href);url.searchParams.set('grade',selectedCourse.grade);url.searchParams.set('subject',selectedCourse.subject);history.replaceState({},'',url);
motion('#course-panel');
}
function openConsult(button){
if(announcementDialog.open)announcementDialog.close();
if(menuDialog.open)menuDialog.close();
if(detailDialog.open)detailDialog.close();
consultation={step:0,grade:grades.includes(button.dataset.prefillGrade)?button.dataset.prefillGrade:'',subject:subjects.includes(button.dataset.prefillSubject)?button.dataset.prefillSubject:'',goal:''};
renderConsult();
consultDialog.showModal();
motion('#consult-content');
}
function renderConsult(){
const box=document.querySelector('#consult-content');
const {step,grade,subject,goal}=consultation;
if(step===3){
const result=recommend(grade,subject,goal);
if(!result){consultation.step=0;renderConsult();return;}
box.innerHTML=`<p class="dialog-label">나의 학습 방향</p><h2>다음 공부의 방향을<br>찾았어요.</h2><p class="dialog-desc">선택한 목표에 맞는 교육 과정과 학습 방향을 살펴보세요.</p><div class="result-summary"><span>${grade}</span><span>${subject}</span><span>${goal}</span></div><div class="result-course"><h3>${result.course.name}</h3><p>${result.focus}</p><div class="result-teacher">${portrait(result.course.teacher,'',true)}<div><strong>${result.course.teacher.name} 선생님</strong><span>${subject} 강사</span></div></div></div><div class="consult-actions"><button class="text-button" data-consult-back>선택 수정하기</button><a class="button button-primary" data-route href="${courseURL(grade,subject)}">교육 과정 살펴보기</a></div><button class="text-button" data-consult-reset>처음부터 다시 선택</button>`;
}else{
const field=['grade','subject','goal'][step];
const options=[grades,subjects,goals][step];
const labels=['현재 학년을 선택해 주세요.','관심 있는 과목을 선택해 주세요.','가장 먼저 이루고 싶은 목표는?'];
const descriptions=['지금의 학습 단계부터 시작합니다.','관심 과목에 맞는 교육 과정을 안내합니다.','선택한 목표에 맞춰 학습 방향을 제안합니다.'];
const current=consultation[field];
const goalDesc={'내신 집중':'학교 시험과 취약 단원','수능 준비':'유형과 실전 적용','내신·수능 균형':'학교 시험과 수능의 균형'};
box.innerHTML=`<p class="dialog-label">학습 방향 상담 · ${step+1}/3</p><div class="consult-progress" aria-hidden="true">${[0,1,2].map(i=>`<span class="${i<=step?'done':''}"></span>`).join('')}</div><h2 id="consult-question">${labels[step]}</h2><p class="dialog-desc">${descriptions[step]}</p><div class="choice-grid ${step===2?'goals':''}" role="group" aria-labelledby="consult-question">${options.map(option=>`<button class="choice-button" data-choice="${option}" data-field="${field}" aria-pressed="${current===option}">${option}${step===2?`<small>${goalDesc[option]}</small>`:''}</button>`).join('')}</div><p class="consult-error" role="status"></p><div class="consult-actions">${step?`<button class="button button-quiet" data-consult-back>이전</button>`:'<span></span>'}<button class="button button-primary" data-consult-next ${current?'':'disabled'}>${step===2?'결과 보기':'다음'}</button></div>`;
}
}
function choose(button){
const field=button.dataset.field;
const allowed={grade:grades,subject:subjects,goal:goals};
if(!allowed[field]?.includes(button.dataset.choice))return;
consultation[field]=button.dataset.choice;
document.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
document.querySelector('[data-consult-next]').disabled=false;
document.querySelector('.consult-error').textContent='';
}
function nextConsult(){
const field=['grade','subject','goal'][consultation.step];
if(!consultation[field]){document.querySelector('.consult-error').textContent='한 가지를 선택해 주세요.';return;}
consultation.step++;renderConsult();motion('#consult-content');
document.querySelector('#consult-content h2')?.setAttribute('tabindex','-1');
document.querySelector('#consult-content h2')?.focus({preventScroll:true});
}
document.addEventListener('click',event=>{
const element=event.target.closest('a,button');
if(!element)return;
if(element.matches('[data-route]')){
if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
event.preventDefault();navigate(element.getAttribute('href'));return;
}
if(element.matches('[data-announcements]')){showAnnouncements();return;}
if(element.matches('[data-announcement-index]')){renderAnnouncement(Number(element.dataset.announcementIndex));return;}
if(element.matches('[data-announcement-step]')){renderAnnouncement(announcementIndex+Number(element.dataset.announcementStep));return;}
if(element.matches('[data-close]')){element.closest('dialog')?.close();return;}
if(element.matches('[data-consult]')){openConsult(element);return;}
if(element.matches('.menu-toggle')){menuDialog.showModal();return;}
if(element.matches('[data-top]')){window.scrollTo({top:0,behavior:reduceMotion.matches?'instant':'smooth'});return;}
if(element.matches('[data-scene]')){goToScene(Number(element.dataset.scene));return;}
if(element.matches('[data-teacher]')){showTeacher(element.dataset.teacher);return;}
if(element.matches('[data-news]')){showNews(element.dataset.news);return;}
if(element.matches('[data-grade]')){updateCourse('grade',element.dataset.grade);return;}
if(element.matches('[data-subject]')){updateCourse('subject',element.dataset.subject);return;}
if(element.matches('[data-schedule]')){
const key=element.dataset.schedule;
if(!['day','week'].includes(key))return;
document.querySelectorAll('[data-schedule]').forEach(b=>b.setAttribute('aria-pressed',String(b===element)));
document.querySelector('#schedule-panel').innerHTML=schedulePanel(key);motion('#schedule-panel');return;
}
if(element.matches('[data-choice]')){choose(element);return;}
if(element.matches('[data-consult-next]')){nextConsult();return;}
if(element.matches('[data-consult-back]')){consultation.step=Math.max(0,consultation.step-1);renderConsult();motion('#consult-content');return;}
if(element.matches('[data-consult-reset]')){consultation={step:0,grade:'',subject:'',goal:''};renderConsult();motion('#consult-content');return;}
});
for(const dialog of [consultDialog,detailDialog,menuDialog,announcementDialog]){
dialog.addEventListener('click',event=>{
if(event.target!==dialog)return;
const r=dialog.getBoundingClientRect();
if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
}
menuDialog.addEventListener('close',()=>document.querySelector('.menu-toggle').setAttribute('aria-expanded','false'));
menuDialog.addEventListener('toggle',()=>document.querySelector('.menu-toggle').setAttribute('aria-expanded',String(menuDialog.open)));
window.addEventListener('popstate',()=>{closeDialogs();render(new URL(location.href));});
reduceMotion.addEventListener('change',()=>render(new URL(location.href)));
window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});
history.scrollRestoration='manual';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(new URL(location.href)),{once:true});
else render(new URL(location.href));


function renderAnnouncement(index){
const c=getAnnouncement(index);
announcementIndex=announcements.indexOf(c);
document.querySelector('#announcement-poster').innerHTML=announcementPoster(c);
document.querySelector('#announcement-count').textContent=(announcementIndex+1)+' / '+announcements.length;
document.querySelectorAll('[data-announcement-index]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.announcementIndex)===announcementIndex)));
announcementDialog.setAttribute('aria-label','제일종합학원 주요 소식 · '+c.title);
motion('#announcement-poster');
}
function showAnnouncements(index=announcementIndex){
clearTimeout(announcementTimer);
announcementAttempted=true;
closeDialogs();
const tabs=document.querySelector('#announcement-tabs');
tabs.replaceChildren(...announcements.map((c,i)=>{
const button=document.createElement('button');
button.type='button';
button.dataset.announcementIndex=String(i);
button.textContent=c.tab;
button.setAttribute('aria-pressed',String(i===index));
return button;
}));
document.querySelector('#announcement-hide-today').checked=false;
renderAnnouncement(index);
announcementDialog.showModal();
announcementDialog.scrollTop=0;
if(!reduceMotion.matches&&window.gsap){
gsap.fromTo(announcementDialog,{opacity:0,scale:.96,y:18},{opacity:1,scale:1,y:0,duration:.45,ease:'power3.out',clearProps:'transform,opacity',overwrite:true});
}
}
function scheduleAnnouncement(path){
clearTimeout(announcementTimer);
if(path!=='/'||announcementAttempted)return;
announcementTimer=setTimeout(()=>{
if((location.pathname.replace(/\/$/,'')||'/')!=='/'||document.querySelector('dialog[open]'))return;
announcementAttempted=true;
let hiddenDate=null;
try{hiddenDate=window.localStorage.getItem(announcementStorageKey);}catch{}
if(shouldShowAnnouncements(hiddenDate))showAnnouncements(0);
},1100);
}
function saveAnnouncementDismissal(){
if(!document.querySelector('#announcement-hide-today').checked)return;
try{window.localStorage.setItem(announcementStorageKey,seoulDateKey());}
catch{document.querySelector('#announcement-storage-status').textContent='숨김 설정을 저장할 수 없어 이 페이지를 보는 동안에만 다시 표시되지 않습니다.';}
}
announcementDialog.addEventListener('close',saveAnnouncementDismissal);
