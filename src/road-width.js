export const ROAD_SCALE=1.25;
export const ROAD_WIDTH=18*ROAD_SCALE;
export const ROAD_LIMIT=9.4*ROAD_SCALE;
export const OFFROAD_LIMIT=8.4*ROAD_SCALE;
// Rendering uses old lateral placement units; gameplay keeps physical metres.
export const wideFrame=frame=>(distance,offset=0)=>frame(distance,offset*ROAD_SCALE);
