import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface ParkingSpot {
    id: number;
    lot_name: string;
    spot_number: number;
    spot_type: 'student' | 'visitor' | 'staff' | 'disabled';
    is_occupied: boolean;
    latitude: number | null;
    longitude: number | null;
}

interface ParkingZone {
    id: string;
    name: string;
    total_spots: number;
    available_spots: number;
    occupancy_rate: number;
    spots: ParkingSpot[];
}

export const ParkingZonesDashboard: React.FC = () => {
    // Mock data for parking zones
    const mockZones: ParkingZone[] = [
        {
            id: '1',
            name: 'Main Campus Lot',
            total_spots: 250,
            available_spots: 75,
            occupancy_rate: 70,
            spots: Array.from({ length: 50 }, (_, i) => ({
                id: i + 1,
                lot_name: 'Main Campus Lot',
                spot_number: i + 1,
                spot_type: i < 20 ? 'staff' : i < 40 ? 'student' : i < 45 ? 'disabled' : 'visitor',
                is_occupied: Math.random() > 0.3,
                latitude: 34.0522 + (Math.random() * 0.001),
                longitude: -118.2437 + (Math.random() * 0.001)
            }))
        },
        {
            id: '2',
            name: 'North Parking Garage',
            total_spots: 180,
            available_spots: 42,
            occupancy_rate: 77,
            spots: Array.from({ length: 50 }, (_, i) => ({
                id: i + 51,
                lot_name: 'North Parking Garage',
                spot_number: i + 1,
                spot_type: i < 15 ? 'staff' : i < 35 ? 'student' : i < 40 ? 'disabled' : 'visitor',
                is_occupied: Math.random() > 0.25,
                latitude: 34.0530 + (Math.random() * 0.001),
                longitude: -118.2440 + (Math.random() * 0.001)
            }))
        },
        {
            id: '3',
            name: 'East Visitor Lot',
            total_spots: 120,
            available_spots: 68,
            occupancy_rate: 43,
            spots: Array.from({ length: 50 }, (_, i) => ({
                id: i + 101,
                lot_name: 'East Visitor Lot',
                spot_number: i + 1,
                spot_type: i < 5 ? 'staff' : i < 10 ? 'disabled' : 'visitor',
                is_occupied: Math.random() > 0.5,
                latitude: 34.0515 + (Math.random() * 0.001),
                longitude: -118.2425 + (Math.random() * 0.001)
            }))
        }
    ];

    const [selectedZone, setSelectedZone] = useState<ParkingZone>(mockZones[0]);
    const [timeFilter, setTimeFilter] = useState<'realtime' | 'today' | 'week' | 'month'>('realtime');

    useEffect(() => {
        const initializeCharts = () => {
            // Zone Occupancy Chart
            const zoneOccupancyChart = echarts.init(document.getElementById('zoneOccupancyChart'));
            const hourlyTrendChart = echarts.init(document.getElementById('hourlyTrendChart'));
            const spotTypeAvailabilityChart = echarts.init(document.getElementById('spotTypeAvailabilityChart'));

            // Zone Occupancy Chart Option
            const zoneOccupancyOption = {
                title: {
                    text: 'Zone Occupancy Rates',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c}%'
                },
                xAxis: {
                    type: 'category',
                    data: mockZones.map(zone => zone.name),
                    axisLabel: {
                        rotate: 30,
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    max: 100,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [{
                    data: mockZones.map(zone => zone.occupancy_rate),
                    type: 'bar',
                    itemStyle: {
                        color: function (params: any) {
                            const value = params.data;
                            return value > 85 ? '#EF4444' :
                                value > 70 ? '#F59E0B' :
                                    '#10B981';
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }]
            };

            // Hourly Trend Chart Option
            const hourlyTrendOption = {
                title: {
                    text: 'Hourly Occupancy Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: mockZones.map(zone => zone.name),
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    max: 100,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: mockZones.map(zone => ({
                    name: zone.name,
                    type: 'line',
                    smooth: true,
                    data: Array.from({ length: 24 }, (_, i) => {
                        const base = zone.occupancy_rate;
                        const variation = Math.sin(i / 24 * Math.PI * 2) * 20;
                        return Math.min(100, Math.max(0, Math.round(base + variation)));
                    }),
                    lineStyle: { width: 3 },
                    symbol: 'none'
                }))
            };

            // Spot Type Availability Chart Option
            const spotTypeAvailabilityOption = {
                title: {
                    text: 'Spot Type Availability',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    bottom: '0'
                },
                series: [{
                    name: 'Spot Types',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '14',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {
                            value: selectedZone.spots.filter(s => s.spot_type === 'student').length,
                            name: 'Student',
                            itemStyle: { color: '#3B82F6' }
                        },
                        {
                            value: selectedZone.spots.filter(s => s.spot_type === 'staff').length,
                            name: 'Staff',
                            itemStyle: { color: '#10B981' }
                        },
                        {
                            value: selectedZone.spots.filter(s => s.spot_type === 'visitor').length,
                            name: 'Visitor',
                            itemStyle: { color: '#F59E0B' }
                        },
                        {
                            value: selectedZone.spots.filter(s => s.spot_type === 'disabled').length,
                            name: 'Disabled',
                            itemStyle: { color: '#EF4444' }
                        }
                    ]
                }]
            };

            zoneOccupancyChart.setOption(zoneOccupancyOption);
            hourlyTrendChart.setOption(hourlyTrendOption);
            spotTypeAvailabilityChart.setOption(spotTypeAvailabilityOption);

            return () => {
                zoneOccupancyChart.dispose();
                hourlyTrendChart.dispose();
                spotTypeAvailabilityChart.dispose();
            };
        };

        initializeCharts();
    }, [selectedZone, timeFilter]);

    return (
        <div className="space-y-6">
            {/* Zone Selection and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Parking Zone
                        </label>
                        <select
                            id="zone-select"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={selectedZone.id}
                            onChange={(e) => {
                                const zone = mockZones.find(z => z.id === e.target.value);
                                if (zone) setSelectedZone(zone);
                            }}
                        >
                            {mockZones.map(zone => (
                                <option key={zone.id} value={zone.id}>{zone.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label htmlFor="time-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Time Period
                        </label>
                        <select
                            id="time-filter"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as any)}
                        >
                            <option value="realtime">Real-time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <i className="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Zone Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Spots</h3>
                        <span className="text-2xl font-bold text-blue-600">{selectedZone.total_spots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Across all zones: {mockZones.reduce((sum, z) => sum + z.total_spots, 0)}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Available Now</h3>
                        <span className="text-2xl font-bold text-green-600">{selectedZone.available_spots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{Math.round((selectedZone.available_spots / selectedZone.total_spots) * 100)}% availability</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Occupancy Rate</h3>
                        <span className="text-2xl font-bold text-orange-600">{selectedZone.occupancy_rate}%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {selectedZone.occupancy_rate > 85 ? 'High occupancy' :
                            selectedZone.occupancy_rate > 70 ? 'Moderate occupancy' : 'Low occupancy'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Peak Hours</h3>
                        <span className="text-2xl font-bold text-purple-600">9-11 AM</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Next peak: 4-6 PM</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="zoneOccupancyChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="hourlyTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotTypeAvailabilityChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Parking Spots Visualization */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {selectedZone.name} - Spot Availability
                        </h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-sm text-gray-600">Available</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <span className="text-sm text-gray-600">Occupied</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                <span className="text-sm text-gray-600">Reserved</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Parking Spots Grid Visualization */}
                    <div className="grid grid-cols-10 gap-2">
                        {selectedZone.spots.map(spot => (
                            <div
                                key={spot.id}
                                className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all
                  ${spot.is_occupied ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  ${spot.spot_type === 'disabled' ? 'border-2 border-yellow-400' : ''}
                `}
                                title={`Spot ${spot.spot_number} (${spot.spot_type}) - ${spot.is_occupied ? 'Occupied' : 'Available'}`}
                            >
                                <span className="text-white text-xs font-medium">{spot.spot_number}</span>
                            </div>
                        ))}
                    </div>

                    {/* Legend for Spot Types */}
                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
                            <span className="text-sm text-gray-600">Student</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded bg-green-600 mr-2"></div>
                            <span className="text-sm text-gray-600">Staff</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded bg-orange-500 mr-2"></div>
                            <span className="text-sm text-gray-600">Visitor</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded bg-red-600 mr-2 border-2 border-yellow-400"></div>
                            <span className="text-sm text-gray-600">Disabled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Spot Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Spot Details</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Duration</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {selectedZone.spots.slice(0, 10).map(spot => (
                                    <tr key={spot.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spot.spot_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{spot.spot_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${spot.is_occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {spot.is_occupied ? 'Occupied' : 'Available'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(Date.now() - Math.floor(Math.random() * 48) * 3600000).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {Math.floor(Math.random() * 6) + 2} hours
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};