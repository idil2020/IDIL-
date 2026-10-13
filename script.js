
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

    /* Hide all sections */
    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    /* Display the selected section only */
    selectedPage.classList.add("active");

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

    /* Move to the top of the selected page */
    window.scrollTo({
        top: 0,
        behavior: "smooth"
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
    const pageId = window.location.hash.substring(1);

    showPage(pageId || "home");
});
