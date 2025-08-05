import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface User {
    id: string;
    name: string;
    phone_number: string;
    license_plate: string;
    role: 'student' | 'staff' | 'admin';
}

interface ParkingSpot {
    id: number;
    lot_name: string;
    spot_number: number;
    spot_type: 'student' | 'visitor' | 'staff' | 'disabled';
    latitude: number | null;
    longitude: number | null;
}

interface Reservation {
    id: string;
    user_id: string;
    spot_id: number;
    start_time: string;
    end_time: string;
}

interface ParkingSession {
    id: string;
    user_id: string;
    spot_id: number;
    check_in_time: string;
    check_out_time: string | null;
}

interface Event {
    id: string;
    name: string;
    description: string | null;
    date: string;
    event_location: string;
    latitude: number | null;
    longitude: number | null;
}

export const AdminDashboard: React.FC = () => {
    // Mock data based on your database schema
    const mockUsers: User[] = [
        {
            id: '1',
            name: 'John Smith',
            phone_number: '555-123-4567',
            license_plate: 'ABC123',
            role: 'student'
        },
        {
            id: '2',
            name: 'Jane Doe',
            phone_number: '555-987-6543',
            license_plate: 'XYZ789',
            role: 'staff'
        },
        {
            id: '3',
            name: 'Admin User',
            phone_number: '555-555-5555',
            license_plate: 'ADM001',
            role: 'admin'
        }
    ];

    const mockParkingSpots: ParkingSpot[] = [
        { id: 1, lot_name: 'Main Lot', spot_number: 101, spot_type: 'student', latitude: 34.0522, longitude: -118.2437 },
        { id: 2, lot_name: 'Main Lot', spot_number: 102, spot_type: 'staff', latitude: 34.0522, longitude: -118.2437 },
        { id: 3, lot_name: 'North Lot', spot_number: 201, spot_type: 'disabled', latitude: 34.0530, longitude: -118.2440 },
        { id: 4, lot_name: 'East Lot', spot_number: 301, spot_type: 'visitor', latitude: 34.0515, longitude: -118.2425 }
    ];

    const mockReservations: Reservation[] = [
        {
            id: '1',
            user_id: '1',
            spot_id: 1,
            start_time: '2025-03-27T08:00:00',
            end_time: '2025-03-27T16:00:00'
        },
        {
            id: '2',
            user_id: '2',
            spot_id: 2,
            start_time: '2025-03-27T09:00:00',
            end_time: '2025-03-27T17:00:00'
        }
    ];

    const mockParkingSessions: ParkingSession[] = [
        {
            id: '1',
            user_id: '1',
            spot_id: 1,
            check_in_time: '2025-03-27T08:05:23',
            check_out_time: '2025-03-27T15:45:12'
        },
        {
            id: '2',
            user_id: '2',
            spot_id: 2,
            check_in_time: '2025-03-27T09:10:45',
            check_out_time: null
        }
    ];

    const mockEvents: Event[] = [
        {
            id: '1',
            name: 'Campus Open Day',
            description: 'Annual campus open day for prospective students',
            date: '2025-04-15T10:00:00',
            event_location: 'Main Quad',
            latitude: 34.0525,
            longitude: -118.2430
        },
        {
            id: '2',
            name: 'Sports Tournament',
            description: 'Inter-department sports competition',
            date: '2025-05-20T09:00:00',
            event_location: 'Sports Complex',
            latitude: 34.0535,
            longitude: -118.2420
        }
    ];

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const initializeCharts = () => {
            // Parking Dashboard Charts
            const occupancyChart = echarts.init(document.getElementById('occupancyChart'));
            const spotTypeDistributionChart = echarts.init(document.getElementById('spotTypeDistributionChart'));
            const reservationTrendChart = echarts.init(document.getElementById('reservationTrendChart'));
            const userTypeChart = echarts.init(document.getElementById('userTypeChart'));

            const occupancyOption = {
                animation: false,
                title: {
                    text: 'Current Parking Occupancy',
                    textStyle: { fontSize: 14, fontWeight: 'normal' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['Main Lot', 'North Lot', 'East Lot', 'West Lot', 'Visitor Lot'],
                    axisLine: { lineStyle: { color: '#E5E7EB' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    splitLine: { lineStyle: { color: '#E5E7EB' } }
                },
                series: [{
                    name: 'Occupancy Rate',
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        color: function (params: any) {
                            const value = params.data;
                            return value > 85 ? '#EF4444' :
                                value > 70 ? '#F59E0B' :
                                    '#10B981';
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    data: [78, 65, 45, 92, 55]
                }]
            };

            const spotTypeDistributionOption = {
                animation: false,
                title: {
                    text: 'Spot Type Distribution',
                    textStyle: { fontSize: 14, fontWeight: 'normal' }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    bottom: '0',
                    itemWidth: 12,
                    itemHeight: 12,
                    textStyle: { fontSize: 12 }
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    label: { show: false },
                    labelLine: { show: false },
                    data: [
                        { value: 45, name: 'Student', itemStyle: { color: '#3B82F6' } },
                        { value: 25, name: 'Staff', itemStyle: { color: '#10B981' } },
                        { value: 15, name: 'Visitor', itemStyle: { color: '#F59E0B' } },
                        { value: 10, name: 'Disabled', itemStyle: { color: '#EF4444' } },
                        { value: 5, name: 'Reserved', itemStyle: { color: '#8B5CF6' } }
                    ]
                }]
            };

            const reservationTrendOption = {
                animation: false,
                title: {
                    text: 'Reservation Trend',
                    textStyle: { fontSize: 14, fontWeight: 'normal' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    axisLine: { lineStyle: { color: '#E5E7EB' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Reservations',
                    splitLine: { lineStyle: { color: '#E5E7EB' } }
                },
                series: [{
                    name: 'Reservations',
                    type: 'line',
                    smooth: true,
                    lineStyle: { width: 3 },
                    itemStyle: { color: '#8B5CF6' },
                    data: [120, 132, 145, 160, 172, 90, 40],
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(139, 92, 246, 0.2)'
                            }, {
                                offset: 1,
                                color: 'rgba(139, 92, 246, 0.01)'
                            }]
                        }
                    }
                }]
            };

            const userTypeOption = {
                animation: false,
                title: {
                    text: 'User Type Distribution',
                    textStyle: { fontSize: 14, fontWeight: 'normal' }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}'
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['Students', 'Staff', 'Visitors', 'Admins'],
                    axisLine: { lineStyle: { color: '#E5E7EB' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Count',
                    splitLine: { lineStyle: { color: '#E5E7EB' } }
                },
                series: [{
                    name: 'Users',
                    type: 'bar',
                    barWidth: '40%',
                    data: [850, 120, 65, 15],
                    itemStyle: {
                        color: function (params: any) {
                            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                            return colors[params.dataIndex];
                        },
                        borderRadius: [4, 4, 0, 0]
                    }
                }]
            };

            occupancyChart.setOption(occupancyOption);
            spotTypeDistributionChart.setOption(spotTypeDistributionOption);
            reservationTrendChart.setOption(reservationTrendOption);
            userTypeChart.setOption(userTypeOption);
        };

        setTimeout(initializeCharts, 100);

        return () => {
            const charts = [
                'occupancyChart',
                'spotTypeDistributionChart',
                'reservationTrendChart',
                'userTypeChart'
            ];

            charts.forEach(chartId => {
                const chartElement = document.getElementById(chartId);
                if (chartElement) {
                    const chart = echarts.getInstanceByDom(chartElement);
                    chart?.dispose();
                }
            });
        };
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Spaces</h3>
                        <span className="text-2xl font-bold text-blue-600">1,250</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">+50 new spaces this year</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Occupied Now</h3>
                        <span className="text-2xl font-bold text-green-600">920</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">74% occupancy rate</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Reservations</h3>
                        <span className="text-2xl font-bold text-purple-600">280</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">+25% from last week</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Registered Users</h3>
                        <span className="text-2xl font-bold text-indigo-600">1,050</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">+15% from last month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="occupancyChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotTypeDistributionChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="userTypeChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                            Add New User
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <i className="fas fa-user text-gray-500"></i>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.license_plate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 cursor-pointer">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Reservations</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockReservations.map((reservation) => {
                                        const user = mockUsers.find(u => u.id === reservation.user_id);
                                        const spot = mockParkingSpots.find(s => s.id === reservation.spot_id);
                                        return (
                                            <tr key={reservation.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user?.name || 'Unknown User'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {spot ? `${spot.lot_name} #${spot.spot_number}` : 'Unknown Spot'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(reservation.start_time).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(reservation.end_time).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Parking Sessions</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockParkingSessions.map((session) => {
                                        const user = mockUsers.find(u => u.id === session.user_id);
                                        const spot = mockParkingSpots.find(s => s.id === session.spot_id);
                                        return (
                                            <tr key={session.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user?.name || 'Unknown User'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {spot ? `${spot.lot_name} #${spot.spot_number}` : 'Unknown Spot'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(session.check_in_time).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.check_out_time ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {session.check_out_time ? 'Completed' : 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                            Add New Event
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockEvents.map((event) => (
                                    <tr key={event.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{event.name}</div>
                                            <div className="text-sm text-gray-500">{event.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.event_location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(event.date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 cursor-pointer">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
};