// Detailed card metadata, benefits, fee waiver criteria, and application guides

export interface CardPerk {
  title: string;
  description: string;
  badge?: string;
}

export interface CardFullDetail {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: number;
  minIncome: number;
  joiningFee: number;
  feeWaiverSpend: string;
  loungeAccess: string;
  fuelSurcharge: string;
  welcomeBonus: string;
  rewardRedemption: string;
  keyBenefits: CardPerk[];
  eligibilityRequirements: string[];
  documentsRequired: string[];
  howToApplySteps: { step: number; title: string; desc: string }[];
  cibilRecommendation: string;
}

export const CARD_DETAILS_MAP: Record<string, Partial<CardFullDetail>> = {
  "sbi-cashback": {
    joiningFee: 999,
    feeWaiverSpend: "₹2,00,000 in previous anniversary year",
    loungeAccess: "Complimentary domestic lounge visits via select variants",
    fuelSurcharge: "1% fuel surcharge waiver on transactions between ₹500 and ₹3,000",
    welcomeBonus: "Direct cashback credited directly to card statement within next billing cycle",
    rewardRedemption: "Automated statement credit — no manual reward point conversion needed",
    cibilRecommendation: "720+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5% Direct Cashback on All Online Spends",
        description: "5% cashback on almost all online merchants without merchant restrictions (up to ₹2,000/month).",
        badge: "Top Online Card",
      },
      {
        title: "1% Unlimited Offline Cashback",
        description: "1% cashback on offline retail transactions and point-of-sale terminals.",
      },
      {
        title: "Zero Reward Expiry",
        description: "Cashback is automatically credited to the next monthly card statement.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 65 years",
      "Employment: Salaried (₹25,000+/mo) or Self-Employed with regular tax returns",
      "Resident Indian citizen",
    ],
    documentsRequired: [
      "PAN Card copy",
      "Aadhaar Card (for instant e-KYC)",
      "Latest 3 months salary slips or ITR V-form",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Open Official SBI Sprint Portal",
        desc: "Click 'Apply on Official Issuer Portal' to go directly to SBI Card's verified online application.",
      },
      {
        step: 2,
        title: "Fill Basic Details & Mobile OTP",
        desc: "Enter your mobile number, PAN, and current address for preliminary pre-approval.",
      },
      {
        step: 3,
        title: "Complete Video KYC",
        desc: "Undergo a quick 3-minute video verification with an SBI executive with original PAN card in hand.",
      },
      {
        step: 4,
        title: "Instant Digital Card Issuance",
        desc: "Receive instant virtual card details for online shopping while physical card arrives in 4-6 business days.",
      },
    ],
  },
  "hdfc-millennia": {
    joiningFee: 1000,
    feeWaiverSpend: "₹1,00,000 in the previous year",
    loungeAccess: "1 complimentary domestic airport lounge visit per quarter (upon ₹1L quarterly spend)",
    fuelSurcharge: "1% fuel surcharge waiver (min transaction ₹400, max ₹5,000)",
    welcomeBonus: "1,000 CashPoints upon payment of membership joining fee",
    rewardRedemption: "1 CashPoint = ₹1 for statement cashback redemption",
    cibilRecommendation: "720+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5% CashPoints on Top E-Commerce Brands",
        description: "Amazon, Flipkart, Swiggy, Zomato, Myntra, Tata CliQ, Uber, BookMyShow & Cult.fit.",
        badge: "Best Partner Cashback",
      },
      {
        title: "1% CashPoints on Other Spends",
        description: "1% on all other retail spending and wallet reloads.",
      },
      {
        title: "Quarterly Milestone Vouchers",
        description: "₹1,000 gift voucher on spend of ₹1,00,000 or more in each calendar quarter.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 60 years for salaried; up to 65 for self-employed",
      "Salaried Net Monthly Income: ₹35,000+",
      "Self-employed Annual ITR: ₹6.0 Lakhs+",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Last 3 months bank statements showing salary credits",
      "Income proof (Form 16 or ITR)",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Visit HDFC Official Card Portal",
        desc: "Click through to HDFC Bank's secure application workflow.",
      },
      {
        step: 2,
        title: "Verify Mobile & Existing Relationship",
        desc: "Existing HDFC savings/salary account holders often get zero-document instant approval.",
      },
      {
        step: 3,
        title: "Select Millennia & Confirm Limit",
        desc: "Review your pre-approved credit limit and select your preferred billing cycle.",
      },
      {
        step: 4,
        title: "E-Sign & Instant Setup",
        desc: "E-sign with Aadhaar OTP to activate your virtual card instantly on the PayZapp / MyCards app.",
      },
    ],
  },
  "axis-ace": {
    joiningFee: 499,
    feeWaiverSpend: "₹2,00,000 in previous anniversary year",
    loungeAccess: "4 complimentary domestic airport lounge visits per calendar year",
    fuelSurcharge: "1% fuel surcharge waiver at all fuel stations across India (₹400 to ₹4,000)",
    welcomeBonus: "100% cashback on first utility bill paid via Google Pay (up to ₹500)",
    rewardRedemption: "Automated cashback credit into next month's card statement",
    cibilRecommendation: "700+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5% Cashback on Bill Payments & DTH",
        description: "5% cashback on electricity, internet, mobile recharge & gas bills paid via Google Pay.",
        badge: "Best for Bills",
      },
      {
        title: "4% Cashback on Swiggy, Zomato & Ola",
        description: "4% cashback on dining delivery and cab rides with zero upper order cap.",
      },
      {
        title: "2% Flat Base Cashback",
        description: "Industry-leading 2% flat cashback on all other offline and online transactions.",
      },
    ],
    eligibilityRequirements: [
      "Age: 18 to 70 years",
      "Monthly Income: ₹25,000+ salaried or self-employed equivalent",
      "Google Pay active user preferred",
    ],
    documentsRequired: [
      "Identity Proof (PAN Card)",
      "Address Proof (Aadhaar or Passport)",
      "Recent 2 months salary slip / Bank statement",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Open Axis Bank / GPay Portal",
        desc: "Navigate to the official Axis Ace application page via our secure link.",
      },
      {
        step: 2,
        title: "Enter PAN & Employment Details",
        desc: "Fill in your employer name, work email, and income range.",
      },
      {
        step: 3,
        title: "Instant In-Principle Approval",
        desc: "The automated underwriting engine provides an instant credit decision.",
      },
      {
        step: 4,
        title: "V-KYC & Card Dispatch",
        desc: "Complete brief biometric/video verification; card is delivered within 5 working days.",
      },
    ],
  },
  "hdfc-regalia-gold": {
    joiningFee: 2500,
    feeWaiverSpend: "₹4,00,000 annual spend for fee renewal waiver",
    loungeAccess: "12 complimentary domestic airport lounge visits/yr + 6 international visits via Priority Pass",
    fuelSurcharge: "1% fuel surcharge waiver at all fuel stations across India",
    welcomeBonus: "Club Marriott membership + ₹2,500 flight/hotel vouchers upon joining fee payment",
    rewardRedemption: "1 Reward Point = Up to ₹0.50 for flight and hotel bookings via SmartBuy",
    cibilRecommendation: "740+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5X Reward Points on Premium Brands",
        description: "Marks & Spencer, Myntra, Nykaa & Reliance Digital.",
        badge: "Luxury & Travel",
      },
      {
        title: "Complimentary Flight & Hotel Vouchers",
        description: "₹1,500 Marriott voucher on quarterly spend of ₹1.5L + ₹5,000 flight voucher on ₹5L annual spend.",
      },
      {
        title: "Comprehensive Travel Insurance",
        description: "Air accident cover of ₹1 Crore + emergency medical hospitalization abroad.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 65 years",
      "Salaried Net Monthly Income: ₹1,00,000+ (or ₹12L+ annual ITR for self-employed)",
      "Strong credit repayment history",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Last 3 months salary slips or Latest 2 years Form 16 / ITR",
      "6 months bank statement",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Access HDFC Regalia Portal",
        desc: "Initiate your premium card application on HDFC's secured server.",
      },
      {
        step: 2,
        title: "Income & Relationship Verification",
        desc: "Confirm salary account or upload latest Form 16/ITR documentation.",
      },
      {
        step: 3,
        title: "Select Priority Pass Option",
        desc: "Opt-in for international lounge priority pass and Marriott tier setup.",
      },
      {
        step: 4,
        title: "Card Delivery & Concierge Access",
        desc: "Receive premium card package with 24x7 Global Concierge hotline credentials.",
      },
    ],
  },
  "indianoil-axis": {
    joiningFee: 500,
    feeWaiverSpend: "₹50,000 annual spend waiver",
    loungeAccess: "Standard railway and partner lounge offers during select promotional quarters",
    fuelSurcharge: "1% fuel surcharge waiver on transactions between ₹200 and ₹5,000",
    welcomeBonus: "100% cashback up to ₹250 on first fuel transaction within 30 days of issuance",
    rewardRedemption: "EDGE reward points convertible directly into IndianOil fuel vouchers",
    cibilRecommendation: "700+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "4% Value Back on IOCL Fuel",
        description: "20 EDGE Reward Points per ₹100 spent at IndianOil fuel stations across India.",
        badge: "Top Fuel Card",
      },
      {
        title: "1% Instant Fuel Surcharge Waiver",
        description: "Save 1% additional surcharge on every fuel refill.",
      },
      {
        title: "1% Value Back on Online Shopping",
        description: "Earn 5 EDGE reward points per ₹100 spent on major e-commerce platforms.",
      },
    ],
    eligibilityRequirements: [
      "Age: 18 to 70 years",
      "Monthly Income: ₹20,000+ salaried or self-employed",
      "Indian Resident",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Bank statement of salary account / ITR",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Open IndianOil Axis Page",
        desc: "Launch the co-branded application via Axis Bank portal.",
      },
      {
        step: 2,
        title: "Enter Vehicle & Spend Details",
        desc: "Provide basic identity credentials and estimated fuel requirements.",
      },
      {
        step: 3,
        title: "Video KYC",
        desc: "Complete standard video identification via Aadhaar authentication.",
      },
      {
        step: 4,
        title: "Card Activation",
        desc: "Physical card delivered to address with instant IOCL points linkage.",
      },
    ],
  },
  "scapia": {
    joiningFee: 0,
    feeWaiverSpend: "Lifetime free — no annual fee ever",
    loungeAccess: "Unlimited complimentary domestic airport lounge visits via Scapia membership",
    fuelSurcharge: "1% fuel surcharge waiver across all fuel stations",
    welcomeBonus: "Earn 3,000 Scapia coins as welcome bonus",
    rewardRedemption: "Scapia coins redeemable for flights, hotels, and travel experiences on the Scapia app",
    cibilRecommendation: "700+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "Unlimited Domestic Lounge Access",
        description: "Visit any domestic airport lounge across India as many times as you want — truly unlimited.",
        badge: "Best Travel Card in India",
      },
      {
        title: "Zero Forex Markup",
        description: "Use your card internationally with zero foreign exchange markup on all transactions.",
      },
      {
        title: "Upto 20% Rewards on Travel",
        description: "Earn Scapia coins on every travel booking — flights, hotels, stays, experiences.",
      },
    ],
    eligibilityRequirements: [
      "Age: 18 to 65 years",
      "Salaried or self-employed Indian resident",
      "KYC compliant with valid Aadhaar",
    ],
    documentsRequired: [
      "PAN Card",
      "Aadhaar (for e-KYC)",
      "Selfie for video verification",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Download Scapia App",
        desc: "Apply directly via the Scapia mobile app or our secure affiliate link.",
      },
      {
        step: 2,
        title: "Complete KYC in 2 Minutes",
        desc: "Enter PAN + Aadhaar; instant digital KYC with zero physical documents.",
      },
      {
        step: 3,
        title: "Get Instant Card Number",
        desc: "Receive virtual card number immediately for online booking while physical card ships.",
      },
      {
        step: 4,
        title: "Start Earning Travel Rewards",
        desc: "Use on Scapia app to book flights and hotels and watch coins accumulate.",
      },
    ],
  },
  "hdfc-pixel-play": {
    joiningFee: 0,
    feeWaiverSpend: "Lifetime free — no joining or annual fee",
    loungeAccess: "Access via PayZapp wallet milestones",
    fuelSurcharge: "1% fuel surcharge waiver on HDFC partner stations",
    welcomeBonus: "Earn up to 5% cashback on first 3 transactions across partner brands",
    rewardRedemption: "Cashback credited directly via PayZapp wallet within 30 days",
    cibilRecommendation: "700+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5% Cashback on Partner Brands",
        description: "5% cashback on Amazon, Flipkart, Myntra, Zomato, and other top partner platforms via PayZapp.",
        badge: "Best Lifestyle Card",
      },
      {
        title: "Flexible Billing Cycles",
        description: "Choose your own billing cycle and control your payment date via the PayZapp app.",
      },
      {
        title: "Seamless PayZapp Integration",
        description: "Manage card, rewards, and payments entirely within the HDFC PayZapp super-app.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 60 years",
      "Salaried: ₹20,000+/month; Self-employed: ₹2.4L+/year ITR",
      "Existing HDFC or PayZapp customer preferred",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Latest 3 months salary slips or ITR",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Open PayZapp App",
        desc: "Apply via the HDFC PayZapp app — entire process is 100% digital.",
      },
      {
        step: 2,
        title: "Select Card & Enter PAN",
        desc: "Choose Pixel Play, enter PAN and personal details.",
      },
      {
        step: 3,
        title: "Instant Approval Decision",
        desc: "Get instant in-principle approval via automated underwriting.",
      },
      {
        step: 4,
        title: "Virtual Card Issued Immediately",
        desc: "Start using your virtual card online instantly; physical card arrives in 5 working days.",
      },
    ],
  },
  "axis-cashback": {
    joiningFee: 500,
    feeWaiverSpend: "₹2,00,000 spent in previous anniversary year",
    loungeAccess: "Not included",
    fuelSurcharge: "1% fuel surcharge waiver at all fuel stations",
    welcomeBonus: "Flat 5% cashback on first 3 online transactions up to ₹1,000",
    rewardRedemption: "Automatic cashback credited to statement — no redemption required",
    cibilRecommendation: "710+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5% Cashback on All Online Spends",
        description: "5% cashback on all online transactions across any website or app — no merchant restrictions.",
        badge: "Best Online Cashback",
      },
      {
        title: "2% Cashback on Utility Payments",
        description: "2% cashback on electricity, gas, telecom, and insurance bill payments.",
      },
      {
        title: "1% Cashback on All Other Spends",
        description: "Flat 1% back on offline retail, grocery, and all other transactions.",
      },
    ],
    eligibilityRequirements: [
      "Age: 18 to 70 years",
      "Minimum income: ₹25,000/month salaried",
      "Indian resident with valid PAN",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Latest 3 months salary slips",
      "Bank statement (3 months)",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Apply on Axis Bank Portal",
        desc: "Visit our affiliate link to the official Axis Bank application page.",
      },
      {
        step: 2,
        title: "Fill PAN & Employment Details",
        desc: "Enter your employer info, income, and PAN.",
      },
      {
        step: 3,
        title: "Instant Approval",
        desc: "Automated underwriting gives instant decision — no branch visit needed.",
      },
      {
        step: 4,
        title: "V-KYC & Card Dispatch",
        desc: "Short video verification; physical card ships within 5 working days.",
      },
    ],
  },
  "axis-magnus": {
    joiningFee: 10000,
    feeWaiverSpend: "₹15,00,000 annual spend for renewal fee waiver",
    loungeAccess: "Unlimited domestic + 8 international lounge visits/year via Mastercard Lounge Key",
    fuelSurcharge: "1% fuel surcharge waiver across all Indian fuel stations",
    welcomeBonus: "25,000 EDGE Reward Points on joining fee payment (~₹5,000 value)",
    rewardRedemption: "1 EDGE Point = ₹0.20 for travel bookings; convert to Air Miles at 5 EDGE = 1 Air Mile",
    cibilRecommendation: "760+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "12 EDGE Points per ₹100 on Travel",
        description: "Earn massive 12 EDGE points for every ₹100 spent on flights, hotels, and travel agencies.",
        badge: "India's Best Travel Rewards",
      },
      {
        title: "Unlimited Domestic Lounge Access",
        description: "Walk into any partner domestic airport lounge — no quarterly cap, no visit limit.",
      },
      {
        title: "Golf & Concierge Benefits",
        description: "Complimentary golf rounds at premium courses + 24x7 premium concierge for bookings.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 65 years",
      "Annual Income: ₹18,00,000+ (salaried) or ₹24L ITR (self-employed)",
      "Excellent credit history — 760+ CIBIL",
    ],
    documentsRequired: [
      "PAN Card",
      "Latest Form 16 or 2 years ITR",
      "6 months bank statement showing income credits",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Apply via Official Portal",
        desc: "Click through to Axis Bank's secure premium card application.",
      },
      {
        step: 2,
        title: "Income Proof & CIBIL Check",
        desc: "Upload Form 16 or ITR — underwriting team reviews within 48 hours.",
      },
      {
        step: 3,
        title: "Phone Verification with RM",
        desc: "Dedicated Relationship Manager call for final verification.",
      },
      {
        step: 4,
        title: "Premium Card Delivery",
        desc: "Delivered via courier in premium packaging with welcome kit within 7 working days.",
      },
    ],
  },
  "sbi-miles": {
    joiningFee: 1499,
    feeWaiverSpend: "₹4,00,000 annual spend for renewal fee waiver",
    loungeAccess: "6 complimentary domestic airport lounge visits per year",
    fuelSurcharge: "1% fuel surcharge waiver at all fuel stations",
    welcomeBonus: "1,500 Travel Credits (~₹1,500 value) as welcome gift",
    rewardRedemption: "1 Travel Credit = ₹1 redeemable against flights, hotels via SBI YOLO app",
    cibilRecommendation: "720+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "1,500 Welcome Travel Credits",
        description: "Get 1,500 travel credits worth ₹1,500 instantly upon card activation.",
        badge: "Best SBI Travel Card",
      },
      {
        title: "5% Rewards on Travel Bookings",
        description: "Earn 5 Travel Credits per ₹100 on all flight and hotel bookings.",
      },
      {
        title: "Milestone Travel Vouchers",
        description: "Earn extra flight vouchers on reaching ₹2L and ₹4L annual spend milestones.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 65 years",
      "Minimum income: ₹50,000/month salaried",
      "Good credit bureau history",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Latest 3 months salary slips or 2 years ITR",
      "3 months bank statement",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Visit SBI Miles Page",
        desc: "Click our secure link to SBI Card's official Miles application portal.",
      },
      {
        step: 2,
        title: "Complete Online Application",
        desc: "Fill in personal, income, and employment details.",
      },
      {
        step: 3,
        title: "Video KYC",
        desc: "Complete Aadhaar-based video KYC within the SBI Card app.",
      },
      {
        step: 4,
        title: "Card & Travel Credit Activation",
        desc: "Card delivered in 5-7 days; travel credits credited on first login.",
      },
    ],
  },
  "idfc-wow": {
    joiningFee: 0,
    feeWaiverSpend: "Lifetime free — no annual fee, ever",
    loungeAccess: "Not included — entry-level card",
    fuelSurcharge: "1% fuel surcharge waiver across fuel stations",
    welcomeBonus: "No joining fee, no waiting — instant free card issuance",
    rewardRedemption: "Reward points redeemable as statement credit or vouchers via IDFC app",
    cibilRecommendation: "650+ CIBIL score acceptable — good for credit building",
    keyBenefits: [
      {
        title: "100% Lifetime Free Card",
        description: "Absolutely zero joining fee, zero annual fee — forever. No conditions, no minimum spend.",
        badge: "Truly Lifetime Free",
      },
      {
        title: "4X Reward Points on Online Spends",
        description: "Earn 4X reward points on all online transactions including shopping and payments.",
      },
      {
        title: "Zero Lost Card Liability",
        description: "Complete protection against fraudulent transactions after card loss is reported.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 60 years",
      "No minimum income requirement — ideal for first-time card holders",
      "Valid PAN and Aadhaar required",
    ],
    documentsRequired: [
      "PAN Card",
      "Aadhaar for instant e-KYC",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Apply on IDFC App or Website",
        desc: "Open the IDFC FIRST Bank mobile app or visit our link.",
      },
      {
        step: 2,
        title: "Aadhaar OTP Verification",
        desc: "Instant e-KYC via Aadhaar-linked mobile number — no video call needed.",
      },
      {
        step: 3,
        title: "Instant Virtual Card",
        desc: "Virtual card number issued immediately for online transactions.",
      },
      {
        step: 4,
        title: "Physical Card Delivery",
        desc: "Card arrives at your registered address within 5-7 working days.",
      },
    ],
  },
  "indusind-legend": {
    joiningFee: 1999,
    feeWaiverSpend: "₹3,00,000 annual spend for renewal fee waiver",
    loungeAccess: "8 complimentary domestic airport lounge visits per year",
    fuelSurcharge: "1% fuel surcharge waiver on all fuel spends",
    welcomeBonus: "5,000 reward points on first transaction within 30 days of card issuance",
    rewardRedemption: "1 Reward Point = ₹0.40 for travel, 1 RP = ₹0.20 for gift vouchers",
    cibilRecommendation: "720+ CIBIL score recommended",
    keyBenefits: [
      {
        title: "5% on Travel & Hotels",
        description: "Earn accelerated rewards on all travel and hotel bookings made directly or through apps.",
        badge: "Best Travel + Dining Card",
      },
      {
        title: "4% on Dining Worldwide",
        description: "Earn 4% back on dining at restaurants, cafes, and food delivery platforms globally.",
      },
      {
        title: "Premium Golf Access",
        description: "Complimentary golf rounds at 25+ premium golf courses across India.",
      },
    ],
    eligibilityRequirements: [
      "Age: 21 to 65 years",
      "Minimum income: ₹50,000/month salaried",
      "Good credit history required",
    ],
    documentsRequired: [
      "PAN Card & Aadhaar",
      "Latest 3 months salary slips or 2 years ITR",
      "3 months bank statement",
    ],
    howToApplySteps: [
      {
        step: 1,
        title: "Visit IndusInd Portal",
        desc: "Apply through our secure link to IndusInd Bank's official card page.",
      },
      {
        step: 2,
        title: "Fill Application & Upload Docs",
        desc: "Submit employment, income, and identity documents digitally.",
      },
      {
        step: 3,
        title: "Credit Assessment",
        desc: "Automated + manual underwriting review within 2-3 working days.",
      },
      {
        step: 4,
        title: "Premium Card Delivery",
        desc: "Card shipped via courier with welcome kit within 7 working days.",
      },
    ],
  },
};

/** Helper to retrieve comprehensive card details with fallback */
export function getCardFullDetails(cardName: string, bankName: string, id: string): CardFullDetail {
  const slug = (cardName + "-" + bankName).toLowerCase();
  const cardLower = cardName.toLowerCase();
  
  let matchKey = Object.keys(CARD_DETAILS_MAP).find((key) => {
    if (id.toLowerCase().includes(key)) return true;
    if (slug.includes(key.replace(/-/g, " "))) return true;
    if (key === "sbi-cashback" && cardLower.includes("cashback") && bankName.toLowerCase().includes("sbi")) return true;
    if (key === "hdfc-millennia" && cardLower.includes("millennia") && bankName.toLowerCase().includes("hdfc")) return true;
    if (key === "axis-ace" && cardLower.includes("ace") && bankName.toLowerCase().includes("axis")) return true;
    if (key === "hdfc-regalia-gold" && cardLower.includes("regalia")) return true;
    if (key === "indianoil-axis" && cardLower.includes("indianoil")) return true;
    if (key === "scapia" && cardLower.includes("scapia")) return true;
    if (key === "hdfc-pixel-play" && cardLower.includes("pixel")) return true;
    if (key === "axis-cashback" && cardLower.includes("cashback") && bankName.toLowerCase().includes("axis")) return true;
    if (key === "axis-magnus" && cardLower.includes("magnus")) return true;
    if (key === "sbi-miles" && cardLower.includes("miles") && bankName.toLowerCase().includes("sbi")) return true;
    if (key === "idfc-wow" && cardLower.includes("wow")) return true;
    if (key === "indusind-legend" && cardLower.includes("legend")) return true;
    return false;
  });

  const custom = matchKey ? CARD_DETAILS_MAP[matchKey] : null;

  return {
    id,
    bankName,
    cardName,
    annualFee: 1000,
    minIncome: 350000,
    joiningFee: custom?.joiningFee ?? 500,
    feeWaiverSpend: custom?.feeWaiverSpend ?? "₹1,00,000 spent in previous anniversary year",
    loungeAccess: custom?.loungeAccess ?? "Complimentary domestic lounge access per quarter upon meeting minimum spend",
    fuelSurcharge: custom?.fuelSurcharge ?? "1% fuel surcharge waiver across authorized stations in India",
    welcomeBonus: custom?.welcomeBonus ?? "Welcome gift voucher or statement credit upon fee payment",
    rewardRedemption: custom?.rewardRedemption ?? "Direct statement credit or conversion into partner vouchers",
    cibilRecommendation: custom?.cibilRecommendation ?? "720+ CIBIL score recommended for high approval rate",
    keyBenefits: custom?.keyBenefits ?? [
      {
        title: "Accelerated Category Cashback",
        description: "Earn accelerated rewards on top spending categories with direct statement credit.",
        badge: "Reward Multiplier",
      },
      {
        title: "Zero Liability Protection",
        description: "Zero lost card liability protection when reported immediately to bank helpline.",
      },
      {
        title: "Contactless Tap & Pay",
        description: "Fast, PIN-less contactless transactions up to ₹5,000 at enabled POS terminals.",
      },
    ],
    eligibilityRequirements: custom?.eligibilityRequirements ?? [
      "Age: 21 to 65 years",
      "Employment: Salaried or Self-Employed with steady income proof",
      "Resident Indian with valid PAN and Aadhaar",
    ],
    documentsRequired: custom?.documentsRequired ?? [
      "PAN Card copy",
      "Aadhaar Card for instant e-KYC",
      "Latest 3 months salary slips or ITR copy",
    ],
    howToApplySteps: custom?.howToApplySteps ?? [
      {
        step: 1,
        title: "Access Official Bank Portal",
        desc: "Click 'Apply on Official Issuer Portal' to visit the verified banking portal.",
      },
      {
        step: 2,
        title: "Fill Contact & KYC Information",
        desc: "Submit your basic identification, PAN, and current residential address.",
      },
      {
        step: 3,
        title: "Quick Video KYC",
        desc: "Complete a 3-minute video verification with original PAN card in hand.",
      },
      {
        step: 4,
        title: "Card Issuance & Dispatch",
        desc: "Receive your digital card details immediately; physical card arrives in 4-6 business days.",
      },
    ],
  };
}

