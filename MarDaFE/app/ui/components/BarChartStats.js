'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const BarChartStats = ({ title, labels, values, total, colors, formatter }) => {
    // Default colors if not provided
    const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];
    const bgColors = colors || defaultColors;

    const data = {
        labels: labels,
        datasets: [
            {
                label: title || 'Statistics',
                data: values,
                backgroundColor: bgColors.slice(0, values.length),
                borderColor: bgColors.slice(0, values.length),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Often redundant for bar charts if colors match categories
                position: 'top',
            },
            title: {
                display: false,
                text: title,
            },
            datalabels: {
                color: '#000', // Better visibility on likely light bars or place inside base
                anchor: 'end',
                align: 'top',
                formatter: (value) => {
                    if (formatter) return formatter(value);
                    return value.toLocaleString();
                },
                font: {
                    weight: 'bold',
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatter ? formatter(context.parsed.y) : context.parsed.y.toLocaleString();
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        // Shorten large numbers if needed or use formatter
                        if (formatter) return formatter(value); // This might be too long for axis
                        return value.toLocaleString();
                    }
                }
            }
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                {title || 'Statistics - Bar Chart'}
            </h4>
            <Bar data={data} options={options} />
            {total !== undefined && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    Total: {typeof total === 'number' ? total.toLocaleString() : total}
                </p>
            )}
        </div>
    );
};

export default BarChartStats;
