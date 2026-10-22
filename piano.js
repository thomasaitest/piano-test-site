// Piano sandbox setup for "Thomas sandbox" (AID 0flQ5bxOsu)
window.tp = window.tp || [];
tp.push(["setAid", "0flQ5bxOsu"]);
tp.push(["setSandbox", true]);
tp.push(["setUseTinypassAccounts", false]);
tp.push(["setUsePianoIdUserProvider", true]);
tp.push(["setTags", window.PIANO_TAGS || []]);
tp.push(["setContentSection", window.PIANO_SECTION || "test"]);
tp.push(["addHandler", "checkoutComplete", function (c) { console.log("[piano] checkoutComplete", c); }]);
tp.push(["addHandler", "showOffer", function (o) { pianoDebug("showOffer " + JSON.stringify({offerId:o.offerId, templateId:o.templateId})); }]);
tp.push(["addHandler", "showTemplate", function (t) { pianoDebug("showTemplate " + (t.templateId||"")); }]);
tp.push(["addHandler", "experienceExecute", function (e) { pianoDebug("experienceExecute: " + (e && e.result && e.result.events ? e.result.events.length : 0) + " event(s)"); }]);
tp.push(["addHandler", "loginSuccess", function (d) { console.log("[piano] loginSuccess", d); }]);
tp.push(["init", function () {
  tp.experience.init();
  pianoDebug("tp init ok. aid=" + tp.aid + " sandbox=" + tp.sandbox + " pianoId=" + (!!tp.pianoId) + " user_provider=" + (tp.user && tp.user.getProvider ? tp.user.getProvider().getName() : "n/a"));
  var u = tp.pianoId && tp.pianoId.getUser && tp.pianoId.getUser();
  var el = document.getElementById("user-status");
  if (el) el.textContent = u ? "Logged in as " + u.email : "Not logged in";
}]);
(function () {
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://sandbox.tinypass.com/xbuilder/experience/load?aid=0flQ5bxOsu";
  document.head.appendChild(s);
})();
function pianoDebug(msg) {
  var el = document.getElementById("piano-debug");
  if (el) el.textContent += "[" + new Date().toLocaleTimeString() + "] " + msg + "\n";
  console.log("[piano]", msg);
}
function pianoShow(screen) {
  tp.push(["init", function () {
    try {
      if (!tp.pianoId) { pianoDebug("tp.pianoId is undefined (Piano ID not enabled as user provider?)"); return; }
      tp.pianoId.show({ displayMode: "modal", screen: screen,
        loggedIn: function (d) { pianoDebug("loggedIn " + (d.user && d.user.email)); location.reload(); } });
      pianoDebug("tp.pianoId.show(" + screen + ") called");
    } catch (e) { pianoDebug("pianoId.show error: " + e.message); }
  }]);
}
function pianoLogin() { pianoShow("login"); }
function pianoRegister() { pianoShow("register"); }
function pianoLogout() { tp.push(["init", function () { tp.pianoId.logout(); location.reload(); }]); }
