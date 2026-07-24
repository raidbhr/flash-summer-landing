/* ==========================================================================
   فلاش الصيف للأطفال — script.js
   ========================================================================== */

// ⚠️ ضع رابط Google Apps Script الخاص بك هنا (تأكد من نشر السكريبت كـ Web App للجميع)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3PFql4Up08KGnz5AscPL99X1uA0tLAS0bOb10ugmL4fwom65Lk8TNrtZrCsMrlB4r/exec";

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

    head?.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      items.forEach((other) => {
        other.classList.remove("open");
        const b = other.querySelector(".acc-body");
        if (b) b.style.maxHeight = null;
      });

      if (!isOpen && body) {
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

  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => scrollToSlide(i));
      dotsWrap.appendChild(dot);
    });
  }

  function scrollToSlide(index) {
    const slide = slides[index];
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }

  function updateActiveDot() {
    if (!dotsWrap) return;
    const dots = Array.from(dotsWrap.children);
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
   5) نموذج الطلب: تحقق + إرسال مضمون إلى Google Sheets
   -------------------------------------------------------------------------- */
function initOrderForm() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const feedback = document.getElementById("formFeedback");

  const fields = {
    fullName: { el: document.getElementById("fullName"), required: true },
    phone: { el: document.getElementById("phone"), required: true },
    wilaya: { el: document.getElementById("wilaya"), required: true },
    commune: { el: document.getElementById("commune"), required: false },
    address: { el: document.getElementById("address"), required: true },
  };

  function validatePhone(value) {
    const cleaned = value.replace(/[\s-]/g, "");
    return /^(0)(5|6|7)[0-9]{8}$/.test(cleaned);
  }

  function showFieldError(key, message) {
    const field = fields[key];
    if (!field || !field.el) return;
    const wrapper = field.el.closest(".field");
    const errEl = document.getElementById("err-" + key);
    if (wrapper) wrapper.classList.add("invalid");
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(key) {
    const field = fields[key];
    if (!field || !field.el) return;
    const wrapper = field.el.closest(".field");
    const errEl = document.getElementById("err-" + key);
    if (wrapper) wrapper.classList.remove("invalid");
    if (errEl) errEl.textContent = "";
  }

  function validateForm() {
    let isValid = true;
    Object.keys(fields).forEach((key) => clearFieldError(key));

    if (!fields.fullName.el?.value.trim()) {
      showFieldError("fullName", "الرجاء إدخال الاسم الكامل");
      isValid = false;
    }

    const phoneVal = fields.phone.el?.value.trim() || "";
    if (!phoneVal) {
      showFieldError("phone", "الرجاء إدخال رقم الهاتف");
      isValid = false;
    } else if (!validatePhone(phoneVal)) {
      showFieldError("phone", "رقم الهاتف غير صحيح (مثال: 0555123456)");
      isValid = false;
    }

    if (!fields.wilaya.el?.value.trim()) {
      showFieldError("wilaya", "الرجاء إدخال الولاية");
      isValid = false;
    }

    if (!fields.address.el?.value.trim()) {
      showFieldError("address", "الرجاء إدخال العنوان الكامل");
      isValid = false;
    }

    return isValid;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
  }

  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = "form-feedback show " + type;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    if (feedback) feedback.className = "form-feedback";

    // تحويل البيانات إلى URLSearchParams لتفادي مشاكل CORS و JSON Preflight
    const formData = new URLSearchParams();
    formData.append("fullName", fields.fullName.el.value.trim());
    formData.append("phone", fields.phone.el.value.trim());
    formData.append("wilaya", fields.wilaya.el.value.trim());
    formData.append("commune", fields.commune.el?.value.trim() || "");
    formData.append("address", fields.address.el.value.trim());
    formData.append("deliveryType", "توصيل مجاني");
    formData.append("product", "فلاش الصيف للأطفال");
    formData.append("price", "2700 دج");

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: formData.toString(),
        mode: "no-cors",
      });

      showFeedback("✅ تم إرسال طلبك بنجاح! سنتصل بك قريبًا لتأكيد التوصيل.", "success");
      form.reset();
    } catch (err) {
      console.error("Order submission error:", err);
      showFeedback("❌ حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.", "error");
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
