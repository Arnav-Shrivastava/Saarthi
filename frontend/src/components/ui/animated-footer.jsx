import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Github, Shield } from 'lucide-react';

const AnimatedFooter = ({
  barCount = 23,
  onStart,
  onNavigate,
}) => {
  const waveRefs = useRef([]);
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  useEffect(() => {
    let t = 0;
    const animateWave = () => {
      const waveElements = waveRefs.current;
      let offset = 0;
      waveElements.forEach((element, index) => {
        if (element) {
          offset += Math.max(0, 20 * Math.sin((t + index) * 0.3));
          element.style.transform = `translateY(${index + offset}px)`;
        }
      });
      t += 0.1;
      animationFrameRef.current = requestAnimationFrame(animateWave);
    };
    if (isVisible) {
      animateWave();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible]);

  const linkGroups = [
    {
      title: 'Product',
      links: [
        { label: 'Voice Helpline', href: '#' },
        { label: 'WhatsApp Bot', href: '#' },
        { label: 'Document AI', href: '#' },
        { label: 'Scheme Finder', href: '#' },
      ],
    },
    {
      title: 'Languages',
      links: [
        { label: 'Hindi', href: '#' },
        { label: 'Tamil', href: '#' },
        { label: 'Telugu', href: '#' },
        { label: 'Bengali', href: '#' },
        { label: '+ 6 more', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'How It Works', href: null, view: 'how-it-works' },
        { label: 'API Docs', href: '#' },
        { label: 'Privacy Policy', href: null, view: 'privacy' },
        { label: 'Terms of Service', href: '#' },
      ],
    },
  ];



  return (
    <footer
      ref={footerRef}
      className="bg-[#0a0a0f] text-white relative flex flex-col w-full justify-between select-none"
    >
      {/* Radial glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center top, rgba(255,153,51,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl w-full px-6 pt-16 pb-10">
        {/* Brand */}
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF9933] to-[#E8601C] shadow-lg shadow-[#FF9933]/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Saarthi</span>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-lg">
            Multilingual AI assistant for Indian citizens. Simplifying government schemes, legal documents, and citizen rights — in every language.
          </p>
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Shield className="h-3 w-3" />
            <span>Privacy First · No data stored</span>
          </div>
        </div>

        {/* Dotted separator */}
        <div className="border-t border-dotted border-white/[0.08] mb-10" />

        {/* Link Groups Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {linkGroups.map((group, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link, j) => (
                  <li key={j}>
                    {link.view ? (
                      <button
                        onClick={() => onNavigate?.(link.view)}
                        className="text-sm text-white/40 hover:text-white/80 transition-colors bg-transparent border-0 cursor-pointer p-0"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Built With
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="https://openai.com/api" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors">
                  gpt-5.4-nano
                </a>
              </li>
              <li>
                <a href="https://python.langchain.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors">
                  RAG Pipeline
                </a>
              </li>
              <li>
                <a href="https://openai.com/research/whisper" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors">
                  Whisper ASR
                </a>
              </li>
              <li>
                <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors">
                  Twilio IVR
                </a>
              </li>
            </ul>
          </div>

          {/* Social — GitHub profiles */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Social
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/kunal12krishna"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dotted border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all">
                  <Github className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
                <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors">Kunal Krishna</span>
              </a>
              <a
                href="https://github.com/Arnav-Shrivastava"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dotted border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all">
                  <Github className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
                <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors">Arnav Shrivastava</span>
              </a>
            </div>
          </div>

          {/* CTA column */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Get Started
            </h4>
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#FF9933] hover:text-[#FFB366] transition-colors cursor-pointer bg-transparent border-0"
            >
              Try Saarthi Free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Dotted separator */}
        <div className="border-t border-dotted border-white/[0.08] mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <p>
            © {new Date().getFullYear()} Saarthi · Built for LinguaVerse
          </p>
          <p className="flex items-center gap-1">
            Made with <span className="text-red-400 animate-pulse">♥</span> by{' '}
            <span className="text-white/50 font-medium">Arnav Shrivastava & Kunal Krishna</span>
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            Back to top ↑
          </button>
        </div>
      </div>

      {/* Wave bars animation — KEPT */}
      <div aria-hidden="true" style={{ overflow: "hidden", height: 200 }}>
        <div style={{ marginTop: 0 }}>
          {Array.from({ length: barCount }).map((_, index) => (
            <div
              key={index}
              ref={(el) => { waveRefs.current[index] = el; }}
              style={{
                height: `${index + 1}px`,
                backgroundColor: "rgb(255, 255, 255)",
                transition: "transform 0.1s ease",
                willChange: "transform",
                marginTop: "-2px",
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default AnimatedFooter;
