function sendMessage() {
    let input = document.getElementById("chatInput");
    let message = input.value;

    if (!message) return;

    fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("chatBox").innerHTML += `
            <p><b>You:</b> ${message}</p>
            <p><b>AI:</b> ${data.reply}</p>
        `;
    });

    input.value = "";
}