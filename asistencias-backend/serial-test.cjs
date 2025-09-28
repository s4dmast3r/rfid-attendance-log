const { SerialPort } = require('serialport');

const PATH = process.env.SERIAL_PATH || 'COM5';
const BAUD = parseInt(process.env.SERIAL_BAUD || '115200', 10);

const port = new SerialPort({ path: PATH, baudRate: BAUD });

port.on('open', () => console.log(`OPEN ${PATH} @${BAUD}`));
port.on('error', (e) => console.error('ERR', e));

port.on('data', (buf) => {
  // Muestra bytes y texto crudo tal cual llegan
  console.log('RAW:', buf.toString('hex'), '| TEXT:', JSON.stringify(buf.toString()));
});
