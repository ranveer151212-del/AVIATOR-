export function summarizeHistory(values) {
  const a = values.map(Number).filter(n => Number.isFinite(n) && n >= 1).slice(-200);
  if (!a.length) return {count:0,mean:null,median:null,below2:null,atLeast2:null,latest:null};
  const s = [...a].sort((x,y)=>x-y);
  const median = s.length%2 ? s[Math.floor(s.length/2)] : (s[s.length/2-1]+s[s.length/2])/2;
  return {
    count:a.length, mean:a.reduce((x,y)=>x+y,0)/a.length, median,
    below2:a.filter(n=>n<2).length/a.length*100,
    atLeast2:a.filter(n=>n>=2).length/a.length*100, latest:a[a.length-1]
  };
}
// Descriptive statistics only. This does not predict the next round.
export function parseMultipliers(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.results || payload?.data || [];
  return rows.map(x => Number(typeof x === "object" ? (x.multiplier ?? x.crashPoint ?? x.value) : x))
    .filter(n => Number.isFinite(n) && n >= 1).slice(-200);
}
