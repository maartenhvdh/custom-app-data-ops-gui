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
      document.addEventListener('click', function(e) {
        var link = e.target;
        while (link && link.tagName !== 'A') link = link.parentElement;
        if (!link) return;
        var href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          e.preventDefault();
          var id = href.substring(1);
          var el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          document.querySelectorAll('.sidebar a').forEach(function(a) {
            a.classList.toggle('active', a.getAttribute('href') === href);
          });
        }
      }, true);
    })();
  `;

  doc.body.appendChild(script);
  doc.head.appendChild(base);
  return doc.documentElement.outerHTML;
};
