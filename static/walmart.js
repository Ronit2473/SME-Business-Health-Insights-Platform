fetch("/api/data")
.then(res => res.json())
.then(data => {

    // ================= REVENUE TREND =================
    new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: data.trends.labels,
            datasets: [
                {
                    label: "Revenue",
                    data: data.trends.revenue,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56,189,248,0.2)",
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Moving Avg",
                    data: data.trends.ma3,
                    borderColor: "#facc15",
                    borderDash: [5,5],
                    tension: 0.4
                }
            ]
        }
    });


    // ================= STOCKOUT VS ORDERS =================
    new Chart(document.getElementById("stockChart"), {
        type: "bar",
        data: {
            labels: ["Stockouts", "Total Orders"],
            datasets: [{
                data: [
                    data.kpis.stockout_count,
                    parseInt(data.kpis.total_orders.replace(/,/g,'')) || data.kpis.total_orders
                ],
                backgroundColor: ["#ef4444", "#22c55e"]
            }]
        }
    });


    // ================= REVENUE VS LOST =================
    new Chart(document.getElementById("revenueCompare"), {
        type: "doughnut",
        data: {
            labels: ["Revenue", "Lost Revenue"],
            datasets: [{
                data: [
                    parseFloat(data.kpis.total_revenue.replace(/[$,]/g,'')),
                    parseFloat(data.kpis.lost_revenue.replace(/[$,]/g,''))
                ],
                backgroundColor: ["#38bdf8", "#ef4444"]
            }]
        }
    });


    new Chart(document.getElementById("avgOrderChart"), {
        type: "bar",
        data: {
            labels: ["Avg Order Value"],
            datasets: [{
                data: [
                    parseFloat(data.kpis.avg_order.replace(/[$,]/g,''))
                ],
                backgroundColor: "#facc15"
            }]
        }
    });


    // ================= ANOMALY =================
    new Chart(document.getElementById("anomalyChart"), {
        type: "pie",
        data: {
            labels: ["Anomalies", "Normal"],
            datasets: [{
                data: [
                    data.anomalies.count,
                    (parseInt(data.kpis.total_orders.replace(/,/g,'')) || data.kpis.total_orders) - data.anomalies.count
                ],
                backgroundColor: ["#facc15", "#38bdf8"]
            }]
        }
    });


    new Chart(document.getElementById("forecastChart"), {
        type: "bar",
        data: {
            labels: ["Forecast Accuracy"],
            datasets: [{
                label: "Accuracy %",
                data: [parseFloat(data.kpis.forecast_acc)],
                backgroundColor: "#6366f1"
            }]
        },
        options: {
            scales: {
                y: { max: 100 }
            }
        }
    });


    // ================= AI INSIGHTS =================
    let insightsDiv = document.getElementById("insights");

    data.recommendations.forEach(r => {
        insightsDiv.innerHTML += `
            <div class="reco ${r.type}">
                <h4>${r.title}</h4>
                <p>${r.body}</p>
            </div>
        `;
    });

});