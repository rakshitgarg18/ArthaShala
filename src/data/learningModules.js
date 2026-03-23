const learningModules = [
  {
    id: "seed_trap",
    icon: "🌾",
    title: "उर्वरक का जाल (The Soil Trap)",
    difficulty: "Easy",
    rewardType: "arthaScore",
    rewardAmount: 20,
    slides: [
      { 
        visual: "🚜", 
        text: "खेती का नया सीजन शुरू हो गया है! अच्छी फसल के लिए आपको सही बीज और खाद का चुनाव करना होगा। (New crop season! You must pick the right seeds and fertilizer for a good harvest.)" 
      },
      { 
        visual: "💰", 
        text: "दुकानदार कहता है: 'सस्ता यूरिया ले जाओ, फसल रातों-रात बढ़ जाएगी!' यह सुनने में बहुत अच्छा लगता है। (Shopkeeper says: 'Take cheap urea, your crop will grow overnight!' Sounds tempting.)" 
      },
      { 
        visual: "⚠️", 
        text: "लेकिन सावधान! ज़्यादा यूरिया से शुरू में फसल अच्छी दिखती है, पर धीरे-धीरे ज़मीन बंजर हो जाती है। (But wait! Excess urea makes crops look good at first, but damages soil over time.)" 
      }
    ],
    interaction: {
      type: "decision",
      question: "आप अपने खेत को कैसे तैयार करेंगे? (How will you prepare your farm?)",
      options: [
        {
          id: "cheap",
          text: "सस्ता रास्ता: सामान्य बीज + ज़्यादा यूरिया (Cheap path: Basic seeds + Excess urea)",
          foreshadowing: "शायद शुरू में पैसा बचे, पर मिट्टी का क्या? (Money saved now, but what about the soil?)",
          isGood: false
        },
        {
          id: "smart",
          text: "समझदार रास्ता: हाइब्रिड बीज + संतुलित खाद (Smart path: Hybrid seeds + Balanced fertilizer)",
          foreshadowing: "लंबी अवधि के फायदे के लिए सही निवेश। (A right investment for long-term gains.)",
          isGood: true
        }
      ]
    },
    simulation: {
      steps: ["seed_shop", "fertilizer"],
      outcomes: {
        good: {
          title: "शानदार फसल! (Great Harvest!)",
          description: "हाइब्रिड बीज और संतुलित खाद से मिट्टी भी स्वस्थ रही और मुनाफा भी हुआ। (Hybrid seeds and balanced fertilizer kept soil healthy and maximized profit.)",
          arthaChange: 15,
          impact: "Crop loss: 0%, Income: +₹25,000",
          visual: "lush_field",
          color: "green"
        },
        mid: {
          title: "औसत नतीजा (Average Result)",
          description: "चुनाव ठीक था, पर बेहतर किया जा सकता था। मिट्टी अभी भी ठीक है। (Fair choices, but could be better. Soil is still okay.)",
          arthaChange: 5,
          impact: "Crop loss: 10%, Income: +₹10,000",
          visual: "fair_field",
          color: "yellow"
        },
        bad: {
          title: "मिट्टी बंजर! (Soil Damaged!)",
          description: "ज़्यादा यूरिया ने ज़मीन की जान निकाल दी। अगली बार पैदावार बहुत कम होगी। (Excess urea drained the soil. Future yields will be very low.)",
          arthaChange: -20,
          impact: "Crop loss: 40% (Next season), Income loss: -₹15,000",
          visual: "seized_field",
          color: "red"
        }
      },
      images: {
        present: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=80",
        lush_field: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        fair_field: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=80",
        seized_field: "https://images.unsplash.com/photo-1516710404095-23136209ed9e?auto=format&fit=crop&w=800&q=80"
      }
    }
  }
];

export default learningModules;
