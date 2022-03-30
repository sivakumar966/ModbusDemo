import { Injectable } from '@angular/core';
declare let usbSerialPort: any;

@Injectable({
  providedIn: 'root'
})
export class ModbusService {

  responsedata = [];
  constructor() {
    // this.OpenSerialPort();
  }

  // TestWrite() {
  //   var request_str = '010600000001480A';


  //   if (!this.isOpen) {
  //     this.OpenSerialPort();
  //   }

  //   usbSerialPort.writeHex(request_str, (res: any) => {
  //     console.log('writer res: ', res);
  //   }, err => {
  //     console.log('writer hex err: ', err);
  //   });

  // }

  WriteSingleHoldRegisterFC06(address: number, value: number) {
    var defaultheader = [1, 6, 0, address, 0, value];
    var crc_str = this.crc16(defaultheader).toString(16).padStart(4, '0');
    var crcbytes = this.hexToBytes(crc_str);
    crcbytes = crcbytes.reverse()
    var output = [];
    defaultheader.forEach(x => output.push(x));
    crcbytes.forEach(x => { output.push(x); });
    var request_str = this.bytesToHex(output);
    this.WriteToHEX(request_str);
  }

  SingleWriteFC16(address: number, value: number) {
    var defaultheader = [1, 16, 0, address, 0, 1, 2, 0, value];
    var crc_str = this.crc16(defaultheader).toString(16).padStart(4, '0');
    var crcbytes = this.hexToBytes(crc_str);
    crcbytes = crcbytes.reverse()
    var output = [];
    defaultheader.forEach(x => output.push(x));
    crcbytes.forEach(x => { output.push(x); });
    var request_str = this.bytesToHex(output);
    this.WriteToHEX(request_str);
  }

  async ReadInputRegisterRC04(address: number) {
    var defaultheader = [1, 4, 0, address, 0, 1];
    var crc_str = this.crc16(defaultheader).toString(16).padStart(4, '0');
    var crcbytes = this.hexToBytes(crc_str);
    crcbytes = crcbytes.reverse()
    var output = [];
    defaultheader.forEach(x => output.push(x));
    crcbytes.forEach(x => { output.push(x); });
    var request_str = this.bytesToHex(output);
    this.responsedata.splice(0);
    this.WriteToHEX(request_str);

    await this.delay(100);

    const resp = this.responsedata[0];
    var respbytes = this.hexToBytes(resp);
    var value_hex = this.bytesToHex(respbytes.slice(3, 5));
    var value = parseInt(value_hex, 16);
    return value;

    // setTimeout(() => {
    //   const resp = this.responsedata[0];
    //   var respbytes = this.hexToBytes(resp);
    //   var value_hex = this.bytesToHex(respbytes.slice(3, 5));
    //   var value = parseInt(value_hex, 16);
    //   return value;
    // }, 100);


  }

  WriteSingleCoilFC05(address: number, value: boolean) {
    var val = value ? 255 : 0;
    var defaultheader = [1, 5, 0, address, val, 0];
    var crc_str = this.crc16(defaultheader).toString(16).padStart(4, '0');
    var crcbytes = this.hexToBytes(crc_str);
    crcbytes = crcbytes.reverse()
    var output = [];
    defaultheader.forEach(x => output.push(x));
    crcbytes.forEach(x => { output.push(x); });
    var request_str = this.bytesToHex(output);
    this.WriteToHEX(request_str);
  }


  crc16(buffer) {
    var crc = 0xFFFF;
    var odd;

    for (var i = 0; i < buffer.length; i++) {
      crc = crc ^ buffer[i];

      for (var j = 0; j < 8; j++) {
        odd = crc & 0x0001;
        crc = crc >> 1;
        if (odd) {
          crc = crc ^ 0xA001;
        }
      }
    }
    return crc;
  };

  hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
  }

  bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
  }




  OpenSerialPort() {
    usbSerialPort.requestPermission({ vid: '0403', pid: '6015', driver: 'FtdiSerialDriver' },
      () => {
        console.log('get permission success.');
        var config = { baudRate: 19200, dataBits: 8, stopBits: 2, parity: 0, sleepOnPause: false }
        usbSerialPort.open(config,
          () => {
            console.log('Serial connection opened');
            usbSerialPort.readListener(
              data => {
                setTimeout(() => {
                  const view = new Uint8Array(data);
                  const resp = this.bytesToHex(view);
                  console.log('Response : ' + resp);
                  this.responsedata.push(resp);
                }, 25);
              },
              err => {
                console.log(err);
              });
          },
          (open_err) => {
            console.log(open_err);
          });
      },
      (per_err) => {
        console.log(per_err);
      });
  }


  isOpen() {
    usbSerialPort.isOpen(
      status => { console.log(status); alert(status); return status },
      err => { console.log(err); alert(err); return false }
    );
  }

  WriteToHEX(request_str: any) {

    if (!this.isOpen) {
      this.OpenSerialPort();
    }
    console.log('Write : ' + request_str);
    usbSerialPort.writeHex(request_str,
      (data) => {
        // const succ = this.bytesToHex(new Uint8Array(data));
        // console.log(succ);
        // console.log('Write complete ' + request_str);
        // setTimeout(() => {
        //   console.log('Reading response');
        //   usbSerialPort.read(
        //     (buffer) => {
        //       console.log('Response ');
        //       console.log(buffer);
        //       const resp = this.bytesToHex(new Uint8Array(buffer));
        //       console.log(resp);
        //       return resp;
        //     },
        //     err => {
        //       console.log(err);
        //       console.log('Error in read Response');
        //     }
        //   );
        // }, 50);

      },
      err => {
        console.log(err);
        console.log('Error in writing');
      }
    );
  }

  ClosePort() {
    usbSerialPort.close();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}
