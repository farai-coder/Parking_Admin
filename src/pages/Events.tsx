import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Event {
    id: string;
    name: string;
    description: string;
    start_time: Date;
    end_time: Date;
    location: string;
    event_type: 'academic' | 'sports' | 'cultural' | 'official';
    attendees: number;
    parking_spots_reserved: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    organizer: string;
    contact_email: string;
}

export const EventsDashboard: React.FC = () => {
    // Mock events data
    const generateMockEvents = (): Event[] => {
        const eventTypes: ('academic' | 'sports' | 'cultural' | 'official')[] = [
            'academic', 'sports', 'cultural', 'official'
        ];

        const organizers = [
            'University Administration',
            'Student Union',
            'Sports Department',
            'Cultural Committee'
        ];

        const locations = [
            'Main Auditorium',
            'Sports Complex',
            'Central Quad',
            'Library Hall',
            'East Campus Grounds'
        ];

        const events: Event[] = [];
        const now = new Date();

        // Generate events for the past month and next 3 months
        for (let i = -30; i <= 90; i += Math.floor(3 + Math.random() * 5)) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);

            // Skip some days randomly
            if (Math.random() > 0.7) continue;

            const durationHours = 1 + Math.floor(Math.random() * 5);
            const start = new Date(date);
            start.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9AM-5PM start

            const end = new Date(start);
            end.setHours(start.getHours() + durationHours);

            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const attendees = 50 + Math.floor(Math.random() * 500);
            const spotsReserved = Math.floor(attendees * (0.1 + Math.random() * 0.2));

            events.push({
                id: `event-${date.getDate()}-${Math.floor(Math.random() * 1000)}`,
                name: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Event ${i > 0 ? i : -i}`,
                description: `This is a ${eventType} event happening at ${locations[Math.floor(Math.random() * locations.length)]}`,
                start_time: new Date(start),
                end_time: new Date(end),
                location: locations[Math.floor(Math.random() * locations.length)],
                event_type: eventType,
                attendees: attendees,
                parking_spots_reserved: spotsReserved,
                status: i < 0 ? 'completed' : (i === 0 ? 'ongoing' : 'upcoming'),
                organizer: organizers[Math.floor(Math.random() * organizers.length)],
                contact_email: `contact@${eventType}-events.edu`
            });
        }

        // Add a cancelled event
        events.push({
            id: 'event-cancelled',
            name: 'Cancelled Sports Event',
            description: 'This event was cancelled due to weather conditions',
            start_time: new Date(new Date().setDate(new Date().getDate() + 2)),
            end_time: new Date(new Date().setDate(new Date().getDate() + 2)),
            location: 'Sports Field',
            event_type: 'sports',
            attendees: 0,
            parking_spots_reserved: 0,
            status: 'cancelled',
            organizer: 'Sports Department',
            contact_email: 'sports@university.edu'
        });

        return events;
    };

    const [events, setEvents] = useState<Event[]>(generateMockEvents());
    const [filter, setFilter] = useState({
        status: 'all',
        eventType: 'all',
        timeRange: 'month'
    });
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Filter events based on current filters
    const filteredEvents = events.filter(event => {
        const now = new Date();
        return (
            (filter.status === 'all' || event.status === filter.status) &&
            (filter.eventType === 'all' || event.event_type === filter.eventType) &&
            (filter.timeRange === 'all' ||
                (filter.timeRange === 'month' &&
                    event.start_time >= new Date(now.getFullYear(), now.getMonth(), 1) &&
                    event.start_time <= new Date(now.getFullYear(), now.getMonth() + 1, 0)) ||
                (filter.timeRange === 'week' &&
                    event.start_time >= new Date(now.setDate(now.getDate() - now.getDay())) &&
                    event.start_time <= new Date(now.setDate(now.getDate() - now.getDay() + 6))) ||
                (filter.timeRange === 'today' &&
                    event.start_time.toDateString() === new Date().toDateString()))
        );
    });

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Event Type Distribution Chart
            const typeChart = echarts.init(document.getElementById('eventTypeChart'));

            // Monthly Event Trend Chart
            const trendChart = echarts.init(document.getElementById('eventTrendChart'));

            // Parking Demand Chart
            const demandChart = echarts.init(document.getElementById('parkingDemandChart'));

            // Type Chart Options
            const typeOptions = {
                title: {
                    text: 'Event Type Distribution',
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
                    data: ['Academic', 'Sports', 'Cultural', 'Official']
                },
                series: [
                    {
                        name: 'Event Types',
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
                                value: events.filter(e => e.event_type === 'academic').length,
                                name: 'Academic',
                                itemStyle: { color: '#3B82F6' }
                            },
                            {
                                value: events.filter(e => e.event_type === 'sports').length,
                                name: 'Sports',
                                itemStyle: { color: '#10B981' }
                            },
                            {
                                value: events.filter(e => e.event_type === 'cultural').length,
                                name: 'Cultural',
                                itemStyle: { color: '#F59E0B' }
                            },
                            {
                                value: events.filter(e => e.event_type === 'official').length,
                                name: 'Official',
                                itemStyle: { color: '#8B5CF6' }
                            }
                        ]
                    }
                ]
            };

            // Trend Chart Options
            const trendOptions = {
                title: {
                    text: 'Monthly Event Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Academic', 'Sports', 'Cultural', 'Official'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: Array.from({ length: 12 }, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - 6 + i);
                        return date.toLocaleDateString('en-US', { month: 'short' });
                    }).slice(0, 6)
                },
                yAxis: {
                    type: 'value',
                    name: 'Number of Events'
                },
                series: [
                    {
                        name: 'Academic',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 6 }, (_, i) =>
                            events.filter(e =>
                                e.event_type === 'academic' &&
                                new Date(e.start_time).getMonth() === (new Date().getMonth() - 5 + i) % 12
                            ).length
                        ),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#3B82F6' }
                    },
                    {
                        name: 'Sports',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 6 }, (_, i) =>
                            events.filter(e =>
                                e.event_type === 'sports' &&
                                new Date(e.start_time).getMonth() === (new Date().getMonth() - 5 + i) % 12
                            ).length
                        ),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Cultural',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 6 }, (_, i) =>
                            events.filter(e =>
                                e.event_type === 'cultural' &&
                                new Date(e.start_time).getMonth() === (new Date().getMonth() - 5 + i) % 12
                            ).length
                        ),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#F59E0B' }
                    },
                    {
                        name: 'Official',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 6 }, (_, i) =>
                            events.filter(e =>
                                e.event_type === 'official' &&
                                new Date(e.start_time).getMonth() === (new Date().getMonth() - 5 + i) % 12
                            ).length
                        ),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#8B5CF6' }
                    }
                ]
            };

            // Demand Chart Options
            const demandOptions = {
                title: {
                    text: 'Parking Demand by Event Type',
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
                    data: ['Academic', 'Sports', 'Cultural', 'Official']
                },
                yAxis: {
                    type: 'value',
                    name: 'Parking Spots Reserved'
                },
                series: [
                    {
                        name: 'Average Spots Reserved',
                        type: 'bar',
                        data: [
                            Math.round(events.filter(e => e.event_type === 'academic').reduce((sum, e) => sum + e.parking_spots_reserved, 0) /
                                Math.max(1, events.filter(e => e.event_type === 'academic').length)),
                            Math.round(events.filter(e => e.event_type === 'sports').reduce((sum, e) => sum + e.parking_spots_reserved, 0) /
                                Math.max(1, events.filter(e => e.event_type === 'sports').length)),
                            Math.round(events.filter(e => e.event_type === 'cultural').reduce((sum, e) => sum + e.parking_spots_reserved, 0) /
                                Math.max(1, events.filter(e => e.event_type === 'cultural').length)),
                            Math.round(events.filter(e => e.event_type === 'official').reduce((sum, e) => sum + e.parking_spots_reserved, 0) /
                                Math.max(1, events.filter(e => e.event_type === 'official').length))
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    },
                    {
                        name: 'Max Spots Reserved',
                        type: 'bar',
                        data: [
                            Math.max(...events.filter(e => e.event_type === 'academic').map(e => e.parking_spots_reserved)),
                            Math.max(...events.filter(e => e.event_type === 'sports').map(e => e.parking_spots_reserved)),
                            Math.max(...events.filter(e => e.event_type === 'cultural').map(e => e.parking_spots_reserved)),
                            Math.max(...events.filter(e => e.event_type === 'official').map(e => e.parking_spots_reserved))
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            typeChart.setOption(typeOptions);
            trendChart.setOption(trendOptions);
            demandChart.setOption(demandOptions);

            return () => {
                typeChart.dispose();
                trendChart.dispose();
                demandChart.dispose();
            };
        };

        initCharts();
    }, [events, filter]);

    // Calendar events for react-big-calendar
    const calendarEvents = filteredEvents.map(event => ({
        id: event.id,
        title: event.name,
        start: event.start_time,
        end: event.end_time,
        status: event.status,
        eventType: event.event_type,
        allDay: false
    }));

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '';
        let borderColor = '';

        switch (event.eventType) {
            case 'academic':
                backgroundColor = '#BFDBFE';
                borderColor = '#3B82F6';
                break;
            case 'sports':
                backgroundColor = '#A7F3D0';
                borderColor = '#10B981';
                break;
            case 'cultural':
                backgroundColor = '#FDE68A';
                borderColor = '#F59E0B';
                break;
            case 'official':
                backgroundColor = '#DDD6FE';
                borderColor = '#8B5CF6';
                break;
            default:
                backgroundColor = '#E5E7EB';
                borderColor = '#6B7280';
        }

        if (event.status === 'cancelled') {
            backgroundColor = '#FECACA';
            borderColor = '#EF4444';
        } else if (event.status === 'ongoing') {
            borderColor = '#000000';
            const borderWidth = '3px';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                border: `2px solid ${borderColor}`,
                color: '#1F2937',
                fontSize: '12px',
                opacity: event.status === 'cancelled' ? 0.7 : 1
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        const foundEvent = events.find(e => e.id === event.id);
        if (foundEvent) setSelectedEvent(foundEvent);
    };

    const updateEventStatus = (id: string, status: string) => {
        setEvents(prev =>
            prev.map(event =>
                event.id === id ? { ...event, status: status as any } : event
            )
        );
        setSelectedEvent(null);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.eventType}
                            onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
                        >
                            <option value="all">All Types</option>
                            <option value="academic">Academic</option>
                            <option value="sports">Sports</option>
                            <option value="cultural">Cultural</option>
                            <option value="official">Official</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.timeRange}
                            onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
                        >
                            <option value="month">This Month</option>
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
                                eventType: 'all',
                                timeRange: 'month'
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
                        <h3 className="text-lg font-semibold text-gray-800">Total Events</h3>
                        <span className="text-2xl font-bold text-blue-600">{events.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredEvents.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {events.filter(e => e.status === 'upcoming').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {events.filter(e =>
                            e.status === 'upcoming' &&
                            e.start_time.toDateString() === new Date().toDateString()
                        ).length} today
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Parking Demand</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {events.reduce((sum, e) => sum + e.parking_spots_reserved, 0)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {Math.round(
                            events.reduce((sum, e) => sum + e.parking_spots_reserved, 0) /
                            Math.max(1, events.length)
                        )} avg. per event

                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Cancellation Rate</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {Math.round(
                                (events.filter(e => e.status === 'cancelled').length / Math.max(1, events.length)) * 100
                            )}%

                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {events.filter(e => e.status === 'cancelled').length} cancelled events
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="eventTypeChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="eventTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="parkingDemandChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Event Calendar</h3>
                </div>
                <div className="p-4" style={{ height: '500px' }}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="month"
                        views={['day', 'week', 'month']}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={handleSelectEvent}
                        style={{ height: '100%' }}
                    />
                </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Event Records ({filteredEvents.length})
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            + New Event
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Reserved</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.slice(0, 10).map(event => (
                                <tr key={event.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                                        <div className="text-sm text-gray-500">{event.organizer}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {event.start_time.toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {event.start_time.toLocaleTimeString()} - {event.end_time.toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {event.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${event.event_type === 'academic' ? 'bg-blue-100 text-blue-800' :
                                                event.event_type === 'sports' ? 'bg-green-100 text-green-800' :
                                                    event.event_type === 'cultural' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-purple-100 text-purple-800'
                                            }`}>
                                            {event.event_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {event.parking_spots_reserved} spots
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                    event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedEvent(event)}
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
                {filteredEvents.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredEvents.length} events. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedEvent.name}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Event Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Event ID:</span>
                                        <span className="font-mono">{selectedEvent.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selectedEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                selectedEvent.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                    selectedEvent.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="capitalize">{selectedEvent.event_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium">{selectedEvent.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date/Time:</span>
                                        <span>
                                            {selectedEvent.start_time.toLocaleString()} -<br />
                                            {selectedEvent.end_time.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Parking & Attendance</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Expected Attendees:</span>
                                        <span className="font-medium">{selectedEvent.attendees}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parking Spots Reserved:</span>
                                        <span className="font-medium">{selectedEvent.parking_spots_reserved}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Organizer:</span>
                                        <span className="font-medium">{selectedEvent.organizer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Contact Email:</span>
                                        <span className="font-medium">{selectedEvent.contact_email}</span>
                                    </div>
                                </div>

                                <h4 className="font-medium text-gray-900 mt-6 mb-3">Description</h4>
                                <p className="text-sm text-gray-600">
                                    {selectedEvent.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedEvent.status !== 'ongoing' && selectedEvent.status !== 'completed' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateEventStatus(selectedEvent.id, 'ongoing')}
                                    >
                                        Start Event
                                    </button>
                                )}
                                {selectedEvent.status === 'ongoing' && (
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => updateEventStatus(selectedEvent.id, 'completed')}
                                    >
                                        Complete Event
                                    </button>
                                )}
                                {selectedEvent.status !== 'cancelled' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateEventStatus(selectedEvent.id, 'cancelled')}
                                    >
                                        Cancel Event
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