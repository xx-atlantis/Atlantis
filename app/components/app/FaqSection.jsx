"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0); // Default open first FAQ

  const faqs = [
    {
      question: "What design services do you offer ?",
      answer: (
        <>
          <p className="mb-2">
            We can offer a wide range of design services, including:
          </p>
          <ol className="list-decimal list-inside space-y-1 mb-3">
            <li>
              <b>Space Planning:</b> This includes creating an effective space
              layout, taking into account customer requirements and available
              space.
            </li>
            <li>
              <b>Concept Development:</b> Working with the client to develop a
              design concept that suits their style, needs, and budget.
            </li>
            <li>
              <b>3D Shots:</b> Creating visual renderings of the design concept.
            </li>
            <li>
              <b>Virtual Reality Simulation (VR):</b> Allows you to enter your
              design and experience it as if it were already built — helping you
              make necessary changes before starting construction.
            </li>
            <li>
              <b>Shop Drawings:</b> Preparation of detailed technical drawings
              showing exact dimensions, materials, and construction details of
              the design concept.
            </li>
          </ol>
          <p>
            <b>Bill of Quantities (BOQ):</b> Preparing a detailed list of all
            materials, labor, and other costs involved in the project.
          </p>
        </>
      ),
    },
    {
      question: "Who are the team I can rely on with this project ?",
      answer:
        "Our team consists of professional interior designers, architects, and 3D visualization experts with years of experience in residential and commercial design projects.",
    },
    {
      question: "When will we work on my project?",
      answer:
        "We start your project immediately after confirmation of details and payment. Our team will stay in touch to share updates throughout the process.",
    },
    {
      question:
        "How long will it take to complete my project? What if I'm in a hurry?",
      answer:
        "Project duration depends on size and complexity. Typically, small projects take 2–4 weeks, while larger ones may take longer. For urgent cases, we offer fast-track design services with dedicated resources.",
    },
  ];

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-8 md:px-16 flex flex-col items-center">
      {/* ===== Heading ===== */}
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-[#5E7E7D] mb-2">FAQ</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
          Let us Help you
        </h2>
      </div>

      {/* ===== FAQ Container ===== */}
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-sm overflow-hidden">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left px-5 sm:px-8 py-4 sm:py-5 text-gray-900 font-medium focus:outline-none"
            >
              <span>{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="text-gray-500" size={20} />
              ) : (
                <ChevronDown className="text-gray-500" size={20} />
              )}
            </button>

            {/* ===== FAQ Answer ===== */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className="px-5 sm:px-8 py-4 bg-[#6D94942B] text-gray-700 text-sm sm:text-base leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
