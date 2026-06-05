import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { ViewChild, ElementRef } from '@angular/core';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  doctors: any[] = []
  isBooking: boolean = false
  bookingData: any = null
  showPopup: boolean = false
  qrCodeUrl: string = ''
  @ViewChild('chatContainer') chatContainer!: ElementRef;


  // ⭐ Search variables
  searchName: string = ''
  searchSpecialization: string = ''
  specializations: string[] = []

  // ⭐ Chat variables
  isChatOpen: boolean = false
  userInput: string = ''
  isTyping=false

  messages: any[] = [
    { type: 'bot', text: 'Hello! I am MedBooker Assistant. How can I help you?' }
  ]


  constructor(
    private router: Router,
    private toaster: ToastrService,
    private http: HttpClient
  ) { }

  ngOnInit() {

    const role = sessionStorage.getItem('role')

    // 🚫 BLOCK ADMIN FROM HOME PAGE
    if (role === 'admin') {
      this.router.navigateByUrl('/admin')
      return
    }

    // ✅ Normal user logic
    this.getDoctors()

    const data = history.state?.booking

    if (data) {
      this.bookingData = data
      this.showPopup = true

      const qrData = `
      Patient: ${data.patientName}
      Doctor: ${data.doctor}
      Date: ${data.date}
      Token: ${data.tokenNumber}
      `

      QRCode.toDataURL(qrData).then((url: string) => {
        this.qrCodeUrl = url
      })
    }
  }

  // get all doctors
  getDoctors() {
    this.http.get('http://localhost:3000/get-doctors')
      .subscribe((res: any) => {
        this.doctors = res
        const specs = res.map((d: any) => d.specialization)

        this.specializations = [...new Set(specs)] as string[]
      })
  }

  // search + filter
  searchDoctors() {
    let query = ''

    if (this.searchName) {
      query += `name=${this.searchName}&`
    }

    if (this.searchSpecialization) {
      query += `specialization=${this.searchSpecialization}`
    }

    this.http.get(`http://localhost:3000/get-doctors?${query}`)
      .subscribe((res: any) => {
        this.doctors = res
      })
  }

  // booking
  bookAp(doctor?: any) {
    if (sessionStorage.getItem('token')) {

      this.isBooking = true

      setTimeout(() => {
        this.router.navigate(['/bookAppointment'], {
          state: { doctor: doctor?.name }
        })
        this.isBooking = false
      }, 500)

    } else {
      this.toaster.warning('Please Login')
    }
  }

  // ⭐ CHAT FUNCTIONS

  toggleChat() {
    this.isChatOpen = !this.isChatOpen
  }

  sendMessage() {
    if (!this.userInput.trim()) return
  
    const userText = this.userInput
  
    this.messages.push({ type: 'user', text: userText })
    this.userInput = ''
    this.scrollToBottom()
  
    this.isTyping = true
  
    setTimeout(() => {
      const botReply = this.getBotReply(userText)
  
      this.isTyping = false
  
      this.messages.push({ type: 'bot', text: botReply })
      this.scrollToBottom()
  
    }, 700)
  }

  // ⭐ SIMPLE AI LOGIC
  getBotReply(msg: string): string {

    msg = msg.toLowerCase()
  
    if (msg.includes('doctor')) {
      return `We have ${this.doctors.length} doctors available. You can explore them in the doctors section.`
    }
  
    if (msg.includes('book')) {
      return 'Select a doctor and click "Book Appointment". Fill patient details and confirm booking.'
    }
  
    if (msg.includes('appointment')) {
      return 'Go to "My Appointments" to view, cancel or download your appointment receipt.'
    }
  
    if (msg.includes('cancel')) {
      return 'You can cancel appointments from "My Appointments" section.'
    }
  
    if (msg.includes('payment')) {
      return 'You can choose Pay at Hospital or Online Payment during booking.'
    }
  
    if (msg.includes('token')) {
      return 'Token is automatically generated after booking and shown in your receipt.'
    }
  
    if (msg.includes('hospital')) {
      return 'Each doctor is associated with a hospital shown during booking.'
    }
  
    if (msg.includes('login')) {
      return 'Login is required to book and manage appointments.'
    }
  
    if (msg.includes('admin')) {
      return 'Admin manages doctors and appointments through dashboard.'
    }
  
    if (msg.includes('hi') || msg.includes('hello')) {
      return 'Hello 👋 How can I assist you today?'
    }
  
    return 'I can help with doctors, booking, appointments, payments and more.'
  }
  quickAsk(text: string) {
    this.userInput = text
    this.sendMessage()
  }
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  closePopup() {
    this.showPopup = false
  }

  getDoctorSpecialization() {
    const doc = this.doctors.find(d => d.name === this.bookingData.doctor)
    return doc ? doc.specialization : 'General'
  }
  downloadReceipt() {
    const doc = new jsPDF()

    // 🔷 HEADER
    doc.setFillColor(36, 170, 217)
    doc.rect(0, 0, 210, 30, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('MedBooker', 90, 15)

    doc.setFontSize(10)
    doc.text('Healthcare Appointment System', 81, 22)

    doc.setTextColor(0, 0, 0)

    // 🔷 BOX
    doc.setDrawColor(200)
    doc.roundedRect(15, 40, 180, 110, 5, 5)

    // 🔷 RIGHT SIDE (PATIENT DETAILS)
    doc.setFontSize(12)

    let y = 55

    doc.text(`Patient Name  : ${this.bookingData.patientName}`, 110, y)
    y += 10

    doc.text(`Doctor             : ${this.bookingData.doctor}`, 110, y)
    y += 10
    doc.text(`Specialization : ${this.getDoctorSpecialization()}`, 110, y)
    y += 10
    doc.text(`Hospital          : ${this.bookingData.hospital}`, 110, y)
    y += 10
    doc.text(`Date               : ${this.bookingData.date}`, 110, y)
    y += 10

    doc.text(`Visit Type       : ${this.bookingData.visitType}`, 110, y)
    y += 10

    doc.text(`Payment         : ${this.bookingData.paymentMethod}`, 110, y)

    // 🔷 TOKEN BOX (LEFT SIDE)
    doc.setFillColor(240, 248, 255)
    doc.roundedRect(20, 50, 80, 40, 5, 5, 'F')

    doc.setFontSize(12)
    doc.text('TOKEN NO', 47, 65)

    doc.setFontSize(28)
    doc.setTextColor(36, 170, 217)
    doc.text(`${this.bookingData.tokenNumber}`, 55, 80)
    doc.setTextColor(0, 0, 0)
    // 🔷 QR CODE
    if (this.qrCodeUrl) {
      doc.addImage(this.qrCodeUrl, 'PNG', 40, 90, 40, 40)
    }

    // 🔷 FOOTER
    doc.line(20, 165, 190, 165)

    doc.setFontSize(10)
    doc.text('Please arrive 10 minutes before your appointment time.', 20, 145)

    doc.text('Thank you for choosing MedBooker Healthcare Services', 65, 170)

    doc.save('Appointment_Slip.pdf')
  }
}
