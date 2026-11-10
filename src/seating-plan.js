export const benchSize={width:2.15,height:1,depth:0.7};
export const seatingCourts={
 fountain:{rect:[5,9.9,10.9,18.7],surface:'stone',hole:{x:7,z:14,radius:1.5}},
 arrival:{rect:[-15.4,-12.6,19,21.45],surface:'stone'},
 workshop:{rect:[-24.85,-21.55,-2.6,0.1],surface:'stone'},
 waterfrontNorth:{rect:[-26.9,-24.7,-23.15,-20.25],surface:'deck'},
 waterfrontSouth:{rect:[-26.9,-24.7,20.05,22.95],surface:'deck'},
};
export const seatingPlaces=[
 {id:'fountain-north',x:7,z:11.25,lookAt:{x:7,z:14},court:'fountain'},
 {id:'fountain-south',x:7,z:17.2,lookAt:{x:7,z:14},court:'fountain'},
 {id:'arrival',x:-14,z:20.3,lookAt:{x:-8.7,z:16.8},court:'arrival'},
 {id:'workshop',x:-23.2,z:-1.2,lookAt:{x:-15,z:-4},court:'workshop'},
 {id:'waterfront-north',x:-25.8,z:-21.7,lookAt:{x:-32,z:-21.7},court:'waterfrontNorth'},
 {id:'waterfront-south',x:-25.8,z:21.5,lookAt:{x:-32,z:21.5},court:'waterfrontSouth'},
];
export function benchHeading(place){return Math.atan2(place.lookAt.x-place.x,place.lookAt.z-place.z);}
export function benchFootprint(place){const a=benchHeading(place),hw=benchSize.width/2,hd=benchSize.depth/2,x=Math.abs(Math.cos(a))*hw+Math.abs(Math.sin(a))*hd,z=Math.abs(Math.sin(a))*hw+Math.abs(Math.cos(a))*hd;return [place.x-x,place.x+x,place.z-z,place.z+z];}
