import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "nbr-checker-lang";

/** Convert a string with Western digits to Bangla numerals. */
export function toBnDigits(input: string | number): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(input).replace(/\d/g, (d) => map[Number(d)]);
}

/** Format a number with locale-aware grouping, Bangla numerals when lang=bn. */
export function fmtNumber(n: number, lang: Lang): string {
  const grouped = n.toLocaleString("en-US"); // 87,685
  return lang === "bn" ? toBnDigits(grouped) : grouped;
}

type Dict = Record<string, string>;

const en: Dict = {
  // header
  "header.brand": "NBR Audit Checker",
  "header.tagline": "AY 2023–24 · Risk-Based",
  "header.langLabel": "Language",

  // hero badge
  "hero.badge.official": "Official NBR data",
  "hero.badge.returns": "returns",
  "hero.badge.visits": "visits",
  "hero.badge.tinChecks": "TIN checks",

  // hero
  "hero.title.a": "Is your TIN selected for",
  "hero.title.b": "NBR Audit?",
  "hero.subtitle":
    "Instantly check the official Risk-Based Audit Selection list for Assessment Year 2023–24. Runs entirely in your browser — no data leaves your device.",

  // form
  "form.label": "Taxpayer Identification Number (TIN)",
  "form.placeholder": "e.g. 123456789012",
  "form.button": "Check Status",
  "form.validation.length":
    "A TIN must be exactly 12 digits. You entered {n} digit(s).",
  "form.hint.remaining": "{n} more digit(s) to go",
  "form.db.loading": "Loading database…",
  "form.db.ready": "Database ready · lookups are instant",

  // disclaimer
  "disclaimer.title": "Disclaimer:",
  "disclaimer.body":
    "This is a community-built tool using publicly available NBR data. We are not affiliated with the National Board of Revenue or any government body, and we make no guarantee about the accuracy or completeness of the lists. Regardless of what this tool shows,",
  "disclaimer.cta": "always verify your audit status directly with NBR",
  "disclaimer.tail": "or your tax circle before taking any action.",

  // result – found
  "result.found.title": "Selected for Audit",
  "result.found.body": "This TIN appears on the NBR Risk-Based Audit list.",
  "result.found.source.both": "Found in: Both published lists",
  "result.found.source.list2": "Source: Audit Selection List 2 (8-zone PDF)",
  "result.found.source.list1": "Source: Audit Selection List 1 (49-zone master)",
  "result.field.tin": "TIN",
  "result.field.year": "Assessment Year",
  "result.field.zone": "Zone",
  "result.field.circle": "Circle",
  "result.field.submission": "Submission Type",

  // result – not found
  "result.notfound.title": "Not Selected",
  "result.notfound.body":
    "TIN {tin} is not in the NBR audit selection list for AY 2023–24.",

  // stats
  "stat.returns": "Returns selected",
  "stat.lists": "Official lists merged",
  "stat.client": "Client-side · private",

  // how-it-works card
  "how.cta.title": "Curious how this works?",
  "how.cta.body":
    "See exactly what happens when you check a TIN, what we do (and don't) store, and the privacy-respecting analytics we use.",
  "how.cta.link": "How this site works →",

  // FAQ card
  "faq.cta.title": "Have questions?",
  "faq.cta.body":
    "Read our FAQ — including important limitations of this tool (we can only check if a number exists in the list, not whether it's a valid TIN).",
  "faq.cta.link": "Read FAQ →",

  // about block
  "about.title": "About this tool.",
  "about.body.a":
    "The National Board of Revenue (NBR) selected income tax returns for audit using an automated Risk-Based Audit Criterion for tax year 2023–24. This tool combines",
  "about.body.b": "both officially published TIN lists",
  "about.body.c":
    "(72,196 from the 49-zone master list and 15,489 from the 8-zone supplementary list) into a single instant search —",
  "about.body.d": "returns in total. Source: NBR press release, 28 April 2026.",
  "about.viewSource": "View Source Document",
  "about.hideSource": "Hide Source Document",
  "about.download": "Download",

  // footer
  "footer.builtBy": "Built with",
  "footer.builtBy2": "and AI by",
  "footer.unofficial": "Unofficial tool · Data sourced from NBR",
  "footer.hostedBy": "Hosted By",
  "footer.hostedIn": "in Bangladesh",
  "footer.openSource": "Open source on GitHub",

  // how-it-works page
  "how.tagline": "How it works",
  "how.back": "← Back to checker",
  "how.badge": "Privacy-first by design",
  "how.title.a": "Your TIN never",
  "how.title.b": "leaves your browser",
  "how.subtitle":
    "Here's exactly what happens — step by step — when you check a TIN on this site, and what (little) data we collect.",
  "how.steps.heading": "How the verification process works",
  "how.step1.title": "You open the page",
  "how.step1.body":
    "Your browser downloads the website code and the audit list (audit.json — about 87,685 TIN records published by NBR). The list is delivered as a static file from our CDN, just like an image or a stylesheet.",
  "how.step2.title": "You type your TIN",
  "how.step2.body":
    "The 12-digit TIN you type lives only in your browser's memory. There is no auto-save, no background sync, no 'as-you-type' API call. Nothing is transmitted while you type.",
  "how.step3.title": "The match runs locally",
  "how.step3.body":
    "When you press Check Status, JavaScript running on your device looks your TIN up in the list it already downloaded. No request is sent to our server with your TIN — the answer is computed entirely on your machine.",
  "how.step4.title": "You see the result",
  "how.step4.body":
    "Found or not found, the result is rendered locally. We never see your TIN, your result, your IP-to-TIN linkage, or anything that could identify you.",
  "how.flow.title": "Visual: where your data goes",
  "how.flow.note":
    "You can verify this yourself: open your browser's DevTools → Network tab, type a TIN, and press Check Status. You'll see no request carrying your TIN.",
  "how.analytics.title": "About our analytics",
  "how.analytics.body":
    "To understand how people use the site (e.g. how many visits, how many lookups happen), we run a small, self-hosted analytics instance —",
  "how.analytics.notGA": "not Google Analytics",
  "how.analytics.notGA2": ", not Meta Pixel, no third-party trackers.",
  "how.analytics.b1":
    "Hosted by me personally on agent-analytics.asif.dev — data never goes to a third party.",
  "how.analytics.b2": "No cookies. No fingerprinting. No cross-site tracking.",
  "how.analytics.b3":
    "No personal data. We never log your TIN, your name, or your IP linked to any lookup.",
  "how.analytics.b4":
    "What we do count: anonymous page views and how many times the \"Check Status\" button is pressed (without the TIN).",
  "how.tech.title": "The tech, briefly",
  "how.tech.frontend": "Frontend",
  "how.tech.frontend.v": "React + TanStack Start",
  "how.tech.hosting": "Hosting",
  "how.tech.hosting.v": "Edge CDN (static files)",
  "how.tech.db": "Database",
  "how.tech.db.v": "Single audit.json file in your browser",
  "how.tech.analytics": "Analytics",
  "how.tech.analytics.v": "Self-hosted, cookieless",
  "how.tech.source": "Source data",
  "how.tech.source.v": "NBR press release (28 Apr 2026)",
  "how.tech.backend": "Backend lookups",
  "how.tech.backend.v": "None — 100% client-side",
  "how.backCta": "← Back to TIN Checker",

  // FAQ page
  "faq.title": "Frequently Asked Questions",
  "faq.subtitle":
    "Honest answers about what this tool can and cannot do.",
  "faq.tagline": "FAQ",
  "faq.back": "← Back to checker",
  "faq.limit.title": "Important limitation",
  "faq.limit.body":
    "This tool can only tell you whether a number exists in the published NBR audit list. It cannot tell you whether the number is a real, valid TIN. If you enter a random or invalid 12-digit number, you will still see \"Not Selected\" — because that random number simply isn't in the audit list. \"Not Selected\" does NOT mean \"this TIN is valid.\"",

  "faq.q1": "What does this site actually do?",
  "faq.a1":
    "It checks whether a 12-digit TIN appears in NBR's officially published Risk-Based Audit Selection list for Assessment Year 2023–24. That's it. The lookup runs entirely in your browser.",

  "faq.q2": "If my TIN shows \"Not Selected\", does that mean my TIN is valid?",
  "faq.a2":
    "No. We have no way to verify whether a 12-digit number is a real TIN issued by NBR. \"Not Selected\" only means the number isn't in the audit list — it does not confirm that the number is a genuine TIN. To validate your TIN, log into the NBR e-Return portal or contact your tax circle.",

  "faq.q3": "Can I trust the result for legal or tax decisions?",
  "faq.a3":
    "Treat the result as informational only. This is a community-built tool. Always confirm your audit status with NBR or your tax circle before making any decision.",

  "faq.q4": "Where does the data come from?",
  "faq.a4":
    "From two officially published NBR sources: the 49-zone master list (72,196 entries) and the 8-zone supplementary list (15,489 entries). Combined: 87,685 returns. Source: NBR press release dated 28 April 2026.",

  "faq.q5": "Do you store my TIN or send it anywhere?",
  "faq.a5":
    "No. Your TIN never leaves your browser. The entire dataset is downloaded once, and the lookup is performed locally on your device. We do not log, store, or transmit TINs. See the \"How it works\" page for the technical breakdown.",

  "faq.q6": "What about analytics?",
  "faq.a6":
    "We run a self-hosted, cookieless analytics instance to count anonymous page visits and how often the \"Check Status\" button is pressed. We never record your TIN, name, or any personal identifier. No Google Analytics, no Meta Pixel, no third-party trackers.",

  "faq.q7": "Why does my TIN appear in the list?",
  "faq.a7":
    "Selection is determined by NBR using an automated Risk-Based Audit Criterion. We do not know — and cannot tell you — why any specific TIN was selected. Contact your tax circle for clarification.",

  "faq.q8": "Who built this and why?",
  "faq.a8":
    "Built by M Asif Rahman as a community service to make publicly published NBR information easier to search. This tool is unofficial and not affiliated with NBR or any government body.",

  "faq.contact":
    "Still have questions? Reach out on GitHub or contact NBR directly for anything official.",
};

const bn: Dict = {
  // header
  "header.brand": "NBR অডিট চেকার",
  "header.tagline": "করবর্ষ ২০২৩–২৪ · ঝুঁকিভিত্তিক",
  "header.langLabel": "ভাষা",

  // hero badge
  "hero.badge.official": "অফিসিয়াল NBR ডেটা",
  "hero.badge.returns": "রিটার্ন",
  "hero.badge.visits": "ভিজিট",
  "hero.badge.tinChecks": "TIN চেক",

  // hero
  "hero.title.a": "আপনার TIN কি",
  "hero.title.b": "NBR অডিটের জন্য নির্বাচিত?",
  "hero.subtitle":
    "করবর্ষ ২০২৩–২৪-এর অফিসিয়াল ঝুঁকিভিত্তিক অডিট তালিকায় আপনার TIN আছে কিনা তা তাৎক্ষণিক যাচাই করুন। সম্পূর্ণ আপনার ব্রাউজারেই চলে — কোনো তথ্য আপনার ডিভাইস থেকে বের হয় না।",

  // form
  "form.label": "করদাতা শনাক্তকরণ নম্বর (TIN)",
  "form.placeholder": "যেমন ১২৩৪৫৬৭৮৯০১২",
  "form.button": "যাচাই করুন",
  "form.validation.length":
    "TIN অবশ্যই ঠিক ১২ ডিজিটের হতে হবে। আপনি দিয়েছেন {n} ডিজিট।",
  "form.hint.remaining": "আরো {n} ডিজিট প্রয়োজন",
  "form.db.loading": "ডেটাবেস লোড হচ্ছে…",
  "form.db.ready": "ডেটাবেস প্রস্তুত · যাচাই তাৎক্ষণিক",

  // disclaimer
  "disclaimer.title": "দাবিত্যাগ:",
  "disclaimer.body":
    "এটি একটি কমিউনিটি-নির্মিত টুল যা প্রকাশ্যে প্রকাশিত NBR ডেটা ব্যবহার করে। আমরা জাতীয় রাজস্ব বোর্ড বা কোনো সরকারি সংস্থার সাথে যুক্ত নই, এবং তালিকার নির্ভুলতা বা সম্পূর্ণতার কোনো গ্যারান্টি দিই না। এই টুল যা-ই দেখাক না কেন,",
  "disclaimer.cta": "সর্বদা NBR-এর কাছে সরাসরি আপনার অডিট স্ট্যাটাস যাচাই করুন",
  "disclaimer.tail": "অথবা কোনো পদক্ষেপ নেওয়ার আগে আপনার ট্যাক্স সার্কেলে যোগাযোগ করুন।",

  // result – found
  "result.found.title": "অডিটের জন্য নির্বাচিত",
  "result.found.body": "এই TIN টি NBR ঝুঁকিভিত্তিক অডিট তালিকায় রয়েছে।",
  "result.found.source.both": "পাওয়া গেছে: উভয় প্রকাশিত তালিকায়",
  "result.found.source.list2": "উৎস: অডিট নির্বাচন তালিকা ২ (৮-জোন PDF)",
  "result.found.source.list1": "উৎস: অডিট নির্বাচন তালিকা ১ (৪৯-জোন মাস্টার)",
  "result.field.tin": "TIN",
  "result.field.year": "করবর্ষ",
  "result.field.zone": "জোন",
  "result.field.circle": "সার্কেল",
  "result.field.submission": "জমার ধরন",

  // result – not found
  "result.notfound.title": "নির্বাচিত নয়",
  "result.notfound.body":
    "TIN {tin} করবর্ষ ২০২৩–২৪-এর NBR অডিট নির্বাচন তালিকায় নেই।",

  // stats
  "stat.returns": "নির্বাচিত রিটার্ন",
  "stat.lists": "অফিসিয়াল তালিকা একত্রিত",
  "stat.client": "ক্লায়েন্ট-সাইড · ব্যক্তিগত",

  // how-it-works card
  "how.cta.title": "কীভাবে কাজ করে জানতে চান?",
  "how.cta.body":
    "TIN যাচাই করার সময় ঠিক কী ঘটে, আমরা কী সংরক্ষণ করি (এবং করি না), এবং আমাদের গোপনীয়তা-সম্মত অ্যানালিটিকস সম্পর্কে দেখুন।",
  "how.cta.link": "এই সাইট কীভাবে কাজ করে →",

  // FAQ card
  "faq.cta.title": "প্রশ্ন আছে?",
  "faq.cta.body":
    "আমাদের FAQ পড়ুন — এই টুলের গুরুত্বপূর্ণ সীমাবদ্ধতা সহ (আমরা শুধু দেখতে পারি কোনো নম্বর তালিকায় আছে কিনা, এটি বৈধ TIN কিনা তা নয়)।",
  "faq.cta.link": "FAQ পড়ুন →",

  // about block
  "about.title": "এই টুল সম্পর্কে।",
  "about.body.a":
    "জাতীয় রাজস্ব বোর্ড (NBR) করবর্ষ ২০২৩–২৪-এর জন্য একটি স্বয়ংক্রিয় ঝুঁকিভিত্তিক অডিট মাপকাঠি ব্যবহার করে আয়কর রিটার্ন অডিটের জন্য নির্বাচন করেছে। এই টুল",
  "about.body.b": "উভয় অফিসিয়াল প্রকাশিত TIN তালিকা",
  "about.body.c":
    "(৪৯-জোন মাস্টার তালিকা থেকে ৭২,১৯৬ এবং ৮-জোন সম্পূরক তালিকা থেকে ১৫,৪৮৯) একটি একক তাৎক্ষণিক সার্চে একত্রিত করেছে —",
  "about.body.d": "মোট রিটার্ন। উৎস: NBR প্রেস রিলিজ, ২৮ এপ্রিল ২০২৬।",
  "about.viewSource": "মূল ডকুমেন্ট দেখুন",
  "about.hideSource": "মূল ডকুমেন্ট লুকান",
  "about.download": "ডাউনলোড",

  // footer
  "footer.builtBy": "তৈরি করেছেন",
  "footer.builtBy2": "এবং AI দ্বারা",
  "footer.unofficial": "অনানুষ্ঠানিক টুল · ডেটা NBR থেকে সংগৃহীত",
  "footer.hostedBy": "হোস্ট করেছে",
  "footer.hostedIn": "বাংলাদেশে",
  "footer.openSource": "GitHub-এ ওপেন সোর্স",

  // how-it-works page
  "how.tagline": "কীভাবে কাজ করে",
  "how.back": "← চেকারে ফিরে যান",
  "how.badge": "ডিজাইনে গোপনীয়তা সর্বাগ্রে",
  "how.title.a": "আপনার TIN কখনো",
  "how.title.b": "ব্রাউজার ছেড়ে যায় না",
  "how.subtitle":
    "এই সাইটে TIN যাচাই করার সময় ঠিক কী ঘটে — ধাপে ধাপে — এবং আমরা কী (সামান্য) ডেটা সংগ্রহ করি।",
  "how.steps.heading": "যাচাই প্রক্রিয়া কীভাবে কাজ করে",
  "how.step1.title": "আপনি পেজ খুলুন",
  "how.step1.body":
    "আপনার ব্রাউজার ওয়েবসাইটের কোড এবং অডিট তালিকা (audit.json — NBR প্রকাশিত প্রায় ৮৭,৬৮৫টি TIN রেকর্ড) ডাউনলোড করে। তালিকাটি একটি ছবি বা স্টাইলশীটের মতো আমাদের CDN থেকে স্ট্যাটিক ফাইল হিসেবে সরবরাহ করা হয়।",
  "how.step2.title": "আপনি আপনার TIN টাইপ করুন",
  "how.step2.body":
    "আপনি যে ১২-ডিজিট TIN টাইপ করেন তা শুধু আপনার ব্রাউজারের মেমরিতে থাকে। কোনো অটো-সেভ নেই, কোনো ব্যাকগ্রাউন্ড সিঙ্ক নেই, টাইপ করার সময় কোনো API কল নেই। টাইপ করার সময় কিছুই প্রেরণ হয় না।",
  "how.step3.title": "মিল স্থানীয়ভাবে চলে",
  "how.step3.body":
    "যখন আপনি যাচাই করুন বাটন চাপেন, আপনার ডিভাইসে চলমান JavaScript ইতিমধ্যে ডাউনলোড করা তালিকায় আপনার TIN খুঁজে দেখে। আপনার TIN নিয়ে আমাদের সার্ভারে কোনো অনুরোধ পাঠানো হয় না — উত্তরটি সম্পূর্ণরূপে আপনার মেশিনেই গণনা করা হয়।",
  "how.step4.title": "আপনি ফলাফল দেখুন",
  "how.step4.body":
    "পাওয়া গেলেও বা না গেলেও, ফলাফল স্থানীয়ভাবে রেন্ডার হয়। আমরা আপনার TIN, আপনার ফলাফল, IP-টু-TIN সংযোগ, বা আপনাকে শনাক্ত করতে পারে এমন কিছুই দেখি না।",
  "how.flow.title": "ভিজ্যুয়াল: আপনার ডেটা কোথায় যায়",
  "how.flow.note":
    "আপনি নিজেই যাচাই করতে পারেন: ব্রাউজারের DevTools → Network ট্যাব খুলুন, একটি TIN টাইপ করুন এবং যাচাই করুন চাপুন। আপনি দেখবেন কোনো অনুরোধে আপনার TIN নেই।",
  "how.analytics.title": "আমাদের অ্যানালিটিকস সম্পর্কে",
  "how.analytics.body":
    "মানুষ কীভাবে সাইটটি ব্যবহার করে তা বুঝতে (যেমন কতজন ভিজিট, কতগুলো লুকআপ ঘটে), আমরা একটি ছোট, স্ব-হোস্টেড অ্যানালিটিকস ইনস্ট্যান্স চালাই —",
  "how.analytics.notGA": "Google Analytics নয়",
  "how.analytics.notGA2": ", Meta Pixel নয়, কোনো তৃতীয়-পক্ষের ট্র্যাকার নেই।",
  "how.analytics.b1":
    "ব্যক্তিগতভাবে আমার দ্বারা agent-analytics.asif.dev-এ হোস্ট করা — ডেটা কখনো তৃতীয় পক্ষের কাছে যায় না।",
  "how.analytics.b2": "কোনো কুকি নেই। কোনো ফিঙ্গারপ্রিন্টিং নেই। কোনো ক্রস-সাইট ট্র্যাকিং নেই।",
  "how.analytics.b3":
    "কোনো ব্যক্তিগত ডেটা নেই। আমরা কখনো আপনার TIN, নাম, বা কোনো লুকআপের সাথে যুক্ত আপনার IP লগ করি না।",
  "how.analytics.b4":
    "আমরা যা গণনা করি: বেনামী পেজ ভিউ এবং \"যাচাই করুন\" বাটন কতবার চাপা হয়েছে (TIN ছাড়া)।",
  "how.tech.title": "প্রযুক্তি, সংক্ষেপে",
  "how.tech.frontend": "ফ্রন্টএন্ড",
  "how.tech.frontend.v": "React + TanStack Start",
  "how.tech.hosting": "হোস্টিং",
  "how.tech.hosting.v": "এজ CDN (স্ট্যাটিক ফাইল)",
  "how.tech.db": "ডেটাবেস",
  "how.tech.db.v": "আপনার ব্রাউজারে একটি audit.json ফাইল",
  "how.tech.analytics": "অ্যানালিটিকস",
  "how.tech.analytics.v": "স্ব-হোস্টেড, কুকিলেস",
  "how.tech.source": "উৎস ডেটা",
  "how.tech.source.v": "NBR প্রেস রিলিজ (২৮ এপ্রিল ২০২৬)",
  "how.tech.backend": "ব্যাকএন্ড লুকআপ",
  "how.tech.backend.v": "কোনোটিই নয় — ১০০% ক্লায়েন্ট-সাইড",
  "how.backCta": "← TIN চেকারে ফিরে যান",

  // FAQ
  "faq.title": "সচরাচর জিজ্ঞাসিত প্রশ্ন",
  "faq.subtitle":
    "এই টুল কী করতে পারে এবং পারে না — সৎ উত্তর।",
  "faq.tagline": "FAQ",
  "faq.back": "← চেকারে ফিরে যান",
  "faq.limit.title": "গুরুত্বপূর্ণ সীমাবদ্ধতা",
  "faq.limit.body":
    "এই টুল শুধু বলতে পারে কোনো নম্বর প্রকাশিত NBR অডিট তালিকায় আছে কিনা। এটি বলতে পারে না যে নম্বরটি একটি প্রকৃত, বৈধ TIN কিনা। আপনি যদি কোনো এলোমেলো বা অবৈধ ১২-ডিজিট নম্বর দেন, তবুও আপনি \"নির্বাচিত নয়\" দেখবেন — কারণ সেই এলোমেলো নম্বরটি কেবল অডিট তালিকায় নেই। \"নির্বাচিত নয়\" মানে \"এই TIN বৈধ\" নয়।",

  "faq.q1": "এই সাইট আসলে কী করে?",
  "faq.a1":
    "এটি যাচাই করে কোনো ১২-ডিজিট TIN করবর্ষ ২০২৩–২৪-এর জন্য NBR-এর অফিসিয়ালি প্রকাশিত ঝুঁকিভিত্তিক অডিট নির্বাচন তালিকায় আছে কিনা। ব্যাস। লুকআপটি সম্পূর্ণরূপে আপনার ব্রাউজারে চলে।",

  "faq.q2": "যদি আমার TIN \"নির্বাচিত নয়\" দেখায়, তার মানে কি আমার TIN বৈধ?",
  "faq.a2":
    "না। কোনো ১২-ডিজিট নম্বর NBR কর্তৃক ইস্যুকৃত প্রকৃত TIN কিনা তা যাচাই করার কোনো উপায় আমাদের নেই। \"নির্বাচিত নয়\" শুধু বোঝায় নম্বরটি অডিট তালিকায় নেই — এটি নিশ্চিত করে না যে নম্বরটি একটি প্রকৃত TIN। আপনার TIN যাচাই করতে NBR e-Return পোর্টালে লগ ইন করুন বা আপনার ট্যাক্স সার্কেলে যোগাযোগ করুন।",

  "faq.q3": "আইনি বা ট্যাক্স সিদ্ধান্তের জন্য কি ফলাফলের উপর নির্ভর করতে পারি?",
  "faq.a3":
    "ফলাফলকে শুধু তথ্যমূলক হিসেবে নিন। এটি একটি কমিউনিটি-নির্মিত টুল। কোনো সিদ্ধান্ত নেওয়ার আগে সর্বদা NBR বা আপনার ট্যাক্স সার্কেলের সাথে আপনার অডিট স্ট্যাটাস নিশ্চিত করুন।",

  "faq.q4": "ডেটা কোথা থেকে আসে?",
  "faq.a4":
    "দুটি অফিসিয়ালি প্রকাশিত NBR উৎস থেকে: ৪৯-জোন মাস্টার তালিকা (৭২,১৯৬টি এন্ট্রি) এবং ৮-জোন সম্পূরক তালিকা (১৫,৪৮৯টি এন্ট্রি)। মোট: ৮৭,৬৮৫টি রিটার্ন। উৎস: ২৮ এপ্রিল ২০২৬ তারিখের NBR প্রেস রিলিজ।",

  "faq.q5": "আপনারা কি আমার TIN সংরক্ষণ করেন বা কোথাও পাঠান?",
  "faq.a5":
    "না। আপনার TIN কখনো আপনার ব্রাউজার ছেড়ে যায় না। সম্পূর্ণ ডেটাসেট একবার ডাউনলোড হয়, এবং লুকআপ আপনার ডিভাইসে স্থানীয়ভাবে সম্পাদিত হয়। আমরা TIN লগ, সংরক্ষণ বা প্রেরণ করি না। প্রযুক্তিগত বিবরণের জন্য \"কীভাবে কাজ করে\" পেজ দেখুন।",

  "faq.q6": "অ্যানালিটিকস সম্পর্কে কী?",
  "faq.a6":
    "আমরা একটি স্ব-হোস্টেড, কুকিলেস অ্যানালিটিকস ইনস্ট্যান্স চালাই বেনামী পেজ ভিজিট এবং \"যাচাই করুন\" বাটন কতবার চাপা হয়েছে তা গণনা করতে। আমরা কখনো আপনার TIN, নাম, বা কোনো ব্যক্তিগত শনাক্তকারী রেকর্ড করি না। কোনো Google Analytics নেই, কোনো Meta Pixel নেই, কোনো তৃতীয়-পক্ষের ট্র্যাকার নেই।",

  "faq.q7": "আমার TIN কেন তালিকায় আছে?",
  "faq.a7":
    "নির্বাচন NBR একটি স্বয়ংক্রিয় ঝুঁকিভিত্তিক অডিট মাপকাঠি ব্যবহার করে নির্ধারণ করে। কোনো নির্দিষ্ট TIN কেন নির্বাচিত হয়েছে তা আমরা জানি না — এবং বলতে পারি না। স্পষ্টতার জন্য আপনার ট্যাক্স সার্কেলে যোগাযোগ করুন।",

  "faq.q8": "এটি কে এবং কেন তৈরি করেছে?",
  "faq.a8":
    "এম আসিফ রহমান কর্তৃক একটি কমিউনিটি সেবা হিসেবে তৈরি, যাতে প্রকাশ্যে প্রকাশিত NBR তথ্য সহজে অনুসন্ধান করা যায়। এই টুল অনানুষ্ঠানিক এবং NBR বা কোনো সরকারি সংস্থার সাথে যুক্ত নয়।",

  "faq.contact":
    "এখনো প্রশ্ন আছে? GitHub-এ যোগাযোগ করুন বা অফিসিয়াল কিছুর জন্য সরাসরি NBR-এর সাথে যোগাযোগ করুন।",
};

const dictionaries: Record<Lang, Dict> = { en, bn };

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  n: (value: number) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage on the client (SSR-safe).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "bn") setLangState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo<I18nCtx>(() => {
    const dict = dictionaries[lang];
    return {
      lang,
      setLang,
      t: (key, vars) => {
        let s = dict[key] ?? en[key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            const formatted =
              typeof v === "number" ? fmtNumber(v, lang) : String(v);
            s = s.replaceAll(`{${k}}`, formatted);
          }
        }
        return s;
      },
      n: (value) => fmtNumber(value, lang),
    };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback if a component renders outside the provider (shouldn't happen).
    return {
      lang: "en",
      setLang: () => {},
      t: (key) => en[key] ?? key,
      n: (v) => fmtNumber(v, "en"),
    };
  }
  return ctx;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("header.langLabel")}
      className={`inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "en"
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("bn")}
        aria-pressed={lang === "bn"}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "bn"
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}