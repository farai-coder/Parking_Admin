import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Reservation {
    id: string;
    user_id: string;
    user_name: string;
    user_type: 'student' | 'staff' | 'visitor' | 'admin';
    spot_id: number;
    spot_name: string;
    spot_type: 'student' | 'visitor' | 'staff' | 'disabled';
    start_time: Date;
    end_time: Date;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    created_at: Date;
    license_plate: string;
}

export const ReservationsDashboard: React.FC = () => {
    // Mock reservations data
    const generateMockReservations = (): Reservation[] => {
        const spots = [
            { id: 101, name: 'A-101', type: 'staff' },
            { id: 102, name: 'A-102', type: 'staff' },
            { id: 201, name: 'B-201', type: 'student' },
            { id: 202, name: 'B-202', type: 'student' },
            { id: 301, name: 'C-301', type: 'visitor' },
            { id: 401, name: 'D-401', type: 'disabled' }
        ];

        const users = [
            { id: 'u1', name: 'John Smith', type: 'staff', license: 'STAFF001' },
            { id: 'u2', name: 'Sarah Johnson', type: 'staff', license: 'STAFF002' },
            { id: 'u3', name: 'Alex Chen', type: 'student', license: 'STU2023' },
            { id: 'u4', name: 'Visitor 1', type: 'visitor', license: 'VIST001' }
        ];

        const reservations: Reservation[] = [];
        const now = new Date();

        // Generate daily reservations for the past week and next week
        for (let i = -7; i <= 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            // Create 2-4 reservations per day
            const reservationsCount = 2 + Math.floor(Math.random() * 3);

            for (let j = 0; j < reservationsCount; j++) {
                const hour = 8 + Math.floor(Math.random() * 8); // 8AM - 4PM start
                const duration = 1 + Math.floor(Math.random() * 4); // 1-4 hours

                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);

                const end = new Date(start);
                end.setHours(start.getHours() + duration);

                const spot = spots[Math.floor(Math.random() * spots.length)];
                const user = users[Math.floor(Math.random() * users.length)];

                // Make sure visitor uses visitor spot
                const suitableSpot = user.type === 'visitor'
                    ? spots.find(s => s.type === 'visitor') || spot
                    : spot;

                reservations.push({
                    id: `res-${date.getDate()}-${j}`,
                    user_id: user.id,
                    user_name: user.name,
                    user_type: user.type as any,
                    spot_id: suitableSpot.id,
                    spot_name: suitableSpot.name,
                    spot_type: suitableSpot.type as any,
                    start_time: new Date(start),
                    end_time: new Date(end),
                    status: ['confirmed', 'pending', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as any,
                    created_at: new Date(date),
                    license_plate: user.license
                });
            }
        }

        return reservations;
    };

    const [reservations, setReservations] = useState<Reservation[]>(generateMockReservations());
    const [filter, setFilter] = useState({
        status: 'all',
        userType: 'all',
        spotType: 'all',
        dateRange: 'week'
    });
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    // Filter reservations based on current filters
    const filteredReservations = reservations.filter(res => {
        return (
            (filter.status === 'all' || res.status === filter.status) &&
            (filter.userType === 'all' || res.user_type === filter.userType) &&
            (filter.spotType === 'all' || res.spot_type === filter.spotType) &&
            (filter.dateRange === 'all' ||
                (filter.dateRange === 'week' &&
                    res.start_time >= new Date(new Date().setDate(new Date().getDate() - 7)) &&
                    res.start_time <= new Date(new Date().setDate(new Date().getDate() + 7))) ||
                (filter.dateRange === 'today' &&
                    res.start_time.toDateString() === new Date().toDateString()))
        );
    });

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Reservation Status Chart
            const statusChart = echarts.init(document.getElementById('reservationStatusChart'));

            // Daily Reservation Trend Chart
            const trendChart = echarts.init(document.getElementById('reservationTrendChart'));

            // Spot Type Utilization Chart
            const utilizationChart = echarts.init(document.getElementById('spotUtilizationChart'));

            // Status Chart Options
            const statusOptions = {
                title: {
                    text: 'Reservation Status',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    data: ['Confirmed', 'Pending', 'Completed', 'Cancelled']
                },
                series: [
                    {
                        name: 'Status',
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
                                value: reservations.filter(r => r.status === 'confirmed').length,
                                name: 'Confirmed',
                                itemStyle: { color: '#3B82F6' }
                            },
                            {
                                value: reservations.filter(r => r.status === 'pending').length,
                                name: 'Pending',
                                itemStyle: { color: '#F59E0B' }
                            },
                            {
                                value: reservations.filter(r => r.status === 'completed').length,
                                name: 'Completed',
                                itemStyle: { color: '#10B981' }
                            },
                            {
                                value: reservations.filter(r => r.status === 'cancelled').length,
                                name: 'Cancelled',
                                itemStyle: { color: '#EF4444' }
                            }
                        ]
                    }
                ]
            };

            // Trend Chart Options
            const trendOptions = {
                title: {
                    text: 'Daily Reservation Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Confirmed', 'Completed', 'Cancelled'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: Array.from({ length: 14 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 7 + i);
                        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    })
                },
                yAxis: {
                    type: 'value',
                    name: 'Reservations'
                },
                series: [
                    {
                        name: 'Confirmed',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 14 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - 7 + i);
                            return reservations.filter(r =>
                                r.status === 'confirmed' &&
                                r.start_time.toDateString() === date.toDateString()
                            ).length;
                        }),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#3B82F6' }
                    },
                    {
                        name: 'Completed',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 14 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - 7 + i);
                            return reservations.filter(r =>
                                r.status === 'completed' &&
                                r.start_time.toDateString() === date.toDateString()
                            ).length;
                        }),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Cancelled',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 14 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - 7 + i);
                            return reservations.filter(r =>
                                r.status === 'cancelled' &&
                                r.start_time.toDateString() === date.toDateString()
                            ).length;
                        }),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#EF4444' }
                    }
                ]
            };

            // Utilization Chart Options
            const utilizationOptions = {
                title: {
                    text: 'Spot Type Utilization',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: ['Staff', 'Student', 'Visitor', 'Disabled']
                },
                yAxis: {
                    type: 'value',
                    name: 'Reservations'
                },
                series: [
                    {
                        name: 'Reservations',
                        type: 'bar',
                        data: [
                            reservations.filter(r => r.spot_type === 'staff').length,
                            reservations.filter(r => r.spot_type === 'student').length,
                            reservations.filter(r => r.spot_type === 'visitor').length,
                            reservations.filter(r => r.spot_type === 'disabled').length
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            statusChart.setOption(statusOptions);
            trendChart.setOption(trendOptions);
            utilizationChart.setOption(utilizationOptions);

            return () => {
                statusChart.dispose();
                trendChart.dispose();
                utilizationChart.dispose();
            };
        };

        initCharts();
    }, [reservations]);

    // Calendar events for react-big-calendar
    const calendarEvents = filteredReservations.map(res => ({
        id: res.id,
        title: `${res.user_name} (${res.spot_name})`,
        start: res.start_time,
        end: res.end_time,
        status: res.status,
        spotType: res.spot_type,
        allDay: false
    }));

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '';
        let borderColor = '';

        switch (event.status) {
            case 'confirmed':
                backgroundColor = '#BFDBFE';
                borderColor = '#3B82F6';
                break;
            case 'pending':
                backgroundColor = '#FDE68A';
                borderColor = '#F59E0B';
                break;
            case 'completed':
                backgroundColor = '#A7F3D0';
                borderColor = '#10B981';
                break;
            case 'cancelled':
                backgroundColor = '#FECACA';
                borderColor = '#EF4444';
                break;
            default:
                backgroundColor = '#E5E7EB';
                borderColor = '#6B7280';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                border: `2px solid ${borderColor}`,
                color: '#1F2937',
                fontSize: '12px'
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        const reservation = reservations.find(r => r.id === event.id);
        if (reservation) setSelectedReservation(reservation);
    };

    const updateReservationStatus = (id: string, status: string) => {
        setReservations(prev =>
            prev.map(res =>
                res.id === id ? { ...res, status: status as any } : res
            )
        );
        setSelectedReservation(null);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.userType}
                            onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
                        >
                            <option value="all">All User Types</option>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="visitor">Visitor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spot Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.spotType}
                            onChange={(e) => setFilter({ ...filter, spotType: e.target.value })}
                        >
                            <option value="all">All Spot Types</option>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="visitor">Visitor</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.dateRange}
                            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                        >
                            <option value="week">This Week</option>
                            <option value="today">Today</option>
                            <option value="all">All Dates</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setFilter({
                                status: 'all',
                                userType: 'all',
                                spotType: 'all',
                                dateRange: 'week'
                            })}
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
                        <h3 className="text-lg font-semibold text-gray-800">Total Reservations</h3>
                        <span className="text-2xl font-bold text-blue-600">{reservations.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredReservations.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Today</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {reservations.filter(r =>
                                r.start_time.toDateString() === new Date().toDateString() &&
                                r.status === 'confirmed'
                            ).length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {reservations.filter(r =>
                            r.start_time.toDateString() === new Date().toDateString() &&
                            r.status === 'completed'
                        ).length} completed
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Pending Approval</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {reservations.filter(r => r.status === 'pending').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {reservations.filter(r =>
                            r.status === 'pending' &&
                            r.start_time.toDateString() === new Date().toDateString()
                        ).length} today
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Cancellation Rate</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {Math.round(
                                (reservations.filter(r => r.status === 'cancelled').length /
                                    reservations.length) * 100
                            )}%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {reservations.filter(r => r.status === 'cancelled').length} total cancellations
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationStatusChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotUtilizationChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Reservation Calendar</h3>
                </div>
                <div className="p-4" style={{ height: '500px' }}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="week"
                        views={['day', 'week', 'work_week']}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={handleSelectEvent}
                        style={{ height: '100%' }}
                    />
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Reservation Records ({filteredReservations.length})
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            + New Reservation
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReservations.slice(0, 10).map(res => (
                                <tr key={res.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {res.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{res.user_name}</div>
                                        <div className="text-sm text-gray-500 capitalize">{res.user_type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{res.spot_name}</div>
                                        <div className="text-sm text-gray-500 capitalize">{res.spot_type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {res.start_time.toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {res.start_time.toLocaleTimeString()} - {res.end_time.toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${res.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    res.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedReservation(res)}
                                        >
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredReservations.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredReservations.length} reservations. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reservation Details
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedReservation(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Reservation Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reservation ID:</span>
                                        <span className="font-mono">{selectedReservation.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selectedReservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                selectedReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    selectedReservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedReservation.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span>{selectedReservation.created_at.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time Slot:</span>
                                        <span>
                                            {selectedReservation.start_time.toLocaleString()} -<br />
                                            {selectedReservation.end_time.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">User & Spot Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">User:</span>
                                        <span className="font-medium">{selectedReservation.user_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">User Type:</span>
                                        <span className="capitalize">{selectedReservation.user_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono">{selectedReservation.license_plate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parking Spot:</span>
                                        <span className="font-medium">{selectedReservation.spot_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Spot Type:</span>
                                        <span className="capitalize">{selectedReservation.spot_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedReservation.status !== 'confirmed' && (
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => updateReservationStatus(selectedReservation.id, 'confirmed')}
                                    >
                                        Confirm
                                    </button>
                                )}
                                {selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateReservationStatus(selectedReservation.id, 'completed')}
                                    >
                                        Mark Complete
                                    </button>
                                )}
                                {selectedReservation.status !== 'cancelled' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => {
                                        // Navigate to edit page or show edit form
                                    }}
                                >
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};