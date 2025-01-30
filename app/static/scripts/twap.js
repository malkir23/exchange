const TWAPsChartKey = 'TWAPs-chart';

let dataExchange = {
  [TWAPsChartKey]: [],
};
let price = {};
let tokenSelect = '';

let TWAPsChart = null;

async function buildChart(keyData) {
  const TWAPsData = dataExchange[keyData];
  const labels = TWAPsData.map((item) =>
    new Date(item.time).toLocaleDateString()
  );

  const dataPoints = TWAPsData.map((item) => item.action.twap.s);
  const sellDataPoints = TWAPsData.filter((item) => !item.action.twap.b).map((item) => item.action.twap.s);
  const buyDataPoints = TWAPsData.filter((item) => item.action.twap.b).map((item) => item.action.twap.s);

  const ctx = document.getElementById(`${keyData}-data`).getContext('2d');

  if (TWAPsChart) {
    TWAPsChart.destroy();
  }

  TWAPsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Daily Trades', data: dataPoints, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderWidth: 2, tension: 0.3 },
        { label: 'Sell', data: sellDataPoints, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)', borderWidth: 2, tension: 0.3 },
        { label: 'Buy', data: buyDataPoints, borderColor: 'rgb(5, 172, 69)', backgroundColor: 'rgba(54, 162, 235, 0.2)', borderWidth: 2, tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Trades' }, beginAtZero: true },
      },
    },
  });
}

async function getData(requestData) {
  try {
    const response = await $.ajax({
      url: "https://api.hyperliquid.xyz/info",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(requestData),
    });
    price = response;
    console.log("API Response:", response);

  } catch (error) {
    console.error("API Error:", error);
  }
}

async function getTokensNames() {
  try {
    const response = await $.ajax({
      url: "/tokens/tokens_names",
      type: "GET"
    });

    const tokens = response?.tokens;
    if (!tokens) {
      return;
    }
    tokenSelect = tokens[0];

    fetchTwaps(tokenSelect);
    for (const token of tokens) {
      tokenSelect

      $('#token-select').append(`<option value="${token}">${token}</option>`);
    }

  } catch (error) {
    console.error("API Error:", error);
  }
}

function addTotalData(totalData) {
  $('#total-sell').text(totalData.countSell || 0);
  $('#total-buy').text(totalData.countBuy || 0);
  $('#total-sell-value').text(`${totalData.volumeSell || 0} $`);
  $('#total-buy-value').text(`${totalData.volumeBuy || 0} $`);
}

function formatTime(minutes) {
  return minutes < 60 ? `${minutes} minutes` : `${Math.floor(minutes / 60)} hours ${minutes % 60} minutes`;
}

function calculateHours(timestamp) {
  const date = new Date(timestamp - new Date().getTime());
  return `${date.getUTCHours()} hours ${date.getUTCMinutes()} minutes`;
}

async function fetchTwaps(tokenName) {
  await getData({ tokenId: "0x0d01dc56dcaaca66ad901c959b4011ec", type: "tokenDetails" }, price);
  const twapsTable = $('#TWAPs-table tbody');
  twapsTable.empty();
  $.ajax({
    url: '/twaps/get_twap_data',
    method: 'GET',
    dataType: 'json',
    data: {'token':tokenName},
    success: function (data) {
      if (Array.isArray(data)) {
        const totalData = data.reduce((acc, item) => {
          const isSell = !item.action.twap.b;
          const dollarValue = price.markPx * item.action.twap.s;
          const row = `<tr>
            <td class="${isSell ? 'sell-color' : 'buy-color'}">${isSell ? 'SELL' : 'BUY'}</td>
            <td>${item.action.twap.s || 'N/A'}</td>
            <td>${dollarValue.toFixed(2)} $</td>
            <td>${item.user || 'N/A'}</td>
            <td>${formatTime(item.action.twap.m)}</td>
            <td>${item.ended || calculateHours(item.time)}</td>
          </tr>`;
          if (!item.error) twapsTable.append(row);
          const key = isSell ? 'Sell' : 'Buy';
          acc[`count${key}`] = (acc[`count${key}`] || 0) + 1;
          acc[`volume${key}`] = (acc[`volume${key}`] || 0) + parseInt(item.action.twap.s);
          return acc;
        }, {});
        dataExchange[TWAPsChartKey] = data;
        addTotalData(totalData);
      } else {
        twapsTable.append('<tr><td colspan="5">No data available</td></tr>');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data:', error);
      $('#TWAPs-table tbody').append('<tr><td colspan="5">Error fetching data</td></tr>');
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
      buildChart(targetTab);
    }
  });
}

function selectToken() {
  $('#token-select').on('change', function () {
    tokenSelect = $(this).val();
    fetchTwaps(tokenSelect);
  });
}

$(document).ready(function () {
  getTokensNames();
  toggleTable();
  selectToken();
  setInterval(() => fetchTwaps(tokenSelect), 60000);
  sortTable();
});

