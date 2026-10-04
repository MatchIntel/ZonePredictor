export function construct(zone, angle) {
  if (!zone || ![zone.x, zone.y, zone.r, angle].every(Number.isFinite) || zone.r <= 0) throw new Error('Enter a valid zone circle and direction.');
  const a = angle * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
  const ocean = {x: zone.x + dx * zone.r / 4, y: zone.y + dy * zone.r / 4};
  const inland = {x: zone.x - dx * zone.r / 4, y: zone.y - dy * zone.r / 4};
  return {ocean, inland, prediction: {...ocean, r: zone.r / 2}, endpoints: [{x:zone.x-dx*zone.r,y:zone.y-dy*zone.r},{x:zone.x+dx*zone.r,y:zone.y+dy*zone.r}], perpendicular:{x:-dy,y:dx}};
}
