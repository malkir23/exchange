const cron = require('node-cron');
require('dotenv').config(); // Load environment variables from .env file

const API_URL = 'https://api-ui.hyperliquid.xyz/info';
const FASTAPI_URL =
  `${process.env.FASTAPI_URL }/site/save-data` || 'http://localhost:8000/save-data/';


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
      user: '0xfefefefefefefefefefefefefefefefefefefefe',
      aggregateByTime: true,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(API_URL, {
      method: 'POST', // HTTP method
      headers: {
        'Content-Type': 'application/json', // Specify JSON content type
      },
      body: JSON.stringify(payload), // Convert payload to JSON string
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Data Fetched Successfully:', data);

    console.log('✅ Data Fetched Successfully:', data);
   const mongoData = await serializeData(data);
   console.log('✅ Data Serialized Successfully:', mongoData);

    // Send data to FastAPI endpoint
    await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:  JSON.stringify(mongoData),
    });
    console.log('✅ Data Sent to FastAPI Successfully');
  } catch (error) {
    console.error('❌ Error during POST request:', error);
  }
}

// Schedule the cron job to run every minute
cron.schedule('0 * * * *', () => {
  console.log('⏳ Running Scheduled Task: Fetch Data');
  fetchData();
});

// Keep the script running
console.log('🕒 Cron job started. Fetching data every minute...');
