"use client";

import Navbar from "@/components/navbar";
import { useTranslation } from "react-i18next";

export default function RefundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">{t("refund.title")}</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-4">{t("refund.updated")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("refund.section1_title")}</h2>
          <p className="mb-4">{t("refund.section1_desc")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("refund.section2_title")}</h2>
          <p className="mb-4">{t("refund.section2_desc")}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t("refund.condition1")}</li>
            <li>{t("refund.condition2")}</li>
            <li>{t("refund.condition3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("refund.section3_title")}</h2>
          <p className="mb-4">{t("refund.section3_desc")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("refund.section4_title")}</h2>
          <p className="mb-4">{t("refund.section4_desc")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("refund.section5_title")}</h2>
          <p className="mb-4">{t("refund.contact_desc")}</p>
          <div className="flex items-center gap-3">
            <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {t("refund.contact_btn")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
