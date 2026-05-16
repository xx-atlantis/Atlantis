"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── defaults ────────────────────────────────────────────────────── */
const DEFAULT_EN = {
  hero: {
    tagLabel: "Limited Time Offer",
    titleMain: "Transform Your Space",
    titleHighlight: "Without Breaking the Bank",
    subtitle: "Premium interior design packages at exclusive promotional rates — crafted by Atlantis's expert team for homes and businesses across the GCC.",
    valueBadge: "Save up to 40% on select packages",
    ctaPrimary: "View Current Offers",
    ctaLink: "",
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
    ctaLink: "",
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
    ctaLink: "",
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
    ctaLink: "",
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
    ctaLink: "",
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
    ctaLink: "",
    finePrint: "* الاستشارة المجانية لا تلزمك بأي شيء.",
  },
};

/* ─── shared UI helpers ───────────────────────────────────────────── */
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

function Field({ label, value, onChange, type = "text", dir = "ltr", rows = 3 }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {type === "textarea" ? (
        <textarea dir={dir} value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} className={inputCls} />
      ) : (
        <input dir={dir} type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      {title && <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">{title}</h2>}
      {children}
    </div>
  );
}

function BiRow({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

const TABS = [
  { id: "hero",        label: "Hero" },
  { id: "stats",       label: "Stats" },
  { id: "pain",        label: "Pain Points" },
  { id: "offer-card",  label: "Offer Card" },
  { id: "how",         label: "How It Works" },
  { id: "audience",    label: "Who It's For" },
  { id: "testimonials",label: "Testimonials" },
  { id: "urgency",     label: "Urgency & Guarantee" },
  { id: "faq",         label: "FAQ" },
  { id: "cta",         label: "Final CTA" },
];

/* ─── main ────────────────────────────────────────────────────────── */
export default function PromoContentAdmin() {
  const [en, setEn] = useState(DEFAULT_EN);
  const [ar, setAr] = useState(DEFAULT_AR);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetch("/api/admin/promo-content")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.en && Object.keys(data.en).length > 0) setEn({ ...DEFAULT_EN, ...data.en });
        if (data?.ar && Object.keys(data.ar).length > 0) setAr({ ...DEFAULT_AR, ...data.ar });
      })
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ en, ar }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      toast.success("Saved!");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── generic list helpers ─────────────────────────────────────── */
  const updList = (locale, section, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, [section]: { ...p[section], items: p[section].items.map((it, i) => i === idx ? { ...it, [field]: val } : it) } }));
  };
  const addListItem = (section, blankEn, blankAr) => {
    setEn((p) => ({ ...p, [section]: { ...p[section], items: [...p[section].items, { ...blankEn }] } }));
    setAr((p) => ({ ...p, [section]: { ...p[section], items: [...p[section].items, { ...blankAr }] } }));
  };
  const removeListItem = (section, idx) => {
    setEn((p) => ({ ...p, [section]: { ...p[section], items: p[section].items.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, [section]: { ...p[section], items: p[section].items.filter((_, i) => i !== idx) } }));
  };

  /* ── pain helpers ─────────────────────────────────────────────── */
  const setPainPoint = (locale, idx, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, painSection: { ...p.painSection, points: p.painSection.points.map((pt, i) => i === idx ? val : pt) } }));
  };
  const addPain = () => {
    setEn((p) => ({ ...p, painSection: { ...p.painSection, points: [...p.painSection.points, ""] } }));
    setAr((p) => ({ ...p, painSection: { ...p.painSection, points: [...p.painSection.points, ""] } }));
  };
  const removePain = (idx) => {
    setEn((p) => ({ ...p, painSection: { ...p.painSection, points: p.painSection.points.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, painSection: { ...p.painSection, points: p.painSection.points.filter((_, i) => i !== idx) } }));
  };

  /* ── offer card helpers ───────────────────────────────────────── */
  const setOC = (locale, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, offerCard: { ...p.offerCard, [field]: val } }));
  };
  const setOCFeature = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, offerCard: { ...p.offerCard, features: p.offerCard.features.map((f, i) => i === idx ? { ...f, [field]: val } : f) } }));
  };
  const addFeature = () => {
    const blank = { emoji: "⭐", title: "", desc: "", badge: "", badgeType: "core", originalPrice: "", includedLabel: "" };
    setEn((p) => ({ ...p, offerCard: { ...p.offerCard, features: [...p.offerCard.features, { ...blank }] } }));
    setAr((p) => ({ ...p, offerCard: { ...p.offerCard, features: [...p.offerCard.features, { ...blank }] } }));
  };
  const removeFeature = (idx) => {
    setEn((p) => ({ ...p, offerCard: { ...p.offerCard, features: p.offerCard.features.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, offerCard: { ...p.offerCard, features: p.offerCard.features.filter((_, i) => i !== idx) } }));
  };
  const setOCCondition = (locale, idx, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, offerCard: { ...p.offerCard, conditions: p.offerCard.conditions.map((c, i) => i === idx ? val : c) } }));
  };
  const addCondition = () => {
    setEn((p) => ({ ...p, offerCard: { ...p.offerCard, conditions: [...p.offerCard.conditions, ""] } }));
    setAr((p) => ({ ...p, offerCard: { ...p.offerCard, conditions: [...p.offerCard.conditions, ""] } }));
  };
  const removeCondition = (idx) => {
    setEn((p) => ({ ...p, offerCard: { ...p.offerCard, conditions: p.offerCard.conditions.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, offerCard: { ...p.offerCard, conditions: p.offerCard.conditions.filter((_, i) => i !== idx) } }));
  };
  const setVSRow = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, rows: p.offerCard.valueStack.rows.map((r, i) => i === idx ? { ...r, [field]: val } : r) } } }));
  };
  const addVSRow = () => {
    const blank = { name: "", originalPrice: "", label: "", status: "included" };
    setEn((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, rows: [...p.offerCard.valueStack.rows, { ...blank }] } } }));
    setAr((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, rows: [...p.offerCard.valueStack.rows, { ...blank }] } } }));
  };
  const removeVSRow = (idx) => {
    setEn((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, rows: p.offerCard.valueStack.rows.filter((_, i) => i !== idx) } } }));
    setAr((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, rows: p.offerCard.valueStack.rows.filter((_, i) => i !== idx) } } }));
  };

  /* ── step / urgency / faq helpers ────────────────────────────── */
  const setStep = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, howSection: { ...p.howSection, steps: p.howSection.steps.map((s, i) => i === idx ? { ...s, [field]: val } : s) } }));
  };
  const setUrgencyPt = (locale, idx, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: p.urgencySection.points.map((pt, i) => i === idx ? val : pt) } }));
  };
  const addUrgencyPt = () => {
    setEn((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: [...p.urgencySection.points, ""] } }));
    setAr((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: [...p.urgencySection.points, ""] } }));
  };
  const removeUrgencyPt = (idx) => {
    setEn((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: p.urgencySection.points.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: p.urgencySection.points.filter((_, i) => i !== idx) } }));
  };
  const setFaq = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, faqSection: { ...p.faqSection, items: p.faqSection.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) } }));
  };
  const addFaq = () => {
    setEn((p) => ({ ...p, faqSection: { ...p.faqSection, items: [...p.faqSection.items, { q: "", a: "" }] } }));
    setAr((p) => ({ ...p, faqSection: { ...p.faqSection, items: [...p.faqSection.items, { q: "", a: "" }] } }));
  };
  const removeFaq = (idx) => {
    setEn((p) => ({ ...p, faqSection: { ...p.faqSection, items: p.faqSection.items.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, faqSection: { ...p.faqSection, items: p.faqSection.items.filter((_, i) => i !== idx) } }));
  };

  /* ── tab rendering ─────────────────────────────────────────────── */
  const renderTab = () => {
    switch (activeTab) {

      case "hero": return (
        <div className="space-y-4">
          <Card title="Hero Section">
            {[
              ["tagLabel", "Tag Label"],
              ["titleMain", "Title (main)"],
              ["titleHighlight", "Title (gold highlight)"],
              ["valueBadge", "Value Badge"],
              ["ctaPrimary", "CTA Button Text"],
              ["ctaLink", "CTA Button Link (blank = scroll to offer)"],
              ["finePrint", "Fine Print"],
            ].map(([key, label]) => (
              <BiRow key={key}>
                <Field label={`${label} (EN)`} value={en.hero[key]} onChange={(v) => setEn((p) => ({ ...p, hero: { ...p.hero, [key]: v } }))} type={key === "subtitle" ? "textarea" : "text"} />
                <Field label={`${label} (AR)`} value={ar.hero[key]} onChange={(v) => setAr((p) => ({ ...p, hero: { ...p.hero, [key]: v } }))} type={key === "subtitle" ? "textarea" : "text"} dir="rtl" />
              </BiRow>
            ))}
            <BiRow>
              <Field label="Subtitle (EN)" value={en.hero.subtitle} onChange={(v) => setEn((p) => ({ ...p, hero: { ...p.hero, subtitle: v } }))} type="textarea" />
              <Field label="Subtitle (AR)" value={ar.hero.subtitle} onChange={(v) => setAr((p) => ({ ...p, hero: { ...p.hero, subtitle: v } }))} type="textarea" dir="rtl" />
            </BiRow>
          </Card>
        </div>
      );

      case "stats": return (
        <div className="space-y-4">
          {en.stats.map((stat, idx) => (
            <Card key={idx} title={`Stat ${idx + 1}`}>
              <BiRow>
                <Field label="Value (EN)" value={stat.value} onChange={(v) => setEn((p) => ({ ...p, stats: p.stats.map((s, i) => i === idx ? { ...s, value: v } : s) }))} />
                <Field label="Value (AR)" value={ar.stats[idx]?.value} onChange={(v) => setAr((p) => ({ ...p, stats: p.stats.map((s, i) => i === idx ? { ...s, value: v } : s) }))} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Label (EN)" value={stat.label} onChange={(v) => setEn((p) => ({ ...p, stats: p.stats.map((s, i) => i === idx ? { ...s, label: v } : s) }))} />
                <Field label="Label (AR)" value={ar.stats[idx]?.label} onChange={(v) => setAr((p) => ({ ...p, stats: p.stats.map((s, i) => i === idx ? { ...s, label: v } : s) }))} dir="rtl" />
              </BiRow>
            </Card>
          ))}
        </div>
      );

      case "pain": return (
        <div className="space-y-4">
          <Card title="Section Labels">
            {[["tag","Tag"],["title","Title"],["subtitle","Subtitle"],["bottomText","Bottom Text"]].map(([k,l]) => (
              <BiRow key={k}>
                <Field label={`${l} (EN)`} value={en.painSection[k]} onChange={(v) => setEn((p) => ({ ...p, painSection: { ...p.painSection, [k]: v } }))} type={k === "subtitle" ? "textarea" : "text"} />
                <Field label={`${l} (AR)`} value={ar.painSection[k]} onChange={(v) => setAr((p) => ({ ...p, painSection: { ...p.painSection, [k]: v } }))} type={k === "subtitle" ? "textarea" : "text"} dir="rtl" />
              </BiRow>
            ))}
          </Card>
          {en.painSection.points.map((pt, idx) => (
            <Card key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500">Point {idx + 1}</span>
                <button onClick={() => removePain(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <BiRow>
                <Field label="EN" value={pt} onChange={(v) => setPainPoint("en", idx, v)} />
                <Field label="AR" value={ar.painSection.points[idx]} onChange={(v) => setPainPoint("ar", idx, v)} dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={addPain} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add Pain Point
          </button>
        </div>
      );

      case "offer-card": return (
        <div className="space-y-4">
          {/* Header + Price */}
          <Card title="Header & Price">
            {[["tag","Tag"],["title","Title"],["price","Price (number only)"],["currency","Currency"],["priceNote","Price Note"],["totalLabel","Total Label"],["totalValue","Total Value (crossed out)"],["payLabel","Pay Today Label"],["savingsNote","Savings Note"],["ctaButton","CTA Button Text"],["ctaLink","CTA Button Link (blank = scroll to offer)"],["ctaNote","CTA Note (below button)"]].map(([k,l]) => (
              <BiRow key={k}>
                <Field label={`${l} (EN)`} value={en.offerCard[k]} onChange={(v) => setOC("en", k, v)} />
                <Field label={`${l} (AR)`} value={ar.offerCard[k]} onChange={(v) => setOC("ar", k, v)} dir="rtl" />
              </BiRow>
            ))}
            <BiRow>
              <Field label="Subtitle (EN)" value={en.offerCard.subtitle} onChange={(v) => setOC("en","subtitle",v)} type="textarea" />
              <Field label="Subtitle (AR)" value={ar.offerCard.subtitle} onChange={(v) => setOC("ar","subtitle",v)} type="textarea" dir="rtl" />
            </BiRow>
          </Card>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 px-1">Features / Includes List</h3>
            {en.offerCard.features.map((feat, idx) => (
              <Card key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-500">Feature {idx + 1}</span>
                  <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                {/* Shared fields */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <Field label="Emoji (shared)" value={feat.emoji} onChange={(v) => { setOCFeature("en",idx,"emoji",v); setOCFeature("ar",idx,"emoji",v); }} />
                  <div>
                    <label className={labelCls}>Badge Type (shared)</label>
                    <select
                      value={feat.badgeType}
                      onChange={(e) => { setOCFeature("en",idx,"badgeType",e.target.value); setOCFeature("ar",idx,"badgeType",e.target.value); }}
                      className={inputCls}
                    >
                      <option value="core">Core (gold)</option>
                      <option value="free">Free (green)</option>
                    </select>
                  </div>
                </div>
                <BiRow>
                  <Field label="Title (EN)" value={feat.title} onChange={(v) => setOCFeature("en",idx,"title",v)} />
                  <Field label="Title (AR)" value={ar.offerCard.features[idx]?.title} onChange={(v) => setOCFeature("ar",idx,"title",v)} dir="rtl" />
                </BiRow>
                <BiRow>
                  <Field label="Description (EN)" value={feat.desc} onChange={(v) => setOCFeature("en",idx,"desc",v)} type="textarea" />
                  <Field label="Description (AR)" value={ar.offerCard.features[idx]?.desc} onChange={(v) => setOCFeature("ar",idx,"desc",v)} type="textarea" dir="rtl" />
                </BiRow>
                <BiRow>
                  <Field label="Badge Label (EN)" value={feat.badge} onChange={(v) => setOCFeature("en",idx,"badge",v)} />
                  <Field label="Badge Label (AR)" value={ar.offerCard.features[idx]?.badge} onChange={(v) => setOCFeature("ar",idx,"badge",v)} dir="rtl" />
                </BiRow>
                <BiRow>
                  <Field label="Original Price (EN)" value={feat.originalPrice} onChange={(v) => setOCFeature("en",idx,"originalPrice",v)} />
                  <Field label="Original Price (AR)" value={ar.offerCard.features[idx]?.originalPrice} onChange={(v) => setOCFeature("ar",idx,"originalPrice",v)} dir="rtl" />
                </BiRow>
                <BiRow>
                  <Field label="Included Label (EN)" value={feat.includedLabel} onChange={(v) => setOCFeature("en",idx,"includedLabel",v)} />
                  <Field label="Included Label (AR)" value={ar.offerCard.features[idx]?.includedLabel} onChange={(v) => setOCFeature("ar",idx,"includedLabel",v)} dir="rtl" />
                </BiRow>
              </Card>
            ))}
            <button onClick={addFeature} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
              <Plus size={15} /> Add Feature Line
            </button>
          </div>

          {/* Conditions */}
          <Card title="Conditions Box">
            <BiRow>
              <Field label="Title (EN)" value={en.offerCard.conditionsTitle} onChange={(v) => setOC("en","conditionsTitle",v)} />
              <Field label="Title (AR)" value={ar.offerCard.conditionsTitle} onChange={(v) => setOC("ar","conditionsTitle",v)} dir="rtl" />
            </BiRow>
            {en.offerCard.conditions.map((cond, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-500">Condition {idx + 1}</span>
                  <button onClick={() => removeCondition(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
                <BiRow>
                  <Field label="EN" value={cond} onChange={(v) => setOCCondition("en",idx,v)} type="textarea" rows={2} />
                  <Field label="AR" value={ar.offerCard.conditions[idx]} onChange={(v) => setOCCondition("ar",idx,v)} type="textarea" rows={2} dir="rtl" />
                </BiRow>
              </div>
            ))}
            <button onClick={addCondition} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
              <Plus size={15} /> Add Condition
            </button>
          </Card>

          {/* Deduction */}
          <Card title="Deduction Bonus Box">
            <BiRow>
              <Field label="Title (EN)" value={en.offerCard.deductionTitle} onChange={(v) => setOC("en","deductionTitle",v)} />
              <Field label="Title (AR)" value={ar.offerCard.deductionTitle} onChange={(v) => setOC("ar","deductionTitle",v)} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Text (EN)" value={en.offerCard.deductionText} onChange={(v) => setOC("en","deductionText",v)} type="textarea" rows={3} />
              <Field label="Text (AR)" value={ar.offerCard.deductionText} onChange={(v) => setOC("ar","deductionText",v)} type="textarea" rows={3} dir="rtl" />
            </BiRow>
          </Card>

          {/* Value Stack */}
          <Card title="Value Stack Table">
            <BiRow>
              <Field label="Table Title (EN)" value={en.offerCard.valueStack?.title} onChange={(v) => setEn((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, title: v } } }))} />
              <Field label="Table Title (AR)" value={ar.offerCard.valueStack?.title} onChange={(v) => setAr((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, title: v } } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Subtitle (EN)" value={en.offerCard.valueStack?.subtitle} onChange={(v) => setEn((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, subtitle: v } } }))} />
              <Field label="Subtitle (AR)" value={ar.offerCard.valueStack?.subtitle} onChange={(v) => setAr((p) => ({ ...p, offerCard: { ...p.offerCard, valueStack: { ...p.offerCard.valueStack, subtitle: v } } }))} dir="rtl" />
            </BiRow>
            <div className="space-y-3 pt-2">
              {(en.offerCard.valueStack?.rows || []).map((row, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">Row {idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <select
                        value={row.status}
                        onChange={(e) => { setVSRow("en",idx,"status",e.target.value); setVSRow("ar",idx,"status",e.target.value); }}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="included">Included (strikethrough)</option>
                        <option value="bonus">Bonus (green label)</option>
                        <option value="pay">Pay Now (gold, no strikethrough)</option>
                      </select>
                      <button onClick={() => removeVSRow(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <BiRow>
                    <Field label="Row Name (EN)" value={row.name} onChange={(v) => setVSRow("en",idx,"name",v)} />
                    <Field label="Row Name (AR)" value={ar.offerCard.valueStack?.rows[idx]?.name} onChange={(v) => setVSRow("ar",idx,"name",v)} dir="rtl" />
                  </BiRow>
                  {row.status !== "bonus" ? (
                    <BiRow>
                      <Field label="Price (EN)" value={row.originalPrice} onChange={(v) => setVSRow("en",idx,"originalPrice",v)} />
                      <Field label="Price (AR)" value={ar.offerCard.valueStack?.rows[idx]?.originalPrice} onChange={(v) => setVSRow("ar",idx,"originalPrice",v)} dir="rtl" />
                    </BiRow>
                  ) : (
                    <BiRow>
                      <Field label="Label shown (EN)" value={row.label} onChange={(v) => setVSRow("en",idx,"label",v)} />
                      <Field label="Label shown (AR)" value={ar.offerCard.valueStack?.rows[idx]?.label} onChange={(v) => setVSRow("ar",idx,"label",v)} dir="rtl" />
                    </BiRow>
                  )}
                </div>
              ))}
              <button onClick={addVSRow} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
                <Plus size={15} /> Add Row
              </button>
            </div>
          </Card>
        </div>
      );

      case "how": return (
        <div className="space-y-4">
          <Card title="Section Labels">
            <BiRow>
              <Field label="Tag (EN)" value={en.howSection.tag} onChange={(v) => setEn((p) => ({ ...p, howSection: { ...p.howSection, tag: v } }))} />
              <Field label="Tag (AR)" value={ar.howSection.tag} onChange={(v) => setAr((p) => ({ ...p, howSection: { ...p.howSection, tag: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Title (EN)" value={en.howSection.title} onChange={(v) => setEn((p) => ({ ...p, howSection: { ...p.howSection, title: v } }))} />
              <Field label="Title (AR)" value={ar.howSection.title} onChange={(v) => setAr((p) => ({ ...p, howSection: { ...p.howSection, title: v } }))} dir="rtl" />
            </BiRow>
          </Card>
          {en.howSection.steps.map((step, idx) => (
            <Card key={idx} title={`Step ${step.number}`}>
              <BiRow>
                <Field label="Title (EN)" value={step.title} onChange={(v) => setStep("en",idx,"title",v)} />
                <Field label="Title (AR)" value={ar.howSection.steps[idx]?.title} onChange={(v) => setStep("ar",idx,"title",v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Description (EN)" value={step.desc} onChange={(v) => setStep("en",idx,"desc",v)} type="textarea" />
                <Field label="Description (AR)" value={ar.howSection.steps[idx]?.desc} onChange={(v) => setStep("ar",idx,"desc",v)} type="textarea" dir="rtl" />
              </BiRow>
            </Card>
          ))}
        </div>
      );

      case "audience": return (
        <div className="space-y-4">
          <Card title="Section Labels">
            <BiRow>
              <Field label="Tag (EN)" value={en.audienceSection.tag} onChange={(v) => setEn((p) => ({ ...p, audienceSection: { ...p.audienceSection, tag: v } }))} />
              <Field label="Tag (AR)" value={ar.audienceSection.tag} onChange={(v) => setAr((p) => ({ ...p, audienceSection: { ...p.audienceSection, tag: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Title (EN)" value={en.audienceSection.title} onChange={(v) => setEn((p) => ({ ...p, audienceSection: { ...p.audienceSection, title: v } }))} />
              <Field label="Title (AR)" value={ar.audienceSection.title} onChange={(v) => setAr((p) => ({ ...p, audienceSection: { ...p.audienceSection, title: v } }))} dir="rtl" />
            </BiRow>
          </Card>
          {en.audienceSection.items.map((item, idx) => (
            <Card key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500">Card {idx + 1}</span>
                <button onClick={() => removeListItem("audienceSection", idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <div className="mb-3">
                <Field label="Emoji (shared)" value={item.emoji} onChange={(v) => { updList("en","audienceSection",idx,"emoji",v); updList("ar","audienceSection",idx,"emoji",v); }} />
              </div>
              <BiRow>
                <Field label="Title (EN)" value={item.title} onChange={(v) => updList("en","audienceSection",idx,"title",v)} />
                <Field label="Title (AR)" value={ar.audienceSection.items[idx]?.title} onChange={(v) => updList("ar","audienceSection",idx,"title",v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Description (EN)" value={item.desc} onChange={(v) => updList("en","audienceSection",idx,"desc",v)} type="textarea" />
                <Field label="Description (AR)" value={ar.audienceSection.items[idx]?.desc} onChange={(v) => updList("ar","audienceSection",idx,"desc",v)} type="textarea" dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={() => addListItem("audienceSection", { emoji:"⭐", title:"", desc:"" }, { emoji:"⭐", title:"", desc:"" })} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add Card
          </button>
        </div>
      );

      case "testimonials": return (
        <div className="space-y-4">
          <Card title="Section Labels">
            <BiRow>
              <Field label="Tag (EN)" value={en.testimonialSection.tag} onChange={(v) => setEn((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, tag: v } }))} />
              <Field label="Tag (AR)" value={ar.testimonialSection.tag} onChange={(v) => setAr((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, tag: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Title (EN)" value={en.testimonialSection.title} onChange={(v) => setEn((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, title: v } }))} />
              <Field label="Title (AR)" value={ar.testimonialSection.title} onChange={(v) => setAr((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, title: v } }))} dir="rtl" />
            </BiRow>
          </Card>
          {en.testimonialSection.items.map((item, idx) => (
            <Card key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500">Testimonial {idx + 1}</span>
                <button onClick={() => removeListItem("testimonialSection",idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <div className="mb-2">
                <label className={labelCls}>Author (shared)</label>
                <input type="text" value={item.author||""} onChange={(e) => { updList("en","testimonialSection",idx,"author",e.target.value); updList("ar","testimonialSection",idx,"author",e.target.value); }} className={inputCls} />
              </div>
              <div className="mb-2">
                <label className={labelCls}>Stars 1–5 (shared)</label>
                <input type="number" min={1} max={5} value={item.stars||5} onChange={(e) => { const v=parseInt(e.target.value); updList("en","testimonialSection",idx,"stars",v); updList("ar","testimonialSection",idx,"stars",v); }} className={`${inputCls} w-24`} />
              </div>
              <BiRow>
                <Field label="Quote (EN)" value={item.quote} onChange={(v) => updList("en","testimonialSection",idx,"quote",v)} type="textarea" />
                <Field label="Quote (AR)" value={ar.testimonialSection.items[idx]?.quote} onChange={(v) => updList("ar","testimonialSection",idx,"quote",v)} type="textarea" dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Role (EN)" value={item.role} onChange={(v) => updList("en","testimonialSection",idx,"role",v)} />
                <Field label="Role (AR)" value={ar.testimonialSection.items[idx]?.role} onChange={(v) => updList("ar","testimonialSection",idx,"role",v)} dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={() => addListItem("testimonialSection",{quote:"",author:"",role:"",stars:5},{quote:"",author:"",role:"",stars:5})} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add Testimonial
          </button>
        </div>
      );

      case "urgency": return (
        <div className="space-y-4">
          <Card title="Urgency Box">
            <BiRow>
              <Field label="Title (EN)" value={en.urgencySection.title} onChange={(v) => setEn((p) => ({ ...p, urgencySection: { ...p.urgencySection, title: v } }))} />
              <Field label="Title (AR)" value={ar.urgencySection.title} onChange={(v) => setAr((p) => ({ ...p, urgencySection: { ...p.urgencySection, title: v } }))} dir="rtl" />
            </BiRow>
            {en.urgencySection.points.map((pt, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-500">Point {idx + 1}</span>
                  <button onClick={() => removeUrgencyPt(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
                <BiRow>
                  <Field label="EN" value={pt} onChange={(v) => setUrgencyPt("en",idx,v)} />
                  <Field label="AR" value={ar.urgencySection.points[idx]} onChange={(v) => setUrgencyPt("ar",idx,v)} dir="rtl" />
                </BiRow>
              </div>
            ))}
            <button onClick={addUrgencyPt} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
              <Plus size={15} /> Add Point
            </button>
          </Card>
          <Card title="Guarantee Box">
            <BiRow>
              <Field label="Title (EN)" value={en.guaranteeSection.title} onChange={(v) => setEn((p) => ({ ...p, guaranteeSection: { ...p.guaranteeSection, title: v } }))} />
              <Field label="Title (AR)" value={ar.guaranteeSection.title} onChange={(v) => setAr((p) => ({ ...p, guaranteeSection: { ...p.guaranteeSection, title: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Text (EN)" value={en.guaranteeSection.text} onChange={(v) => setEn((p) => ({ ...p, guaranteeSection: { ...p.guaranteeSection, text: v } }))} type="textarea" rows={4} />
              <Field label="Text (AR)" value={ar.guaranteeSection.text} onChange={(v) => setAr((p) => ({ ...p, guaranteeSection: { ...p.guaranteeSection, text: v } }))} type="textarea" rows={4} dir="rtl" />
            </BiRow>
          </Card>
        </div>
      );

      case "faq": return (
        <div className="space-y-4">
          <Card title="Section Labels">
            <BiRow>
              <Field label="Tag (EN)" value={en.faqSection.tag} onChange={(v) => setEn((p) => ({ ...p, faqSection: { ...p.faqSection, tag: v } }))} />
              <Field label="Tag (AR)" value={ar.faqSection.tag} onChange={(v) => setAr((p) => ({ ...p, faqSection: { ...p.faqSection, tag: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Title (EN)" value={en.faqSection.title} onChange={(v) => setEn((p) => ({ ...p, faqSection: { ...p.faqSection, title: v } }))} />
              <Field label="Title (AR)" value={ar.faqSection.title} onChange={(v) => setAr((p) => ({ ...p, faqSection: { ...p.faqSection, title: v } }))} dir="rtl" />
            </BiRow>
          </Card>
          {en.faqSection.items.map((item, idx) => (
            <Card key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500">FAQ {idx + 1}</span>
                <button onClick={() => removeFaq(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <BiRow>
                <Field label="Question (EN)" value={item.q} onChange={(v) => setFaq("en",idx,"q",v)} />
                <Field label="Question (AR)" value={ar.faqSection.items[idx]?.q} onChange={(v) => setFaq("ar",idx,"q",v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Answer (EN)" value={item.a} onChange={(v) => setFaq("en",idx,"a",v)} type="textarea" />
                <Field label="Answer (AR)" value={ar.faqSection.items[idx]?.a} onChange={(v) => setFaq("ar",idx,"a",v)} type="textarea" dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={addFaq} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add FAQ
          </button>
        </div>
      );

      case "cta": return (
        <div className="space-y-4">
          <Card title="Final CTA Section">
            {[["badge","Badge"],["title","Title"],["primaryBtn","Button Text"],["ctaLink","Button Link (blank = scroll to offer)"],["finePrint","Fine Print"]].map(([k,l]) => (
              <BiRow key={k}>
                <Field label={`${l} (EN)`} value={en.finalCta[k]} onChange={(v) => setEn((p) => ({ ...p, finalCta: { ...p.finalCta, [k]: v } }))} />
                <Field label={`${l} (AR)`} value={ar.finalCta[k]} onChange={(v) => setAr((p) => ({ ...p, finalCta: { ...p.finalCta, [k]: v } }))} dir="rtl" />
              </BiRow>
            ))}
            <BiRow>
              <Field label="Subtitle (EN)" value={en.finalCta.subtitle} onChange={(v) => setEn((p) => ({ ...p, finalCta: { ...p.finalCta, subtitle: v } }))} type="textarea" />
              <Field label="Subtitle (AR)" value={ar.finalCta.subtitle} onChange={(v) => setAr((p) => ({ ...p, finalCta: { ...p.finalCta, subtitle: v } }))} type="textarea" dir="rtl" />
            </BiRow>
          </Card>
        </div>
      );

      default: return null;
    }
  };

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#fafafa] p-6 md:p-8">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions Page Content</h1>
          <p className="text-sm text-gray-500 mt-1">Edit all static sections — both EN and AR. Changes apply to the live page instantly after saving.</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-60 transition">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save All"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-start px-4 py-3 text-sm font-medium transition border-b border-gray-100 last:border-0 ${
                    activeTab === tab.id ? "bg-[#2D3247] text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex-1 space-y-4">{renderTab()}</div>
        </div>
      )}
    </main>
  );
}
