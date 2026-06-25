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

  const style = doc.createElement("style");
  style.textContent = `
    .entity-section { display: none !important; }
    .entity-section.active-section { display: block !important; }
  `;

  const script = doc.createElement("script");
  script.type = "text/javascript";
  script.text = `
    (() => {
      var first = document.querySelector('.entity-section');
      if (first) first.classList.add('active-section');

      document.addEventListener('click', function(e) {
        var link = e.target;
        while (link && link.tagName !== 'A') link = link.parentElement;
        if (!link) return;
        var href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          e.preventDefault();
          document.querySelectorAll('.entity-section').forEach(function(s) {
            s.classList.remove('active-section');
          });
          var target = document.getElementById(href.substring(1));
          if (target) target.classList.add('active-section');
          document.querySelectorAll('.sidebar a').forEach(function(a) {
            a.classList.toggle('active', a.getAttribute('href') === href);
          });
        }
      }, true);
    })();
  `;

  doc.head.appendChild(style);
  doc.body.appendChild(script);
  doc.head.appendChild(base);
  return doc.documentElement.outerHTML;
};
