"use client";

import Navbar from "@/components/navbar";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">{t("terms.title")}</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-4">{t("terms.updated")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("terms.section1_title")}</h2>
          <p className="mb-4">{t("terms.section1_desc")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("terms.section2_title")}</h2>
          <p className="mb-4">{t("terms.section2_desc")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("terms.section3_title")}</h2>
          <p className="mb-4">{t("terms.section3_desc")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">{t("terms.section4_title")}</h2>
          <p className="mb-4">{t("terms.contact_desc")}</p>
          <div className="flex items-center gap-3">
            <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {t("terms.contact_btn")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
