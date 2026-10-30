/* ------------------------------------------------------------------
     EASY EDITS
     PROFILE_PHOTO: path to a photo (for example "images/sachi.jpg") or a data: URL.
                    Leave empty to keep the placeholder. A portrait about 672 x 840 px works well.
     FORM_ENDPOINT: the URL given by a form service (such as Formspree or Web3Forms).
                    While empty, the form validates input but does NOT send anything.
     To add projects or certificates later, copy one <article class="card interest"> block
     inside the Interests section and edit its text, or add a new <section class="section">.
     ------------------------------------------------------------------ */
  const PROFILE_PHOTO = "assets/sachi-profile.jpg";
  const FORM_ENDPOINT = "";

  (function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Profile photo */
    if (PROFILE_PHOTO) {
      var img = document.getElementById("profilePhoto");
      img.src = PROFILE_PHOTO;
      img.hidden = false;
      document.getElementById("photoPlaceholder").hidden = true;
    }

    /* Mobile menu */
    var menuBtn = document.getElementById("menuBtn");
    var navLinks = document.getElementById("navLinks");
    function setMenu(open) {
      menuBtn.setAttribute("aria-expanded", String(open));
      navLinks.classList.toggle("open", open);
    }
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });

    /* Smooth in-page navigation */
    function goTo(id) {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        return;
      }
      var target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        if (!id || (id !== "home" && !document.getElementById(id))) return;
        e.preventDefault();
        setMenu(false);
        goTo(id);
      });
    });
    document.getElementById("topBtn").addEventListener("click", function () { goTo("home"); });

    /* Highlight the current section in the nav */
    var links = {};
    document.querySelectorAll("#navLinks a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          var current = links[entry.target.id];
          if (current) current.setAttribute("aria-current", "true");
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["home", "about", "education", "interests", "goals", "contact"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) spy.observe(el);
      });
    }

    /* Contact form */
    var form = document.getElementById("contactForm");
    var statusEl = document.getElementById("formStatus");
    var rules = {
      "cf-name": function (v) { return v.trim().length >= 2 || "Enter your name (at least 2 characters)."; },
      "cf-email": function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Enter a valid email address."; },
      "cf-message": function (v) { return v.trim().length >= 10 || "Write a message of at least 10 characters."; }
    };
    function setError(id, msg) {
      var input = document.getElementById(id);
      var err = document.getElementById(id + "-err");
      if (msg) {
        input.setAttribute("aria-invalid", "true");
        err.textContent = msg;
        err.hidden = false;
      } else {
        input.removeAttribute("aria-invalid");
        err.hidden = true;
      }
    }
    function showStatus(kind, text) {
      statusEl.className = "status " + kind;
      statusEl.textContent = text;
      statusEl.hidden = false;
    }
    Object.keys(rules).forEach(function (id) {
      document.getElementById(id).addEventListener("input", function () { setError(id, ""); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.hidden = true;
      var firstBad = null;
      Object.keys(rules).forEach(function (id) {
        var result = rules[id](document.getElementById(id).value);
        if (result !== true) {
          setError(id, result);
          if (!firstBad) firstBad = id;
        } else {
          setError(id, "");
        }
      });
      if (firstBad) {
        document.getElementById(firstBad).focus();
        showStatus("bad", "Please fix the highlighted fields and try again.");
        return;
      }
      if (!FORM_ENDPOINT) {
        showStatus("", "Your message looks good, but this form is not connected to an email service yet, so it has not been sent.");
        return;
      }
      var data = {
        name: document.getElementById("cf-name").value.trim(),
        email: document.getElementById("cf-email").value.trim(),
        message: document.getElementById("cf-message").value.trim()
      };
      showStatus("", "Sending your message...");
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        showStatus("ok", "Thank you! Your message has been sent.");
      }).catch(function () {
        showStatus("bad", "Sorry, the message could not be sent. Please try again in a moment.");
      });
    });
  })();
