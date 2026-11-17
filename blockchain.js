const credentials = [
    {
        id: "CHAIN-2025-001",
        title: "Web Development Foundations",
        recipient: "Amina Yusuf",
        issuer: "Open Learning Institute",
        date: "12 Mar 2025",
        status: "valid",
        record: "DEMO-LEDGER-001"
    },
    {
        id: "CHAIN-2024-018",
        title: "Data Literacy Essentials",
        recipient: "Daniel Lee",
        issuer: "Digital Skills Academy",
        date: "8 Nov 2024",
        status: "valid",
        record: "DEMO-LEDGER-018"
    },
    {
        id: "CHAIN-2023-004",
        title: "Project Management Basics",
        recipient: "Sara Hassan",
        issuer: "Learning Pathways",
        date: "21 Jun 2023",
        status: "revoked",
        record: "DEMO-LEDGER-004"
    }
];

const verifyForm = document.getElementById("verify-form");
const verifyId = document.getElementById("verify-id");
const result = document.getElementById("verification-result");
const resultMark = document.getElementById("result-mark");
const resultTitle = document.getElementById("result-title");
const resultDescription = document.getElementById("result-description");
const sampleList = document.getElementById("sample-list");
const ledgerRows = document.getElementById("ledger-rows");
const issueForm = document.getElementById("issue-form");
const credentialCount = document.getElementById("credential-count");
const validCount = document.getElementById("valid-count");
const ledgerCount = document.getElementById("ledger-count");
const issuedAt = new Date();
let newCredentialNumber = 1;

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    element.textContent = text;
    return element;
}

function renderRegistry() {
    sampleList.replaceChildren();
    credentials.forEach(function(credential) {
        const row = document.createElement("div");
        row.className = "sample-record";
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.credentialId = credential.id;
        button.append(
            createTextElement("strong", "", credential.id),
            createTextElement("small", "", credential.title)
        );
        const status = createTextElement(
            "span",
            "status-chip" + (credential.status === "revoked" ? " revoked" : ""),
            credential.status === "revoked" ? "Revoked" : "Valid"
        );
        row.append(button, status);
        sampleList.appendChild(row);
    });

    ledgerRows.replaceChildren();
    credentials.slice().reverse().forEach(function(credential) {
        const row = document.createElement("tr");
        const values = [
            [credential.id, "record-id"],
            [credential.recipient, ""],
            [credential.issuer, ""],
            [credential.status === "revoked" ? "Revoked" : "Demo record", credential.status === "revoked" ? "status-chip revoked" : "demo-tag"]
        ];
        values.forEach(function(value) {
            const cell = document.createElement("td");
            cell.appendChild(createTextElement("span", value[1], value[0]));
            row.appendChild(cell);
        });
        ledgerRows.appendChild(row);
    });

    credentialCount.textContent = String(credentials.length);
    validCount.textContent = String(credentials.filter(function(item) {
        return item.status === "valid";
    }).length);
    ledgerCount.textContent = String(credentials.length);
}

function verifyCredential(value) {
    const normalizedId = value.trim().toUpperCase();
    if (!normalizedId) {
        verifyId.setAttribute("aria-invalid", "true");
        verifyId.focus();
        return;
    }

    verifyId.removeAttribute("aria-invalid");
    const credential = credentials.find(function(item) {
        return item.id === normalizedId;
    });
    result.dataset.state = credential ? credential.status : "not-found";

    if (!credential) {
        resultMark.textContent = "!";
        resultTitle.textContent = "No matching record";
        resultDescription.textContent = "This ID is not in the local demo registry.";
        return;
    }

    if (credential.status === "revoked") {
        resultMark.textContent = "!";
        resultTitle.textContent = "Credential revoked";
        resultDescription.textContent = credential.title + " · " + credential.recipient + " · Issued by " + credential.issuer + ".";
        return;
    }

    resultMark.textContent = "✓";
    resultTitle.textContent = "Credential verified";
    resultDescription.textContent = credential.title + " · " + credential.recipient + " · Issued by " + credential.issuer + ".";
}

verifyForm.addEventListener("submit", function(event) {
    event.preventDefault();
    verifyCredential(verifyId.value);
});

sampleList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-credential-id]");
    if (!button) {
        return;
    }
    verifyId.value = button.dataset.credentialId;
    verifyCredential(verifyId.value);
});

issueForm.addEventListener("submit", function(event) {
    event.preventDefault();
    if (!issueForm.reportValidity()) {
        return;
    }

    const formData = new FormData(issueForm);
    const number = String(newCredentialNumber).padStart(3, "0");
    const credential = {
        id: "CHAIN-DEMO-" + number,
        title: String(formData.get("title")).trim(),
        recipient: String(formData.get("recipient")).trim(),
        issuer: String(formData.get("issuer")).trim(),
        date: new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric" }).format(issuedAt),
        status: "valid",
        record: "DEMO-LEDGER-" + number
    };

    if (!credential.title || !credential.recipient || !credential.issuer) {
        return;
    }

    newCredentialNumber += 1;
    credentials.push(credential);
    renderRegistry();
    issueForm.reset();
    verifyId.value = credential.id;
    verifyCredential(credential.id);
});

renderRegistry();
