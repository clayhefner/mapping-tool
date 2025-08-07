import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-source-manager',
  templateUrl: './data-source-manager.component.html',
  styleUrls: ['./data-source-manager.component.css'],
  standalone: false,
})
export class DataSourceManagerComponent implements OnInit {
  // Sample data sets to simulate different backend responses
  sampleDataSets = [
    {
      name: 'Stripe Export',
      description: 'Customer data with payment cards and addresses',
      lastModified: '2025-06-27T10:30:00Z',
      fieldCount: 16,
      data: {
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
      },
    },
    {
      name: 'Affinipay Export',
      description: 'Customer and payment data from Affinipay',
      lastModified: '2023-01-24T20:57:21.063Z',
      fieldCount: 15,
      data: [
        {
          id: 'AJWAaN2RQnqprEM3Nc5qNw',
          created: '2023-01-24T20:57:21.063Z',
          name: 'Clay Hefner',
          address1: '123 Example St',
          address2: 'Suite 784',
          city: 'Hiltonshire',
          state: 'ID',
          postal_code: '35184',
          country: 'USA',
          email: 'clay@preczn.com',
          phone: '',
          number: '********4242',
          card_type: 'VISA',
          exp_month: 3,
          exp_year: 2024,
          reference: '',
        },
      ],
    },
  ];

  selectedDataSet = 0;

  constructor() {}

  ngOnInit(): void {
    // Check if there's no data source set yet, and apply the default Stripe data
    const stored = localStorage.getItem('currentDataSource');
    console.log('Stored data source:', stored);

    if (!stored) {
      console.log('No stored data source found, applying default Stripe data');
      // Apply the default data set (Stripe Export) on first load
      this.applyDataSet();
    } else {
      // Parse and validate the stored data
      try {
        const dataSource = JSON.parse(stored);
        console.log('Parsed stored data source:', dataSource);

        // Check if the stored data matches our expected format
        if (!this.isValidStripeFormat(dataSource.data)) {
          console.log(
            'Stored data is not in expected Stripe format, resetting to default'
          );
          // Clear invalid data and set default
          localStorage.removeItem('currentDataSource');
          this.applyDataSet();
        }
      } catch (error) {
        console.error('Error parsing stored data source:', error);
        localStorage.removeItem('currentDataSource');
        this.applyDataSet();
      }
    }
  }

  // Force reset to default Stripe data
  resetToDefault(): void {
    console.log('Forcing reset to default Stripe data');
    localStorage.removeItem('currentDataSource');
    this.selectedDataSet = 0;
    this.applyDataSet();
  }

  // Validate if data matches expected Stripe format
  private isValidStripeFormat(data: any): boolean {
    // Check if it has the nested structure we expect (customers array with cards)
    return (
      data &&
      data.customers &&
      Array.isArray(data.customers) &&
      data.customers.length > 0 &&
      data.customers[0].cards &&
      Array.isArray(data.customers[0].cards)
    );
  }

  selectDataSet(index: number): void {
    this.selectedDataSet = index;
    this.applyDataSet();
  }

  applyDataSet(): void {
    const dataSet = this.sampleDataSets[this.selectedDataSet];
    // Store in localStorage for the mapping component to use
    localStorage.setItem(
      'currentDataSource',
      JSON.stringify({
        name: dataSet.name,
        data: dataSet.data,
        isCustom: false,
        index: this.selectedDataSet,
      })
    );

    // Trigger a storage event to notify the mapping component
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'currentDataSource',
        newValue: JSON.stringify({
          name: dataSet.name,
          data: dataSet.data,
          isCustom: false,
          index: this.selectedDataSet,
        }),
      })
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getFormattedData(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
