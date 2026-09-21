/* ============================================================
   ELEVENTY CONFIGURATION
   This file runs once, at build time, on your computer or on
   Vercel — never in the visitor's browser.

   Its three jobs:
     1. copy css / js / images / admin through untouched
     2. define filters (small helpers usable inside templates)
     3. define collections (groups of content files)

   Deliberately zero npm dependencies beyond Eleventy itself.
   Every extra package is another thing that can break during
   a build six months from now.
   ============================================================ */

module.exports = function (eleventyConfig) {

  /* ---------- 1. PASSTHROUGH ---------------------------------
     Eleventy only processes templates. Anything else has to be
     explicitly copied into the output folder.
     ----------------------------------------------------------- */

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");

  // Rebuild the browser view when CSS changes, without a full reload.
  eleventyConfig.setServerOptions({ domdiff: false });
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");


  /* ---------- 2. DATES ---------------------------------------
     Written by hand rather than using Intl, because Intl output
     depends on which locale data the build machine happens to
     ship. Hardcoding removes that variable entirely.
     ----------------------------------------------------------- */

  const MESECI = [
    "јануар", "фебруар", "март", "април", "мај", "јун",
    "јул", "август", "септембар", "октобар", "новембар", "децембар"
  ];

  // 18. јул 2026.
  eleventyConfig.addFilter("datumSrp", function (value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.getDate() + ". " + MESECI[d.getMonth()] + " " + d.getFullYear() + ".";
  });

  // 18. јул 2026. у 18:00  — only appends the time if one was set
  eleventyConfig.addFilter("datumVremeSrp", function (value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    const datum = d.getDate() + ". " + MESECI[d.getMonth()] + " " + d.getFullYear() + ".";
    if (d.getHours() === 0 && d.getMinutes() === 0) return datum;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return datum + " у " + hh + ":" + mm;
  });

  // 2026-07-18 — the machine-readable form for <time datetime="">
  eleventyConfig.addFilter("datumISO", function (value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  });

  // True when a deadline has passed. Used to grey out expired конкурси.
  eleventyConfig.addFilter("istekao", function (value) {
    if (!value) return false;
    const d = new Date(value);
    if (isNaN(d)) return false;
    return d < new Date();
  });


  /* ---------- 3. SMALL HELPERS -------------------------------- */

  eleventyConfig.addFilter("limit", function (arr, n) {
    return Array.isArray(arr) ? arr.slice(0, n) : [];
  });

  // Strips markdown/HTML down to plain text for <meta description>.
  eleventyConfig.addFilter("cist", function (value) {
    if (!value) return "";
    return String(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  });


  /* ---------- 4. COLLECTIONS ---------------------------------
     A collection is just a sorted list of content files that
     templates can loop over. Sorting and filtering happen HERE,
     once at build time, not in the template — it keeps the
     templates readable and the logic in one place.
     ----------------------------------------------------------- */

  // Вести — newest first
  eleventyConfig.addCollection("vesti", function (api) {
    return api.getFilteredByGlob("src/vesti/*.md")
      .sort((a, b) => b.data.date - a.data.date);
  });

  // Вести marked for the homepage
  eleventyConfig.addCollection("vestiIstaknute", function (api) {
    return api.getFilteredByGlob("src/vesti/*.md")
      .filter(item => item.data.featured)
      .sort((a, b) => b.data.date - a.data.date);
  });

  /* Догађаји split themselves into upcoming and past by comparing
     against build time. This is why the client never has to delete
     an old event to keep the page tidy — it archives itself the
     next time the site builds. */
  eleventyConfig.addCollection("dogadjajiPredstojeci", function (api) {
    const sada = new Date();
    return api.getFilteredByGlob("src/dogadjaji/*.md")
      .filter(item => new Date(item.data.end_date || item.data.date) >= sada)
      .sort((a, b) => a.data.date - b.data.date);   // soonest first
  });

  eleventyConfig.addCollection("dogadjajiProsli", function (api) {
    const sada = new Date();
    return api.getFilteredByGlob("src/dogadjaji/*.md")
      .filter(item => new Date(item.data.end_date || item.data.date) < sada)
      .sort((a, b) => b.data.date - a.data.date);   // most recent first
  });

  eleventyConfig.addCollection("edukacije", function (api) {
    return api.getFilteredByGlob("src/edukacije/*.md")
      .sort((a, b) => (b.data.date || 0) - (a.data.date || 0));
  });

  /* Конкурси: open ones first, then the rest. Within each group,
     the nearest deadline comes first — that is the one a farmer
     needs to act on. */
  eleventyConfig.addCollection("konkursi", function (api) {
    const rang = { "Отворен": 0, "Ускоро": 1, "Затворен": 2 };
    return api.getFilteredByGlob("src/konkursi/*.md")
      .sort((a, b) => {
        const r = (rang[a.data.status] ?? 3) - (rang[b.data.status] ?? 3);
        if (r !== 0) return r;
        return (a.data.deadline || Infinity) - (b.data.deadline || Infinity);
      });
  });

  // Тим — manual order, so the client controls who appears first
  eleventyConfig.addCollection("tim", function (api) {
    return api.getFilteredByGlob("src/tim/*.md")
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
  });


  /* ---------- 5. FOLDERS -------------------------------------- */

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
