import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ToastToken, ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  role: string = ''
  isAdmin: boolean = false
  loginUsername: string = ''
  isScrolled = false;
  isLoggingOut: boolean = false
  isDark = false
  notifications: any[] = []
  unreadCount: number = 0

  constructor(private router: Router, private toaster: ToastrService, private http:HttpClient, private api:ApiService) {
    this.router.events.subscribe(() => {
      this.checkUser()
    })
  }

  ngOnInit(): void {
    this.checkUser()

    // ✅ load saved theme
    const savedTheme = localStorage.getItem('theme')
    this.getNotifications()

    // auto refresh every 10 sec
    setInterval(() => {
      this.getNotifications()
    }, 10000)
    if (savedTheme === 'dark') {
      this.isDark = true
      document.body.classList.add('dark-mode')
    }
  }
  ngDoCheck() {
    const role = sessionStorage.getItem('role') || ''

    if (role !== this.role) {
      this.checkUser()
    }
  }

  checkUser() {
    const existingUser = sessionStorage.getItem('existingUser');
    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (existingUser) {
      this.loginUsername = JSON.parse(existingUser).username?.split(' ')[0] || ''
    } else if (loggedInUser) {
      this.loginUsername = JSON.parse(loggedInUser).name?.split(' ')[0] || ''
    } else {
      this.loginUsername = ''
    }

    this.role = sessionStorage.getItem('role') || ''
    this.isAdmin = this.role === 'admin'

  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 0;
  }

  logout() {
    this.isLoggingOut = true
    setTimeout(() => {
      sessionStorage.clear()
      this.loginUsername = ''
      this.isAdmin = false
      this.router.navigateByUrl('/')
      this.isLoggingOut = false
    }, 800);

  }

  getNotifications() {
    this.api.getNotificationsAPI().subscribe({
      next: (res: any) => {
        // 🔥 debug
        this.notifications = res
        this.unreadCount = res.filter((n: any) => !n.isRead).length
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  openNotification(n: any) {

    // mark as read
    this.api.markAsReadAPI(n._id).subscribe(() => {
      n.isRead = true
      this.unreadCount--
    })
  
    // navigate (basic logic)
    if (n.message.includes('booked')) {
      this.router.navigateByUrl('/appointments')
    }
  }
  markAllAsRead() {
    this.notifications.forEach((n: any) => {
      if (!n.isRead) {
        this.api.markAsReadAPI(n._id).subscribe()
        n.isRead = true
      }
    })
  
    this.unreadCount = 0
  }
  toggleDarkMode() {
    this.isDark = !this.isDark

    if (this.isDark) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }
}