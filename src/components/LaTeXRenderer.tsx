import { useEffect, useRef } from 'react';

interface LaTeXRendererProps {
  content: string;
}

// Load MathJax configuration and script globally if not already present
if (typeof window !== 'undefined' && !(window as any).mathJaxConfigured) {
  if (!(window as any).MathJax && !document.querySelector('script[src*="mathjax"]')) {
    (window as any).MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    document.head.appendChild(script);
  }
  (window as any).mathJaxConfigured = true;
}

export function LaTeXRenderer({ content }: LaTeXRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const typesetContent = async () => {
      const MathJax = (window as any).MathJax;
      
      if (MathJax && MathJax.typesetPromise && containerRef.current) {
        try {
          // Clear any previous rendering
          if (MathJax.typesetClear) {
            MathJax.typesetClear([containerRef.current]);
          }
          
          // Typeset the new content
          await MathJax.typesetPromise([containerRef.current]);
        } catch (err) {
          console.error('MathJax rendering error:', err);
        }
      }
    };

    // Wait for MathJax to load if it hasn't yet
    const checkAndRender = () => {
      const MathJax = (window as any).MathJax;
      if (MathJax && MathJax.typesetPromise) {
        typesetContent();
      } else {
        // Retry after a short delay
        setTimeout(checkAndRender, 100);
      }
    };

    checkAndRender();
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className="latex-content text-gray-800 leading-relaxed"
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {content}
    </div>
  );
}
