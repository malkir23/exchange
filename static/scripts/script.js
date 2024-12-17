let dataExchange = {
  'daily-trades-chart': [],
};
let dailyTradesChart = null;

async function buildChart(keyData, idElement) {
  console.log(idElement);

  const dailyTradesData = dataExchange[keyData];
  const labels = dailyTradesData.map((item) =>
    new Date(item.time).toLocaleDateString()
  );
  const dataPoints = dailyTradesData.map((item) => item.daily_trades);

  const ctx = document.getElementById(`${idElement}-data`).getContext('2d');

  // Check if the chart already exists
  if (dailyTradesChart) {
    dailyTradesChart.destroy(); // Destroy the existing chart
  }

  dailyTradesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Daily Trades',
          data: dataPoints,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Trades',
          },
          beginAtZero: true,
        },
      },
    },
  });
}

async function fetchDailyTrades() {
  try {
    const response = await $.ajax({
      url: 'https://d2v1fiwobg9w6.cloudfront.net/daily_trades',
      method: 'GET',
    });

    const chartData = JSON.parse(response).chart_data;
    if (chartData.length === 0) {
      return;
    }
    let tradesTable = $("#daily-trades-table tbody");
    tradesTable.empty();
    chartData.forEach((item) => {
      tradesTable.append(
        `<tr><td>${item.time}</td><td>${item.daily_trades}</td></tr>`
      );
    });
    dataExchange['daily-trades-chart'] = chartData;
  } catch (error) {
    console.error('Error fetching data:', error);
    $('#daily-trades').text('Error fetching data');
  }
}

$(document).ready(function () {
  $('.tab-button').on('click', function () {
    const targetTab = $(this).data('tab');

    $('.tab-button').removeClass('active');
    $(this).addClass('active');

    $('.tab-content').removeClass('active');
    $(`#${targetTab}`).addClass('active');
    if (targetTab.includes('chart')) {
      buildChart(targetTab, 'daily-trades-chart');
    }
  });

  fetchDailyTrades();
  setInterval(fetchDailyTrades, 100000); // Refresh data every 30 seconds
});
