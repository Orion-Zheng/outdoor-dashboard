// Display policy uses the stage's minimum experience because actual jump count
// is not collected. It does not add a C-license requirement to USPA rules.
const minimumStage={all:0,license:0,skills:1,fun:2,balloon:3,wingsuit:4,camera:4,teaching:4};
export function stageGoalKeys(level){return Number.isInteger(level)&&level>=0&&level<=5?Object.keys(minimumStage).filter(key=>level>=minimumStage[key]):[]}
export function normalizeStageGoal(level,goal){return stageGoalKeys(level).includes(goal)?goal:'all'}
export function courseFitsStage(course,level){return stageGoalKeys(level).includes(course.kind)&&course.min<=level&&course.max>=level}
