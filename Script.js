        const $ = id => document.getElementById(id);
        const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let cfg = {}, profs = [], pers = [], brk = null;
        const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        const bg = i => `hsl(${(i * 47 + 210) % 360},80%,92%)`, bd = i => `hsl(${(i * 47 + 210) % 360},65%,50%)`;
        function show(n) { [1, 2, 3].forEach(i => { $("p" + i).classList.toggle("hide", i !== n) }); scrollTo(0, 0) }
        const pad = n => String(n).padStart(2, "0");
        function fmt(m) { const h = Math.floor(m / 60) % 24; return `${h % 12 || 12}:${pad(m % 60)} ${h >= 12 ? "PM" : "AM"}` }
        function rng(a, b) { let x = fmt(a); const y = fmt(b); if (x.slice(-2) === y.slice(-2)) x = x.slice(0, -3); return x + " – " + y }
        function trow(id, p) { return `<div class="row4 ${id === "b" ? "bk" : ""}"><input id="pl${id}" value="${esc(p.n)}"><input class="tm" readonly id="ps${id}" data-v="${p.s}" value="${fmt(p.s)}" onclick="openClock(this)"><input class="tm" readonly id="pe${id}" data-v="${p.e}" value="${fmt(p.e)}" onclick="openClock(this)"></div>` }
        let ck = {};
        document.body.insertAdjacentHTML("beforeend", `<div id="ckw" class="ckw hide noprint"><div class="ckb"><div class="ckt"><span id="ckh" onclick="ckMode(0)"></span>:<span id="ckm" onclick="ckMode(1)"></span><div class="ap"><b id="ck0" onclick="ckAP(0)">AM</b><b id="ck1" onclick="ckAP(1)">PM</b></div></div><svg id="cks" viewBox="-100 -100 200 200"></svg><div class="bar" style="margin-top:10px"><button class="g" onclick="ckClose()">Cancel</button><button onclick="ckOk()">OK</button></div></div></div>`);
        {
            const sv = $("cks"); let dn = false; const pt = e => { const r = sv.getBoundingClientRect(), a = (Math.atan2(e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)) * 180 / Math.PI + 360) % 360; if (ck.mode) ck.mi = Math.round(a / 6) % 60; else ck.h = Math.round(a / 30) % 12 || 12; ckUpd() };
            sv.onpointerdown = e => { dn = true; sv.setPointerCapture(e.pointerId); pt(e) }; sv.onpointermove = e => dn && pt(e); sv.onpointerup = () => { if (dn) { dn = false; if (!ck.mode) setTimeout(() => ckMode(1), 250) } }
        }
        function openClock(el) { const m = +el.dataset.v, H = Math.floor(m / 60) % 24; ck = { el, h: H % 12 || 12, mi: m % 60, ap: H >= 12 ? 1 : 0, mode: 0 }; $("ckw").classList.remove("hide"); ckMode(0) }
        function ckMode(x) {
            ck.mode = x; let s = `<circle r="98" fill="var(--inp)"/><g id="hand" style="transition:transform .25s"><line y2="-64" stroke="var(--pr)" stroke-width="2"/><circle cy="-80" r="15" fill="var(--pr)" opacity=".3"/></g><circle r="4" fill="var(--pr)"/>`;
            for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += `<text x="${(80 * Math.sin(a)).toFixed(1)}" y="${(-80 * Math.cos(a)).toFixed(1)}" text-anchor="middle" dy=".35em" font-size="13" fill="var(--tx)" style="pointer-events:none">${x ? pad(i * 5) : (i || 12)}</text>` }
            $("cks").innerHTML = s; ckUpd()
        }
        function ckUpd() { $("ckh").textContent = ck.h; $("ckm").textContent = pad(ck.mi); $("ckh").classList.toggle("on", !ck.mode); $("ckm").classList.toggle("on", !!ck.mode); $("ck0").classList.toggle("on", !ck.ap); $("ck1").classList.toggle("on", !!ck.ap); $("hand").style.transform = `rotate(${ck.mode ? ck.mi * 6 : (ck.h % 12) * 30}deg)` }
        function ckAP(v) { ck.ap = v; ckUpd() }
        function ckClose() { $("ckw").classList.add("hide") }
        function ckOk() { const m = ((ck.h % 12) + ck.ap * 12) * 60 + ck.mi; ck.el.dataset.v = m; ck.el.value = fmt(m); ckClose() }
        function syncProfs() { profs = [...document.querySelectorAll("#plist .row3")].map(r => ({ n: r.children[0].value.trim(), s: r.children[1].value.trim() })) }
        function renderProfs() { $("plist").innerHTML = profs.map((f, i) => `<div class="row3"><input placeholder="Professor Name" value="${esc(f.n)}"><input placeholder="Subject" value="${esc(f.s)}"><button class="g" title="Remove" onclick="delProf(${i})">✕</button></div>`).join("") }
        function addProf() { syncProfs(); profs.push({ n: "", s: "" }); renderProfs() }
        function delProf(i) { syncProfs(); if (profs.length > 1) profs.splice(i, 1); renderProfs() }
        function toStep2() {
            const c = { col: $("col").value.trim(), cls: $("cls").value.trim(), ns: +$("ns").value, nper: +$("nper").value, nd: +$("nd").value };
            if (!c.col || !c.cls) return $("e1").textContent = "Please enter college and class name.";
            if (!(c.ns > 0 && c.nper > 0)) return $("e1").textContent = "Enter valid numbers.";

            $("e1").textContent = ""; cfg = c;
            syncProfs(); if (!profs.length) profs = [{ n: "", s: "" }, { n: "", s: "" }, { n: "", s: "" }]; renderProfs(); let h;

            h = ""; { const half = Math.floor(c.nper / 2), ok = pers.length === c.nper; let t = 540; for (let i = 0; i < c.nper; i++) { if (c.nper > 1 && i === half) { const b = ok && brk ? brk : { n: "Break", s: t, e: t + 20 }; h += trow("b", b); t = b.e } const p = ok ? pers[i] : { n: "Period " + (i + 1), s: t, e: t + 45 }; h += trow(i, p); t = p.e } }
            $("perlist").innerHTML = h; show(2);
        }
        function generate() {
            const { nper, ns, nd, col, cls } = cfg; syncProfs(); profs = profs.filter(f => f.n); const np = profs.length; pers = []; if (np < ns) return $("e2").textContent = "Add at least " + ns + " professors (one per section) so no professor is needed in two sections at once.";

            const rd = id => ({ n: $("pl" + id).value.trim() || (id === "b" ? "Break" : "Period " + (+id + 1)), s: +$("ps" + id).dataset.v, e: +$("pe" + id).dataset.v }); for (let i = 0; i < nper; i++)pers.push(rd(i));
            brk = nper > 1 ? rd("b") : null; if (pers.concat(brk || []).some(p => p.e <= p.s)) return $("e2").textContent = "End time must be after start time for every period."; pers.forEach(p => p.t = rng(p.s, p.e)); if (brk) brk.t = rng(brk.s, brk.e); const half = Math.floor(nper / 2);

            $("e2").textContent = "";
            const step = Math.max(1, Math.floor(np / 2) + (np % 2 === 0 ? 1 : 0));
            const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
            const legend = profs.map((f, i) => `<span style="background:${bg(i)};border-color:${bd(i)}">${esc(f.n)} · ${esc(f.s || "—")}</span>`).join("");
            let tabs = "", sheets = "";
            for (let s = 0; s < ns; s++) {
                let t = `<table class="tt"><tr><th class="day">Day</th>${pers.map((p, i) => (brk && i === half ? `<th class="brk">${esc(brk.n)}<small>${esc(brk.t)}</small></th>` : "") + `<th>${esc(p.n)}<small>${esc(p.t)}</small></th>`).join("")}</tr>`;
                for (let d = 0; d < nd; d++) {
                    t += `<tr><th class="day">${DAYS[d]}</th>`;
                    for (let p = 0; p < nper; p++) { if (brk && p === half && d === 0) t += `<td class="brk" rowspan="${nd}"><span>${esc(brk.n.toUpperCase())}</span></td>`; const k = (s + p + d * step) % np, f = profs[k]; t += `<td style="background:${bg(k)};border-color:${bd(k)}"><b>${esc(f.s || "—")}</b><small>${esc(f.n)}</small></td>` }
                    t += "</tr>";
                }
                t += "</table>";
                const L = String.fromCharCode(65 + s);
                tabs += `<button onclick="tab(${s + 1})">Section ${L}</button>`;
                sheets += `<div class="sheet"><div class="banner"><div><h2>${esc(col)}</h2><span>Weekly Timetable</span></div><div class="chip">${esc(cls)} · Section ${L}</div></div><div class="body"><div class="tw">${t}</div><div class="legend">${legend}</div><div class="foot"><span>${esc(col)} — ${esc(cls)}</span><span>Created on ${today}</span></div></div></div>`;
            }
            const hd = pers.map((p, i) => (brk && i === half ? `<th class="brk">${esc(brk.n)}<small>${esc(brk.t)}</small></th>` : "") + `<th>${esc(p.n)}<small>${esc(p.t)}</small></th>`).join("");
            let a = `<table class="tt"><tr><th class="day">Day</th><th class="day sec">Sec</th>${hd}</tr>`;
            for (let d = 0; d < nd; d++)for (let s = 0; s < ns; s++) { a += `<tr>${s ? "" : `<th class="day" rowspan="${ns}">${DAYS[d]}</th>`}<th class="sec">${String.fromCharCode(65 + s)}</th>`; for (let p = 0; p < nper; p++) { if (brk && p === half && d === 0 && s === 0) a += `<td class="brk" rowspan="${nd * ns}"><span>${esc(brk.n.toUpperCase())}</span></td>`; const k = (s + p + d * step) % np, f = profs[k]; a += `<td style="background:${bg(k)};border-color:${bd(k)}"><b>${esc(f.s || "—")}</b><small>${esc(f.n)}</small></td>` } a += "</tr>" } a += "</table>";
            tabs = `<button class="on" onclick="tab(0)">📋 All Sections</button>` + tabs;
            sheets = `<div class="sheet show all"><div class="banner"><div><h2>${esc(col)}</h2><span>Master Timetable</span></div><div class="chip">${esc(cls)} · All Sections</div></div><div class="body"><div class="tw">${a}</div><div class="legend">${legend}</div><div class="foot"><span>${esc(col)} — ${esc(cls)}</span><span>Created on ${today}</span></div></div></div>` + sheets;
            $("tabs").innerHTML = tabs; $("sheets").innerHTML = sheets; show(3);
        }
        function tab(i) { document.querySelectorAll(".tabs button").forEach((b, j) => b.classList.toggle("on", i === j)); document.querySelectorAll(".sheet").forEach((b, j) => b.classList.toggle("show", i === j)) }
