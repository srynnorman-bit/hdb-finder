import React, { useState } from 'react';

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
  const [iframeKey, setIframeKey] = useState<number>(0);
  const canonicalUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/#${identifier}` : `https://hdbfinder.local/#${identifier}`);
  const directDisqusUrl = `https://sn260827-1.disqus.com/?url=${encodeURIComponent(canonicalUrl)}`;

  // Safe HTML template for Disqus embedded inside an isolated iframe
  const disqusHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 8px 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: transparent;
      color: #091c35;
    }
    #disqus_thread { width: 100%; min-height: 280px; }
  </style>
  <script>
    window.onerror = function() { return true; };
    window.addEventListener('error', function(e) {
      e.stopImmediatePropagation && e.stopImmediatePropagation();
      e.preventDefault && e.preventDefault();
      return true;
    }, true);
    window.addEventListener('unhandledrejection', function(e) {
      e.stopImmediatePropagation && e.stopImmediatePropagation();
      e.preventDefault && e.preventDefault();
      return true;
    }, true);
  </script>
</head>
<body>
  <div id="disqus_thread"></div>
  <script>
    var disqus_config = function () {
      this.page.url = "${canonicalUrl}";
      this.page.identifier = "${identifier}";
      this.page.title = ${JSON.stringify(title)};
    };
    (function() {
      try {
        var d = document, s = d.createElement('script');
        s.src = 'https://sn260827-1.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        s.crossOrigin = 'anonymous';
        s.onerror = function() {
          var el = document.getElementById('disqus_thread');
          if (el) {
            el.innerHTML = '<div style="padding:16px;background:#f0f3ff;border-radius:12px;font-size:13px;color:#434654;">' +
              '<strong>Connecting to Disqus Forum...</strong><br>If comments do not appear, you can participate directly via the button above.' +
              '</div>';
          }
        };
        (d.head || d.body).appendChild(s);
      } catch(e) {}
    })();
  </script>
</body>
</html>`;

  return (
    <div className="bg-white rounded-2xl border border-[#e7eeff] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
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

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[#434654] hover:bg-[#f0f3ff] transition-colors border border-[#e7eeff]"
            title="Reload thread"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            Reload
          </button>
          <a
            href={directDisqusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f0f3ff] text-[#003d9b] border border-[#cadbfc] hover:bg-[#dfe8ff] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Disqus Live
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Target Container for Isolated Disqus iframe */}
      <div className="w-full min-h-[360px] rounded-xl overflow-hidden bg-transparent">
        <iframe
          key={`${identifier}-${iframeKey}`}
          srcDoc={disqusHtml}
          title={`Disqus Discussion - ${title}`}
          className="w-full h-[480px] sm:h-[540px] border-0 rounded-xl bg-transparent"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
};


