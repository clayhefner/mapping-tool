import { Injectable } from '@angular/core';

export interface SchemaOption {
  label: string;
  value: string;
  description?: string;
  group?: string;
}

export interface SchemaGroup {
  name: string;
  options: SchemaOption[];
}

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  private schemaOptions: SchemaOption[] = [
    // Source UIDs Fields
    {
      label: 'Token',
      value: 'token',
      description: 'Payment token identifier',
      group: 'Source IDs',
    },
    {
      label: 'Customer ID',
      value: 'customerId',
      description: 'Customer identifier associated with the token',
      group: 'Source IDs',
    },
    // Card Information
    {
      label: 'Card Number',
      value: 'number',
      description: 'Card number',
      group: 'Card',
    },
    {
      label: 'Expiration',
      value: 'expiration',
      description: 'Card expiration date',
      group: 'Card',
    },

    // ACH Data
    {
      label: 'Account Number',
      value: 'account',
      description: 'Bank account number',
      group: 'ACH',
    },
    {
      label: 'Routing Number',
      value: 'routing',
      description: 'Bank routing number',
      group: 'ACH',
    },
    {
      label: 'Account Type',
      value: 'accountType',
      description: 'Type of bank account (checking/savings)',
      group: 'ACH',
    },
    {
      label: 'Bank Country',
      value: 'bankCountry',
      description: 'Country of the bank',
      group: 'ACH',
    },

    // Billing Information
    {
      label: 'First Name',
      value: 'firstName',
      description: 'Cardholder first name',
      group: 'Billing Information',
    },
    {
      label: 'Last Name',
      value: 'lastName',
      description: 'Cardholder last name',
      group: 'Billing Information',
    },
    {
      label: 'Email',
      value: 'email',
      description: 'Cardholder email address',
      group: 'Billing Information',
    },

    // Address Information (now part of Billing Information)
    {
      label: 'Address Line',
      value: 'address',
      description: 'Primary address line',
      group: 'Billing Information',
    },
    {
      label: 'Address Line 2',
      value: 'address2',
      description: 'Secondary address line (optional)',
      group: 'Billing Information',
    },
    {
      label: 'City',
      value: 'city',
      description: 'City name',
      group: 'Billing Information',
    },
    {
      label: 'Region',
      value: 'region',
      description: 'State/Province/Region',
      group: 'Billing Information',
    },
    {
      label: 'Postal Code',
      value: 'postal',
      description: 'ZIP/Postal code',
      group: 'Billing Information',
    },
    {
      label: 'Country',
      value: 'country',
      description: 'Country name or code',
      group: 'Billing Information',
    },
  ];

  getSchemaOptions(): SchemaOption[] {
    return [...this.schemaOptions];
  }

  getSchemaOptionsByGroup(): SchemaGroup[] {
    const groups = new Map<string, SchemaOption[]>();

    this.schemaOptions.forEach((option) => {
      const groupName = option.group || 'Other';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(option);
    });

    // Define the desired group order
    const groupOrder = ['Source IDs', 'Card', 'ACH', 'Billing Information'];

    const orderedGroups: SchemaGroup[] = [];

    // Add groups in the specified order
    groupOrder.forEach((groupName) => {
      if (groups.has(groupName)) {
        const groupOptions = groups.get(groupName)!;

        // Special ordering for Billing Information group
        if (groupName === 'Billing Information') {
          const fieldOrder = [
            'firstName',
            'lastName',
            'email',
            'address',
            'address2',
            'city',
            'region',
            'postal',
            'country',
          ];
          const orderedOptions: SchemaOption[] = [];

          // Add fields in the specified order
          fieldOrder.forEach((fieldValue) => {
            const option = groupOptions.find((opt) => opt.value === fieldValue);
            if (option) {
              orderedOptions.push(option);
            }
          });

          // Add any remaining fields that weren't in the specified order
          groupOptions.forEach((option) => {
            if (!fieldOrder.includes(option.value)) {
              orderedOptions.push(option);
            }
          });

          orderedGroups.push({
            name: groupName,
            options: orderedOptions,
          });
        } else {
          // For other groups, use alphabetical sorting
          orderedGroups.push({
            name: groupName,
            options: groupOptions.sort((a, b) =>
              a.label.localeCompare(b.label)
            ),
          });
        }

        groups.delete(groupName);
      }
    });

    // Add any remaining groups (like 'Other') at the end
    Array.from(groups.entries())
      .map(([name, options]) => ({
        name,
        options: options.sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((group) => orderedGroups.push(group));

    return orderedGroups;
  }

  addSchemaOption(option: SchemaOption): void {
    this.schemaOptions.push(option);
  }

  removeSchemaOption(value: string): void {
    this.schemaOptions = this.schemaOptions.filter(
      (option) => option.value !== value
    );
  }

  updateSchemaOption(
    value: string,
    updatedOption: Partial<SchemaOption>
  ): void {
    const index = this.schemaOptions.findIndex(
      (option) => option.value === value
    );
    if (index !== -1) {
      this.schemaOptions[index] = {
        ...this.schemaOptions[index],
        ...updatedOption,
      };
    }
  }

  // Convert to ng-zorro select format
  getFormattedOptions(): Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }> {
    return this.schemaOptions.map((option) => ({
      label: option.label,
      value: option.value,
      disabled: false,
    }));
  }

  // Get grouped options for ng-zorro select with groups
  getGroupedFormattedOptions(): Array<{
    label: string;
    value?: string;
    children?: Array<{ label: string; value: string }>;
  }> {
    const groups = this.getSchemaOptionsByGroup();
    return groups.map((group) => ({
      label: group.name,
      children: group.options.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    }));
  }
}
