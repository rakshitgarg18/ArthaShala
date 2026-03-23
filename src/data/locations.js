// ═══════════════════════════════════════════════════════
// Coordinates read directly from the user's screenshot of identify.html
// User placed numbered badges on each building — positions are ground truth.
// ═══════════════════════════════════════════════════════
export const LOCATIONS = {
  bank:          { name: 'Bank',           nameHi: 'बैंक',             nameMr: 'बँक',             nameGu: 'બૅન્ક',         nameBn: 'ব্যাংক',          pos: { x: 51.7, y: 54.8 }, icon: '🏦', category: 'financial',   asset: '/assets/bank_3d.png'        },
  temple:        { name: 'Temple',         nameHi: 'मंदिर',            nameMr: 'मंदिर',            nameGu: 'મંદિર',          nameBn: 'মন্দির',           pos: { x: 52.5, y: 29.3 }, icon: '🕉️', category: 'service'                              },
  farm:          { name: 'Farm',           nameHi: 'खेत',              nameMr: 'शेत',              nameGu: 'ખેતર',           nameBn: 'খামার',            pos: { x: 17.8, y: 17.1 }, icon: '🌾', category: 'agriculture'                          },
  seed_shop:     { name: 'Seed Shop',      nameHi: 'बीज भंडार',       nameMr: 'बियाणे दुकान',     nameGu: 'બિયારણ દુકાન',   nameBn: 'বীজের দোকান',     pos: { x: 12.7, y: 33.8 }, icon: '🌱', category: 'agriculture'                          },
  fertilizer:    { name: 'Fertilizer',    nameHi: 'खाद केंद्र',      nameMr: 'खत केंद्र',        nameGu: 'ખાતર કેન્દ્ર',   nameBn: 'সার কেন্দ্র',     pos: { x: 29.7, y: 31.1 }, icon: '🧪', category: 'agriculture'                          },
  cattle_market: { name: 'Cattle Market', nameHi: 'पशु बाज़ार',       nameMr: 'जनावर बाजार',      nameGu: 'પશુ બજાર',        nameBn: 'গবাদি বাজার',     pos: { x: 11.0, y: 51.2 }, icon: '🐄', category: 'agriculture'                          },
  dairy:         { name: 'Dairy',          nameHi: 'डेयरी',            nameMr: 'दुग्धालय',         nameGu: 'ડેરી',            nameBn: 'ডেয়ারি',          pos: { x: 11.0, y: 66.1 }, icon: '🥛', category: 'agriculture'                          },
  post_office:   { name: 'Post Office',   nameHi: 'डाकघर',            nameMr: 'पोस्ट ऑफिस',       nameGu: 'પોસ્ટ ઓફિસ',     nameBn: 'ডাকঘর',            pos: { x: 60.9, y: 74.9 }, icon: '📮', category: 'financial'                            },
  shg:           { name: 'SHG Center',    nameHi: 'SHG केंद्र',      nameMr: 'SHG केंद्र',       nameGu: 'SHG કેન્દ્ર',    nameBn: 'SHG কেন্দ্র',     pos: { x: 71.9, y: 49.4 }, icon: '👥', category: 'financial',   asset: '/assets/shg_3d.png'         },
  moneylender:   { name: 'Moneylender',   nameHi: 'साहूकार',          nameMr: 'सावकार',           nameGu: 'શાહુકાર',         nameBn: 'মহাজন',            pos: { x: 37,   y: 44   }, icon: '💰', category: 'financial',   asset: '/assets/moneylender_3d.png' },
  grocery:       { name: 'Grocery',        nameHi: 'किराना',           nameMr: 'किराणा',           nameGu: 'કરિયાણા',         nameBn: 'মুদির দোকান',     pos: { x: 31.4, y: 84.5 }, icon: '🏪', category: 'shop'                                 },
  cloth_shop:    { name: 'Clothes',        nameHi: 'कपड़े',             nameMr: 'कपडे',             nameGu: 'કપડાં',           nameBn: 'কাপড়',             pos: { x: 36.5, y: 74.9 }, icon: '👔', category: 'shop'                                 },
  electronics:   { name: 'Electronics',   nameHi: 'इलेक्ट्रॉनिक्स',  nameMr: 'इलेक्ट्रॉनिक्स',  nameGu: 'ઇલેક્ટ્રોનિક્સ',  nameBn: 'ইলেকট্রনিক্স',    pos: { x: 82.2, y: 64.3 }, icon: '📱', category: 'shop'                                 },
  market:        {
    name: 'Market', nameHi: 'मंडी', nameMr: 'बाजार', nameGu: 'બજાર', nameBn: 'বাজার',
    pos: { x: 26.3, y: 58.2 }, icon: '⚖️', category: 'market',
    status: {
      title: 'today_mandi_rate',
      items: [
        { label: 'maize', icon: '🌽', rate: '₹१८००/', unit: 'quintal' },
        { label: 'paddy', icon: '🌾', rate: '₹२१००/', unit: 'quintal' }
      ]
    }
  },
  vegetable:     { name: 'Vegetable Mkt', nameHi: 'सब्ज़ी मंडी',      nameMr: 'भाजी बाजार',       nameGu: 'શાકભાજી બજાર',   nameBn: 'সবজি বাজার',      pos: { x: 24.6, y: 79.2 }, icon: '🥬', category: 'market'                               },
  medical:       { name: 'Medical',        nameHi: 'स्वास्थ्य केंद्र', nameMr: 'आरोग्य केंद्र',   nameGu: 'આરોગ્ય કેન્દ્ર',  nameBn: 'স্বাস্থ্য কেন্দ্র', pos: { x: 60.2, y: 38.1 }, icon: '⚕️', category: 'service'                              },
  school:        { name: 'School',         nameHi: 'विद्यालय',         nameMr: 'शाळा',             nameGu: 'શાળા',            nameBn: 'বিদ্যালয়',         pos: { x: 82.2, y: 19.8 }, icon: '🏫', category: 'service'                              },
  panchayat:     { name: 'Panchayat',      nameHi: 'पंचायत',           nameMr: 'पंचायत',           nameGu: 'પંચાયત',          nameBn: 'পঞ্চায়েত',          pos: { x: 50.0, y: 70.0 }, icon: '🏛️', category: 'service'                              },
  mobile_tower:  { name: 'Mobile Tower',   nameHi: 'मोबाइल टॉवर',     nameMr: 'मोबाईल टॉवर',     nameGu: 'મોબાઇલ ટાવર',    nameBn: 'মোবাইল টাওয়ার',   pos: { x: 92.3, y: 18.0 }, icon: '📡', category: 'service'                              },
  workshop:      { name: 'Workshop',       nameHi: 'कार्यशाला',        nameMr: 'कार्यशाळा',        nameGu: 'વર્કશોપ',          nameBn: 'কর্মশালা',         pos: { x: 90.6, y: 84.5 }, icon: '🔧', category: 'service'                              },
  home:          { name: 'Home',           nameHi: 'घर',               nameMr: 'घर',               nameGu: 'ઘર',              nameBn: 'বাড়ি',              pos: { x: 65.3, y: 14.4 }, icon: '🏠', category: 'residence'                            },
  neighbor1:     { name: 'House 1',        nameHi: 'घर १',             nameMr: 'घर १',             nameGu: 'ઘર ૧',            nameBn: 'বাড়ি ১',            pos: { x: 75.0, y: 14.4 }, icon: '🏘️', category: 'residence'                            },
  bus_stand:     { name: 'Bus Stand',      nameHi: 'बस स्टैंड',        nameMr: 'बस स्थानक',        nameGu: 'બસ સ્ટૅન્ડ',     nameBn: 'বাস স্ট্যান্ড',    pos: { x: 63.5, y: 89.8 }, icon: '🚌', category: 'transport'                            },
  tea_stall:     { name: 'Tea Stall',      nameHi: 'चाय की दुकान',     nameMr: 'चहाची टपरी',       nameGu: 'ચાની દુકાન',      nameBn: 'চায়ের দোকান',     pos: { x: 41.5, y: 91.5 }, icon: '☕', category: 'shop'                                 },
};

export const ACTIONS = {
  home: [
    { name: 'action_rent', icon: '🔑', amount: -2000, type: 'expense' },
    { name: 'maintenance', icon: '🛠️', amount: -1000, type: 'expense' },
    { name: 'remittance', icon: '✉️', amount: 3000, type: 'income' }
  ],
  neighbor1: [
    { name: 'lend_money', icon: '🤝', amount: -1000, type: 'loan_give' },
    { name: 'borrow_money', icon: '💸', amount: 1000, type: 'loan' }
  ],
  grocery: [
    { name: 'groceries', icon: '🍎', amount: -1500, type: 'expense' },
    { name: 'credit_purchase', icon: '💳', amount: -2000, type: 'loan' },
    { name: 'bulk_purchase', icon: '📦', amount: -3000, type: 'expense' }
  ],
  cloth_shop: [
    { name: 'buy_clothes', icon: '👕', amount: -2500, type: 'expense' },
    { name: 'festival_clothes', icon: '👘', amount: -4000, type: 'expense' }
  ],
  electronics: [
    { name: 'mobile_phone', icon: '📱', amount: -5000, type: 'expense' },
    { name: 'tv_radio', icon: '📻', amount: -8000, type: 'expense' }
  ],
  farm: [
    { name: 'sell_harvest', icon: '🌾', amount: 12000, type: 'income' },
    { name: 'farming_expenses', icon: '🚜', amount: -3000, type: 'expense' },
    { name: 'hire_labor', icon: '👷', amount: -2000, type: 'expense' }
  ],
  seed_shop: [
    { name: 'basic_seeds', icon: '🌱', amount: -1500, type: 'expense' },
    { name: 'hybrid_seeds', icon: '🧬', amount: -2500, type: 'expense' }
  ],
  fertilizer: [
    { name: 'fertilizer_bag', icon: '🧪', amount: -2000, type: 'expense' },
    { name: 'organic_manure', icon: '💩', amount: -1800, type: 'expense' },
    { name: 'buy_excess_urea', icon: '☠️', amount: -3000, type: 'expense' }
  ],
  cattle_market: [
    { name: 'buy_cow', icon: '🐄', amount: -25000, type: 'expense' },
    { name: 'buy_buffalo', icon: '🐃', amount: -40000, type: 'expense' },
    { name: 'sell_livestock', icon: '💰', amount: 30000, type: 'income' }
  ],
  dairy: [
    { name: 'milk_sell_daily', icon: '🥛', amount: 500, type: 'income' },
    { name: 'milk_sell_bulk', icon: '🍼', amount: 3000, type: 'income' },
    { name: 'cattle_feed', icon: '🌾', amount: -1500, type: 'expense' }
  ],
  bank: [
    { name: 'save_deposit', icon: '📥', amount: -2000, amountLabel: '(₹२,०००)', type: 'savings', asset: '/assets/deposit_3d.png' },
    { name: 'withdraw', icon: '📤', amount: 1500, amountLabel: '(₹१,५००)', type: 'withdrawal', asset: '/assets/withdraw_3d.png' },
    { name: 'kcc_loan', icon: '📝', amount: 12000, amountLabel: '(₹१२,००० @ ४% ब्याज)', type: 'loan', asset: '/assets/kcc_3d.png' },
    { name: 'fixed_deposit', icon: '💎', amount: -5000, amountLabel: '(₹५,०००)', type: 'investment', asset: '/assets/deposit_3d.png' },
    { name: 'repay_loan', icon: '✅', amount: -1000, type: 'loan_repay', asset: '/assets/repay_3d.png' },
    { name: 'enroll_pmsym', icon: '🧓', amount: -100, type: 'investment', asset: '/assets/deposit_3d.png' },
    { name: 'apply_mudra', icon: '👩🏽‍🌾', amount: 50000, type: 'loan', asset: '/assets/kcc_3d.png' }
  ],
  post_office: [
    { name: 'save_deposit', icon: '📮', amount: -500, type: 'savings' },
    { name: 'withdraw_pension', icon: '👴', amount: 2000, type: 'income' }
  ],
  shg: [
    { name: 'shg_deposit', icon: '👥', amount: -500, amountLabel: '(₹५००)', type: 'shg_deposit', asset: '/assets/deposit_3d.png' },
    { name: 'shg_loan', icon: '💰', amount: 8000, amountLabel: '(₹८,००० @ १२%)', type: 'loan', asset: '/assets/kcc_3d.png' },
    { name: 'shg_interest', icon: '📈', amount: 200, amountLabel: '(₹२००)', type: 'income', asset: '/assets/repay_3d.png' }
  ],
  moneylender: [
    { name: 'emergency_loan', icon: '🚨', amount: 5000, amountLabel: '(₹५,०००)', badge: 'High Interest 24%', type: 'loan', asset: '/assets/emergency_3d.png' },
    { name: 'repay_with_interest', icon: '💸', amount: -6000, amountLabel: '(₹६,०००)', type: 'loan_repay', asset: '/assets/repay_3d.png' }
  ],
  medical: [
    { name: 'treatment', icon: '💊', amount: -3000, type: 'expense' },
    { name: 'ayushman_benefit', icon: '🛡️', amount: 0, type: 'income' }
  ],
  school: [
    { name: 'school_fee', icon: '📚', amount: -1000, type: 'expense' },
    { name: 'scholarship', icon: '🎓', amount: 2000, type: 'income' }
  ],
  temple: [
    { name: 'donation', icon: '🙏', amount: -200, type: 'expense' }
  ],
  panchayat: [
    { name: 'mgnrega_wages', icon: '👷', amount: 5000, type: 'income' },
    { name: 'pm_kisan_benefit', icon: '🌾', amount: 2000, type: 'income' },
    { name: 'buy_insurance', icon: '☂️', amount: -200, type: 'expense' },
    { name: 'link_ayushman', icon: '🏥', amount: 0, type: 'info' },
    { name: 'do_kyc', icon: '📱', amount: 0, type: 'info' },
    { name: 'get_soil_card', icon: '🌱', amount: -50, type: 'expense' },
    { name: 'apply_pma', icon: '🏠', amount: 150000, type: 'income' }
  ],
  market: [
    { name: 'sell_maize', icon: '🌽', amount: 8000, type: 'income', group: 'primary' },
    { name: 'sell_paddy', icon: '🌾', amount: 12000, type: 'income', group: 'primary' },
    { name: 'seed_prep',  icon: '🌱', amount: 0, type: 'info', group: 'footer' },
    { name: 'store_warehouse', icon: '🏢', amount: -500, type: 'expense' }
  ],
  vegetable: [
    { name: 'Sell Vegetables', amount: 1500, type: 'income' }
  ],
  bus_stand: [
    { name: 'Bus Ticket (City)', amount: -200, type: 'expense' }
  ],
  workshop: [
    { name: 'Tractor Service', amount: -3000, type: 'expense' }
  ],
  mobile_tower: [
    { name: 'Recharge', amount: -500, type: 'expense' },
    { name: 'delete_sms', icon: '🗑️', amount: 0, type: 'info' },
    { name: 'share_otp', icon: '🕵️', amount: 0, type: 'info' }
  ],
  tea_stall: [
    { name: 'Tea & Snacks', amount: -50, type: 'expense' }
  ]
};
 
 
