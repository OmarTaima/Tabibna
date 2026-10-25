try {
  var stored = localStorage.getItem("vivavalve.locale") || localStorage.getItem("tabibna.locale");
  var locale = stored === "ar" || stored === "en" ? stored : null;
  if (!locale) {
    locale = navigator.language && navigator.language.toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
} catch (error) {
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
}
