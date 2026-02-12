"use client";
import { useEffect, useState } from "react";
import { Home, FileText, Calculator, ShieldCheck, ArrowRight, CheckCircle2, LayoutGrid, SaudiRiyal } from "lucide-react";
import PackagesSection from "@/app/components/app/SelectPackage";
import { useLocale } from "@/app/components/LocaleProvider";
import { useVerifyCustomer } from "@/app/hooks/useVerifyCustomer";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderSummary() {
  const router = useRouter();
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [projectData, setProjectData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  const { loading: verifying, refresh } = useVerifyCustomer();

  useEffect(() => {
    const stored = localStorage.getItem("startProjectData");
    if (stored) setProjectData(JSON.parse(stored));
  }, []);

  if (!projectData?.form) return <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">Loading Project Details...</div>;

  const { type, form, hasAdditionalFee, additionalFeeAmount } = projectData;
  
  const packagePrice = selectedPackage ? parseFloat(String(selectedPackage.price).replace(/[^0-9.]/g, '')) : 0;
  const extraFee = hasAdditionalFee ? parseFloat(additionalFeeAmount || 199) : 0;
  const grandTotal = packagePrice + extraFee;

  const selections = Object.entries(form)
    .filter(([key]) => key.startsWith("step_") || key.startsWith("final_"))
    .map(([key, data]) => ({ key, data }))
    .sort((a, b) => {
      const extractNum = (str) => parseInt(str.split('_')[1]);
      if (a.key.startsWith('step') && b.key.startsWith('final')) return -1;
      if (a.key.startsWith('final') && b.key.startsWith('step')) return 1;
      return extractNum(a.key) - extractNum(b.key);
    });

  const handleCheckout = async () => {
    // 1. Validation check
    if (!selectedPackage) {
      toast.warn(isRTL ? "الرجاء اختيار باقة أولاً" : "Please select a package first", {
        position: isRTL ? "bottom-center" : "bottom-center",
      });
      return;
    }

    // 2. Prepare cart data
    const feeEntry = Object.values(form).find(item => item.cardName === "no");
    
    // Determine the type image (Villa, Apartment, etc.) from the selections or fallback
    const typeImage = selections.find(s => s.data.cardImageUrl)?.data.cardImageUrl || "/images/placeholder-pkg.jpg";

    const cartData = {
      cartType: "package",
      // Save EVERYTHING from selectedPackage + the specific type image
      package: {
        ...selectedPackage,
        image: typeImage, 
        price: packagePrice,
        displayPrice: selectedPackage.price // keep original for display if needed
      },
      steps: form,
      extraFee,
      totalPrice: grandTotal,
      feeReason: feeEntry?.cardDescription || (isRTL ? "رسوم إضافية" : "Service fee"),
      propertyType: type
    };
    
    localStorage.setItem("cart", JSON.stringify(cartData));

    // 3. Verification and Conditional Redirect
    const verifyAndRedirect = async () => {
      await refresh();
      const res = await fetch("/api/customer-token");
      const authData = await res.json();
      
      if (authData.success && authData.token) {
        router.push(`/${locale}/checkout`);
        return authData;
      } else {
        const currentPath = window.location.pathname;
        router.push(`/${locale}/login?redirect=${encodeURIComponent(currentPath)}`);
        throw new Error("Unauthorized");
      }
    };

    toast.promise(
      verifyAndRedirect(),
      {
        pending: isRTL ? "جاري التحقق..." : "Verifying session...",
        success: isRTL ? "تم التحقق!" : "Verified!",
        error: isRTL ? "يجب تسجيل الدخول للمتابعة" : "Please login to continue"
      },
      { position: isRTL ? "bottom-center" : "bottom-center" }
    );
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="min-h-screen py-16 bg-[#F8F9FB] text-[#1D1D1F]">
      <ToastContainer rtl={isRTL} />
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-primary-theme font-bold tracking-[0.2em] text-xs uppercase mb-2 block">Configuration Summary</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{isRTL ? "مراجعة مشروعك" : "Review Design"}</h1>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-gray-500">{isRTL ? "تم حفظ التفضيلات" : "Preferences Saved"}</p>
          </div>
        </div>

        <PackagesSection onSelectPackage={setSelectedPackage} projectType={type}/>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-primary-theme transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-primary-theme/10 transition-colors">
                    <Home className="text-gray-400 group-hover:text-primary-theme" size={24}/>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isRTL ? "نوع العقار" : "Property Type"}</p>
                </div>
                <p className="text-3xl font-bold capitalize">{type}</p>
              </div>

              {form.uploadedPlan?.value && (
                <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                    <img src={form.uploadedPlan.value} className="w-full h-32 object-cover rounded-[1.5rem] brightness-90 group-hover:scale-105 transition-transform duration-700" alt="Floor Plan" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <p className="text-white font-bold text-sm">View Floor Plan</p>
                    </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <LayoutGrid className="text-primary-theme" size={28}/> {isRTL ? "تفاصيل التصميم" : "Design Details"}
                </h2>
                <span className="text-xs font-bold text-gray-400">{selections.length} {isRTL ? "اختيارات" : "Parameters"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {selections.map(({ key, data }) => {
                  const isMulti = Array.isArray(data.selections);
                  const displayTitle = isMulti 
                    ? data.selections.map(s => s.cardTitle).join(", ")
                    : (data.cardTitle || data.label || data.value);
                  
                  const displayImage = isMulti 
                    ? data.selections[0]?.cardImageUrl 
                    : data.cardImageUrl;

                  return (
                    <div key={key} className="group relative flex gap-5">
                      {displayImage && (
                        <div className="relative shrink-0">
                          <img src={displayImage} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:rotate-3 transition-transform" alt={displayTitle} />
                          <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">
                          {data.question || "Space Selection"}
                        </p>
                        <p className="font-bold text-[#1D1D1F] text-lg">
                          {displayTitle}
                        </p>
                        {data.cardDescription2 && !isMulti && (
                          <p className="text-[11px] text-amber-600 font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded-md inline-block w-fit italic">
                            {data.cardDescription2}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-10 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Calculator className="text-primary-theme" size={20}/>
                  <h3 className="font-bold text-lg uppercase tracking-tight">{isRTL ? "الملخص" : "Checkout"}</h3>
                </div>
                <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400">SAR / NET</div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Design Package</span>
                  <span className="font-bold text-gray-900">{packagePrice.toLocaleString()}</span>
                </div>
                
                {hasAdditionalFee && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-600 font-medium flex items-center gap-1 italic">
                      Service Surcharge
                    </span>
                    <span className="font-bold text-amber-600">+{extraFee}</span>
                  </div>
                )}

                <div className="h-px bg-gray-100 my-4" />

                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold uppercase tracking-tighter text-gray-400 mb-1">{isRTL ? "الإجمالي" : "Grand Total"}</span>
                  <div className="text-right flex items-center gap-1">
                    <p className="text-5xl font-[1000] tracking-tighter text-primary-theme leading-none">
                      {grandTotal.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1"><SaudiRiyal/></span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={verifying}
                className="group w-full bg-[#2D3247] hover:bg-primary-theme text-white py-6 rounded-[1.5rem] font-bold text-lg transition-all duration-500 flex items-center justify-center gap-3 shadow-xl hover:shadow-primary-theme/20 active:scale-95 disabled:opacity-50"
              >
                <span>{verifying ? (isRTL ? "جاري..." : "Verifying...") : (isRTL ? "الشروع في الخروج" : "Proceed to Checkout")}</span>
                <ArrowRight size={22} className={`transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`}/>
              </button>

              <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <ShieldCheck className="text-green-500" size={16}/> 
                  {isRTL ? "دفع آمن" : "Secure"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}