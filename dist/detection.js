// Pure image analysis. No service, network call, or API key is involved.
function circleThrough(a,b,c){const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<.001)return null;const aa=a.x*a.x+a.y*a.y,bb=b.x*b.x+b.y*b.y,cc=c.x*c.x+c.y*c.y;const x=(aa*(b.y-c.y)+bb*(c.y-a.y)+cc*(a.y-b.y))/d,y=(aa*(c.x-b.x)+bb*(a.x-c.x)+cc*(b.x-a.x))/d;return{x,y,r:Math.hypot(x-a.x,y-a.y)}}
export function detectCircle({data,width,height}){
  const mask=new Uint8Array(width*height),points=[];
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const p=(y*width+x)*4,r=data[p],g=data[p+1],b=data[p+2];if(r>185&&g>185&&b>185&&Math.max(r,g,b)-Math.min(r,g,b)<38){mask[y*width+x]=1;points.push({x,y});}}
  if(points.length<50)throw new Error('No clear white boundary found. Set the circle with the map handles.');
  // Seeded RANSAC fits circles through bright neutral pixels, then scores full perimeter coverage.
  let seed=7319;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const samples=points.length>5000?Array.from({length:5000},()=>points[Math.floor(random()*points.length)]):points;
  const dirs=Array.from({length:144},(_,i)=>({x:Math.cos(i*Math.PI/72),y:Math.sin(i*Math.PI/72)}));
  const hit=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<2||x>=width-2||y<2||y>=height-2)return 0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(mask[(y+dy)*width+x+dx])return 1;return 0};
  const score=c=>{let total=0,valid=0;const bins=Array(12).fill(0);for(let i=0;i<dirs.length;i++){const x=c.x+dirs[i].x*c.r,y=c.y+dirs[i].y*c.r;if(x>=2&&x<width-2&&y>=2&&y<height-2){valid++;const h=hit(x,y);total+=h;bins[Math.floor(i/12)]+=h;}}if(valid<100)return 0;const coverage=bins.filter(v=>v>=4).length/12;return total/valid*(.6+.4*coverage)};
  let best=null,bestScore=0;const size=Math.min(width,height);
  for(let i=0;i<3600;i++){const a=samples[Math.floor(random()*samples.length)],b=samples[Math.floor(random()*samples.length)],c=samples[Math.floor(random()*samples.length)];const candidate=circleThrough(a,b,c);if(!candidate||candidate.r<size*.17||candidate.r>size*.52||candidate.x<width*.08||candidate.x>width*.92||candidate.y<height*.08||candidate.y>height*.92)continue;const s=score(candidate);if(s>bestScore){best=candidate;bestScore=s;}}
  if(!best||bestScore<.52)throw new Error('Boundary is unclear. Adjust the white circle manually.');
  for(const step of [2,1,.5])for(let pass=0;pass<2;pass++){let next=best;for(const axis of ['x','y','r'])for(const sign of [-1,1]){const c={...best,[axis]:best[axis]+sign*step},s=score(c);if(s>bestScore){next=c;bestScore=s;}}best=next;}
  return {...best,score:bestScore};
}
export function detectOcean({data,width,height},zone){
  const water=new Uint8Array(width*height),ocean=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(y*width+x)*4,r=data[p],g=data[p+1],b=data[p+2];if(b>85&&b>r*1.35&&g>r*1.2&&g/b>.28&&g/b<1.05)water[y*width+x]=1;}
  // Broad water regions survive a density filter; narrow rivers do not.
  const integral=new Int32Array((width+1)*(height+1)),stride=width+1;
  for(let y=1;y<=height;y++){let row=0;for(let x=1;x<=width;x++){row+=water[(y-1)*width+x-1];integral[y*stride+x]=integral[(y-1)*stride+x]+row;}}
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const k=y*width+x;if(!water[k])continue;const x0=Math.max(0,x-7),x1=Math.min(width,x+8),y0=Math.max(0,y-7),y1=Math.min(height,y+8);const density=(integral[y1*stride+x1]-integral[y0*stride+x1]-integral[y1*stride+x0]+integral[y0*stride+x0])/((x1-x0)*(y1-y0));if(density<.67){water[k]=0;continue;}if(Math.hypot(x-zone.x,y-zone.y)>zone.r*1.05){ocean[k]=1;queue[tail++]=k;}}
  // Retain water connected to the outside of the zone: this excludes enclosed lakes.
  while(head<tail){const k=queue[head++],x=k%width,y=Math.floor(k/width);for(const n of [x>0?k-1:-1,x<width-1?k+1:-1,y>0?k-width:-1,y<height-1?k+width:-1])if(n>=0&&water[n]&&!ocean[n]){ocean[n]=1;queue[tail++]=n;}}
  const bins=Array(32).fill(0);let count=0;
  for(let y=0;y<height;y+=2)for(let x=0;x<width;x+=2){if(!ocean[y*width+x])continue;const dx=x-zone.x,dy=y-zone.y,d=Math.hypot(dx,dy)/zone.r;if(d<.2||d>1.4)continue;const a=(Math.atan2(dy,dx)+2*Math.PI)%(2*Math.PI),bin=Math.floor(a/(2*Math.PI)*32);bins[bin]+=Math.exp(-8*d);count++;}
  if(count<30)throw new Error('Ocean colors are unclear. Choose the ocean direction yourself.');
  let best=-1,bestAngle=0;for(let i=0;i<32;i++){let sum=0;for(let j=-3;j<=3;j++){const k=(i+j+32)%32;sum+=bins[k]*(4-Math.abs(j));}if(sum>best){best=sum;bestAngle=(i+.5)*360/32;}}
  return {angle:Math.round(bestAngle)%360,score:best};
}
