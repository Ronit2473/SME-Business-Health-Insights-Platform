// =========================
// LOAD AI INSIGHTS
// =========================
function loadAnalysis() {
    fetch("/api/analysis-data")
    .then(res => res.json())
    .then(data => {

        if (!data || !data.recommendations) {
            document.getElementById("recommendations").innerHTML = `
                <p style="text-align:center; color:#94a3b8;">
                    Upload a dataset to see AI insights 🚀
                </p>
            `;
            return;
        }

        renderInsights(data.recommendations);
    })
    .catch(err => console.error(err));
}


// =========================
// RENDER ONLY AI INSIGHTS
// =========================
function renderInsights(insights) {

    let recoDiv = document.getElementById("recommendations");
    recoDiv.innerHTML = "";

    insights.forEach(r => {
        recoDiv.innerHTML += `
            <div class="reco ${r.type}">
                <h4>${r.title}</h4>
                <p>${r.body}</p>
            </div>
        `;
    });
}


// =========================
// UPLOAD FUNCTION
// =========================
function uploadFile() {
    let file = document.getElementById("fileInput").files[0];

    if (!file) {
        alert("Select a file first");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    // 🔥 loading state
    document.getElementById("recommendations").innerHTML = `
        <p style="text-align:center; color:#38bdf8;">
            ⏳ Generating AI insights...
        </p>
    `;

    fetch("/api/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        if (data.status === "success") {
            loadAnalysis();  // refresh insights
        } else {
            alert("Upload failed");
        }

    })
    .catch(err => {
        console.error(err);
        alert("Error uploading file");
    });
}


// =========================
// INITIAL LOAD
// =========================
loadAnalysis();