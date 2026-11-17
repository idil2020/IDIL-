
/* FIND ALL WEBSITE SECTIONS */
const pages = document.querySelectorAll(".page");

/* FIND ALL NAVIGATION LINKS */
const navLinks = document.querySelectorAll("[data-page]");

/* FIND THE MOBILE MENU CONTROLS */
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");


/* SHOW ONE SECTION AT A TIME */
function showPage(pageId) {
    const selectedPage = document.getElementById(pageId);

    /* Stop if the requested section does not exist */
    if (!selectedPage || !selectedPage.classList.contains("page")) {
        return;
    }

    /* Keep all portfolio sections available as a single scrolling page. */
    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    /* Display the selected section only */
    selectedPage.classList.add("active");
    selectedPage.classList.remove("page-entering");
    requestAnimationFrame(function() {
        selectedPage.classList.add("page-entering");
    });

    /* Update the active navigation link */
    navLinks.forEach(function(link) {
        if (link.dataset.page === pageId) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    /* Close the mobile menu after navigation */
    if (navMenu) {
        navMenu.classList.remove("open");
    }

    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
    }

    const headerHeight = document.querySelector(".site-header").offsetHeight;
    const pageTop = selectedPage.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
        top: Math.max(0, pageTop - headerHeight - 12),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
    });
}

/* REVEAL CONTENT AS IT ENTERS THE VIEWPORT */
function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll(
        ".hero-content > *, .hero-image, .mission > h2, .mission-card, " +
        ".page > h1, .section-heading > *, .experience-item, " +
        ".education-item, .certificate-card, .skill-card, .project-card, " +
        ".project-category, .project-category > h2, .projects-section > p, " +
        ".contact-details"
    );

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
    });

    revealTargets.forEach(function(element, index) {
        element.classList.add("reveal");
        element.style.setProperty(
            "--reveal-delay",
            String((index % 4) * 80) + "ms"
        );

        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight - 35 && bounds.bottom > 0) {
            element.classList.add("is-visible");
        } else {
            observer.observe(element);
        }
    });
}

/* HANDLE NAVIGATION CLICKS */
navLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        const pageId = link.dataset.page;

        if (pageId) {
            event.preventDefault();

            /* Update the URL hash */
            history.pushState(null, "", "#" + pageId);

            showPage(pageId);
        }
    });
});


/* HANDLE BACK AND FORWARD BROWSER BUTTONS */
window.addEventListener("popstate", function() {
    const pageId = window.location.hash.substring(1);
    showPage(pageId || "home");
});


/* OPEN AND CLOSE THE MOBILE MENU */
if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function() {
        const isOpen = navMenu.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });
}


/* OPEN THE CORRECT PAGE WHEN THE WEBSITE LOADS */
window.addEventListener("DOMContentLoaded", function() {
    setupRevealAnimations();

    const pageId = window.location.hash.substring(1);

    showPage(pageId || "home");
});
