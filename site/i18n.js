// Chinese product copy: named organizations, aircraft and original quoted sources keep their official names.
const exact={
 'Skydive California - Nero':'双人跳伞实拍：Nero 的体验',
 'Nick Voegele - Coach Jump 3 (CAT H)':'AFF 之后：真实的教练指导跳',
 'Angelos Evangelidakis (DJ EVANS) - First Licensed Skydive (Jump 26)':'A 证之后：第 26 跳实拍',
 'Skydiving out of a hot air balloon at 6:30AM! // Balloon Jump at Skydive Perris':'B 证相关项目：热气球跳伞实拍',

 'AFF Student Course Jumps - All levels 1 to 7 - Skydive Teuge':'Teuge 基地 AFF 1–7 级课程跳伞示例',
 'Indoor skydiving':'室内跳伞','Outdoor skydiving':'户外跳伞','Indoor experience':'室内飞行体验','Tandem skydive':'双人跳伞体验',
 'First-time / Tandem':'首次体验 / 双人跳','Student · pre-AFF':'学生 · AFF 入门前','AFF graduate · pre-A':'AFF 毕业 · 未取得 A 证',
 'USPA Coach':'USPA 助理教练','AFF Instructor':'AFF 教练','Tandem Instructor':'双人跳伞教练',
 'Static':'静态飞行','Dynamic':'动态飞行','Formation':'编队飞行','Belly':'腹飞','Belly flying':'腹飞','Back flying':'背飞','Fun jump':'持证自由跳',
 'Belly Flying Neutral Position':'腹飞稳定姿态','Back Fly Neutral Body Position':'背飞稳定姿态','Neutral Sit Position':'坐飞稳定姿态','Head Down':'倒立飞行','Half Eagle':'半鹰式姿态转换',
 'Front Layout':'前向翻转飞行','Head Down In-face High Speed':'高速倒立面向内绕圈飞行','Head Down Switches High Speed':'高速倒立绕圈转换',
 '2-Way Belly Flying':'双人腹飞编队','3-way FS Dive-pool':'三人编队动作示例','4-way FS Dive-pool':'四人编队动作示例',
 'iFLY What To Expect':'iFLY 首次飞行体验流程','The Skydive Monterey Bay ocean view skydiving experience.':'蒙特雷湾双人跳伞体验',
 'Category A (AFF) Skydive Freefall Skills':'AFF 学生 A 阶段自由落体技能','Category H – Freefall Skills':'学生 H 阶段自由落体技能','Category H – Canopy Skills':'学生 H 阶段伞控技能',
 'A-license Check Dive – Skydiving Training Skills':'A 证检查跳技能示例','Squirrel SWIFT 4':'Squirrel SWIFT 4 翼装飞行示例','Tandem Instructor Course':'双人跳伞教练课程示例'
};
const replacements=[
 [/A-license progression/g,'A 证进阶'],[/A-license/g,'A 证'],[/B-license/g,'B 证'],[/\b([ABCD]) license\b/g,'$1 证'],
 [/^(Belly flying|Back flying|Head-up|Head-down|Coach jump|Canopy piloting|Tracking & angle|Camera Flyer|Camera flying|Wingsuit first flight) · /,''],
 [/Formation \/ Freefly · 户外 coaching/g,'户外编队 / 自由飞行教练指导'],[/Static Pro/g,'静态飞行专业级'],[/Dynamic Pro/g,'动态飞行专业级'],
 [/Static \/ Dynamic/g,'静态 / 动态飞行'],[/Head-up \/ Head-down/g,'坐飞 / 倒立飞行'],[/Carving \/ 动态飞行/g,'绕圈与动态飞行'],
 [/\bStatic\b/g,'静态飞行'],[/\bDynamic\b/g,'动态飞行'],[/\bFormation\b/g,'编队飞行'],[/\bPro\b/g,'专业级'],[/\bLevel(?:s)?\b/g,'阶段'],
 [/Fun jump/g,'持证自由跳'],[/Fun load/g,'持证跳伞航班'],[/\bStudent\b/g,'学生'],[/B-only/g,'仅限 B 证及以上'],
 [/coach \/ solo/g,'教练指导 / 单人训练'],[/Coach \/ solo/g,'教练指导 / 单人训练'],[/coach \+ rental/g,'教练指导＋装备租赁'],
 [/Coach \/ Instructor/g,'助理教练 / 教练'],[/\bCoach\b/g,'助理教练'],[/\bInstructor\b/g,'教练'],[/\bcoach(?:ing)?\b/g,'教练指导'],[/\b[Ss]olo\b/g,'单人跳'],
 [/\brating\b/g,'资质认证'],[/\bbriefing\b/g,'现场说明'],[/\bfreefly\b/g,'自由飞行'],[/\btracking\b/g,'移动飞行'],[/\bcarving\b/g,'绕圈飞行'],[/\blayouts\b/g,'翻转飞行'],
 [/Rental gear/g,'租赁装备'],[/自带 gear/g,'自带装备'],[/\bgear\b/g,'装备'],[/Sport flyer/g,'进阶飞行'],[/\bSport\b/g,'进阶飞行'],[/block time/g,'整段飞行时间'],[/\bflights?\b/g,'次飞行'],
 [/\b2-way\b/g,'双人'],[/\b3-way\b/g,'三人'],[/\b4-way\b/g,'四人'],[/^(双人|三人|四人) · \1/g,'$1'],[/\bspotting\b/g,'安全辅助指导'],[/\bCamera Flyer\b/g,'相机飞行'],[/\bFAQ\b/g,'常见问题'],[/\bcheck dive\b/g,'检查跳'],[/\blogbook\b/g,'跳伞记录'],[/\bjumps\b/g,'跳'],[/Blackhawk conversion/g,'Blackhawk 改装'],[/持证\s*持证自由跳/g,'持证自由跳'],[/([\p{Script=Han}])\s+(?=\p{Script=Han})/gu,'$1']
];
export function zhText(value){if(typeof value!=='string')return value;if(exact[value])return exact[value];let result=value;for(const [pattern,replacement] of replacements)result=result.replace(pattern,replacement);return result}
