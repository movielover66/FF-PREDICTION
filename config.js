// config.js
export const APP_CONFIG = {
    MARKET_LOAD_THRESHOLD: 50000,
    TOTAL_GAMBLERS: 150000,           // ১.৫ লক্ষ জুয়াড়ি
    AVG_BET_PER_PERSON_PER_BAJI: 200, // প্রতি বাজিতে গড় বেট (মোট ১৬০০/৮ = ২০০)
    MAX_LOAD_SCALE: 10000000,          // গ্রাফ স্কেলিং এর জন্য (১ কোটি)
    HIGH_LOAD_THRESHOLD: 5000000       // ৫০ লাখের বেশি হলে লাল দেখাবে
};