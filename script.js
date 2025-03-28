function createTable() {
    const topics = document.getElementById("topics").value.split(",").map(t => t.trim());
    const tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = ""; // Clear previous table

    let table = `<table id="dataTable"><thead><tr>`;
    topics.forEach(topic => table += `<th>${topic}</th>`);
    table += `<th>Action</th></tr></thead><tbody></tbody></table>`;
    tableContainer.innerHTML = table;

    // Add row button
    let addRowBtn = document.createElement("button");
    addRowBtn.innerText = "Add Row";
    addRowBtn.onclick = addRow;
    tableContainer.appendChild(addRowBtn);

    // Show Export Button
    document.getElementById("exportBtn").style.display = "block";
}

function addRow() {
    const table = document.getElementById("dataTable").getElementsByTagName("tbody")[0];
    let row = table.insertRow();
    const topics = document.getElementById("topics").value.split(",").map(t => t.trim());

    topics.forEach(() => {
        let cell = row.insertCell();
        let input = document.createElement("input");
        input.type = "text";
        cell.appendChild(input);
    });

    // Delete row button
    let deleteCell = row.insertCell();
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = function () { row.remove(); };
    deleteCell.appendChild(deleteBtn);
}

function exportToExcel() {
    const table = document.getElementById("dataTable");
    const fileName = document.getElementById("fileName").value || "ExcelFile";

    let data = [];
    let rows = table.getElementsByTagName("tr");

    // Extract Table Data
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        let cells = rows[i].getElementsByTagName("td");
        for (let j = 0; j < cells.length - 1; j++) { // Exclude action column
            let input = cells[j].getElementsByTagName("input")[0];
            row.push(input ? input.value : cells[j].innerText);
        }
        data.push(row);
    }

    // Convert Data to Excel
    let ws = XLSX.utils.aoa_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Download File
    XLSX.writeFile(wb, fileName + ".xlsx");
}
