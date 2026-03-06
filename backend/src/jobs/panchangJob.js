import { Panchang } from "../models/Panchang.js";
import { calculatePanchang } from "../utils/panchangCalc.js";

export async function runDailyPanchangJob() {
  const today = new Date();
  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + offset);
    const item = calculatePanchang(date);
    await Panchang.findOneAndUpdate({ date: item.date }, item, { upsert: true, new: true });
  }
}

