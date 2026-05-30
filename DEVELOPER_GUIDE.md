# Quick Start: Adding Download Feature to New Controllers

## For Developers: How to Add Export to Your Controllers

### Step 1: Import the Export Utility

At the top of your controller file:

```javascript
const {
  getExportFormat,
  exportToCSV,
  exportToJSON,
} = require("../utils/exportData");
```

### Step 2: Update Your List Method

Modify your existing `list` or `get` method to check for export format:

**Before:**

```javascript
exports.list = async (req, res) => {
  try {
    const items = await YourModel.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

**After:**

```javascript
exports.list = async (req, res) => {
  try {
    const items = await YourModel.find();

    // Handle export if requested
    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      return exportToCSV(res, items, "items"); // 'items' is the filename
    }
    if (exportFormat === "json") {
      return exportToJSON(res, items, "items");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

### Step 3: Test It

Test your endpoint with:

```bash
# CSV export
curl "http://localhost:5000/api/items?format=csv"

# JSON export
curl "http://localhost:5000/api/items?format=json"
```

## Advanced: Export with Populated Fields

If your model uses `.populate()`:

```javascript
exports.list = async (req, res) => {
  try {
    const items = await YourModel.find()
      .populate("user", "name email")
      .populate("project", "projectName");

    // Export works automatically with populated fields
    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      return exportToCSV(res, items, "items");
    }
    if (exportFormat === "json") {
      return exportToJSON(res, items, "items");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

## Selective Field Export

If you want to export only specific fields:

```javascript
exports.list = async (req, res) => {
  try {
    const items = await YourModel.find().select("name email createdAt status");

    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      // Export only specified fields
      return exportToCSV(res, items, "items", [
        "name",
        "email",
        "createdAt",
        "status",
      ]);
    }
    if (exportFormat === "json") {
      return exportToJSON(res, items, "items");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

## Export with Filters

Works seamlessly with existing filters:

```javascript
exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.user = req.query.userId;

    const items = await YourModel.find(filter);

    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      return exportToCSV(res, items, "items-filtered");
    }
    if (exportFormat === "json") {
      return exportToJSON(res, items, "items-filtered");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

## CSV Export with Transformed Data

For complex transformations before CSV export:

```javascript
exports.list = async (req, res) => {
  try {
    const items = await YourModel.find();

    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      // Transform data if needed
      const transformedItems = items.map((item) => ({
        ID: item._id,
        Name: item.name,
        Created: new Date(item.createdAt).toLocaleDateString(),
        Status: item.status.toUpperCase(),
      }));
      return exportToCSV(res, transformedItems, "items-report");
    }

    if (exportFormat === "json") {
      return exportToJSON(res, items, "items");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

## Multiple List Methods in One Controller

If your controller has multiple list methods, add export support to each:

```javascript
// Get all items
exports.getAll = async (req, res) => {
  try {
    const items = await YourModel.find();

    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      return exportToCSV(res, items, "all-items");
    }
    if (exportFormat === "json") {
      return exportToJSON(res, items, "all-items");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

// Get active items
exports.getActive = async (req, res) => {
  try {
    const items = await YourModel.find({ isActive: true });

    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      return exportToCSV(res, items, "active-items");
    }
    if (exportFormat === "json") {
      return exportToJSON(res, items, "active-items");
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};
```

## Export Utility API Reference

### `getExportFormat(query)`

Returns the export format ('csv', 'json', or null)

```javascript
const format = getExportFormat(req.query);
// Returns: 'csv' | 'json' | null
```

### `exportToCSV(res, data, filename, fields)`

Exports data as CSV

```javascript
exportToCSV(res, data, "filename");
exportToCSV(res, data, "filename", ["field1", "field2"]); // Selective fields
```

### `exportToJSON(res, data, filename)`

Exports data as JSON

```javascript
exportToJSON(res, data, "filename");
```

### `convertToCSV(data, fields)`

Converts array of objects to CSV string (utility function)

```javascript
const csv = convertToCSV(data);
const csv = convertToCSV(data, ["id", "name", "email"]);
```

### `flattenObject(obj, prefix)`

Flattens nested objects (utility function)

```javascript
const flat = flattenObject(nestedObj);
const flat = flattenObject(nestedObj, "prefix");
```

## Common Patterns

### Export with Date Range Filter

```javascript
exports.getReportData = async (req, res) => {
  const { from, to } = req.query;
  const query = {};

  if (from && to) {
    query.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const data = await ReportModel.find(query);

  const exportFormat = getExportFormat(req.query);
  if (exportFormat === "csv") {
    return exportToCSV(res, data, `report-${from}-to-${to}`);
  }
  if (exportFormat === "json") {
    return exportToJSON(res, data, `report-${from}-to-${to}`);
  }

  res.json(data);
};
```

### Export with Aggregation

```javascript
exports.getSummaryData = async (req, res) => {
  try {
    const summary = await YourModel.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const exportFormat = getExportFormat(req.query);
    if (exportFormat === "csv") {
      return exportToCSV(res, summary, "summary");
    }
    if (exportFormat === "json") {
      return exportToJSON(res, summary, "summary");
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};
```

## Checklist for Implementation

- [ ] Import the export utility in controller
- [ ] Add export format check in list method
- [ ] Return CSV if format is 'csv'
- [ ] Return JSON if format is 'json'
- [ ] Test with `?format=csv` query parameter
- [ ] Test with `?format=json` query parameter
- [ ] Verify filename is descriptive
- [ ] Test with filtered data if applicable
- [ ] Test with populated fields if applicable

## Troubleshooting

### Export not working?

1. Check that you imported the utility correctly
2. Ensure you're returning with `return exportToCSV(...)` not just calling it
3. Verify the data is an array of objects
4. Check browser console for errors

### Data not showing correctly in CSV?

1. Large nested objects may not export well - try transforming the data
2. Use selective field export for cleaner output
3. Remember arrays are joined with semicolons

### Performance issues?

1. Add `.select()` to limit fields being fetched
2. Consider pagination for very large exports
3. Use JSON format for large datasets (faster)

## Need Help?

Refer to [DOWNLOAD_FEATURE.md](./DOWNLOAD_FEATURE.md) for complete documentation and examples.
