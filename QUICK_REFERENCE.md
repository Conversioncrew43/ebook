# Download Feature - Quick Reference Card

## 📋 Basic Usage

Add `?format=csv` or `?format=json` to any list endpoint URL

## 🔗 Quick Links - Copy & Paste

### CSV Downloads

```
/api/projects?format=csv
/api/bills?format=csv
/api/expenses?format=csv
/api/payments?format=csv
/api/leads?format=csv
/api/users?format=csv
/api/vendors?format=csv
/api/products?format=csv
/api/blogs?format=csv
/api/worker-rates?format=csv
/api/project-assignments?format=csv
```

### JSON Downloads

```
/api/projects?format=json
/api/bills?format=json
/api/expenses?format=json
/api/payments?format=json
/api/leads?format=json
/api/users?format=json
/api/vendors?format=json
/api/products?format=json
/api/blogs?format=json
/api/worker-rates?format=json
/api/project-assignments?format=json
```

## 🔍 With Filters

### Date Range Filter

```
/api/projects?from=2024-01-01&to=2024-12-31&format=csv
/api/bills?from=2024-01-01&to=2024-12-31&format=json
/api/expenses?from=2024-01-01&to=2024-12-31&format=csv
```

### Status Filter

```
/api/bills?status=pending&format=csv
/api/bills?status=paid&format=json
```

### Project Filter

```
/api/bills?projectId=PROJECT_ID&format=csv
/api/payments?projectId=PROJECT_ID&format=json
```

### Search Filter

```
/api/vendors?search=name&format=csv
/api/vendors?type=supplier&format=json
```

### DPR with Date Range

```
/api/dpr/PROJECT_ID?startDate=2024-01-01&endDate=2024-12-31&format=csv
```

## 🎯 File Names Generated

- `projects-2024-01-15.csv`
- `bills-2024-01-15.json`
- `expenses-2024-01-15.csv`
- `payments-2024-01-15.json`
- `leads-2024-01-15.csv`
- `users-2024-01-15.json`
- `vendors-2024-01-15.csv`
- `products-2024-01-15.json`
- `blogs-2024-01-15.csv`
- `workerRates-2024-01-15.json`
- `projectAssignments-2024-01-15.csv`

## 💻 Quick JavaScript (Copy-Paste)

### Download Button

```javascript
function downloadData(endpoint, format) {
  const url = `/api/${endpoint}?format=${format}`;
  window.location.href = url;
}

// Usage:
// downloadData('bills', 'csv');
// downloadData('projects', 'json');
```

### Download with File Processing

```javascript
async function downloadFile(endpoint, format) {
  const response = await fetch(`/api/${endpoint}?format=${format}`);
  const data = await response.text();
  const blob = new Blob([data], {
    type: format === "csv" ? "text/csv" : "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${endpoint}-${new Date().toISOString().split("T")[0]}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

// Usage:
// downloadFile('bills', 'csv');
```

### React Download Button

```jsx
function ExportButton({ endpoint, format = "csv" }) {
  const handleClick = () => {
    window.location.href = `/api/${endpoint}?format=${format}`;
  };

  return (
    <button onClick={handleClick}>📥 Download {format.toUpperCase()}</button>
  );
}

// Usage:
// <ExportButton endpoint="projects" format="csv" />
```

## 🎨 HTML Button Examples

### Simple Download Links

```html
<!-- Download Projects as CSV -->
<a href="/api/projects?format=csv" class="btn btn-primary"> 📥 Download CSV </a>

<!-- Download Bills as JSON -->
<a href="/api/bills?format=json" class="btn btn-secondary">
  📥 Download JSON
</a>
```

### Button Group

```html
<div class="download-group">
  <a href="/api/projects?format=csv" class="btn">CSV</a>
  <a href="/api/projects?format=json" class="btn">JSON</a>
</div>
```

### Dropdown Menu

```html
<div class="dropdown">
  <button class="btn dropdown-toggle">📥 Download</button>
  <div class="dropdown-menu">
    <a href="/api/bills?format=csv">As CSV</a>
    <a href="/api/bills?format=json">As JSON</a>
  </div>
</div>
```

## 📊 Format Comparison

| Feature                | CSV                         | JSON         |
| ---------------------- | --------------------------- | ------------ |
| Spreadsheet Compatible | ✅ Yes                      | ❌ No        |
| Text Editor Friendly   | ✅ Yes                      | ✅ Yes       |
| Data Accuracy          | ⚠️ Nested objects flattened | ✅ Complete  |
| File Size              | ✅ Smaller                  | ⚠️ Larger    |
| Speed                  | ✅ Fast                     | ✅ Very Fast |
| Import to DB           | ✅ Yes                      | ✅ Yes       |
| Import to Excel        | ✅ Yes                      | ❌ No        |
| Preserve Structure     | ❌ No                       | ✅ Yes       |

## 🆘 Common Issues & Fixes

### Download not triggering?

→ Check if URL is correct: `/api/ENDPOINT?format=csv`
→ Verify query parameter case sensitivity

### CSV opens incorrectly in Excel?

→ CSV format is UTF-8 encoded
→ Try: Data → Get & Transform → From Text
→ Set encoding to UTF-8

### JSON file is empty?

→ Check if endpoint exists: `GET /api/ENDPOINT` returns data
→ Verify authentication token if using protected endpoints

### File download blocked?

→ Check browser popup blocker
→ Check if Content-Disposition header is set
→ Check CORS settings if cross-origin

## 📱 URL Encoding Reminder

For special characters in filter values:

- Space: `%20`
- Quotes: `%22`
- Percent: `%25`

Example: `/api/vendors?search=John%20Doe&format=csv`

## 🚀 Alternative Parameter Names

Both work the same:

- `?format=csv` ✅
- `?export=csv` ✅

## 🔐 Authentication

Export respects existing authentication/authorization:

- Must be logged in
- Must have read permission on resource
- RBAC rules still apply

## 📖 Documentation Files

- **User Guide**: `DOWNLOAD_FEATURE.md`
- **Developer Guide**: `DEVELOPER_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **Test Script**: `test-export.js`

## 🎓 Learn More

1. Read `DOWNLOAD_FEATURE.md` for detailed documentation
2. Check `DEVELOPER_GUIDE.md` for code examples
3. Run `test-export.js` to verify setup
4. Review controller code for implementation details

---

**Last Updated**: 2024
**Status**: ✅ Ready to Use
