import {detectCircle,detectOcean,predictMap} from './detection.js';
self.onmessage=({data:request})=>{try{const result=request.action==='predict'?predictMap(request.image):request.action==='circle'?detectCircle(request.image):detectOcean(request.image,request.zone);self.postMessage({id:request.id,result});}catch(error){self.postMessage({id:request.id,error:error.message});}};
