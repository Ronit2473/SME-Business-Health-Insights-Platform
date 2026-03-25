fetch("/api/data")
.then(res => res.json())
.then(data => {

    console.log("DATA:", data);

    const clean = (val) => {
        if (!val) return 0;
        return parseFloat(val.toString().replace(/[₹,$]/g,''));
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "white" }
            }
        },
        scales: {
            x: { ticks: { color: "white" } },
            y: { ticks: { color: "white" } }
        }
    };

    // 📈 TREND
    new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: data.trends?.labels || [],
            datasets: [{
                label: "Revenue",
                data: data.trends?.revenue || [],
                borderColor: "#38bdf8",
                tension: 0.4
            }]
        },
        options: options
    });

    // 💰 REVENUE COMPARE
    new Chart(document.getElementById("revenueCompare"), {
        type: "bar",
        data: {
            labels: ["Revenue", "Lost", "Profit"],
            datasets: [{
                data: [
                    clean(data.kpis?.total_revenue),
                    clean(data.kpis?.lost_revenue),
                    clean(data.kpis?.profit)
                ],
                backgroundColor: ["#38bdf8","#ef4444","#22c55e"]
            }]
        },
        options: options
    });

    // ❌ STOCKOUT REMOVED

    // ✅ CATEGORY FIXED
    if (data.category) {
        new Chart(document.getElementById("categoryChart"), {
            type: "bar",
            data: {
                labels: data.category.labels || [],
                datasets: [{
                    label: "Category Revenue",
                    data: data.category.values || [],
                    backgroundColor: "#6366f1"
                }]
            },
            options: options
        });
    }

    // ✅ TOP 5 CATEGORY ADDED
    if (data.top5) {
        new Chart(document.getElementById("topCategoryChart"), {
            type: "bar",
            data: {
                labels: data.top5.labels || [],
                datasets: [{
                    label: "Top 5 Categories",
                    data: data.top5.values || [],
                    backgroundColor: "#f59e0b"
                }]
            },
            options: options
        });
    }

  // ⭐ CUSTOMER (FIXED WITH DUAL AXIS)
if (data.kpis?.repeat_rate && data.kpis?.avg_rating) {
    new Chart(document.getElementById("customerChart"), {
        type: "bar",
        data: {
            labels: ["Metrics"],
            datasets: [
                {
                    label: "Repeat %",
                    data: [parseFloat(data.kpis.repeat_rate)],
                    backgroundColor: "#22c55e",
                    yAxisID: 'y'
                },
                {
                    label: "Rating",
                    data: [data.kpis.avg_rating],
                    backgroundColor: "#facc15",
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "white" } }
            },
            scales: {
                y: {
                    position: 'left',
                    ticks: { color: "white" },
                    title: {
                        display: true,
                        text: "Repeat %",
                        color: "white"
                    }
                },
                y1: {
                    position: 'right',
                    ticks: { color: "white" },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: "Rating",
                        color: "white"
                    }
                },
                x: {
                    ticks: { color: "white" }
                }
            }
        }
    });
}

    // ⚠️ ANOMALY
    new Chart(document.getElementById("anomalyChart"), {
        type: "pie",
        data: {
            labels: ["Anomaly","Normal"],
            datasets: [{
                data: [
                    data.anomalies?.count || 0,
                    (parseInt(data.kpis?.total_orders?.replace(/,/g,'')) || 0) - (data.anomalies?.count || 0)
                ],
                backgroundColor: ["#facc15","#38bdf8"]
            }]
        }
    });

    // 💡 INSIGHTS
    let div = document.getElementById("insights");
    div.innerHTML = "";

    (data.recommendations || []).forEach(r => {
        div.innerHTML += `
            <div class="reco">
                <h4>${r.title}</h4>
                <p>${r.body}</p>
            </div>
        `;
    });

})
.catch(err => {
    console.error("ERROR:", err);
});