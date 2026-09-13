"use client";
import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const LineChartStats = ({ title, labels, datasets }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16
                }
            },
            datalabels: {
                display: false, // Too cluttered for lines usually, or enable if needed
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    count: 15,
                    font: {
                        size: 15,
                    }
                },
                grid: {
                    display: true,
                    drawBorder: false,
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        },
        elements: {
            line: {
                tension: 0.3 // Smooth curves
            }
        }
    };

    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.color,
            backgroundColor: ds.color,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        })),
    };

    return (
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <div className="mb-3 justify-between gap-4 sm:flex">
                <div>
                    <h5 className="text-xl font-semibold text-black dark:text-white">
                        {title}
                    </h5>
                </div>
            </div>
            <div className="mb-2">
                <div id="lineChart" className="-ml-5 h-[300px]">
                    <Line options={options} data={data} />
                </div>
            </div>
        </div>
    );
};

export default LineChartStats;
