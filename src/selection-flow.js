export const SELECTION_STAGES=['home','cars','parts','characters','tracks'];
export function previousSelectionStage(stage){return stage==='tracks'?'characters':stage==='characters'?'parts':stage==='parts'?'cars':'home';}
export function modeTracks(mode){return mode==='horizon'?['valley','harbor','fair','sawmill']:mode==='classic'?['valley','harbor']:['valley','harbor','fair','sawmill','night'];}
export function orderedCupTracks(tracks,first){const index=tracks.indexOf(first);if(index<0)throw new Error('Pista fora desta copa');return [...tracks.slice(index),...tracks.slice(0,index)];}
