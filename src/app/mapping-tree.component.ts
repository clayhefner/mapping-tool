import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchemaService, SchemaOption, SchemaGroup } from './schema.service';
import * as jsonpath from 'jsonpath';

@Component({
  selector: 'app-mapping-tree',
  templateUrl: './mapping-tree.component.html',
  styleUrls: ['./mapping-tree.component.css'],
  standalone: false,
})
export class MappingTreeComponent implements OnInit, OnDestroy {
  templateName = '';
  selectedSource = '';
  sourceOptions = ['Adyen', 'BlueSnap', 'BluePay', 'Payrix', 'Stripe'];
  tokenImportId: string | null = null;
  // Default sample data for when no data source is selected
  defaultData = {
    customers: [
      {
        id: 'cus_abc123def456',
        email: 'jenny.rosen@example.com',
        description: 'Jenny Rosen',
        default_source: 'card_edf214abc789',
        metadata: {
          color_preference: 'turquoise',
        },
        cards: [
          {
            id: 'card_edf214abc789',
            number: '********4242',
            name: 'Jenny Rosen',
            exp_month: 1,
            exp_year: 2020,
            address_line1: '123 Main St.',
            address_line2: null,
            address_city: 'Springfield',
            address_state: 'MA',
            address_zip: '01101',
            address_country: 'US',
          },
        ],
      },
    ],
  };

  rawData: any;
  currentSourceName: string = 'Stripe Export';
  isCustomData = false;

  schemaOptions: Array<{ label: string; value: string }> = [];
  schemaGroups: SchemaGroup[] = [];
  availableSourcePaths: string[] = [];
  mappings: { [schemaKey: string]: string | string[] } = {};

  // Add data context properties
  sourcePathsWithSamples: Array<{
    path: string;
    displayName: string;
    sampleValue: any;
    fullPath: string;
  }> = [];

  constructor(
    private schemaService: SchemaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('MappingTreeComponent ngOnInit called');

    // Read token import ID from query parameters
    this.route.queryParams.subscribe((params) => {
      this.tokenImportId = params['tokenImportId'] || null;
      console.log('Token Import ID:', this.tokenImportId);
    });

    this.schemaOptions = this.schemaService.getFormattedOptions();
    this.schemaGroups = this.schemaService.getSchemaOptionsByGroup();
    this.loadCurrentDataSource();

    // Listen for data source changes
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'currentDataSource') {
      this.loadCurrentDataSource();
    }
  }

  private loadCurrentDataSource(): void {
    const stored = localStorage.getItem('currentDataSource');
    if (stored) {
      try {
        const dataSource = JSON.parse(stored);
        this.rawData = dataSource.data;
        this.currentSourceName = dataSource.name;
        this.isCustomData = dataSource.isCustom || false;
        this.refreshSourceData();
        this.clearMappings();
      } catch (error) {
        console.error('Error loading data source from localStorage:', error);
        this.loadDefaultDataSet();
      }
    } else {
      this.loadDefaultDataSet();
    }
  }

  private loadDefaultDataSet(): void {
    this.rawData = this.defaultData;
    this.currentSourceName = 'Stripe Export';
    this.isCustomData = false;
    this.refreshSourceData();
  }

  private refreshSourceData(): void {
    this.availableSourcePaths = this.extractSourcePaths(this.rawData);
    this.sourcePathsWithSamples = this.extractSourcePathsWithSamples(
      this.rawData
    );
    console.log(
      'Available source paths (JSONPath format):',
      this.availableSourcePaths
    );
    console.log('Source paths with samples:', this.sourcePathsWithSamples);
  }

  private clearMappings(): void {
    this.mappings = {};
  }

  private extractSourcePaths(data: any, path = ''): string[] {
    const paths: string[] = [];

    // Use a more systematic approach to extract all leaf node paths
    this.extractLeafPaths(data, '$', paths);

    return paths;
  }

  private extractLeafPaths(
    obj: any,
    currentPath: string,
    paths: string[]
  ): void {
    if (obj === null || obj === undefined) {
      // This is a leaf node with null/undefined value
      paths.push(currentPath);
      return;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        // Empty array is a leaf node
        paths.push(currentPath);
      } else {
        // Process array items with [*] notation
        this.extractLeafPaths(obj[0], `${currentPath}[*]`, paths);
      }
    } else if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        // Empty object is a leaf node
        paths.push(currentPath);
      } else {
        // Process object properties
        keys.forEach((key) => {
          const value = obj[key];
          const newPath =
            currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;

          if (typeof value === 'object' && value !== null) {
            this.extractLeafPaths(value, newPath, paths);
          } else {
            // This is a leaf node (primitive value)
            paths.push(newPath);
          }
        });
      }
    } else {
      // This is a primitive value (leaf node)
      paths.push(currentPath);
    }
  }

  private convertToJsonPath(path: string): string {
    // This method is now mainly for manual conversion if needed
    // Most paths should already be in JSONPath format from extractLeafPaths
    if (path.startsWith('$.')) {
      return path; // Already in JSONPath format
    }

    const jsonPath = `$.${path}`;

    console.log(`Converting path: "${path}" -> JSONPath: "${jsonPath}"`);

    // Validate the JSONPath expression
    if (this.validateJsonPath(jsonPath)) {
      console.log(`✅ Valid JSONPath: ${jsonPath}`);
      return jsonPath;
    } else {
      console.warn(`❌ Invalid JSONPath generated: ${jsonPath}`);
      return jsonPath; // Return anyway for now, but log the warning
    }
  }

  private validateJsonPath(jsonPathExpression: string): boolean {
    try {
      // Test the JSONPath against our sample data
      jsonpath.query(this.rawData, jsonPathExpression);
      return true;
    } catch (error) {
      console.error(
        `JSONPath validation failed for: ${jsonPathExpression}`,
        error
      );
      return false;
    }
  }

  // Method to test a JSONPath against current data and return sample results
  testJsonPath(jsonPathExpression: string): any[] {
    try {
      return jsonpath.query(this.rawData, jsonPathExpression);
    } catch (error) {
      console.error(`JSONPath test failed for: ${jsonPathExpression}`, error);
      return [];
    }
  }

  private extractSourcePathsWithSamples(
    data: any,
    path = ''
  ): Array<{
    path: string;
    displayName: string;
    sampleValue: any;
    fullPath: string;
  }> {
    const pathsWithSamples: Array<{
      path: string;
      displayName: string;
      sampleValue: any;
      fullPath: string;
    }> = [];

    // Use the same systematic approach but collect sample values
    this.extractLeafPathsWithSamples(data, '$', pathsWithSamples);

    return pathsWithSamples;
  }

  private extractLeafPathsWithSamples(
    obj: any,
    currentPath: string,
    pathsWithSamples: Array<{
      path: string;
      displayName: string;
      sampleValue: any;
      fullPath: string;
    }>
  ): void {
    if (obj === null || obj === undefined) {
      // This is a leaf node with null/undefined value
      pathsWithSamples.push({
        path: currentPath,
        displayName: this.getSourceDisplayName(currentPath),
        sampleValue: obj,
        fullPath: currentPath,
      });
      return;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        // Empty array is a leaf node
        pathsWithSamples.push({
          path: currentPath,
          displayName: this.getSourceDisplayName(currentPath),
          sampleValue: obj,
          fullPath: currentPath,
        });
      } else {
        // Process array items with [*] notation
        this.extractLeafPathsWithSamples(
          obj[0],
          `${currentPath}[*]`,
          pathsWithSamples
        );
      }
    } else if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        // Empty object is a leaf node
        pathsWithSamples.push({
          path: currentPath,
          displayName: this.getSourceDisplayName(currentPath),
          sampleValue: obj,
          fullPath: currentPath,
        });
      } else {
        // Process object properties
        keys.forEach((key) => {
          const value = obj[key];
          const newPath =
            currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;

          if (typeof value === 'object' && value !== null) {
            this.extractLeafPathsWithSamples(value, newPath, pathsWithSamples);
          } else {
            // This is a leaf node (primitive value)
            pathsWithSamples.push({
              path: newPath,
              displayName: this.getSourceDisplayName(newPath),
              sampleValue: value,
              fullPath: newPath,
            });
          }
        });
      }
    } else {
      // This is a primitive value (leaf node)
      pathsWithSamples.push({
        path: currentPath,
        displayName: this.getSourceDisplayName(currentPath),
        sampleValue: obj,
        fullPath: currentPath,
      });
    }
  }

  getSampleValueForPath(path: string): any {
    const sample = this.sourcePathsWithSamples.find((s) => s.path === path);
    if (sample) {
      return sample.sampleValue;
    }

    // If not found in pre-computed samples, try using jsonpath to get actual value
    try {
      const results = jsonpath.query(this.rawData, path);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error getting sample value for path: ${path}`, error);
      return null;
    }
  }

  formatSampleValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'boolean') return value.toString();
    return value.toString();
  }

  getSourceDisplayName(path: string): string {
    // Convert JSONPath to human-readable format
    // e.g., "$.customers[*].cards[*].exp_month" -> "Customers > Cards > Exp Month"
    // But simple fields like "$.country" should just show "country"

    let displayPath = path;

    // Remove the $.  prefix if present
    if (displayPath.startsWith('$.')) {
      displayPath = displayPath.substring(2);
    }

    // If it's a simple field name (no dots or brackets), just return it as-is
    if (!displayPath.includes('.') && !displayPath.includes('[')) {
      return displayPath;
    }

    // Split by dots but be careful about [*] notation
    const parts = displayPath
      .split(/\.(?![^[]*\])/) // Split on dots not inside brackets
      .map((part) => {
        if (part.includes('[*]')) {
          return part.replace('[*]', ' Items');
        }
        return part
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });

    return parts.join(' > ');
  }

  getLeafNodeCount(): number {
    return this.availableSourcePaths.length;
  }

  onMappingChange(schemaKey: string, value: string | string[]): void {
    if (
      value &&
      (typeof value === 'string' ? value.trim() : value.length > 0)
    ) {
      this.mappings[schemaKey] = value;
    } else {
      delete this.mappings[schemaKey];
    }
    console.log('Updated mappings:', this.mappings);
  }

  exportMapping(): void {
    if (!this.templateName || !this.selectedSource) {
      alert(
        'Please enter a template name and select a source before exporting.'
      );
      return;
    }

    if (this.getMappedCount() === 0) {
      alert('Please configure at least one mapping before exporting.');
      return;
    }

    // Validate all JSONPath expressions before export
    const mappings = this.getExportData();
    let hasInvalidPaths = false;

    for (const [key, value] of Object.entries(mappings)) {
      if (Array.isArray(value)) {
        for (const path of value) {
          if (!this.validateJsonPath(path)) {
            hasInvalidPaths = true;
            break;
          }
        }
      } else if (typeof value === 'string' && !this.validateJsonPath(value)) {
        hasInvalidPaths = true;
        break;
      }
    }

    if (hasInvalidPaths) {
      const proceed = confirm(
        'Some JSONPath expressions in your mapping may be invalid. Do you want to export anyway?'
      );
      if (!proceed) {
        return;
      }
    }

    const exportData = {
      name: this.templateName,
      sourceProcesor: this.selectedSource,
      importFileScanId: this.generateSimulatedScanId(), // Add simulated scan ID to export
      mapping: mappings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.templateName || 'mapping'}-config.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getExportData(): any {
    const exportData: any = {};

    for (const [schemaKey, sourceValue] of Object.entries(this.mappings)) {
      if (sourceValue) {
        if (Array.isArray(sourceValue)) {
          // Multiple mappings - return as array only if there are multiple items
          exportData[schemaKey] =
            sourceValue.length === 1 ? sourceValue[0] : sourceValue;
        } else {
          // Single mapping
          exportData[schemaKey] = sourceValue;
        }
      }
    }

    return exportData;
  }

  getExportPreview(): string {
    const exportData = this.getExportData();
    const exportWithMeta = {
      name: this.templateName,
      sourceProcesor: this.selectedSource,
      importFileScanId: this.generateSimulatedScanId(),
      mapping: exportData,
    };
    return JSON.stringify(exportWithMeta, null, 2);
  }

  getMappedCount(): number {
    return Object.keys(this.mappings).filter((key) => {
      const value = this.mappings[key];
      return (
        value && (typeof value === 'string' ? value.trim() : value.length > 0)
      );
    }).length;
  }

  getFormattedRawData(): string {
    return JSON.stringify(this.rawData, null, 2);
  }

  // Get current source name for display
  getCurrentSourceName(): string {
    return this.currentSourceName;
  }

  // Get page title based on context
  getPageTitle(): string {
    if (this.tokenImportId) {
      return `Mapping for import ${this.tokenImportId}`;
    }
    return 'Data Mapping Tool';
  }

  // Generate simulated scan ID for JSON preview
  private generateSimulatedScanId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `scan_${timestamp}_${random}`;
  }

  // Get detailed information about a JSONPath expression
  getJsonPathInfo(jsonPathExpression: string): {
    isValid: boolean;
    resultCount: number;
    sampleResults: any[];
    errorMessage?: string;
  } {
    try {
      const results = jsonpath.query(this.rawData, jsonPathExpression);
      return {
        isValid: true,
        resultCount: results.length,
        sampleResults: results.slice(0, 3), // Return first 3 results as samples
      };
    } catch (error) {
      return {
        isValid: false,
        resultCount: 0,
        sampleResults: [],
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Method to verify that our mapping export will work with actual JSONPath queries
  validateMappingExport(): boolean {
    const exportData = this.getExportData();
    let isValid = true;

    for (const [schemaKey, jsonPathValue] of Object.entries(exportData)) {
      if (typeof jsonPathValue === 'string') {
        const info = this.getJsonPathInfo(jsonPathValue);
        if (!info.isValid) {
          console.error(
            `Invalid JSONPath for ${schemaKey}: ${jsonPathValue}`,
            info.errorMessage
          );
          isValid = false;
        }
      } else if (Array.isArray(jsonPathValue)) {
        for (const jsonPath of jsonPathValue) {
          if (typeof jsonPath === 'string') {
            const info = this.getJsonPathInfo(jsonPath);
            if (!info.isValid) {
              console.error(
                `Invalid JSONPath for ${schemaKey}: ${jsonPath}`,
                info.errorMessage
              );
              isValid = false;
            }
          }
        }
      }
    }

    return isValid;
  }
}
