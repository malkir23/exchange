let tokensChart = null;
const TOKEN_URL = '/site/data';


async function getLables(tokenData) {
  const allLabels = Object.keys(tokenData).flatMap((date) => {
    return Object.keys(tokenData[date]).filter(
      (key) => key !== '_id' && key !== 'date' && key !== 'totalAmount'
    );
  });
  const uniqueLabels = [...new Set(allLabels)]; // Remove duplicates
  return uniqueLabels;
}

async function buildChart(tokenData) {
  const labels = Object.keys(tokenData);
  const tokens = await getLables(tokenData);

  const generateColor = (opacity = 1) => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const datasets = tokens.flatMap((token) => {
    const totalValues = labels.map(
      (date) => tokenData[date][token]?.total || 0
    );
    const amountValues = labels.map(
      (date) => tokenData[date][token]?.amount || 0
    );
    const totalAmountValues = labels.map((date) => tokenData[date].totalAmount);

    // const totalColor = generateColor(0.6);
    // const amountColor = generateColor(0.6);
    const totalAmountColor = 'rgba(255, 99, 132, 1)';

    return [
      {
        label: `USDC`,
        data: totalValues,
        borderColor: 'rgba(20, 223, 155, 1)',
        backgroundColor: 'rgba(20, 223, 155, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        type: 'bar',
      },
      {
        label: `HYPE`,
        data: amountValues,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        borderDash: [5, 5],
        fill: false,
        type: 'bar',
      },
      {
        label: `AF HYPE`,
        data: totalAmountValues,
        borderColor: totalAmountColor,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        borderDash: [2, 2],
        fill: false,
        type: 'line',
        yAxisID: 'y1',
      },
    ];
  });

  const ctx = document.getElementById('tokensChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar', // Base type
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                context.dataset.label + ': ' + context.raw.toLocaleString()
              );
            },
          },
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
            text: 'Value',
          },
          beginAtZero: true,
        },
        y1: {
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'Total Amount',
          },
        },
      },
    },
  });
}

async function sendPostRequest() {
  try {
    const response = await fetch(TOKEN_URL, { method: 'GET' });
    console.log('✅ Data Fetched Successfully:', response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Data Fetched Successfully:', data['data']);
    await buildChart(data['data']);
  } catch (error) {
    console.error('Error during POST request:', error);
  }
}
$(document).ready(function () {
  sendPostRequest();
  setInterval(sendPostRequest, 3600000); // 3600000 milliseconds = 1 hour
});
