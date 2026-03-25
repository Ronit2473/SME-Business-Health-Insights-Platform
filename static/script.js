// =========================
// LOAD INITIAL DASHBOARD
// =========================
fetch("/api/data")
.then(res => res.json())
.then(data => {
    console.log("API DATA:", data); // debug
    renderDashboard(data);
});

let chartInstance = null;

// =========================
// RENDER DASHBOARD
// =========================
function renderDashboard(data) {

    // ================= KPI =================
    let kpisDiv = document.getElementById("kpis");
    kpisDiv.innerHTML = "";

    if (data.kpis) {
        Object.entries(data.kpis).forEach(([key, value]) => {
            kpisDiv.innerHTML += `
                <div class="card">
                    <h3>${key.replaceAll("_", " ").toUpperCase()}</h3>
                    <p>${value}</p>
                </div>
            `;
        });
    }

    // ================= GRAPH =================
    const canvas = document.getElementById("trendChart");

    if (!canvas) {
        console.error("Canvas not found ❌");
        return;
    }

    const ctx = canvas.getContext("2d");

    if (chartInstance) chartInstance.destroy();

    // ✅ PREMIUM GRAPH (default dashboard)
    if (data.trends && data.trends.revenue) {

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(56,189,248,0.8)");
        gradient.addColorStop(1, "rgba(56,189,248,0.05)");

        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.trends.labels,
                datasets: [
                    {
                        label: "Revenue",
                        data: data.trends.revenue,
                        borderColor: "#38bdf8",
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: "#38bdf8"
                    },
                    {
                        label: "Moving Avg",
                        data: data.trends.ma3 || [],
                        borderColor: "#facc15",
                        borderDash: [6,6],
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: "white"
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "white" },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    },
                    y: {
                        ticks: { color: "white" },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    }
                }
            }
        });
    }

    // ✅ BAR GRAPH (uploaded dataset)
    else if (data.chart && data.chart.values) {

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.chart.labels,
                datasets: [{
                    label: data.chart.column,
                    data: data.chart.values,
                    backgroundColor: "#38bdf8"
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: "white" }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "white" }
                    },
                    y: {
                        ticks: { color: "white" }
                    }
                }
            }
        });
    }

    else {
        console.warn("No chart data available ❌");
    }

    // ================= AI INSIGHTS =================
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

    if (!file) {
        alert("Select a file first");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch("/api/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            location.reload(); // reload to show new graph
        } else {
            alert("Upload failed: " + data.message);
        }
    })
    .catch(err => console.error(err));
}

// =========================
// CHAT FUNCTION
// =========================

function sendMessage() {
    let input = document.getElementById("userInput");
    let message = input.value.trim();

    if (!message) return;

    let chatBox = document.getElementById("chat-box");

    // 👤 USER MESSAGE (Telegram style)
    chatBox.innerHTML += `
        <div class="chat-message user">
            <div class="message-bubble">
                ${message}
                <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;

    input.value = "";

    fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {

        // 🤖 BOT MESSAGE (Telegram style)
        chatBox.innerHTML += `
            <div class="chat-message bot">
                <div class="chat-avatar-small">🤖</div>
                <div class="message-bubble">
                    ${data.reply}
                    <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;
    });
}