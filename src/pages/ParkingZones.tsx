import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface ParkingSpot {
    spot_number: string;
    lot_name: string;
    is_vip: boolean;
    parking_zone_id: string;
    id: string;
    status: string;
}

interface ParkingZone {
    id: string;
    name: string;
    zone_type: string;
}

interface ZoneOccupancy {
    [key: string]: number;
}

interface SpotTypeAvailability {
    student: number;
    staff: number;
    visitor: number;
    vip: number;
}

interface HourlyOccupancyTrend {
    [key: string]: {
        [key: string]: number;
    };
}

export const ParkingZonesDashboard: React.FC = () => {
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [totalSpots, setTotalSpots] = useState<number>(0);
    const [availableSpots, setAvailableSpots] = useState<number>(0);
    const [zoneOccupancy, setZoneOccupancy] = useState<ZoneOccupancy>({});
    const [spotTypeAvailability, setSpotTypeAvailability] = useState<SpotTypeAvailability>({
        student: 0,
        staff: 0,
        visitor: 0,
        vip: 0
    });
    const [hourlyTrend, setHourlyTrend] = useState<HourlyOccupancyTrend>({});
    const [timeFilter, setTimeFilter] = useState<'realtime' | 'today' | 'week' | 'month'>('realtime');
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch all zones
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await fetch('http://localhost:8000/spots/zones/', {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const data = await response.json();
                setZones(data);
                if (data.length > 0) {
                    setSelectedZone(data[0]);
                }
            } catch (error) {
                console.error('Error fetching zones:', error);
            }
        };

        fetchZones();
    }, []);

    // Fetch data when selectedZone changes
    useEffect(() => {
        if (selectedZone) {
            fetchZoneData(selectedZone.id);
        }
    }, [selectedZone]);

    // Fetch all other data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Fetch total spots count
                const spotsCountResponse = await fetch('http://localhost:8000/analytics/spots_count', {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const spotsCount = await spotsCountResponse.json();
                setTotalSpots(spotsCount);

                // Fetch available spots count
                const availableSpotsResponse = await fetch('http://localhost:8000/analytics/spots/unoccupied_count', {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const availableSpotsCount = await availableSpotsResponse.json();
                setAvailableSpots(availableSpotsCount);

                // Fetch zone occupancy rates
                const occupancyResponse = await fetch('http://localhost:8000/analytics/zones/occupancy_rate', {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const occupancyData = await occupancyResponse.json();
                setZoneOccupancy(occupancyData);

                // Fetch spot type availability
                const spotTypeResponse = await fetch('http://localhost:8000/analytics/users/spot_distribution_by_role', {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const spotTypeData = await spotTypeResponse.json();
                setSpotTypeAvailability(spotTypeData);

                // Fetch hourly trend
                const hourlyTrendResponse = await fetch('http://localhost:8000/analytics/hourly_occupancy_trend_by_zone?hours_back=24', {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const hourlyTrendData = await hourlyTrendResponse.json();
                setHourlyTrend(hourlyTrendData);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const fetchZoneData = async (zoneId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/spots/zones/${zoneId}/spots`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const data = await response.json();
            setSpots(data);
        } catch (error) {
            console.error('Error fetching zone spots:', error);
        }
    };

    useEffect(() => {
        if (loading || !selectedZone || zones.length === 0) return;

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
                    data: zones.map(zone => zone.name),
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
                    data: zones.map(zone => zoneOccupancy[zone.name] || 0),
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

            // Process hourly trend data for chart
            const hourlyData = Object.entries(hourlyTrend).map(([time, data]) => {
                return {
                    time,
                    ...data
                };
            });

            const zoneNames = zones.map(zone => zone.name);
            const seriesData = zoneNames.map(zoneName => {
                return {
                    name: zoneName,
                    type: 'line',
                    smooth: true,
                    data: hourlyData.map(item => item[zoneName] || 0),
                    lineStyle: { width: 3 },
                    symbol: 'none'
                };
            });

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
                    data: zoneNames,
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: hourlyData.map(item => {
                        const date = new Date(item.time);
                        return `${date.getHours()}:00`;
                    })
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    max: 100,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: seriesData
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
                            value: spotTypeAvailability.student,
                            name: 'Student',
                            itemStyle: { color: '#3B82F6' }
                        },
                        {
                            value: spotTypeAvailability.staff,
                            name: 'Staff',
                            itemStyle: { color: '#10B981' }
                        },
                        {
                            value: spotTypeAvailability.visitor,
                            name: 'Visitor',
                            itemStyle: { color: '#F59E0B' }
                        },
                        {
                            value: spotTypeAvailability.vip,
                            name: 'VIP',
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
    }, [selectedZone, timeFilter, loading, zones, zoneOccupancy, hourlyTrend, spotTypeAvailability]);

    if (loading || !selectedZone || zones.length === 0) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const currentZoneOccupancy = zoneOccupancy[selectedZone.name] || 0;

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
                                const zone = zones.find(z => z.id === e.target.value);
                                if (zone) setSelectedZone(zone);
                            }}
                        >
                            {zones.map(zone => (
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
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => window.location.reload()}
                        >
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
                        <span className="text-2xl font-bold text-blue-600">{totalSpots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">In selected zone: {spots.length}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Available Now</h3>
                        <span className="text-2xl font-bold text-green-600">{availableSpots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{spots.length > 0 ? Math.round((availableSpots / totalSpots) * 100) : 0}% availability</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Occupancy Rate</h3>
                        <span className="text-2xl font-bold text-orange-600">{currentZoneOccupancy}%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {currentZoneOccupancy > 85 ? 'High occupancy' :
                            currentZoneOccupancy > 70 ? 'Moderate occupancy' : 'Low occupancy'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Zone Type</h3>
                        <span className="text-2xl font-bold text-purple-600">{selectedZone.zone_type}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Parking zone category</p>
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
                                <span className="text-sm text-gray-600">VIP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Parking Spots Grid Visualization */}
                    <div className="grid grid-cols-10 gap-2">
                        {spots.map(spot => (
                            <div
                                key={spot.id}
                                className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all
                  ${spot.status !== 'empty' ? 'bg-red-500 hover:bg-red-600' :
                                        spot.is_vip ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
                `}
                                title={`Spot ${spot.spot_number} (${spot.is_vip ? 'VIP' : 'Regular'}) - ${spot.status !== 'empty' ? 'Occupied' : 'Available'}`}
                            >
                                <span className="text-white text-xs font-medium">{spot.spot_number}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};