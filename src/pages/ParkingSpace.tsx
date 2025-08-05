import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface ParkingSpot {
    id: number;
    lot_name: string;
    spot_number: number;
    spot_type: 'student' | 'visitor' | 'staff' | 'disabled';
    is_occupied: boolean;
    last_occupied: string;
    avg_occupancy_duration: number;
    occupancy_rate: number;
    latitude: number | null;
    longitude: number | null;
}

interface ParkingZone {
    id: string;
    name: string;
    total_spots: number;
    available_spots: number;
    spots: ParkingSpot[];
}

export const ParkingSpacesDashboard: React.FC = () => {
    // Mock data for parking spots
    const mockSpots: ParkingSpot[] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        lot_name: i < 50 ? 'Main Campus Lot' : 'North Parking Garage',
        spot_number: i + 1,
        spot_type:
            i < 20 ? 'staff' :
                i < 70 ? 'student' :
                    i < 85 ? 'visitor' : 'disabled',
        is_occupied: Math.random() > 0.5,
        last_occupied: new Date(Date.now() - Math.floor(Math.random() * 48) * 3600000).toISOString(),
        avg_occupancy_duration: Math.floor(Math.random() * 6) + 2,
        occupancy_rate: Math.floor(Math.random() * 100),
        latitude: 34.0522 + (Math.random() * 0.01),
        longitude: -118.2437 + (Math.random() * 0.01)
    }));

    const [spots, setSpots] = useState<ParkingSpot[]>(mockSpots);
    const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>(mockSpots);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const [filters, setFilters] = useState({
        lot: 'all',
        status: 'all',
        type: 'all',
        sort: 'number'
    });

    // Apply filters
    useEffect(() => {
        let result = [...spots];

        if (filters.lot !== 'all') {
            result = result.filter(spot => spot.lot_name === filters.lot);
        }

        if (filters.status !== 'all') {
            result = result.filter(spot =>
                filters.status === 'occupied' ? spot.is_occupied : !spot.is_occupied
            );
        }

        if (filters.type !== 'all') {
            result = result.filter(spot => spot.spot_type === filters.type);
        }

        // Apply sorting
        result.sort((a, b) => {
            if (filters.sort === 'number') return a.spot_number - b.spot_number;
            if (filters.sort === 'occupancy') return b.occupancy_rate - a.occupancy_rate;
            if (filters.sort === 'duration') return b.avg_occupancy_duration - a.avg_occupancy_duration;
            return 0;
        });

        setFilteredSpots(result);
    }, [filters, spots]);

    // Initialize charts
    useEffect(() => {
        const initializeCharts = () => {
            // Spot Type Distribution Chart
            const typeChart = echarts.init(document.getElementById('spotTypeChart'));
            // Occupancy Trend Chart
            const trendChart = echarts.init(document.getElementById('occupancyTrendChart'));
            // Utilization Heatmap Chart
            const heatmapChart = echarts.init(document.getElementById('utilizationHeatmap'));

            // Spot Type Distribution Options
            const typeOptions = {
                title: {
                    text: 'Spot Type Distribution',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    bottom: 10,
                    data: ['Student', 'Staff', 'Visitor', 'Disabled']
                },
                series: [
                    {
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
                            { value: spots.filter(s => s.spot_type === 'student').length, name: 'Student', itemStyle: { color: '#3B82F6' } },
                            { value: spots.filter(s => s.spot_type === 'staff').length, name: 'Staff', itemStyle: { color: '#10B981' } },
                            { value: spots.filter(s => s.spot_type === 'visitor').length, name: 'Visitor', itemStyle: { color: '#F59E0B' } },
                            { value: spots.filter(s => s.spot_type === 'disabled').length, name: 'Disabled', itemStyle: { color: '#EF4444' } }
                        ]
                    }
                ]
            };

            // Occupancy Trend Options
            const trendOptions = {
                title: {
                    text: 'Hourly Occupancy Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Student', 'Staff', 'Visitor', 'Disabled'],
                    bottom: 10
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        name: 'Student',
                        type: 'line',
                        data: Array.from({ length: 24 }, (_, i) => {
                            const base = 50;
                            const variation = Math.sin(i / 24 * Math.PI * 2) * 30;
                            return Math.min(100, Math.max(0, Math.round(base + variation)));
                        }),
                        smooth: true,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#3B82F6' }
                    },
                    {
                        name: 'Staff',
                        type: 'line',
                        data: Array.from({ length: 24 }, (_, i) => {
                            const base = 70;
                            const variation = Math.sin((i - 8) / 24 * Math.PI * 2) * 20;
                            return Math.min(100, Math.max(0, Math.round(base + variation)));
                        }),
                        smooth: true,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Visitor',
                        type: 'line',
                        data: Array.from({ length: 24 }, (_, i) => {
                            const base = 30;
                            const variation = Math.sin((i - 12) / 24 * Math.PI * 2) * 20;
                            return Math.min(100, Math.max(0, Math.round(base + variation)));
                        }),
                        smooth: true,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#F59E0B' }
                    },
                    {
                        name: 'Disabled',
                        type: 'line',
                        data: Array.from({ length: 24 }, (_, i) => {
                            const base = 40;
                            const variation = Math.sin(i / 24 * Math.PI * 2) * 15;
                            return Math.min(100, Math.max(0, Math.round(base + variation)));
                        }),
                        smooth: true,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#EF4444' }
                    }
                ]
            };

            // Utilization Heatmap Options
            const heatmapOptions = {
                title: {
                    text: 'Spot Utilization Heatmap',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    position: 'top'
                },
                grid: {
                    top: '15%',
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: Array.from({ length: 10 }, (_, i) => `Row ${i + 1}`),
                    splitArea: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'category',
                    data: Array.from({ length: 10 }, (_, i) => `Col ${i + 1}`),
                    splitArea: {
                        show: true
                    }
                },
                visualMap: {
                    min: 0,
                    max: 100,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '0%',
                    inRange: {
                        color: ['#10B981', '#F59E0B', '#EF4444']
                    }
                },
                series: [
                    {
                        name: 'Occupancy Rate',
                        type: 'heatmap',
                        data: Array.from({ length: 100 }, (_, i) => {
                            return {
                                value: [
                                    Math.floor(i / 10),
                                    i % 10,
                                    spots[i]?.occupancy_rate || Math.floor(Math.random() * 100)
                                ]
                            };
                        }),
                        label: {
                            show: false
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            typeChart.setOption(typeOptions);
            trendChart.setOption(trendOptions);
            heatmapChart.setOption(heatmapOptions);

            return () => {
                typeChart.dispose();
                trendChart.dispose();
                heatmapChart.dispose();
            };
        };

        initializeCharts();
    }, [spots, filteredSpots]);

    const toggleSpotOccupancy = (id: number) => {
        setSpots(prevSpots =>
            prevSpots.map(spot =>
                spot.id === id
                    ? {
                        ...spot,
                        is_occupied: !spot.is_occupied,
                        last_occupied: new Date().toISOString()
                    }
                    : spot
            )
        );
    };

    return (
        <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parking Lot</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.lot}
                            onChange={(e) => setFilters({ ...filters, lot: e.target.value })}
                        >
                            <option value="all">All Lots</option>
                            <option value="Main Campus Lot">Main Campus Lot</option>
                            <option value="North Parking Garage">North Parking Garage</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="occupied">Occupied</option>
                            <option value="available">Available</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spot Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                        >
                            <option value="all">All Types</option>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="visitor">Visitor</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value as any })}
                        >
                            <option value="number">Spot Number</option>
                            <option value="occupancy">Occupancy Rate</option>
                            <option value="duration">Avg. Duration</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setSpots([...mockSpots])}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Spots</h3>
                        <span className="text-2xl font-bold text-blue-600">{spots.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {spots.filter(s => s.spot_type === 'student').length} student, {spots.filter(s => s.spot_type === 'staff').length} staff
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Available Now</h3>
                        <span className="text-2xl font-bold text-green-600">{spots.filter(s => !s.is_occupied).length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {Math.round((spots.filter(s => !s.is_occupied).length / spots.length) * 100)}% availability
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Avg. Occupancy</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {Math.round(spots.reduce((sum, spot) => sum + spot.occupancy_rate, 0) / spots.length)}%

                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Highest: {Math.max(...spots.map(s => s.occupancy_rate))}%
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Avg. Duration</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {Math.round(spots.reduce((sum, spot) => sum + spot.avg_occupancy_duration, 0) / spots.length)}h
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Longest: {Math.max(...spots.map(s => s.avg_occupancy_duration))}h
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotTypeChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="occupancyTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="utilizationHeatmap" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Parking Spots Visualization */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Parking Spots - {filteredSpots.length} spots found
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
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Parking Spots Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredSpots.slice(0, 50).map(spot => (
                            <div
                                key={spot.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all
                  ${spot.is_occupied ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
                  ${selectedSpot?.id === spot.id ? 'ring-2 ring-blue-500' : ''}
                `}
                                onClick={() => setSelectedSpot(spot)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${spot.is_occupied ? 'bg-red-500' : 'bg-green-500'
                                            }`}></span>
                                        <span className="font-medium">Spot #{spot.spot_number}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded capitalize ${spot.spot_type === 'student' ? 'bg-blue-100 text-blue-800' :
                                            spot.spot_type === 'staff' ? 'bg-green-100 text-green-800' :
                                                spot.spot_type === 'visitor' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {spot.spot_type}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    <div>Lot: {spot.lot_name}</div>
                                    <div>Occupancy: {spot.occupancy_rate}%</div>
                                    <div>Avg: {spot.avg_occupancy_duration}h</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredSpots.length > 50 && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Showing 50 of {filteredSpots.length} spots. Use filters to refine your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Spot Details */}
            {selectedSpot && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Spot #{selectedSpot.spot_number} Details
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setSelectedSpot(null)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lot:</span>
                                    <span className="font-medium">{selectedSpot.lot_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${selectedSpot.spot_type === 'student' ? 'bg-blue-100 text-blue-800' :
                                            selectedSpot.spot_type === 'staff' ? 'bg-green-100 text-green-800' :
                                                selectedSpot.spot_type === 'visitor' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedSpot.spot_type}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${selectedSpot.is_occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedSpot.is_occupied ? 'Occupied' : 'Available'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Coordinates:</span>
                                    <span className="font-mono text-xs">
                                        {selectedSpot.latitude?.toFixed(4)}, {selectedSpot.longitude?.toFixed(4)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Occupancy Data</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Occupancy Rate:</span>
                                    <span className="font-medium">{selectedSpot.occupancy_rate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Avg. Duration:</span>
                                    <span className="font-medium">{selectedSpot.avg_occupancy_duration} hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Occupied:</span>
                                    <span className="font-medium">
                                        {new Date(selectedSpot.last_occupied).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                            <div className="space-y-3">
                                <button
                                    className={`w-full px-4 py-2 rounded-md text-white ${selectedSpot.is_occupied ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    onClick={() => toggleSpotOccupancy(selectedSpot.id)}
                                >
                                    {selectedSpot.is_occupied ? 'Mark as Available' : 'Mark as Occupied'}
                                </button>
                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    View Reservation History
                                </button>
                                <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                    Edit Spot Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};