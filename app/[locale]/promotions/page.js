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

/* ─── static bilingual content ────────────────────────────────────── */
const STATS = [
  { en: "500+", ar: "٥٠٠+", labelEn: "Projects Completed",     labelAr: "مشروع مكتمل" },
  { en: "9+",   ar: "٩+",   labelEn: "Years of Experience",    labelAr: "سنوات خبرة" },
  { en: "100%", ar: "١٠٠٪", labelEn: "Satisfaction Rate",      labelAr: "نسبة رضا العملاء" },
  { en: "48h",  ar: "٤٨س",  labelEn: "Delivery Turnaround",    labelAr: "وقت التسليم" },
];

const PAIN_POINTS = [
  { en: "Overwhelmed by too many design choices with no clear direction?",      ar: "تشعر بالإرباك من كثرة خيارات التصميم دون توجيه واضح؟" },
  { en: "Received a quote that was way over your budget?",                      ar: "تلقيت عرض سعر يتجاوز ميزانيتك بكثير؟" },
  { en: "Project took months longer than promised?",                            ar: "استغرق المشروع أشهراً أطول مما وُعدت به؟" },
  { en: "Design didn't match what you envisioned in the beginning?",            ar: "التصميم لم يطابق ما تخيلته في البداية؟" },
  { en: "Contractors who disappear mid-project or lack professionalism?",       ar: "متعاقدون يختفون في منتصف المشروع أو يفتقرون للاحترافية؟" },
  { en: "No single point of contact — juggling suppliers, workers, and ideas?", ar: "لا يوجد مسؤول واحد — تتعامل مع موردين وعمال وأفكار متشعبة؟" },
];

const HOW_STEPS = [
  {
    n: "01",
    en: "Book a Free Consultation",
    ar: "احجز استشارة مجانية",
    descEn: "Speak with our design experts about your space, style, and budget. No commitment required.",
    descAr: "تحدث مع خبراء التصميم لدينا عن مساحتك وذوقك وميزانيتك. لا يلزمك أي التزام.",
  },
  {
    n: "02",
    en: "Get a Tailored Design Plan",
    ar: "احصل على خطة تصميم مخصصة",
    descEn: "We craft a detailed interior design proposal — mood boards, layouts, materials — tuned to your vision.",
    descAr: "نُعدّ مقترح تصميم داخلي مفصّل يشمل لوحات المزاج والتخطيطات والمواد بما يتناسب مع رؤيتك.",
  },
  {
    n: "03",
    en: "Watch Your Space Transform",
    ar: "شاهد مساحتك تتحوّل",
    descEn: "Our team handles every detail of execution — from sourcing to installation — while you relax.",
    descAr: "فريقنا يتولى كل تفاصيل التنفيذ — من التوريد حتى التركيب — وأنت مرتاح.",
  },
];

const AUDIENCES = [
  {
    emoji: "🏠",
    en: "Homeowners",
    ar: "أصحاب المنازل",
    descEn: "Turn your house into a beautiful, functional home — within budget and on schedule.",
    descAr: "حوّل منزلك إلى بيت جميل وعملي — ضمن الميزانية وفي الموعد.",
  },
  {
    emoji: "🏢",
    en: "Business Owners",
    ar: "أصحاب الأعمال",
    descEn: "Create a workspace or retail environment that reflects your brand and impresses clients.",
    descAr: "أنشئ بيئة عمل أو مساحة تجارية تعكس علامتك التجارية وتُبهر عملاءك.",
  },
  {
    emoji: "🏗️",
    en: "Developers & Investors",
    ar: "المطورون والمستثمرون",
    descEn: "Increase property value with professionally designed interiors that sell or rent faster.",
    descAr: "ارفع قيمة العقار بتصاميم داخلية احترافية تُباع أو تُؤجَّر بشكل أسرع.",
  },
  {
    emoji: "🎁",
    en: "Gift Givers",
    ar: "مقدمو الهدايا",
    descEn: "Give the most memorable gift — a design consultation package for someone you love.",
    descAr: "قدّم الهدية الأكثر تأثيراً — حزمة استشارة تصميم لشخص تهتم به.",
  },
];

const TESTIMONIALS = [
  {
    quote: { en: "Atlantis delivered exactly what they promised — on time and within budget. The result was beyond our expectations.", ar: "أتلانتس قدّم بالضبط ما وعد به — في الموعد وضمن الميزانية. النتيجة فاقت توقعاتنا." },
    author: "Ahmed Al-Rashidi",
    role: { en: "Villa Owner, Riyadh", ar: "مالك فيلا، الرياض" },
    stars: 5,
  },
  {
    quote: { en: "I was nervous about starting a renovation but the team made it so smooth. Highly recommend the consultation package.", ar: "كنت قلقاً من البدء بالتجديد لكن الفريق جعله سهلاً جداً. أوصي بشدة بحزمة الاستشارة." },
    author: "Noura Al-Hamdan",
    role: { en: "Apartment Owner, Jeddah", ar: "مالكة شقة، جدة" },
    stars: 5,
  },
  {
    quote: { en: "Professional, creative, and communicative throughout the whole project. My office looks stunning now.", ar: "محترفون ومبدعون وتواصلوا معي طوال المشروع. مكتبي يبدو رائعاً الآن." },
    author: "Khalid Al-Mutairi",
    role: { en: "Business Owner, Kuwait", ar: "صاحب عمل، الكويت" },
    stars: 5,
  },
  {
    quote: { en: "Finally a design company that listens! They transformed our living room in less than a month. Worth every riyal.", ar: "أخيراً شركة تصميم تستمع! حوّلت غرفة معيشتنا في أقل من شهر. تستحق كل ريال." },
    author: "Sara Al-Zahrani",
    role: { en: "Homeowner, Dammam", ar: "ربة منزل، الدمام" },
    stars: 5,
  },
];

const URGENCY_POINTS = [
  { en: "Offer valid for a limited number of clients only — first come, first served.",          ar: "العرض متاح لعدد محدود من العملاء فقط — الأول يُخدَّم أولاً." },
  { en: "Prices may increase as material and labour costs rise in the region.",                   ar: "قد ترتفع الأسعار مع زيادة تكاليف المواد والعمالة في المنطقة." },
  { en: "Securing your spot now locks in today's promotional rate.",                              ar: "حجز مكانك الآن يضمن لك سعر العرض الحالي." },
  { en: "Design consultations are booked weeks in advance — don't wait until it's too late.",    ar: "الاستشارات تُحجز أسابيع مقدماً — لا تنتظر حتى فوات الأوان." },
];

const FAQS = [
  {
    qEn: "How long does a typical interior design project take?",
    qAr: "كم يستغرق مشروع التصميم الداخلي النموذجي؟",
    aEn: "Timelines vary by scope. A single room can be completed in 2–4 weeks; full apartment or villa projects typically take 6–12 weeks. We give you a detailed schedule before we start.",
    aAr: "تختلف المدة حسب النطاق. يمكن إنجاز غرفة واحدة في أسبوعين إلى أربعة؛ وتستغرق مشاريع الشقق أو الفلل الكاملة عادةً من 6 إلى 12 أسبوعاً. نقدم جدولاً تفصيلياً قبل البدء.",
  },
  {
    qEn: "Do I need to have a minimum budget?",
    qAr: "هل أحتاج إلى حد أدنى للميزانية؟",
    aEn: "We work with a range of budgets and tailor our approach accordingly. The free consultation helps us understand what's achievable within your means.",
    aAr: "نتعامل مع مجموعة متنوعة من الميزانيات ونكيّف أسلوبنا وفقاً لذلك. الاستشارة المجانية تساعدنا على فهم ما يمكن تحقيقه ضمن إمكانياتك.",
  },
  {
    qEn: "Can I keep my existing furniture?",
    qAr: "هل يمكنني الاحتفاظ بأثاثي الحالي؟",
    aEn: "Absolutely. Our designers work around what you already have, incorporating your existing pieces into the new design wherever possible.",
    aAr: "بالتأكيد. يعمل مصممونا حول ما لديك بالفعل، ويدمجون قطعك الحالية في التصميم الجديد حيثما أمكن ذلك.",
  },
  {
    qEn: "What does the promotional package include exactly?",
    qAr: "ماذا تشمل الحزمة الترويجية بالضبط؟",
    aEn: "Each offer specifies what's included — typically: initial consultation, concept design, 3D visualization, materials sourcing, and on-site supervision. Check each promotion card for full details.",
    aAr: "تحدد كل عرض ما يتضمنه — وعادةً يشمل: الاستشارة الأولية، تصميم المفهوم، التخيل ثلاثي الأبعاد، توريد المواد، والإشراف الميداني. راجع كل بطاقة عرض للاطلاع على التفاصيل الكاملة.",
  },
  {
    qEn: "Is there a satisfaction guarantee?",
    qAr: "هل يوجد ضمان الرضا؟",
    aEn: "Yes. We offer a revision guarantee — if the final result doesn't match the agreed design, we fix it at no additional cost.",
    aAr: "نعم. نقدم ضمان المراجعة — إذا لم تطابق النتيجة النهائية التصميم المتفق عليه، نصلحها دون أي تكاليف إضافية.",
  },
];

/* ─── main component ──────────────────────────────────────────────── */
export default function PromotionsPage() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const offerRef = useRef(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(({ data }) => setPromotions(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const t = (en, ar) => (isRTL ? ar : en);
  const scrollToOffers = () => offerRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white">

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="bg-[#2D3247] text-white px-4 sm:px-8 md:px-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block text-xs uppercase tracking-widest font-semibold text-white/60 border border-white/20 rounded-full px-4 py-1.5">
            {t("Limited Time Offer", "عرض لفترة محدودة")}
          </span>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {t("Transform Your Space ", "حوّل مساحتك ")}
            <span className="text-[#C9A96E]">
              {t("Without Breaking the Bank", "دون إنهاك ميزانيتك")}
            </span>
          </h1>

          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t(
              "Premium interior design packages at exclusive promotional rates — crafted by Atlantis's expert team for homes and businesses across the GCC.",
              "حزم تصميم داخلي فاخرة بأسعار ترويجية حصرية — يصممها فريق أتلانتس المتخصص للمنازل والأعمال في دول الخليج."
            )}
          </p>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
            <TrendingUp size={16} className="text-[#C9A96E]" />
            <span className="text-sm font-semibold">
              {t("Save up to 40% on select packages", "وفر حتى ٤٠٪ على حزم مختارة")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToOffers}
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-8 py-3.5 rounded-xl transition"
            >
              {t("View Current Offers", "اعرض العروض الحالية")}
              <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
            </button>
            <Link
              href={`/${locale}/contact-us`}
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white/80 hover:text-white font-medium px-6 py-3.5 rounded-xl transition"
            >
              {t("Book Free Consultation", "احجز استشارة مجانية")}
            </Link>
          </div>

          <p className="text-white/40 text-xs">
            {t("* Limited spots available. No credit card required for consultation.", "* أماكن محدودة. لا تحتاج إلى بطاقة ائتمان للاستشارة.")}
          </p>
        </div>
      </section>

      {/* ── 2. STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EF] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.en} className="space-y-1">
              <div className="text-3xl font-bold text-[#2D3247]">{isRTL ? s.ar : s.en}</div>
              <div className="text-sm text-gray-500">{isRTL ? s.labelAr : s.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. PAIN POINTS ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
            {t("Sound familiar?", "هل هذا مألوف؟")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("Are You Experiencing This?", "هل تعاني من هذه المشكلات؟")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            {t(
              "Most homeowners and business owners face these challenges — but they don't have to.",
              "يواجه معظم أصحاب المنازل والأعمال هذه التحديات — لكن لا يجب أن يستمر الأمر هكذا."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAIN_POINTS.map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-gray-700 text-sm leading-relaxed">{isRTL ? p.ar : p.en}</p>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-[#2D3247] font-semibold">
          {t(
            "Atlantis solves every one of these — guaranteed.",
            "أتلانتس يحل كل هذه المشكلات — مع ضمان."
          )}
        </p>
      </section>

      {/* ── 4. OFFER CARDS (DB promotions) ───────────────────────────── */}
      <section ref={offerRef} className="bg-[#F5F3EF] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10">
          <div className="text-center mb-10 space-y-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
              {t("Promotional Packages", "الحزم الترويجية")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("Current Offers", "العروض الحالية")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              {t(
                "Exclusive packages available for a limited time — book now to lock in your rate.",
                "حزم حصرية متاحة لفترة محدودة — احجز الآن لتثبيت سعرك."
              )}
            </p>
          </div>

          {loading ? (
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
                {t("No active promotions right now.", "لا توجد عروض نشطة في الوقت الحالي.")}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t("Check back soon or contact us for a custom quote.", "تفقد مجدداً قريباً أو تواصل معنا للحصول على عرض مخصص.")}
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
                  <div
                    key={promo.id}
                    className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col ${expired ? "opacity-60" : ""}`}
                  >
                    {/* image */}
                    <div className="relative aspect-[16/9] bg-[#F5F3EF] overflow-hidden">
                      {promo.image ? (
                        <Image src={promo.image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Tag size={36} className="text-gray-200" />
                        </div>
                      )}
                      {badge && (
                        <span className="absolute top-3 start-3 bg-[#2D3247] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {badge}
                        </span>
                      )}
                      {expired && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            {t("Expired", "منتهي")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* body */}
                    <div className="p-5 flex flex-col flex-1 space-y-3">
                      <h3 className="font-bold text-gray-900 text-lg leading-snug">{title}</h3>
                      {desc && <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">{desc}</p>}

                      <div className="flex flex-wrap items-center gap-3">
                        {promo.couponCode && !expired && <CouponBadge code={promo.couponCode} />}
                        {promo.validUntil && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={11} />
                            {t("Valid until", "صالح حتى")}{" "}
                            {new Date(promo.validUntil).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {promo.link && !expired && (
                        <Link
                          href={promo.link}
                          className="inline-flex items-center gap-1.5 bg-[#2D3247] hover:bg-[#1e2231] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition mt-auto"
                        >
                          {t("Claim Offer", "احصل على العرض")}
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
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
            {t("Simple Process", "عملية بسيطة")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("How It Works", "كيف يعمل")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step) => (
            <div key={step.n} className="relative bg-white border border-gray-100 rounded-2xl p-7 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2D3247] text-white flex items-center justify-center font-bold text-lg mx-auto">
                {step.n}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{isRTL ? step.ar : step.en}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isRTL ? step.descAr : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. WHO IS IT FOR ─────────────────────────────────────────── */}
      <section className="bg-[#F5F3EF] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
              {t("Made For You", "مصنوع لك")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("Who Is This For?", "لمن هذا؟")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCES.map((a) => (
              <div key={a.en} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center space-y-3">
                <div className="text-4xl">{a.emoji}</div>
                <h3 className="font-bold text-gray-900">{isRTL ? a.ar : a.en}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{isRTL ? a.descAr : a.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
            {t("Client Stories", "قصص العملاء")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("What Our Clients Say", "ماذا يقول عملاؤنا")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex gap-0.5">
                {[...Array(t_.stars)].map((_, s) => (
                  <Star key={s} size={14} className="fill-[#C9A96E] text-[#C9A96E]" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{isRTL ? t_.quote.ar : t_.quote.en}"
              </p>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t_.author}</p>
                <p className="text-gray-400 text-xs">{isRTL ? t_.role.ar : t_.role.en}</p>
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
            <h3 className="font-bold text-amber-900 text-base">
              {t("Why Act Now?", "لماذا تتصرف الآن؟")}
            </h3>
            <ul className="space-y-2">
              {URGENCY_POINTS.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <Zap size={14} className="shrink-0 mt-0.5 text-amber-500" />
                  {isRTL ? p.ar : p.en}
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
            <h3 className="font-bold text-lg mb-1">{t("Our Guarantee", "ضماننا")}</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl">
              {t(
                "If the final design doesn't match what was agreed upon, we revise it at no extra cost. Your satisfaction is our only measure of success — we don't consider a project complete until you love the result.",
                "إذا لم يتطابق التصميم النهائي مع ما تم الاتفاق عليه، نراجعه دون أي تكلفة إضافية. رضاك هو مقياسنا الوحيد للنجاح — لا نعتبر المشروع مكتملاً حتى تُحب النتيجة."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ──────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 md:px-10 py-16 md:py-20">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#C9A96E]">
            {t("FAQ", "الأسئلة الشائعة")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("Frequently Asked Questions", "الأسئلة المتكررة")}
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <FAQItem
              key={i}
              q={isRTL ? f.qAr : f.qEn}
              a={isRTL ? f.aAr : f.aEn}
            />
          ))}
        </div>
      </section>

      {/* ── 11. FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-[#2D3247] text-white py-16 md:py-20 px-4 sm:px-8 md:px-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2">
            <Clock size={14} className="text-[#C9A96E]" />
            <span className="text-sm font-semibold text-white/80">
              {t("Limited-time promotional rate", "سعر ترويجي لفترة محدودة")}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            {t("Ready to Transform Your Space?", "مستعد لتحويل مساحتك؟")}
          </h2>

          <p className="text-white/70 max-w-xl mx-auto text-base">
            {t(
              "Join hundreds of satisfied clients across the GCC. Claim your promotional package today before spots run out.",
              "انضم إلى مئات العملاء الراضين في دول الخليج. احصل على حزمتك الترويجية اليوم قبل نفاد الأماكن."
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToOffers}
              className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#b8955c] text-white font-semibold px-8 py-3.5 rounded-xl transition"
            >
              {t("View Offers", "اعرض العروض")}
              <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
            </button>
            <Link
              href={`/${locale}/contact-us`}
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white/80 hover:text-white font-medium px-6 py-3.5 rounded-xl transition"
            >
              {t("Talk to a Designer", "تحدث مع مصمم")}
            </Link>
          </div>

          <p className="text-white/40 text-xs">
            {t("* No commitment required for the free consultation.", "* الاستشارة المجانية لا تلزمك بأي شيء.")}
          </p>
        </div>
      </section>

    </div>
  );
}
