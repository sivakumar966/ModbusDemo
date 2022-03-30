import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { ModbusService } from '../services/modbus.service';

@Component({
  selector: 'app-vending',
  templateUrl: './vending.page.html',
  styleUrls: ['./vending.page.scss'],
})
export class VendingPage implements OnInit {

  status_code: any;
  isReading = false;
  readingTimer: any;
  constructor(private modbus: ModbusService) { }

  ngOnInit() {
  }

  Open() {
    this.modbus.OpenSerialPort();
  }

  WriteOne() {
    this.modbus.WriteSingleHoldRegisterFC06(0, 1);
  }

  WriteTwo() {
    this.modbus.SingleWriteFC16(0, 2);
  }

  async ReadStatus() {
    this.isReading = true;

    while (this.isReading) {
      this.modbus.ReadInputRegisterRC04(1).then(data => {
        this.status_code = data;
      });
      await this.delay(1000);
    }
  }

  StopReading() {
    this.isReading = false;
  }

  ManualReset() {
    this.modbus.WriteSingleCoilFC05(65, true);
  }

  Close() {
    this.modbus.ClosePort();
  }


  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



}
