// Piano sandbox setup for "Thomas sandbox" (AID 0flQ5bxOsu)
// Handlers are queued before the experience loader script is inserted.
// showTemplate and meter events fire during that execute pass; a handler
// attached later (console, or after load) does not see them.
window.tp = window.tp || [];
tp.push(["setAid", "0flQ5bxOsu"]);
tp.push(["setSandbox", true]);
tp.push(["setUseTinypassAccounts", false]);
tp.push(["setUsePianoIdUserProvider", true]);
tp.push(["setTags", window.PIANO_TAGS || []]);
tp.push(["setContentSection", window.PIANO_SECTION || "test"]);
tp.push(["addHandler", "checkoutComplete", function (c) { console.log("[piano] checkoutComplete", c); }]);
tp.push(["addHandler", "showOffer", function (o) { pianoLogShow("showOffer", o); }]);
tp.push(["addHandler", "showTemplate", function (t) { pianoLogShow("showTemplate", t); }]);
tp.push(["addHandler", "experienceExecute", function (e) { pianoLogExperience(e); }]);
tp.push(["addHandler", "meterActive", function (params, moduleParams, context) { pianoLogMeter("meterActive", params, moduleParams, context); }]);
tp.push(["addHandler", "meterExpired", function (params, moduleParams, context) { pianoLogMeter("meterExpired", params, moduleParams, context); }]);
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

var pianoDebugBuffer = [];
function pianoDebug(msg) {
  var line = "[" + new Date().toLocaleTimeString() + "] " + msg;
  console.log("[piano]", msg);
  var el = document.getElementById("piano-debug");
  if (!el) {
    pianoDebugBuffer.push(line);
    return;
  }
  if (pianoDebugBuffer.length) {
    el.textContent += pianoDebugBuffer.join("\n") + "\n";
    pianoDebugBuffer = [];
  }
  el.textContent += line + "\n";
}
function pianoFlushDebug() {
  var el = document.getElementById("piano-debug");
  if (!el || !pianoDebugBuffer.length) return;
  el.textContent += pianoDebugBuffer.join("\n") + "\n";
  pianoDebugBuffer = [];
}
function pianoOwnKeys(obj) {
  if (!obj || typeof obj !== "object") return [];
  var keys = [];
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) keys.push(k);
  }
  return keys;
}
function pianoJson(value) {
  var seen = [];
  try {
    var text = JSON.stringify(value, function (key, v) {
      if (typeof v === "function") return "[Function]";
      if (v && typeof v === "object") {
        if (typeof Node !== "undefined" && v instanceof Node) return "[Node]";
        if (seen.indexOf(v) >= 0) return "[Circular]";
        seen.push(v);
      }
      return v;
    });
    if (text && text.length > 4000) return text.slice(0, 4000) + "…";
    return text;
  } catch (err) {
    return String(value);
  }
}
function pianoFmt(value) {
  if (typeof value === "function") return "[Function]";
  if (value == null || value === "") return "—";
  if (typeof value === "string") return value;
  var text = pianoJson(value);
  return text == null ? String(value) : text;
}
function pianoField(obj, name) {
  if (!obj || typeof obj !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, name) && obj[name] != null && obj[name] !== "") return obj[name];
  var nests = ["eventParams", "eventExecutionContext", "eventModuleParams"];
  var i;
  for (i = 0; i < nests.length; i++) {
    var nested = obj[nests[i]];
    if (nested && typeof nested === "object" && nested[name] != null && nested[name] !== "") return nested[name];
  }
  return undefined;
}
function pianoRedacted(name) {
  return /token|password|secret/i.test(name);
}
// Fields Piano copies onto the showTemplate / showOffer callback argument
// (template params plus experienceId, experienceActionId, and splitTestIds).
var PIANO_SHOW_FIELDS = ["templateId", "experienceId", "experienceActionId", "splitTestIds", "templateVariantId", "offerId", "displayMode", "activeMeters"];
function pianoLogShow(label, obj) {
  try {
    console.log("[piano]", label, obj);
    var parts = [label];
    var seen = {};
    var i;
    var name;
    for (i = 0; i < PIANO_SHOW_FIELDS.length; i++) {
      name = PIANO_SHOW_FIELDS[i];
      seen[name] = true;
      parts.push(name + "=" + pianoFmt(pianoField(obj, name)));
    }
    var keys = pianoOwnKeys(obj);
    for (i = 0; i < keys.length; i++) {
      name = keys[i];
      if (seen[name]) continue;
      parts.push(name + "=" + (pianoRedacted(name) ? "[redacted]" : pianoFmt(obj[name])));
    }
    parts.push("keys=[" + keys.join(", ") + "]");
    pianoDebug(parts.join(" "));
  } catch (err) {
    pianoDebug(label + " log error: " + (err && err.message ? err.message : err));
  }
}
function pianoExperienceEvents(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.result && payload.result.events && typeof payload.result.events.length === "number") return payload.result.events;
  if (payload.events && typeof payload.events.length === "number") return payload.events;
  return null;
}
function pianoLogExperience(payload) {
  try {
    console.log("[piano]", "experienceExecute", payload);
    var events = pianoExperienceEvents(payload);
    if (!events) {
      pianoDebug("experienceExecute: no events array; keys=[" + pianoOwnKeys(payload).join(", ") + "]");
      return;
    }
    pianoDebug("experienceExecute: " + events.length + " event(s)");
    var i;
    for (i = 0; i < events.length; i++) {
      var ev = events[i] || {};
      var ctx = ev.eventExecutionContext || {};
      var experienceId = ctx.experienceId || ev.experienceId;
      pianoDebug(
        "  eventType=" + pianoFmt(ev.eventType) +
        " experienceId=" + pianoFmt(experienceId) +
        " splitTests=" + pianoFmt(ctx.splitTests) +
        " activeMeters=" + pianoFmt(ctx.activeMeters) +
        " ctxKeys=[" + pianoOwnKeys(ctx).join(", ") + "]"
      );
      console.log("[piano] experienceExecute event", ev.eventType, ctx);
    }
  } catch (err) {
    pianoDebug("experienceExecute log error: " + (err && err.message ? err.message : err));
  }
}
function pianoMeterList(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch (err) { return null; }
  }
  if (typeof value.length === "number") return value;
  return null;
}
function pianoMeterValue(params, context, name) {
  var direct = pianoField(params, name);
  if (direct != null && direct !== "") return direct;
  if (name === "meterName" && context && context.currentMeterName) return context.currentMeterName;
  var lists = [];
  if (context) {
    if (context.activeMeters) lists.push(context.activeMeters);
    if (context.allMeters) lists.push(context.allMeters);
  }
  var fromParams = pianoField(params, "activeMeters");
  if (fromParams) lists.push(fromParams);
  var i;
  for (i = 0; i < lists.length; i++) {
    var list = pianoMeterList(lists[i]);
    if (list && list.length && list[0] && list[0][name] != null && list[0][name] !== "") return list[0][name];
  }
  return undefined;
}
function pianoLogMeter(label, params, moduleParams, context) {
  try {
    console.log("[piano]", label, params, moduleParams, context);
    var names = ["meterName", "views", "viewsLeft", "maxViews", "totalViews"];
    var parts = [label];
    var i;
    for (i = 0; i < names.length; i++) {
      parts.push(names[i] + "=" + pianoFmt(pianoMeterValue(params, context, names[i])));
    }
    parts.push("keys=[" + pianoOwnKeys(params).join(", ") + "]");
    pianoDebug(parts.join(" "));
  } catch (err) {
    pianoDebug(label + " log error: " + (err && err.message ? err.message : err));
  }
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
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pianoFlushDebug);
else pianoFlushDebug();
pianoDebug("handlers queued before experience loader: showTemplate, showOffer, experienceExecute, meterActive, meterExpired");
