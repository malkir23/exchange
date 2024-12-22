const TWAPsChartKey = 'TWAPs-chart';
let dataExchange = {
  TWAPsChartKey: [],
};
let TWAPsChart = null;

async function buildChart(keyData) {
  const TWAPsData = dataExchange[keyData];
  const labels = TWAPsData.map((item) =>
    new Date(item.time).toLocaleDateString()
  );
  console.log(dataExchange);

  const dataPoints = TWAPsData.map((item) => item.action.twap.m);

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

async function fetchTwaps() {
  $.ajax({
    url: 'http://84.247.191.198:8000/twaps/get_twap_data',
    method: 'GET',
    success: function (data) {
      let twapsTable = $('#TWAPs-table tbody');

      twapsTable.empty();

      if (data && Array.isArray(data)) {
        data.forEach(item => {
          const row = `<tr>
            <td>${item.rank || 'N/A'}</td>
            <td>${item.address || 'N/A'}</td>
            <td>${item.amount || 'N/A'}</td>
            <td>${item.value || 'N/A'}</td>
            <td>${item.supply || 'N/A'}</td>
          </tr>`;
          twapsTable.append(row);
        });
        dataExchange[TWAPsChartKey] = data;
      } else {
        twapsTable.append('<tr><td colspan="2">No data available</td></tr>');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data:', error);
      $('#TWAPs-table tbody').append('<tr><td colspan="2">Error fetching data</td></tr>');
    }
  });
}

$(document).ready(function () {
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
  fetchTwaps();
  setInterval(fetchTwaps, 100000); // Refresh data every 30 seconds
});
