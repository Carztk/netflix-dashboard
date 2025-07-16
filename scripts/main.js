Chart.register(ChartDataLabels);

let yearlyChart;

fetch('data/processed_data.json')
  .then(res => res.json())
  .then(data => {
    const chartRefs = {};

    const createChart = (id, type, label, labels, values, color) => {
      const ctx = document.getElementById(id).getContext('2d');
      if (chartRefs[id]) chartRefs[id].destroy();

      const isPolar = type === 'polarArea';

      chartRefs[id] = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{
            label,
            data: values,
            backgroundColor: Array.isArray(color) ? color : color,
            borderColor: color,
            fill: false,
            tension: 0.2
          }]
        },
        options: {
          indexAxis: (id === 'genreChart' || id === 'countryChart') ? 'y' : 'x',
          responsive: true,
          plugins: {
            legend: { display: true, position: 'top', labels: { color: '#ffffff' } },
            tooltip: {
              enabled: true,
              backgroundColor: '#333',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: {
                label: ctx => {
                  const val = ctx.raw ?? (ctx.parsed?.y ?? ctx.parsed);
                  return `${ctx.label}: ${val} titles`;
              }
              }
            },
            datalabels: { display: false }
          },
          scales: isPolar
            ? { r: { ticks: { display: false },
                     grid : { color: 'rgba(255,255,255,0.1)' } } }
            : { x: { ticks:{ color:'#ffffff' },
                     grid :{ color:'rgba(255,255,255,0.1)' } },
                y: { beginAtZero:true, ticks:{ color:'#ffffff', display:true },
                     grid:{ color:'rgba(255,255,255,0.1)' } } }
        },
        plugins: [ChartDataLabels]
      });
    };

    /* base charts */
    createChart('typeChart',   'doughnut', 'Content Type',
                Object.keys(data.type_counts),  Object.values(data.type_counts),
                ['#ff595e','#1982c4']);

    createChart('ratingChart', 'bar',      'Top Ratings',
                Object.keys(data.ratings),  Object.values(data.ratings),'#00b4d8');

    createChart('genreChart',  'bar',      'Top Genres',
                Object.keys(data.top_genres), Object.values(data.top_genres),'#ffd166');

    createChart('countryChart','bar',      'Top Countries',
                Object.keys(data.top_countries), Object.values(data.top_countries),'#06d6a0');

    /* month chart palette + filter */
    const monthColors = [
      '#e50914','#ff6f59','#ff9c41','#ffd166',
      '#f6d743','#8ac926','#06d6a0','#00b4d8',
      '#3a86ff','#6a4c93','#b5179e','#ef476f'
    ];
    const monthFilter = document.getElementById('monthType');

    const drawMonthChart = sel => {
      const src   = sel === 'All' ? data.month_counts     : data.month_by_type[sel];
      const label = sel === 'All' ? 'Monthly Additions'   : `${sel} Additions`;
      createChart('monthChart','polarArea',label,
                  Object.keys(src),Object.values(src),monthColors);
    };

    if (monthFilter) {
      drawMonthChart('All');
      monthFilter.addEventListener('change', e => drawMonthChart(e.target.value));
    } else drawMonthChart('All');

    /* runtime & directors */
    createChart('runtimeChart','bar','Movie Runtime Bins',
                Object.keys(data.runtime_bins),Object.values(data.runtime_bins),'#8ac926');

    createChart('directorChart','bar','Top Directors',
                Object.keys(data.top_directors),Object.values(data.top_directors),'#1982c4');

    /* yearly line chart with type filter */
    const yearCtx    = document.getElementById('yearChart').getContext('2d');
    const typeFilter = document.getElementById('typeFilter');

    const renderYearChart = sel => {
      if (yearlyChart) yearlyChart.destroy();
      const src = sel === 'All' ? data.yearly_counts_all : data.yearly_by_type[sel];
      yearlyChart = new Chart(yearCtx,{
        type:'line',
        data:{ labels:Object.keys(src), datasets:[{
          label:`${sel} Releases`,
          data:Object.values(src),
          borderColor:'#6a4c93',
          backgroundColor:'#6a4c93',
          fill:false,
          tension:0.3
        }]},
        options:{
          responsive:true,
          plugins:{
            legend:{ display:true, labels:{ color:'#ffffff'} },
            tooltip:{ enabled:true, backgroundColor:'#333',
                      titleColor:'#ffffff', bodyColor:'#ffffff',
                      callbacks:{ label:c=>`${c.label}: ${c.parsed.y} titles` } },
            datalabels:{ display:false }
          },
          scales:{
            x:{ ticks:{ color:'#ffffff'}, grid:{ color:'rgba(255,255,255,0.1)'} },
            y:{ beginAtZero:true, ticks:{ color:'#ffffff'}, grid:{ color:'rgba(255,255,255,0.1)'} }
          }
        },
        plugins:[ChartDataLabels]
      });
    };

    renderYearChart('All');
    if (typeFilter) typeFilter.addEventListener('change', e => renderYearChart(e.target.value));
  })
  .catch(err => console.error('Error loading JSON:', err));
