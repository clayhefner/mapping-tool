import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit {
  currentView: string = 'token-imports';
  currentRoute: string = '/token-imports';
  tokenImportId: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Set initial current view based on current route
    this.currentRoute = this.router.url;
    this.updateCurrentView();

    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateCurrentView();
      });
  }

  updateCurrentView(): void {
    if (this.currentRoute.includes('/token-imports')) {
      this.currentView = 'token-imports';
      this.tokenImportId = null;
    } else if (this.currentRoute.includes('/mapping')) {
      this.currentView = 'mapping';
      // Extract tokenImportId from query parameters
      const urlParams = new URLSearchParams(
        this.currentRoute.split('?')[1] || ''
      );
      this.tokenImportId = urlParams.get('tokenImportId');
    } else {
      // Default to token-imports for any other route (including root)
      this.currentView = 'token-imports';
      this.tokenImportId = null;
    }
  }

  setCurrentView(view: string): void {
    this.currentView = view;
    if (view === 'data-source') {
      // For data source, we keep the old behavior since it's not routed yet
      return;
    }
  }

  navigateToTokenImports(): void {
    this.currentView = 'token-imports';
    this.router.navigate(['/token-imports']);
  }

  getPageTitle(): string {
    switch (this.currentView) {
      case 'token-imports':
        return 'Token Import Management';
      case 'mapping':
        if (this.tokenImportId) {
          return `Mapping for import ${this.tokenImportId}`;
        }
        return 'Data Mapping Tool';
      case 'data-source':
        return 'Data Source Manager';
      default:
        return 'Token Mapper';
    }
  }

  getPageDescription(): string {
    switch (this.currentView) {
      case 'token-imports':
        return 'Manage and monitor your token import processes';
      case 'mapping':
        if (this.tokenImportId) {
          return 'Review and configure field mappings for this token import';
        }
        return 'Map your source data structure to target schema';
      case 'data-source':
        return 'Manage and configure your data sources';
      default:
        return 'Professional data mapping solution';
    }
  }
}
