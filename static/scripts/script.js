async function fetchData() {
  try {
    const response = await $.ajax({
      url: 'https://api.hypurrscan.io/twap/*',
      method: 'GET',
      headers: {
        // 'Access-Control-Allow-Origin': 'https://hypurrscan.io',
        'accept': '*/*',
        // 'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'uk,uk-UA;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6,pl;q=0.5',
        // 'connection': 'keep-alive',
        // 'host': 'api.hypurrscan.io',
        // 'origin': 'https://hypurrscan.io',
        // 'referer': 'https://hypurrscan.io/',
        // 'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        // 'sec-ch-ua-mobile': '?0',
        // 'sec-ch-ua-platform': 'Linux'
      }
    });

    // Якщо запит успішний, оновлюємо елементи на сторінці
    $('#transactions').text(response.total_transactions || 'N/A');
    $('#active-users').text(response.active_users || 'N/A');
    $('#network-health').text(response.network_health || 'N/A');
  } catch (error) {
    // Якщо сталася помилка, показуємо "Error"
    $('#transactions').text('Error');
    $('#active-users').text('Error');
    $('#network-health').text('Error');
    console.error('Error fetching data:', error);
  }
}

async function fetchDailyTrades() {
  try {
    const response = await $.ajax({
      url: 'https://d2v1fiwobg9w6.cloudfront.net/daily_trades',
      method: 'GET'
    });

    const chartData = JSON.parse(response).chart_data;
    if (chartData.length === 0) {
      return;
    }
    $('#daily-trades').empty();
    for (let index = 0; index < chartData.length; index++) {
      const chartItem = chartData[index];
      $('#daily-trades').append(`${chartItem.daily_trades} - ${chartItem.time} <br>`);

    }
  } catch (error) {
    console.error('Error fetching data:', error);
    $('#daily-trades').text('Error fetching data');
  }
}

$(document).ready(function() {
  fetchDailyTrades();
  fetchData();
  setInterval(fetchDailyTrades, 30000); // Refresh data every 30 seconds
});
