// =========================
// LOAD INITIAL DASHBOARD
// =========================
fetch("/api/data")
.then(res => res.json())
.then(data => renderDashboard(data));


// =========================
// GLOBAL CHART INSTANCE
// =========================
let chartInstance = null;


// =========================
// RENDER FUNCTION (GLOBAL)
// =========================
function renderDashboard(data) {

    // ================= KPI =================
    let kpisDiv = document.getElementById("kpis");
    kpisDiv.innerHTML = "";

    for (let key in data.kpis) {
        kpisDiv.innerHTML += `
            <div class="card">
                <h3>${key}</h3>
                <p>${data.kpis[key]}</p>
            </div>
        `;
    }

    // ================= CHART =================
    const ctx = document.getElementById('trendChart').getContext('2d');

    // 🔥 destroy old chart (IMPORTANT)
    if (chartInstance) {
        chartInstance.destroy();
    }

    // 🔥 CASE 1: Uploaded dataset chart
    if (data.chart && data.chart.values) {

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.chart.labels,
                datasets: [{
                    label: data.chart.column,
                    data: data.chart.values,
                    backgroundColor: "#38bdf8"
                }]
            }
        });

    }

    // 🔥 CASE 2: Default Walmart dashboard
    else if (data.trends) {

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(56,189,248,0.8)");
        gradient.addColorStop(1, "rgba(56,189,248,0.05)");

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.trends.labels,
                datasets: [
                    {
                        label: "Revenue",
                        data: data.trends.revenue,
                        borderColor: "#38bdf8",
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: "Moving Avg",
                        data: data.trends.ma3,
                        borderColor: "#facc15",
                        borderDash: [6,6],
                        tension: 0.4
                    }
                ]
            }
        });
    }

    // ================= RECOMMENDATIONS =================
    let recoDiv = document.getElementById("recommendations");
    recoDiv.innerHTML = "";

    if (data.recommendations) {
        data.recommendations.forEach(r => {
            recoDiv.innerHTML += `
                <div class="reco ${r.type}">
                    <h4>${r.title}</h4>
                    <p>${r.body}</p>
                </div>
            `;
        });
    }
}


// =========================
// FILE UPLOAD
// =========================
function uploadFile() {
    let file = document.getElementById("fileInput").files[0];

    let formData = new FormData();
    formData.append("file", file);

    fetch("/api/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        if (data.status === "success") {
            // ✅ GO TO NEW PAGE
            window.location.href = "/analysis";
        }
    });
}

// ================= KPI =================
let kpisDiv = document.getElementById("kpis");
kpisDiv.innerHTML = "";

// 🔥 FIX: proper card layout
Object.entries(data.kpis).forEach(([key, value]) => {
    kpisDiv.innerHTML += `
        <div class="card">
            <h3>${key.replaceAll("_", " ").toUpperCase()}</h3>
            <p>${value}</p>
        </div>
    `;
});


// =========================
// CHAT FUNCTION
// =========================
function sendMessage() {
    let input = document.getElementById("userInput");
    let msg = input.value;

    if (!msg) return;

    let chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `<div class="chat-msg user">${msg}</div>`;

    fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: msg })
    })
    .then(res => res.json())
    .then(data => {

        if (!data.reply || data.reply.length === 0) {
            chatBox.innerHTML += `<div class="chat-msg bot">No response</div>`;
            return;
        }

        data.reply.forEach(r => {
            chatBox.innerHTML += `
                <div class="chat-msg bot">
                    <b>${r.title}</b><br>
                    ${r.body}
                </div>
            `;
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    });

    

    input.value = "";
}