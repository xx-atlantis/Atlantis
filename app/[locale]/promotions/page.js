"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import {
  Tag, Calendar, Copy, Check, ArrowRight, Star,
  CheckCircle2, XCircle, ShieldCheck, Medal, ChevronDown, ChevronUp,
  AlertTriangle, Zap, Users, Clock, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── default content (fallback if DB is empty) ───────────────────── */
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

/* ─── helpers ─────────────────────────────────────────────────────── */
function CouponBadge({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-2 border-2 border-dashed border-[#2D3247]/40 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold text-[#2D3247] hover:border-[#2D3247] hover:bg-[#2D3247]/5 transition"
    >
      <Tag size={13} />
      {code}
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="opacity-50" />}
    </button>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-start bg-white hover:bg-[#F5F3EF] transition"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp size={18} className="text-[#2D3247] shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white">
          <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────── */
export default function PromotionsPage() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [promotions, setPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [content, setContent] = useState({ en: DEFAULT_EN, ar: DEFAULT_AR });
  const offerRef = useRef(null);

  useEffect(() => {
    // Load DB promotions
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(({ data }) => setPromotions(data || []))
      .catch(() => {})
      .finally(() => setLoadingPromos(false));

    // Load editable page content
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

  // Active locale content
  const c = isRTL ? content.ar : content.en;
  const scrollToOffers = () => offerRef.current?.scrollIntoView({ behavior: "smooth" });

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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToOffers}
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-8 py-3.5 rounded-xl transition"
            >
              {c.hero.ctaPrimary}
              <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
            </button>
            <Link
              href={`/${locale}/contact-us`}
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white/80 hover:text-white font-medium px-6 py-3.5 rounded-xl transition"
            >
              {c.hero.ctaSecondary}
            </Link>
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
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
            {c.painSection.tag}
          </p>
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

      {/* ── 4. OFFER CARDS (DB promotions) ───────────────────────────── */}
      <section ref={offerRef} className="bg-[#F5F3EF] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10">
          <div className="text-center mb-10 space-y-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
              {isRTL ? "الحزم الترويجية" : "Promotional Packages"}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isRTL ? "العروض الحالية" : "Current Offers"}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              {isRTL
                ? "حزم حصرية متاحة لفترة محدودة — احجز الآن لتثبيت سعرك."
                : "Exclusive packages available for a limited time — book now to lock in your rate."}
            </p>
          </div>

          {loadingPromos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-80" />
              ))}
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#F5F3EF] flex items-center justify-center mx-auto mb-4">
                <Tag size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold">
                {isRTL ? "لا توجد عروض نشطة في الوقت الحالي." : "No active promotions right now."}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {isRTL ? "تفقد مجدداً قريباً أو تواصل معنا للحصول على عرض مخصص." : "Check back soon or contact us for a custom quote."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => {
                const title   = isRTL ? promo.titleAr   : promo.titleEn;
                const desc    = isRTL ? promo.descAr    : promo.descEn;
                const badge   = isRTL ? promo.badgeAr   : promo.badgeEn;
                const expired = promo.validUntil && new Date(promo.validUntil) < new Date();

                return (
                  <div key={promo.id} className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col ${expired ? "opacity-60" : ""}`}>
                    <div className="relative aspect-[16/9] bg-[#F5F3EF] overflow-hidden">
                      {promo.image ? (
                        <Image src={promo.image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Tag size={36} className="text-gray-200" /></div>
                      )}
                      {badge && (
                        <span className="absolute top-3 start-3 bg-[#2D3247] text-white text-xs font-bold px-3 py-1 rounded-full shadow">{badge}</span>
                      )}
                      {expired && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{isRTL ? "منتهي" : "Expired"}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 space-y-3">
                      <h3 className="font-bold text-gray-900 text-lg leading-snug">{title}</h3>
                      {desc && <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">{desc}</p>}
                      <div className="flex flex-wrap items-center gap-3">
                        {promo.couponCode && !expired && <CouponBadge code={promo.couponCode} />}
                        {promo.validUntil && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={11} />
                            {isRTL ? "صالح حتى" : "Valid until"}{" "}
                            {new Date(promo.validUntil).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      {promo.link && !expired && (
                        <Link href={promo.link} className="inline-flex items-center gap-1.5 bg-[#2D3247] hover:bg-[#1e2231] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition mt-auto">
                          {isRTL ? "احصل على العرض" : "Claim Offer"}
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

      {/* ── 5. HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">{c.howSection.tag}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{c.howSection.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(c.howSection.steps || []).map((step, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2D3247] text-white flex items-center justify-center font-bold text-lg mx-auto">
                {step.number}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. WHO IS IT FOR ─────────────────────────────────────────── */}
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

      {/* ── 7. TESTIMONIALS ──────────────────────────────────────────── */}
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

      {/* ── 8. URGENCY BOX ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 pb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex gap-4">
          <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-bold text-amber-900 text-base">{c.urgencySection.title}</h3>
            <ul className="space-y-2">
              {(c.urgencySection.points || []).map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <Zap size={14} className="shrink-0 mt-0.5 text-amber-500" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 9. GUARANTEE BOX ─────────────────────────────────────────── */}
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

      {/* ── 10. FAQ ──────────────────────────────────────────────────── */}
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

      {/* ── 11. FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-[#2D3247] text-white py-16 md:py-20 px-4 sm:px-8 md:px-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2">
            <Clock size={14} className="text-[#C9A96E]" />
            <span className="text-sm font-semibold text-white/80">{c.finalCta.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">{c.finalCta.title}</h2>
          <p className="text-white/70 max-w-xl mx-auto text-base">{c.finalCta.subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToOffers}
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-8 py-3.5 rounded-xl transition"
            >
              {c.finalCta.primaryBtn}
              <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
            </button>
            <Link
              href={`/${locale}/contact-us`}
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white/80 hover:text-white font-medium px-6 py-3.5 rounded-xl transition"
            >
              {c.finalCta.secondaryBtn}
            </Link>
          </div>
          <p className="text-white/40 text-xs">{c.finalCta.finePrint}</p>
        </div>
      </section>

    </div>
  );
}
