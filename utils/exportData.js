/**
 * Utility for exporting data in various formats (CSV, JSON)
 */

/**
 * Convert JSON data to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} fields - Optional: specific fields to include
 * @returns {string} CSV formatted string
 */
function convertToCSV(data, fields = null) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get keys from first object or use provided fields
  const keys = fields || Object.keys(data[0]).filter(key => {
    // Skip MongoDB internal fields and large objects
    return !key.startsWith('_') && typeof data[0][key] !== 'object';
  });

  // Create header row
  const headers = keys.map(key => `"${key}"`).join(',');

  // Create data rows
  const rows = data.map(obj => {
    return keys.map(key => {
      let value = obj[key];
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Flatten nested objects for CSV export
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Prefix for nested keys
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ');
      } else if (value instanceof Date) {
        flattened[newKey] = value.toISOString();
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * Export data to CSV format
 * @param {Object} res - Express response object
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file
 * @param {Array} fields - Optional: specific fields to include
 */
function exportToCSV(res, data, filename, fields = null) {
  const flatData = data.map(item => flattenObject(item.toObject ? item.toObject() : item));
  const csv = convertToCSV(flatData, fields);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(csv);
}

/**
 * Export data to JSON format
 * @param {Object} res - Express response object
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file
 */
function exportToJSON(res, data, filename) {
  const jsonData = data.map(item => item.toObject ? item.toObject() : item);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
  res.send(JSON.stringify(jsonData, null, 2));
}

/**
 * Get export format from query parameter
 * @param {Object} query - Express query object
 * @returns {string} Format (csv, json)
 */
function getExportFormat(query) {
  const format = query.format || query.export;
  return ['csv', 'json'].includes(format) ? format : null;
}

module.exports = {
  convertToCSV,
  flattenObject,
  exportToCSV,
  exportToJSON,
  getExportFormat,
};
