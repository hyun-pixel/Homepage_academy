import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {teachers,grades,subjects,goals,getCourse,recommend,news,announcements,getAnnouncement,seoulDateKey,shouldShowAnnouncements} from './dist/data.js';
import {home,about,courses,teacherPage,learning,newsPage,announcementPoster} from './dist/views.js';
const root=path.dirname(fileURLToPath(import.meta.url));
let assertions=0;
function check(value,message){assert.ok(value,message);assertions++;}
check(teachers.length===6&&new Set(teachers.map(t=>t.id)).size===6,'Six unique teacher profiles');
for(const grade of grades)for(const subject of subjects){
const course=getCourse(grade,subject);
check(course.teacher.subject===subject&&course.grade===grade,'Course must match selected grade and subject');
check(course.exam!==course.csat&&course.exam.length>20,'Course has distinct exam and CSAT content');
for(const goal of goals){
const result=recommend(grade,subject,goal);
check(result&&result.course.subject===subject&&result.course.grade===grade&&result.goal===goal,'Counseling result must preserve all three selections');
check(result.focus.length>20,'Counseling result has learning guidance');
if(goal==='내신·수능 균형')check(result.focus.includes(course.exam)&&result.focus.includes(course.csat),'Balanced goal includes exam and CSAT guidance');
}
}
check(getCourse('wrong','<script>').grade==='고1'&&getCourse('wrong','<script>').subject==='국어','Invalid query values use safe defaults');
check(recommend('고1','','수능 준비')===null&&recommend('고4','국어','내신 집중')===null&&recommend('고2','수학','wrong')===null,'Incomplete or unsupported choices rejected');
const renderings=[home(),about(),courses(new URLSearchParams('grade=고3&subject=수학')),teacherPage(),learning(),newsPage()];
check((renderings[0].match(/class="teacher-scene /g)||[]).length===6&&renderings[0].includes('class="final-scene"'),'Six teacher scenes and brand finale');
check(renderings[2].includes('고3 수학 통합 학습 과정'),'Direct course URL state renders correct course');
for(const t of teachers){
const file=path.join(root,'dist/assets/portraits',t.id+'.webp');
const b=await fs.readFile(file);
check(b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP','Real WebP asset: '+t.id);
}
const index=await fs.readFile(path.join(root,'dist/index.html'),'utf8');
const css=await fs.readFile(path.join(root,'dist/styles.css'),'utf8');
const app=await fs.readFile(path.join(root,'dist/app.js'),'utf8');
check(renderings.every(html=>!html.includes('cta-section')&&!/\bAI\b|가상|예시|데모|체험|콘셉트|시연/.test(html))&&!/\bAI\b|가상|예시|데모|체험|콘셉트|시연|CONCEPT/.test(index+app),'Removed common CTA and prototype notices from all screens');
check(css.includes('prefers-reduced-motion')&&app.includes("setAttribute('aria-hidden','false')"),'Reduced motion exposes all scenes');
check(index.includes('lang="ko"')&&index.includes('skip-link'),'Korean document and keyboard skip link');
check(!app.includes("addEventListener('scroll'")&&!app.includes('fetch('),'No scroll polling or external submissions');
const localRefs=new Set([...index.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css|svg|woff2))"/g)].map(m=>m[1]));
for(const ref of localRefs)check((await fs.stat(path.join(root,'dist',ref))).isFile(),'Local dependency exists: '+ref);
for(const file of ['styles.css','app.js','data.js','views.js','assets/vendor/gsap.min.js','assets/vendor/ScrollTrigger.min.js','assets/vendor/PretendardVariable.woff2',...teachers.map(t=>'assets/portraits/'+t.id+'.webp')]){
const r=await fetch('http://127.0.0.1:4173/'+file);
check(r.status===200&&Number(r.headers.get('content-length')||1)>0,'Asset HTTP response: '+file);
await r.arrayBuffer();
}
for(const route of ['/','/about','/courses?grade=%EA%B3%A03&subject=%EC%88%98%ED%95%99','/teachers','/learning','/news','/courses/']){
const r=await fetch('http://127.0.0.1:4173'+route);
check(r.status===200&&(await r.text()).includes('id="main"'),'Direct route response: '+route);
}
const health=await (await fetch('http://127.0.0.1:4173/health')).json();
check(health.app==='jeil-academy-concept','Own local server identity');
check((await fetch('http://127.0.0.1:4173/not-found')).status===404,'Unknown path returns 404');
check((await fetch('http://127.0.0.1:4173/',{method:'POST'})).status===405,'Read-only server rejects POST');
const traversal=await fetch('http://127.0.0.1:4173/%2e%2e%5cserver.mjs');
check(traversal.status===403,'Encoded directory traversal is rejected');
check(seoulDateKey(new Date('2026-10-03T14:59:59Z'))==='2026-10-03','Seoul date before midnight');
check(seoulDateKey(new Date('2026-10-03T15:00:00Z'))==='2026-10-04','Seoul date after midnight');
check(!shouldShowAnnouncements('2026-10-03',new Date('2026-10-03T14:59:59Z')),'Notice hidden during selected Seoul day');
check(shouldShowAnnouncements('2026-10-03',new Date('2026-10-03T15:00:00Z')),'Notice reappears after Seoul midnight');
check(shouldShowAnnouncements(null,new Date('2026-10-03T14:59:59Z'))&&shouldShowAnnouncements('invalid',new Date('2026-10-03T14:59:59Z')),'New or invalid preference does not block notices');
check(getAnnouncement(-1)===announcements[2]&&getAnnouncement(3)===announcements[0]&&getAnnouncement(NaN)===announcements[0],'Previous/next wraps safely');
check(announcements.length===3&&new Set(announcements.map(c=>c.id)).size===3,'Three unique campaign designs');
for(const c of announcements){
const poster=announcementPoster(c);
check(poster.includes('id="announcement-heading"')&&poster.includes('data-route')&&poster.includes(c.href),'Campaign has accessible heading and working internal link');
check(!/\bAI\b|가상|예시|데모|체험|콘셉트|시연/.test(poster),'Campaign retains approved wording style');
check(['/learning','/news','/courses'].includes(c.href),'Campaign CTA uses existing page');
}
const report={time:new Date().toISOString(),status:'passed',assertions,courseCombinations:18,counselingCombinations:54,teacherAssets:6,routes:6,announcementDesigns:3,browserVisualQA:'not performed: CUA runtime could not start (Windows sandbox ACL / trusted Node error)',limitations:['PC/mobile visual rendering and real browser interaction remain unverified.','No real counseling, deployment, login, or database.']};
await fs.writeFile(path.join(root,'test-results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));

