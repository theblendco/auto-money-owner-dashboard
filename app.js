/* Auto Money · Owner's Dashboard (demo). Every number here is SAMPLE data, seeded so it stays the same on every load.
   Store names, addresses and phones are real (stores.js). Manager and customer names are sample placeholders. */
(function(){
  "use strict";

  /* =====================================================================
     1) SYSTEM PIECES: the six parts of the package each number ties back to.
     ===================================================================== */
  var PARTS = {
    1:{name:"Find new customers", short:"Daily lead list"},
    2:{name:"Answer every inquiry fast", short:"Instant replies"},
    3:{name:"Website + action button", short:"Button + photos"},
    4:{name:"The 10-step onboarding", short:"10-step flow"},
    5:{name:"Keep customers happy", short:"Reminders + reviews"},
    6:{name:"Easier to manage", short:"Dashboards"}
  };

  /* =====================================================================
     2) METRIC CONFIG: edit this one object to add, remove or swap metrics.
        key:    data field (see DAILY_FIELDS / computed below)
        label:  what the owner sees
        part:   which system piece drives it (PARTS above)
        fmt:    "n" count · "$" dollars · "%" percent · "min" minutes · "star" rating
        agg:    "sum" add up days · "last" point-in-time · "rate" computed ratio
        hero:   true = big number in the header row
        group:  card group below the scorecard
        note:   small tag shown next to the label
        better: "up" or "down" (for the change arrow)
     ===================================================================== */
  var METRICS = [
    // header row
    {key:"newLeads",    label:"New leads",            part:1, fmt:"n",  agg:"sum",  hero:true, better:"up"},
    {key:"funded",      label:"Loans funded",         part:4, fmt:"n",  agg:"sum",  hero:true, better:"up"},
    {key:"fundedVol",   label:"Funded volume",        part:4, fmt:"$",  agg:"sum",  hero:true, better:"up"},
    {key:"collected",   label:"Payments collected",   part:5, fmt:"$",  agg:"sum",  hero:true, better:"up"},
    {key:"collRate",    label:"Collection rate",      part:5, fmt:"%",  agg:"rate", hero:true, better:"up"},
    {key:"outstanding", label:"Portfolio outstanding",part:6, fmt:"$",  agg:"last", hero:true, better:"up"},

    // Bring them in (parts 1 to 3)
    {key:"delivered",   label:"Leads delivered to stores", part:1, fmt:"n", agg:"sum", group:"in", better:"up"},
    {key:"taps",        label:"\u201cGet cash today\u201d button taps", part:3, fmt:"n", agg:"sum", group:"in", better:"up"},
    {key:"replies",     label:"Instant replies sent",  part:2, fmt:"n", agg:"sum", group:"in", better:"up", sub:"followups", subLabel:"day-2 follow-ups"},
    {key:"textBacks",   label:"Missed-call text backs",part:2, fmt:"n", agg:"sum", group:"in", better:"up"},
    {key:"respMin",     label:"Avg lead response time",part:2, fmt:"min", agg:"rate", group:"in", better:"down"},
    {key:"photoEst",    label:"Photo estimates",       part:3, fmt:"n", agg:"sum", group:"in", better:"up"},

    // Convert (part 4)
    {key:"started",     label:"10-step: started",      part:4, fmt:"n", agg:"sum", group:"conv", better:"up"},
    {key:"signed",      label:"10-step: e-signed",     part:4, fmt:"n", agg:"sum", group:"conv", better:"up"},
    {key:"booked",      label:"10-step: visit booked", part:4, fmt:"n", agg:"sum", group:"conv", better:"up"},
    {key:"apps",        label:"Applications", part:4, fmt:"n", agg:"sum", group:"conv", better:"up"},
    {key:"avgLoan",     label:"Average loan",          part:4, fmt:"$", agg:"rate", group:"conv", better:"up"},
    {key:"repeatPct",   label:"Repeat customers",      part:5, fmt:"%", agg:"rate", group:"conv", better:"up", sub:"newCust", subLabel:"new"},

    // Collect (part 5)
    {key:"active",      label:"Active loans",          part:6, fmt:"n", agg:"last", group:"coll", better:"up"},
    {key:"reminders",   label:"Payment reminders sent",part:5, fmt:"n", agg:"sum", group:"coll", better:"up"},
    {key:"paidAfterRem",label:"Paid after a reminder", part:5, fmt:"%", agg:"rate", group:"coll", better:"up"},
    {key:"payNow",      label:"Pay-now link payments", part:5, fmt:"n", agg:"sum", group:"coll", better:"up", note:"if online pay is added"},
    {key:"pastDue",     label:"Past-due accounts",     part:5, fmt:"n", agg:"last", group:"coll", better:"down", buckets:true},
    {key:"repos",       label:"Repos / charge-offs",   part:6, fmt:"n", agg:"sum", group:"coll", better:"down"},

    // Keep them coming back (part 5)
    {key:"payoffs",     label:"Payoffs",               part:5, fmt:"n", agg:"sum", group:"keep", better:"up"},
    {key:"renewals",    label:"Renewals",              part:5, fmt:"n", agg:"sum", group:"keep", better:"up"},
    {key:"reviewReq",   label:"Review requests sent",  part:5, fmt:"n", agg:"sum", group:"keep", better:"up"},
    {key:"reviews",     label:"New Google reviews",    part:5, fmt:"n", agg:"sum", group:"keep", better:"up"},
    {key:"rating",      label:"Google rating (avg)",   part:5, fmt:"star", agg:"last", group:"keep", better:"up"},
    {key:"referrals",   label:"Referrals",             part:5, fmt:"n", agg:"sum", group:"keep", better:"up"}
  ];
  var GROUPS = [
    {id:"in",   title:"Bring them in",          parts:"Parts 1\u20133"},
    {id:"conv", title:"Turn them into loans",   parts:"Part 4"},
    {id:"coll", title:"Collect & protect",      parts:"Part 5"},
    {id:"keep", title:"Keep them coming back",  parts:"Part 5"}
  ];
  // Lead sources and loan-size buckets (edit freely)
  var SOURCES = [
    ["Website button", 3, .26], ["Daily lead list", 1, .17], ["Google", 3, .15], ["Missed-call text back", 2, .11],
    ["Instagram", 3, .08], ["Walk-in", 0, .10], ["Referral", 5, .06], ["Repeat customer", 5, .07]
  ];
  var SIZES = ["Under $500","$500\u2013999","$1,000\u20131,999","$2,000\u20134,999","$5,000+"];
  var CHECKLIST = [
    "Call every new lead within 15 minutes",
    "Review photo estimates before customers arrive",
    "Confirm tomorrow's booked visits",
    "Call today's past-due accounts",
    "Ask today's payoffs for a Google review",
    "Log promises to pay with a time",
    "Count and close the drawer"
  ];
  // Sample manager names (NOT real people)
  var MGRS = ["Tanya B.","Marcus L.","Renee C.","Derek W.","Alicia M.","Jamal P.","Kristen H.","Carlos D.","Monique S.","Brandon T.","Leslie G."];
  var FIRST = ["Tasha","Marcus","Angela","Derrick","Keisha","Robert","Latoya","James","Brenda","Kevin","Shawn","Monica","Andre","Crystal","Terrence","Denise","Tyrone","Jasmine","Curtis","Vanessa","Dwayne","April","Reggie","Tiffany","Willie","Erica"];
  var LASTI = "ABCDEFGHJKLMNPRSTW";
  var CARS = ["2014 Honda Accord","2016 Chevy Silverado","2012 Toyota Camry","2018 Nissan Altima","2011 Ford F-150","2015 Jeep Wrangler","2013 Dodge Ram","2017 Hyundai Elantra","2010 Chevy Tahoe","2019 Kia Optima","2008 Toyota Tacoma","2016 Ford Explorer","2012 Honda Civic","2015 GMC Sierra"];

  /* =====================================================================
     3) SAMPLE DATA ENGINE (seeded, plausible, consistent across views)
     ===================================================================== */
  function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function between(r, a, b){ return a + (b - a) * r(); }
  function pois(r, lam){ var L = Math.exp(-lam), k = 0, p = 1; do { k++; p *= r(); } while(p > L); return k - 1; }
  function rnd(x){ return Math.round(x); }

  var DAYS = 62; // history kept (trend lines show the last 30; month-to-date compares with the same days 4 weeks earlier)
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if(today.getDay() === 0) today.setDate(today.getDate() - 1); // stores are closed Sunday: show Saturday
  var simH = now.getHours() + now.getMinutes() / 60;
  if(now.getDay() === 0 || simH < 9.5 || simH > 18) simH = 15.75; // outside hours: show a 3:45 PM snapshot
  var dayFrac = Math.min(1, Math.max(.15, (simH - 9) / 9));
  var dates = []; for(var d = DAYS - 1; d >= 0; d--){ var x = new Date(today); x.setDate(today.getDate() - d); dates.push(x); }
  var mtdIdx = dates.map(function(dt, i){ return dt.getMonth() === today.getMonth() && dt.getFullYear() === today.getFullYear() ? i : -1; }).filter(function(i){ return i >= 0; });
  function bizDaysInMonth(){ var y = today.getFullYear(), m = today.getMonth(), n = 0, done = 0; for(var dd = 1; dd <= new Date(y, m + 1, 0).getDate(); dd++){ var w = new Date(y, m, dd).getDay(); if(w !== 0){ n++; if(dd < today.getDate()) done++; } } return {total:n, done:done + dayFrac}; }
  var BIZ = bizDaysInMonth();

  // Which stores get trouble (so alerts are always meaningful and stable)
  var TROUBLE = {pastDueUp:"Rivers Avenue", slowPace:"Moncks Corner", quiet:"McMillan", unanswered:{"Dorchester":3, "Summerville 2":1, "Ashley Phosphate":2}, star:"Summerville 1"};

  var STORES = window.AM_STORES.map(function(a, idx){
    var s = {id:idx, name:a[0], street:a[1], city:a[2], zip:a[3], phone:a[4], lat:a[5], lon:a[6]};
    s.label = s.name === "Savannah Highway" ? "Savannah Hwy (West Ashley)" : s.name;
    var r = rng(hash("am-" + s.name));
    s.r = r;
    s.size = s.name === TROUBLE.star ? 1.32 : between(r, .78, 1.25);
    s.mgr = MGRS[idx % MGRS.length];
    s.staff = 2 + (r() < .45 ? 1 : 0) + (s.size > 1.15 ? 1 : 0);
    s.avgLoan = between(r, 1150, 1650);
    s.avgPmt = between(r, 185, 265);
    s.active = rnd(between(r, 430, 560) * s.size);
    s.avgBal = between(r, 1280, 1620);
    s.collBase = s.name === TROUBLE.pastDueUp ? .855 : between(r, .885, .955);
    s.convBase = s.name === TROUBLE.slowPace ? .17 : between(r, .22, .31) * (s.name === TROUBLE.star ? 1.12 : 1);
    s.respBase = s.name === TROUBLE.quiet ? 27 : s.name === TROUBLE.slowPace ? 22 : between(r, 5, 16);
    s.rating = (s.name === TROUBLE.star ? 4.8 : between(r, 4.1, 4.75));
    s.ratingCount = rnd(between(r, 60, 240));
    s.pdBase = s.name === TROUBLE.pastDueUp ? .118 : between(r, .085, .13);
    s.daily = [];
    for(var i = 0; i < DAYS; i++){
      var wd = dates[i].getDay(), isToday = i === DAYS - 1;
      var m = (wd === 0 ? .25 : wd === 6 ? .7 : wd === 1 || wd === 5 ? 1.08 : 1) * (isToday ? dayFrac : 1) * (1 + .1 * Math.sin(i / 4 + idx)) * (1 + (i - DAYS) * .003); // gentle growth trend
      var o = {};
      o.delivered = wd === 0 ? 0 : rnd(between(r, 18, 28) * s.size * (isToday ? 1 : 1));
      o.taps = rnd(between(r, 22, 40) * s.size * m);
      o.textBacks = pois(r, 3.2 * s.size * m);
      o.newLeads = Math.max(0, rnd(o.taps * between(r, .3, .38) + o.textBacks * .7 + o.delivered * .12 * (isToday ? dayFrac : 1)));
      o.replies = o.newLeads + rnd(o.delivered * .9 * (isToday ? dayFrac : 1));
      o.followups = rnd(o.replies * between(r, .28, .4));
      o.photoEst = rnd(o.newLeads * between(r, .44, .58));
      o.started = rnd(o.newLeads * between(r, .62, .76));
      o.signed = rnd(o.started * between(r, .5, .62));
      o.apps = Math.min(o.photoEst, rnd(o.newLeads * between(r, .4, .47)));            // applications (signed online + started in store)
      o.signed = Math.min(o.signed, o.apps);
      o.booked = Math.min(o.apps, rnd(o.newLeads * between(r, .32, .39)));
      o.funded = Math.min(o.booked, rnd(o.newLeads * s.convBase * between(r, .85, 1.15)));
      o.fundedVol = rnd(o.funded * s.avgLoan * between(r, .82, 1.18) / 10) * 10;
      o.repeat = rnd(o.funded * between(r, .35, .55));
      o.newCust = o.funded - o.repeat;
      o.respSum = o.newLeads * s.respBase * between(r, .7, 1.3);
      o.due = wd === 0 ? 0 : rnd(s.active / 23 * between(r, .85, 1.15) * (isToday ? 1 : 1));
      var cr = Math.min(.99, s.collBase * between(r, .96, 1.04) - (s.name === TROUBLE.pastDueUp ? Math.max(0, i - DAYS + 30) * .0012 : 0));
      o.dueNow = isToday ? rnd(o.due * Math.min(1, dayFrac * 1.1)) : o.due; // due so far today
      o.paid = rnd(o.dueNow * cr);
      o.collected = rnd(o.paid * s.avgPmt * between(r, .9, 1.1));
      o.reminders = rnd(o.due * between(r, 1.7, 2.1));
      o.paidRem = rnd(o.paid * between(r, .58, .74));
      o.payNow = rnd(o.paid * between(r, .18, .3));
      o.repos = r() < .07 * s.size ? 1 : 0;
      o.payoffs = pois(r, 1.6 * s.size * m);
      o.renewals = pois(r, 1.3 * s.size * m);
      o.reviewReq = o.payoffs + rnd(o.funded * .6);
      o.reviews = Math.min(o.reviewReq, pois(r, o.reviewReq * .28));
      o.referrals = pois(r, .55 * s.size * m);
      var pd = s.pdBase + (s.name === TROUBLE.pastDueUp ? .015 + (i - DAYS) * .0016 : .004 * Math.sin(i / 6 + idx));
      o.active = s.active + rnd((i - DAYS) * between(r, .1, .5));
      o.pastDue = rnd(o.active * pd);
      o.outstanding = rnd(o.active * s.avgBal / 100) * 100;
      o.rating = Math.min(4.9, s.rating - .06 + i * .002 + .01 * Math.sin(i / 3));
      s.daily.push(o);
    }
    var t = s.daily[DAYS - 1];
    var b1 = between(r, .62, .7), b2 = between(r, .2, .26);
    t.pd1 = rnd(t.pastDue * b1); t.pd2 = rnd(t.pastDue * b2); t.pd3 = t.pastDue - t.pd1 - t.pd2;
    s.goal = rnd(s.avgLoan * 15.5 * s.size * s.convBase * 25 * between(r, 1.0, 1.1) * (s.name === TROUBLE.slowPace ? 1.3 : 1) / 1000) * 1000; // monthly funded-volume goal
    s.unanswered = TROUBLE.unanswered[s.name] || 0;
    s.lastAct = s.name === TROUBLE.quiet ? 134 : rnd(between(r, 2, 38));
    return s;
  });

  // aggregate helpers
  var range = "today";
  function idxs(){ return range === "today" ? [DAYS - 1] : mtdIdx; }
  function prevIdxs(){ // same-length comparison window
    if(range === "today"){ var j = DAYS - 8; return [j]; } // same weekday last week
    return mtdIdx.map(function(i){ return i - 28; }).filter(function(i){ return i >= 0; });
  }
  function sumF(stores, f, ix){ var t = 0; stores.forEach(function(s){ ix.forEach(function(i){ t += s.daily[i][f] || 0; }); }); return t; }
  function val(key, stores, ix){
    ix = ix || idxs(); stores = stores || STORES;
    var last = [ix[ix.length - 1]];
    switch(key){
      case "collRate": var due = sumF(stores, "dueNow", ix); return due ? sumF(stores, "paid", ix) / due : 0;
      case "respMin": var n = sumF(stores, "newLeads", ix); return n ? sumF(stores, "respSum", ix) / n : 0;
      case "avgLoan": var f = sumF(stores, "funded", ix); return f ? sumF(stores, "fundedVol", ix) / f : 0;
      case "repeatPct": var ff = sumF(stores, "funded", ix); return ff ? sumF(stores, "repeat", ix) / ff : 0;
      case "paidAfterRem": var p = sumF(stores, "paid", ix); return p ? sumF(stores, "paidRem", ix) / p : 0;
      case "rating": var w = 0, c = 0; stores.forEach(function(s){ w += s.daily[last[0]].rating * s.ratingCount; c += s.ratingCount; }); return w / c;
      case "active": case "pastDue": case "outstanding": return sumF(stores, key, last);
      default: return sumF(stores, key, ix);
    }
  }
  // 30-day trend (Sundays skipped; today's partial day is left off flow metrics so the line isn't misleading)
  function series(key, stores){ var m = METRICS.filter(function(x){ return x.key === key; })[0], partial = m && m.agg !== "last" && dayFrac < 1; var out = []; for(var i = DAYS - 30; i < DAYS - (partial ? 1 : 0); i++){ if(dates[i].getDay() === 0) continue; out.push(val(key, stores, [i])); } return out; }
  function storeStats(s){
    var ix = idxs(), one = [s];
    var leads = val("newLeads", one, ix), apps = val("apps", one, ix), funded = val("funded", one, ix);
    var mtdVol = val("fundedVol", one, mtdIdx), pace = mtdVol / (s.goal * BIZ.done / BIZ.total);
    var pdNow = s.daily[DAYS - 1].pastDue / s.daily[DAYS - 1].active, pdWk = s.daily[DAYS - 8].pastDue / s.daily[DAYS - 8].active;
    var st = {s:s, leads:leads, apps:apps, funded:funded, vol:val("fundedVol", one, ix), mtdVol:mtdVol, goalPct:mtdVol / s.goal, pace:pace,
      resp:val("respMin", one, ix), coll:val("collRate", one, ix), pd:pdNow, pdChange:pdNow - pdWk, lastAct:s.lastAct, unanswered:s.unanswered};
    var pts = 0, why = [];
    if(pace < .85){ pts -= 2; why.push("behind goal pace"); } else if(pace < .95){ pts -= 1; why.push("slightly behind pace"); }
    if(st.coll < .88){ pts -= 1; why.push("collections soft"); }
    if(pdNow > .14 || st.pdChange > .01){ pts -= 1; why.push("past-due rising"); }
    if(st.resp > 20){ pts -= 1; why.push("slow lead response"); }
    if(s.lastAct >= 120){ pts -= 2; why.push("no activity 2+ hrs"); }
    if(s.unanswered >= 2){ pts -= 1; why.push("leads waiting"); }
    st.status = pts >= 0 ? "ok" : pts >= -2 ? "watch" : "help";
    st.why = why;
    st.score = Math.round(Math.max(0, Math.min(100, 50 + (pace - 1) * 120 + (st.coll - .9) * 250 - (pdNow - .11) * 300 - Math.max(0, st.resp - 10) * 1.2 + pts * 4)));
    return st;
  }

  /* =====================================================================
     4) FORMATTING + tiny SVG helpers
     ===================================================================== */
  function fmt(v, f, compact){
    if(f === "$"){ if(compact !== false && v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M"; if(compact !== false && v >= 1e4) return "$" + (v / 1e3).toFixed(v >= 1e5 ? 0 : 1) + "K"; return "$" + Math.round(v).toLocaleString("en-US"); }
    if(f === "%") return (v * 100).toFixed(1) + "%";
    if(f === "min") return v.toFixed(1) + " min";
    if(f === "star") return v.toFixed(1) + " \u2605";
    return Math.round(v).toLocaleString("en-US");
  }
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function spark(arr, color, fill, w, h){
    w = w || 120; h = h || 34; var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr), rg = mx - mn || 1;
    var pts = arr.map(function(v, i){ return [(i / (arr.length - 1)) * w, h - 3 - ((v - mn) / rg) * (h - 6)]; });
    var d = pts.map(function(p, i){ return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
    var lp = pts[pts.length - 1];
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      (fill ? '<path d="' + d + 'L' + w + ' ' + h + 'L0 ' + h + 'Z" fill="' + fill + '"/>' : '') +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      '<circle cx="' + lp[0].toFixed(1) + '" cy="' + lp[1].toFixed(1) + '" r="2.6" fill="' + color + '"/></svg>';
  }
  function change(m){
    if(m.agg === "last"){ var a = val(m.key), b = val(m.key, STORES, [DAYS - 8]); return [a, b, "vs last week"]; }
    var cur = val(m.key), pi = prevIdxs(); if(!pi.length) return [cur, cur, ""];
    var prev = val(m.key, STORES, pi); if(range === "today" && m.agg === "sum") prev *= dayFrac; // same time last week
    if(range === "mtd" && m.agg === "sum") prev -= val(m.key, STORES, [pi[pi.length - 1]]) * (1 - dayFrac); // today is still in progress
    return [cur, prev, range === "today" ? "vs last " + dates[DAYS - 1].toLocaleDateString("en-US", {weekday:"short"}) : "vs last month"];
  }
  function delta(m){
    var c = change(m), a = c[0], b = c[1]; if(!b && b !== 0) return "";
    var diff, txt;
    if(m.fmt === "%" ){ diff = a - b; txt = (diff >= 0 ? "+" : "\u2212") + Math.abs(diff * 100).toFixed(1) + " pts"; }
    else if(m.fmt === "min" || m.fmt === "star"){ diff = a - b; txt = (diff >= 0 ? "+" : "\u2212") + Math.abs(diff).toFixed(1); }
    else { if(!b) return ""; diff = (a - b) / b; txt = (diff >= 0 ? "+" : "\u2212") + Math.abs(diff * 100).toFixed(0) + "%"; }
    if(txt.replace(/[^1-9]/g, "") === "") return '<b>\u2022 flat</b> ' + c[2];
    var good = m.better === "down" ? diff <= 0 : diff >= 0;
    return '<b class="' + (good ? "" : "dn") + '">' + (diff >= 0 ? "\u25B2 " : "\u25BC ") + txt + '</b> ' + c[2];
  }

  /* =====================================================================
     5) RENDER
     ===================================================================== */
  var $ = function(id){ return document.getElementById(id); };
  function renderHeader(){
    $("sub").textContent = "Charleston area \u00b7 " + STORES.length + " stores \u00b7 " + (range === "today" ? "Today" : "Month to date");
    var h = Math.floor(simH), mi = Math.round((simH - h) * 60); if(mi === 60){ h++; mi = 0; }
    var tm = ((h + 11) % 12 + 1) + ":" + String(mi).padStart(2, "0") + (h >= 12 ? " PM" : " AM");
    $("asof").textContent = today.toLocaleDateString("en-US", {weekday:"long", month:"short", day:"numeric"}) + " \u00b7 as of " + tm;
    $("hero").innerHTML = METRICS.filter(function(m){ return m.hero; }).map(function(m){
      return '<div class="hk"><span class="part" title="' + esc(PARTS[m.part].name) + '">P' + m.part + '</span><div class="l">' + esc(m.label) + '</div><div class="v num">' + fmt(val(m.key), m.fmt) + '</div><div class="d">' + delta(m) + '</div>' + spark(series(m.key), "#92c83e", "rgba(146,200,62,.16)") + '</div>';
    }).join("");
  }
  function renderGroups(){
    var tPD = STORES.reduce(function(a, s){ var t = s.daily[DAYS - 1]; a[0] += t.pd1; a[1] += t.pd2; a[2] += t.pd3; return a; }, [0, 0, 0]);
    var act = val("active");
    $("groups").innerHTML = GROUPS.map(function(g){
      return '<div class="card grp"><h3>' + esc(g.title) + ' <span>' + g.parts + '</span></h3>' + METRICS.filter(function(m){ return m.group === g.id; }).map(function(m){
        var v = val(m.key), extra = "";
        if(m.sub){ var sv = val(m.sub); extra = '<small>+ ' + fmt(sv, "n") + ' ' + m.subLabel + '</small>'; }
        if(m.key === "active") extra = '<small>' + fmt(val("outstanding"), "$") + ' out</small>';
        if(m.key === "pastDue") extra = '<small>' + (v / act * 100).toFixed(1) + '%</small>';
        var bk = m.buckets ? '<div class="buckets" title="1\u201330 days: ' + tPD[0] + ' \u00b7 31\u201360: ' + tPD[1] + ' \u00b7 60+: ' + tPD[2] + '"><i style="flex:' + tPD[0] + ';background:#ffd21f"></i><i style="flex:' + tPD[1] + ';background:#f08c2e"></i><i style="flex:' + tPD[2] + ';background:#d4483b"></i></div><div class="why">1\u201330: ' + tPD[0] + ' \u00b7 31\u201360: ' + tPD[1] + ' \u00b7 60+: ' + tPD[2] + '</div>' : '<div class="why">' + esc(PARTS[m.part].short) + '</div>';
        var col = m.better === "down" ? "#d4483b" : "#2b653c";
        return '<div class="mk"><div><div class="l">' + esc(m.label) + (m.note ? ' <em>' + esc(m.note) + '</em>' : '') + '</div><div class="v num">' + fmt(v, m.fmt) + extra + '</div>' + bk + '</div>' + spark(series(m.key), col, null, 84, 30) + '</div>';
      }).join("") + '</div>';
    }).join("");
  }

  var sortKey = "rank", sortDir = 1;
  var COLS = [
    ["rank","#"],["store","Store"],["mgr","Manager"],["staff","Staff"],["resp","Response"],["leads","Leads\u2192Apps\u2192Funded"],
    ["goal","Funded MTD vs goal"],["coll","Collected"],["pd","Past due"],["last","Last active"],["status","Status"]
  ];
  function renderScore(){
    var stats = STORES.map(storeStats).sort(function(a, b){ return b.score - a.score; });
    stats.forEach(function(st, i){ st.rank = i + 1; });
    var q = $("q").value.trim().toLowerCase(), sf = $("statusF").value;
    var rows = stats.filter(function(st){
      if(sf && st.status !== sf) return false;
      if(!q) return true;
      return (st.s.label + " " + st.s.city + " " + st.s.street + " " + st.s.mgr).toLowerCase().indexOf(q) >= 0;
    });
    var key = {rank:function(t){ return t.rank; }, store:function(t){ return t.s.label; }, mgr:function(t){ return t.s.mgr; }, staff:function(t){ return t.s.staff; }, resp:function(t){ return t.resp; },
      leads:function(t){ return t.funded; }, goal:function(t){ return t.goalPct; }, coll:function(t){ return t.coll; }, pd:function(t){ return t.pd; }, last:function(t){ return t.lastAct; }, status:function(t){ return {ok:0, watch:1, help:2}[t.status]; }}[sortKey];
    rows.sort(function(a, b){ var x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * sortDir; });
    function sbtn(c){ var on = c[0] === sortKey; return '<button type="button" data-sort="' + c[0] + '"' + (on ? ' aria-sort="' + (sortDir > 0 ? "ascending" : "descending") + '"' : '') + '>' + c[1] + ' <span class="ar">' + (on ? (sortDir > 0 ? "\u25B2" : "\u25BC") : "\u25B4\u25BE") + '</span></button>'; }
    $("score").querySelector("thead").innerHTML = "<tr>" + COLS.map(function(c, i){
      if(i === 1) return "";
      if(i === 0) return '<th class="sticky" colspan="2" style="left:0">' + sbtn(COLS[0]) + '<span style="display:inline-block;width:18px"></span>' + sbtn(COLS[1]) + '</th>';
      return '<th>' + sbtn(c) + '</th>';
    }).join("") + "</tr>";
    var lbl = {ok:"On track", watch:"Watch", help:"Needs help"};
    $("score").querySelector("tbody").innerHTML = rows.length ? rows.map(function(t){
      var gp = Math.min(1, t.goalPct), expect = BIZ.done / BIZ.total;
      var cls = t.pace < .85 ? "bad" : t.pace < .95 ? "low" : "";
      return '<tr data-id="' + t.s.id + '" tabindex="0">' +
        '<td class="sticky" colspan="2" style="left:0"><div class="cell"><span class="rk' + (t.rank === 1 ? ' t1' : '') + '">' + t.rank + '</span><span><span class="sn">' + esc(t.s.label) + '</span><span class="sc">' + esc(t.s.street + ", " + t.s.city) + '</span></span></div></td>' +
        '<td class="mgr">' + esc(t.s.mgr) + '<span class="tag">sample</span></td>' +
        '<td class="num">' + t.s.staff + '</td>' +
        '<td class="num' + (t.resp > 20 ? ' bad-t' : t.resp > 12 ? ' warn-t' : '') + '">' + t.resp.toFixed(1) + ' min' + (t.unanswered ? '<br><span class="sc bad-t">' + t.unanswered + ' waiting 15m+</span>' : '') + '</td>' +
        '<td class="conv num">' + t.leads + ' \u2192 ' + t.apps + ' \u2192 ' + t.funded + '<br><small>' + (t.leads ? Math.round(t.funded / t.leads * 100) : 0) + '% funded</small></td>' +
        '<td class="goal"><div class="gt"><b class="num">' + fmt(t.mtdVol, "$") + '</b><span class="sc num">of ' + fmt(t.s.goal, "$") + ' \u00b7 ' + Math.round(t.goalPct * 100) + '%</span></div><div class="gb" title="Marker = where they should be today"><i class="' + cls + '" style="width:' + (gp * 100).toFixed(1) + '%"></i><u style="left:' + (expect * 100).toFixed(1) + '%"></u></div></td>' +
        '<td class="num' + (t.coll < .88 ? ' bad-t' : '') + '">' + fmt(t.coll, "%") + '</td>' +
        '<td class="num' + (t.pdChange > .01 ? ' bad-t' : '') + '">' + fmt(t.pd, "%") + (t.pdChange > .005 ? ' <span class="sc bad-t">\u25B2' + (t.pdChange * 100).toFixed(1) + '</span>' : '') + '</td>' +
        '<td class="num' + (t.lastAct >= 120 ? ' bad-t' : '') + '">' + agoText(t.lastAct) + '</td>' +
        '<td><span class="pill ' + t.status + '">' + lbl[t.status] + '</span></td></tr>';
    }).join("") : '<tr><td colspan="11" style="text-align:center;color:#5d6b61;padding:24px">No stores match.</td></tr>';
    return stats;
  }
  function agoText(m){ return m >= 60 ? Math.floor(m / 60) + "h " + (m % 60) + "m ago" : m + " min ago"; }

  function renderAlerts(stats){
    var A = [];
    stats.forEach(function(t){
      if(t.unanswered) A.push({lv:t.unanswered >= 2 ? "hi" : "md", ic:"!", t:t.unanswered + " lead" + (t.unanswered > 1 ? "s" : "") + " unanswered 15+ min", d:t.s.label + " \u00b7 instant reply went out; no staff call yet", g:"Part 2", id:t.s.id, w:t.unanswered * 10});
      if(t.lastAct >= 120) A.push({lv:"hi", ic:"\u23F1", t:"No manager activity in " + Math.floor(t.lastAct / 60) + " hr " + (t.lastAct % 60) + " min", d:t.s.label + " \u00b7 " + t.s.mgr + " (sample)", g:"Part 6", id:t.s.id, w:30});
      if(t.pdChange > .01) A.push({lv:"hi", ic:"\u2197", t:"Past due rising at " + t.s.label, d:"Up " + (t.pdChange * 100).toFixed(1) + " pts this week to " + fmt(t.pd, "%") + " of active loans", g:"Part 5", id:t.s.id, w:25});
      if(t.pace < .9) A.push({lv:"md", ic:"\u25BC", t:t.s.label + " below pace on monthly goal", d:Math.round(t.goalPct * 100) + "% of goal with " + Math.round(BIZ.done / BIZ.total * 100) + "% of the month gone", g:"Part 4", id:t.s.id, w:20});
      if(t.resp > 20 && !t.unanswered) A.push({lv:"md", ic:"\u231B", t:"Slow lead response at " + t.s.label, d:"Averaging " + t.resp.toFixed(0) + " min to first staff call (goal: 15)", g:"Part 2", id:t.s.id, w:12});
    });
    var best = stats.filter(function(t){ return t.status === "ok"; })[0] || stats[0]; A.push({lv:"gd", ic:"\u2605", t:best.s.label + " is the top store on track", d:Math.round(best.goalPct * 100) + "% of monthly goal \u00b7 " + fmt(best.coll, "%") + " collected", g:"Win", id:best.s.id, w:0});
    A.sort(function(a, b){ return b.w - a.w; });
    A = A.filter(function(a){ return a.lv !== "gd"; }).slice(0, 6).concat(A.filter(function(a){ return a.lv === "gd"; }));
    var cnt = {ok:0, watch:0, help:0}; stats.forEach(function(t){ cnt[t.status]++; });
    $("statusSum").innerHTML = [["ok","On track"],["watch","Watch"],["help","Needs help"]].map(function(x){ return '<button type="button" data-f="' + x[0] + '"><b class="num">' + cnt[x[0]] + '</b><span><i class="dot ' + x[0] + '"></i>' + x[1] + '</span></button>'; }).join("");
    $("alertCount").textContent = A.filter(function(a){ return a.lv !== "gd"; }).length;
    $("alerts").innerHTML = A.map(function(a){ return '<li class="' + a.lv + '" data-id="' + a.id + '" tabindex="0"><span class="ic">' + a.ic + '</span><div><div class="at">' + esc(a.t) + '</div><div class="ad">' + esc(a.d) + '</div></div><span class="ag">' + a.g + '</span></li>'; }).join("");
  }

  // Charleston-area map (simplified, not to scale)
  var B = {lat0:32.765, lat1:33.215, lon0:-80.30, lon1:-79.80}, MW = 600, MH = 643;
  function P(lon, lat){ return [((lon - B.lon0) / (B.lon1 - B.lon0)) * MW, ((B.lat1 - lat) / (B.lat1 - B.lat0)) * MH]; }
  function path(pts, close){ return pts.map(function(p, i){ var q = P(p[0], p[1]); return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join("") + (close ? "Z" : ""); }
  // label side (-1 left, 1 right) and vertical nudge in px, hand-placed so nothing overlaps
  var LBL = {"Ashley Phosphate":[-1, 6], "Dorchester":[-1, 4], "Goose Creek":[1, -4], "McMillan":[1, 4], "Moncks Corner":[1, 0], "N. Charleston":[1, -2], "Oakbrook":[-1, 0], "Rivers Avenue":[1, -8], "Savannah Highway":[-1, 0], "Summerville 1":[1, -10], "Summerville 2":[1, 12]};
  function renderMap(stats){
    var ocean = [[-80.40,32.735],[-80.03,32.735],[-79.95,32.742],[-79.875,32.752],[-79.83,32.765],[-79.76,32.795],[-79.70,32.83],[-79.70,32.735]];
    var harbor = [[-79.955,32.772],[-79.93,32.805],[-79.895,32.81],[-79.875,32.78],[-79.872,32.755],[-79.92,32.752]];
    var cooper = [[-79.92,32.80],[-79.945,32.85],[-79.925,32.90],[-79.95,32.95],[-79.93,33.00],[-79.955,33.08],[-79.985,33.15],[-79.97,33.225]];
    var wando = [[-79.905,32.83],[-79.87,32.88],[-79.84,32.95],[-79.80,33.0]];
    var ashley = [[-79.95,32.775],[-79.99,32.815],[-80.03,32.85],[-80.08,32.885],[-80.13,32.93],[-80.17,32.975],[-80.22,33.015],[-80.30,33.05],[-80.40,33.07]];
    var i26 = [[-79.94,32.79],[-79.97,32.85],[-80.03,32.90],[-80.08,32.95],[-80.14,32.99],[-80.22,33.04],[-80.30,33.09],[-80.40,33.13]];
    var i526 = [[-80.045,32.80],[-80.055,32.84],[-80.045,32.88],[-80.00,32.902],[-79.94,32.875],[-79.88,32.85],[-79.83,32.83]];
    var us52 = [[-79.975,32.86],[-80.02,32.92],[-80.035,32.96],[-80.01,33.0],[-80.01,33.08],[-80.01,33.225]];
    var mx = Math.max.apply(null, stats.map(function(t){ return t.vol; })) || 1;
    var towns = [["Summerville",-80.235,33.085],["Goose Creek",-79.915,33.03],["Moncks Corner",-80.15,33.198],["North Charleston",-80.17,32.86],["Charleston",-79.935,32.776],["West Ashley",-80.125,32.832],["Mount Pleasant",-79.875,32.835],["Ladson",-80.105,32.99],["Hanahan",-79.925,32.925],["Atlantic Ocean",-79.875,32.769]];
    var svg = '<svg viewBox="0 0 ' + MW + ' ' + MH + '" role="img" aria-label="Map of Auto Money stores in the Charleston area">' +
      '<rect width="' + MW + '" height="' + MH + '" fill="#f4f7ef"/>' +
      '<path d="' + path(ocean, 1) + '" fill="#cfe3ec"/><path d="' + path(harbor, 1) + '" fill="#cfe3ec"/>' +
      '<path d="' + path(cooper) + '" fill="none" stroke="#bcd8e4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + path(wando) + '" fill="none" stroke="#bcd8e4" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="' + path(ashley) + '" fill="none" stroke="#bcd8e4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      [i26, i526, us52].map(function(r, k){ return '<path d="' + path(r) + '" fill="none" stroke="' + (k === 2 ? "#f1d98a" : "#e9c84f") + '" stroke-width="' + (k === 2 ? 2.5 : 3.5) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>'; }).join("") +
      towns.map(function(t){ var q = P(t[1], t[2]); return '<text x="' + q[0].toFixed(0) + '" y="' + q[1].toFixed(0) + '" font-size="' + (t[0] === "Atlantic Ocean" ? 11 : 11) + '" class="town" fill="' + (t[0] === "Atlantic Ocean" ? "#6f97a8" : "#98a597") + '" font-weight="700" letter-spacing=".08em" text-anchor="middle">' + t[0].toUpperCase() + '</text>'; }).join("") +
      (function(){ var a = P(-80.285, 33.052), b = P(-79.86, 32.872), c = 0; return '<text x="' + a[0] + '" y="' + a[1] + '" font-size="10" fill="#b49a2a" font-weight="800">I-26</text><text x="' + (b[0] - 8) + '" y="' + (b[1] - 6) + '" font-size="10" fill="#b49a2a" font-weight="800">I-526</text>'; })() +
      stats.slice().sort(function(a, b){ return b.vol - a.vol; }).map(function(t){
        var q = P(t.s.lon, t.s.lat), rr = 7 + 11 * Math.sqrt(t.vol / mx), L = LBL[t.s.name] || [1, 0];
        var col = {ok:"#3f9b3a", watch:"#e0a400", help:"#d4483b"}[t.status];
        var tx = q[0] + L[0] * (rr + 6), ty = q[1] + L[1] - 1;
        var nm = t.s.name === "Savannah Highway" ? "Savannah Hwy" : t.s.name;
        return '<g class="st" data-id="' + t.s.id + '" tabindex="0" role="button" aria-label="' + esc(t.s.label + ", " + fmt(t.vol, "$") + " funded") + '">' +
          '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (rr + 4).toFixed(1) + '" fill="' + col + '" opacity=".18"/>' +
          '<circle class="b" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="' + col + '" stroke="#fff" stroke-width="2"/>' +
          '<text class="nm" x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" font-size="12" font-weight="800" fill="#16211a" text-anchor="' + (L[0] < 0 ? "end" : "start") + '" paint-order="stroke" stroke="#f4f7ef" stroke-width="3.5">' + esc(nm) + '</text>' +
          '<text class="sub" x="' + tx.toFixed(1) + '" y="' + (ty + 13).toFixed(1) + '" font-size="10.5" font-weight="600" fill="#5d6b61" text-anchor="' + (L[0] < 0 ? "end" : "start") + '" paint-order="stroke" stroke="#f4f7ef" stroke-width="3">' + fmt(t.vol, "$") + ' \u00b7 ' + t.funded + ' funded</text></g>';
      }).join("") + '</svg>';
    $("map").innerHTML = svg;
  }

  function bars(rows, cls){
    var mx = Math.max.apply(null, rows.map(function(r){ return r[1]; })) || 1;
    return '<div class="fn ' + (cls || "") + '">' + rows.map(function(r){ return '<div class="fr"><div>' + esc(r[0]) + '</div><div class="bar"><i style="width:' + Math.max(4, r[1] / mx * 100).toFixed(1) + '%"></i><span class="num">' + fmt(r[1], "n") + '</span></div><div class="pc">' + (r[2] || "") + '</div></div>'; }).join("") + '</div>';
  }
  function renderFunnel(){
    var L = val("newLeads");
    var rows = [["New leads", L], ["Photo estimates", val("photoEst")], ["Applications", val("apps")], ["Visits booked", val("booked")], ["Funded", val("funded")]];
    rows.forEach(function(r){ r[2] = L ? Math.round(r[1] / L * 100) + "%" : ""; });
    $("funnel").innerHTML = bars(rows);
    $("funnelHint").textContent = (range === "today" ? "Today" : "Month to date") + " \u00b7 all stores";
    var r = rng(hash("src" + range)), tot = L, rows2 = SOURCES.map(function(s){ return [s[0], rnd(tot * s[2] * between(r, .9, 1.1)), s[1] ? "P" + s[1] : "store"]; });
    rows2.sort(function(a, b){ return b[1] - a[1]; });
    $("sources").innerHTML = bars(rows2, "src");
    var F = val("funded"), avg = val("avgLoan"), r3 = rng(hash("size" + range));
    var shares = [.12, .27, .37, .19, .05].map(function(x, i){ return x * between(r3, .9, 1.1) * (i >= 3 ? avg / 1400 : 1); }), ss = shares.reduce(function(a, b){ return a + b; }, 0);
    var cnt = shares.map(function(x){ return Math.round(F * x / ss); }), mx = Math.max.apply(null, cnt) || 1;
    $("sizes").innerHTML = '<div class="cols">' + cnt.map(function(c, i){ return '<div class="col"><b class="num">' + c + '</b><i style="height:' + Math.max(4, c / mx * 140).toFixed(0) + 'px"></i><span>' + SIZES[i] + '</span></div>'; }).join("") + '</div><p class="fine">Average loan ' + fmt(avg, "$", false) + ' \u00b7 ' + fmt(F, "n") + ' loans</p>';
  }
  function renderDrivers(){
    var D = {
      1:[["Leads delivered", fmt(val("delivered"), "n")], ["From the daily list", fmt(Math.round(val("newLeads") * .17), "n") + " inquiries"]],
      2:[["Instant replies", fmt(val("replies"), "n")], ["Day-2 follow-ups", fmt(val("followups"), "n")], ["Missed-call text backs", fmt(val("textBacks"), "n")]],
      3:[["Button taps", fmt(val("taps"), "n")], ["Photo estimates", fmt(val("photoEst"), "n")]],
      4:[["Started", fmt(val("started"), "n")], ["E-signed", fmt(val("signed"), "n")], ["Visits booked", fmt(val("booked"), "n")]],
      5:[["Reminders sent", fmt(val("reminders"), "n")], ["Paid after reminder", fmt(val("paidAfterRem"), "%")], ["Pay-now (if added)", fmt(val("payNow"), "n")], ["Reviews", fmt(val("reviews"), "n") + " of " + fmt(val("reviewReq"), "n") + " asked"], ["Referrals", fmt(val("referrals"), "n")]],
      6:[["Stores on one screen", STORES.length], ["Morning summary", "to each manager"], ["Weekly roll-up", "to the owner"]]
    };
    $("drivers").innerHTML = Object.keys(PARTS).map(function(k){ return '<div class="dv"><span class="n">' + k + '</span><h4>' + esc(PARTS[k].name) + '</h4><ul>' + D[k].map(function(x){ return '<li>' + esc(x[0]) + ': <b class="num">' + esc(x[1]) + '</b></li>'; }).join("") + '</ul></div>'; }).join("");
  }

  // ---------- store drawer ----------
  var lastFocus = null;
  var usedNames = {};
  function custName(r){ for(var t = 0; t < 40; t++){ var f = FIRST[Math.floor(r() * FIRST.length)]; if(!usedNames[f]){ usedNames[f] = 1; return f + " " + LASTI[Math.floor(r() * LASTI.length)] + "."; } } return "Customer " + LASTI[Math.floor(r() * LASTI.length)] + "."; }
  function openStore(id){
    var s = STORES[id], t = storeStats(s), d = s.daily[DAYS - 1], r = rng(hash("drawer" + s.name)); usedNames = {};
    var stages = [["New leads", d.newLeads, "lead"], ["Photo estimate", d.photoEst, "photos in"], ["E-signed", d.signed, "signed"], ["Visit booked", d.booked, ""], ["Funded", d.funded, ""]];
    var hours = ["9:30","10:15","11:00","11:45","1:00","2:15","3:30","4:15","5:00"];
    var pipe = stages.map(function(st, i){
      var n = Math.min(3, st[1]), items = [];
      for(var k = 0; k < n; k++){ var nm = custName(r); items.push(i === 3 ? hours[Math.floor(r() * hours.length)] + " \u00b7 " + nm : i === 4 ? nm + " \u00b7 " + fmt(rnd(s.avgLoan * between(r, .5, 1.6) / 50) * 50, "$", false) : nm); }
      if(i === 3) items.sort(function(x, y){ function m(v){ var p = v.split(" ")[0].split(":"), h = +p[0]; if(h < 9) h += 12; return h * 60 + +p[1]; } return m(x) - m(y); });
      return '<div class="pr"><div class="pl"><b class="num">' + st[1] + '</b><span>' + st[0] + '</span></div><ul>' + items.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + (st[1] > n ? '<li class="more">+' + (st[1] - n) + ' more</li>' : '') + '</ul></div>';
    }).join("");
    var stt = [["paid","Paid"],["paid","Paid"],["paid","Paid \u00b7 pay-now (if added)"],["rem","Reminder sent"],["rem","Reminder sent"],["prom","Promised 4 PM"],["late","Late 6 days"],["late","Late 12 days"]];
    var pays = []; for(var k = 0; k < 8; k++){ var x = stt[Math.floor(r() * stt.length)]; if(k === 0) x = stt[0]; if(k === 7 && s.name === TROUBLE.pastDueUp) x = stt[7]; pays.push([custName(r), CARS[Math.floor(r() * CARS.length)], rnd(s.avgPmt * between(r, .7, 1.4)), x]); }
    var ck = JSON.parse(localStorage.getItem("am-ck-" + s.name) || "null") || CHECKLIST.map(function(_, i){ return i < 2 || (i === 2 && r() < .5); });
    var lbl = {ok:"On track", watch:"Watch", help:"Needs help"};
    var dr = $("drawer");
    dr.innerHTML = '<div class="dh"><button class="x" type="button" aria-label="Close">\u00d7</button><h2 id="dTitle">' + esc(s.label) + '</h2><p>' + esc(s.street + ", " + s.city + ", SC " + s.zip) + ' \u00b7 <a href="tel:' + s.phone.replace(/\D/g, "") + '">' + esc(s.phone) + '</a></p>' +
      '<div class="meta"><span class="pill ' + t.status + '" style="padding:3px 9px">' + lbl[t.status] + '</span><span>Manager: ' + esc(s.mgr) + ' (sample)</span><span>' + s.staff + ' on shift</span><span>Last activity ' + agoText(s.lastAct) + '</span><span>Rank #' + (STORES.map(storeStats).sort(function(a, b){ return b.score - a.score; }).findIndex(function(z){ return z.s.id === s.id; }) + 1) + ' of ' + STORES.length + '</span></div></div>' +
      '<div class="db">' + (t.why.length ? '<p class="fine" style="margin:0 0 12px;color:#a8291d;font-weight:700">Watch: ' + esc(t.why.join(" \u00b7 ")) + '</p>' : '') +
      '<h3>Today <small>sample data</small></h3><div class="mini">' +
        [[fmt(d.fundedVol, "$", false), "Funded today"], [fmt(d.collected, "$", false), "Collected today"], [fmt(t.mtdVol, "$"), "Month to date \u00b7 " + Math.round(t.goalPct * 100) + "% of " + fmt(s.goal, "$") + " goal"], [d.newLeads, "New leads"], [fmt(val("respMin", [s], [DAYS - 1]), "min"), "Lead response"], [fmt(t.pd, "%"), "Past due (" + d.pastDue + ")"]].map(function(m){ return '<div><b class="num">' + m[0] + '</b><span>' + m[1] + '</span></div>'; }).join("") + '</div>' +
      '<h3>Today\u2019s pipeline <small>sample customers</small></h3><div class="pipe">' + pipe + '</div>' +
      '<h3>Payments due today <small>' + d.paid + ' of ' + d.dueNow + ' due so far paid \u00b7 sample customers</small></h3><table class="pay"><tbody>' + pays.map(function(p){ return '<tr><td><div class="nm">' + esc(p[0]) + '</div><div class="vh">' + esc(p[1]) + '</div></td><td class="num">' + fmt(p[2], "$", false) + '</td><td><span class="st2 ' + p[3][0] + '">' + p[3][1] + '</span></td></tr>'; }).join("") + '</tbody></table>' +
      '<h3>Manager checklist <small class="prog" id="ckProg"></small></h3><ul class="chk">' + CHECKLIST.map(function(c, i){ return '<li><label><input type="checkbox" data-i="' + i + '"' + (ck[i] ? " checked" : "") + '><span>' + esc(c) + '</span></label></li>'; }).join("") + '</ul>' +
      '<p class="fine">Store name, address and phone are real. Manager, customers and every number are sample data.</p></div>';
    function prog(){ var n = ck.filter(Boolean).length; $("ckProg").textContent = n + " of " + CHECKLIST.length + " done"; }
    prog();
    dr.querySelectorAll(".chk input").forEach(function(inp){ inp.addEventListener("change", function(){ ck[+inp.dataset.i] = inp.checked; try{ localStorage.setItem("am-ck-" + s.name, JSON.stringify(ck)); }catch(e){} prog(); }); });
    dr.querySelector(".x").addEventListener("click", closeStore);
    lastFocus = document.activeElement;
    $("scrim").hidden = false; dr.classList.add("open"); dr.setAttribute("aria-hidden", "false"); dr.scrollTop = 0; document.body.style.overflow = "hidden";
    setTimeout(function(){ dr.querySelector(".x").focus(); }, 30);
  }
  function closeStore(){ var dr = $("drawer"); dr.classList.remove("open"); dr.setAttribute("aria-hidden", "true"); $("scrim").hidden = true; document.body.style.overflow = ""; if(lastFocus && lastFocus.focus) lastFocus.focus(); }

  function renderAll(){ renderHeader(); var stats = renderScore(); renderAlerts(stats); renderMap(stats); renderGroups(); renderFunnel(); renderDrivers(); }

  // events
  document.querySelectorAll(".seg button").forEach(function(b){ b.addEventListener("click", function(){ range = b.dataset.range; document.querySelectorAll(".seg button").forEach(function(x){ var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); }); renderAll(); }); });
  $("q").addEventListener("input", renderScore);
  $("statusF").addEventListener("change", renderScore);
  $("score").addEventListener("click", function(e){
    var sb = e.target.closest("[data-sort]");
    if(sb){ var k = sb.dataset.sort; if(sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = (k === "rank" || k === "store" || k === "mgr" || k === "status" || k === "pd" || k === "last" || k === "resp") ? 1 : -1; } renderScore(); return; }
    var tr = e.target.closest("tr[data-id]"); if(tr) openStore(+tr.dataset.id);
  });
  function keyOpen(sel){ document.addEventListener("keydown", function(e){ if(e.key !== "Enter" && e.key !== " ") return; var el = e.target.closest && e.target.closest(sel); if(el){ e.preventDefault(); openStore(+el.dataset.id); } }); }
  keyOpen("tr[data-id]"); keyOpen(".alerts li"); keyOpen(".st");
  $("statusSum").addEventListener("click", function(e){ var b = e.target.closest("[data-f]"); if(!b) return; $("statusF").value = b.dataset.f; renderScore(); $("score").scrollIntoView({behavior:"smooth", block:"start"}); });
  $("alerts").addEventListener("click", function(e){ var li = e.target.closest("li[data-id]"); if(li) openStore(+li.dataset.id); });
  $("map").addEventListener("click", function(e){ var g = e.target.closest(".st"); if(g) openStore(+g.dataset.id); });
  $("scrim").addEventListener("click", closeStore);
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && $("drawer").classList.contains("open")) closeStore(); });

  window.AM_DASH = {METRICS:METRICS, PARTS:PARTS, STORES:STORES, open:openStore}; // handy for edits/tests
  renderAll();
})();
