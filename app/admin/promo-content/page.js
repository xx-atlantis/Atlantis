"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── defaults (mirror what the public page uses) ─────────────────── */
const DEFAULT_EN = {
  hero: {
    tagLabel: "Limited Time Offer",
    titleMain: "Transform Your Space",
    titleHighlight: "Without Breaking the Bank",
    subtitle: "Premium interior design packages at exclusive promotional rates — crafted by Atlantis's expert team for homes and businesses across the GCC.",
    valueBadge: "Save up to 40% on select packages",
    ctaPrimary: "View Current Offers",
    ctaSecondary: "Book Free Consultation",
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
    secondaryBtn: "Talk to a Designer",
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
    ctaSecondary: "احجز استشارة مجانية",
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
    secondaryBtn: "تحدث مع مصمم",
    finePrint: "* الاستشارة المجانية لا تلزمك بأي شيء.",
  },
};

/* ─── shared field helpers ────────────────────────────────────────── */
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

function Field({ label, value, onChange, type = "text", dir = "ltr", rows = 3 }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {type === "textarea" ? (
        <textarea dir={dir} value={value || ""} onChange={(e) => onChange(e.target.value)}
          rows={rows} className={inputCls} />
      ) : (
        <input dir={dir} type="text" value={value || ""} onChange={(e) => onChange(e.target.value)}
          className={inputCls} />
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
  { id: "how",         label: "How It Works" },
  { id: "audience",    label: "Who It's For" },
  { id: "testimonials",label: "Testimonials" },
  { id: "urgency",     label: "Urgency & Guarantee" },
  { id: "faq",         label: "FAQ" },
  { id: "cta",         label: "Final CTA" },
];

/* ─── main component ──────────────────────────────────────────────── */
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
        if (data?.en && Object.keys(data.en).length > 0) setEn((p) => ({ ...DEFAULT_EN, ...data.en }));
        if (data?.ar && Object.keys(data.ar).length > 0) setAr((p) => ({ ...DEFAULT_AR, ...data.ar }));
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

  /* ── section-specific helpers ─────────────────────────────────── */

  // Hero
  const heroField = (key, label, type = "text") => (
    <BiRow>
      <Field label={`${label} (EN)`} value={en.hero[key]} onChange={(v) => setEn((p) => ({ ...p, hero: { ...p.hero, [key]: v } }))} type={type} />
      <Field label={`${label} (AR)`} value={ar.hero[key]} onChange={(v) => setAr((p) => ({ ...p, hero: { ...p.hero, [key]: v } }))} type={type} dir="rtl" />
    </BiRow>
  );

  // Stats
  const updateStat = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({
      ...p,
      stats: p.stats.map((s, i) => i === idx ? { ...s, [field]: val } : s),
    }));
  };

  // Pain points
  const updatePainPoint = (locale, idx, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, painSection: { ...p.painSection, points: p.painSection.points.map((pt, i) => i === idx ? val : pt) } }));
  };
  const addPainPoint = () => {
    setEn((p) => ({ ...p, painSection: { ...p.painSection, points: [...p.painSection.points, ""] } }));
    setAr((p) => ({ ...p, painSection: { ...p.painSection, points: [...p.painSection.points, ""] } }));
  };
  const removePainPoint = (idx) => {
    setEn((p) => ({ ...p, painSection: { ...p.painSection, points: p.painSection.points.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, painSection: { ...p.painSection, points: p.painSection.points.filter((_, i) => i !== idx) } }));
  };

  // How it works steps
  const updateStep = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, howSection: { ...p.howSection, steps: p.howSection.steps.map((s, i) => i === idx ? { ...s, [field]: val } : s) } }));
  };

  // Audience
  const updateAudience = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, audienceSection: { ...p.audienceSection, items: p.audienceSection.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) } }));
  };
  const addAudience = () => {
    setEn((p) => ({ ...p, audienceSection: { ...p.audienceSection, items: [...p.audienceSection.items, { emoji: "⭐", title: "", desc: "" }] } }));
    setAr((p) => ({ ...p, audienceSection: { ...p.audienceSection, items: [...p.audienceSection.items, { emoji: "⭐", title: "", desc: "" }] } }));
  };
  const removeAudience = (idx) => {
    setEn((p) => ({ ...p, audienceSection: { ...p.audienceSection, items: p.audienceSection.items.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, audienceSection: { ...p.audienceSection, items: p.audienceSection.items.filter((_, i) => i !== idx) } }));
  };

  // Testimonials
  const updateTestimonial = (locale, idx, field, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, items: p.testimonialSection.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) } }));
  };
  const addTestimonial = () => {
    const blank = { quote: "", author: "", role: "", stars: 5 };
    setEn((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, items: [...p.testimonialSection.items, { ...blank }] } }));
    setAr((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, items: [...p.testimonialSection.items, { ...blank }] } }));
  };
  const removeTestimonial = (idx) => {
    setEn((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, items: p.testimonialSection.items.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, testimonialSection: { ...p.testimonialSection, items: p.testimonialSection.items.filter((_, i) => i !== idx) } }));
  };

  // Urgency points
  const updateUrgencyPoint = (locale, idx, val) => {
    const setter = locale === "en" ? setEn : setAr;
    setter((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: p.urgencySection.points.map((pt, i) => i === idx ? val : pt) } }));
  };
  const addUrgencyPoint = () => {
    setEn((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: [...p.urgencySection.points, ""] } }));
    setAr((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: [...p.urgencySection.points, ""] } }));
  };
  const removeUrgencyPoint = (idx) => {
    setEn((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: p.urgencySection.points.filter((_, i) => i !== idx) } }));
    setAr((p) => ({ ...p, urgencySection: { ...p.urgencySection, points: p.urgencySection.points.filter((_, i) => i !== idx) } }));
  };

  // FAQ
  const updateFaq = (locale, idx, field, val) => {
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

      /* ── HERO ─────────────────────────────────────────────── */
      case "hero": return (
        <div className="space-y-4">
          <Card title="Hero Section">
            {heroField("tagLabel", "Tag Label")}
            {heroField("titleMain", "Title (main part)")}
            {heroField("titleHighlight", "Title (highlighted span)")}
            {heroField("subtitle", "Subtitle", "textarea")}
            {heroField("valueBadge", "Value Badge")}
            {heroField("ctaPrimary", "Primary CTA Button")}
            {heroField("ctaSecondary", "Secondary CTA Button")}
            {heroField("finePrint", "Fine Print")}
          </Card>
        </div>
      );

      /* ── STATS ────────────────────────────────────────────── */
      case "stats": return (
        <div className="space-y-4">
          {en.stats.map((stat, idx) => (
            <Card key={idx} title={`Stat ${idx + 1}`}>
              <BiRow>
                <Field label="Value (EN)" value={stat.value} onChange={(v) => updateStat("en", idx, "value", v)} />
                <Field label="Value (AR)" value={ar.stats[idx]?.value} onChange={(v) => updateStat("ar", idx, "value", v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Label (EN)" value={stat.label} onChange={(v) => updateStat("en", idx, "label", v)} />
                <Field label="Label (AR)" value={ar.stats[idx]?.label} onChange={(v) => updateStat("ar", idx, "label", v)} dir="rtl" />
              </BiRow>
            </Card>
          ))}
        </div>
      );

      /* ── PAIN POINTS ──────────────────────────────────────── */
      case "pain": return (
        <div className="space-y-4">
          <Card title="Section Labels">
            <BiRow>
              <Field label="Tag (EN)" value={en.painSection.tag} onChange={(v) => setEn((p) => ({ ...p, painSection: { ...p.painSection, tag: v } }))} />
              <Field label="Tag (AR)" value={ar.painSection.tag} onChange={(v) => setAr((p) => ({ ...p, painSection: { ...p.painSection, tag: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Title (EN)" value={en.painSection.title} onChange={(v) => setEn((p) => ({ ...p, painSection: { ...p.painSection, title: v } }))} />
              <Field label="Title (AR)" value={ar.painSection.title} onChange={(v) => setAr((p) => ({ ...p, painSection: { ...p.painSection, title: v } }))} dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Subtitle (EN)" value={en.painSection.subtitle} onChange={(v) => setEn((p) => ({ ...p, painSection: { ...p.painSection, subtitle: v } }))} type="textarea" />
              <Field label="Subtitle (AR)" value={ar.painSection.subtitle} onChange={(v) => setAr((p) => ({ ...p, painSection: { ...p.painSection, subtitle: v } }))} type="textarea" dir="rtl" />
            </BiRow>
            <BiRow>
              <Field label="Bottom Text (EN)" value={en.painSection.bottomText} onChange={(v) => setEn((p) => ({ ...p, painSection: { ...p.painSection, bottomText: v } }))} />
              <Field label="Bottom Text (AR)" value={ar.painSection.bottomText} onChange={(v) => setAr((p) => ({ ...p, painSection: { ...p.painSection, bottomText: v } }))} dir="rtl" />
            </BiRow>
          </Card>

          {en.painSection.points.map((pt, idx) => (
            <Card key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Point {idx + 1}</span>
                <button onClick={() => removePainPoint(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <BiRow>
                <Field label="EN" value={pt} onChange={(v) => updatePainPoint("en", idx, v)} />
                <Field label="AR" value={ar.painSection.points[idx]} onChange={(v) => updatePainPoint("ar", idx, v)} dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={addPainPoint} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add Pain Point
          </button>
        </div>
      );

      /* ── HOW IT WORKS ─────────────────────────────────────── */
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
                <Field label="Title (EN)" value={step.title} onChange={(v) => updateStep("en", idx, "title", v)} />
                <Field label="Title (AR)" value={ar.howSection.steps[idx]?.title} onChange={(v) => updateStep("ar", idx, "title", v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Description (EN)" value={step.desc} onChange={(v) => updateStep("en", idx, "desc", v)} type="textarea" />
                <Field label="Description (AR)" value={ar.howSection.steps[idx]?.desc} onChange={(v) => updateStep("ar", idx, "desc", v)} type="textarea" dir="rtl" />
              </BiRow>
            </Card>
          ))}
        </div>
      );

      /* ── AUDIENCE ─────────────────────────────────────────── */
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Card {idx + 1}</span>
                <button onClick={() => removeAudience(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <div className="mb-3">
                <Field label="Emoji (shared)" value={item.emoji} onChange={(v) => { updateAudience("en", idx, "emoji", v); updateAudience("ar", idx, "emoji", v); }} />
              </div>
              <BiRow>
                <Field label="Title (EN)" value={item.title} onChange={(v) => updateAudience("en", idx, "title", v)} />
                <Field label="Title (AR)" value={ar.audienceSection.items[idx]?.title} onChange={(v) => updateAudience("ar", idx, "title", v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Description (EN)" value={item.desc} onChange={(v) => updateAudience("en", idx, "desc", v)} type="textarea" />
                <Field label="Description (AR)" value={ar.audienceSection.items[idx]?.desc} onChange={(v) => updateAudience("ar", idx, "desc", v)} type="textarea" dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={addAudience} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add Card
          </button>
        </div>
      );

      /* ── TESTIMONIALS ─────────────────────────────────────── */
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Testimonial {idx + 1}</span>
                <button onClick={() => removeTestimonial(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <div className="mb-2">
                <label className={labelCls}>Author (shared)</label>
                <input type="text" value={item.author || ""} onChange={(e) => { updateTestimonial("en", idx, "author", e.target.value); updateTestimonial("ar", idx, "author", e.target.value); }} className={inputCls} />
              </div>
              <div className="mb-2">
                <label className={labelCls}>Stars (1–5, shared)</label>
                <input type="number" min={1} max={5} value={item.stars || 5} onChange={(e) => { const v = parseInt(e.target.value); updateTestimonial("en", idx, "stars", v); updateTestimonial("ar", idx, "stars", v); }} className={`${inputCls} w-24`} />
              </div>
              <BiRow>
                <Field label="Quote (EN)" value={item.quote} onChange={(v) => updateTestimonial("en", idx, "quote", v)} type="textarea" />
                <Field label="Quote (AR)" value={ar.testimonialSection.items[idx]?.quote} onChange={(v) => updateTestimonial("ar", idx, "quote", v)} type="textarea" dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Role (EN)" value={item.role} onChange={(v) => updateTestimonial("en", idx, "role", v)} />
                <Field label="Role (AR)" value={ar.testimonialSection.items[idx]?.role} onChange={(v) => updateTestimonial("ar", idx, "role", v)} dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={addTestimonial} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add Testimonial
          </button>
        </div>
      );

      /* ── URGENCY & GUARANTEE ──────────────────────────────── */
      case "urgency": return (
        <div className="space-y-4">
          <Card title="Urgency Box">
            <BiRow>
              <Field label="Title (EN)" value={en.urgencySection.title} onChange={(v) => setEn((p) => ({ ...p, urgencySection: { ...p.urgencySection, title: v } }))} />
              <Field label="Title (AR)" value={ar.urgencySection.title} onChange={(v) => setAr((p) => ({ ...p, urgencySection: { ...p.urgencySection, title: v } }))} dir="rtl" />
            </BiRow>
            <div className="space-y-3 pt-2">
              {en.urgencySection.points.map((pt, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Point {idx + 1}</span>
                    <button onClick={() => removeUrgencyPoint(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                  <BiRow>
                    <Field label="EN" value={pt} onChange={(v) => updateUrgencyPoint("en", idx, v)} />
                    <Field label="AR" value={ar.urgencySection.points[idx]} onChange={(v) => updateUrgencyPoint("ar", idx, v)} dir="rtl" />
                  </BiRow>
                </div>
              ))}
              <button onClick={addUrgencyPoint} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
                <Plus size={15} /> Add Point
              </button>
            </div>
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

      /* ── FAQ ──────────────────────────────────────────────── */
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">FAQ {idx + 1}</span>
                <button onClick={() => removeFaq(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <BiRow>
                <Field label="Question (EN)" value={item.q} onChange={(v) => updateFaq("en", idx, "q", v)} />
                <Field label="Question (AR)" value={ar.faqSection.items[idx]?.q} onChange={(v) => updateFaq("ar", idx, "q", v)} dir="rtl" />
              </BiRow>
              <BiRow>
                <Field label="Answer (EN)" value={item.a} onChange={(v) => updateFaq("en", idx, "a", v)} type="textarea" />
                <Field label="Answer (AR)" value={ar.faqSection.items[idx]?.a} onChange={(v) => updateFaq("ar", idx, "a", v)} type="textarea" dir="rtl" />
              </BiRow>
            </Card>
          ))}
          <button onClick={addFaq} className="flex items-center gap-2 text-sm font-semibold text-[#2D3247] hover:underline">
            <Plus size={15} /> Add FAQ
          </button>
        </div>
      );

      /* ── FINAL CTA ────────────────────────────────────────── */
      case "cta": return (
        <div className="space-y-4">
          <Card title="Final CTA Section">
            {[
              ["badge",       "Badge Text"],
              ["title",       "Title"],
              ["subtitle",    "Subtitle"],
              ["primaryBtn",  "Primary Button"],
              ["secondaryBtn","Secondary Button"],
              ["finePrint",   "Fine Print"],
            ].map(([key, label]) => (
              <BiRow key={key}>
                <Field label={`${label} (EN)`} value={en.finalCta[key]} onChange={(v) => setEn((p) => ({ ...p, finalCta: { ...p.finalCta, [key]: v } }))} type={key === "subtitle" ? "textarea" : "text"} />
                <Field label={`${label} (AR)`} value={ar.finalCta[key]} onChange={(v) => setAr((p) => ({ ...p, finalCta: { ...p.finalCta, [key]: v } }))} type={key === "subtitle" ? "textarea" : "text"} dir="rtl" />
              </BiRow>
            ))}
          </Card>
        </div>
      );

      default: return null;
    }
  };

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#fafafa] p-6 md:p-8">
      <ToastContainer position="bottom-right" theme="light" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions Page Content</h1>
          <p className="text-sm text-gray-500 mt-1">Edit all static sections of the promotions page — both EN and AR.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-60 transition"
        >
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
          {/* Tab sidebar */}
          <nav className="lg:w-48 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-start px-4 py-3 text-sm font-medium transition border-b border-gray-100 last:border-0 ${
                    activeTab === tab.id
                      ? "bg-[#2D3247] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab content */}
          <div className="flex-1 space-y-4">
            {renderTab()}
          </div>
        </div>
      )}
    </main>
  );
}
