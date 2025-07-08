Chart.register(ChartDataLabels);

let yearlyChart;

fetch('data/processed_data.json')
  .then(response => response.json())
  .then(data => {
    const chartRefs = {};

    const createChart = (id, type, label, labels, values, color = '#1982c4') => {
      const ctx = document.getElementById(id).getContext('2d');

      if (chartRefs[id]) {
        chartRefs[id].destroy();
      }

      const chart = new Chart(ctx, {
        type: type,
        data: {
          labels: labels,
          datasets: [{
            label: label,
            data: values,
            backgroundColor: Array.isArray(color) ? color : color,
            borderColor: color,
            fill: false,
            tension: 0.2
          }]
        },
        options: {
          indexAxis: id === 'genreChart' || id === 'countryChart' ? 'y' : 'x',
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#ffffff'
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#333',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: {
                label: context => `${context.label}: ${context.parsed.y ?? context.parsed} titles`
              }
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#ffffff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#ffffff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });

      chartRefs[id] = chart;
    };

    createChart(
      'typeChart',
      'doughnut',
      'Content Type',
      Object.keys(data.type_counts),
      Object.values(data.type_counts),
      ['#ff595e', '#1982c4']
    );

    createChart(
      'ratingChart',
      'bar',
      'Top Ratings',
      Object.keys(data.ratings),
      Object.values(data.ratings),
      '#00b4d8'
    );

    createChart(
      'genreChart',
      'bar',
      'Top Genres',
      Object.keys(data.top_genres),
      Object.values(data.top_genres),
      '#ffd166'
    );

    createChart(
      'countryChart',
      'bar',
      'Top Countries',
      Object.keys(data.top_countries),
      Object.values(data.top_countries),
      '#06d6a0'
    );

    const typeFilter = document.getElementById("typeFilter");
    const ctxYear = document.getElementById('yearChart').getContext('2d');

    const renderYearChart = (contentType = 'All') => {
      if (yearlyChart) {
        yearlyChart.destroy();
      }

      const fullData = contentType === 'All'
        ? data.yearly_counts_all
        : data.yearly_by_type[contentType];

      yearlyChart = new Chart(ctxYear, {
        type: 'line',
        data: {
          labels: Object.keys(fullData),
          datasets: [{
            label: `${contentType} Releases`,
            data: Object.values(fullData),
            backgroundColor: '#6a4c93',
            borderColor: '#6a4c93',
            fill: false,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#ffffff'
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#333',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: {
                label: context => `${context.label}: ${context.parsed.y} titles`
              }
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#ffffff'
              },
              grid: {
                color: 'rgba(255,255,255,0.1)'
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#ffffff'
              },
              grid: {
                color: 'rgba(255,255,255,0.1)'
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });

      const analysis = document.getElementById('yearAnalysis');
      if (analysis) {
        if (contentType === 'Movie') {
          analysis.textContent = "This shows how Netflix increased its movie offerings over time, peaking near 2018.";
        } else if (contentType === 'TV Show') {
          analysis.textContent = "Netflix TV show additions have grown steadily, reflecting investment in episodic content.";
        } else {
          analysis.textContent = "This chart displays how Netflix’s content library has grown each year. The spike around 2018 reflects aggressive content acquisition.";
        }
      }
    };

    renderYearChart('All');

    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        renderYearChart(typeFilter.value);
      });
    }
  })
  .catch(err => {
    console.error('Error loading JSON:', err);
  });
