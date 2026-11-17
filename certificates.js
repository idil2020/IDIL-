const certificates = [
    {
        id: "CERT-2025-001",
        title: "Web Development Foundations",
        recipient: "Amina Yusuf",
        issuer: "Open Learning Institute (Demo)",
        issued: "12 March 2025",
        status: "valid",
        reference: "DEMO-ISSUER-001"
    },
    {
        id: "CERT-2024-018",
        title: "Data Literacy Essentials",
        recipient: "Daniel Lee",
        issuer: "Digital Skills Academy (Demo)",
        issued: "8 November 2024",
        status: "valid",
        reference: "DEMO-ISSUER-018"
    },
    {
        id: "CERT-2023-004",
        title: "Project Management Basics",
        recipient: "Sara Hassan",
        issuer: "Learning Pathways (Demo)",
        issued: "21 June 2023",
        status: "revoked",
        reference: "DEMO-ISSUER-004"
    }
];

const verificationForm = document.getElementById("verification-form");
const certificateInput = document.getElementById("certificate-id");
const emptyResult = document.getElementById("result-empty");
const resultContent = document.getElementById("result-content");
const resultIcon = document.getElementById("result-icon");
const resultStatus = document.getElementById("result-status");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const credentialDetails = document.getElementById("credential-details");
const announcement = document.getElementById("verification-announcement");

function showDetails(certificate) {
    const details = [
        ["Certificate ID", certificate.id],
        ["Credential", certificate.title],
        ["Recipient", certificate.recipient],
        ["Issued by", certificate.issuer],
        ["Issue date", certificate.issued],
        ["Issuer reference", certificate.reference]
    ];

    credentialDetails.replaceChildren();
    details.forEach(function(detail) {
        const row = document.createElement("div");
        const label = document.createElement("dt");
        const value = document.createElement("dd");
        label.textContent = detail[0];
        value.textContent = detail[1];
        row.append(label, value);
        credentialDetails.appendChild(row);
    });
}

function showResult(certificateId) {
    const normalizedId = certificateId.trim().toUpperCase();
    if (!normalizedId) {
        certificateInput.setAttribute("aria-invalid", "true");
        certificateInput.focus();
        announcement.textContent = "Enter a certificate ID to verify.";
        return;
    }

    certificateInput.removeAttribute("aria-invalid");
    const certificate = certificates.find(function(record) {
        return record.id === normalizedId;
    });

    emptyResult.hidden = true;
    resultContent.hidden = false;

    if (!certificate) {
        resultContent.dataset.state = "not-found";
        resultIcon.textContent = "!";
        resultStatus.textContent = "Not found";
        resultTitle.textContent = "No matching record";
        resultMessage.textContent = "This ID is not in the demo registry. Check the ID or try a sample record.";
        credentialDetails.replaceChildren();
        announcement.textContent = "No certificate record found for " + normalizedId + ".";
        return;
    }

    showDetails(certificate);
    if (certificate.status === "revoked") {
        resultContent.dataset.state = "revoked";
        resultIcon.textContent = "!";
        resultStatus.textContent = "Revoked";
        resultTitle.textContent = "Credential revoked";
        resultMessage.textContent = "A matching issuer record exists, but its current status is revoked.";
        announcement.textContent = "Certificate " + certificate.id + " is revoked.";
        return;
    }

    resultContent.dataset.state = "valid";
    resultIcon.textContent = "✓";
    resultStatus.textContent = "Verified";
    resultTitle.textContent = "Credential is valid";
    resultMessage.textContent = "A matching active record was found in the demo issuer registry.";
    announcement.textContent = "Certificate " + certificate.id + " is valid.";
}

verificationForm.addEventListener("submit", function(event) {
    event.preventDefault();
    showResult(certificateInput.value);
});

document.querySelectorAll(".sample-button").forEach(function(button) {
    button.addEventListener("click", function() {
        certificateInput.value = button.dataset.certificateId;
        showResult(certificateInput.value);
    });
});
