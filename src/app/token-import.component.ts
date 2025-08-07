import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface TokenImport {
  id: string;
  createdTime: string;
  scope: string;
  merchant: string;
  bulkImport: boolean;
  status: 'needsReview' | 'pending' | 'complete';
  failedImports: number;
  responseFile?: string;
}

@Component({
  selector: 'app-token-import',
  templateUrl: './token-import.component.html',
  styleUrls: ['./token-import.component.css'],
  standalone: false,
})
export class TokenImportComponent implements OnInit {
  tokenImports: TokenImport[] = [
    {
      id: 'tknImp_test_23fszjzvq58w4th8rssq6hwnzf',
      createdTime: '06-25-25 14:25:49',
      scope: 'merchant',
      merchant: 'Bobs Burgers',
      bulkImport: true,
      status: 'needsReview',
      failedImports: 0,
      responseFile: 'response_001.json',
    },
    {
      id: 'tknImp_test_1enzcwgkxg8wpbseyhcazmrcct',
      createdTime: '06-24-25 09:15:32',
      scope: 'merchant',
      merchant: 'Pizza Palace',
      bulkImport: false,
      status: 'complete',
      failedImports: 0,
      responseFile: 'response_002.json',
    },
    {
      id: 'tknImp_test_3kzx9mwjfh7q2n5p8vbgdclwer',
      createdTime: '06-23-25 16:42:18',
      scope: 'merchant',
      merchant: 'Coffee Corner',
      bulkImport: true,
      status: 'pending',
      failedImports: 0,
    },
    {
      id: 'tknImp_test_8yzq4rtwxn6m9k2l5vbcfghpas',
      createdTime: '06-22-25 11:30:07',
      scope: 'merchant',
      merchant: 'Tech Store',
      bulkImport: false,
      status: 'needsReview',
      failedImports: 0,
      responseFile: 'response_004.json',
    },
  ];

  openDropdownId: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  getStatusClass(status: string): string {
    switch (status) {
      case 'needsReview':
        return 'status-needs-review';
      case 'pending':
        return 'status-pending';
      case 'complete':
        return 'status-complete';
      default:
        return '';
    }
  }

  downloadResponseFile(fileName: string): void {
    console.log(`Downloading response file: ${fileName}`);
    // Implement download logic here
    alert(`Downloading ${fileName}`);
  }

  mapTokenFile(tokenImport: TokenImport): void {
    console.log(`Mapping token file for import: ${tokenImport.id}`);
    // Navigate to mapping tool
    this.router.navigate(['/mapping'], {
      queryParams: { tokenImportId: tokenImport.id },
    });
  }

  showOptions(event: Event, tokenImport: TokenImport): void {
    event.stopPropagation();
    this.openDropdownId =
      this.openDropdownId === tokenImport.id ? null : tokenImport.id;
  }

  isDropdownOpen(tokenImportId: string): boolean {
    return this.openDropdownId === tokenImportId;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }
}
