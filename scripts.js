console.log("%cScripts.js loaded", "color: lightgreen;");

// Helper Functions
function formatNumber(str) {
  let num = parseInt(str, 10);
  return num < 10 ? "0" + num : num.toString();
}
// Debounce function to limit function calls during resize
function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
}
// Get value of a CSS Variable on :root
function cssvar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

// Register GSAP Stuff
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);

// GSAP Custom Eases
CustomEase.create("out-quad", "0.5, 1, 0.89, 1");

let lenis;

// Lenis setup
function enableLenis() {
  lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  lenis.start();
}

// Scroll Margin fix
function scrollMarginFix() {
  document
    .querySelectorAll('a[href^="#"]:not([href="#"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          // Get --scroll-margin-top from the custom property
          const computedStyle = getComputedStyle(target);
          const customScrollMargin =
            parseInt(computedStyle.getPropertyValue("--scroll-margin-top")) ||
            0;

          // Fall back to scrollMarginTop if no custom property is defined
          const scrollMarginTop =
            customScrollMargin || parseInt(computedStyle.scrollMarginTop) || 0;

          // Calculate the target position with respect to the margin
          const targetPosition =
            target.getBoundingClientRect().top +
            window.scrollY -
            scrollMarginTop;

          // Smooth scroll to the adjusted position
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
}

// Image Resizing to fix quality
function imageSrcSetFix() {
  // Handle improperly loaded srcset size for responsive images
  var images = document.getElementsByTagName("img");

  function updateImageSizes() {
    for (var i = 0; i < images.length; i++) {
      var image = images[i];

      // Check if the image has already been sized
      if (!image.dataset.sized) {
        if (image.complete) {
          setImageSizes(image);
        } else {
          // Add a one-time load event listener
          image.addEventListener(
            "load",
            function () {
              setImageSizes(this);
            },
            { once: true }
          );
        }
      }
    }
  }

  function setImageSizes(image) {
    var imageRect = image.getBoundingClientRect();
    var imageWidth = imageRect.width;
    var imageHeight = imageRect.height;
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    // Calculate width percentage
    var widthPercentage = (imageWidth / viewportWidth) * 100;

    // Calculate height percentage
    var heightPercentage = (imageHeight / viewportHeight) * 100;

    // Combine width and height considerations
    var combinedSizeValue =
      Math.round(widthPercentage * 0.7 + heightPercentage * 0.3) + "vw";

    // Optional: Add a minimum and maximum size constraint
    var minSize = 10; // Minimum 10vw
    var maxSize = 90; // Maximum 90vw
    var finalSizeValue =
      Math.min(Math.max(parseFloat(combinedSizeValue), minSize), maxSize) +
      "vw";

    // Set sizes attribute
    image.setAttribute("sizes", finalSizeValue);

    // Mark as sized to avoid redundant processing
    image.dataset.sized = "true";

    // Optional: Log for debugging
    // console.log(`Image size set to: ${finalSizeValue}`);
  }

  // Update image sizes on initial load
  updateImageSizes();

  // Update image sizes on window resize with debounce
  window.addEventListener("resize", debounce(updateImageSizes, 200));
}

// Nav Submenus
function navSubmenus() {
  const navItems = document.querySelectorAll(".nav_links_item");
  const navMenuWrap = document.querySelector(".nav_menu_wrap");

  let debounceTimer;

  // Function to close all submenus, optionally excluding a specific item
  const closeAllSubmenus = (excludeItem = null) => {
    // console.log("closeAllSubmenus");
    navItems.forEach((el) => {
      if (el !== excludeItem) {
        const submenu = el.querySelector(".nav_submenu_wrap");
        const submenuList = submenu?.querySelector(".nav_submenu_list_wrap");
        if (submenu && submenuList) {
          gsap.to(submenuList, {
            opacity: 0,
            duration: 0.5, // Make sure this matches the open animation for consistency
            onStart: () => {
              // submenu.style.pointerEvents = "none"; // Disable interaction
            },
            onComplete: () => {
              // submenu.style.display = "none"; // Only hide after fade-out completes
              submenu.style.visibility = "hidden";
              submenu.style.zIndex = "10"; // Reset to default zIndex
            },
          });
        }
        el.classList.remove("is-open");
      }
    });

    navMenuWrap.classList.add("nav_menu_wrap--reset");
    navMenuWrap.classList.remove("nav_menu_wrap--translated");
  };

  // Function to open a submenu
  const openSubmenu = (item) => {
    if (item.classList.contains("is-open")) return; // Do nothing if the submenu is already open

    // console.log("openSubmenu");
    const submenu = item.querySelector(".nav_submenu_wrap");
    const submenuList = submenu?.querySelector(".nav_submenu_list_wrap");

    if (submenu && submenuList) {
      // Find any currently open submenu
      const openItem = document.querySelector(".nav_links_item.is-open");
      const openSubmenu = openItem?.querySelector(".nav_submenu_wrap");
      const openSubmenuList = openSubmenu?.querySelector(
        ".nav_submenu_list_wrap"
      );

      if (openItem && openItem !== item) {
        // Fade out but don't fully hide the previous submenu
        gsap.to(openSubmenuList, {
          opacity: 0,
          duration: 0.3, // Reduce fade-out duration slightly
          onStart: () => {
            // openSubmenu.style.pointerEvents = "none"; // Disable interaction
          },
        });

        // Wait slightly before hiding the previous submenu
        setTimeout(() => {
          // openSubmenu.style.display = "none";
          openSubmenu.style.visibility = "hidden";
          openSubmenu.style.zIndex = "10"; // Reset to default
          openItem.classList.remove("is-open");
        }, 200); // Delayed just enough to overlap
      }

      // Open the new submenu with a slight delay
      setTimeout(() => {
        submenu.style.display = "block";
        submenu.style.visibility = "visible";
        submenu.style.zIndex = "11"; // Assign higher zIndex when open

        gsap.fromTo(
          submenuList,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            onStart: () => {
              // submenu.style.pointerEvents = "auto"; // Enable interaction
            },
          }
        );

        navMenuWrap.classList.add("nav_menu_wrap--translated");
        navMenuWrap.classList.remove("nav_menu_wrap--reset");
        item.classList.add("is-open");
      }, 100); // Slight delay to overlap animations smoothly
    }
  };

  navItems.forEach((item) => {
    const navLink = item.querySelector(".nav_links_link");

    // Handle clicks/touches on .nav_links_link to prioritize navigation
    if (navLink) {
      navLink.addEventListener("touchstart", (e) => {
        clearTimeout(debounceTimer); // Prevent submenu opening if touching nav link within 500ms
        e.stopPropagation(); // Prevent touch from bubbling up to parent
      });

      navLink.addEventListener("click", (e) => {
        clearTimeout(debounceTimer); // Prevent submenu opening if clicking nav link within 500ms
        e.stopPropagation(); // Prevent click from triggering parent logic
      });

      // Handle focus event for keyboard navigation (tabbing)
      navLink.addEventListener("focus", () => {
        openSubmenu(item); // Open submenu when tabbing to the item
      });
    }

    // Handle touchstart events for toggling submenu
    item.addEventListener("touchstart", (e) => {
      // If the touch is on the navLink, allow normal navigation
      if (e.target === navLink || navLink.contains(e.target)) {
        return;
      }

      e.preventDefault(); // Prevent default behavior for touch
      const isOpen = item.classList.contains("is-open");

      if (isOpen) {
        closeAllSubmenus();
      } else {
        openSubmenu(item);
      }
    });

    // Handle mouseenter with debounce
    item.addEventListener("mouseenter", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => openSubmenu(item), 600);
    });

    // Handle mouseleave with debounce
    item.addEventListener("mouseleave", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => closeAllSubmenus(), 600);
    });

    // Close submenus on touchstart outside of .nav_links_item
    navMenuWrap.addEventListener("touchstart", (e) => {
      if (!e.target.closest(".nav_links_item")) {
        closeAllSubmenus();
      }
    });
  });

  // Ensure links inside .nav_submenu_wrap navigate correctly
  document.querySelectorAll(".nav_submenu_wrap").forEach((link) => {
    link.addEventListener("touchstart", (e) => {
      e.stopPropagation(); // Prevent the touch event from propagating to parent elements
    });
  });
}

/** Scroll Animations
 *
 * Usage:
 * ------
 * 1. Add data attributes to your HTML elements:
 *    - data-anim: Specifies the animation type
 *    - data-anim-duration: (Optional) Sets custom animation duration in seconds
 *    - data-anim-delay: (Optional) Sets element's individual delay in seconds
 *    - data-anim-group-delay: (Optional) Sets custom stagger delay between elements entering visibility within 0.25 time frame in seconds
 *
 * Example HTML:
 * ```html
 * <div data-anim="fadeslide-up" data-anim-duration="0.8" data-anim-group-delay="0.15">
 *   Content here
 * </div>
 * ```
 *
 * Necessary CSS:
 * ------
 * ```css
 * [data-anim] {
 *   opacity: 0;
 *   will-change: transform, opacity;
 *   backface-visibility: hidden;
 *   perspective: 1000px;
 * }
 * html.wf-design-mode [data-anim],
 * html.wf-doc [data-anim],
 * html.site-scrollbar [data-anim],
 * html.w-editor [data-anim] { opacity: 1; }
 * ```
 *
 * Animation Types:
 * ---------------
 * - "fadeslide-up": Fades in while sliding up
 * - "fadeslide-in-left": Fades in while sliding from left
 * - "fadeslide-in-right": Fades in while sliding from right
 * - "fadeslide-in": Smart directional fade-slide based on panel layout
 * - "fade": Simple fade in
 *
 * Default Values:
 * --------------
 * - Animation Duration: 0.75 seconds
 * - Stagger Delay: 0.12 seconds
 * - Scroll Trigger Point: 80% from top of viewport
 * - Reset Time Window: 0.25 seconds (for grouping staggered animations)
 *
 * Special Features:
 * ---------------
 * 1. Stagger Grouping:
 *    - Elements triggered within 0.25 seconds are grouped together
 *    - Each group starts its own stagger sequence
 *    - Helps maintain visual coherence for elements entering viewport together
 *
 * 2. Performance:
 *    - Animations trigger only once
 *    - Uses performant GSAP animations
 *    - Optimized trigger calculations
 *
 * Implementation Notes:
 * -------------------
 * - Call initScrollAnimations() after DOM is ready
 * - Ensure GSAP and ScrollTrigger are loaded before initialization
 * - Animations trigger when elements are 80% visible from the top of viewport
 *
 */
function initScrollAnimations() {
  // Select all elements with data-anim attribute
  const animElements = document.querySelectorAll("[data-anim]");

  let lastTriggerTime = 0; // Store the timestamp of the last group
  let groupIndex = 0; // To reset delay for new groups
  const resetTime = 0.1; // Time window (in seconds) to reset the stagger delay

  let screenWidth = window.innerWidth;
  let transitionAmount = screenWidth < 600 ? 40 : 75;
  let transitionAmountNeg = transitionAmount * -1;

  window.addEventListener("resize", () => {
    screenWidth = window.innerWidth;
    transitionAmount = screenWidth < 600 ? 40 : 75; // Update transitionAmount on resize
    transitionAmountNeg = transitionAmount * -1;
  });

  animElements.forEach((element, index) => {
    const animType = element.getAttribute("data-anim");
    const customDuration =
      parseFloat(element.getAttribute("data-anim-duration")) || 0.75;
    const customGroupDelay =
      parseFloat(element.getAttribute("data-anim-group-delay")) || 0.1;
    const customDelay =
      parseFloat(element.getAttribute("data-anim-delay")) || false;

    const rect = element.getBoundingClientRect();
    const isAboveViewport = rect.bottom < 0; // Element is already above the viewport

    if (isAboveViewport) {
      gsap.set(element, { opacity: 1, x: 0, y: 0 }); // Instantly reveal elements above viewport
      return;
    }

    let fromX = 0;

    // ScrollTrigger with time grouping logic
    ScrollTrigger.create({
      trigger: element,
      start: "top 90%",
      once: true, // Ensure the animation runs only once
      onEnter: () => {
        const currentTime = performance.now() / 1000; // Convert to seconds

        // If the time since the last trigger is greater than resetTime, reset the group index
        if (currentTime - lastTriggerTime > resetTime) {
          groupIndex = 0; // Reset delay index for new group
        }

        lastTriggerTime = currentTime; // Update last trigger time

        let delay = 0;

        if (customDelay) {
          delay = customDelay;
        } else {
          delay = groupIndex * customGroupDelay; // Calculate delay within the group
          groupIndex++; // Increment group index for next element
        }

        // Animation variations based on data-anim type
        const baseAnimation = {
          opacity: 0,
          duration: customDuration,
          ease: "quad.out",
        };

        // Optional: Log delay for debugging
        // console.table(element.className, delay);

        switch (animType) {
          case "fadeslide-up":
            gsap.fromTo(
              element,
              { ...baseAnimation, y: transitionAmount },
              { ...baseAnimation, y: 0, opacity: 1, delay: delay }
            );
            break;

          case "fadeslide-in-left":
            gsap.fromTo(
              element,
              { ...baseAnimation, x: transitionAmountNeg },
              { ...baseAnimation, x: 0, opacity: 1, delay: delay }
            );
            break;

          case "fadeslide-in-right":
            gsap.fromTo(
              element,
              { ...baseAnimation, x: transitionAmount },
              { ...baseAnimation, x: 0, opacity: 1, delay: delay }
            );
            break;

          case "fadeslide-in":
            gsap.fromTo(
              element,
              { ...baseAnimation, x: fromX },
              { ...baseAnimation, x: 0, opacity: 1, delay: delay }
            );
            break;

          case "fade":
            gsap.fromTo(element, baseAnimation, {
              ...baseAnimation,
              opacity: 1,
              delay: delay,
            });
            break;
        }
      },
    });
  });
}

// Menu Open Logo Animation
function menuOpenLogoAnimation() {
  // Animate Logo Color on Menu Open and Close
  let initialLogoColor = false;
  $(".nav_btn_wrap, .nav_menu_backdrop, .w-nav-overlay").on(
    "click",
    function () {
      let heroLogo = $(".nav_logo_wrap");
      let isOpen = $(".nav_btn_wrap").hasClass("w--open"); // Fixed the class name for checking the open state
      if (!isOpen) {
        let compStyles = getComputedStyle(heroLogo[0]);
        initialLogoColor = compStyles.getPropertyValue("color");
        // console.log(initialLogoColor);
        // console.log(isOpen);
      }

      const animateLogo = gsap.to(heroLogo, {
        color: isOpen && initialLogoColor ? initialLogoColor : "#FFFFFF",
        duration: 0.5,
        ease: "in-out",
        onComplete: function () {
          if (isOpen) {
            // $(heroLogo).css("color", "inherit");
            // Remove the inline styles after animation completes and menu is closed
            heroLogo[0].style.removeProperty("color");
          }
        },
      });
    }
  );
}

// Nav Animation on Scroll
function navAnimationOnScroll() {
  // Retrieve the initial value of --theme--text before any GSAP manipulation
  const navElement = document.querySelector(".nav_component");
  const initialTextColor = getComputedStyle(navElement)
    .getPropertyValue("--theme--text")
    .trim();
  const initialTextInvertColor = getComputedStyle(navElement)
    .getPropertyValue("--theme--text-invert")
    .trim();

  // Calculate the current --nav--height
  function calculateNavHeight() {
    const vw = window.innerWidth / 100; // Convert to vw units

    // Values from your clamp function:
    const minRem = 5;
    const maxRem = 10.9375;

    // Breaking down the middle value: 3.304rem + 8.48vw
    const baseRem = 3.304;
    const vwMultiplier = 8.48;

    // Calculate the fluid value (middle part of clamp)
    const fluidValue = baseRem + (vwMultiplier * vw) / 16;

    // Apply the clamp logic
    const finalRemValue = Math.min(Math.max(minRem, fluidValue), maxRem);

    // Convert to pixels (1rem = 16px)
    // return Math.round(finalRemValue * 16);

    return finalRemValue;
  }

  // You can then use it like:
  let initialHeightRem = calculateNavHeight();

  // And update it on resize if needed:
  window.addEventListener("resize", () => {
    initialHeightRem = calculateNavHeight();
  });

  gsap.to(".nav_wrap", {
    scrollTrigger: {
      start: "20px top",
      end: "150px",
      scrub: true,
      ease: "power2.inOut",
      onUpdate: (self) => {
        const progress = self.progress;

        // console.log(initialHeightPx, initialHeightRem);
        const finalHeight = 5;
        const currentHeight =
          initialHeightRem + (finalHeight - initialHeightRem) * progress;

        // Update nav height variable
        document.documentElement.style.setProperty(
          "--nav--height",
          `${currentHeight}rem`
        );

        // Get the final color (e.g., --swatch--light)
        const finalTextColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--swatch--light")
          .trim();
        // Get the final color (e.g., --swatch--dark)
        const finalTextInvertColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--swatch--dark")
          .trim();

        // Interpolate color and update variable
        const interpolatedColor = gsap.utils.interpolate(
          initialTextColor,
          finalTextColor,
          progress
        );
        // Interpolate invert color and update variable
        const interpolatedInvertColor = gsap.utils.interpolate(
          initialTextInvertColor,
          finalTextInvertColor,
          progress
        );
        navElement.style.setProperty("--theme--text", interpolatedColor);
        navElement.style.setProperty(
          "--theme--text-invert",
          interpolatedInvertColor
        );
      },
      onLeaveBack: () => {
        // Add a slight delay before removing styles
        setTimeout(() => {
          navElement.style.removeProperty("--theme--text");
          navElement.style.removeProperty("--theme--text-invert");
          document.documentElement.style.removeProperty("--nav--height");
        }, 150); // Delay to ensure animation finishes
      },
    },
    backgroundColor: "rgba(20, 18, 16, 1)", // Desired background color
    duration: 1,
  });
}

// List Timer Animation
function listTimerAnimation() {
  const containers = document.querySelectorAll(".list-timer_inner_list");
  
  if (containers.length) {
    containers.forEach((container) => {
      const listItems = container.querySelectorAll(".list-timer_inner_list_item");
      let activeItem = listItems[0]; // Default active item is the first one
      let isPaused = false;
      
      // Set up default state: first item active
      listItems.forEach((item, index) => {
        const circle = item.querySelector("circle");
        if (!circle) {
          console.warn(`Circle element not found in item ${index}`);
          return;
        }
        if (index === 0) {
          item.classList.add("is-active"); // First item is active
          gsap.set(circle, { strokeDashoffset: 0 }); // Fully fill the first item's circle
        } else {
          gsap.set(circle, { strokeDashoffset: 101 }); // Reset others
        }
      });

      // Handle item click to set active state
      listItems.forEach((item, index) => {
        const circle = item.querySelector("circle");

        if (!circle) {
          console.warn(`Circle element not found in item ${index}`);
          return;
        }

        item.addEventListener("click", () => {
          if (activeItem !== item) {
            // Deactivate previous active item
            activeItem.classList.remove("is-active");
            gsap.set(activeItem.querySelector("circle"), { strokeDashoffset: 101 });

            // Activate clicked item
            item.classList.add("is-active");
            gsap.set(circle, { strokeDashoffset: 0 });

            // Update activeItem reference
            activeItem = item;
          }
        });
      });

      // Click outside any item to reset to the first item
      document.addEventListener("click", (event) => {
        if (!container.contains(event.target)) {
          // Reset to the first item
          if (activeItem !== listItems[0]) {
            activeItem.classList.remove("is-active");
            gsap.set(activeItem.querySelector("circle"), { strokeDashoffset: 101 });

            listItems[0].classList.add("is-active");
            gsap.set(listItems[0].querySelector("circle"), { strokeDashoffset: 0 });

            activeItem = listItems[0]; // Update reference to first item
          }
        }
      });
    });
  } else {
    console.warn("Required elements for list timer animation not found");
    return;
  }
}

// Swiper
function swipers() {
  // Projects Slider
  if (document.querySelector(".swiper.swiper-projects")) {
    console.log("projects swiper(s) exists");
    const projectSwiperWraps = document.querySelectorAll(
      ".project-slider_slider_wrap"
    );
    projectSwiperWraps.forEach((wrap) => {
      const swiperEl = wrap.querySelector(".swiper.swiper-projects");
      const scrollbarEl = wrap.querySelector(".swiper-projects-scrollbar");
      const prevBtn = wrap.querySelector(".swiper-projects-prev");
      const nextBtn = wrap.querySelector(".swiper-projects-next");

      new Swiper(swiperEl, {
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 500,
        loop: true,
        lazyPreloadPrevNext: 3,
        loopAdditionalSlides: 3, // Preload extra looped slides
        grabCursor: true,
        scrollbar: {
          el: scrollbarEl,
          draggable: true,
          dragSize: 120,
        },
        navigation: {
          prevEl: prevBtn,
          nextEl: nextBtn,
        },
        breakpoints: {
          800: {
            slidesPerView: 2,
            scrollbar: {
              dragSize: 240,
            },
          },
          1300: {
            slidesPerView: 3,
            scrollbar: {
              dragSize: 412,
            },
          },
        },
      });

      const scrollbarDrag = scrollbarEl.querySelector(".swiper-scrollbar-drag");

      // Function to set grab cursor (mimicking Swiper's grabCursor behavior)
      function setGrabCursor() {
        scrollbarDrag.style.cursor = "grab";
        scrollbarDrag.style.touchAction = "none"; // Prevent default touch scrolling issues
      }

      // Function to set grabbing cursor
      function setGrabbingCursor() {
        scrollbarDrag.style.cursor = "grabbing";
      }

      // Ensure the scrollbar exists before adding event listeners
      if (scrollbarDrag) {
        // Apply grab cursor when pointer enters scrollbar
        scrollbarDrag.addEventListener("pointerenter", setGrabCursor);

        // Change to grabbing on pointer down (start dragging)
        scrollbarDrag.addEventListener("pointerdown", (event) => {
          if (event.pointerType === "mouse") {
            // Ensure it's not a touch event
            setGrabbingCursor();
          }
        });

        // Reset to grab cursor when dragging stops
        document.addEventListener("pointerup", () => {
          setGrabCursor();
        });

        // Reset cursor when mouse leaves the scrollbar drag
        scrollbarDrag.addEventListener("pointerleave", () => {
          setGrabCursor();
        });
      }
    });
  }

  // Image Slider
  if (document.querySelector(".swiper.image-slider_swiper")) {
    console.log("image swiper(s) exists");
    const imageSwiperWraps = document.querySelectorAll(".image-slider_wrap");
    imageSwiperWraps.forEach((wrap) => {
      const mainSwiperEl = wrap.querySelector(".swiper.image-slider_swiper");
      const thumbSwiperEl = wrap.querySelector(
        ".swiper.image-slider_thumb-swiper"
      );
      const thumbSwiperEl2 = wrap.querySelector(
        ".swiper.image-slider_thumb-swiper-2"
      );
      const prevBtn = wrap.querySelector(".image-slider_nav_prev");
      const nextBtn = wrap.querySelector(".image-slider_nav_next");

      const mainSwiper = new Swiper(mainSwiperEl, {
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 700,
        loop: true,
        initialSlide: 0,
        effect: "fade",
        // virtualTranslate: true,
        allowTouchMove: false,
        // navigation: {
        //   prevEl: prevBtn,
        //   nextEl: nextBtn,
        // },
        navigation: false, // Disable default navigation
      });

      const thumbSwiper = new Swiper(thumbSwiperEl, {
        slidesPerView: "auto",
        spaceBetween: 20,
        speed: 500,
        loop: true,
        initialSlide: 1,
        effect: "fade",
        // virtualTranslate: true,
        allowTouchMove: false,
        // navigation: {
        //   prevEl: prevBtn,
        //   nextEl: nextBtn,
        // },
        navigation: false, // Disable default navigation
      });

      const thumbSwiper2 = new Swiper(thumbSwiperEl2, {
        slidesPerView: "auto",
        spaceBetween: 20,
        speed: 300,
        loop: true,
        initialSlide: 2,
        effect: "fade",
        // virtualTranslate: true,
        allowTouchMove: false,
        // navigation: {
        //   prevEl: prevBtn,
        //   nextEl: nextBtn,
        // },
        navigation: false, // Disable default navigation
      });

      let isAnimating = false;
      const delay = 750;

      prevBtn.addEventListener("click", () => {
        if (!isAnimating) {
          isAnimating = true;
          mainSwiper.slidePrev();
          thumbSwiper.slidePrev();
          thumbSwiper2.slidePrev();
          setTimeout(() => {
            isAnimating = false;
          }, delay);
        }
      });

      nextBtn.addEventListener("click", () => {
        if (!isAnimating) {
          isAnimating = true;
          mainSwiper.slideNext();
          thumbSwiper.slideNext();
          thumbSwiper2.slideNext();
          setTimeout(() => {
            isAnimating = false;
          }, delay);
        }
      });
    });
  }
}

// Accordions
function accordions() {
  const accordions = document.querySelectorAll(".g_accordion_wrap");

  if (!accordions.length) {
    console.warn("No accordion elements found.");
    return;
  }

  accordions.forEach((accordion) => {
    const section = accordion.closest(".split-panel-accordion_wrap");
    const headers = accordion.querySelectorAll(".g_accordion_header");
    const contents = accordion.querySelectorAll(".g_accordion_content");
    const images = section.querySelectorAll(
      ".split-panel-accordion_grid_image"
    );
    const allowMultiple = accordion.dataset.allowMultiple === "true";
    let activeIndex = allowMultiple ? null : 0;

    // Initialize all ARIA attributes and content states
    headers.forEach((header, index) => {
      const content = contents[index];

      // Set ARIA attributes
      header.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      header.setAttribute("aria-controls", `accordion-content-${index}`);
      // header.setAttribute("role", "button");
      // header.setAttribute("tabindex", "0");

      content.setAttribute("id", `accordion-content-${index}`);
      content.setAttribute("aria-labelledby", `accordion-header-${index}`);
      // content.setAttribute("role", "region");

      // Ensure only the first item is visible initially (if multiple aren't allowed)
      if (index === 0 && !allowMultiple) {
        content.style.maxHeight = content.scrollHeight + "px";
        header.setAttribute("aria-expanded", "true");
      } else {
        content.style.maxHeight = "0";
        header.setAttribute("aria-expanded", "false");
      }
    });

    // Function to toggle accordion
    const toggleAccordion = (index) => {
      const header = headers[index];
      const content = contents[index];
      const isActive = header.getAttribute("aria-expanded") === "true";

      if (!allowMultiple && activeIndex !== null && activeIndex !== index) {
        // Close currently active section (if not allowing multiple)
        closeAccordion(activeIndex);
      }

      if (isActive) {
        closeAccordion(index);
      } else {
        openAccordion(index);
      }
    };

    // Function to open an accordion section
    const openAccordion = (index) => {
      const header = headers[index];
      const content = contents[index];
      if (images.length > 1) {
        const image = Array.from(images).find((image) => {
          return image.dataset.imageIndex == index + 1;
        });
        images.forEach((image) => {
          image.classList.remove("is-active");
        });
        if (image) {
          image.classList.add("is-active");
        }
      }

      header.setAttribute("aria-expanded", "true");
      content.style.maxHeight = content.scrollHeight + "px";
      activeIndex = index;
    };

    // Function to close an accordion section
    const closeAccordion = (index) => {
      const header = headers[index];
      const content = contents[index];

      header.setAttribute("aria-expanded", "false");
      content.style.maxHeight = "0";
      if (!allowMultiple) activeIndex = null;
    };

    // Add event listeners for headers
    headers.forEach((header, index) => {
      header.addEventListener("click", () => toggleAccordion(index));

      // Keyboard navigation
      header.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleAccordion(index);
        }

        if (event.key === "ArrowDown" && index < headers.length - 1) {
          event.preventDefault();
          headers[index + 1].focus();
        } else if (event.key === "ArrowUp" && index > 0) {
          event.preventDefault();
          headers[index - 1].focus();
        } else if (event.key === "Home") {
          event.preventDefault();
          headers[0].focus();
        } else if (event.key === "End") {
          event.preventDefault();
          headers[headers.length - 1].focus();
        }
      });
    });

    // Add focus listeners for nested buttons
    contents.forEach((content, index) => {
      const nestedButtons = content.querySelectorAll('button, [role="button"]');
      nestedButtons.forEach((button) => {
        button.addEventListener("focus", () => {
          if (activeIndex !== index) {
            toggleAccordion(index);
          }
        });
      });
    });
  });
}

// Odometers
function odometers() {
  const statSections = document.querySelectorAll(".stat-grid_wrap");
  if (statSections.length) {
    statSections.forEach((section) => {
      const statValues = section.querySelectorAll(".stat-grid_stat_value_num");
      const statInit = function (statValues) {
        statValues.forEach(function (statVal, index) {
          const originalValue = statVal.innerHTML.trim();
          const [integerPart, decimalPart] = originalValue.split(".");
          const zeroIntegerPart = integerPart.replace(/\d/g, "0"); // Convert integer part to zeroes while preserving commas
          const formattedZeroValue =
            decimalPart !== undefined
              ? `${zeroIntegerPart}.${"0".repeat(decimalPart.length)}`
              : zeroIntegerPart; // Preserve decimal places if present

          statVal.innerHTML = formattedZeroValue; // Start from the correct number of digits
          // console.log(
          //   `Original: ${originalValue}, Zeroed: ${formattedZeroValue}`
          // );

          var od = new Odometer({
            el: statVal,
            format: "(,ddd).dd",
            value: formattedZeroValue,
            duration: 3000,
          });
          var delay = index * 0.15;
          gsap.to(statVal, {
            ease: "none",
            scrollTrigger: {
              trigger: statVal,
              start: "top 90%",
              invalidateOnRefresh: !0,
              scrub: 0,
              onEnter: function onEnter() {
                gsap.delayedCall(delay, function () {
                  od.update(originalValue);
                });
              },
            },
          });
        });
      };
      statInit(statValues);
    });
  }
}

// Project Category Dropdown
function projectCategoryDropdown() {
  // Make the dropdown accessible via keyboard
  document
    .querySelectorAll(".project-showcase_filter_form_select_wrap")
    .forEach((dropdownWrap) => {
      const dropdown = dropdownWrap.querySelector(
        ".project-showcase_filter_form_select"
      );
      const dropdownList = dropdownWrap.querySelector(
        ".project-showcase_filter_form_select-dropdown"
      );
      const checkboxWraps = dropdownList.querySelectorAll(
        ".project-showcase_filter_form_select_checkbox_wrap"
      );

      // Add ARIA attributes
      dropdown.setAttribute("role", "combobox");
      dropdown.setAttribute("aria-expanded", "false");
      dropdown.setAttribute("aria-controls", "filter-dropdown");
      dropdown.setAttribute("tabindex", "0");
      dropdownList.id = "filter-dropdown";

      // Initially set tabindex to -1 for checkbox wraps
      checkboxWraps.forEach((wrap) => {
        wrap.setAttribute("tabindex", "-1");
      });

      // Toggle dropdown on click
      dropdown.addEventListener("click", (e) => {
        if (
          !e.target.closest(".project-showcase_filter_form_select-dropdown")
        ) {
          toggleDropdown(dropdown, checkboxWraps);
        }
      });

      // Handle keyboard navigation
      dropdown.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            toggleDropdown(dropdown, checkboxWraps);
            break;
          case "Escape":
            if (dropdown.classList.contains("is-open")) {
              e.preventDefault();
              closeDropdown(dropdown, checkboxWraps);
            }
            break;
        }
      });

      // Add keyboard event listeners to all checkbox wraps
      checkboxWraps.forEach((wrap) => {
        wrap.addEventListener("keydown", (e) => {
          switch (e.key) {
            case "Enter":
              e.preventDefault();
              wrap.click();
              break;
            case "Escape":
              if (dropdown.classList.contains("is-open")) {
                e.preventDefault();
                closeDropdown(dropdown, checkboxWraps);
              }
              break;
          }
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!dropdownWrap.contains(e.target)) {
          closeDropdown(dropdown, checkboxWraps);
        }
      });
    });

  function toggleDropdown(dropdown, checkboxWraps) {
    const isOpen = dropdown.classList.contains("is-open");
    dropdown.classList.toggle("is-open");
    dropdown.setAttribute("aria-expanded", !isOpen);

    // Update tabindex for checkbox wraps
    checkboxWraps.forEach((wrap) => {
      wrap.setAttribute("tabindex", isOpen ? "-1" : "1");
    });
  }

  function closeDropdown(dropdown, checkboxWraps) {
    dropdown.classList.remove("is-open");
    dropdown.setAttribute("aria-expanded", "false");

    // Set tabindex to -1 for all checkbox wraps
    checkboxWraps.forEach((wrap) => {
      wrap.setAttribute("tabindex", "-1");
    });
  }
}

// Return Tables Dropdown
function returnTablesDropdown() {
  // Make the dropdown accessible via keyboard
  document
    .querySelectorAll(".returns-tables_filter_form_select_wrap")
    .forEach((dropdownWrap) => {
      const dropdown = dropdownWrap.querySelector(
        ".returns-tables_filter_form_select"
      );
      const dropdownList = dropdownWrap.querySelector(
        ".returns-tables_filter_form_select-dropdown"
      );
      const optionWraps = dropdownList.querySelectorAll(
        ".returns-tables_filter_form_select_option_wrap"
      );

      // Add ARIA attributes
      dropdown.setAttribute("aria-expanded", "false");
      dropdown.setAttribute("aria-controls", "class-dropdown");
      dropdown.setAttribute("tabindex", "0");
      dropdownList.id = "class-dropdown";

      // Initially set tabindex to -1 for option wraps
      optionWraps.forEach((wrap) => {
        wrap.setAttribute("tabindex", "-1");
      });

      // Toggle dropdown on click
      dropdown.addEventListener("click", (e) => {
        // console.log("click");
        if (!e.target.closest(".returns-tables_filter_form_select-dropdown")) {
          toggleDropdown(dropdown, optionWraps);
        }
      });

      // Handle keyboard navigation
      dropdown.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            toggleDropdown(dropdown, optionWraps);
            break;
          case "Escape":
            if (dropdown.classList.contains("is-open")) {
              e.preventDefault();
              closeDropdown(dropdown, optionWraps);
            }
            break;
        }
      });

      // Add keyboard event listeners to all checkbox wraps
      optionWraps.forEach((wrap) => {
        wrap.addEventListener("click", (e) => {
          const selectedClass = wrap.dataset.class;
          const targetElements = document.querySelectorAll(
            `.returns-tables_class_wrap[data-class="${selectedClass}"]`
          );
          const allTargetElements = document.querySelectorAll(
            ".returns-tables_class_wrap"
          );
          const allOptionWraps = document.querySelectorAll(
            ".returns-tables_filter_form_select_option_wrap"
          );

          allTargetElements.forEach((el) => {
            el.classList.remove("is-active");
            // el.style.opacity = 0;
            // setTimeout(() => {
            //   el.style.display = "none";
            //   el.classList.remove("is-active");
            // }, 250);
          });

          targetElements.forEach((el) => {
            el.classList.add("is-active");
            // setTimeout(() => {
            //   el.style.display = "block";
            //   el.style.opacity = 1;
            //   el.classList.add("is-active"); // Trigger the transition
            // }, 250);
          });

          allOptionWraps.forEach((option) => {
            // Remove is-active from all options
            option.classList.remove("is-active");
          });

          wrap.classList.add("is-active"); // Add is-active to the clicked wrap

          document.querySelector(
            ".returns-tables_filter_form_select_text"
          ).textContent = wrap.textContent;
          closeDropdown(dropdown, optionWraps);
        });

        wrap.addEventListener("keydown", (e) => {
          switch (e.key) {
            case "Enter":
              e.preventDefault();
              wrap.click();
              break;
            case "Escape":
              if (dropdown.classList.contains("is-open")) {
                e.preventDefault();
                closeDropdown(dropdown, optionWraps);
              }
              break;
          }
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!dropdownWrap.contains(e.target)) {
          closeDropdown(dropdown, optionWraps);
        }
      });
    });

  function toggleDropdown(dropdown, optionWraps) {
    const isOpen = dropdown.classList.contains("is-open");
    dropdown.classList.toggle("is-open");
    dropdown.setAttribute("aria-expanded", !isOpen);

    // Update tabindex for checkbox wraps
    optionWraps.forEach((wrap) => {
      wrap.setAttribute("tabindex", isOpen ? "-1" : "1");
    });
  }

  function closeDropdown(dropdown, optionWraps) {
    dropdown.classList.remove("is-open");
    dropdown.setAttribute("aria-expanded", "false");

    // Set tabindex to -1 for all checkbox wraps
    optionWraps.forEach((wrap) => {
      wrap.setAttribute("tabindex", "-1");
    });
  }
}

// Pie Charts
function pieCharts() {
  const chartSections = document.querySelectorAll(".pie-chart-section_wrap");
  if (chartSections.length) {
    chartSections.forEach(function (section) {
      let sectionBackground = getComputedStyle(section).getPropertyValue(
        "--theme--background"
      );

      const chartConfigs = [];

      section
        .querySelectorAll(".pie-chart-section_grid_item")
        .forEach((item) => {
          const canvas = item.querySelector(".pie-chart-section_pie_canvas");
          const title = item
            .querySelector(".pie-chart-section_pie_label")
            .textContent.trim();

          // Get the chart data from the table rows
          const rows = item.querySelectorAll(
            ".pie-chart-section_grid_item_table_row"
          );
          const data = Array.from(rows).map((row) => {
            const capacityText = row
              .querySelector(
                ".pie-chart-section_grid_item_table_row_label_wrap + *"
              )
              .textContent.trim();
            return parseFloat(capacityText.replace("%", "").trim());
          });

          // Define the color array based on the number of rows (in this case, we assume the same set of colors for all)
          const colors = [
            cssvar("--swatch--green"),
            cssvar("--swatch--light-green"),
            cssvar("--swatch--gold"),
            cssvar("--swatch--light-blue"),
          ];

          // Get the chart ID (assuming the canvas ID matches the chart ID)
          const chartId = canvas.id;

          // Push the populated chart configuration into the array
          chartConfigs.push({
            id: chartId,
            title: title,
            data: data,
            colors: colors,
          });
        });

      function createChart(config) {
        const ctx = document.getElementById(config.id).getContext("2d");

        return new Chart(ctx, {
          type: "doughnut",
          data: {
            datasets: [
              {
                data: [0, 0, 0, 0], // Start at zero
                backgroundColor: config.colors,
                borderWidth: 1,
                borderColor: sectionBackground,
                cutout: "75%",
              },
            ],
          },
          options: {
            responsive: true,
            events: [],
            animation: false,
          },
        });
      }

      // GSAP Animation Fix - Animate Each Value in the Array Individually
      function animateChart(chart, chartId, targetData, chartIndex) {
        let proxy = { values: [0, 0, 0, 0] };
        let chartContainer = $(`#${chartId}`).parent();

        const tl = gsap.timeline({
          delay: chartIndex * 0.75,
        });

        tl.to(chartContainer, {
          opacity: 1,
          duration: 1,
          ease: "quad.out",
        });

        targetData.forEach((endValue, i) => {
          tl.to(
            proxy.values,
            {
              [i]: endValue, // Animate this specific index
              duration: 1,
              ease: "quad.out",
              onUpdate: function () {
                chart.data.datasets[0].data[i] = proxy.values[i]; // Update chart segment
                chart.update();
              },
            },
            i * 0.5
          ); // Stagger effect based on index
        });
      }

      // Initialize charts
      const charts = chartConfigs.map((config, index) => {
        return {
          chart: createChart(config),
          id: config.id,
          data: config.data,
          index,
        };
      });

      // Animate when in view using GSAP ScrollTrigger
      charts.forEach(({ chart, id, data, index }) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          once: true,
          onEnter: () => animateChart(chart, id, data, index),
        });
      });
    });
  }
}

// Strategies map
function strategiesMaps() {
  const strategyMaps = document.querySelectorAll(".strategies-map_wrap");
  if (strategyMaps.length) {
    strategyMaps.forEach(function (section) {
      const strategies = section.querySelectorAll(
        ".strategies-map_content_list_item"
      );
      let allStates = [];

      // Populate the allStates array with unique state values from the items.
      strategies.forEach((strategy) => {
        const statesAttr = strategy.dataset.states;
        if (statesAttr) {
          const states = statesAttr
            .split(",")
            .map((state) => state.trim().toLowerCase());
          states.forEach((state) => {
            if (!allStates.includes(state)) {
              allStates.push(state);
            }
          });
        }
      });

      // Get all the map paths.
      const mapPaths = section.querySelectorAll(
        "svg.us-map-svg [data-state]"
      );

      // Attach click and keydown event listeners to each strategy item.
      strategies.forEach((strategy) => {
        // Ensure the element is keyboard focusable.
        // (Alternatively, add tabindex="0" directly to your HTML)
        strategy.setAttribute("tabindex", "0");

        // If the strategy is already active on page load, activate its map paths.
        if (strategy.classList.contains("is-active")) {
          activateStrategy(strategy);
        }

        strategy.addEventListener("click", function () {
          // Remove .is-active from all strategy items and map paths.
          strategies.forEach((item) => item.classList.remove("is-active"));
          mapPaths.forEach((path) => path.classList.remove("is-active"));

          // Mark the clicked strategy as active.
          strategy.classList.add("is-active");

          activateStrategy(strategy);
        });

        // Listen for Enter or Space key presses.
        strategy.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault(); // Prevent scrolling (for Space key)
            strategy.click(); // Simulate a click
          }
        });

        // Function to activate the proper map paths for a given strategy.
        function activateStrategy(strat) {
          if (strat.dataset.strategy === "all") {
            // Activate all paths with a data-state in the allStates array.
            mapPaths.forEach((path) => {
              const stateVal = path.dataset.state.toLowerCase();
              if (allStates.includes(stateVal)) {
                path.classList.add("is-active");
              }
            });
          } else {
            // Activate paths based on the strat's data-states.
            const statesAttr = strat.dataset.states;
            if (statesAttr) {
              const states = statesAttr
                .split(",")
                .map((state) => state.trim().toLowerCase());
              mapPaths.forEach((path) => {
                const stateVal = path.dataset.state.toLowerCase();
                if (states.includes(stateVal)) {
                  path.classList.add("is-active");
                }
              });
            }
          }
        }
      });

      // Make sure that if the user tabs away from the list, the 'all' option is reset as active.
      const listContainer = section.querySelector(
        ".strategies-map_content_list"
      );
      listContainer.addEventListener("focusout", function (e) {
        // Check if the next focused element (e.relatedTarget) is outside the list container.
        if (!listContainer.contains(e.relatedTarget)) {
          // Find the 'all' strategy element.
          const allStrategy = listContainer.querySelector(
            '.strategies-map_content_list_item[data-strategy="all"]'
          );
          if (allStrategy) {
            // Remove active classes from all strategies and map paths.
            strategies.forEach((item) => item.classList.remove("is-active"));
            mapPaths.forEach((path) => path.classList.remove("is-active"));
            // Activate the 'all' strategy.
            allStrategy.classList.add("is-active");
            // Simulate activation to update the map paths.
            // (Note: if the user tabs back into the list, the 'all' option will be pre-selected.)
            allStrategy.click();
          }
        }
      });
    });
  }
}

// Projects map
function projectsMap() {
  const maps = document.querySelectorAll(".project-map_map");
  const apiKey = "AIzaSyDWJWR2YCwbskSPkiOgDJB-Ywo4jUDEHJw";

  if (maps.length) {
    // Load Google Maps API dynamically
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMaps&libraries=marker`;
    script.defer = true;
    document.head.appendChild(script);
  }
}

function initMaps() {
  const maps = document.querySelectorAll(".project-map_map");
  const mapStylesId = "bb9cbb04e1c59a89";
  const centerCoordinates = { lat: 39.998625, lng: -98.503507 }; // Change to your desired coordinates
  let currentInfoWindow = null; // Keep track of the currently open InfoWindow

  let defaultZoom = parseFloat(
    Math.max(3.35, Math.min(4.75, window.innerWidth * 0.0026 + 1)).toFixed(2)
  );

  // Define the bounding box
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(26, -130), // Southwest
    new google.maps.LatLng(50, -67) // Northeast
  );

  function getProjectSitesData() {
    const projectElements = document.querySelectorAll(
      ".project-map_sites_wrap .w-dyn-item"
    );
    const projects = [];

    projectElements.forEach((element) => {
      const project = {
        name: element.dataset.name || "",
        id: element.dataset.id || "",
        fund: element.dataset.fund || "",
        technology: element.dataset.technology || false,
        city: element.dataset.city || false,
        county: element.dataset.county || false,
        state: element.dataset.state || false,
        siteCapacityAc: element.dataset.siteCapacityAc || false,
        siteCapacityDc: element.dataset.siteCapacityDc || false,
        storageCapacityAc: element.dataset.storageCapacityAc || false,
        storageEnergy: element.dataset.storageEnergy || false,
        location: `${element.dataset.city || ""}, ${
          element.dataset.state || ""
        }`,
        locationKey: `${element.dataset.city || ""}, ${
          element.dataset.county || ""
        }, ${element.dataset.state || ""}`,
        year: element.dataset.year || false,
        status: element.dataset.status || false,
        lat: parseFloat(element.dataset.latitude) || null,
        lng: parseFloat(element.dataset.longitude) || null,
      };

      projects.push(project);
    });

    return projects;
  }

  setTimeout(() => {
    const projects = getProjectSitesData();
    console.log(projects.length);

    maps.forEach((mapInstance) => {
      const projectsMap = new google.maps.Map(mapInstance, {
        center: bounds.getCenter(), // centerCoordinates
        zoom: defaultZoom,
        mapId: mapStylesId, // Uses your custom map style
        disableDefaultUI: true, // Hides all UI controls
        // gestureHandling: "none", // Prevents zooming and panning
        zoomControl: false, // Ensures zoom control buttons are not visible
        minZoom: defaultZoom - 0.5,
        maxZoom: defaultZoom + 4,
        isFractionalZoomEnabled: true, // Ensure fractional zoom is enabled
      });

      projectsMap.addListener("click", function () {
        // console.log("projectsMap clicked");
        if (currentInfoWindow && currentInfoWindow.isOpen) {
          currentInfoWindow.close();
          // projectsMap.panTo(bounds.getCenter());
          // fitMapToBounds();
        }
      });

      let resetButton = mapInstance.parentElement.querySelector(
        ".project-map_zoom_btn.is-reset"
      );
      let zoomInButton = mapInstance.parentElement.querySelector(
        ".project-map_zoom_btn.is-zoom-in"
      );
      let zoomOutButton = mapInstance.parentElement.querySelector(
        ".project-map_zoom_btn.is-zoom-out"
      );

      // Handle zoom in
      zoomInButton.addEventListener("click", () => {
        const currentZoom = projectsMap.getZoom();
        projectsMap.setZoom(currentZoom + 0.5);
      });

      // Handle zoom out
      zoomOutButton.addEventListener("click", () => {
        const currentZoom = projectsMap.getZoom();
        projectsMap.setZoom(currentZoom - 0.5);
      });

      // Handle reset
      resetButton.addEventListener("click", () => {
        fitMapToBounds();
        updateResetButtonVisibility();
      });

      // Helper: compare with precision
      function isAtDefaultZoom(currentZoom) {
        return Math.abs(currentZoom - defaultZoom) < 0.26;
      }

      function updateResetButtonVisibility() {
        const currentZoom = projectsMap.getZoom();
        // console.log(currentZoom, defaultZoom);
        resetButton.style.display = isAtDefaultZoom(currentZoom)
          ? "none"
          : "flex";
      }

      projectsMap.addListener("zoom_changed", () => {
        zoomLevel = projectsMap.getZoom();
        updateResetButtonVisibility();
      });
      setTimeout(updateResetButtonVisibility, 500);

      // Define colors based on project type
      // Former stroke color: #F2E9DF
      const typeColors = {
        solar: { fill: "#007900", stroke: "#FFFFFF" }, // Green for Solar
        "solar + storage": { fill: "#8EB885", stroke: "#FFFFFF" }, // Light Green for Solar + Storage
        storage: { fill: "#B4904E", stroke: "#FFFFFF" }, // Gold for Storage
        wind: { fill: "#7DAFC5", stroke: "#FFFFFF" }, // Blue for Wind
        ev: { fill: "#8EB885", stroke: "#FFFFFF" }, // Example for EV
        "energy efficiency": { fill: "#8EB885", stroke: "#FFFFFF" }, // Example for Energy Efficiency
      };

      projects.forEach((project) => {
        let markerEl = document.createElement("div");
        markerEl.classList.add("map-marker");
        let markerPosition = false;
        // Store marker position
        if (project.lat && project.lng) {
          markerPosition = { lat: project.lat, lng: project.lng };
        }

        // console.log("marker position: ", markerPosition);

        if (markerPosition) {
          const technologyKey = project.technology?.toLowerCase() || "solar"; // Default to "solar" if undefined
          const colors = {
            fill: typeColors[technologyKey].fill || "#007900",
            stroke: typeColors[technologyKey].stroke || "#FFFFFF",
          }; // Default color

          // Create an SVG element dynamically
          const svgMarker = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svgMarker.setAttribute("width", "18");
          svgMarker.setAttribute("height", "23");
          svgMarker.setAttribute("viewBox", "0 0 11 13.3");
          svgMarker.innerHTML = `
            <path d="M5.5,13.3c-.1,0-.2,0-.4,0-.1,0-.2,0-.3-.2-1.6-1.4-2.8-2.7-3.6-3.9-.8-1.2-1.2-2.4-1.2-3.5C0,3.9.6,2.5,1.7,1.5c1.1-1,2.4-1.5,3.8-1.5s2.7.5,3.8,1.5c1.1,1,1.7,2.4,1.7,4.1s-.4,2.3-1.2,3.5c-.8,1.2-2,2.5-3.6,3.9-.1,0-.2.2-.3.2-.1,0-.2,0-.3,0Z" style="fill: ${colors.stroke};"/>
            <path d="M5.5,1c-1.2,0-2.2.4-3.1,1.3-.9.8-1.3,1.9-1.3,3.4s.4,1.9,1.1,3c.7,1.1,1.9,2.4,3.4,3.7h0s0,0,0,0c1.5-1.3,2.7-2.6,3.4-3.7.7-1.1,1.1-2.1,1.1-3,0-1.4-.4-2.5-1.3-3.4-.9-.8-1.9-1.3-3.1-1.3Z" style="fill: ${colors.fill};"/>
          `;

          markerEl.appendChild(svgMarker);

          // Create an AdvancedMarkerElement using the custom SVG
          let marker = new google.maps.marker.AdvancedMarkerElement({
            position: markerPosition,
            map: projectsMap,
            title: project.name,
            content: markerEl,
          });

          if (window.innerWidth > 768) {
            marker.addListener("click", () => {
              if (currentInfoWindow && currentInfoWindow.isOpen) {
                currentInfoWindow.close();
              }

              let disableAutoPanVar = false;
              let offsetX = -125;
              let offsetY = 0;

              let infoWindowContent = `<div class="project-infowindow above">
                    <div class="project-infowindow__content">
                      <div class="project-infowindow__header">`;

              if (project.name) {
                infoWindowContent += `<p class="project_name">${project.name}</p>`;
              }
              if (project.company) {
                infoWindowContent += `<p class="project_company">${project.company}</p>`;
              }

              infoWindowContent += `</div>`; // Closing header div

              if (project.location) {
                infoWindowContent += `<p class="project_location">${project.location}</p>`;
              }
              if (project.technology) {
                infoWindowContent += `<p class="project_type">${project.technology}</p>`;
              }
              if (project.siteCapacityAc) {
                infoWindowContent += `<p class="project_capacity">${project.siteCapacityAc} MW AC</p>`;
              }
              if (project.siteCapacityDc) {
                infoWindowContent += `<p class="project_capacity">${project.siteCapacityDc} MW DC</p>`;
              }
              if (project.year) {
                infoWindowContent += `<p class="project_year">${project.year}</p>`;
              }
              if (project.status) {
                infoWindowContent += `<p class="project_status">${project.status}</p>`;
              }

              infoWindowContent += `</div>
                          <div class="project-infowindow__arrow"></div>
                        </div>`; // Closing main wrapper

              let infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent,
                disableAutoPan: disableAutoPanVar,
                headerDisabled: false,
                minWidth: 250,
                maxWidth: 250,
                pixelOffset: new google.maps.Size(offsetX, offsetY),
              });

              infoWindow.open({
                anchor: marker,
                map: projectsMap,
                // shouldFocus: disableAutoPanVar,
              });

              currentInfoWindow = infoWindow;
            });
          }

          // bounds.extend(marker.position);
        }
      });

      const padding = window.innerWidth < 768 ? 5 : 15; // Less padding on smaller screens

      // Fit all markers in view
      function fitMapToBounds() {
        if (projects.length > 1) {
          // projectsMap.fitBounds(bounds);
          projectsMap.fitBounds(bounds, {
            top: padding,
            right: padding,
            bottom: padding,
            left: padding, // Adjust padding for spacing
          });
          // drawBoundsRectangle(projectsMap, bounds);
          projectsMap.setZoom(defaultZoom);
        } else {
          // If only one marker, keep a fixed zoom level
          projectsMap.setCenter(bounds.getCenter());
        }
      }

      // Fit the map to bounds initially
      google.maps.event.addListenerOnce(projectsMap, "idle", () => {
        fitMapToBounds();
      });

      // Adjust zoom on window resize
      window.addEventListener("resize", () => {
        google.maps.event.trigger(projectsMap, "resize");
        fitMapToBounds();
      });
    });
  }, 750);

  // Helper function for seeing bounds
  function drawBoundsRectangle(projectsMap, bounds) {
    const rectangle = new google.maps.Rectangle({
      bounds: bounds,
      strokeColor: "#FF0000", // Red border
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000", // Light red fill
      fillOpacity: 0.2,
      map: projectsMap, // Attach to the map
    });

    return rectangle;
  }
}

// Finsweet Stuff
function finsweetStuff() {
  console.log(
    "%c [DEBUG] Starting finsweetStuff",
    "background: #33cc33; color: white"
  );
  window.fsAttributes = window.fsAttributes || [];

  window.fsAttributes.push([
    "cmsfilter",
    (filterInstances) => {
      console.log("cmsfilter Successfully loaded!");

      const [filterInstance] = filterInstances;

      if (filterInstance) {
        const clearLink = document.querySelector(
          '[fs-cmsfilter-element="clear"]'
        );

        const updateClearLinkDisplay = () => {
          filterInstance.filtersActive
            ? (clearLink.style.display = "block")
            : (clearLink.style.display = "none");
        };

        updateClearLinkDisplay();

        filterInstance.listInstance.on("renderitems", (renderedItems) => {
          setTimeout(function () {
            ScrollTrigger.refresh();
          }, 1000);
          setTimeout(() => {
            updateClearLinkDisplay();

            const pageButtons = $(".project-showcase_collection_page-button");
            pageButtons.each(function (index, element) {
              // Get the current text
              let currentText = $(element).text();
              // Format the number
              let formattedNumber = formatNumber(currentText);
              // Set the new formatted text
              $(element).text(formattedNumber);
              // console.log(
              //   `Button ${index} changed from ${currentText} to ${formattedNumber}`
              // );
            });
            // console.log(pageButtons);
          }, 125);
        });
      }
    },
  ]);

  window.fsAttributes.push([
    "cmsload",
    (listInstances) => {
      console.log("cmsload Successfully loaded!");

      const [listInstance] = listInstances;

      if (listInstance) {
        const pageButtons = $(".project-showcase_collection_page-button");
        pageButtons.each(function (index, element) {
          // Get the current text
          let currentText = $(element).text();
          // Format the number
          let formattedNumber = formatNumber(currentText);
          // Set the new formatted text
          $(element).text(formattedNumber);
          // console.log(
          //   `Button ${index} changed from ${currentText} to ${formattedNumber}`
          // );
        });
        // console.log(pageButtons);

        listInstance.on("renderitems", (renderedItems) => {
          setTimeout(function () {
            ScrollTrigger.refresh();
          }, 1000);
          console.log("cmsload rendered");
          pageButtons.each(function (index, element) {
            // Get the current text
            let currentText = $(element).text();
            // Format the number
            let formattedNumber = formatNumber(currentText);
            // Set the new formatted text
            $(element).text(formattedNumber);
            // console.log(
            //   `Button ${index} changed from ${currentText} to ${formattedNumber}`
            // );
          });
        });
        projectsMap();
      } else {
        projectsMap();
      }
    },
  ]);
}

// Auto-Update Copyright Year
function copyrightAutoUpdate() {
  const currentYear = new Date().getFullYear();
  $("[data-copyright-year]").html(currentYear);
}

// Overflow Scroll containers
function overflowScrollContainers() {
  // document
  //   .querySelectorAll(".returns-tables_class_tabs_menu")
  //   .forEach((tabsMenu) => {
  //     tabsMenu.classList.add("u-horizontal-scroll-wrapper");
  //     let tabLinksContainer = document.createElement("div");
  //     tabLinksContainer.classList.add(
  //       "u-horizontal-scroll-container",
  //       "returns-tables_class_tabs_menu",
  //       "w-tab-menu"
  //     );
  //     tabLinksContainer.setAttribute("role", "tablist");
  //     tabsMenu.appendChild(tabLinksContainer);
  //     let tabLinks = tabsMenu.querySelectorAll(
  //       ".returns-tables_class_tab_link"
  //     );
  //     tabLinks.forEach((tabLink) => {
  //       tabLinksContainer.appendChild(tabLink);
  //     });
  //   });

  function updateHorizontalShadows() {
    document
      .querySelectorAll(".u-horizontal-scroll-wrapper")
      .forEach(function (wrapper) {
        const content = wrapper.querySelector(".u-horizontal-scroll-container");
        const hasOverflow = content.scrollWidth > content.clientWidth;
        let shadowTop = document.createElement("div");
        let shadowBottom = document.createElement("div");

        if (!wrapper.querySelector(".shadow--top")) {
          shadowTop.classList.add("shadow", "shadow--top");
          wrapper.appendChild(shadowTop);
        } else {
          shadowTop = wrapper.querySelector(".shadow--top");
        }
        if (!wrapper.querySelector(".shadow--bottom")) {
          shadowBottom.classList.add("shadow", "shadow--bottom");
          wrapper.appendChild(shadowBottom);
        } else {
          shadowBottom = wrapper.querySelector(".shadow--bottom");
        }

        let contentScrollWidth = content.scrollWidth - wrapper.offsetWidth;

        // console.log(hasOverflow);

        if (hasOverflow) {
          let currentScroll = content.scrollLeft / contentScrollWidth;
          shadowTop.style.opacity = currentScroll;
          shadowBottom.style.opacity = 1 - currentScroll;
          content.addEventListener("scroll", function () {
            // console.log("content is being scrolled");
            currentScroll = this.scrollLeft / contentScrollWidth;
            shadowTop.style.opacity = currentScroll;
            shadowBottom.style.opacity = 1 - currentScroll;
          });
        } else {
          shadowTop.style.opacity = 0;
          shadowBottom.style.opacity = 0;
        }
      });
  }

  updateHorizontalShadows();
  window.addEventListener("resize", updateHorizontalShadows);
  document
    .querySelectorAll(".returns-tables_filter_form_select_option_wrap")
    .forEach((selectOption) => {
      selectOption.addEventListener("click", updateHorizontalShadows);
    });
  document
    .querySelectorAll(".returns-tables_class_tab_link")
    .forEach((tabLink) => {
      tabLink.addEventListener("click", () => {
        setTimeout(updateHorizontalShadows, 150);
      });
    });
}

// Init Function
const init = () => {
  console.log("%cRun init", "color: lightgreen;");

  enableLenis();
  scrollMarginFix();
  imageSrcSetFix();
  navSubmenus();
  initScrollAnimations();
  menuOpenLogoAnimation();
  navAnimationOnScroll();
  listTimerAnimation();
  swipers();
  accordions();
  odometers();
  projectCategoryDropdown();
  returnTablesDropdown();
  pieCharts();
  strategiesMaps();
  // projectsMap(); // Gets called within FinsweetStuff now
  finsweetStuff();
  copyrightAutoUpdate();
  overflowScrollContainers();
}; // end init

$(window).on("load", init);
