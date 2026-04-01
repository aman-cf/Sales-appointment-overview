import { useState, useMemo, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   CONFIG & CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const BRAND = { accent: "#d54402", accentLight: "rgba(213,68,2,.06)", accentBorder: "rgba(213,68,2,.25)" };
const COLORS = {
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#ca8a04", amberBg: "#fefce8", amberBorder: "#fde68a",
  red: "#dc2626", redBg: "#fef2f2", redBorder: "#fecaca",
  blue: "#2563eb", blueBg: "#eff6ff", gray: "#9b9a97", grayDark: "#5f5e5b", grayBorder: "#e5e5e3",
  grayBg: "#f5f5f4", grayLight: "#f0f0ee", text: "#1b1b18", white: "#fff", cardBg: "#f9fafb",
};
const PERIOD_LABELS = { today: "Today", week: "This Week", month: "This Month" };
const COMPARE_LABELS = { today: "vs yesterday", week: "vs last week", month: "vs last month" };

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — Agent Factory (unchanged from TL build)
   ═══════════════════════════════════════════════════════════════ */

function makeOnlineAgent(o) {
  const b = { target:800000,revenueNew:200000,revenueCross:180000,revPrepaid:220000,revCOD:160000,ordersPrepaid:25,ordersCOD:20,ordersTotal:45,aov:7600,leadsReceived:550,leads3Plus:340,contactRate:55,leadsResponded:260,responseRate:47,conversionRate:8.2,avgTimeToContact:3.5,staleLeads:15,avgTouchesUnconv:3.0,contactedViaCall:280,contactedViaWA:140,todayActionable:22,callsMade:600,callsConnected:280,connectRate:47,waLogged:200,fuCompleted:220,fuOverdue:12,expectedCallsPerDay:30,expectedFuPerDay:12,apptsBooked:20,apptsVisited:15,apptsNoShow:5,apptsVisitRate:75,apptsUpcoming:8,apptsAvgAdvance:2500,apptsByClinic:{Chandigarh:5,Ludhiana:4,Delhi:3,Bathinda:2,Amritsar:3,Jalandhar:2,Karnal:1},clinicVisits:15,retentionPct:28,cpl:145,spendAttr:79750,roasThresholdUp:6,roasThresholdDown:4,nextRebudget:"Apr 15",currentDailyLeads:22,incentivePct:3,incentiveEarned:11400,nextSlabThreshold:800000,nextSlabPct:5,roasBonus:2000,roasSlab:"2x-3x",roasBonusSlabs:[{r:"Below 2x",a:0},{r:"2x-3x",a:2000},{r:"3x-4x",a:5000},{r:"4x+",a:10000}],contestLive:true,contestName:"Contest: Max Orders",contestPeriod:"Apr 1 – Apr 3",contestTarget:12,contestAchieved:5,contestReward:"₹3,000",contestTiers:[{pct:90,reward:"₹1,500"},{pct:100,reward:"₹3,000"},{pct:120,reward:"₹5,000"}],intentPipeline:[{n:"High Intent",c:42,cl:COLORS.green},{n:"Considering",c:85,cl:COLORS.blue},{n:"Exploring",c:120,cl:COLORS.amber},{n:"Disengaged",c:28,cl:COLORS.red},{n:"Unqualified",c:55,cl:COLORS.gray}],topObjections:[{n:"Price / Budget",c:55},{n:"Timing / Not Ready",c:38},{n:"Trust / Results",c:30},{n:"Needs Information",c:25},{n:"Distance",c:15}],leadAge:{fresh:220,aging:130,stale:15},todayOrders:2,todayRevenue:16500,bestDay:{revenue:32000,date:"Mar 20"},daysElapsed:27,totalDays:31,todayCalls:28,todayContacts:12,todayFollowups:8 };
  const a = { ...b, ...o };
  Object.defineProperty(a, "roasVal", { get() { return +(this.revenueNew / this.spendAttr).toFixed(2); } });
  return a;
}
function makeApptAgent(o) {
  const b = { targetVisits:50,targetRevenue:500000,apptsBooked:38,apptsVisited:30,apptsNoShow:8,apptsVisitRate:79,apptsUpcoming:12,apptsAvgAdvance:2600,advanceCollected:78000,revenueFromVisits:360000,apptsByClinic:{Chandigarh:8,Ludhiana:6,Delhi:5,Bathinda:4,Amritsar:5,Jalandhar:3,Karnal:2},patientOptedFor:{Packages:12,"Single Session":7,"Product Only":6,Consultation:5},pipelineValue:318000,rescheduleCount:8,rescheduledLeads:5,multiReschedule:3,leadsReceived:500,leads3Plus:320,contactRate:58,leadsResponded:250,responseRate:50,conversionRate:7.6,avgTimeToContact:2.5,staleLeads:10,avgTouchesUnconv:2.8,contactedViaCall:280,contactedViaWA:140,todayActionable:20,callsMade:680,callsConnected:340,connectRate:50,waLogged:230,fuCompleted:280,fuOverdue:10,expectedCallsPerDay:35,expectedFuPerDay:15,packageConvRate:40,avgPackageTicket:24000,revenueNew:230000,cpl:145,spendAttr:72500,roasThresholdUp:6,roasThresholdDown:4,nextRebudget:"Apr 15",currentDailyLeads:20,revenueIncentive:3600,slabIncentive:6000,slabCurrent:"25-35 visits",slabNext:"35-45 visits",slabNextAmount:9000,roasBonus:5000,roasSlab:"3x-5x",roasBonusSlabs:[{r:"Below 2x",a:0},{r:"2x-3x",a:3000},{r:"3x-5x",a:8000},{r:"5x+",a:15000}],totalIncentive:14600,contestLive:true,contestName:"Contest: Max Visits",contestPeriod:"Apr 1 – Apr 3",contestTarget:8,contestAchieved:4,contestReward:"₹2,500",contestTiers:[{pct:90,reward:"₹1,000"},{pct:100,reward:"₹2,500"},{pct:120,reward:"₹4,000"}],intentPipeline:[{n:"High Intent",c:38,cl:COLORS.green},{n:"Considering",c:80,cl:COLORS.blue},{n:"Exploring",c:110,cl:COLORS.amber},{n:"Disengaged",c:25,cl:COLORS.red},{n:"Unqualified",c:42,cl:COLORS.gray}],topObjections:[{n:"Timing / Not Ready",c:48},{n:"Price / Budget",c:38},{n:"Distance",c:25},{n:"Family / Decision Maker",c:20},{n:"Trust / Results",c:15}],leadAge:{fresh:200,aging:105,stale:10},todayVisits:1,todayRevenue:22000,bestDay:{revenue:28000,date:"Mar 24"},daysElapsed:27,totalDays:31,todayCalls:32,todayContacts:14,todayFollowups:10 };
  const a = { ...b, ...o };
  Object.defineProperty(a, "roasVal", { get() { return +(this.revenueNew / this.spendAttr).toFixed(2); } });
  return a;
}

const AGENTS_ONLINE = [
  makeOnlineAgent({id:1,name:"Varun K.",target:1000000,revenueNew:342000,revenueCross:300000,revPrepaid:380000,revCOD:262000,ordersPrepaid:42,ordersCOD:36,ordersTotal:78,aov:8231,leadsReceived:780,leads3Plus:485,contactRate:62,leadsResponded:380,responseRate:49,conversionRate:10.8,avgTimeToContact:2.8,staleLeads:22,todayActionable:34,callsMade:820,callsConnected:386,connectRate:47,waLogged:290,fuCompleted:310,fuOverdue:18,apptsBooked:34,apptsVisited:26,apptsNoShow:8,apptsVisitRate:76,apptsUpcoming:12,clinicVisits:26,retentionPct:34,spendAttr:113100,currentDailyLeads:30,incentivePct:3,incentiveEarned:19260,roasBonus:5000,roasSlab:"3x-4x",contestAchieved:7,todayOrders:3,todayRevenue:24800,bestDay:{revenue:42000,date:"Mar 18"},leadAge:{fresh:312,aging:186,stale:22},contactedViaCall:410,contactedViaWA:202,avgTouchesUnconv:3.2,todayCalls:34,todayContacts:16,todayFollowups:12}),
  makeOnlineAgent({id:2,name:"Priya M.",target:850000,revenueNew:298000,revenueCross:260000,revPrepaid:320000,revCOD:238000,ordersPrepaid:38,ordersCOD:30,ordersTotal:68,aov:7400,leadsReceived:720,leads3Plus:518,contactRate:72,leadsResponded:360,responseRate:50,conversionRate:9.2,avgTimeToContact:2.1,staleLeads:8,todayActionable:18,callsMade:790,callsConnected:395,connectRate:50,waLogged:280,fuCompleted:320,fuOverdue:6,apptsBooked:28,apptsVisited:22,apptsNoShow:6,apptsVisitRate:79,apptsUpcoming:10,clinicVisits:22,retentionPct:38,spendAttr:104400,currentDailyLeads:28,incentivePct:3,incentiveEarned:16740,roasBonus:5000,roasSlab:"3x-4x",contestAchieved:6,todayOrders:2,todayRevenue:18200,bestDay:{revenue:38000,date:"Mar 22"},leadAge:{fresh:340,aging:152,stale:8},contactedViaCall:380,contactedViaWA:210,avgTouchesUnconv:3.5}),
  makeOnlineAgent({id:3,name:"Nisha G.",target:800000,revenueNew:215000,revenueCross:200000,revPrepaid:240000,revCOD:175000,ordersPrepaid:28,ordersCOD:24,ordersTotal:52,aov:6920,leadsReceived:650,leads3Plus:358,contactRate:55,leadsResponded:280,responseRate:43,conversionRate:8.1,avgTimeToContact:4.2,staleLeads:28,todayActionable:30,callsMade:580,callsConnected:261,connectRate:45,waLogged:210,fuCompleted:240,fuOverdue:22,apptsBooked:22,apptsVisited:18,apptsNoShow:4,apptsVisitRate:82,apptsUpcoming:8,clinicVisits:18,retentionPct:28,spendAttr:94250,currentDailyLeads:25,incentivePct:3,incentiveEarned:12450,roasBonus:2000,roasSlab:"2x-3x",contestAchieved:4,todayOrders:1,todayRevenue:8500,bestDay:{revenue:28000,date:"Mar 15"},leadAge:{fresh:240,aging:162,stale:28},contactedViaCall:320,contactedViaWA:180,avgTouchesUnconv:2.6}),
  makeOnlineAgent({id:4,name:"Sneha D.",target:750000,revenueNew:178000,revenueCross:160000,revPrepaid:195000,revCOD:143000,ordersPrepaid:22,ordersCOD:20,ordersTotal:42,aov:6100,leadsReceived:600,leads3Plus:288,contactRate:48,leadsResponded:228,responseRate:38,conversionRate:7.4,avgTimeToContact:5.1,staleLeads:32,todayActionable:38,callsMade:520,callsConnected:234,connectRate:45,waLogged:180,fuCompleted:200,fuOverdue:28,apptsBooked:18,apptsVisited:14,apptsNoShow:4,apptsVisitRate:78,apptsUpcoming:6,clinicVisits:14,retentionPct:22,spendAttr:87000,currentDailyLeads:22,incentivePct:3,incentiveEarned:10140,roasBonus:2000,roasSlab:"2x-3x",contestAchieved:3,todayOrders:1,todayRevenue:6100,bestDay:{revenue:24000,date:"Mar 12"},leadAge:{fresh:200,aging:148,stale:32},contactedViaCall:280,contactedViaWA:160,avgTouchesUnconv:2.4}),
  makeOnlineAgent({id:5,name:"Karan P.",target:750000,revenueNew:165000,revenueCross:125000,revPrepaid:168000,revCOD:122000,ordersPrepaid:18,ordersCOD:16,ordersTotal:34,aov:5800,leadsReceived:580,leads3Plus:255,contactRate:44,leadsResponded:200,responseRate:34,conversionRate:6.8,avgTimeToContact:6.2,staleLeads:40,todayActionable:42,callsMade:450,callsConnected:189,connectRate:42,waLogged:150,fuCompleted:170,fuOverdue:35,apptsBooked:14,apptsVisited:10,apptsNoShow:4,apptsVisitRate:71,apptsUpcoming:5,clinicVisits:10,retentionPct:19,spendAttr:84100,currentDailyLeads:20,incentivePct:3,incentiveEarned:8700,roasBonus:0,roasSlab:"Below 2x",contestAchieved:2,todayOrders:0,todayRevenue:0,bestDay:{revenue:18000,date:"Mar 8"},leadAge:{fresh:180,aging:140,stale:40},contactedViaCall:240,contactedViaWA:130,avgTouchesUnconv:2.1,todayCalls:12,todayContacts:3,todayFollowups:2}),
];
const AGENTS_APPT = [
  makeApptAgent({id:6,name:"Anish S.",targetVisits:60,targetRevenue:600000,apptsBooked:52,apptsVisited:41,apptsNoShow:11,apptsVisitRate:79,apptsUpcoming:18,advanceCollected:114800,revenueFromVisits:485000,pipelineValue:477000,rescheduleCount:14,rescheduledLeads:9,multiReschedule:5,leadsReceived:690,leads3Plus:445,contactRate:64,leadsResponded:348,responseRate:50,conversionRate:8.9,avgTimeToContact:1.9,staleLeads:14,todayActionable:28,callsMade:920,callsConnected:460,connectRate:50,waLogged:310,fuCompleted:380,fuOverdue:12,packageConvRate:43.9,avgPackageTicket:26500,revenueNew:310000,spendAttr:100050,currentDailyLeads:28,revenueIncentive:4850,slabIncentive:8000,slabCurrent:"40-50 visits",slabNext:"50-60 visits",slabNextAmount:12000,roasBonus:8000,roasSlab:"3x-5x",totalIncentive:20850,contestAchieved:5,todayVisits:2,todayRevenue:31000,bestDay:{revenue:38000,date:"Mar 22"},leadAge:{fresh:280,aging:145,stale:14},contactedViaCall:390,contactedViaWA:190,avgTouchesUnconv:2.8,todayCalls:38,todayContacts:18,todayFollowups:14}),
  makeApptAgent({id:7,name:"Meera T.",targetVisits:55,targetRevenue:550000,apptsBooked:46,apptsVisited:38,apptsNoShow:8,apptsVisitRate:83,apptsUpcoming:14,advanceCollected:106400,revenueFromVisits:410000,pipelineValue:392000,rescheduleCount:6,rescheduledLeads:4,multiReschedule:2,leadsReceived:620,leads3Plus:434,contactRate:70,leadsResponded:330,responseRate:53,conversionRate:9.3,avgTimeToContact:1.5,staleLeads:6,todayActionable:16,callsMade:860,callsConnected:448,connectRate:52,waLogged:290,fuCompleted:360,fuOverdue:5,packageConvRate:48.2,avgPackageTicket:28000,revenueNew:265000,spendAttr:89900,currentDailyLeads:25,revenueIncentive:4100,slabIncentive:8000,slabCurrent:"35-45 visits",slabNext:"45-55 visits",slabNextAmount:12000,roasBonus:5000,roasSlab:"2x-3x",totalIncentive:17100,contestAchieved:4,todayVisits:2,todayRevenue:28000,bestDay:{revenue:35000,date:"Mar 19"},leadAge:{fresh:290,aging:118,stale:6},contactedViaCall:370,contactedViaWA:180,avgTouchesUnconv:3.2}),
  makeApptAgent({id:8,name:"Rohit B.",targetVisits:50,targetRevenue:500000,apptsBooked:40,apptsVisited:32,apptsNoShow:8,apptsVisitRate:80,apptsUpcoming:10,advanceCollected:83200,revenueFromVisits:365000,pipelineValue:220000,rescheduleCount:12,rescheduledLeads:8,multiReschedule:4,leadsReceived:560,leads3Plus:325,contactRate:58,leadsResponded:270,responseRate:48,conversionRate:7.5,avgTimeToContact:3.4,staleLeads:18,todayActionable:24,callsMade:720,callsConnected:360,connectRate:50,waLogged:240,fuCompleted:290,fuOverdue:18,packageConvRate:38.5,avgPackageTicket:22000,revenueNew:225000,spendAttr:81200,currentDailyLeads:22,revenueIncentive:3650,slabIncentive:6000,slabCurrent:"30-40 visits",slabNext:"40-50 visits",slabNextAmount:8000,roasBonus:5000,roasSlab:"2x-3x",totalIncentive:14650,contestAchieved:3,todayVisits:1,todayRevenue:15000,bestDay:{revenue:30000,date:"Mar 16"},leadAge:{fresh:230,aging:132,stale:18},contactedViaCall:300,contactedViaWA:160,avgTouchesUnconv:2.5}),
  makeApptAgent({id:9,name:"Sonal R.",targetVisits:45,targetRevenue:450000,apptsBooked:34,apptsVisited:28,apptsNoShow:6,apptsVisitRate:82,apptsUpcoming:8,advanceCollected:67200,revenueFromVisits:295000,pipelineValue:156000,rescheduleCount:10,rescheduledLeads:6,multiReschedule:3,leadsReceived:480,leads3Plus:250,contactRate:52,leadsResponded:216,responseRate:45,conversionRate:6.8,avgTimeToContact:4.1,staleLeads:22,todayActionable:30,callsMade:620,callsConnected:298,connectRate:48,waLogged:200,fuCompleted:240,fuOverdue:24,packageConvRate:35,avgPackageTicket:19500,revenueNew:185000,spendAttr:69600,currentDailyLeads:18,revenueIncentive:2950,slabIncentive:4000,slabCurrent:"25-30 visits",slabNext:"30-40 visits",slabNextAmount:6000,roasBonus:5000,roasSlab:"2x-3x",totalIncentive:11950,contestAchieved:2,todayVisits:0,todayRevenue:0,bestDay:{revenue:22000,date:"Mar 25"},leadAge:{fresh:190,aging:108,stale:22},contactedViaCall:250,contactedViaWA:130,avgTouchesUnconv:2.3,todayCalls:18,todayContacts:5,todayFollowups:4}),
];

const AGENTS_ONLINE_PREV = {
  1:{revenueNew:310000,revenueCross:275000,ordersTotal:68,aov:8603,leadsReceived:720,contactRate:58,conversionRate:9.5,callsMade:760,connectRate:45,apptsBooked:30,apptsVisited:22,revPrepaid:340000,revCOD:245000,clinicVisits:22,retentionPct:30,spendAttr:104400,get roasVal(){return +(310000/104400).toFixed(2);}},
  2:{revenueNew:275000,revenueCross:245000,ordersTotal:62,aov:7100,leadsReceived:680,contactRate:68,conversionRate:8.8,callsMade:740,connectRate:48,apptsBooked:24,apptsVisited:20,revPrepaid:300000,revCOD:220000,clinicVisits:20,retentionPct:35,spendAttr:98800,get roasVal(){return +(275000/98800).toFixed(2);}},
  3:{revenueNew:230000,revenueCross:210000,ordersTotal:56,aov:7200,leadsReceived:620,contactRate:60,conversionRate:8.5,callsMade:620,connectRate:48,apptsBooked:24,apptsVisited:19,revPrepaid:250000,revCOD:190000,clinicVisits:19,retentionPct:31,spendAttr:89900,get roasVal(){return +(230000/89900).toFixed(2);}},
  4:{revenueNew:160000,revenueCross:150000,ordersTotal:38,aov:5900,leadsReceived:580,contactRate:45,conversionRate:7.0,callsMade:480,connectRate:42,apptsBooked:16,apptsVisited:12,revPrepaid:175000,revCOD:135000,clinicVisits:12,retentionPct:20,spendAttr:84100,get roasVal(){return +(160000/84100).toFixed(2);}},
  5:{revenueNew:175000,revenueCross:130000,ordersTotal:36,aov:6100,leadsReceived:560,contactRate:48,conversionRate:7.2,callsMade:470,connectRate:44,apptsBooked:15,apptsVisited:11,revPrepaid:178000,revCOD:127000,clinicVisits:11,retentionPct:21,spendAttr:81200,get roasVal(){return +(175000/81200).toFixed(2);}},
};
const AGENTS_APPT_PREV = {
  6:{apptsBooked:45,apptsVisited:34,revenueFromVisits:420000,leadsReceived:640,contactRate:59,conversionRate:7.8,callsMade:850,connectRate:46,advanceCollected:95200,rescheduleCount:18,spendAttr:92800,revenueNew:280000,get roasVal(){return +(280000/92800).toFixed(2);}},
  7:{apptsBooked:40,apptsVisited:35,revenueFromVisits:380000,leadsReceived:590,contactRate:65,conversionRate:8.5,callsMade:810,connectRate:50,advanceCollected:98000,rescheduleCount:8,spendAttr:82600,revenueNew:245000,get roasVal(){return +(245000/82600).toFixed(2);}},
  8:{apptsBooked:38,apptsVisited:33,revenueFromVisits:370000,leadsReceived:540,contactRate:60,conversionRate:7.2,callsMade:700,connectRate:48,advanceCollected:82500,rescheduleCount:14,spendAttr:78400,revenueNew:220000,get roasVal(){return +(220000/78400).toFixed(2);}},
  9:{apptsBooked:30,apptsVisited:26,revenueFromVisits:280000,leadsReceived:460,contactRate:48,conversionRate:6.2,callsMade:580,connectRate:44,advanceCollected:61800,rescheduleCount:12,spendAttr:66400,revenueNew:170000,get roasVal(){return +(170000/66400).toFixed(2);}},
};

// Leaderboard derived from agents
const LB_ONLINE = AGENTS_ONLINE.map(a => ({id:a.id,name:a.name,revenue:a.revenueNew+a.revenueCross,revNew:a.revenueNew,convRate:a.conversionRate,contactRate:a.contactRate,aov:a.aov,speed:a.avgTimeToContact,clinicVisits:a.clinicVisits,retPct:a.retentionPct,prev:AGENTS_ONLINE_PREV[a.id]?{revenue:AGENTS_ONLINE_PREV[a.id].revenueNew+AGENTS_ONLINE_PREV[a.id].revenueCross,revNew:AGENTS_ONLINE_PREV[a.id].revenueNew,convRate:AGENTS_ONLINE_PREV[a.id].conversionRate,contactRate:AGENTS_ONLINE_PREV[a.id].contactRate,aov:AGENTS_ONLINE_PREV[a.id].aov,speed:3.2,clinicVisits:AGENTS_ONLINE_PREV[a.id].clinicVisits,retPct:AGENTS_ONLINE_PREV[a.id].retentionPct}:null}));
const LB_APPT = AGENTS_APPT.map(a => ({id:a.id,name:a.name,revenue:a.revenueFromVisits,visits:a.apptsVisited,visitPct:a.apptsVisitRate,speed:a.avgTimeToContact,contactRate:a.contactRate,pkgConv:a.packageConvRate,avgTicket:a.avgPackageTicket,prev:AGENTS_APPT_PREV[a.id]?{revenue:AGENTS_APPT_PREV[a.id].revenueFromVisits,visits:AGENTS_APPT_PREV[a.id].apptsVisited,visitPct:76,speed:2.2,contactRate:AGENTS_APPT_PREV[a.id].contactRate,pkgConv:40,avgTicket:25000}:null}));

const LB_ONLINE_CATS = [{id:"revenue",label:"Revenue",f:"revenue",fmt:"c",desc:true},{id:"revNew",label:"New Patient Revenue",f:"revNew",fmt:"c",desc:true},{id:"convRate",label:"Conversion Rate",f:"convRate",fmt:"%",desc:true},{id:"contactRate",label:"Contact Rate",f:"contactRate",fmt:"%",desc:true},{id:"aov",label:"Avg Order Value",f:"aov",fmt:"c",desc:true},{id:"speed",label:"Speed to Contact",f:"speed",fmt:"h",desc:false},{id:"clinicVisits",label:"Clinic Visits",f:"clinicVisits",fmt:"n",desc:true},{id:"retPct",label:"Retention %",f:"retPct",fmt:"%",desc:true}];
const LB_APPT_CATS = [{id:"revenue",label:"Revenue",f:"revenue",fmt:"c",desc:true},{id:"visits",label:"Visit Count",f:"visits",fmt:"n",desc:true},{id:"visitPct",label:"Visit %",f:"visitPct",fmt:"%",desc:true},{id:"speed",label:"Speed to Contact",f:"speed",fmt:"h",desc:false},{id:"contactRate",label:"Contact Rate",f:"contactRate",fmt:"%",desc:true},{id:"pkgConv",label:"Package Conv Rate",f:"pkgConv",fmt:"%",desc:true},{id:"avgTicket",label:"Avg Package Ticket",f:"avgTicket",fmt:"c",desc:true}];

// Team aggregation
function aggregateTeam(agents, isOnline) {
  const sum = fn => agents.reduce((s, a) => s + fn(a), 0);
  const avg = fn => +(sum(fn) / agents.length).toFixed(1);
  const totalRevNew = sum(a => a.revenueNew);
  const totalSpend = sum(a => a.spendAttr);
  const common = { leadsReceived:sum(a=>a.leadsReceived),leads3Plus:sum(a=>a.leads3Plus),contactRate:avg(a=>a.contactRate),leadsResponded:sum(a=>a.leadsResponded),responseRate:avg(a=>a.responseRate),conversionRate:avg(a=>a.conversionRate),avgTimeToContact:avg(a=>a.avgTimeToContact),staleLeads:sum(a=>a.staleLeads),avgTouchesUnconv:avg(a=>a.avgTouchesUnconv),contactedViaCall:sum(a=>a.contactedViaCall),contactedViaWA:sum(a=>a.contactedViaWA),todayActionable:sum(a=>a.todayActionable),callsMade:sum(a=>a.callsMade),callsConnected:sum(a=>a.callsConnected),connectRate:avg(a=>a.connectRate),waLogged:sum(a=>a.waLogged),fuCompleted:sum(a=>a.fuCompleted),fuOverdue:sum(a=>a.fuOverdue),expectedCallsPerDay:sum(a=>a.expectedCallsPerDay),expectedFuPerDay:sum(a=>a.expectedFuPerDay),revenueNew:totalRevNew,cpl:145,spendAttr:totalSpend,roasVal:+(totalRevNew/totalSpend).toFixed(2),roasThresholdUp:6,roasThresholdDown:4,nextRebudget:"Apr 15",currentDailyLeads:sum(a=>a.currentDailyLeads),leadAge:{fresh:sum(a=>a.leadAge.fresh),aging:sum(a=>a.leadAge.aging),stale:sum(a=>a.leadAge.stale)},intentPipeline:[{n:"High Intent",c:sum(a=>a.intentPipeline[0].c),cl:COLORS.green},{n:"Considering",c:sum(a=>a.intentPipeline[1].c),cl:COLORS.blue},{n:"Exploring",c:sum(a=>a.intentPipeline[2].c),cl:COLORS.amber},{n:"Disengaged",c:sum(a=>a.intentPipeline[3].c),cl:COLORS.red},{n:"Unqualified",c:sum(a=>a.intentPipeline[4].c),cl:COLORS.gray}],topObjections:[{n:"Price / Budget",c:sum(a=>a.topObjections[0].c)},{n:"Timing / Not Ready",c:sum(a=>a.topObjections[1].c)},{n:"Trust / Results",c:sum(a=>a.topObjections[2].c)},{n:"Needs Information",c:sum(a=>a.topObjections[3].c)},{n:"Distance",c:sum(a=>a.topObjections[4].c)}],contestLive:false,daysElapsed:27,totalDays:31 };
  if (isOnline) return { ...common, target:sum(a=>a.target),revenueCross:sum(a=>a.revenueCross),revPrepaid:sum(a=>a.revPrepaid),revCOD:sum(a=>a.revCOD),ordersPrepaid:sum(a=>a.ordersPrepaid),ordersCOD:sum(a=>a.ordersCOD),ordersTotal:sum(a=>a.ordersTotal),aov:Math.round((totalRevNew+sum(a=>a.revenueCross))/sum(a=>a.ordersTotal)),apptsBooked:sum(a=>a.apptsBooked),apptsVisited:sum(a=>a.apptsVisited),apptsNoShow:sum(a=>a.apptsNoShow),apptsVisitRate:avg(a=>a.apptsVisitRate),apptsUpcoming:sum(a=>a.apptsUpcoming),apptsByClinic:{Chandigarh:32,Ludhiana:24,Delhi:22,Bathinda:16,Amritsar:20,Jalandhar:14,Karnal:6},clinicVisits:sum(a=>a.clinicVisits),retentionPct:avg(a=>a.retentionPct),todayOrders:sum(a=>a.todayOrders),todayRevenue:sum(a=>a.todayRevenue) };
  return { ...common, targetVisits:sum(a=>a.targetVisits),targetRevenue:sum(a=>a.targetRevenue),apptsBooked:sum(a=>a.apptsBooked),apptsVisited:sum(a=>a.apptsVisited),apptsNoShow:sum(a=>a.apptsNoShow),apptsVisitRate:avg(a=>a.apptsVisitRate),apptsUpcoming:sum(a=>a.apptsUpcoming),advanceCollected:sum(a=>a.advanceCollected),revenueFromVisits:sum(a=>a.revenueFromVisits),pipelineValue:sum(a=>a.pipelineValue),apptsByClinic:{Chandigarh:38,Ludhiana:28,Delhi:24,Bathinda:18,Amritsar:22,Jalandhar:16,Karnal:10},patientOptedFor:{Packages:sum(a=>a.patientOptedFor.Packages),"Single Session":sum(a=>a.patientOptedFor["Single Session"]),"Product Only":sum(a=>a.patientOptedFor["Product Only"]),Consultation:sum(a=>a.patientOptedFor.Consultation)},rescheduleCount:sum(a=>a.rescheduleCount),rescheduledLeads:sum(a=>a.rescheduledLeads),multiReschedule:sum(a=>a.multiReschedule),packageConvRate:avg(a=>a.packageConvRate),avgPackageTicket:avg(a=>a.avgPackageTicket),todayVisits:sum(a=>a.todayVisits),todayRevenue:sum(a=>a.todayRevenue) };
}
const TEAM_OL = aggregateTeam(AGENTS_ONLINE, true);
const TEAM_AP = aggregateTeam(AGENTS_APPT, false);

/* ═══════════════════════════════════════════════════════════════
   ADMIN MOCK DATA — Company-level
   ═══════════════════════════════════════════════════════════════ */

const ADMIN_DATA = {
  companyTarget: 5150000,
  olRevenue: TEAM_OL.revenueNew + TEAM_OL.revenueCross, // ~2.49L total from online
  apRevenue: TEAM_AP.revenueFromVisits, // ~15.55L from appointments
  olTarget: TEAM_OL.target, apTarget: TEAM_AP.targetRevenue,
  todayRevenue: TEAM_OL.todayRevenue + TEAM_AP.todayRevenue,
  todayOrders: TEAM_OL.todayOrders, todayVisits: TEAM_AP.todayVisits,
  prevMonthRevenue: 4280000,
  // Revenue by clinic
  clinicRevenue: [
    { name: "Chandigarh", revenue: 1420000, target: 1500000, visits: 50, noShows: 8, orders: 32 },
    { name: "Ludhiana", revenue: 1150000, target: 1200000, visits: 38, noShows: 5, orders: 28 },
    { name: "Delhi", revenue: 810000, target: 900000, visits: 32, noShows: 9, orders: 22 },
    { name: "Amritsar", revenue: 580000, target: 650000, visits: 28, noShows: 4, orders: 18 },
    { name: "Bathinda", revenue: 420000, target: 500000, visits: 22, noShows: 6, orders: 14 },
    { name: "Jalandhar", revenue: 390000, target: 450000, visits: 20, noShows: 3, orders: 12 },
    { name: "Karnal", revenue: 310000, target: 350000, visits: 16, noShows: 5, orders: 8 },
  ],
  // Revenue by lead source
  leadSourceRevenue: [
    { source: "Interakt - Appointment", revenue: 1850000, leads: 1420, conversions: 92, spend: 285000 },
    { source: "Interakt - Product", revenue: 1240000, leads: 980, conversions: 78, spend: 198000 },
    { source: "IVR", revenue: 620000, leads: 540, conversions: 42, spend: 86000 },
    { source: "WhatsApp", revenue: 480000, leads: 380, conversions: 34, spend: 0 },
    { source: "Website - Gleuhr", revenue: 340000, leads: 290, conversions: 22, spend: 45000 },
    { source: "Social Media", revenue: 280000, leads: 250, conversions: 18, spend: 32000 },
    { source: "Qualified Lead", revenue: 180000, leads: 120, conversions: 14, spend: 0 },
    { source: "DigiPanda", revenue: 90000, leads: 85, conversions: 6, spend: 15000 },
  ],
  // Aggregate new vs cross-sell
  newRevenue: TEAM_OL.revenueNew + TEAM_AP.revenueNew,
  crossRevenue: TEAM_OL.revenueCross + (TEAM_AP.revenueFromVisits - TEAM_AP.revenueNew),
  prepaidRevenue: TEAM_OL.revPrepaid, codRevenue: TEAM_OL.revCOD,
  prepaidOrders: TEAM_OL.ordersPrepaid, codOrders: TEAM_OL.ordersCOD,
  // Operations
  undispatchedOrders: 14,
  totalStaleLeads: TEAM_OL.staleLeads + TEAM_AP.staleLeads,
  totalReschedules: TEAM_AP.rescheduleCount + TEAM_AP.multiReschedule,
  // Incentive payout
  totalIncentivePayout: AGENTS_ONLINE.reduce((s, a) => s + a.incentiveEarned + a.roasBonus, 0) + AGENTS_APPT.reduce((s, a) => s + a.totalIncentive, 0),
  daysElapsed: 27, totalDays: 31,
};

// Previous period team aggregates (for compare)
const PREV_TEAM_OL = {
  revenueNew: Object.values(AGENTS_ONLINE_PREV).reduce((s,a) => s + a.revenueNew, 0),
  revenueCross: Object.values(AGENTS_ONLINE_PREV).reduce((s,a) => s + a.revenueCross, 0),
  ordersTotal: Object.values(AGENTS_ONLINE_PREV).reduce((s,a) => s + a.ordersTotal, 0),
  staleLeads: 95,
  get totalRevenue() { return this.revenueNew + this.revenueCross; },
};
const PREV_TEAM_AP = {
  revenueFromVisits: Object.values(AGENTS_APPT_PREV).reduce((s,a) => s + a.revenueFromVisits, 0),
  apptsVisited: Object.values(AGENTS_APPT_PREV).reduce((s,a) => s + a.apptsVisited, 0),
  apptsBooked: Object.values(AGENTS_APPT_PREV).reduce((s,a) => s + a.apptsBooked, 0),
  advanceCollected: Object.values(AGENTS_APPT_PREV).reduce((s,a) => s + a.advanceCollected, 0),
  rescheduleCount: Object.values(AGENTS_APPT_PREV).reduce((s,a) => s + a.rescheduleCount, 0),
  staleLeads: 48,
};

/* ═══════════════════════════════════════════════════════════════
   BOTTLENECK DETECTION
   ═══════════════════════════════════════════════════════════════ */

function detectBottleneck(agent, isOnline, teamAvgs) {
  const issues = [];
  if (agent.contactRate < teamAvgs.contactRate - 5) issues.push({ metric: "Contact Rate", val: `${agent.contactRate}%`, severity: 3, tip: `Team avg ${teamAvgs.contactRate}%` });
  if (agent.avgTimeToContact > teamAvgs.avgTimeToContact + 1) issues.push({ metric: "Speed to Contact", val: `${agent.avgTimeToContact}h`, severity: 2, tip: `Team avg ${teamAvgs.avgTimeToContact}h` });
  if (agent.conversionRate < teamAvgs.conversionRate - 1.5) issues.push({ metric: "Conversion Rate", val: `${agent.conversionRate}%`, severity: 3, tip: `Team avg ${teamAvgs.conversionRate}%` });
  if (agent.fuOverdue > 20) issues.push({ metric: "Follow-ups Overdue", val: `${agent.fuOverdue}`, severity: 2, tip: "Needs immediate attention" });
  if (agent.staleLeads > 25) issues.push({ metric: "Stale Leads", val: `${agent.staleLeads}`, severity: 1, tip: "7+ days no contact" });
  const rev = isOnline ? agent.revenueNew + agent.revenueCross : agent.revenueFromVisits;
  const tgt = isOnline ? agent.target : agent.targetRevenue;
  if ((rev / tgt) / (agent.daysElapsed / agent.totalDays) < 0.65) issues.push({ metric: "Revenue Pace", val: `${((rev/tgt)/(agent.daysElapsed/agent.totalDays)*100).toFixed(0)}% of expected`, severity: 3, tip: "Significantly behind target" });
  return issues.sort((a, b) => b.severity - a.severity);
}

/* ═══════════════════════════════════════════════════════════════
   FORMATTERS & HELPERS
   ═══════════════════════════════════════════════════════════════ */

const fmt = {
  currency(n) { if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`; if (n >= 1000) return `₹${(n/1000).toFixed(1)}K`; return `₹${n}`; },
  value(v, type) { if (type === "c") return fmt.currency(v); if (type === "%") return `${v}%`; if (type === "h") return `${v}h`; return `${v}`; },
  delta(current, previous) { if (!previous) return null; const d = ((current - previous) / previous) * 100; return { pct: Math.abs(d).toFixed(1), up: d > 0 }; },
  paceStatus(achieved, target, daysElapsed, totalDays) { const r = (achieved/target)/(daysElapsed/totalDays); return r >= 0.95 ? "green" : r >= 0.70 ? "amber" : "red"; },
  heatColor(val, thresholds) { return val >= thresholds[0] ? COLORS.green : val >= thresholds[1] ? COLORS.amber : COLORS.red; },
};

/* ═══════════════════════════════════════════════════════════════
   SVG ICON SYSTEM
   ═══════════════════════════════════════════════════════════════ */

const ICON_PATHS = {
  trendUp:<><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></>,trendDown:<><path d="M23 18l-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/></>,phone:<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>,message:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,clock:<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,check:<path d="M20 6L9 17l-5-5"/>,target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,zap:<path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/>,alert:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>,user:<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,users:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,calendar:<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,trophy:<><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></>,refresh:<><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,chevDown:<path d="M6 9l6 6 6-6"/>,chevUp:<path d="M18 15l-6-6-6 6"/>,star:<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,arrowRight:<><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>,arrowLeft:<><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></>,building:<><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></>,
};
function Icon({ name, size = 16, color = "currentColor" }) {
  return <svg style={{width:size,height:size,flexShrink:0,display:"inline-block",verticalAlign:"middle"}} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{ICON_PATHS[name]}</svg>;
}

/* ═══════════════════════════════════════════════════════════════
   REUSABLE MICRO-COMPONENTS (shared across all views)
   ═══════════════════════════════════════════════════════════════ */

function Delta({current,previous,invert}){const d=fmt.delta(current,previous);if(!d)return null;const good=invert?!d.up:d.up;return <span className={`delta ${good?"up":"dn"}`}><Icon name={d.up?"trendUp":"trendDown"} size={10}/> {d.pct}%</span>;}
function Pill({type,children}){return <span className={`pill pill-${type}`}>{children}</span>;}
function MetricCard({label,value,sub,color}){return <div className="mc"><div className="mc-l">{label}</div><div className="mc-v" style={color?{color}:undefined}>{value}</div>{sub&&<div className="mc-s">{sub}</div>}</div>;}
function ClinicBars({data}){const e=Object.entries(data).sort((a,b)=>b[1]-a[1]);const mx=e[0]?.[1]||1;return <div className="cbars">{e.map(([c,v])=><div key={c} className="cbr"><span className="cbr-nm">{c}</span><div className="cbr-bar"><div className="cbr-fill" style={{width:`${(v/mx)*100}%`}}>{v}</div></div></div>)}</div>;}
function SectionLabel({children}){return <div className="sec-label">{children}</div>;}
function MetricRow({cols=4,children}){return <div className={`metric-row mr-${cols}`}>{children}</div>;}
function Metric({value,label,color,small,children}){return <div className="metric"><div className={`metric-val ${small?"sm":""}`} style={color?{color}:undefined}>{value}</div><div className="metric-label">{label}{children}</div></div>;}
function TabbedBox({tabs,activeTab,onTabChange,children}){return <div className="tbox"><div className="tbox-tabs">{tabs.map(([k,l])=><div key={k} className={`tbox-tab ${activeTab===k?"active":""}`} onClick={()=>onTabChange(k)}>{l}</div>)}</div><div className="tbox-body">{children}</div></div>;}

/* ═══════════════════════════════════════════════════════════════
   AGENT VIEW COMPONENTS (TodayStrip, ContestHero, TargetHero,
   RoasTab, ActivityTab, FunnelSection, AppointmentsSection,
   IncentiveSection — unchanged from previous build)
   ═══════════════════════════════════════════════════════════════ */

function TodayStrip({m,isOnline,isTeam}){
  const items=[{icon:"alert",label:"Leads need action",value:m.todayActionable,warn:m.todayActionable>(isTeam?80:20)},{icon:"clock",label:"Follow-ups overdue",value:m.fuOverdue,warn:m.fuOverdue>(isTeam?40:10)},{icon:"check",label:isOnline?(isTeam?"Team orders":"Orders today"):(isTeam?"Team visits":"Visits today"),value:isOnline?m.todayOrders:(m.todayVisits||0),accent:true},{icon:"zap",label:"Today's revenue",value:fmt.currency(m.todayRevenue),accent:true}];
  return <div className="today-strip">{items.map((it,i)=><div key={i} className={`ts-item ${it.warn?"ts-warn":""} ${it.accent?"ts-accent":""}`}><Icon name={it.icon} size={14}/><span className="ts-val">{it.value}</span><span className="ts-label">{it.label}</span></div>)}{!isTeam&&m.bestDay&&<div className="ts-best"><Icon name="star" size={12}/> Best day: {fmt.currency(m.bestDay.revenue)} ({m.bestDay.date})</div>}</div>;
}

function ContestHero({m}){if(!m.contestLive)return null;const pct=(m.contestAchieved/m.contestTarget)*100;return <div className="contest"><div className="contest-title"><Icon name="trophy" size={16} color="#92400e"/> {m.contestName}</div><div className="contest-period">{m.contestPeriod}</div><div className="contest-body"><div className="contest-progress"><div className="contest-bar"><div className="contest-bar-fill" style={{width:`${Math.min(pct,100)}%`}}/></div><div className="contest-stat"><strong>{m.contestAchieved}</strong> / {m.contestTarget} · {pct.toFixed(0)}%</div></div><div className="contest-tiers">{m.contestTiers.map((t,i)=><div key={i} className={`contest-tier ${pct>=t.pct?"unlocked":""}`}><div className="contest-tier-pct">{t.pct}%</div><div className="contest-tier-reward">{t.reward}</div></div>)}</div></div></div>;}

function TargetHero({m,isOnline,label}){
  const totalRev=isOnline?m.revenueNew+m.revenueCross:m.revenueFromVisits;const targetVal=isOnline?m.target:m.targetRevenue;const pct=(totalRev/targetVal)*100;const deficit=targetVal-totalRev;const daysLeft=m.totalDays-m.daysElapsed;const dailyNeeded=daysLeft>0&&deficit>0?Math.ceil(deficit/daysLeft):0;const dailyCurrent=m.daysElapsed>0?Math.ceil(totalRev/m.daysElapsed):0;const paceColor=fmt.paceStatus(totalRev,targetVal,m.daysElapsed,m.totalDays);const barColorMap={green:COLORS.green,amber:COLORS.amber,red:COLORS.red};
  return <div className="hero"><div className="hero-top"><div><div className="hero-val-row"><span className="hero-val">{fmt.currency(totalRev)}</span><span className={`hero-badge badge-${paceColor}`}><Icon name={paceColor==="green"?"trendUp":"target"} size={13}/> {pct.toFixed(1)}%</span></div><div className="hero-sub">{label||(isOnline?"Revenue achieved this month":<><strong>{m.apptsVisited} visits</strong> · Revenue achieved this month</>)}</div></div><div className="hero-target"><div className="hero-target-label">Target</div><div className="hero-target-val">{fmt.currency(targetVal)}</div>{!isOnline&&<div className="hero-target-sub">{m.targetVisits} visits</div>}</div></div><div className="hero-progress"><div className="hero-bar"><div className="hero-bar-fill" style={{width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg, ${barColorMap[paceColor]}88, ${barColorMap[paceColor]})`}}/><div className="hero-pace-marker" style={{left:`${(m.daysElapsed/m.totalDays)*100}%`}}/></div><div className="hero-marks"><span>₹0</span><span>25%</span><span>50%</span><span>75%</span><span>{fmt.currency(targetVal)}</span></div></div><div className="hero-stats"><div className="hero-stat"><div className="hs-label">{deficit>0?"Remaining":"Surplus"}</div><div className={`hs-val ${deficit>0?"c-red":"c-green"}`}>{fmt.currency(Math.abs(deficit))}</div></div><div className="hero-stat"><div className="hs-label">Days Left</div><div className="hs-val">{daysLeft}</div><div className="hs-sub">of {m.totalDays} days</div></div><div className="hero-stat"><div className="hs-label">Need Per Day</div><div className="hs-val">{dailyNeeded>0?fmt.currency(dailyNeeded):"—"}</div><div className="hs-sub">Current: {fmt.currency(dailyCurrent)}/day</div></div></div></div>;
}

function RoasTab({m,pm,cmp}){const rc=m.roasVal>=6?COLORS.green:m.roasVal>=4?COLORS.amber:COLORS.red;const bg=m.roasVal>=6?COLORS.greenBg:m.roasVal>=4?COLORS.amberBg:COLORS.redBg;const bc=m.roasVal>=6?COLORS.greenBorder:m.roasVal>=4?COLORS.amberBorder:COLORS.redBorder;return <div><MetricRow cols={3}><Metric value={`${m.roasVal}x`} label="ROAS" color={rc}>{cmp&&pm&&<Delta current={m.roasVal} previous={pm.roasVal}/>}</Metric><Metric value={fmt.currency(m.spendAttr)} label="Attributed Spend" small/><Metric value={`${m.currentDailyLeads}/day`} label="Lead Allocation" small/></MetricRow><div className="roas-status" style={{background:bg,borderColor:bc}}><div className="roas-status-title" style={{color:rc}}>{m.roasVal>=6?"🚀 Budget Increase Eligible":m.roasVal>=4?"📈 On track — push for 6x+":"⚠️ Budget Decrease Risk"}</div><div className="roas-status-body">{m.roasVal>=6?`ROAS ${m.roasVal}x exceeds ${m.roasThresholdUp}x.`:m.roasVal>=4?`ROAS ${m.roasVal}x between ${m.roasThresholdDown}x–${m.roasThresholdUp}x.`:`ROAS ${m.roasVal}x below ${m.roasThresholdDown}x.`}</div><div className="roas-status-note">ROAS = <strong>new patient revenue</strong> / spend · Next: <strong>{m.nextRebudget}</strong></div></div></div>;}

function ActivityTab({m,pm,cmp}){const ec=m.expectedCallsPerDay*m.daysElapsed;const ef=m.expectedFuPerDay*m.daysElapsed;return <div><MetricRow cols={4}><Metric value={m.callsMade} label="Calls Made">{cmp&&pm&&<Delta current={m.callsMade} previous={pm.callsMade}/>}</Metric><Metric value={<>{m.callsConnected} <span className="metric-aside">({m.connectRate}%)</span></>} label="Connected" small/><Metric value={m.waLogged} label="WhatsApp" small/><Metric value={<><span className="c-green">{m.fuCompleted}</span> / <span className="c-red">{m.fuOverdue}</span></>} label="FU Done / Overdue" small/></MetricRow><div className="activity-benchmarks"><div className={`bench ${m.callsMade>=ec*0.9?"bench-ok":"bench-warn"}`}><Icon name={m.callsMade>=ec*0.9?"check":"alert"} size={12}/> Calls: {m.callsMade} of {ec} expected</div><div className={`bench ${m.fuCompleted>=ef*0.9?"bench-ok":"bench-warn"}`}><Icon name={m.fuCompleted>=ef*0.9?"check":"alert"} size={12}/> FU: {m.fuCompleted} of {ef} expected</div></div></div>;}

function FunnelSection({m,pm,cmp,isOnline}){const[expanded,setExpanded]=useState(false);const cv=isOnline?m.ordersTotal:m.apptsVisited;const steps=[{label:"Received",val:m.leadsReceived,color:BRAND.accent},{label:"Contacted (3+)",val:m.leads3Plus,color:"#e8601e"},{label:"Responded",val:m.leadsResponded,color:"#f0a500"},{label:isOnline?"Orders":"Visit Done",val:cv,color:COLORS.green}];const mx=steps[0].val;const fuPct=m.fuCompleted>0?((m.fuCompleted/(m.fuCompleted+m.fuOverdue))*100).toFixed(0):0;const callPct=((m.contactedViaCall/(m.contactedViaCall+m.contactedViaWA))*100).toFixed(0);return <div className="funnel"><div className="funnel-header"><div className="funnel-title"><Icon name="zap" size={16}/> Lead Funnel</div></div><div className="funnel-bars">{steps.map((s,i)=>{const w=Math.max((s.val/mx)*100,8);const drop=i>0?(((steps[i-1].val-s.val)/steps[i-1].val)*100).toFixed(0):null;return <div key={s.label}>{i>0&&<div className="funnel-drop"><div className="funnel-drop-line"/><div className="funnel-drop-text">▾ {drop}% drop</div></div>}<div className="funnel-step"><div className="funnel-step-label">{s.label}</div><div className="funnel-step-bar" style={{width:`${w}%`,background:s.color}}><span className="funnel-step-val">{s.val}</span></div>{i>0&&<span className="funnel-step-pct">{((s.val/mx)*100).toFixed(1)}%</span>}</div></div>;})}</div>{m.leadAge&&<div className="lead-age"><div className="lead-age-title">Lead Age Distribution</div><div className="lead-age-buckets"><div className="la-bucket"><div className="la-val c-green">{m.leadAge.fresh}</div><div className="la-label">Fresh (0-2d)</div></div><div className="la-bucket"><div className="la-val c-amber">{m.leadAge.aging}</div><div className="la-label">Aging (3-6d)</div></div><div className="la-bucket"><div className={`la-val ${m.leadAge.stale>15?"c-red":"c-amber"}`}>{m.leadAge.stale}</div><div className="la-label">Stale (7d+)</div></div></div></div>}<button className="funnel-expand" onClick={()=>setExpanded(!expanded)}><Icon name={expanded?"chevUp":"chevDown"} size={14}/>{expanded?"Hide metrics":"Show metrics"}</button>{expanded&&<div className="funnel-detail"><div className="mc-grid"><MetricCard label="Contact Rate" value={<>{m.contactRate}%{cmp&&pm&&<Delta current={m.contactRate} previous={pm.contactRate}/>}</>} sub={`3+ on ${m.leads3Plus} of ${m.leadsReceived}`}/><MetricCard label="Response Rate" value={`${m.responseRate}%`} sub={`${m.leadsResponded} replied`}/><MetricCard label="Speed" value={`${m.avgTimeToContact}h`} sub="Avg after assignment"/><MetricCard label="FU Compliance" value={`${fuPct}%`} sub={`${m.fuCompleted} on time`}/></div><div className="mc-grid"><MetricCard label="Stale" value={m.staleLeads} color={m.staleLeads>15?COLORS.red:COLORS.amber} sub="7d+ no contact"/><MetricCard label="Channel" value={<><Icon name="phone" size={13}/> {m.contactedViaCall} · <Icon name="message" size={13}/> {m.contactedViaWA}</>} sub={`${callPct}% calls`}/><MetricCard label="Avg Touches" value={m.avgTouchesUnconv} sub={m.avgTouchesUnconv<4?"Giving up early":"Good"}/><MetricCard label="Conv Rate" value={<>{m.conversionRate}%{cmp&&pm&&<Delta current={m.conversionRate} previous={pm.conversionRate}/>}</>} sub={isOnline?"→ Order":"→ Visit"}/></div><div className="pipeline-section"><div className="pipeline-title">Intent Pipeline</div><div className="pills-row">{m.intentPipeline.map(s=><div key={s.n} className="intent-pill"><div className="pill-dot" style={{background:s.cl}}/><span className="pill-name">{s.n}</span><span className="pill-count">{s.c}</span></div>)}</div></div></div>}</div>;}

function IncentiveSection({m,isOnline}){const totalRev=isOnline?m.revenueNew+m.revenueCross:m.revenueFromVisits;const totalEarned=isOnline?m.incentiveEarned+m.roasBonus:m.totalIncentive;return <div className="incentive"><div className="inc-header"><div className="inc-bar"/><div className="inc-title">Incentive</div><div className="inc-role">{isOnline?"Online":"Appointment"}</div></div><div className="inc-earned">{fmt.currency(totalEarned)}</div><div className="inc-sub">Total earned this month</div><div className="inc-grid"><div className="inc-card"><div className="inc-card-label">{isOnline?"Revenue":"Slab"}</div><div className="inc-card-val">{fmt.currency(isOnline?m.incentiveEarned:m.slabIncentive)}</div></div><div className="inc-card"><div className="inc-card-label">ROAS Bonus</div><div className="inc-card-val c-green">{fmt.currency(m.roasBonus)}</div></div>{!isOnline&&<div className="inc-card"><div className="inc-card-label">Rev Commission</div><div className="inc-card-val">{fmt.currency(m.revenueIncentive)}</div></div>}</div><div className="inc-section-label">ROAS Bonus Slabs</div><div className="inc-slabs">{m.roasBonusSlabs.map((s,i)=><div key={i} className={`inc-slab ${s.r===m.roasSlab?"active":""}`}><div className="inc-slab-range">{s.r}</div><div className="inc-slab-amount">{s.a===0?"—":fmt.currency(s.a)}</div></div>)}</div></div>;}

function AppointmentsSection({m,pm,cmp}){return <div className="two-col"><div className="card"><div className="card-row"><span className="card-label">Booked</span><span className="card-val">{m.apptsBooked}</span></div><div className="card-row"><span className="card-label">Visited</span><span className="card-val c-green">{m.apptsVisited}</span></div><div className="card-row"><span className="card-label">No-Shows</span><span className="card-val c-red">{m.apptsNoShow}</span></div><div className="card-row"><span className="card-label">Visit Rate</span><span className="card-val">{m.apptsVisitRate}%</span></div></div><div className="card"><div className="card-title">By Clinic</div><ClinicBars data={m.apptsByClinic}/></div></div>;}

/* ═══════════════════════════════════════════════════════════════
   LEADERBOARD (shared — clickable rows for TL/Admin)
   ═══════════════════════════════════════════════════════════════ */

function Leaderboard({cats,data,activeCat,onCatChange,cmp,isOnline,onAgentClick}){
  const curCat=cats.find(c=>c.id===activeCat)||cats[0];const sorted=useMemo(()=>[...data].sort((a,b)=>curCat.desc?b[curCat.f]-a[curCat.f]:a[curCat.f]-b[curCat.f]),[activeCat,data,curCat]);const bestVal=sorted[0]?.[curCat.f]||1;const worstVal=sorted[sorted.length-1]?.[curCat.f]||1;
  return <><div className="lb-cats">{cats.map(c=><button key={c.id} className={`lb-cat ${activeCat===c.id?"active":""}`} onClick={()=>onCatChange(c.id)}>{c.label}</button>)}</div><div style={{overflowX:"auto"}}><table className="lb-table"><thead><tr><th style={{width:50}}>Rank</th><th>Agent</th><th>{curCat.label}</th>{cmp&&<th>Prev</th>}{cmp&&<th>Change</th>}<th style={{width:140}}></th></tr></thead><tbody>{sorted.map((agent,i)=>{const v=agent[curCat.f];const pv=agent.prev?.[curCat.f]??null;const isMe=!onAgentClick&&((isOnline&&agent.id===1)||(!isOnline&&agent.id===6));const d=pv!=null?fmt.delta(v,pv):null;const isGood=d?(curCat.desc?d.up:!d.up):null;let barPct=curCat.desc?(v/bestVal)*100:(worstVal===bestVal?100:((worstVal-v)/(worstVal-bestVal))*80+20);return <tr key={agent.id} className={`${isMe?"row-me":""} ${onAgentClick?"row-clickable":""}`} onClick={()=>onAgentClick&&onAgentClick(agent.id)}><td><span className={`lb-rank ${i<3?`rank-${i+1}`:""}`}>{i+1}</span></td><td><span className="lb-name">{agent.name} {isMe&&<span className="lb-you">(You)</span>}</span></td><td className="lb-val">{fmt.value(v,curCat.fmt)}</td>{cmp&&<td className="lb-prev">{pv!=null?fmt.value(pv,curCat.fmt):"—"}</td>}{cmp&&<td>{d?<span className={`delta-badge ${isGood?"delta-good":"delta-bad"}`}><Icon name={d.up?"trendUp":"trendDown"} size={10}/> {d.pct}%</span>:<span className="lb-prev">—</span>}</td>}<td><span className="lb-vis-bar"><span className="lb-vis-fill" style={{width:`${barPct}%`,background:i===0?BRAND.accent:i===1?"#e8601e":i===2?"#f0a500":COLORS.grayLight}}/></span></td></tr>;})}</tbody></table></div></>;
}

/* ═══════════════════════════════════════════════════════════════
   TL VIEW COMPONENTS (AgentCard, AgentDetailView, TeamOverviewPage)
   ═══════════════════════════════════════════════════════════════ */

function AgentCard({agent,isOnline,bottlenecks,onClick}){const rev=isOnline?agent.revenueNew+agent.revenueCross:agent.revenueFromVisits;const tgt=isOnline?agent.target:agent.targetRevenue;const pct=(rev/tgt)*100;const pc=fmt.paceStatus(rev,tgt,agent.daysElapsed,agent.totalDays);const top=bottlenecks[0]||null;return <div className="agent-card" onClick={onClick}><div className="ac-top"><div className="ac-avatar">{agent.name.split(" ").map(w=>w[0]).join("")}</div><div className="ac-info"><div className="ac-name">{agent.name}</div><div className="ac-rev">{fmt.currency(rev)} <span className={`ac-pct ac-pct-${pc}`}>{pct.toFixed(0)}%</span></div></div><div className="ac-target"><div className="ac-target-label">Target</div><div className="ac-target-val">{fmt.currency(tgt)}</div></div></div><div className="ac-bar"><div className="ac-bar-fill" style={{width:`${Math.min(pct,100)}%`,background:{green:COLORS.green,amber:COLORS.amber,red:COLORS.red}[pc]}}/></div><div className="ac-metrics"><div className="ac-metric"><div className="ac-metric-val">{agent.todayCalls||0}</div><div className="ac-metric-label">Calls</div></div><div className="ac-metric"><div className="ac-metric-val">{agent.todayContacts||0}</div><div className="ac-metric-label">Contacts</div></div><div className="ac-metric"><div className="ac-metric-val">{agent.todayFollowups||0}</div><div className="ac-metric-label">Follow-ups</div></div><div className="ac-metric"><div className="ac-metric-val" style={{color:BRAND.accent}}>{isOnline?(agent.todayOrders||0):(agent.todayVisits||0)}</div><div className="ac-metric-label">{isOnline?"Orders":"Visits"}</div></div></div>{top&&<div className="ac-bottleneck"><Icon name="alert" size={12}/><span className="ac-bn-metric">{top.metric}: {top.val}</span><span className="ac-bn-tip">{top.tip}</span></div>}<div className="ac-footer"><span className="ac-view">View Details <Icon name="arrowRight" size={12}/></span></div></div>;}

function AgentDetailView({agent,prev,isOnline,compare,onBack}){const[revTab,setRevTab]=useState("total");const[apptTab,setApptTab]=useState("overview");const totalRev=isOnline?agent.revenueNew+agent.revenueCross:agent.revenueFromVisits;return <><button className="back-btn" onClick={onBack}><Icon name="arrowLeft" size={14}/> Back</button><div className="agent-detail-header"><div className="adh-avatar">{agent.name.split(" ").map(w=>w[0]).join("")}</div><div><div className="adh-name">{agent.name}</div><div className="adh-role">{isOnline?"Online":"Appointment"} Agent</div></div></div><TodayStrip m={agent} isOnline={isOnline}/><ContestHero m={agent}/><TargetHero m={agent} isOnline={isOnline} label={`${agent.name.split(" ")[0]}'s revenue`}/>{isOnline&&<><TabbedBox tabs={[["total","Total"],["roas","ROAS"],["activity","Activity"]]} activeTab={revTab} onTabChange={setRevTab}>{revTab==="total"&&<MetricRow cols={4}><Metric value={fmt.currency(totalRev)} label="Revenue"/><Metric value={agent.ordersTotal} label="Orders" small/><Metric value={fmt.currency(agent.aov)} label="AOV" small/><Metric value={fmt.currency(agent.cpl)} label="CPL" small/></MetricRow>}{revTab==="roas"&&<RoasTab m={agent} pm={prev} cmp={compare}/>}{revTab==="activity"&&<ActivityTab m={agent} pm={prev} cmp={compare}/>}</TabbedBox><FunnelSection m={agent} pm={prev} cmp={compare} isOnline={true}/></>}{!isOnline&&<><TabbedBox tabs={[["overview","Overview"],["roas","ROAS"],["activity","Activity"]]} activeTab={apptTab} onTabChange={setApptTab}>{apptTab==="overview"&&<MetricRow cols={4}><Metric value={agent.apptsBooked} label="Booked"/><Metric value={agent.apptsVisited} label="Visited" color={COLORS.green}/><Metric value={agent.apptsNoShow} label="No-Shows" color={COLORS.red}/><Metric value={fmt.currency(agent.advanceCollected)} label="Advance" small/></MetricRow>}{apptTab==="roas"&&<RoasTab m={agent} pm={prev} cmp={compare}/>}{apptTab==="activity"&&<ActivityTab m={agent} pm={prev} cmp={compare}/>}</TabbedBox><FunnelSection m={agent} pm={prev} cmp={compare} isOnline={false}/></>}<SectionLabel>Incentive</SectionLabel><IncentiveSection m={agent} isOnline={isOnline}/></>;}

function TeamOverviewPage({teamData,agents,isOnline,compare,onAgentClick}){
  const teamAvgs={contactRate:+(agents.reduce((s,a)=>s+a.contactRate,0)/agents.length).toFixed(1),conversionRate:+(agents.reduce((s,a)=>s+a.conversionRate,0)/agents.length).toFixed(1),avgTimeToContact:+(agents.reduce((s,a)=>s+a.avgTimeToContact,0)/agents.length).toFixed(1)};
  const sortedAgents=[...agents].sort((a,b)=>{const rA=isOnline?a.revenueNew+a.revenueCross:a.revenueFromVisits;const rB=isOnline?b.revenueNew+b.revenueCross:b.revenueFromVisits;return rB-rA;});
  return <><TodayStrip m={teamData} isOnline={isOnline} isTeam/><TargetHero m={teamData} isOnline={isOnline} label="Team revenue this month"/><SectionLabel>Agent Performance</SectionLabel><div className="agent-cards-grid">{sortedAgents.map(a=><AgentCard key={a.id} agent={a} isOnline={isOnline} bottlenecks={detectBottleneck(a,isOnline,teamAvgs)} onClick={()=>onAgentClick(a.id)}/>)}</div><SectionLabel>Team Funnel</SectionLabel><FunnelSection m={teamData} pm={null} cmp={false} isOnline={isOnline}/></>;
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN VIEW — Compact Company + Separate Team Pages
   ═══════════════════════════════════════════════════════════════ */

// Admin Online Team — overview + single agent table with compare
function AdminOnlinePage({ agents, teamData, prevTeam, compare }) {
  const teamRev = teamData.revenueNew + teamData.revenueCross;
  const prevRev = prevTeam ? prevTeam.totalRevenue : null;
  return (
    <>
      <div className="today-strip">
        <div className="ts-item ts-accent"><Icon name="zap" size={14}/><span className="ts-val">{fmt.currency(teamData.todayRevenue)}</span><span className="ts-label">Today's revenue</span></div>
        <div className="ts-item"><Icon name="check" size={14}/><span className="ts-val">{teamData.todayOrders}</span><span className="ts-label">Orders today</span></div>
        <div className="ts-item"><Icon name="alert" size={14}/><span className="ts-val">{teamData.staleLeads}</span><span className="ts-label">Stale leads{compare && prevTeam && <Delta current={teamData.staleLeads} previous={prevTeam.staleLeads} invert/>}</span></div>
      </div>
      <TargetHero m={teamData} isOnline={true} label="Online team revenue this month"/>
      <SectionLabel>Agent Performance</SectionLabel>
      <div style={{overflowX:"auto"}}>
        <table className="lb-table">
          <thead><tr>
            <th>Agent</th><th>Revenue{compare ? " ▾" : ""}</th>{compare && <th>Prev</th>}
            <th>% Target</th><th>New</th><th>Cross-sell</th><th>Prepaid</th><th>COD</th>
            <th>ROAS</th><th>Contact %</th><th>Conv %</th>
          </tr></thead>
          <tbody>{[...agents].sort((a,b)=>(b.revenueNew+b.revenueCross)-(a.revenueNew+a.revenueCross)).map(a => {
            const rev = a.revenueNew + a.revenueCross;
            const tPct = (rev / a.target) * 100;
            const pace = fmt.paceStatus(rev, a.target, a.daysElapsed, a.totalDays);
            const prev = compare ? AGENTS_ONLINE_PREV[a.id] : null;
            const prevRev = prev ? prev.revenueNew + prev.revenueCross : null;
            return <tr key={a.id}>
              <td className="lb-name">{a.name}</td>
              <td className="lb-val">{fmt.currency(rev)}{compare && prevRev && <Delta current={rev} previous={prevRev}/>}</td>
              {compare && <td className="lb-prev">{prevRev ? fmt.currency(prevRev) : "—"}</td>}
              <td style={{color:{green:COLORS.green,amber:COLORS.amber,red:COLORS.red}[pace],fontWeight:700}}>{tPct.toFixed(0)}%</td>
              <td>{fmt.currency(a.revenueNew)}</td>
              <td>{fmt.currency(a.revenueCross)}</td>
              <td style={{color:COLORS.green}}>{fmt.currency(a.revPrepaid)}</td>
              <td style={{color:COLORS.amber}}>{fmt.currency(a.revCOD)}</td>
              <td style={{color:a.roasVal>=4?COLORS.green:a.roasVal>=2.5?COLORS.amber:COLORS.red,fontWeight:700}}>{a.roasVal}x{compare && prev && <Delta current={a.roasVal} previous={prev.roasVal}/>}</td>
              <td style={{color:fmt.heatColor(a.contactRate,[60,45])}}>{a.contactRate}%{compare && prev && <Delta current={a.contactRate} previous={prev.contactRate}/>}</td>
              <td style={{color:fmt.heatColor(a.conversionRate,[9,7])}}>{a.conversionRate}%{compare && prev && <Delta current={a.conversionRate} previous={prev.conversionRate}/>}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </>
  );
}

// Admin Appointment Team — 3 tabs with compare
function AdminApptPage({ agents, teamData, ad, prevTeam, compare }) {
  const [tab, setTab] = useState("overview");
  return (
    <>
      <div className="today-strip">
        <div className="ts-item ts-accent"><Icon name="zap" size={14}/><span className="ts-val">{fmt.currency(teamData.todayRevenue)}</span><span className="ts-label">Today's revenue</span></div>
        <div className="ts-item"><Icon name="check" size={14}/><span className="ts-val">{teamData.todayVisits}</span><span className="ts-label">Visits today</span></div>
        <div className="ts-item"><Icon name="alert" size={14}/><span className="ts-val">{teamData.staleLeads}</span><span className="ts-label">Stale leads{compare && prevTeam && <Delta current={teamData.staleLeads} previous={prevTeam.staleLeads} invert/>}</span></div>
      </div>
      <TargetHero m={teamData} isOnline={false} label="Appointment team revenue this month"/>
      <TabbedBox tabs={[["overview","Overview"],["agent","By Agent"],["clinic","By Clinic"]]} activeTab={tab} onTabChange={setTab}>
        {tab === "overview" && <div>
          <MetricRow cols={4}>
            <Metric value={teamData.apptsBooked} label="Booked">{compare && prevTeam && <Delta current={teamData.apptsBooked} previous={prevTeam.apptsBooked}/>}</Metric>
            <Metric value={teamData.apptsVisited} label="Visited" color={COLORS.green}>{compare && prevTeam && <Delta current={teamData.apptsVisited} previous={prevTeam.apptsVisited}/>}</Metric>
            <Metric value={teamData.apptsNoShow} label={`No-Shows (${(100 - teamData.apptsVisitRate).toFixed(0)}%)`} color={COLORS.red}/>
            <Metric value={fmt.currency(teamData.advanceCollected)} label="Advance Collected" small>{compare && prevTeam && <Delta current={teamData.advanceCollected} previous={prevTeam.advanceCollected}/>}</Metric>
          </MetricRow>
          <div style={{borderTop:`1px solid ${COLORS.grayLight}`,marginTop:16,paddingTop:16}}>
            <div className="sec-label" style={{marginTop:0}}>Patient Opted For</div>
            <MetricRow cols={4}>
              {Object.entries(teamData.patientOptedFor).map(([k,v]) => <Metric key={k} value={v} label={`${k} (${teamData.apptsVisited > 0 ? ((v/teamData.apptsVisited)*100).toFixed(0) : 0}%)`} small/>)}
            </MetricRow>
          </div>
          <div style={{borderTop:`1px solid ${COLORS.grayLight}`,marginTop:16,paddingTop:16}}>
            <div className="sec-label" style={{marginTop:0}}>Operations</div>
            <MetricRow cols={3}>
              <Metric value={teamData.rescheduleCount} label="Reschedules" color={teamData.rescheduleCount > 30 ? COLORS.red : COLORS.amber} small>{compare && prevTeam && <Delta current={teamData.rescheduleCount} previous={prevTeam.rescheduleCount} invert/>}</Metric>
              <Metric value={teamData.multiReschedule} label="Rescheduled 2+" color={COLORS.red} small/>
              <Metric value={fmt.currency(teamData.pipelineValue)} label="Pipeline Value" small/>
            </MetricRow>
          </div>
        </div>}
        {tab === "agent" && <div style={{overflowX:"auto"}}>
          <table className="lb-table">
            <thead><tr>
              <th>Agent</th><th>Revenue{compare ? " ▾" : ""}</th>{compare && <th>Prev</th>}
              <th>Visits</th><th>% Target</th><th>ROAS</th><th>Contact %</th>
              <th>Pkg Conv %</th><th>No-Shows</th><th>Reschedules</th>
            </tr></thead>
            <tbody>{[...agents].sort((a,b)=>b.revenueFromVisits-a.revenueFromVisits).map(a => {
              const tPct = (a.revenueFromVisits / a.targetRevenue) * 100;
              const pace = fmt.paceStatus(a.revenueFromVisits, a.targetRevenue, a.daysElapsed, a.totalDays);
              const prev = compare ? AGENTS_APPT_PREV[a.id] : null;
              return <tr key={a.id}>
                <td className="lb-name">{a.name}</td>
                <td className="lb-val">{fmt.currency(a.revenueFromVisits)}{compare && prev && <Delta current={a.revenueFromVisits} previous={prev.revenueFromVisits}/>}</td>
                {compare && <td className="lb-prev">{prev ? fmt.currency(prev.revenueFromVisits) : "—"}</td>}
                <td>{a.apptsVisited}{compare && prev && <Delta current={a.apptsVisited} previous={prev.apptsVisited}/>}</td>
                <td style={{color:{green:COLORS.green,amber:COLORS.amber,red:COLORS.red}[pace],fontWeight:700}}>{tPct.toFixed(0)}%</td>
                <td style={{color:a.roasVal>=4?COLORS.green:a.roasVal>=2.5?COLORS.amber:COLORS.red,fontWeight:700}}>{a.roasVal}x</td>
                <td style={{color:fmt.heatColor(a.contactRate,[60,45])}}>{a.contactRate}%{compare && prev && <Delta current={a.contactRate} previous={prev.contactRate}/>}</td>
                <td style={{color:fmt.heatColor(a.packageConvRate,[42,35])}}>{a.packageConvRate}%</td>
                <td style={{color:a.apptsNoShow>8?COLORS.red:a.apptsNoShow>4?COLORS.amber:COLORS.green}}>{a.apptsNoShow}</td>
                <td style={{color:a.rescheduleCount>10?COLORS.red:a.rescheduleCount>5?COLORS.amber:COLORS.green}}>{a.rescheduleCount}{compare && prev && <Delta current={a.rescheduleCount} previous={prev.rescheduleCount} invert/>}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
        {tab === "clinic" && <div style={{overflowX:"auto"}}>
          <table className="lb-table">
            <thead><tr><th>Clinic</th><th>Revenue</th><th>Visits</th><th>No-Shows</th><th>No-Show %</th><th>Reschedules</th><th>Packages</th><th>Single Session</th><th>Product Only</th><th>Consultation</th></tr></thead>
            <tbody>{ad.clinicRevenue.map(c => {
              const nsRate = (c.visits + c.noShows) > 0 ? ((c.noShows/(c.visits+c.noShows))*100).toFixed(0) : 0;
              const ratio = c.visits / (ad.clinicRevenue.reduce((s,x)=>s+x.visits,0) || 1);
              const resch = Math.round(teamData.rescheduleCount * ratio);
              const pkg = Math.round(teamData.patientOptedFor.Packages * ratio);
              const ss = Math.round(teamData.patientOptedFor["Single Session"] * ratio);
              const po = Math.round(teamData.patientOptedFor["Product Only"] * ratio);
              const con = Math.round(teamData.patientOptedFor.Consultation * ratio);
              return <tr key={c.name}>
                <td className="lb-name">{c.name}</td>
                <td className="lb-val">{fmt.currency(c.revenue)}</td>
                <td>{c.visits}</td>
                <td style={{color:c.noShows>6?COLORS.red:c.noShows>3?COLORS.amber:COLORS.green}}>{c.noShows}</td>
                <td style={{color:nsRate>20?COLORS.red:nsRate>12?COLORS.amber:COLORS.green,fontWeight:600}}>{nsRate}%</td>
                <td style={{color:resch>8?COLORS.red:resch>4?COLORS.amber:COLORS.green}}>{resch}</td>
                <td>{pkg}</td><td>{ss}</td><td>{po}</td><td>{con}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
      </TabbedBox>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD — role-aware (Agent / TL / Admin)
   ═══════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const [role, setRole] = useState("admin");
  const [team, setTeam] = useState("online");
  const [page, setPage] = useState("admin-team");
  const [period, setPeriod] = useState("month");
  const [compare, setCompare] = useState(true);
  const [revTab, setRevTab] = useState("roas");
  const [apptTab, setApptTab] = useState("roas");
  const [lbCat, setLbCat] = useState("revenue");
  const [selectedAgent, setSelectedAgent] = useState(null);

  const isAdmin = role === "admin";
  const isTL = role === "tl";
  const isOnline = team === "online";

  const myData = isOnline ? AGENTS_ONLINE[0] : AGENTS_APPT[0];
  const myPrev = isOnline ? AGENTS_ONLINE_PREV[myData.id] : AGENTS_APPT_PREV[myData.id];
  const teamData = isOnline ? TEAM_OL : TEAM_AP;
  const agents = isOnline ? AGENTS_ONLINE : AGENTS_APPT;
  const prevMap = isOnline ? AGENTS_ONLINE_PREV : AGENTS_APPT_PREV;
  const drillAgent = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;
  const drillPrev = drillAgent ? prevMap[drillAgent.id] : null;
  const totalRev = isOnline ? myData.revenueNew + myData.revenueCross : myData.revenueFromVisits;

  const switchTeam = useCallback(t => { setTeam(t); setPage(isAdmin ? "admin-team" : isTL ? "team" : "overview"); setLbCat("revenue"); setRevTab("roas"); setApptTab("roas"); setSelectedAgent(null); }, [isAdmin, isTL]);

  const pageTabs = isTL
    ? [["team", "Team"], ["leaderboard", "Leaderboard"]]
    : isAdmin ? [] : [["overview", "Overview"], ["leaderboard", "Leaderboard"]];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="topbar">
          <div className="logo"><div className="logo-mark">G</div>Gleuhr Dashboard</div>
          <div className="role-toggle">
            <button className={`role-btn ${role==="agent"?"active":""}`} onClick={()=>{setRole("agent");setPage("overview");setSelectedAgent(null);}}>Agent</button>
            <button className={`role-btn ${role==="tl"?"active":""}`} onClick={()=>{setRole("tl");setPage("team");setSelectedAgent(null);}}>TL</button>
            <button className={`role-btn ${role==="admin"?"active":""}`} onClick={()=>{setRole("admin");setPage("admin-team");setSelectedAgent(null);}}>Admin</button>
          </div>
          <div className="agent-info"><Icon name={isAdmin?"building":isTL?"users":"user"} size={13}/><strong>{isAdmin?"MD Sir":isTL?"TL: Varun Kapoor":"Varun Kapoor"}</strong> · {isOnline?"Online":"Appointment"}</div>
        </div>

        <div className="nav-bar">
          <div className="team-tabs">
            <div className={`team-tab ${team==="online"?"active":""}`} onClick={()=>switchTeam("online")}>Online Team</div>
            <div className={`team-tab ${team==="appointment"?"active":""}`} onClick={()=>switchTeam("appointment")}>Appointment Team</div>
          </div>
          {pageTabs.length > 0 && <div className="page-tabs">
            {pageTabs.map(([k,l])=><div key={k} className={`page-tab ${page===k?"active":""}`} onClick={()=>{setPage(k);setSelectedAgent(null);}}>{l}</div>)}
          </div>}
        </div>

        <div className="period-bar">
          {Object.entries(PERIOD_LABELS).map(([k,l])=><button key={k} className={`period-btn ${period===k?"active":""}`} onClick={()=>setPeriod(k)}>{l}</button>)}
          <button className="period-btn"><Icon name="calendar" size={12}/> Custom</button>
          <label className="compare-toggle"><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)}/>{COMPARE_LABELS[period]}</label>
        </div>

        <div className="body">

          {/* ═══ ADMIN: TEAM PAGES ═══ */}
          {page === "admin-team" && isAdmin && isOnline && (
            <AdminOnlinePage agents={AGENTS_ONLINE} teamData={TEAM_OL} prevTeam={compare ? PREV_TEAM_OL : null} compare={compare} />
          )}
          {page === "admin-team" && isAdmin && !isOnline && (
            <AdminApptPage agents={AGENTS_APPT} teamData={TEAM_AP} ad={ADMIN_DATA} prevTeam={compare ? PREV_TEAM_AP : null} compare={compare} />
          )}

          {/* ═══ AGENT: OVERVIEW ═══ */}
          {page === "overview" && role === "agent" && (
            <>
              <TodayStrip m={myData} isOnline={isOnline}/>
              <ContestHero m={myData}/>
              <TargetHero m={myData} isOnline={isOnline}/>
              {isOnline && <>
                <TabbedBox tabs={[["total","Total"],["newrev","New / Revisit"],["payment","Prepaid / COD"],["roas","ROAS"],["activity","Activity"]]} activeTab={revTab} onTabChange={setRevTab}>
                  {revTab==="total"&&<MetricRow cols={4}><Metric value={fmt.currency(totalRev)} label="Total Revenue">{compare&&<Delta current={totalRev} previous={myPrev.revenueNew+myPrev.revenueCross}/>}</Metric><Metric value={myData.ordersTotal} label="Orders" small/><Metric value={<>{fmt.currency(myData.revenueNew)} <span className="metric-aside">({((myData.revenueNew/totalRev)*100).toFixed(0)}%)</span></>} label="New Patients" small color={BRAND.accent}/><Metric value={<>{fmt.currency(myData.revenueCross)} <span className="metric-aside">({((myData.revenueCross/totalRev)*100).toFixed(0)}%)</span></>} label="Repeat Patients" small/></MetricRow>}
                  {revTab==="newrev"&&<MetricRow cols={4}><Metric value={fmt.currency(myData.revenueNew)} label="New Revenue"/><Metric value={fmt.currency(myData.revenueCross)} label="Revisit"/><Metric value={`${((myData.revenueNew/totalRev)*100).toFixed(0)}%`} label="New Share" small color={BRAND.accent}/><Metric value={`${((myData.revenueCross/totalRev)*100).toFixed(0)}%`} label="Revisit Share" small/></MetricRow>}
                  {revTab==="payment"&&<MetricRow cols={4}><Metric value={fmt.currency(myData.revPrepaid)} label="Prepaid"/><Metric value={fmt.currency(myData.revCOD)} label="COD"/><Metric value={myData.ordersPrepaid} label={`Prepaid (${((myData.ordersPrepaid/myData.ordersTotal)*100).toFixed(0)}%)`} small color={COLORS.green}/><Metric value={myData.ordersCOD} label={`COD (${((myData.ordersCOD/myData.ordersTotal)*100).toFixed(0)}%)`} small color={COLORS.amber}/></MetricRow>}
                  {revTab==="roas"&&<RoasTab m={myData} pm={myPrev} cmp={compare}/>}
                  {revTab==="activity"&&<ActivityTab m={myData} pm={myPrev} cmp={compare}/>}
                </TabbedBox>
                <FunnelSection m={myData} pm={myPrev} cmp={compare} isOnline={true}/>
                <SectionLabel>Appointments</SectionLabel>
                <AppointmentsSection m={myData} pm={myPrev} cmp={compare}/>
              </>}
              {!isOnline && <>
                <TabbedBox tabs={[["overview","Overview"],["opted","Patient Opted For"],["clinic","By Clinic"],["roas","ROAS"],["activity","Activity"]]} activeTab={apptTab} onTabChange={setApptTab}>
                  {apptTab==="overview"&&<MetricRow cols={4}><Metric value={myData.apptsBooked} label="Booked">{compare&&myPrev&&<Delta current={myData.apptsBooked} previous={myPrev.apptsBooked}/>}</Metric><Metric value={<>{myData.apptsVisited} <span className="metric-aside">({myData.apptsVisitRate}%)</span></>} label="Visited" color={COLORS.green}>{compare&&myPrev&&<Delta current={myData.apptsVisited} previous={myPrev.apptsVisited}/>}</Metric><Metric value={<>{myData.apptsNoShow} <span className="metric-aside">({(100-myData.apptsVisitRate).toFixed(0)}%)</span></>} label="No-Shows" color={COLORS.red}/><Metric value={<>{myData.rescheduleCount} <span className="metric-aside">({myData.apptsBooked>0?((myData.rescheduleCount/myData.apptsBooked)*100).toFixed(0):0}%)</span></>} label="Rescheduled" color={COLORS.amber}>{compare&&myPrev&&<Delta current={myData.rescheduleCount} previous={myPrev.rescheduleCount} invert/>}</Metric></MetricRow>}
                  {apptTab==="opted"&&<MetricRow cols={4}>{Object.entries(myData.patientOptedFor).map(([k,v])=><Metric key={k} value={v} label={`${k}`} small/>)}</MetricRow>}
                  {apptTab==="clinic"&&<ClinicBars data={myData.apptsByClinic}/>}
                  {apptTab==="roas"&&<RoasTab m={myData} pm={myPrev} cmp={compare}/>}
                  {apptTab==="activity"&&<ActivityTab m={myData} pm={myPrev} cmp={compare}/>}
                </TabbedBox>
                {myData.pipelineValue>0&&<div className="pipeline-value-card"><div className="pv-icon"><Icon name="arrowRight" size={16}/></div><div><div className="pv-val">{fmt.currency(myData.pipelineValue)}</div><div className="pv-sub">Pipeline from {myData.apptsUpcoming} upcoming</div></div></div>}
                {myData.multiReschedule>0&&<div className="reschedule-alert"><div className="resch-title"><Icon name="refresh" size={13}/> Reschedule Alert</div><div className="resch-body"><strong>{myData.rescheduleCount}</strong> reschedules · <strong>{myData.multiReschedule}</strong> rescheduled 2+</div></div>}
                <FunnelSection m={myData} pm={myPrev} cmp={compare} isOnline={false}/>
              </>}
              <SectionLabel>Your Incentive</SectionLabel>
              <IncentiveSection m={myData} isOnline={isOnline}/>
            </>
          )}

          {/* ═══ TL: TEAM ═══ */}
          {page==="team"&&isTL&&!selectedAgent&&<TeamOverviewPage teamData={teamData} agents={agents} isOnline={isOnline} compare={compare} onAgentClick={setSelectedAgent}/>}
          {page==="team"&&isTL&&drillAgent&&<AgentDetailView agent={drillAgent} prev={drillPrev} isOnline={isOnline} compare={compare} onBack={()=>setSelectedAgent(null)}/>}

          {/* ═══ LEADERBOARD ═══ */}
          {page==="leaderboard"&&!isAdmin&&<Leaderboard cats={isOnline?LB_ONLINE_CATS:LB_APPT_CATS} data={isOnline?LB_ONLINE:LB_APPT} activeCat={lbCat} onCatChange={setLbCat} cmp={compare} isOnline={isOnline} onAgentClick={isTL?(id)=>{setPage("team");setSelectedAgent(id);}:undefined}/>}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLESHEET
   ═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body,#root{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:${COLORS.grayBg};color:${COLORS.text};-webkit-font-smoothing:antialiased}
.app{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.topbar{background:${COLORS.white};border-bottom:1px solid ${COLORS.grayBorder};padding:12px 28px;display:flex;align-items:center;gap:16px}
.logo{font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}
.logo-mark{width:20px;height:20px;border-radius:4px;background:${BRAND.accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700}
.agent-info{margin-left:auto;font-size:12px;color:${COLORS.gray};display:flex;align-items:center;gap:6px}
.agent-info strong{color:${COLORS.text};font-weight:500}
.role-toggle{display:flex;border:1px solid ${COLORS.grayBorder};border-radius:6px;overflow:hidden}
.role-btn{padding:4px 14px;font-size:11px;font-weight:500;background:${COLORS.white};border:none;color:${COLORS.grayDark};cursor:pointer;font-family:inherit;transition:all .15s}
.role-btn.active{background:${BRAND.accent};color:#fff}
.nav-bar{display:flex;background:${COLORS.white};border-bottom:1px solid ${COLORS.grayBorder};padding:0 28px;align-items:flex-end}
.team-tabs{display:flex;margin-right:32px}
.team-tab{padding:10px 18px;font-size:13px;font-weight:450;color:${COLORS.gray};cursor:pointer;border-bottom:2px solid transparent;transition:color .15s}
.team-tab:hover{color:${COLORS.grayDark}}.team-tab.active{color:${BRAND.accent};border-bottom-color:${BRAND.accent};font-weight:600}
.page-tabs{display:flex}
.page-tab{padding:10px 18px;font-size:12.5px;font-weight:450;color:${COLORS.gray};cursor:pointer;border-bottom:2px solid transparent;transition:color .15s}
.page-tab:hover{color:${COLORS.grayDark}}.page-tab.active{color:${COLORS.text};border-bottom-color:${COLORS.text};font-weight:500}
.period-bar{display:flex;align-items:center;gap:8px;padding:10px 28px;background:${COLORS.white};border-bottom:1px solid ${COLORS.grayBorder}}
.period-btn{padding:5px 14px;border-radius:5px;font-size:12px;font-weight:450;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};color:${COLORS.grayDark};cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:all .15s}
.period-btn:hover{background:${COLORS.cardBg}}.period-btn.active{background:${BRAND.accentLight};border-color:${BRAND.accent};color:${BRAND.accent};font-weight:500}
.compare-toggle{display:flex;align-items:center;gap:6px;margin-left:16px;font-size:12px;color:${COLORS.grayDark};cursor:pointer;user-select:none}
.compare-toggle input{accent-color:${BRAND.accent}}
.body{flex:1;overflow-y:auto;padding:20px 28px 40px}
.body::-webkit-scrollbar{width:6px}.body::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}
.today-strip{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.ts-item{display:flex;align-items:center;gap:6px;padding:8px 14px;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:8px;font-size:12px;color:${COLORS.grayDark}}
.ts-val{font-weight:700;font-size:15px;color:${COLORS.text}}.ts-label{font-size:11.5px;color:${COLORS.gray}}
.ts-warn{border-color:${COLORS.amberBorder};background:${COLORS.amberBg}}.ts-warn .ts-val{color:${COLORS.amber}}
.ts-accent .ts-val{color:${BRAND.accent}}
.ts-best{margin-left:auto;font-size:11.5px;color:${COLORS.gray};display:flex;align-items:center;gap:5px;padding:8px 14px;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:8px}
.contest{background:linear-gradient(135deg,#fefce8,#fef9c3);border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:20px;position:relative;overflow:hidden}
.contest::after{content:'🏆';position:absolute;right:24px;top:50%;transform:translateY(-50%);font-size:48px;opacity:.15}
.contest-title{font-size:15px;font-weight:700;color:#92400e;display:flex;align-items:center;gap:8px}
.contest-period{font-size:11px;color:#a16207;margin-top:2px}
.contest-body{display:flex;align-items:center;gap:24px;margin-top:14px}
.contest-progress{flex:1}
.contest-bar{height:12px;background:rgba(202,138,4,.15);border-radius:6px;overflow:hidden;margin-bottom:6px}
.contest-bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#f59e0b,#ca8a04)}
.contest-stat{font-size:12px;color:#92400e}.contest-stat strong{font-weight:700;font-size:14px}
.contest-tiers{display:flex;gap:8px}
.contest-tier{padding:6px 12px;border-radius:6px;text-align:center;border:1px solid #fde68a;background:rgba(255,255,255,.6)}
.contest-tier-pct{font-size:10px;font-weight:500;color:#a16207}.contest-tier-reward{font-size:14px;font-weight:700;color:#92400e}
.contest-tier.unlocked{border-color:#ca8a04;background:#fff}
.hero{background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:12px;padding:24px 28px;margin-bottom:20px}
.hero-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
.hero-val-row{display:flex;align-items:baseline}
.hero-val{font-size:36px;font-weight:700;letter-spacing:-1.5px;line-height:1}
.hero-badge{font-size:13px;font-weight:600;padding:3px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;margin-left:12px}
.badge-green{background:${COLORS.greenBg};color:${COLORS.green}}.badge-amber{background:${COLORS.amberBg};color:${COLORS.amber}}.badge-red{background:${COLORS.redBg};color:${COLORS.red}}
.hero-sub{font-size:12.5px;color:${COLORS.gray};margin-top:4px}.hero-sub strong{color:${COLORS.grayDark};font-weight:500}
.hero-target{text-align:right}
.hero-target-label{font-size:10.5px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.hero-target-val{font-size:18px;font-weight:600;color:${COLORS.grayDark}}
.hero-target-sub{font-size:11px;color:${COLORS.gray};margin-top:1px}
.hero-progress{margin-bottom:20px}
.hero-bar{height:14px;background:${COLORS.grayLight};border-radius:7px;overflow:visible;position:relative}
.hero-bar-fill{height:100%;border-radius:7px}
.hero-pace-marker{position:absolute;top:-2px;width:2px;height:18px;background:${COLORS.text};border-radius:1px;opacity:.35;transform:translateX(-1px)}
.hero-marks{display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:${COLORS.gray}}
.hero-stats{display:flex;border-top:1px solid ${COLORS.grayLight};padding-top:14px}
.hero-stat{flex:1;padding:0 16px;border-right:1px solid ${COLORS.grayLight}}
.hero-stat:first-child{padding-left:0}.hero-stat:last-child{border-right:none;padding-right:0}
.hs-label{font-size:10.5px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;margin-bottom:3px}
.hs-val{font-size:17px;font-weight:700;letter-spacing:-.3px}.hs-sub{font-size:11px;color:${COLORS.gray};margin-top:1px}
.c-green{color:${COLORS.green}}.c-red{color:${COLORS.red}}.c-amber{color:${COLORS.amber}}
.delta{display:inline-flex;align-items:center;gap:2px;font-size:10.5px;font-weight:500;padding:1px 5px;border-radius:3px;margin-left:6px}
.delta.up{background:${COLORS.greenBg};color:${COLORS.green}}.delta.dn{background:${COLORS.redBg};color:${COLORS.red}}
.delta-badge{display:inline-flex;align-items:center;gap:2px;font-size:11px;font-weight:500;padding:1px 6px;border-radius:3px}
.delta-good{background:${COLORS.greenBg};color:${COLORS.green}}.delta-bad{background:${COLORS.redBg};color:${COLORS.red}}
.pill{font-size:10px;font-weight:500;padding:1px 6px;border-radius:3px}
.pill-green{background:${COLORS.greenBg};color:${COLORS.green}}.pill-amber{background:${COLORS.amberBg};color:${COLORS.amber}}.pill-red{background:${COLORS.redBg};color:${COLORS.red}}
.sec-label{font-size:11px;font-weight:600;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;margin-top:8px}
.tbox{background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:12px;overflow:hidden;margin-bottom:20px}
.tbox-tabs{display:flex;border-bottom:1px solid ${COLORS.grayBorder};padding:0 16px}
.tbox-tab{padding:12px 16px;font-size:12.5px;font-weight:450;color:${COLORS.gray};cursor:pointer;border-bottom:2px solid transparent;transition:color .15s}
.tbox-tab:hover{color:${COLORS.grayDark}}.tbox-tab.active{color:${COLORS.text};border-bottom-color:${COLORS.text};font-weight:500}
.tbox-body{padding:24px}
.metric-row{display:grid;gap:16px}.mr-4{grid-template-columns:repeat(4,1fr)}.mr-3{grid-template-columns:repeat(3,1fr)}
.metric{text-align:center}.metric-val{font-size:24px;font-weight:700;letter-spacing:-.5px}.metric-val.sm{font-size:18px}
.metric-label{font-size:11.5px;color:${COLORS.gray};margin-top:3px}.metric-aside{font-size:11px;font-weight:400;color:${COLORS.gray}}
.mc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}
.mc{padding:10px 14px;background:${COLORS.cardBg};border-radius:8px;border:1px solid ${COLORS.grayLight}}
.mc-l{font-size:10px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;margin-bottom:3px}
.mc-v{font-size:17px;font-weight:700;letter-spacing:-.3px}.mc-s{font-size:11px;color:${COLORS.gray};margin-top:1px}
.roas-status{padding:14px;border-radius:8px;border:1px solid;margin-top:16px}
.roas-status-title{font-size:12px;font-weight:600;margin-bottom:4px}
.roas-status-body{font-size:12px;color:${COLORS.grayDark};line-height:1.5}
.roas-status-note{margin-top:10px;font-size:11px;color:${COLORS.gray}}.roas-status-note strong{color:${COLORS.text}}
.activity-benchmarks{display:flex;gap:10px;margin-top:14px}
.bench{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:6px;font-size:11.5px;flex:1}
.bench-ok{background:${COLORS.greenBg};color:${COLORS.green}}.bench-warn{background:${COLORS.amberBg};color:${COLORS.amber}}
.funnel{background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:12px;padding:24px;margin-bottom:20px}
.funnel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.funnel-title{font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}
.funnel-bars{margin-bottom:16px}
.funnel-step{display:flex;align-items:center;margin-bottom:4px}
.funnel-step-label{width:120px;font-size:11.5px;font-weight:500;color:${COLORS.grayDark};text-align:right;padding-right:14px;flex-shrink:0}
.funnel-step-bar{height:34px;border-radius:4px;display:flex;align-items:center;padding:0 12px;min-width:40px}
.funnel-step-val{font-size:12px;font-weight:600;color:#fff}
.funnel-step-pct{margin-left:10px;font-size:11px;font-weight:500;color:${COLORS.gray}}
.funnel-drop{display:flex;align-items:center;margin:2px 0 2px 120px}
.funnel-drop-line{width:1px;height:12px;background:${COLORS.grayBorder};margin:0 6px 0 20px}
.funnel-drop-text{font-size:10px;color:${COLORS.red};font-weight:500}
.lead-age{padding:14px 0;border-top:1px solid ${COLORS.grayLight};margin-bottom:4px}
.lead-age-title{font-size:10.5px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;margin-bottom:10px}
.lead-age-buckets{display:flex;gap:16px}
.la-bucket{text-align:center;flex:1;padding:10px;background:${COLORS.cardBg};border-radius:8px;border:1px solid ${COLORS.grayLight}}
.la-val{font-size:20px;font-weight:700}.la-label{font-size:11px;color:${COLORS.gray};margin-top:2px}
.funnel-expand{display:flex;align-items:center;gap:6px;margin:0 auto;padding:6px 16px;background:none;border:1px solid ${COLORS.grayBorder};border-radius:6px;font-size:11.5px;font-weight:500;color:${COLORS.grayDark};cursor:pointer;font-family:inherit;transition:all .15s}
.funnel-expand:hover{background:${COLORS.cardBg}}
.funnel-detail{margin-top:16px;padding-top:16px;border-top:1px solid ${COLORS.grayLight}}
.pipeline-section{padding-top:14px;border-top:1px solid ${COLORS.grayLight};margin-top:14px}
.pipeline-title{font-size:10.5px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;margin-bottom:8px}
.pills-row{display:flex;gap:6px;flex-wrap:wrap}
.intent-pill{display:flex;align-items:center;gap:7px;padding:7px 14px;background:${COLORS.white};border-radius:6px;border:1px solid ${COLORS.grayBorder}}
.pill-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.pill-name{font-size:11.5px;color:${COLORS.grayDark}}.pill-count{font-size:13px;font-weight:600;margin-left:2px}
.card{background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:10px;padding:16px;margin-bottom:16px}
.card-title{font-size:12px;font-weight:600;margin-bottom:10px}
.card-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid ${COLORS.grayBg}}
.card-row:last-child{border-bottom:none}
.card-label{font-size:12.5px;color:${COLORS.grayDark}}.card-val{font-size:13px;font-weight:600;display:flex;align-items:center;gap:5px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.cbars{display:flex;flex-direction:column;gap:5px;margin-top:6px}
.cbr{display:flex;align-items:center;gap:8px;font-size:11.5px}
.cbr-nm{width:80px;color:${COLORS.grayDark};text-align:right;flex-shrink:0}
.cbr-bar{flex:1;height:18px;background:${COLORS.grayBg};border-radius:3px;overflow:hidden}
.cbr-fill{height:100%;border-radius:3px;background:rgba(213,68,2,.15);display:flex;align-items:center;padding-left:6px;font-size:10px;font-weight:600;color:${BRAND.accent}}
.pipeline-value-card{display:flex;align-items:center;gap:16px;padding:16px 20px;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:10px;margin-bottom:16px}
.pv-icon{width:36px;height:36px;border-radius:8px;background:${BRAND.accentLight};display:flex;align-items:center;justify-content:center;color:${BRAND.accent};flex-shrink:0}
.pv-val{font-size:20px;font-weight:700;letter-spacing:-.5px}.pv-sub{font-size:12px;color:${COLORS.gray};margin-top:2px}
.reschedule-alert{padding:14px 16px;background:${COLORS.redBg};border:1px solid ${COLORS.redBorder};border-radius:8px;margin-bottom:16px}
.resch-title{font-size:12px;font-weight:600;color:${COLORS.red};display:flex;align-items:center;gap:5px;margin-bottom:4px}
.resch-body{font-size:12px;color:${COLORS.grayDark}}.resch-body strong{color:${COLORS.red}}
.incentive{background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:12px;padding:20px 24px;margin-bottom:20px}
.inc-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.inc-bar{width:3px;height:20px;background:${BRAND.accent};border-radius:2px}
.inc-title{font-size:14px;font-weight:600}.inc-role{font-size:12px;color:${COLORS.gray}}
.inc-earned{font-size:30px;font-weight:700;letter-spacing:-1px;margin:8px 0 2px}.inc-sub{font-size:12px;color:${COLORS.gray}}
.inc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
.inc-card{padding:12px;border-radius:8px;border:1px solid ${COLORS.grayLight};background:${COLORS.cardBg}}
.inc-card-label{font-size:10px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px}
.inc-card-val{font-size:18px;font-weight:700}.inc-card-sub{font-size:11px;color:${COLORS.gray};margin-top:2px}
.inc-section-label{font-size:10.5px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px}
.inc-slabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
.inc-slab{padding:6px 14px;border-radius:6px;text-align:center;border:1px solid ${COLORS.grayBorder};background:${COLORS.cardBg}}
.inc-slab.active{border-color:${BRAND.accent};background:${BRAND.accentLight}}
.inc-slab-range{font-size:10px;font-weight:500;color:${COLORS.gray}}.inc-slab-amount{font-size:14px;font-weight:700;margin-top:1px}
.inc-slab.active .inc-slab-range,.inc-slab.active .inc-slab-amount{color:${BRAND.accent}}
.lb-cats{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
.lb-cat{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:450;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};color:${COLORS.grayDark};cursor:pointer;font-family:inherit;transition:all .15s}
.lb-cat:hover{background:${COLORS.cardBg}}.lb-cat.active{background:${BRAND.accentLight};border-color:${BRAND.accent};color:${BRAND.accent};font-weight:500}
.lb-table{width:100%;border-collapse:collapse;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:10px;overflow:hidden}
.lb-table th{text-align:left;padding:9px 14px;font-size:10.5px;font-weight:500;color:${COLORS.gray};text-transform:uppercase;letter-spacing:.3px;background:${COLORS.cardBg};border-bottom:1px solid ${COLORS.grayBorder}}
.lb-table td{padding:11px 14px;font-size:12.5px;border-bottom:1px solid ${COLORS.grayLight}}
.lb-table tr:last-child td{border-bottom:none}
.lb-table tr:hover td{background:${COLORS.cardBg}}
.lb-table tr.row-me td{background:${BRAND.accentLight}}
.lb-table tr.row-clickable{cursor:pointer}.lb-table tr.row-clickable:hover td{background:${BRAND.accentLight}}
.lb-rank{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
.rank-1{background:#fefce8;color:#a16207}.rank-2{background:#f3f4f6;color:${COLORS.grayDark}}.rank-3{background:#fde8e0;color:#c4420a}
.lb-name{font-weight:500}.lb-you{font-size:10px;color:${BRAND.accent}}
.lb-val{font-weight:700;font-size:13px}.lb-prev{color:${COLORS.gray};font-size:12px}
.lb-vis-bar{width:120px;height:5px;background:${COLORS.grayLight};border-radius:3px;display:inline-block;margin-right:6px;vertical-align:middle;overflow:hidden}
.lb-vis-fill{display:block;height:100%;border-radius:3px}
.agent-cards-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px}
.agent-card{background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:12px;padding:20px;cursor:pointer;transition:all .15s}
.agent-card:hover{border-color:${BRAND.accent};box-shadow:0 2px 12px rgba(213,68,2,.08)}
.ac-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.ac-avatar{width:36px;height:36px;border-radius:8px;background:${BRAND.accentLight};color:${BRAND.accent};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.ac-info{flex:1;min-width:0}.ac-name{font-size:13px;font-weight:600;margin-bottom:2px}
.ac-rev{font-size:18px;font-weight:700;letter-spacing:-.5px}
.ac-pct{font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;margin-left:8px}
.ac-pct-green{background:${COLORS.greenBg};color:${COLORS.green}}.ac-pct-amber{background:${COLORS.amberBg};color:${COLORS.amber}}.ac-pct-red{background:${COLORS.redBg};color:${COLORS.red}}
.ac-target{text-align:right}.ac-target-label{font-size:9px;font-weight:500;color:${COLORS.gray};text-transform:uppercase}.ac-target-val{font-size:14px;font-weight:600;color:${COLORS.grayDark}}
.ac-bar{height:6px;background:${COLORS.grayLight};border-radius:3px;overflow:hidden;margin-bottom:14px}.ac-bar-fill{height:100%;border-radius:3px}
.ac-metrics{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid ${COLORS.grayLight};border-bottom:1px solid ${COLORS.grayLight};margin-bottom:10px}
.ac-metric{text-align:center;flex:1}.ac-metric-val{font-size:14px;font-weight:700}.ac-metric-label{font-size:9.5px;color:${COLORS.gray};text-transform:uppercase;margin-top:2px}
.ac-bottleneck{display:flex;align-items:center;gap:6px;padding:8px 12px;background:${COLORS.redBg};border-radius:6px;border:1px solid ${COLORS.redBorder};margin-bottom:10px;color:${COLORS.red}}
.ac-bn-metric{font-size:11.5px;font-weight:600}.ac-bn-tip{font-size:11px;font-weight:400;color:${COLORS.grayDark};margin-left:auto}
.ac-footer{text-align:right}.ac-view{font-size:11px;font-weight:500;color:${BRAND.accent};display:inline-flex;align-items:center;gap:4px}
.back-btn{display:flex;align-items:center;gap:6px;padding:6px 14px;background:${COLORS.white};border:1px solid ${COLORS.grayBorder};border-radius:6px;font-size:12px;font-weight:500;color:${COLORS.grayDark};cursor:pointer;font-family:inherit;margin-bottom:16px;transition:all .15s}
.back-btn:hover{background:${COLORS.cardBg};border-color:${BRAND.accent};color:${BRAND.accent}}
.agent-detail-header{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.adh-avatar{width:44px;height:44px;border-radius:10px;background:${BRAND.accentLight};color:${BRAND.accent};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700}
.adh-name{font-size:18px;font-weight:700}.adh-role{font-size:12px;color:${COLORS.gray}}
`;
