export interface DiffResponse {
  readonly html: string;
}

export const removeElementFromHtml = (htmlString: string, selector: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  doc.querySelector(selector)?.remove();
  return doc.documentElement.outerHTML;
};

export const injectIframeResizeScript = (htmlString: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const base = doc.createElement("base");
  base.target = "_blank";

  const script = doc.createElement("script");
  script.type = "text/javascript";
  script.text = `
    (() => {
      const sendHeight = () => {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage({ type: 'setHeight', height: height + 5 }, '*');
      };
      window.addEventListener('load', sendHeight);
      const observer = new ResizeObserver(sendHeight);
      observer.observe(document.body);
      window.addEventListener('unload', () => observer.disconnect());

      document.addEventListener('click', function(e) {
        var link = e.target;
        while (link && link.tagName !== 'A') link = link.parentElement;
        if (!link) return;
        var href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          e.preventDefault();
          var el = document.getElementById(href.substring(1));
          if (el) {
            window.parent.postMessage({ type: 'scrollToOffset', offset: el.offsetTop }, '*');
          }
        }
      }, true);
    })();
  `;

  doc.body.appendChild(script);
  doc.head.appendChild(base);
  return doc.documentElement.outerHTML;
};
