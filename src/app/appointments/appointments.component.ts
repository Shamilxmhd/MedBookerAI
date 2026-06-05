import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {

  allAppointments: any = []

  constructor(
    private api: ApiService,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    this.getAppointments()
  }

  getAppointments() {
    this.api.getApAPI().subscribe({
      next: (res: any) => {
        this.allAppointments = res.sort((a: any, b: any) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()

          if (dateDiff === 0) {
            return b.tokenNumber - a.tokenNumber
          }

          return dateDiff
        })
      },
      error: (err: any) => {
        this.toaster.error('Failed to load appointments')
      }
    });
  }

  Cancel(id: any) {
    this.api.cancelApAPI(id).subscribe({
      next: (res: any) => {
  
        this.toaster.success('Appointment cancelled')
  
        // ✅ instant UI update (no refresh needed)
        this.allAppointments = this.allAppointments.map((ap: any) => {
          if (ap._id === id) {
            return { ...ap, status: 'Cancelled' }
          }
          return ap
        })
  
      },
      error: (err) => {
        console.log(err)
        this.toaster.error('Failed to cancel appointment')
      }
    })
  }
  downloadReceipt(ap: any) {
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

    // 🔷 MAIN BOX
    doc.setDrawColor(200)
    doc.roundedRect(15, 40, 180, 110, 5, 5)

    // 🔷 TOKEN BOX (LEFT)
    doc.setFillColor(240, 248, 255)
    doc.roundedRect(20, 50, 80, 45, 5, 5, 'F')

    doc.setFontSize(12)
    doc.text('TOKEN NO', 47, 65)

    doc.setFontSize(28)
    doc.setTextColor(36, 170, 217)
    doc.text(`${ap.tokenNumber}`, 55, 80)

    doc.setTextColor(0, 0, 0)

    // 🔷 DETAILS (RIGHT)
    let y = 55

    doc.setFontSize(12)

    doc.text(`Patient Name  : ${ap.patientName}`, 110, y)
    y += 10

    doc.text(`Doctor             : ${ap.doctor}`, 110, y)
    y += 10

    doc.text(`Hospital          : ${ap.hospital}`, 110, y)
    y += 10
    doc.text(`Date               : ${ap.date}`, 110, y)
    y += 10

    doc.text(`Visit Type       : ${ap.visitType}`, 110, y)
    y += 10

    doc.text(`Payment         : ${ap.paymentMethod}`, 110, y)

    // 🔷 QR (generate dynamically)
    const qrData = `
    Patient: ${ap.patientName}
    Doctor: ${ap.doctor}
    Date: ${ap.date}
    Token: ${ap.tokenNumber}
    `

    const QRCode = require('qrcode')

    QRCode.toDataURL(qrData).then((url: string) => {
      doc.addImage(url, 'PNG', 40, 100, 40, 40)

      // 🔷 FOOTER
      doc.line(20, 165, 190, 165)

      doc.setFontSize(10)
      doc.text('Please arrive 10 minutes before your appointment time.', 20, 145)

      doc.text('Thank you for choosing MedBooker Healthcare Services', 65, 170)

      doc.save('Appointment_Slip.pdf')
    })
  }
}
