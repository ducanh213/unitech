// src/utils/scheduleParser.js
// Parse schedule string sang map: { "T2": [1,2,3,4,5], "T4": [1,2,3,4,5] }
// Format hỗ trợ: "T2,T4 07:00-11:35" hoặc "T2,T4 13:25-15:10"

export const PERIOD_TIMES = [
  { no: 1,  s: 7*60+0,   e: 7*60+50  },
  { no: 2,  s: 7*60+55,  e: 8*60+45  },
  { no: 3,  s: 8*60+50,  e: 9*60+40  },
  { no: 4,  s: 9*60+50,  e: 10*60+40 },
  { no: 5,  s: 10*60+45, e: 11*60+35 },
  { no: 6,  s: 12*60+30, e: 13*60+20 },
  { no: 7,  s: 13*60+25, e: 14*60+15 },
  { no: 8,  s: 14*60+20, e: 15*60+10 },
  { no: 9,  s: 15*60+20, e: 16*60+10 },
  { no: 10, s: 16*60+15, e: 17*60+5  },
];

const VI_TO_KEY = {
  'thứ 2': 'T2', 'thứ hai': 'T2',
  'thứ 3': 'T3', 'thứ ba':  'T3',
  'thứ 4': 'T4', 'thứ tư':  'T4',
  'thứ 5': 'T5', 'thứ năm': 'T5',
  'thứ 6': 'T6', 'thứ sáu': 'T6',
  'thứ 7': 'T7', 'thứ bảy': 'T7',
};

export const DAYS = ['T2','T3','T4','T5','T6','T7'];
export const DAY_LABELS = { T2:'Thứ 2', T3:'Thứ 3', T4:'Thứ 4', T5:'Thứ 5', T6:'Thứ 6', T7:'Thứ 7' };

/** Tìm các số period (1-10) bị overlap với khoảng giờ [startH:startM, endH:endM] */
function timeToPeriods(startH, startM, endH, endM) {
  const s = startH * 60 + startM;
  const e = endH   * 60 + endM;
  return PERIOD_TIMES
    .filter(p => s < p.e && e > p.s)               // strict overlap, không tolerance
    .map(p => p.no);
}

/**
 * Parse schedule string → { T2: [1,2,3,4,5], T4: [1,2,3,4,5], ... }
 * Format chính: "T2,T4 07:00-11:35"
 * Cũng hỗ trợ cũ: "Thứ 2 08:00 - 11:30"
 */
export function parseSchedule(schedStr) {
  if (!schedStr) return {};
  const result = {};

  // Format mới: "T2,T4 07:00-11:35" hoặc "T4,T6 13:25-15:10"
  const mNew = schedStr.match(/^((?:T[2-7],?)+)\s+(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)$/i);
  if (mNew) {
    const days    = mNew[1].toUpperCase().split(',').map(d => d.trim());
    const periods = timeToPeriods(+mNew[2], +mNew[3], +mNew[4], +mNew[5]);
    for (const d of days) result[d] = periods;
    return result;
  }

  // Format cũ: "Thứ 2 08:00 - 11:30" hoặc "Thứ 2,Thứ 4 08:00-11:30"
  const mOld = schedStr.match(/^(.+?)\s+(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)$/i);
  if (mOld) {
    const dayPart = mOld[1];
    const periods = timeToPeriods(+mOld[2], +mOld[3], +mOld[4], +mOld[5]);
    // Tách các ngày (phân cách bằng / hoặc ,)
    const rawDays = dayPart.split(/[/,]/).map(d => d.replace(':', '').trim().toLowerCase());
    for (const rd of rawDays) {
      const key = VI_TO_KEY[rd] || (rd.toUpperCase().startsWith('T') ? rd.toUpperCase() : null);
      if (key) result[key] = periods;
    }
    return result;
  }

  return result;
}
