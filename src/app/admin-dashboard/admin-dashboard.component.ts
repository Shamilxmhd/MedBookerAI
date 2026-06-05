import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  stats: any = {}


  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {

    // 🔒 protect route
    const role = sessionStorage.getItem('role')

    if (role !== 'admin') {
      alert('Access denied')
      this.router.navigateByUrl('/')
      return
    }

    // 📊 fetch stats
    this.getStats()

  }


  getStats() {
    this.http.get('http://localhost:3000/admin/stats').subscribe({
      next: (res: any) => {
        this.stats = res
      },
      error: (err) => {
        console.error(err)
      }
    })
  }


}