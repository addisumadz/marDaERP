'use client';

import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PieChartStats = ({ title, labels, values, total, colors, formatter }) => {
  // Default colors if not provided
  const defaultColors = ['#60A5FA', '#fa60a5', '#a5fa60', '#FFA500', '#9333EA', '#22C55E'];
  const bgColors = colors || defaultColors;

  const data = {
    labels: labels,
    datasets: [
      {
        label: title || 'Statistics',
        data: values,
        backgroundColor: bgColors.slice(0, values.length),
        borderColor: bgColors.slice(0, values.length).map(c => c),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#fff',
        formatter: (value) => {
          if (formatter) {
            return formatter(value, total);
          }
          const percentage = total ? (value / total) * 100 : 0;
          return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
        },
        font: {
          weight: 'bold',
          size: 11,
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            const percentage = total ? (value / total) * 100 : 0;
            if (formatter) {
              return `${formatter(value, total)} (${percentage.toFixed(1)}%)`;
            }
            return `${value.toLocaleString()} (${percentage.toFixed(2)}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-md border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
        {title || 'ጠቅላላ አባላት - Pie Chart'}
      </h3>
      <Pie data={data} options={options} />
      {total !== undefined && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          አጠቃላይ: {typeof total === 'number' ? total.toLocaleString() : total}
        </p>
      )}
    </div>
  );
};

export default PieChartStats;
