// Piano sandbox setup for "Thomas sandbox" (AID 0flQ5bxOsu)
window.tp = window.tp || [];
tp.push(["setAid", "0flQ5bxOsu"]);
tp.push(["setSandbox", true]);
tp.push(["setUseTinypassAccounts", false]);
tp.push(["setUsePianoIdUserProvider", true]);
tp.push(["setTags", window.PIANO_TAGS || []]);
tp.push(["setContentSection", window.PIANO_SECTION || "test"]);
tp.push(["addHandler", "checkoutComplete", function (c) { console.log("[piano] checkoutComplete", c); }]);
tp.push(["addHandler", "loginSuccess", function (d) { console.log("[piano] loginSuccess", d); }]);
tp.push(["init", function () {
  tp.experience.init();
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
function pianoLogin() { tp.push(["init", function () { tp.pianoId.show({ screen: "login" }); }]); }
function pianoRegister() { tp.push(["init", function () { tp.pianoId.show({ screen: "register" }); }]); }
function pianoLogout() { tp.push(["init", function () { tp.pianoId.logout(); location.reload(); }]); }
