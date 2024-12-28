const TWAPsChartKey = 'TWAPs-chart';

let dataExchange = {
  TWAPsChartKey: [],
};
let price = {};

let TWAPsChart = null;

async function buildChart(keyData) {
  const TWAPsData = dataExchange[keyData];
  const labels = TWAPsData.map((item) =>
    new Date(item.time).toLocaleDateString()
  );
  console.log(dataExchange);

  const dataPoints = TWAPsData.map((item) => item.action.twap.s);
  const sellDataPoints = TWAPsData.filter((item) => item.action.twap.b === false).map((item) => item.action.twap.s);
  const buyDataPoints = TWAPsData.filter((item) => item.action.twap.b === true).map((item) => item.action.twap.s);

  const ctx = document.getElementById(`${keyData}-data`).getContext('2d');

  // Check if the chart already exists
  if (TWAPsChart) {
    TWAPsChart.destroy(); // Destroy the existing chart
  }

  TWAPsChart = new Chart(ctx, {
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
        {
          label: 'Sell',
          data: sellDataPoints,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: 'Buy',
          data: buyDataPoints,
          borderColor: 'rgb(5, 172, 69)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
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


async function get_price(requestData) {
  await $.ajax({
    url: "https://api.hyperliquid.xyz/info",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(requestData),
    success: function (response) {
      price = response;
    },
    error: function (error) {
      console.error("API Error:", error);
    }
  });
}

function addTotalData(totalData) {
  console.log(totalData);

  $('#total-sell').text(totalData['countSell'] || 0);
  $('#total-buy').text(totalData['countBuy'] || 0);
  $('#total-sell-value').text(`${totalData['volumeSell']} $` || 0);
  $('#total-buy-value').text(`${totalData['volumeBuy']} $` || 0);
}

async function fetchTwaps() {
  await get_price({ "tokenId": "0x0d01dc56dcaaca66ad901c959b4011ec", "type": "tokenDetails" });
  let totalData = {};
  $.ajax({
    url: '/twaps/get_twap_data',
    method: 'GET',
    success: function (data) {
      let twapsTable = $('#TWAPs-table tbody');

      twapsTable.empty();
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          const isSell = item.action.twap.b === false;
          const dollarValue = price.markPx * item.action.twap.s;
          data['dollarValue'] = dollarValue;
          function calculateHours(timestamp) {
            // Конвертуємо мітку часу в об'єкт Date
            const date = new Date(timestamp);

            // Отримуємо години з урахуванням місцевого часу
            const hours = date.getUTCHours(); // Використовуємо UTC для стабільності

            // Повертаємо розраховані години
            return hours;
          }

          const calculatedHours = calculateHours(item.time);
          if(!item.ended) {

            console.log("Calculated Hours:", item.time, calculatedHours);
          }

          const row = `<tr>
          <td class="${isSell ? 'sell-color' : 'buy-color'}">${isSell ? 'SELL' : 'BUY' || 'N/A'}</td>
          <td>${item.action.twap.s || 'N/A'}</td>
          <td>${dollarValue || 'N/A'} $</td>
          <td>${item.user || 'N/A'}</td>
          <td>${item.ended || calculatedHours}</td>
          </tr>`;

          if (isSell) {
            totalData['countSell'] = totalData['countSell'] ? totalData['countSell'] + 1 : 1;
            totalData['volumeSell'] = totalData['volumeSell'] ? totalData['volumeSell'] + parseInt(item.action.twap.s) : parseInt(item.action.twap.s);
          } else {
            totalData['countBuy'] = totalData['countBuy'] ? totalData['countBuy'] + 1 : 1;
            totalData['volumeBuy'] = totalData['volumeBuy'] ? totalData['volumeBuy'] + parseInt(item.action.twap.s) : parseInt(item.action.twap.s);
          }

          if (item.error === null) {
            twapsTable.append(row);
          }
        });
        dataExchange[TWAPsChartKey] = data;
        addTotalData(totalData);
      } else {
        twapsTable.append('<tr><td colspan="5">No data available</td></tr>');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data:', error);
      $('#TWAPs-table tbody').append('<tr><td colspan="2">Error fetching data</td></tr>');
    }
  });
}

function sortTable() {
  let currentSortColumn = -1;
  let isAscending = true;

  $('#TWAPs-table th').on('click', function () {
    const index = $(this).index();
    const rows = $('#TWAPs-table tbody tr').get();
    const columnType = $(this).data('type') || 'string';

    if (currentSortColumn === index) {
      isAscending = !isAscending;
    } else {
      isAscending = true;
    }
    currentSortColumn = index;

    rows.sort((rowA, rowB) => {
      const cellA = $(rowA).children('td').eq(index).text().trim();
      const cellB = $(rowB).children('td').eq(index).text().trim();

      if (columnType === 'number') {
        return isAscending ? cellA - cellB : cellB - cellA;
      } else {
        return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
      }
    });

    $.each(rows, function (index, row) {
      $('#TWAPs-table tbody').append(row);
    });

    $('#TWAPs-table th').removeClass('sort-asc sort-desc');
    $(this).addClass(isAscending ? 'sort-asc' : 'sort-desc');
  });
}

function toggleTable() {
  $('.tab-button').on('click', function () {
    const targetTab = $(this).data('tab');

    $('.tab-button').removeClass('active');
    $(this).addClass('active');

    $('.tab-content').removeClass('active');
    $(`#${targetTab}`).addClass('active');
    if (targetTab.includes('chart')) {
      console.log(targetTab);

      buildChart(targetTab);
    }
  });
}

$(document).ready(function () {
  toggleTable();
  fetchTwaps();
  setInterval(fetchTwaps, 60000); // Refresh data every 1 minutes
  sortTable();
});
