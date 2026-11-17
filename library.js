const books = [
    {
        id: "software-fundamentals",
        title: "Computer Science Basics",
        author: "Student Library Collection",
        category: "Software & IT",
        cover: "cover-software",
        available: true
    },
    {
        id: "web-development",
        title: "Web Development Essentials",
        author: "Student Library Collection",
        category: "Software & IT",
        cover: "cover-software",
        available: true
    },
    {
        id: "database-design",
        title: "Database Systems",
        author: "Student Library Collection",
        category: "Software & IT",
        cover: "cover-data",
        available: true
    },
    {
        id: "business-management",
        title: "Business Management",
        author: "Student Library Collection",
        category: "Business & IT",
        cover: "cover-business",
        available: true
    },
    {
        id: "financial-literacy",
        title: "Finance & Well-being",
        author: "Student Library Collection",
        category: "Finance & Psychology",
        cover: "cover-business",
        available: true
    },
    {
        id: "design-thinking",
        title: "Design Thinking",
        author: "Student Library Collection",
        category: "Fashion & Design",
        cover: "cover-design",
        available: true
    },
    {
        id: "architecture",
        title: "Introduction to Architecture",
        author: "Student Library Collection",
        category: "Architecture",
        cover: "cover-data",
        available: true
    },
    {
        id: "rare-architecture",
        title: "Rare Architecture Collection",
        author: "Reference shelf · In-library use",
        category: "Architecture",
        cover: "cover-restricted",
        available: false
    }
];

const storageKey = "idil-library-demo-loans-v1";
const bookGrid = document.getElementById("book-grid");
const categoryList = document.getElementById("category-list");
const searchInput = document.getElementById("book-search");
const loanGrid = document.getElementById("loan-grid");
const catalogEmpty = document.getElementById("catalog-empty");
const loansEmpty = document.getElementById("loans-empty");
const borrowedCount = document.getElementById("borrowed-count");
const navLoanCount = document.getElementById("nav-loan-count");
const sectionLoanCount = document.getElementById("section-loan-count");
const statusMessage = document.getElementById("status-message");

let activeCategory = "All books";
let statusTimeout;
let canPersistLoans = true;
let loans = readLoans();

function setStatus(message, isError) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", Boolean(isError));
    statusMessage.classList.add("visible");
    window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(function() {
        statusMessage.classList.remove("visible");
    }, 4200);
}

function readLoans() {
    try {
        const savedLoans = localStorage.getItem(storageKey);
        if (!savedLoans) {
            return [];
        }

        const parsedLoans = JSON.parse(savedLoans);
        if (!Array.isArray(parsedLoans)) {
            throw new Error("Saved loan data is not a list.");
        }

        return parsedLoans.filter(function(loan) {
            return loan &&
                books.some(function(book) {
                    return book.id === loan.bookId && book.available;
                }) &&
                typeof loan.dueDate === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(loan.dueDate);
        });
    } catch (error) {
        canPersistLoans = false;
        console.error("Could not read the library demo's saved loans.", error);
        setStatus("Browser storage is unavailable. The demo still works, but loans will last only until you close this page.", true);
        return [];
    }
}

function persistLoans(nextLoans) {
    if (!canPersistLoans) {
        return false;
    }

    try {
        localStorage.setItem(storageKey, JSON.stringify(nextLoans));
        return true;
    } catch (error) {
        canPersistLoans = false;
        console.error("Could not save the library demo's loans.", error);
        setStatus("Browser storage is unavailable. This loan will last only until you close this page.", true);
        return false;
    }
}

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function getBook(bookId) {
    return books.find(function(book) {
        return book.id === bookId;
    });
}

function hasActiveLoan(bookId) {
    return loans.some(function(loan) {
        return loan.bookId === bookId;
    });
}

function dateToIso(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function dateFromIso(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(value) {
    return new Intl.DateTimeFormat("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(dateFromIso(value));
}

function getDaysRemaining(value) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((dateFromIso(value) - today) / 86400000);
}

function renderCategories() {
    const categories = ["All books"].concat(
        Array.from(new Set(books.map(function(book) {
            return book.category;
        })))
    );

    categoryList.replaceChildren();
    categories.forEach(function(category) {
        const button = makeElement("button", "category-button", category);
        button.type = "button";
        button.setAttribute("aria-pressed", String(activeCategory === category));
        button.addEventListener("click", function() {
            activeCategory = category;
            renderCategories();
            renderCatalog();
        });
        categoryList.appendChild(button);
    });
}

function createBookCard(book) {
    const card = makeElement("article", "book-card");
    const cover = makeElement("div", "book-cover " + book.cover);
    const coverMark = makeElement("span", "cover-mark", "▤");
    coverMark.setAttribute("aria-hidden", "true");
    const coverCategory = makeElement("span", "cover-category", book.category);
    const coverTitle = makeElement("strong", "", book.title);
    cover.append(coverMark, coverCategory, coverTitle);

    const info = makeElement("div", "book-info");
    info.appendChild(makeElement("h3", "book-title", book.title));
    info.appendChild(makeElement("p", "book-author", book.author));

    const bottom = makeElement("div", "book-card-bottom");
    const loan = loans.find(function(item) {
        return item.bookId === book.id;
    });

    if (!book.available) {
        bottom.appendChild(makeElement("span", "restricted-tag", "In-library only"));
    } else {
        const status = makeElement(
            "span",
            loan ? "book-status unavailable" : "book-status",
            loan ? "Borrowed" : "Available"
        );
        bottom.appendChild(status);

        const button = makeElement(
            "button",
            "borrow-button",
            loan ? "On loan" : "Borrow · 3 days"
        );
        button.type = "button";
        button.dataset.action = "borrow";
        button.dataset.bookId = book.id;
        button.disabled = Boolean(loan);
        bottom.appendChild(button);
    }

    info.appendChild(bottom);
    card.append(cover, info);
    return card;
}

function renderCatalog() {
    const query = searchInput.value.trim().toLowerCase();
    const matchingBooks = books.filter(function(book) {
        const matchesCategory = activeCategory === "All books" || book.category === activeCategory;
        const matchesQuery = (book.title + " " + book.author + " " + book.category)
            .toLowerCase()
            .includes(query);
        return matchesCategory && matchesQuery;
    });

    bookGrid.replaceChildren();
    matchingBooks.forEach(function(book) {
        bookGrid.appendChild(createBookCard(book));
    });
    catalogEmpty.hidden = matchingBooks.length > 0;
}

function renderLoans() {
    loanGrid.replaceChildren();
    loans.forEach(function(loan) {
        const book = getBook(loan.bookId);
        if (!book) {
            return;
        }

        const card = makeElement("article", "loan-card");
        const cover = makeElement("span", "loan-cover", "▤");
        cover.setAttribute("aria-hidden", "true");
        const details = makeElement("div", "loan-details");
        details.appendChild(makeElement("h3", "loan-title", book.title));

        const remaining = getDaysRemaining(loan.dueDate);
        let dueText = "Due " + formatDate(loan.dueDate);
        let dueClass = "loan-due";
        if (remaining < 0) {
            dueText += " · overdue";
            dueClass += " overdue";
        } else if (remaining === 0) {
            dueText += " · due today";
        } else {
            dueText += " · " + remaining + (remaining === 1 ? " day left" : " days left");
        }
        details.appendChild(makeElement("p", dueClass, dueText));

        const returnButton = makeElement("button", "return-button", "Return book");
        returnButton.type = "button";
        returnButton.dataset.action = "return";
        returnButton.dataset.bookId = book.id;
        card.append(cover, details, returnButton);
        loanGrid.appendChild(card);
    });

    const count = loans.length;
    borrowedCount.textContent = count + (count === 1 ? " book" : " books");
    navLoanCount.textContent = String(count);
    sectionLoanCount.textContent = String(count);
    loansEmpty.hidden = count > 0;
}

function render() {
    renderCatalog();
    renderLoans();
}

function borrowBook(bookId) {
    const book = getBook(bookId);
    if (!book || !book.available || hasActiveLoan(bookId)) {
        return;
    }

    const dueDate = new Date();
    dueDate.setHours(0, 0, 0, 0);
    dueDate.setDate(dueDate.getDate() + 3);

    const nextLoans = loans.concat({
        bookId: book.id,
        dueDate: dateToIso(dueDate)
    });
    const wasSaved = persistLoans(nextLoans);
    loans = nextLoans;
    render();

    setStatus(
        book.title + " borrowed. Return it by " + formatDate(dateToIso(dueDate)) +
        (wasSaved ? "." : ". This demo loan is temporary for this page session."),
        !wasSaved
    );
}

function returnBook(bookId) {
    const book = getBook(bookId);
    if (!book || !hasActiveLoan(bookId)) {
        return;
    }

    const nextLoans = loans.filter(function(loan) {
        return loan.bookId !== bookId;
    });
    const wasSaved = persistLoans(nextLoans);
    loans = nextLoans;
    render();

    setStatus(
        book.title + " returned successfully." +
        (wasSaved ? "" : " This demo change is temporary for this page session."),
        !wasSaved
    );
}

bookGrid.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action='borrow']");
    if (button) {
        borrowBook(button.dataset.bookId);
    }
});

loanGrid.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action='return']");
    if (button) {
        returnBook(button.dataset.bookId);
    }
});

searchInput.addEventListener("input", renderCatalog);

document.addEventListener("keydown", function(event) {
    if (event.key === "/" && document.activeElement !== searchInput) {
        event.preventDefault();
        searchInput.focus();
    }
});

renderCategories();
render();
