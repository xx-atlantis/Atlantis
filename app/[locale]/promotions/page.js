"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import {
  Tag, Calendar, Copy, Check, ArrowRight, Star,
  XCircle, Medal, ChevronDown, ChevronUp,
  AlertTriangle, Zap, Clock, TrendingUp, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── default content ─────────────────────────────────────────────── */
const DEFAULT_EN = {
  hero: {
    tagLabel: "Limited Time Offer",
    titleMain: "Transform Your Space",
    titleHighlight: "Without Breaking the Bank",
    subtitle: "Premium interior design packages at exclusive promotional rates — crafted by Atlantis's expert team for homes and businesses across the GCC.",
    valueBadge: "Save up to 40% on select packages",
    ctaPrimary: "View Current Offers",
    finePrint: "* Limited spots available. No credit card required for consultation.",
  },
  stats: [
    { value: "500+", label: "Projects Completed" },
    { value: "9+",   label: "Years of Experience" },
    { value: "100%", label: "Satisfaction Rate" },
    { value: "48h",  label: "Delivery Turnaround" },
  ],
  painSection: {
    tag: "Sound familiar?",
    title: "Are You Experiencing This?",
    subtitle: "Most homeowners and business owners face these challenges — but they don't have to.",
    bottomText: "Atlantis solves every one of these — guaranteed.",
    points: [
      "Overwhelmed by too many design choices with no clear direction?",
      "Received a quote that was way over your budget?",
      "Project took months longer than promised?",
      "Design didn't match what you envisioned in the beginning?",
      "Contractors who disappear mid-project or lack professionalism?",
      "No single point of contact — juggling suppliers, workers, and ideas?",
    ],
  },
  offerCard: {
    tag: "The Consulting Package",
    title: "Everything You Need in One Step",
    subtitle: "A complete package designed to save you time and money from day one.",
    price: "199",
    currency: "SAR",
    priceNote: "Instead of 1,200+ SAR — Save over 1,000 SAR",
    features: [
      { emoji: "💬", title: "60-Min Design Consultation", desc: "With Atlantis's certified designer — space analysis, design vision, material & color recommendations, full written summary.", badge: "Core Element", badgeType: "core", originalPrice: "200 SAR", includedLabel: "Included" },
      { emoji: "📐", title: "Furniture Layout Plan", desc: "A furniture layout plan for one area (living room, kitchen, bedroom, or any open space) — ready to send to your supplier directly.", badge: "Free Gift 🎁", badgeType: "free", originalPrice: "400 SAR", includedLabel: "Free" },
      { emoji: "🎨", title: "Design Mood Board", desc: "One mood board for your area — colors, materials, suggested furniture, and lighting. Extra rooms available at additional cost.", badge: "Free Gift 🎁", badgeType: "free", originalPrice: "600 SAR", includedLabel: "Free" },
    ],
    totalLabel: "Total Value",
    totalValue: "1,200 SAR",
    payLabel: "Pay Today Only",
    savingsNote: "You save: 1,001 SAR — over 83% real discount",
    conditionsTitle: "Package Conditions — Please Read Before Booking",
    conditions: [
      "This package is designed for one area only — living room, kitchen, bedroom, or any open space. Multi-room projects require a dedicated package.",
      "Architectural plans must be available before the session. If unavailable, a space measurement service can be arranged at an additional cost.",
      "Additional mood boards for extra rooms are available at 150 SAR each — requested after the session.",
    ],
    deductionTitle: "Bonus — Consultation Fee Deducted from Full Design",
    deductionText: "If you decide to proceed with Atlantis for 3D design and full execution, the 199 SAR is fully deducted from the project price — meaning the consultation is essentially free if you continue.",
    valueStack: {
      title: "Package Value Summary",
      subtitle: "Pay 199 instead of 1,200",
      rows: [
        { name: "Design Consultation (60 min)", originalPrice: "200 SAR", label: "", status: "included" },
        { name: "Furniture Layout Plan", originalPrice: "400 SAR", label: "", status: "included" },
        { name: "Design Mood Board", originalPrice: "600 SAR", label: "", status: "included" },
        { name: "Consultation deducted from full project", originalPrice: "", label: "Deducted ✓", status: "bonus" },
        { name: "Pay Now", originalPrice: "199 SAR", label: "", status: "pay" },
      ],
    },
    ctaButton: "Book Now — 199 SAR",
    ctaNote: "All GCC countries · Online sessions · Limited spots",
  },
  howSection: {
    tag: "Simple Process",
    title: "How It Works",
    steps: [
      { number: "01", title: "Book a Free Consultation", desc: "Speak with our design experts about your space, style, and budget. No commitment required." },
      { number: "02", title: "Get a Tailored Design Plan", desc: "We craft a detailed interior design proposal — mood boards, layouts, materials — tuned to your vision." },
      { number: "03", title: "Watch Your Space Transform", desc: "Our team handles every detail of execution — from sourcing to installation — while you relax." },
    ],
  },
  audienceSection: {
    tag: "Made For You",
    title: "Who Is This For?",
    items: [
      { emoji: "🏠", title: "Homeowners", desc: "Turn your house into a beautiful, functional home — within budget and on schedule." },
      { emoji: "🏢", title: "Business Owners", desc: "Create a workspace or retail environment that reflects your brand and impresses clients." },
      { emoji: "🏗️", title: "Developers & Investors", desc: "Increase property value with professionally designed interiors that sell or rent faster." },
      { emoji: "🎁", title: "Gift Givers", desc: "Give the most memorable gift — a design consultation package for someone you love." },
    ],
  },
  testimonialSection: {
    tag: "Client Stories",
    title: "What Our Clients Say",
    items: [
      { quote: "Atlantis delivered exactly what they promised — on time and within budget. The result was beyond our expectations.", author: "Ahmed Al-Rashidi", role: "Villa Owner, Riyadh", stars: 5 },
      { quote: "I was nervous about starting a renovation but the team made it so smooth. Highly recommend the consultation package.", author: "Noura Al-Hamdan", role: "Apartment Owner, Jeddah", stars: 5 },
      { quote: "Professional, creative, and communicative throughout the whole project. My office looks stunning now.", author: "Khalid Al-Mutairi", role: "Business Owner, Kuwait", stars: 5 },
      { quote: "Finally a design company that listens! They transformed our living room in less than a month. Worth every riyal.", author: "Sara Al-Zahrani", role: "Homeowner, Dammam", stars: 5 },
    ],
  },
  urgencySection: {
    title: "Why Act Now?",
    points: [
      "Offer valid for a limited number of clients only — first come, first served.",
      "Prices may increase as material and labour costs rise in the region.",
      "Securing your spot now locks in today's promotional rate.",
      "Design consultations are booked weeks in advance — don't wait until it's too late.",
    ],
  },
  guaranteeSection: {
    title: "Our Guarantee",
    text: "If the final design doesn't match what was agreed upon, we revise it at no extra cost. Your satisfaction is our only measure of success — we don't consider a project complete until you love the result.",
  },
  faqSection: {
    tag: "FAQ",
    title: "Frequently Asked Questions",
    items: [
      { q: "How long does a typical interior design project take?", a: "Timelines vary by scope. A single room can be completed in 2–4 weeks; full apartment or villa projects typically take 6–12 weeks. We give you a detailed schedule before we start." },
      { q: "Do I need to have a minimum budget?", a: "We work with a range of budgets and tailor our approach accordingly. The free consultation helps us understand what's achievable within your means." },
      { q: "Can I keep my existing furniture?", a: "Absolutely. Our designers work around what you already have, incorporating your existing pieces into the new design wherever possible." },
      { q: "What does the promotional package include exactly?", a: "Each offer specifies what's included — typically: initial consultation, concept design, 3D visualization, materials sourcing, and on-site supervision. Check each promotion card for full details." },
      { q: "Is there a satisfaction guarantee?", a: "Yes. We offer a revision guarantee — if the final result doesn't match the agreed design, we fix it at no additional cost." },
    ],
  },
  finalCta: {
    badge: "Limited-time promotional rate",
    title: "Ready to Transform Your Space?",
    subtitle: "Join hundreds of satisfied clients across the GCC. Claim your promotional package today before spots run out.",
    primaryBtn: "View Offers",
    finePrint: "* No commitment required for the free consultation.",
  },
};

const DEFAULT_AR = {
  hero: {
    tagLabel: "عرض لفترة محدودة",
    titleMain: "حوّل مساحتك",
    titleHighlight: "دون إنهاك ميزانيتك",
    subtitle: "حزم تصميم داخلي فاخرة بأسعار ترويجية حصرية — يصممها فريق أتلانتس المتخصص للمنازل والأعمال في دول الخليج.",
    valueBadge: "وفر حتى ٤٠٪ على حزم مختارة",
    ctaPrimary: "اعرض العروض الحالية",
    finePrint: "* أماكن محدودة. لا تحتاج إلى بطاقة ائتمان للاستشارة.",
  },
  stats: [
    { value: "٥٠٠+", label: "مشروع مكتمل" },
    { value: "٩+",   label: "سنوات خبرة" },
    { value: "١٠٠٪", label: "نسبة رضا العملاء" },
    { value: "٤٨س",  label: "وقت التسليم" },
  ],
  painSection: {
    tag: "هل هذا مألوف؟",
    title: "هل تعاني من هذه المشكلات؟",
    subtitle: "يواجه معظم أصحاب المنازل والأعمال هذه التحديات — لكن لا يجب أن يستمر الأمر هكذا.",
    bottomText: "أتلانتس يحل كل هذه المشكلات — مع ضمان.",
    points: [
      "تشعر بالإرباك من كثرة خيارات التصميم دون توجيه واضح؟",
      "تلقيت عرض سعر يتجاوز ميزانيتك بكثير؟",
      "استغرق المشروع أشهراً أطول مما وُعدت به؟",
      "التصميم لم يطابق ما تخيلته في البداية؟",
      "متعاقدون يختفون في منتصف المشروع أو يفتقرون للاحترافية؟",
      "لا يوجد مسؤول واحد — تتعامل مع موردين وعمال وأفكار متشعبة؟",
    ],
  },
  offerCard: {
    tag: "الباقة الاستشارية",
    title: "كل ما تحتاجه في خطوة واحدة",
    subtitle: "باقة متكاملة توفر عليك الوقت والمال منذ اليوم الأول.",
    price: "١٩٩",
    currency: "SAR",
    priceNote: "بدلاً من ١,٢٠٠+ ريال — وفر أكثر من ١,٠٠٠ ريال",
    features: [
      { emoji: "💬", title: "جلسة استشارية تصميمية ٦٠ دقيقة", desc: "مع مصمم أتلانتس المعتمد — تحليل المساحة، الرؤية التصميمية، توصيات المواد والألوان، وملخص مكتوب كامل.", badge: "المكون الأساسي", badgeType: "core", originalPrice: "٢٠٠ SAR", includedLabel: "مشمول" },
      { emoji: "📐", title: "مخطط توزيع الأثاث", desc: "مخطط توزيع الأثاث لمنطقة واحدة (غرفة معيشة، مطبخ، غرفة نوم، أو أي فضاء مفتوح) — جاهز للتسليم للمورد مباشرة.", badge: "مجاناً — هدية حقيقية 🎁", badgeType: "free", originalPrice: "٤٠٠ SAR", includedLabel: "مجاناً" },
      { emoji: "🎨", title: "لوح بورد تصميمي كامل", desc: "لوح بورد واحد لمنطقتك — الألوان، المواد، الأثاث المقترح، والإضاءة. لوح إضافي لغرفة أخرى متاح بسعر إضافي.", badge: "مجاناً — هدية حقيقية 🎁", badgeType: "free", originalPrice: "٦٠٠ SAR", includedLabel: "مجاناً" },
    ],
    totalLabel: "القيمة الإجمالية",
    totalValue: "١,٢٠٠ SAR",
    payLabel: "تدفع اليوم فقط",
    savingsNote: "وفرت: ١,٠٠١ ريال — أكثر من ٨٣٪ خصم حقيقي",
    conditionsTitle: "شروط الباقة — يرجى القراءة قبل الحجز",
    conditions: [
      "الباقة مصممة لمنطقة واحدة فقط — غرفة معيشة، مطبخ، غرفة نوم، أو أي فضاء مفتوح. المشاريع الكبيرة تحتاج باقة مخصصة.",
      "يُشترط توفر المخطط المعماري قبل موعد الجلسة. إذا لم يكن متوفراً، يمكن إضافة خدمة رفع المساحة بتكاليف إضافية.",
      "لوح بورد إضافي لغرفة أخرى متاح بـ ١٥٠ ريال / لوح بورد — يطلب بعد الجلسة.",
    ],
    deductionTitle: "ميزة إضافية — قيمة الاستشارة تُخصم من التصميم الكامل",
    deductionText: "إذا قررت الاستمرار مع أتلانتس حتى التصميم ثلاثي الأبعاد والتنفيذ، يتم خصم الـ ١٩٩ ريال كاملةً من سعر المشروع — يعني الاستشارة مجانية إذا اخترت الاستمرار.",
    valueStack: {
      title: "ملخص قيمة الباقة",
      subtitle: "تدفع ١٩٩ بدل ١,٢٠٠",
      rows: [
        { name: "جلسة استشارية (٦٠ دقيقة)", originalPrice: "٢٠٠ SAR", label: "", status: "included" },
        { name: "مخطط توزيع الأثاث", originalPrice: "٤٠٠ SAR", label: "", status: "included" },
        { name: "لوح بورد تصميمي", originalPrice: "٦٠٠ SAR", label: "", status: "included" },
        { name: "خصم الاستشارة عند الاستمرار للتنفيذ", originalPrice: "", label: "مخصومة ✓", status: "bonus" },
        { name: "تدفع الآن", originalPrice: "١٩٩ SAR", label: "", status: "pay" },
      ],
    },
    ctaButton: "احجز الآن — ١٩٩ ريال",
    ctaNote: "جميع دول الخليج · جلسات أونلاين · الأماكن محدودة",
  },
  howSection: {
    tag: "عملية بسيطة",
    title: "كيف يعمل",
    steps: [
      { number: "01", title: "احجز استشارة مجانية", desc: "تحدث مع خبراء التصميم لدينا عن مساحتك وذوقك وميزانيتك. لا يلزمك أي التزام." },
      { number: "02", title: "احصل على خطة تصميم مخصصة", desc: "نُعدّ مقترح تصميم داخلي مفصّل يشمل لوحات المزاج والتخطيطات والمواد بما يتناسب مع رؤيتك." },
      { number: "03", title: "شاهد مساحتك تتحوّل", desc: "فريقنا يتولى كل تفاصيل التنفيذ — من التوريد حتى التركيب — وأنت مرتاح." },
    ],
  },
  audienceSection: {
    tag: "مصنوع لك",
    title: "لمن هذا؟",
    items: [
      { emoji: "🏠", title: "أصحاب المنازل", desc: "حوّل منزلك إلى بيت جميل وعملي — ضمن الميزانية وفي الموعد." },
      { emoji: "🏢", title: "أصحاب الأعمال", desc: "أنشئ بيئة عمل أو مساحة تجارية تعكس علامتك التجارية وتُبهر عملاءك." },
      { emoji: "🏗️", title: "المطورون والمستثمرون", desc: "ارفع قيمة العقار بتصاميم داخلية احترافية تُباع أو تُؤجَّر بشكل أسرع." },
      { emoji: "🎁", title: "مقدمو الهدايا", desc: "قدّم الهدية الأكثر تأثيراً — حزمة استشارة تصميم لشخص تهتم به." },
    ],
  },
  testimonialSection: {
    tag: "قصص العملاء",
    title: "ماذا يقول عملاؤنا",
    items: [
      { quote: "أتلانتس قدّم بالضبط ما وعد به — في الموعد وضمن الميزانية. النتيجة فاقت توقعاتنا.", author: "Ahmed Al-Rashidi", role: "مالك فيلا، الرياض", stars: 5 },
      { quote: "كنت قلقاً من البدء بالتجديد لكن الفريق جعله سهلاً جداً. أوصي بشدة بحزمة الاستشارة.", author: "Noura Al-Hamdan", role: "مالكة شقة، جدة", stars: 5 },
      { quote: "محترفون ومبدعون وتواصلوا معي طوال المشروع. مكتبي يبدو رائعاً الآن.", author: "Khalid Al-Mutairi", role: "صاحب عمل، الكويت", stars: 5 },
      { quote: "أخيراً شركة تصميم تستمع! حوّلت غرفة معيشتنا في أقل من شهر. تستحق كل ريال.", author: "Sara Al-Zahrani", role: "ربة منزل، الدمام", stars: 5 },
    ],
  },
  urgencySection: {
    title: "لماذا تتصرف الآن؟",
    points: [
      "العرض متاح لعدد محدود من العملاء فقط — الأول يُخدَّم أولاً.",
      "قد ترتفع الأسعار مع زيادة تكاليف المواد والعمالة في المنطقة.",
      "حجز مكانك الآن يضمن لك سعر العرض الحالي.",
      "الاستشارات تُحجز أسابيع مقدماً — لا تنتظر حتى فوات الأوان.",
    ],
  },
  guaranteeSection: {
    title: "ضماننا",
    text: "إذا لم يتطابق التصميم النهائي مع ما تم الاتفاق عليه، نراجعه دون أي تكلفة إضافية. رضاك هو مقياسنا الوحيد للنجاح — لا نعتبر المشروع مكتملاً حتى تُحب النتيجة.",
  },
  faqSection: {
    tag: "الأسئلة الشائعة",
    title: "الأسئلة المتكررة",
    items: [
      { q: "كم يستغرق مشروع التصميم الداخلي النموذجي؟", a: "تختلف المدة حسب النطاق. يمكن إنجاز غرفة واحدة في أسبوعين إلى أربعة؛ وتستغرق مشاريع الشقق أو الفلل الكاملة عادةً من 6 إلى 12 أسبوعاً. نقدم جدولاً تفصيلياً قبل البدء." },
      { q: "هل أحتاج إلى حد أدنى للميزانية؟", a: "نتعامل مع مجموعة متنوعة من الميزانيات ونكيّف أسلوبنا وفقاً لذلك. الاستشارة المجانية تساعدنا على فهم ما يمكن تحقيقه ضمن إمكانياتك." },
      { q: "هل يمكنني الاحتفاظ بأثاثي الحالي؟", a: "بالتأكيد. يعمل مصممونا حول ما لديك بالفعل، ويدمجون قطعك الحالية في التصميم الجديد حيثما أمكن ذلك." },
      { q: "ماذا تشمل الحزمة الترويجية بالضبط؟", a: "تحدد كل عرض ما يتضمنه — وعادةً يشمل: الاستشارة الأولية، تصميم المفهوم، التخيل ثلاثي الأبعاد، توريد المواد، والإشراف الميداني. راجع كل بطاقة عرض للاطلاع على التفاصيل الكاملة." },
      { q: "هل يوجد ضمان الرضا؟", a: "نعم. نقدم ضمان المراجعة — إذا لم تطابق النتيجة النهائية التصميم المتفق عليه، نصلحها دون أي تكاليف إضافية." },
    ],
  },
  finalCta: {
    badge: "سعر ترويجي لفترة محدودة",
    title: "مستعد لتحويل مساحتك؟",
    subtitle: "انضم إلى مئات العملاء الراضين في دول الخليج. احصل على حزمتك الترويجية اليوم قبل نفاد الأماكن.",
    primaryBtn: "اعرض العروض",
    finePrint: "* الاستشارة المجانية لا تلزمك بأي شيء.",
  },
};

/* ─── helpers ─────────────────────────────────────────────────────── */
function CouponBadge({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-2 border-2 border-dashed border-[#2D3247]/40 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold text-[#2D3247] hover:border-[#2D3247] hover:bg-[#2D3247]/5 transition"
    >
      <Tag size={13} />{code}
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="opacity-50" />}
    </button>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-start bg-white hover:bg-[#F5F3EF] transition">
        <span className="font-semibold text-gray-900 text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp size={18} className="text-[#2D3247] shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-6 pb-5 bg-white"><p className="text-gray-500 text-sm leading-relaxed">{a}</p></div>}
    </div>
  );
}

/* ─── main ────────────────────────────────────────────────────────── */
export default function PromotionsPage() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [promotions, setPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [content, setContent] = useState({ en: DEFAULT_EN, ar: DEFAULT_AR });
  const offerRef = useRef(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(({ data }) => setPromotions(data || []))
      .catch(() => {})
      .finally(() => setLoadingPromos(false));

    fetch("/api/admin/promo-content")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return;
        setContent({
          en: data.en && Object.keys(data.en).length > 0 ? { ...DEFAULT_EN, ...data.en } : DEFAULT_EN,
          ar: data.ar && Object.keys(data.ar).length > 0 ? { ...DEFAULT_AR, ...data.ar } : DEFAULT_AR,
        });
      })
      .catch(() => {});
  }, []);

  const c = isRTL ? content.ar : content.en;
  const scrollToOffer = () => offerRef.current?.scrollIntoView({ behavior: "smooth" });
  const ctaAction = (link) => link ? { href: link } : { onClick: scrollToOffer };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white">

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="bg-[#2D3247] text-white px-4 sm:px-8 md:px-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block text-xs uppercase tracking-widest font-semibold text-white/60 border border-white/20 rounded-full px-4 py-1.5">
            {c.hero.tagLabel}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {c.hero.titleMain}{" "}
            <span className="text-[#C9A96E]">{c.hero.titleHighlight}</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {c.hero.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
            <TrendingUp size={16} className="text-[#C9A96E]" />
            <span className="text-sm font-semibold">{c.hero.valueBadge}</span>
          </div>
          <div className="pt-2">
            {c.hero.ctaLink ? (
              <Link
                href={c.hero.ctaLink}
                className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-10 py-4 rounded-xl transition text-base"
              >
                {c.hero.ctaPrimary}
                <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
              </Link>
            ) : (
              <button
                onClick={scrollToOffer}
                className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-10 py-4 rounded-xl transition text-base"
              >
                {c.hero.ctaPrimary}
                <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
              </button>
            )}
          </div>
          <p className="text-white/40 text-xs">{c.hero.finePrint}</p>
        </div>
      </section>

      {/* ── 2. STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EF] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {(c.stats || []).map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl font-bold text-[#2D3247]">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. PAIN POINTS ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">{c.painSection.tag}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{c.painSection.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">{c.painSection.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(c.painSection.points || []).map((pt, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-gray-700 text-sm leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-[#2D3247] font-semibold">{c.painSection.bottomText}</p>
      </section>

      {/* ── 4. OFFER CARD ────────────────────────────────────────────── */}
      <section ref={offerRef} className="bg-[#2D3247] py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <span className="inline-block text-xs uppercase tracking-widest font-semibold text-[#C9A96E] border border-[#C9A96E]/40 rounded-full px-4 py-1.5">
              {c.offerCard.tag}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{c.offerCard.title}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{c.offerCard.subtitle}</p>
          </div>

          {/* Price header */}
          <div className="bg-[#C9A96E] rounded-t-2xl px-8 py-7 text-center">
            <p className="text-[#2D3247] text-xs font-bold uppercase tracking-widest mb-3 opacity-70">
              {c.offerCard.tag}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[#2D3247] text-xl font-semibold">{c.offerCard.currency}</span>
              <span className="text-[#2D3247] font-bold" style={{ fontSize: "72px", lineHeight: 1 }}>{c.offerCard.price}</span>
            </div>
            <p className="text-[#2D3247]/70 text-xs font-medium mt-2">{c.offerCard.priceNote}</p>
          </div>

          {/* Features list */}
          <div className="bg-white rounded-b-2xl p-6 mb-4 space-y-1">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
              {isRTL ? "ما يشمله السعر" : "What's Included"}
            </p>
            {(c.offerCard.features || []).map((feat, i) => (
              <div key={i} className={`flex items-start gap-4 py-4 ${i < (c.offerCard.features.length - 1) ? "border-b border-gray-100" : ""}`}>
                <div className="w-11 h-11 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-xl shrink-0">
                  {feat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{feat.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{feat.desc}</p>
                  <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-md ${
                    feat.badgeType === "free"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-[#C9A96E]/15 text-[#b8955c] border border-[#C9A96E]/40"
                  }`}>{feat.badge}</span>
                </div>
                <div className="text-end shrink-0 min-w-[76px]">
                  {feat.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">{feat.originalPrice}</p>
                  )}
                  <p className={`text-sm font-bold ${feat.badgeType === "free" ? "text-green-600" : "text-[#C9A96E]"}`}>
                    {feat.includedLabel}
                  </p>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="bg-[#F5F3EF] rounded-xl p-4 mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{c.offerCard.totalLabel}</span>
                <span className="text-sm text-gray-400 line-through">{c.offerCard.totalValue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#2D3247] text-sm">{c.offerCard.payLabel}</span>
                <span className="font-bold text-[#2D3247] text-lg">{c.offerCard.currency} {c.offerCard.price}</span>
              </div>
              <p className="text-xs text-gray-400">{c.offerCard.savingsNote}</p>
            </div>
          </div>

          {/* Conditions */}
          {(c.offerCard.conditions || []).length > 0 && (
            <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-2xl p-5 mb-4">
              <h4 className="text-xs font-bold text-[#C9A96E] uppercase tracking-widest mb-4">
                {c.offerCard.conditionsTitle}
              </h4>
              <ul className="space-y-3">
                {c.offerCard.conditions.map((cond, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                    <span className="text-[#C9A96E] font-bold shrink-0 mt-0.5">◆</span>
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deduction box */}
          {c.offerCard.deductionTitle && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-5 flex gap-4 mb-4">
              <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-400 text-sm mb-1">{c.offerCard.deductionTitle}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{c.offerCard.deductionText}</p>
              </div>
            </div>
          )}

          {/* Value stack */}
          {(c.offerCard.valueStack?.rows || []).length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden mb-8">
              <div className="bg-[#2D3247] border border-[#C9A96E]/30 px-5 py-3 flex justify-between">
                <span className="text-sm font-bold text-white/80">{c.offerCard.valueStack.title}</span>
                <span className="text-sm font-bold text-[#C9A96E]">{c.offerCard.valueStack.subtitle}</span>
              </div>
              {c.offerCard.valueStack.rows.map((row, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center px-5 py-3 border-b border-gray-100 last:border-0 ${row.status === "pay" ? "bg-[#F5F3EF]" : ""}`}
                >
                  <span className={`text-sm ${row.status === "pay" ? "font-bold text-[#2D3247]" : "text-gray-700"}`}>
                    {row.name}
                  </span>
                  <span className={`text-sm font-semibold ${
                    row.status === "bonus" ? "text-green-600" :
                    row.status === "pay"   ? "text-[#C9A96E] font-bold" :
                    "text-gray-400 line-through"
                  }`}>
                    {row.status === "bonus" ? row.label : row.originalPrice}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA — same style as hero */}
          <div className="text-center space-y-3">
            {c.offerCard.ctaLink ? (
              <Link
                href={c.offerCard.ctaLink}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-bold px-10 py-4 rounded-xl transition text-base"
              >
                {c.offerCard.ctaButton}
              </Link>
            ) : (
              <button
                onClick={scrollToOffer}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-bold px-10 py-4 rounded-xl transition text-base"
              >
                {c.offerCard.ctaButton}
              </button>
            )}
            <p className="text-white/40 text-xs">{c.offerCard.ctaNote}</p>
          </div>
        </div>
      </section>

      {/* ── 5. CURRENT OFFERS from DB (single wide centered) ─────────── */}
      {(loadingPromos || promotions.length > 0) && (
        <section className="bg-[#F5F3EF] py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10">
            <div className="text-center mb-10 space-y-3">
              <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
                {isRTL ? "الحزم الترويجية" : "Promotional Packages"}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {isRTL ? "العروض الحالية" : "Current Offers"}
              </h2>
            </div>

            {loadingPromos ? (
              <div className="max-w-2xl mx-auto rounded-2xl bg-gray-200 animate-pulse h-80" />
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {promotions.map((promo) => {
                  const title   = isRTL ? promo.titleAr : promo.titleEn;
                  const desc    = isRTL ? promo.descAr  : promo.descEn;
                  const badge   = isRTL ? promo.badgeAr : promo.badgeEn;
                  const expired = promo.validUntil && new Date(promo.validUntil) < new Date();

                  return (
                    <div key={promo.id} className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${expired ? "opacity-60" : ""}`}>
                      {promo.image && (
                        <div className="relative aspect-[21/9] bg-[#F5F3EF] overflow-hidden">
                          <Image src={promo.image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          {badge && (
                            <span className="absolute top-4 start-4 bg-[#2D3247] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow">{badge}</span>
                          )}
                          {expired && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-full">{isRTL ? "منتهي" : "Expired"}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        {!promo.image && badge && (
                          <span className="inline-block bg-[#2D3247] text-white text-sm font-bold px-4 py-1.5 rounded-full">{badge}</span>
                        )}
                        <h3 className="font-bold text-gray-900 text-xl leading-snug">{title}</h3>
                        {desc && <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>}
                        <div className="flex flex-wrap items-center gap-4">
                          {promo.couponCode && !expired && <CouponBadge code={promo.couponCode} />}
                          {promo.validUntil && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={12} />
                              {isRTL ? "صالح حتى" : "Valid until"}{" "}
                              {new Date(promo.validUntil).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        {promo.link && !expired && (
                          <Link href={promo.link} className="inline-flex items-center gap-2 bg-[#2D3247] hover:bg-[#1e2231] text-white text-sm font-semibold px-6 py-3 rounded-xl transition">
                            {isRTL ? (promo.ctaTextAr || "احصل على العرض") : (promo.ctaTextEn || "Claim Offer")}
                            <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 6. HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">{c.howSection.tag}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{c.howSection.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(c.howSection.steps || []).map((step, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2D3247] text-white flex items-center justify-center font-bold text-lg mx-auto">{step.number}</div>
              <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. WHO IS IT FOR ─────────────────────────────────────────── */}
      <section className="bg-[#F5F3EF] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">{c.audienceSection.tag}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{c.audienceSection.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(c.audienceSection.items || []).map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center space-y-3">
                <div className="text-4xl">{item.emoji}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">{c.testimonialSection.tag}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{c.testimonialSection.title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(c.testimonialSection.items || []).map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex gap-0.5">
                {[...Array(item.stars || 5)].map((_, s) => (
                  <Star key={s} size={14} className="fill-[#C9A96E] text-[#C9A96E]" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic">"{item.quote}"</p>
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.author}</p>
                <p className="text-gray-400 text-xs">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. URGENCY BOX ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 pb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex gap-4">
          <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-bold text-amber-900 text-base">{c.urgencySection.title}</h3>
            <ul className="space-y-2">
              {(c.urgencySection.points || []).map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <Zap size={14} className="shrink-0 mt-0.5 text-amber-500" />{pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 10. GUARANTEE BOX ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-8">
        <div className="bg-[#2D3247] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-5 text-white text-center sm:text-start">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Medal size={28} className="text-[#C9A96E]" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{c.guaranteeSection.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl">{c.guaranteeSection.text}</p>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ──────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">{c.faqSection.tag}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{c.faqSection.title}</h2>
        </div>
        <div className="space-y-3">
          {(c.faqSection.items || []).map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── 12. FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-[#2D3247] text-white py-16 md:py-20 px-4 sm:px-8 md:px-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2">
            <Clock size={14} className="text-[#C9A96E]" />
            <span className="text-sm font-semibold text-white/80">{c.finalCta.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">{c.finalCta.title}</h2>
          <p className="text-white/70 max-w-xl mx-auto text-base">{c.finalCta.subtitle}</p>
          <div className="pt-2">
            {c.finalCta.ctaLink ? (
              <Link
                href={c.finalCta.ctaLink}
                className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-10 py-4 rounded-xl transition text-base"
              >
                {c.finalCta.primaryBtn}
                <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
              </Link>
            ) : (
              <button
                onClick={scrollToOffer}
                className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-10 py-4 rounded-xl transition text-base"
              >
                {c.finalCta.primaryBtn}
                <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
              </button>
            )}
          </div>
          <p className="text-white/40 text-xs">{c.finalCta.finePrint}</p>
        </div>
      </section>

    </div>
  );
}
