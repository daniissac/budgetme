let charts = {};

export function updateCharts(transactions) {
    updateBarChart(transactions);
    updatePieChart(transactions);
    updateLineChart(transactions);
}

function updateBarChart(transactions) {
    const ctx = document.getElementById('bar-chart').getContext('2d');
    const labels = transactions.map(t => t.description);
    const data = transactions.map(t => {
        const amount = convertCurrency(t.amount, t.currency, 'USD');
        return t.type === 'income' ? amount : -amount;
    });

    if (charts.bar) charts.bar.destroy();

    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Transaction Amount (USD)',
                data: data,
                backgroundColor: data.map(v => v > 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'),
                borderColor: data.map(v => v > 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updatePieChart(transactions) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((totals, t) => {
            const amount = convertCurrency(t.amount, t.currency, 'USD');
            totals[t.category] = (totals[t.category] || 0) + amount;
            return totals;
        }, {});

    if (charts.pie) charts.pie.destroy();

    charts.pie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense Categories'
                }
            }
        }
    });
}

function updateLineChart(transactions) {
    const ctx = document.getElementById('line-chart').getContext('2d');
    const dailyTotals = transactions.reduce((totals, t) => {
        const amount = convertCurrency(t.amount, t.currency, 'USD');
        totals[t.date] = (totals[t.date] || 0) + (t.type === 'income' ? amount : -amount);
        return totals;
    }, {});

    const sortedDates = Object.keys(dailyTotals).sort();
    let runningTotal = 0;
    const data = sortedDates.map(date => {
        runningTotal += dailyTotals[date];
        return { x: date, y: runningTotal };
    });
