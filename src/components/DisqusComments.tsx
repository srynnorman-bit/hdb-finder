import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: { reload: boolean; config?: () => void }) => void;
    };
    disqus_config?: () => void;
  }
}

interface DisqusCommentsProps {
  identifier: string;
  title: string;
  url?: string;
  categoryName?: string;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  identifier,
  title,
  url,
  categoryName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const canonicalUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/#${identifier}` : '');

  useEffect(() => {
    setLoadError(false);

    try {
      // Define the Disqus configuration
      const disqusConfig = function (this: { page: { url: string; identifier: string; title: string } }) {
        this.page.url = canonicalUrl;
        this.page.identifier = identifier;
        this.page.title = title;
      };

      window.disqus_config = disqusConfig;

      // If Disqus script is already loaded on the page, trigger reset with new thread config
      if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
        try {
          window.DISQUS.reset({
            reload: true,
            config: disqusConfig,
          });
        } catch {
          // Ignored if reset fails silently
        }
      } else {
        // Inject Disqus Embed script
        const scriptId = 'disqus-embed-script';
        let s = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!s) {
          s = document.createElement('script');
          s.id = scriptId;
          s.src = 'https://sn260827-1.disqus.com/embed.js';
          s.setAttribute('data-timestamp', String(+new Date()));
          s.async = true;
          s.onerror = () => {
            setLoadError(true);
          };
          (document.head || document.body).appendChild(s);
        }
      }
    } catch {
      setLoadError(true);
    }
  }, [identifier, title, canonicalUrl]);

  return (
    <div className="bg-white rounded-2xl border border-[#e7eeff] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e7eeff] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#003d9b]/10 text-[#003d9b] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">forum</span>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#091c35] leading-tight">
              Community Discussion
            </h3>
            <p className="text-[12px] text-[#434654]">
              {categoryName ? `Topic: ${categoryName}` : 'Share reviews, tips & ask questions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f0f3ff] text-[#003d9b] border border-[#cadbfc]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Powered by Disqus
          </span>
        </div>
      </div>

      {/* Target Container for Disqus */}
      <div ref={containerRef} className="min-h-[240px] pt-1">
        <div id="disqus_thread" className="w-full" />
        {loadError && (
          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#cadbfc] text-[#434654] text-[13px] flex flex-col gap-2">
            <p className="font-semibold text-[#091c35]">Connecting to Disqus...</p>
            <p>If comments do not load, please ensure third-party content is allowed in your browser.</p>
          </div>
        )}
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" target="_blank" rel="noopener noreferrer" className="text-[#003d9b] underline">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </div>
  );
};

