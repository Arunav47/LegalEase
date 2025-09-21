"use client";

import {
  TextParallaxContent,
  ExampleContent
} from "@/app/ui/components";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useRouter } from "next/navigation";

export default function FeaturesPage() {
  const { isAuthenticated } = useAuthGuard('public');
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
        subheading="Gemini-Powered Analysis"
        heading="Transform Complex Legal Documents with Google's Advanced AI"
      >
        <div id="gemini-analysis-section" className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
            Gemini Intelligence at Work
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
              Powered by Google&apos;s Gemini AI and Vertex AI Document Processing, LegalEase automatically extracts key clauses, identifies risks, and highlights critical provisions. Experience the power of Google&apos;s most advanced language model.
            </p>
            <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
              Get instant summaries, risk assessments, and actionable insights using Google Vertex AI&apos;s Document AI, AutoML, and Translation API for multilingual support.
            </p>
            <button
              onClick={handleCTAClick}
              className="w-full rounded bg-gradient-to-r from-blue-600 to-purple-600 px-9 py-4 text-xl text-white transition-all hover:from-blue-700 hover:to-purple-700 md:w-fit shadow-lg hover:shadow-xl"
            >
              Try Gemini Analysis
            </button>
          </div>
        </div>
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Gemini's Multimodal Power"
        heading="Voice, Visual, and Interactive AI Experiences"
      >
        <div id="voice-features-section" className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
            Google Text-to-Speech & Conversational AI
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
              Convert document summaries into natural-sounding audio using Google Cloud Text-to-Speech API with WaveNet voices. Perfect for reviewing documents while commuting or multitasking.
            </p>
            <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
              Ask questions about your documents using Gemini&apos;s conversational AI with Vertex AI Search integration. Get instant answers about clauses, obligations, dates, and legal implications.
            </p>
            <button
              onClick={handleCTAClick}
              className="w-full rounded bg-gradient-to-r from-green-600 to-emerald-600 px-9 py-4 text-xl text-white transition-all hover:from-green-700 hover:to-emerald-700 md:w-fit shadow-lg hover:shadow-xl"
            >
              Experience Gemini Voice
            </button>
          </div>
        </div>
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1488229297570-58520851e868?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Google Vertex AI Ecosystem"
        heading="Global Legal Intelligence Powered by Google Cloud"
      >
        <div id="global-features-section" className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
          <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
            Vertex AI Translation & Vision
          </h2>
          <div className="col-span-1 md:col-span-8">
            <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
              Process documents in 100+ languages using Google Cloud Translation API and Vertex AI&apos;s multilingual capabilities. From English contracts to international agreements, Gemini understands legal documents across all languages.
            </p>
            <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
              Vertex AI AutoML creates custom visual models for document layout analysis, generating interactive mind maps, timeline views, and relationship charts powered by Google&apos;s computer vision.
            </p>
            <button
              onClick={handleCTAClick}
              className="w-full rounded bg-gradient-to-r from-purple-600 to-pink-600 px-9 py-4 text-xl text-white transition-all hover:from-purple-700 hover:to-pink-700 md:w-fit shadow-lg hover:shadow-xl"
            >
              Explore Vertex AI
            </button>
          </div>
        </div>
      </TextParallaxContent>
    </div>
  );
}
