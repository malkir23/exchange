const cron = require('node-cron');
const WebSocket = require('ws');
require('dotenv').config();

const API_URL = process.env.API_URL;
const FASTAPI_URL = `${process.env.FASTAPI_URL}/site/save-data`;
const WEBSOCKET_URL = process.env.WEBSOCKET_URL;
const USER = process.env.USER;
const headers = {
  'Content-Type': 'application/json',
};

let ws;
let cumulativeSum = 0;

function getTodayDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  return `${month}/${day}/${year}`;
}

function connectWebSocket() {
  ws = new WebSocket(WEBSOCKET_URL);

  ws.onopen = () => {
    console.log('✅ WebSocket підключено');

    const subscriptionRequest = {
      method: 'subscribe',
      subscription: {
        type: 'webData2',
        user: USER,
      },
    };

    ws.send(JSON.stringify(subscriptionRequest));
    console.log('📤 Надіслано запит:', subscriptionRequest);
  };

  ws.onmessage = (event) => {
    const spotState = JSON.parse(event.data)?.data?.spotState;
    if (!spotState) {
      return;
    }
    const balances = spotState['balances'];
    for (const balance of balances) {
      if (balance.coin === 'HYPE') {
        cumulativeSum = balance.total;
        console.log('🔢 Кумулятивна сума:', cumulativeSum);
        ws.close();
      }
    }
  };

  ws.onerror = (error) => {
    console.error('❌ Помилка WebSocket:', error);
  };

  ws.onclose = (event) => {
    setTimeout(() => {
      connectWebSocket();
    }, 600000);
    console.log('🔌 WebSocket закрито, перепідключення через 1 годину...');
  };
}

function serializeData(tokenData) {
  const sumDate = {};

  for (const item of tokenData) {
    const time = new Date(item.time).toLocaleDateString('en-US');
    const amount = Number(item.sz);
    const total = Number(item.px) * amount;
    const token = item.feeToken;

    sumDate[time] ??= {};
    sumDate[time][token] ??= { total: 0, amount: 0 };

    sumDate[time][token].total += total;
    sumDate[time][token].amount += amount;
  }
  return sumDate;
}

// Function to fetch data from API
async function fetchData() {
  try {
    const payload = {
      type: 'userFills',
      user: USER,
      aggregateByTime: true,
    };


    const response = await fetch(API_URL, {
      method: 'POST', // HTTP method
      headers: headers,
      body: JSON.stringify(payload), // Convert payload to JSON string
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const mongoData = await serializeData(data);
    const date = getTodayDate();
    console.log('✅ Data Fetched Successfully:', mongoData);
    console.log('📅 Today\'s Date:', date);

    mongoData[date]['totalAmount'] = cumulativeSum;
    //  const test =  await connectWebSocket();

    console.log('✅ Data Serialized Successfully:', mongoData);

    // Send data to FastAPI endpoint
    await fetch(FASTAPI_URL, {
      method: 'POST',
      headers:headers,
      body: JSON.stringify(mongoData),
    });
    console.log('✅ Data Sent to FastAPI Successfully');
  } catch (error) {
    console.error('❌ Error during POST request:', error);
  }
}

cron.schedule('* * * * *', () => {
  console.log('⏳ Running Scheduled Task: Fetch Data');
  fetchData();
});
connectWebSocket();
console.log('🕒 Cron job started. Fetching data every hour...');
