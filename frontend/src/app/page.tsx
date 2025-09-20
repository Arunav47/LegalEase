"use client";

import {
  TextParallaxContent,
  ExampleContent
} from "@/app/ui/components";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useRouter } from "next/navigation";

export default function FeaturesPage() {
  const { isAuthenticated } = useAuthGuard(false);
  const router = useRouter();

  const handleCTAClick = () => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="bg-white">
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="AI-Powered Analysis"
        heading="Transform Complex Legal Documents into Clear Insights"
      >
        <div id="ai-analysis-section" className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
            Intelligent Document Processing
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
              Our advanced AI algorithms automatically analyze legal documents, extracting key clauses, identifying risks, and highlighting critical provisions. No more hours spent deciphering complex legal language.
            </p>
            <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
              Get instant summaries, risk assessments, and actionable insights for contracts, NDAs, employment agreements, and more.
            </p>
            <button
              onClick={handleCTAClick}
              className="w-full rounded bg-gradient-to-r from-blue-600 to-purple-600 px-9 py-4 text-xl text-white transition-all hover:from-blue-700 hover:to-purple-700 md:w-fit shadow-lg hover:shadow-xl"
            >
              Try AI Analysis
            </button>
          </div>
        </div>
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Voice & Interactive Features"
        heading="Listen, Learn, and Ask Questions"
      >
        <div id="voice-features-section" className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
            Multimodal AI Experience
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
              Convert any document summary into natural-sounding audio with our text-to-speech feature. Perfect for reviewing documents while commuting or multitasking.
            </p>
            <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
              Ask questions about your documents using our RAG-powered chatbot. Get instant answers about clauses, obligations, dates, and legal implications.
            </p>
            <button
              onClick={handleCTAClick}
              className="w-full rounded bg-gradient-to-r from-green-600 to-emerald-600 px-9 py-4 text-xl text-white transition-all hover:from-green-700 hover:to-emerald-700 md:w-fit shadow-lg hover:shadow-xl"
            >
              Experience Voice AI
            </button>
          </div>
        </div>
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1488229297570-58520851e868?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Global & Accessible"
        heading="Legal Understanding Without Barriers"
      >
        <div id="global-features-section" className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
            Universal Legal Comprehension
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
              Process documents in multiple languages with our multilingual AI models. From English contracts to international agreements, understand legal documents regardless of language barriers.
            </p>
            <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
              Visual mind maps, timeline views, and interactive charts make complex legal relationships clear and actionable for everyone.
            </p>
            <button
              onClick={handleCTAClick}
              className="w-full rounded bg-gradient-to-r from-purple-600 to-pink-600 px-9 py-4 text-xl text-white transition-all hover:from-purple-700 hover:to-pink-700 md:w-fit shadow-lg hover:shadow-xl"
            >
              Explore Global Features
            </button>
          </div>
        </div>
      </TextParallaxContent>
    </div>
  );
}
