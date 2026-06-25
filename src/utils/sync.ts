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

      document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || !href.startsWith('#')) {
          a.target = '_blank';
        }
      });
    })();
  `;

  doc.body.appendChild(script);
  return doc.documentElement.outerHTML;
};
