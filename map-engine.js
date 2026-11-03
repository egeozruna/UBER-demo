/* A local, dependency-free illustrated neighborhood with a true 3D projection. */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const palette = {
    land: '#e6e6e6', lot: '#dadada', curb: '#d0d0d0', road: '#ffffff',
    water: '#c2d1d8', waterEdge: '#b4c6ce', park: '#d5dbd1', tree: '#a9b6a5',
    ink: '#263c33', accent: '#11835a', roof: '#d5d4cd', side: '#b8bbb5'
  };
  const buildings = [
    [24,28,82,120,64], [182,25,90,138,112], [284,37,70,125,71],
    [440,28,74,133,98], [528,45,78,114,152], [709,23,80,143,90],
    [803,38,105,124,124], [1002,23,113,137,106],
    [25,252,81,67,45], [182,250,72,68,78], [265,248,90,70,52],
    [441,251,164,67,94], [707,249,82,70,55], [805,245,102,74,82],
    [1000,247,116,73,45],
    [20,383,90,32,18], [181,385,170,28,22], [438,384,164,29,18],
    [716,384,189,29,20], [1003,382,112,31,24],
    [440,648,163,140,66], [723,648,184,127,118,'destination'],
    [1003,651,111,143,86],
    [22,901,85,96,45], [180,906,80,99,48], [277,901,76,110,65],
    [443,907,71,102,60], [528,918,78,95,42], [1004,907,111,98,53],
    [-95,26,72,142,75], [-95,248,72,70,48], [-98,644,78,146,68],
    [1201,30,115,130,102], [1202,248,100,72,62], [1201,650,108,138,90]
  ].map((b, i) => ({x:b[0], y:b[1], w:b[2], d:b[3], h:b[4], destination:b[5] === 'destination', id:i}));

  const trees = [
    [36,638,20],[85,634,17],[131,651,19],[215,634,17],[293,649,21],
    [35,709,17],[85,752,20],[143,787,20],[227,777,17],[307,771,21],
    [311,700,17],[251,709,17],[187,692,18],
    [53,568,13],[112,564,14],[201,568,13],[295,565,14],
    [446,563,13],[511,563,13],[583,562,13],[746,565,13],[824,562,13],[889,563,13],
    [1020,563,13],[1093,563,13],[726,925,15],[783,964,17],[889,942,17],
    [1150,670,13],[1150,746,13],[1150,948,13]
  ];

  window.createDemoMap = function createDemoMap(svg) {
    if (!svg || svg.namespaceURI !== NS) throw new Error('createDemoMap requires an SVG element.');
    svg.setAttribute('viewBox', '0 0 1000 800');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'A two-dimensional neighborhood map with a route to the building entrance.');
    let amount = 0;
    let target3D = false;
    let zoom = 1;
    let frame = 0;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function renderFlat() {
      const t=0;
      const angle = -25 * Math.PI / 180 * t;
      const pitch = 52 * Math.PI / 180 * t;
      const ca = Math.cos(angle), sa = Math.sin(angle), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = (0.785 + 0.015 * t) * zoom;
      const box = svg.getBoundingClientRect();
      const aspect = box.height > 0 ? box.width / box.height : 1.25;
      // On a narrow phone screen, keep the destination and route at the center.
      const mobileFocus = Math.max(0, Math.min(1, (1.25 - aspect) / .5));
      const horizontalFocus = (215 * ca - 261 * sa) * mobileFocus;
      const p = (x,y,z=0) => {
        const dx=x-600, dy=y-525;
        return [500+(dx*ca-dy*sa-horizontalFocus)*scale, 400+(dx*sa+dy*ca)*cp*scale-z*sp*scale+35*t];
      };
      const points = list => list.map(v=>{const q=p(...v);return q[0].toFixed(2)+','+q[1].toFixed(2);}).join(' ');
      const poly = (list, fill, extra='') => `<polygon points="${points(list)}" fill="${fill}" ${extra}/>`;
      const rect = (x,y,w,d,z,fill,extra='') => poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],fill,extra);
      const line = (list,stroke,width=1,extra='') => `<polyline points="${points(list)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
      const ellipse = (x,y,rx,ry,fill,z=0,extra='') => {
        const list=[];
        for(let i=0;i<28;i++){const a=i*Math.PI/14;list.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry,z]);}
        return poly(list,fill,extra);
      };
      const label = (x,y,text,opts={}) => {
        const q=p(x,y,opts.z||0);
        return `<text x="${q[0].toFixed(2)}" y="${(q[1]+(opts.dy||0)).toFixed(2)}" text-anchor="middle" fill="${opts.fill||'#85908a'}" font-size="${opts.size||10}" font-weight="${opts.weight||500}" letter-spacing="${opts.tracking===undefined?1.2:opts.tracking}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" ${opts.extra||''}>${text}</text>`;
      };
      let out = `<title>${target3D?'3D':'2D'} entrance map</title><desc>A fictional downtown neighborhood with a river, bridge, park and buildings. A green route leads from a car to the clearly marked south entrance of River House.${target3D?' Buildings and the bridge are shown with height and depth.':''}</desc>`;
      out += `<defs><pattern id="map-water" width="36" height="30" patternUnits="userSpaceOnUse"><path d="M5 10h13m4 15h9" stroke="#d1e3e7" stroke-width="1" opacity=".55"/></pattern><filter id="map-pill-shadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1c382c" flood-opacity=".13"/></filter></defs>`;
      out += '<rect width="1000" height="800" fill="'+palette.land+'"/>';
      out += rect(-600,-600,2400,2200,0,palette.land);
      // Soft pavement around each city block.
      [[-105,12,226,169],[167,12,207,169],[427,12,201,169],[697,12,231,169],[988,12,153,169],[-105,237,226,95],[167,237,207,95],[427,237,201,95],[697,237,231,95],[988,237,153,95],[426,633,201,184],[698,632,232,184],[988,633,153,184],[-106,888,227,153],[167,888,207,153],[427,888,201,153],[988,888,153,153]].forEach(r=>{out+=rect(...r,0,palette.lot);});
      // Street curb bands and white street surface, including cross-streets.
      [140,400,660,960,1160].forEach(x=>{out+=rect(x-30,-600,60,2200,0,palette.curb);out+=rect(x-27,-600,54,2200,.2,palette.road);});
      [210,360,600,850,1050].forEach(y=>{out+=rect(-600,y-30,2400,60,0,palette.curb);out+=rect(-600,y-27,2400,54,.3,palette.road);});
      // A landscaped park and a smaller green at the pickup point.
      out += rect(-4,631,366,185,.5,palette.park);
      out += rect(697,889,232,150,.5,'#d9e2d1');
      out += line([[16,804,1],[115,716,1],[190,716,1],[275,650,1]],'#edf0e5',11);
      out += line([[192,805,1],[191,716,1],[303,716,1],[344,649,1]],'#edf0e5',8);
      out += ellipse(74,687,31,20,'#c0d5ce',1);
      out += ellipse(73,686,24,14,'#b6d0cc',1);
      out += rect(222,744,39,16,1,'#bdc9b1');
      // Crosswalk stripes stay on the ground as the camera tilts.
      [140,400,660,960].forEach(x=>[210,600,850].forEach(y=>{
        for(let k=-20;k<=20;k+=8){
          out+=rect(x+k-2.5,y-48,5,14,.6,'#fff');
          out+=rect(x+k-2.5,y+34,5,14,.6,'#fff');
          out+=rect(x-48,y+k-2.5,14,5,.6,'#fff');
          out+=rect(x+34,y+k-2.5,14,5,.6,'#fff');
        }
      }));
      // Canal and pedestrian riverwalks.
      out += rect(-600,425,2400,115,0,palette.waterEdge);
      out += rect(-600,431,2400,103,.4,palette.water);
      out += rect(-600,432,2400,101,.5,'url(#map-water)');
      out += rect(-600,414,2400,10,.6,'#f0eee5');
      out += rect(-600,541,2400,12,.6,'#f1efe6');
      out += line([[-600,423,1],[1800,423,1]],'#b2bcb4',1);
      out += line([[-600,542,1],[1800,542,1]],'#b2bcb4',1);
      for(let x=-80;x<1260;x+=78){out+=rect(x,555,18,3,1,'#b5bdb0');}
      // A raised bridge: solid deck, support piers, parapets and approach ramps.
      function bridge(x,w) {
        const h=23*t;
        let s='';
        if(t>.01){
          s+=rect(x-5,440,w+24,85,0,'#8caeb8',`opacity="${.22*t}"`);
          [451,506].forEach(y=>{
            s+=poly([[x+5,y-5,0],[x+w-5,y-5,0],[x+w-5,y-5,h-4],[x+5,y-5,h-4]],'#9aa7a4');
            s+=poly([[x+5,y-5,0],[x+5,y+5,0],[x+5,y+5,h-4],[x+5,y-5,h-4]],'#82928e');
            s+=poly([[x+5,y+5,0],[x+w-5,y+5,0],[x+w-5,y+5,h-4],[x+5,y+5,h-4]],'#a3afab');
          });
          s+=poly([[x,414,h],[x,540,h],[x,540,h-7],[x,414,h-7]],'#a0aaa5');
          s+=poly([[x,540,h],[x+w,540,h],[x+w,540,h-7],[x,540,h-7]],'#b2bab2');
        }
        s+=poly([[x,389,0],[x+w,389,0],[x+w,414,h],[x,414,h]],'#f6f6ef');
        s+=rect(x,414,w,126,h,'#f6f6ef');
        s+=poly([[x,540,h],[x+w,540,h],[x+w,572,0],[x,572,0]],'#f6f6ef');
        s+=line([[x+w/2,397,6*t],[x+w/2,417,h+.7],[x+w/2,536,h+.7],[x+w/2,564,6*t]],'#d4d6cb',1.4,'stroke-dasharray="6 6"');
        [x+2,x+w-2].forEach(xx=>{
          s+=line([[xx,391,1],[xx,414,h+1],[xx,540,h+1],[xx,571,1]],'#b4bcb1',2);
          if(t>.02){
            for(let yy=416;yy<=539;yy+=13)s+=line([[xx,yy,h],[xx,yy,h+8*t]],'#9aa79d',1.3);
            s+=line([[xx,414,h+8*t],[xx,540,h+8*t]],'#85968a',1.8);
          }
        });
        return s;
      }
      out+=bridge(630,60);
      out+=bridge(1135,50);
      // Low planters and a paved approach to the destination entrance.
      out+=rect(793,775,44,48,.8,'#f3f3eb');
      out+=rect(721,792,61,17,1,'#cfddc8');
      out+=rect(849,792,58,17,1,'#cfddc8');
      out+=line([[720,850,1.5],[815,850,1.5],[815,782,1.5]],'#fff',10);
      out+=line([[720,850,1.7],[815,850,1.7],[815,782,1.7]],palette.accent,5);
      // Building shadows stretch across the ground as heights emerge.
      buildings.forEach(b=>{
        const h=b.h*t;
        out+=poly([[b.x,b.y+b.d,1],[b.x+b.w,b.y+b.d,1],[b.x+b.w+h*.34,b.y+b.d+h*.23,1],[b.x+h*.34,b.y+b.d+h*.23,1]],'#53665a',`opacity="${(.08+.07*t).toFixed(3)}"`);
      });
      function building(b) {
        const x=b.x,y=b.y,w=b.w,d=b.d,h=b.h*t;
        const top=b.destination?'#c8ceca':(b.id%3===0?'#d0d0d0':b.id%3===1?'#c9ccca':'#d4d4d2');
        const west=b.destination?'#8ba795':'#b4bbb4';
        const south=b.destination?'#a1baa8':'#c4c8bf';
        let s='';
        if(t>.001){
          s+=poly([[x,y,0],[x,y+d,0],[x,y+d,h],[x,y,h]],west);
          s+=poly([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],south);
          // Recessed windows on the two visible elevations.
          if(t>.045){
            const floorCount=Math.max(1,Math.floor(b.h/22));
            const cols=Math.max(2,Math.floor(w/24));
            const westCols=Math.max(1,Math.floor(d/30));
            const op=Math.min(1,t*2).toFixed(2);
            for(let r=0;r<floorCount;r++){
              const zz=(10+r*21)*t, zh=Math.min(11,b.h-10-r*21)*t;
              if(zh<=0)continue;
              for(let c=0;c<cols;c++){
                const xx=x+12+c*(w-22)/cols;
                s+=poly([[xx,y+d+.2,zz],[xx+9,y+d+.2,zz],[xx+9,y+d+.2,zz+zh],[xx,y+d+.2,zz+zh]],b.destination?'#708f7f':'#9ba8a0',`opacity="${op}"`);
              }
              for(let c=0;c<westCols;c++){
                const yy=y+12+c*(d-20)/westCols;
                s+=poly([[x-.2,yy,zz],[x-.2,yy+10,zz],[x-.2,yy+10,zz+zh],[x-.2,yy,zz+zh]],b.destination?'#607f70':'#8b9b92',`opacity="${op}"`);
              }
            }
          }
        }
        s+=rect(x,y,w,d,h,top,'stroke="#b9c0b7" stroke-width=".8"');
        s+=rect(x+5,y+5,w-10,d-10,h+.3,'none','stroke="#e6e8df" stroke-width="1"');
        if(w>70&&d>60){
          s+=rect(x+w*.52,y+d*.29,w*.24,d*.3,h+.6,b.destination?'#a8bbaa':'#c1c7bd');
          s+=rect(x+w*.54,y+d*.31,w*.2,d*.26,h+3*t+.7,b.destination?'#c6d5c6':'#dde0d7');
          s+=rect(x+15,y+15,15,10,h+.8,'#b4beb1');
          s+=line([[x+18,y+17,h+1],[x+18,y+23,h+1],[x+22,y+23,h+1],[x+22,y+17,h+1]],'#a0ad9e',1);
        }
        if(b.destination){
          // The south-facing green door and projecting entrance canopy.
          s+=poly([[803,y+d+.7,.8],[827,y+d+.7,.8],[827,y+d+.7,27*t+.8],[803,y+d+.7,27*t+.8]],'#176b4e');
          if(t>.02){
            s+=line([[815,y+d+1,1],[815,y+d+1,25*t]],'#b4d3be',1.5);
            s+=rect(796,y+d-1,38,14,29*t,'#e1eadc');
            s+=poly([[796,y+d+13,26*t],[834,y+d+13,26*t],[834,y+d+13,29*t],[796,y+d+13,29*t]],'#73917c');
          }
          s+=rect(801,y+d+1,28,8,1.2,'#278663');
        }
        return s;
      }
      function tree(tr) {
        const [x,y,r]=tr;
        const q=p(x,y,18*t);
        const ground=p(x+5,y+5,0);
        let s=`<ellipse cx="${ground[0].toFixed(2)}" cy="${ground[1].toFixed(2)}" rx="${(r*.8*scale).toFixed(2)}" ry="${(r*.5*scale*cp).toFixed(2)}" fill="#759383" opacity=".16"/>`;
        if(t>.01)s+=line([[x,y,0],[x,y,19*t]],'#a2ae94',3);
        s+=`<ellipse cx="${q[0].toFixed(2)}" cy="${q[1].toFixed(2)}" rx="${(r*scale).toFixed(2)}" ry="${(r*scale*(1-.15*t)).toFixed(2)}" fill="#acb9a5" stroke="#88ab90" stroke-width=".6"/>`;
        s+=`<ellipse cx="${(q[0]-r*.2*scale).toFixed(2)}" cy="${(q[1]-r*.2*scale).toFixed(2)}" rx="${(r*.65*scale).toFixed(2)}" ry="${(r*.6*scale).toFixed(2)}" fill="#bac6b3" opacity=".6"/>`;
        return s;
      }
      const objects=buildings.map(b=>({depth:(b.x+b.w/2-600)*sa+(b.y+b.d-525)*ca, render:()=>building(b)}));
      trees.forEach(tr=>objects.push({depth:(tr[0]-600)*sa+(tr[1]-525)*ca,render:()=>tree(tr)}));
      objects.sort((a,b)=>a.depth-b.depth).forEach(o=>{out+=o.render();});
      // A small customer pickup vehicle on the road.
      out+=rect(705,839,33,19,2,'#183c30');
      out+=rect(712,841,18,15,7*t+2,'#2f4e42','stroke="#fff" stroke-width="1.5"');
      out+=rect(713,843,5,11,8*t+2,'#b6d2cb');
      out+=rect(725,843,4,11,8*t+2,'#b6d2cb');
      // Screen-facing map labels remain readable throughout the transition.
      out+=label(490,215,'W LAKE ST',{size:9,tracking:1.5});
      out+=label(810,360,'W FULTON ST',{size:9,tracking:1.2,dy:4});
      out+=label(364,486,'RIVER NORTH',{fill:'#698c97',size:11,tracking:2.6});
      out+=label(444,605,'W KINZIE ST',{size:9,dy:4});
      out+=label(243,851,'RIVERSIDE DRIVE',{size:9,dy:3});
      out+=label(167,749,'RIVERWALK PARK',{fill:'#718971',size:9,tracking:1.25});
      out+=label(808,949,'PICKUP GREEN',{fill:'#7a8e76',size:8,tracking:1.15});
      // A compact entrance callout is anchored to the exact door location.
      const entry=p(815,786,2);
      const ex=entry[0],ey=entry[1];
      out+=`<circle cx="${ex.toFixed(2)}" cy="${ey.toFixed(2)}" r="10" fill="#fff" opacity=".96"/><circle cx="${ex.toFixed(2)}" cy="${ey.toFixed(2)}" r="6.5" fill="#128159"/><circle cx="${ex.toFixed(2)}" cy="${ey.toFixed(2)}" r="2" fill="#d5f5df"/>`;
      out+=`<g transform="translate(${(ex+21).toFixed(2)} ${(ey-14).toFixed(2)})" filter="url(#map-pill-shadow)"><rect x="0" y="0" width="105" height="30" rx="15" fill="#fff"/><circle cx="17" cy="15" r="4" fill="#128159"/><text x="29" y="19" font-size="10" font-weight="750" letter-spacing="1" font-family="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fill="#28503b">ENTRANCE</text></g>`;
      return out;
    }

    function renderStreet() {
      const box=svg.getBoundingClientRect();
      const aspect=box.height>0?box.width/box.height:1.25;
      const eye=[685,870,8], target=[815,775,23];
      const forward=target.map((v,i)=>v-eye[i]);
      const length=Math.hypot(...forward);
      forward.forEach((v,i)=>forward[i]=v/length);
      const horizontal=Math.hypot(forward[0],forward[1]);
      const right=[-forward[1]/horizontal,forward[0]/horizontal,0];
      const up=[-forward[2]*right[1],forward[2]*right[0],forward[0]*right[1]-forward[1]*right[0]];
      const focal=490*zoom*Math.max(.86,Math.min(1,aspect/.85));
      const cx=500,cy=375,near=3;
      const camera=p=>{const q=p.map((v,i)=>v-eye[i]);return [q.reduce((s,v,i)=>s+v*right[i],0),q.reduce((s,v,i)=>s+v*up[i],0),q.reduce((s,v,i)=>s+v*forward[i],0)];};
      const project=p=>[cx+focal*p[0]/p[2],cy-focal*p[1]/p[2]];
      function clip(vertices,plane){
        if(!vertices.length)return [];
        const result=[];
        for(let i=0;i<vertices.length;i++){
          const a=vertices[i],b=vertices[(i+1)%vertices.length];
          const da=plane(a),db=plane(b);
          if(da>=0)result.push(a);
          if((da>=0)!==(db>=0)){
            const t=da/(da-db);
            result.push(a.map((v,k)=>v+(b[k]-v)*t));
          }
        }
        return result;
      }
      const planes=[
        p=>p[2]-near,
        p=>p[0]+600/focal*p[2],p=>600/focal*p[2]-p[0],
        p=>p[1]+525/focal*p[2],p=>475/focal*p[2]-p[1]
      ];
      function polygon(points,fill,attrs=''){
        let vertices=points.map(camera);
        for(const plane of planes)vertices=clip(vertices,plane);
        if(vertices.length<3)return '';
        return `<polygon points="${vertices.map(project).map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' ')}" fill="${fill}" ${attrs}/>`;
      }
      const scene=[];
      function add(points,fill,attrs='',decorations=[]){
        const html=polygon(points,fill,attrs)+decorations.map(d=>polygon(d.points,d.fill,d.attrs||'')).join('');
        if(!html)return;
        const depth=points.reduce((sum,p)=>sum+camera(p)[2],0)/points.length;
        scene.push({depth,html});
      }
      const quad=(x,y,w,d,z)=>[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]];
      const wall=(x,y,w,z,h)=>[[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]];
      function solid(x,y,z,w,d,h,colors={}){
        const front=colors.front||'#c4c7c8',side=colors.side||'#afb4b6',top=colors.top||'#d5d8d9';
        if(eye[1]>y+d)add(wall(x,y+d,w,z,h),front);
        if(eye[1]<y)add(wall(x,y,w,z,h),side);
        if(eye[0]<x)add([[x,y,z],[x,y+d,z],[x,y+d,z+h],[x,y,z+h]],side);
        if(eye[0]>x+w)add([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],side);
        if(eye[2]>z+h)add(quad(x,y,w,d,z+h),top);
        if(eye[2]<z)add(quad(x,y,w,d,z),colors.bottom||'#5e6464');
      }
      // Split the ground at every street edge and into small depth-sortable tiles.
      const xs=new Set([-300,1400]),ys=new Set([-400,970]);
      for(let x=-300;x<=1400;x+=60)xs.add(x);
      for(let y=-400;y<=970;y+=45)ys.add(y);
      [140,400,660,960,1160].forEach(x=>[-30,-27,27,30].forEach(d=>xs.add(x+d)));
      [210,360,600,850].forEach(y=>[-30,-27,27,30].forEach(d=>ys.add(y+d)));
      [425,431,534,540,553,631,775,792,809,816].forEach(y=>ys.add(y));
      [362,697,721,782,793,837,849,907,929].forEach(x=>xs.add(x));
      const xlist=[...xs].sort((a,b)=>a-b),ylist=[...ys].sort((a,b)=>a-b);
      function groundColor(x,y){
        if(y>=425&&y<=540)return y>431&&y<534?'#b9cbd3':'#abbfc7';
        const road=[140,400,660,960,1160].some(a=>Math.abs(a-x)<27)||[210,360,600,850].some(a=>Math.abs(a-y)<27);
        const curb=[140,400,660,960,1160].some(a=>Math.abs(a-x)<30)||[210,360,600,850].some(a=>Math.abs(a-y)<30);
        if(road)return '#f7f7f6';
        if(curb)return '#bfc1c0';
        if(x<362&&y>631&&y<816)return '#cdd4cb';
        if(y>540&&y<553)return '#e9e9e6';
        if(x>697&&x<929&&y>775&&y<816)return '#d8dad7';
        return '#dddfdd';
      }
      for(let i=0;i<xlist.length-1;i++)for(let j=0;j<ylist.length-1;j++){
        const x=xlist[i],y=ylist[j],w=xlist[i+1]-x,d=ylist[j+1]-y;
        const color=groundColor(x+w/2,y+d/2);
        const center=camera([x+w/2,y+d/2,0]);
        if(center[2]<-80)continue;
        add(quad(x,y,w,d,0),color,`stroke="${color}" stroke-width=".65"`);
      }
      // Painted street centerline. Each dash has its own depth ordering.
      for(let x=570;x<=1320;x+=28)add(quad(x,849,13,1.2,.09),'#c8cbc8');
      for(let k=-20;k<=20;k+=8){
        add(quad(925,830+k,14,4,.1),'#fff');
        add(quad(979,830+k,14,4,.1),'#fff');
      }
      // A low curb and the actual sidewalk up to the front door.
      for(let x=695;x<928;x+=25)solid(x,815,0,Math.min(25,928-x),2.2,.8,{front:'#adb2af',top:'#eeeeeb'});
      // The approach is a restrained gray path with a short green guidance strip.
      for(let y=777;y<815;y+=8){
        add(quad(795,y,40,8,.85),'#ebece7','stroke="#d4d7d2" stroke-width=".7"');
        add(quad(813.5,y,3,6,.9),'#138759');
      }
      // Buildings are split into facade bays/floors. Window details stay with
      // their wall tile, so a farther road tile can never paint over a facade.
      buildings.forEach(b=>{
        const height=b.destination?118:b.h;
        const frontColor=b.destination?'#d0d2d0':(b.id%2?'#c8cdce':'#d4d7d6');
        const sideColor=b.destination?'#b0b7b5':'#b5bdbf';
        const span=26,floor=22;
        if(eye[1]>b.y+b.d){
          for(let x=b.x;x<b.x+b.w;x+=span)for(let z=0;z<height;z+=floor){
            const w=Math.min(span,b.x+b.w-x),h=Math.min(floor,height-z);
            const decorations=[];
            const isEntrance=b.destination&&x<832&&x+w>798&&z<28;
            if(w>12&&h>12&&!isEntrance){
              const wx=x+4,ww=w-8,wz=z+4,wh=h-8;
              decorations.push({points:wall(wx,b.y+b.d+.08,ww,wz,wh),fill:b.destination?'#a1afb1':'#9eabad'});
              decorations.push({points:wall(wx+1,b.y+b.d+.12,Math.max(1,ww*.43),wz+1,Math.max(1,wh-2)),fill:'#b6c3c5'});
              decorations.push({points:wall(wx+ww*.49,b.y+b.d+.16,.5,wz,wh),fill:'#d6dcdb'});
              decorations.push({points:wall(wx,b.y+b.d+.2,ww,wz-.4,.6),fill:'#f1f2ee'});
            }
            if(z>0)decorations.push({points:wall(x,b.y+b.d+.1,w,z,.6),fill:'#e6e8e4'});
            add(wall(x,b.y+b.d,w,z,h),frontColor,'',decorations);
          }
        }
        if(eye[0]<b.x){
          for(let y=b.y;y<b.y+b.d;y+=span)for(let z=0;z<height;z+=floor){
            const d=Math.min(span,b.y+b.d-y),h=Math.min(floor,height-z),decorations=[];
            if(d>12&&h>12)decorations.push({points:[[b.x-.08,y+5,z+4],[b.x-.08,y+d-5,z+4],[b.x-.08,y+d-5,z+h-4],[b.x-.08,y+5,z+h-4]],fill:'#8f9fa2'});
            add([[b.x,y,z],[b.x,y+d,z],[b.x,y+d,z+h],[b.x,y,z+h]],sideColor,'',decorations);
          }
        }
        if(eye[0]>b.x+b.w)add([[b.x+b.w,b.y,0],[b.x+b.w,b.y+b.d,0],[b.x+b.w,b.y+b.d,height],[b.x+b.w,b.y,height]],sideColor);
        if(eye[1]<b.y)add(wall(b.x,b.y,b.w,0,height),sideColor);
        if(eye[2]>height)add(quad(b.x,b.y,b.w,b.d,height),'#e1e3e0');
      });
      // Recessed double doors, a projecting canopy, and two short planter boxes.
      add(wall(799,775.35,32,0,29),'#484f4d');
      add(wall(802,775.55,26,1,25),'#568276');
      add(wall(803,775.7,11.5,2,22),'#62887e');
      add(wall(815.5,775.7,11.5,2,22),'#476b61');
      add(wall(814.3,775.9,1.4,1,25),'#d2ddd5');
      add(wall(812.1,776.1,.6,9,6),'#e9eee9');
      add(wall(817.3,776.1,.6,9,6),'#e9eee9');
      solid(794,774.5,28,42,17,2.8,{front:'#404c47',side:'#6f7e75',top:'#d9dfd8',bottom:'#899b8e'});
      solid(749,790,.8,33,11,7,{front:'#b2b6af',side:'#9da69d',top:'#748b76'});
      solid(849,790,.8,33,11,7,{front:'#b2b6af',side:'#9da69d',top:'#748b76'});
      // Bridge geometry remains present beyond the neighborhood, when visible.
      solid(630,414,16,60,126,6,{front:'#acb4b4',side:'#9ba7a9',top:'#e6e9e6'});
      [632,686].forEach(x=>solid(x,414,22,2,126,5,{front:'#9faeac',side:'#899b99',top:'#bdc7c1'}));
      // Slender bollards give a useful scale cue at the entrance.
      [788,842].forEach(x=>solid(x,807,.8,2.3,2.3,7,{front:'#5e6963',side:'#4f5c55',top:'#87948b'}));
      scene.sort((a,b)=>b.depth-a.depth);
      let out='<defs><linearGradient id="street-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7eef3"/><stop offset="1" stop-color="#f7f8f7"/></linearGradient><filter id="street-label-shadow" x="-30%" y="-40%" width="160%" height="190%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#24312b" flood-opacity=".17"/></filter></defs>';
      out+='<rect width="1000" height="800" fill="url(#street-sky)"/><rect y="430" width="1000" height="370" fill="#dbdedb"/>';
      out+=scene.map(s=>s.html).join('');
      const entry=project(camera([815,776,14]));
      const marker=project(camera([815,776,34]));
      const mx=Math.max(340,Math.min(660,marker[0])),my=Math.max(180,Math.min(390,marker[1]-31));
      out+=`<path d="M${mx.toFixed(2)} ${(my+58).toFixed(2)} L${entry[0].toFixed(2)} ${(entry[1]-6).toFixed(2)}" stroke="#fff" stroke-width="5"/><path d="M${mx.toFixed(2)} ${(my+58).toFixed(2)} L${entry[0].toFixed(2)} ${(entry[1]-6).toFixed(2)}" stroke="#138759" stroke-width="2"/>`;
      out+=`<circle cx="${entry[0].toFixed(2)}" cy="${entry[1].toFixed(2)}" r="8" fill="#11875a" stroke="#fff" stroke-width="3"/>`;
      out+=`<g transform="translate(${(mx-112).toFixed(2)} ${my.toFixed(2)})" filter="url(#street-label-shadow)"><rect width="224" height="60" rx="15" fill="#fff"/><rect x="13" y="13" width="34" height="34" rx="11" fill="#e7f2e9"/><path d="M26 35V23h10v12M29 35v-8h4v8" fill="none" stroke="#14845a" stroke-width="1.8" stroke-linejoin="round"/><text x="60" y="26" fill="#18261f" font-family="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-weight="700" font-size="16">River House</text><text x="60" y="44" fill="#5a6b61" font-family="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="12">Main entrance</text></g>`;
      return out;
    }

    let cachedSignature='',flatMarkup='',streetMarkup='',flatGroup=null,streetGroup=null;
    function render(t){
      const box=svg.getBoundingClientRect();
      const signature=`${Math.round(box.width)}:${Math.round(box.height)}:${zoom}`;
      if(signature!==cachedSignature){
        cachedSignature=signature;
        flatMarkup=renderFlat();
        streetMarkup=renderStreet();
        svg.innerHTML=`<g data-map-layer="flat">${flatMarkup}</g><g data-map-layer="street">${streetMarkup}</g>`;
        flatGroup=svg.querySelector('[data-map-layer="flat"]');
        streetGroup=svg.querySelector('[data-map-layer="street"]');
      }
      if(flatGroup)flatGroup.setAttribute('opacity',(1-t).toFixed(4));
      if(streetGroup)streetGroup.setAttribute('opacity',t.toFixed(4));
    }

    function set3D(enabled) {
      target3D=Boolean(enabled);
      svg.setAttribute('aria-label', target3D ? 'Street-level 3D view from the driver’s perspective, facing River House. A green marker identifies the main entrance under a projecting canopy.' : 'A two-dimensional neighborhood map with a route from a car to the entrance of River House.');
      if(frame)cancelAnimationFrame(frame);
      const from=amount, to=target3D?1:0;
      if(reducedMotion){amount=to;render(amount);return;}
      const start=performance.now();
      function step(now){
        const progress=Math.min(1,(now-start)/600);
        const ease=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;
        amount=from+(to-from)*ease;
        render(amount);
        frame=progress<1?requestAnimationFrame(step):0;
      }
      frame=requestAnimationFrame(step);
    }
    function zoomIn(){zoom=Math.min(1.5,zoom+.15);render(amount);}
    function zoomOut(){zoom=Math.max(.7,zoom-.15);render(amount);}
    function reset(){zoom=1;render(amount);}
    render(0);
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => render(amount));
      resizeObserver.observe(svg);
    }
    return {set3D, zoomIn, zoomOut, reset};
  };
})();
