const cron = require('node-cron');
require('dotenv').config(); // Load environment variables from .env file

const API_URL = 'https://api-ui.hyperliquid.xyz/info';
const FASTAPI_URL = `${process.env.FASTAPI_URL }/site/save-data`;


function calculateCumulativeSum(data) {
  const dates = Object.keys(data).sort((a, b) => new Date(a) - new Date(b)); // Сортуємо за датою
  let cumulativeSum = 0;

  const result = {};

  for (const date of dates) {
    const tokens = data[date];

    result[date] = {};

    for (const token in tokens) {
      cumulativeSum += tokens[token].total;
      result[date][token] = {
        total: tokens[token].total,
        amount: tokens[token].amount,
        totalAmount: cumulativeSum
      };
    }
  }

  return result;
}

  function serializeData(tokenData) {
    const sumDate = {};

    for (const item of tokenData) {
      const time =  new Date(item.time).toLocaleDateString('en-US');
      const amount = Number(item.sz);
      const total = Number(item.px) * amount;
      const token = item.feeToken;

      sumDate[time] ??= {};
      sumDate[time][token] ??= { total: 0, amount: 0 };

      sumDate[time][token].total += total;
      sumDate[time][token].amount += amount;
    }
    const result = calculateCumulativeSum(sumDate);
    console.log('✅ Data Serialized Successfully:', result);

    return result;
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
      headers: headers,
      body: JSON.stringify(payload), // Convert payload to JSON string
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
