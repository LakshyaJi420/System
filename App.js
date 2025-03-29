import { useState } from "react"; import { Button, Input, Select, Table } from "antd"; import { saveAs } from "file-saver"; import * as XLSX from "xlsx";

export default function ExcelGeneratorApp() { const [format, setFormat] = useState("default"); const [data, setData] = useState([]); const [newEntry, setNewEntry] = useState({});

const formats = { default: ["Date", "Vehicle No.", "Owner", "From", "To", "Consignee", "Goods", "Rent", "Advance", "Balance", "Status"], simplified: ["Date", "Consigner", "From", "Consignee", "To"], };

const handleInputChange = (e, key) => { setNewEntry({ ...newEntry, [key]: e.target.value }); };

const addEntry = () => { setData([...data, newEntry]); setNewEntry({}); };

const exportToExcel = () => { const worksheet = XLSX.utils.json_to_sheet(data); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1"); const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" }); const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); saveAs(file, "export.xlsx"); };

return ( <div className="p-6"> <h1 className="text-xl font-bold">Excel Generator</h1> <Select value={format} onChange={setFormat} className="mb-4"> {Object.keys(formats).map((key) => ( <Select.Option key={key} value={key}>{key}</Select.Option> ))} </Select>

<div className="grid grid-cols-2 gap-4">
    {formats[format].map((field) => (
      <Input
        key={field}
        placeholder={field}
        value={newEntry[field] || ""}
        onChange={(e) => handleInputChange(e, field)}
      />
    ))}
  </div>

  <Button className="mt-4" onClick={addEntry} type="primary">Add Entry</Button>
  <Button className="mt-4 ml-2" onClick={exportToExcel} type="default">Export to Excel</Button>

  <Table className="mt-6" dataSource={data} columns={formats[format].map((key) => ({ title: key, dataIndex: key }))} rowKey="Date" />
</div>

); }

// GitHub Pages Deployment Configuration // Add this in package.json: // "homepage": "https://your-github-username.github.io/excel-generator"

// Then run these commands: // npm install gh-pages --save-dev // Add to scripts: // "predeploy": "npm run build", // "deploy": "gh-pages -d build"

// Finally, deploy with: // npm run deploy

