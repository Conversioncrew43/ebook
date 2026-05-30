# Download Data Feature Documentation

## Overview

All list endpoints in your application now support downloading data in **CSV** and **JSON** formats. This allows users to export data from any screen for use in spreadsheets, analytics, or archival purposes.

## How to Use

### API Endpoint Format

To download data from any list endpoint, add a query parameter:

```
GET /api/{resource}?format=csv
GET /api/{resource}?format=json
```

Alternatively, you can use:

```
GET /api/{resource}?export=csv
GET /api/{resource}?export=json
```

## Supported Endpoints

### Projects

- **List with download**: `GET /api/projects?format=csv` or `GET /api/projects?format=json`
- **With date filter**: `GET /api/projects?from=2024-01-01&to=2024-12-31&format=csv`

### Bills

- **List with download**: `GET /api/bills?format=csv` or `GET /api/bills?format=json`
- **By project**: `GET /api/bills?projectId={id}&format=csv`
- **By status**: `GET /api/bills?status=pending&format=csv`
- **Date range**: `GET /api/bills?from=2024-01-01&to=2024-12-31&format=csv`

### Expenses

- **List with download**: `GET /api/expenses?format=csv` or `GET /api/expenses?format=json`
- **Date range**: `GET /api/expenses?from=2024-01-01&to=2024-12-31&format=csv`

### Payments

- **List with download**: `GET /api/payments?format=csv` or `GET /api/payments?format=json`
- **By project**: `GET /api/payments?projectId={id}&format=csv`
- **Date range**: `GET /api/payments?from=2024-01-01&to=2024-12-31&format=csv`

### Leads

- **List with download**: `GET /api/leads?format=csv` or `GET /api/leads?format=json`
- **Date range**: `GET /api/leads?from=2024-01-01&to=2024-12-31&format=csv`

### Users

- **List with download**: `GET /api/users?format=csv` or `GET /api/users?format=json`

### Vendors

- **List with download**: `GET /api/vendors?format=csv` or `GET /api/vendors?format=json`
- **With filters**: `GET /api/vendors?search=abc&type=supplier&format=csv`

### Products

- **List with download**: `GET /api/products?format=csv` or `GET /api/products?format=json`

### Blogs

- **List with download**: `GET /api/blogs?format=csv` or `GET /api/blogs?format=json`

### DPR (Daily Progress Report)

- **List with download**: `GET /api/dpr/{projectId}?format=csv` or `GET /api/dpr/{projectId}?format=json`
- **Date range**: `GET /api/dpr/{projectId}?startDate=2024-01-01&endDate=2024-12-31&format=csv`

### Worker Rates

- **List with download**: `GET /api/worker-rates?format=csv` or `GET /api/worker-rates?format=json`

### Project Assignments

- **List with download**: `GET /api/project-assignments?format=csv` or `GET /api/project-assignments?format=json`

## Frontend Implementation Examples

### JavaScript/Fetch API

```javascript
// Download as CSV
function downloadAsCSV(endpoint) {
  fetch(`/api/${endpoint}?format=csv`)
    .then((response) => response.text())
    .then((data) => {
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${endpoint}-${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

// Download as JSON
function downloadAsJSON(endpoint) {
  fetch(`/api/${endpoint}?format=json`)
    .then((response) => response.json())
    .then((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${endpoint}-${new Date().getTime()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

// Usage
downloadAsCSV("projects");
downloadAsJSON("bills");
```

### React Component Example

```jsx
import React from "react";

function ExportButton({ endpoint, format = "csv", label = "Download" }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/${endpoint}?format=${format}`);
      const data = await response.text();

      const blob = new Blob([data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${endpoint}-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download data");
    }
  };

  return (
    <button onClick={handleDownload} className="export-btn">
      📥 {label} ({format.toUpperCase()})
    </button>
  );
}

// Usage in a list component
export function ProjectsList() {
  return (
    <div>
      <h1>Projects</h1>
      <div className="export-buttons">
        <ExportButton
          endpoint="projects"
          format="csv"
          label="Download as CSV"
        />
        <ExportButton
          endpoint="projects"
          format="json"
          label="Download as JSON"
        />
      </div>
      {/* Your list content */}
    </div>
  );
}
```

### React Hook Example

```jsx
import { useCallback } from "react";

function useExportData() {
  const exportData = useCallback(
    async (endpoint, format = "csv", filters = {}) => {
      try {
        // Build query string with filters
        const queryParams = new URLSearchParams({
          format,
          ...filters,
        });

        const response = await fetch(`/api/${endpoint}?${queryParams}`);

        if (!response.ok) throw new Error("Download failed");

        const data = await response.text();
        const filename = `${endpoint}-${new Date().toISOString().split("T")[0]}.${format}`;

        const blob = new Blob([data], {
          type: format === "csv" ? "text/csv" : "application/json",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
      } catch (error) {
        console.error("Export error:", error);
        return { success: false, error: error.message };
      }
    },
    [],
  );

  return { exportData };
}

// Usage
function BillsList() {
  const { exportData } = useExportData();

  const handleExportBills = async () => {
    const result = await exportData("bills", "csv", {
      from: "2024-01-01",
      to: "2024-12-31",
    });

    if (result.success) {
      console.log(`Downloaded: ${result.filename}`);
    }
  };

  return <button onClick={handleExportBills}>Export Bills to CSV</button>;
}
```

## CSV Format Features

- **Automatic flattening**: Nested objects are flattened with underscore separators (e.g., `project_name`)
- **Array handling**: Arrays are joined with semicolons
- **Date conversion**: Dates are converted to ISO format
- **Quote escaping**: Special characters and quotes are properly escaped
- **UTF-8 encoding**: All CSV files are UTF-8 encoded for universal compatibility

## JSON Format Features

- **Pretty printing**: JSON files are formatted with 2-space indentation
- **Complete data**: All nested objects and arrays are preserved
- **Metadata**: All fields from the database are included
- **UTF-8 encoding**: Full UTF-8 support for international characters

## UI Integration Tips

### Add Download Button to List Header

```jsx
<div className="list-header">
  <h2>Bills</h2>
  <div className="actions">
    <button onClick={() => exportData("bills", "csv")}>
      <i className="icon-download"></i> CSV
    </button>
    <button onClick={() => exportData("bills", "json")}>
      <i className="icon-download"></i> JSON
    </button>
  </div>
</div>
```

### Add to Table Toolbar

```jsx
<div className="table-toolbar">
  <input type="search" placeholder="Search..." />
  <button>Filter</button>
  <div className="divider"></div>
  <button onClick={() => exportData("current-view", "csv")}>
    Download CSV
  </button>
  <button onClick={() => exportData("current-view", "json")}>
    Download JSON
  </button>
</div>
```

### Add to List Item Context Menu

```jsx
<div className="context-menu">
  <button>Edit</button>
  <button>Delete</button>
  <hr />
  <button onClick={() => exportData("item", "csv")}>Export as CSV</button>
  <button onClick={() => exportData("item", "json")}>Export as JSON</button>
</div>
```

## Combining Filters with Downloads

All existing query parameters work with downloads:

```javascript
// Export bills with filters
const filters = {
  projectId: "proj123",
  status: "pending",
  from: "2024-01-01",
  to: "2024-12-31",
};

await exportData("bills", "csv", filters);
```

## File Naming Convention

Downloaded files are automatically named as:

- `{resource}-YYYY-MM-DD.csv`
- `{resource}-YYYY-MM-DD.json`

Example: `bills-2024-01-15.csv`

## Troubleshooting

### Large Dataset Downloads

For datasets with thousands of records, JSON format is recommended as it preserves all data accurately. CSV may have display issues in some spreadsheet applications for very large files.

### Special Characters

Both CSV and JSON formats handle special characters, emoji, and international characters properly.

### Nested Data

- **CSV**: Nested objects are flattened with underscores. Arrays are joined with semicolons.
- **JSON**: All nested structures are fully preserved.

## Performance Notes

- Downloads are handled server-side and streamed to the client
- Large exports may take a few seconds; consider adding a loading indicator in your UI
- For very large datasets (>100K records), consider adding pagination to the export

## Future Enhancements

Possible additions in the future:

- Excel (.xlsx) format support
- PDF export with custom templates
- Scheduled exports to email
- Export to cloud storage (Google Drive, Dropbox, etc.)
- Advanced column selection
- Custom export templates
