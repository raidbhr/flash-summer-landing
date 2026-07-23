/* ==========================================================================
   فلاش الصيف للأطفال — script.js
   ========================================================================== */

// ⚠️ عدّل هذا الرابط برابط Google Apps Script Web App الخاص بك
// اشرح طريقة الحصول عليه بالتفصيل في ملف README.md
https://script.google.com/macros/s/AKfycbzf_i4v3yd4TbaD5YAvWi5ERw09kC2JPSls4n52GQ9Cy39YssoTG0JKBekkfLgrQZY/exec
document.addEventListener("DOMContentLoaded", () => {
  initHeaderReveal();
  initStickyCta();
  initAccordion();
  initSlider();
  initOrderForm();
  initLazyLoad();
});

/* --------------------------------------------------------------------------
   1) الهيدر العلوي يظهر بعد تجاوز الهيرو
   -------------------------------------------------------------------------- */
function initHeaderReveal() {
  const header = document.getElementById("siteHeader");
  const hero = document.getElementById("hero");
  if (!header || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("visible", !entry.isIntersecting);
    },
    { rootMargin: "-10% 0px 0px 0px" }
  );
  observer.observe(hero);
}

/* --------------------------------------------------------------------------
   2) شريط الطلب اللاصق يختفي عند الوصول لقسم الطلب
   -------------------------------------------------------------------------- */
function initStickyCta() {
  const stickyCta = document.getElementById("stickyCta");
  const orderSection = document.getElementById("order");
  if (!stickyCta || !orderSection) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      stickyCta.classList.toggle("hidden", entry.isIntersecting);
    },
    { threshold: 0.15 }
  );
  observer.observe(orderSection);
}

/* --------------------------------------------------------------------------
   3) الأسئلة الشائعة (Accordion)
   -------------------------------------------------------------------------- */
function initAccordion() {
  const items = document.querySelectorAll(".acc-item");
  items.forEach((item) => {
    const head = item.querySelector(".acc-head");
    const body = item.querySelector(".acc-body");

    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // إغلاق كل العناصر الأخرى
      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".acc-body").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4) معرض الصور (Slider)
   -------------------------------------------------------------------------- */
function initSlider() {
  const track = document.getElementById("sliderTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("sliderDots");
  if (!track) return;

  const slides = Array.from(track.children);

  // إنشاء النقاط
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => scrollToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function scrollToSlide(index) {
    const slide = slides[index];
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }

  function updateActiveDot() {
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - trackCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === closest));
  }

  track.addEventListener("scroll", debounce(updateActiveDot, 100));

  prevBtn?.addEventListener("click", () => {
    track.scrollBy({ left: track.clientWidth * -0.8, behavior: "smooth" });
  });
  nextBtn?.addEventListener("click", () => {
    track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
  });
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* --------------------------------------------------------------------------
   5) نموذج الطلب: تحقق + إرسال إلى Google Sheets
   -------------------------------------------------------------------------- */
function initOrderForm() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const feedback = document.getElementById("formFeedback");

  const fields = {
    fullName: { el: document.getElementById("fullName"), required: true, label: "الاسم الكامل" },
    phone: { el: document.getElementById("phone"), required: true, label: "رقم الهاتف" },
    wilaya: { el: document.getElementById("wilaya"), required: true, label: "الولاية" },
    commune: { el: document.getElementById("commune"), required: false, label: "البلدية" },
    address: { el: document.getElementById("address"), required: true, label: "العنوان" },
    deliveryType: { el: document.getElementById("deliveryType"), required: true, label: "نوع التوصيل" },
  };

  function validatePhone(value) {
    // يقبل أرقام جزائرية بصيغ شائعة: 05/06/07 + 8 أرقام، بمسافات أو بدونها
    const cleaned = value.replace(/[\s-]/g, "");
    return /^(0)(5|6|7)[0-9]{8}$/.test(cleaned);
  }

  function showFieldError(key, message) {
    const field = fields[key];
    const wrapper = field.el.closest(".field");
    const errEl = document.getElementById("err-" + key);
    if (wrapper) wrapper.classList.add("invalid");
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(key) {
    const field = fields[key];
    const wrapper = field.el.closest(".field");
    const errEl = document.getElementById("err-" + key);
    if (wrapper) wrapper.classList.remove("invalid");
    if (errEl) errEl.textContent = "";
  }

  function validateForm() {
    let isValid = true;

    Object.keys(fields).forEach((key) => clearFieldError(key));

    if (!fields.fullName.el.value.trim()) {
      showFieldError("fullName", "الرجاء إدخال الاسم الكامل");
      isValid = false;
    }

    const phoneVal = fields.phone.el.value.trim();
    if (!phoneVal) {
      showFieldError("phone", "الرجاء إدخال رقم الهاتف");
      isValid = false;
    } else if (!validatePhone(phoneVal)) {
      showFieldError("phone", "رقم الهاتف غير صحيح (مثال: 0555123456)");
      isValid = false;
    }

    if (!fields.wilaya.el.value.trim()) {
      showFieldError("wilaya", "الرجاء إدخال الولاية");
      isValid = false;
    }

    if (!fields.address.el.value.trim()) {
      showFieldError("address", "الرجاء إدخال العنوان الكامل");
      isValid = false;
    }

    return isValid;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
  }

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = "form-feedback show " + type;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    feedback.className = "form-feedback";

    const payload = {
      fullName: fields.fullName.el.value.trim(),
      phone: fields.phone.el.value.trim(),
      wilaya: fields.wilaya.el.value.trim(),
      commune: fields.commune.el.value.trim(),
      address: fields.address.el.value.trim(),
      deliveryType: fields.deliveryType.el.value,
      product: "فلاش الصيف للأطفال",
      price: 2700,
      status: "جديد",
    };

    try {
      // ملاحظة مهمة: نستخدم "text/plain" بدلاً من "application/json" في الترويسة
      // لتفادي طلب preflight (OPTIONS) الذي لا يدعمه Google Apps Script جيدًا.
      // الخادم (Code.gs) يستقبل ويحلل نفس محتوى JSON بشكل طبيعي عبر e.postData.contents
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      // ملاحظة: Google Apps Script قد يرجع استجابة "opaque" بدون CORS كامل
      // لذلك نتعامل مع النجاح بتفاؤل إن لم يحدث خطأ في الشبكة
      let result = { result: "success" };
      try {
        result = await response.json();
      } catch (_) {
        // تجاهل أخطاء تحليل JSON إن كانت الاستجابة غير قابلة للقراءة
      }

      if (result && result.result === "error") {
        throw new Error(result.message || "فشل الإرسال");
      }

      showFeedback("✅ تم إرسال طلبك بنجاح، سنتصل بك قريبًا.", "success");
      form.reset();
    } catch (err) {
      console.error("Order submission error:", err);
      showFeedback("❌ حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى أو الاتصال بنا مباشرة.", "error");
    } finally {
      setLoading(false);
    }
  });
}

/* --------------------------------------------------------------------------
   6) تحميل كسول للصور (lazy load)
   -------------------------------------------------------------------------- */
function initLazyLoad() {
  const lazyImages = document.querySelectorAll("img[data-src]");
  if (!lazyImages.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        obs.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => observer.observe(img));
}
