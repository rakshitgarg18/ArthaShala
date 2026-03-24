const learningModules = [
  {
    id: "seed_trap",
    icon: "🌾",
    title: "Seed Trap – Sasta Aaj, Mehenga Kal",
    difficulty: "Easy",
    rewardType: "arthaScore",
    rewardAmount: 20,
    // 3-screen story: action-first, visual-first
    screens: [
      {
        id: "intro",
        type: "action", // action cards, not text
        visual: "🌾",
        voiceover: "Naya season shuru ho gaya hai… beej aur khaad leni hai.",
        title: "नया सीज़न शुरू! (New Season Begins!)",
        subtitle: "अपनी पहली चॉइस करो (Make your first choice)",
        actions: [
          {
            id: "urea",
            icon: "💊",
            label: "सस्ता यूरिया खरीदो",
            sublabel: "Buy Cheap Urea",
            cost: "₹800",
            color: "amber",
            tag: "सस्ता / Cheap"
          },
          {
            id: "hybrid",
            icon: "🌱",
            label: "हाइब्रिड बीज खरीदो",
            sublabel: "Buy Hybrid Seeds",
            cost: "₹2,000",
            color: "green",
            tag: "समझदारी / Smart"
          }
        ]
      },
      {
        id: "warning",
        type: "story",
        visual: "⚠️",
        voiceover: "Sasta urea jaldi faida deta hai… par mitti ko nuksaan pahunchata hai.",
        title: "एक ज़रूरी बात…",
        subtitle: "(Something important...)",
        message: "सस्ता यूरिया पहले अच्छी फसल देता है। लेकिन मिट्टी को धीरे-धीरे कमज़ोर करता है।",
        messageEn: "Cheap urea gives good crop first time. But it slowly damages the soil.",
        highlight: "mitti_weak"
      },
      {
        id: "bridge",
        type: "bridge",
        visual: "🗺️",
        voiceover: "Ab isse apne gaon mein try karo.",
        title: "अब इसे अपने गाँव में आज़माओ",
        subtitle: "Now try this in your village",
        cta: "🌾 Try on Map"
      }
    ],
    simulation: {
      steps: ["seed_shop", "fertilizer"],
      highlights: ["seed_shop", "fertilizer", "farm"],
      hint: "Yahan se apni fasal ki tayari karo",
      outcomes: {
        good: {
          title: "शानदार फसल! 🌾",
          titleEn: "Great Harvest!",
          message: "Aapki zameen mazboot bani rahegi",
          messageHi: "आपकी ज़मीन मज़बूत बनी रहेगी",
          arthaChange: 15,
          color: "green",
          visual: "lush_field",
          losses: null,
          gains: [
            { icon: "🌾", label: "Fasal", value: "+40% Yield" },
            { icon: "💧", label: "Soil", value: "Healthy" },
            { icon: "💰", label: "Income", value: "+₹25,000" }
          ]
        },
        mid: {
          title: "Theek-Thaak Fasal",
          titleEn: "Average Result",
          message: "Kuch faida, kuch nuksaan",
          messageHi: "कुछ फायदा, कुछ नुकसान",
          arthaChange: 5,
          color: "yellow",
          visual: "fair_field",
          losses: [
            { icon: "🌾", label: "Crop Loss", value: "10%" },
          ],
          gains: [
            { icon: "💰", label: "Income", value: "+₹10,000" }
          ]
        },
        bad: {
          title: "Seed Trap! ⚠️",
          titleEn: "Soil Damaged",
          message: "Zyada urea ne mitti ko kamzor kar diya",
          messageHi: "ज़्यादा यूरिया ने मिट्टी को कमज़ोर कर दिया",
          arthaChange: -20,
          color: "red",
          visual: "seized_field",
          totalLoss: "₹10,000",
          losses: [
            { icon: "🌾", label: "Fasal / Crop Loss", value: "40%" },
            { icon: "💧", label: "Mitti / Soil Fertility", value: "-60%" },
            { icon: "💰", label: "Agle Season / Next Income", value: "-₹10,000" }
          ],
          gains: null
        }
      },
      images: {
        present: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=80",
        lush_field: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        fair_field: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=80",
        seized_field: "https://images.unsplash.com/photo-1516710404095-23136209ed9e?auto=format&fit=crop&w=800&q=80"
      }
    }
  },
  {
    id: "loan_trap",
    icon: "💰",
    title: "Loan Trap – Karz Ka Faisla",
    difficulty: "Medium",
    rewardType: "arthaScore",
    rewardAmount: 30
  }
];

export default learningModules;
