import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface Visitor {
    id: string;
    visitorId: string;
    name: string;
    email: string;
    phone: string;
    licensePlate: string;
    organization: string;
    purpose: 'meeting' | 'delivery' | 'event' | 'other';
    status: 'active' | 'banned' | 'expired';
    lastVisitDate: Date;
    totalVisits: number;
    violations: number;
}

export const VisitorsDashboard: React.FC = () => {
    // Mock visitors data
    const generateMockVisitors = (): Visitor[] => {
        const organizations = ['ABC Corp', 'XYZ Inc', 'Tech Solutions', 'Global Services', 'Acme Co', 'Innovate LLC'];
        const purposes: ('meeting' | 'delivery' | 'event' | 'other')[] = ['meeting', 'delivery', 'event', 'other'];

        return Array.from({ length: 50 }, (_, i) => ({
            id: `vis-${1000 + i}`,
            visitorId: `V${20230000 + i}`,
            name: `Visitor ${i + 1}`,
            email: `visitor${i + 1}@example.com`,
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`,
            organization: organizations[Math.floor(Math.random() * organizations.length)],
            purpose: purposes[Math.floor(Math.random() * 4)],
            status: Math.random() > 0.9 ? 'banned' : 'active',
            lastVisitDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            totalVisits: Math.floor(Math.random() * 10),
            violations: Math.floor(Math.random() * 3)
        }));
    };

    const [visitors, setVisitors] = useState<Visitor[]>(generateMockVisitors());
    const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>(visitors);
    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        organization: 'all',
        purpose: 'all',
        search: ''
    });

    // Apply filters
    useEffect(() => {
        let result = [...visitors];

        if (filters.status !== 'all') {
            result = result.filter(visitor => visitor.status === filters.status);
        }

        if (filters.organization !== 'all') {
            result = result.filter(visitor => visitor.organization === filters.organization);
        }

        if (filters.purpose !== 'all') {
            result = result.filter(visitor => visitor.purpose === filters.purpose);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(visitor =>
                visitor.name.toLowerCase().includes(searchTerm) ||
                visitor.visitorId.toLowerCase().includes(searchTerm) ||
                visitor.email.toLowerCase().includes(searchTerm) ||
                visitor.licensePlate.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredVisitors(result);
    }, [filters, visitors]);

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Organization Distribution Chart
            const orgChart = echarts.init(document.getElementById('organizationChart'));

            // Purpose Distribution Chart
            const purposeChart = echarts.init(document.getElementById('purposeChart'));

            // Violations Analysis Chart
            const violationsChart = echarts.init(document.getElementById('violationsChart'));

            // Organization Chart Options
            const orgOptions = {
                title: {
                    text: 'Visitors by Organization',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    right: 10,
                    top: 'center'
                },
                series: [
                    {
                        name: 'Organizations',
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
                            { value: visitors.filter(v => v.organization === 'ABC Corp').length, name: 'ABC Corp', itemStyle: { color: '#3B82F6' } },
                            { value: visitors.filter(v => v.organization === 'XYZ Inc').length, name: 'XYZ Inc', itemStyle: { color: '#10B981' } },
                            { value: visitors.filter(v => v.organization === 'Tech Solutions').length, name: 'Tech Solutions', itemStyle: { color: '#F59E0B' } },
                            { value: visitors.filter(v => v.organization === 'Global Services').length, name: 'Global Services', itemStyle: { color: '#8B5CF6' } },
                            { value: visitors.filter(v => v.organization === 'Acme Co').length, name: 'Acme Co', itemStyle: { color: '#EC4899' } },
                            { value: visitors.filter(v => v.organization === 'Innovate LLC').length, name: 'Innovate LLC', itemStyle: { color: '#EF4444' } }
                        ]
                    }
                ]
            };

            // Purpose Chart Options
            const purposeOptions = {
                title: {
                    text: 'Visitors by Purpose',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c} visitors'
                },
                xAxis: {
                    type: 'category',
                    data: ['Meeting', 'Delivery', 'Event', 'Other']
                },
                yAxis: {
                    type: 'value',
                    name: 'Visitors'
                },
                series: [
                    {
                        name: 'Visitors',
                        type: 'bar',
                        data: [
                            visitors.filter(v => v.purpose === 'meeting').length,
                            visitors.filter(v => v.purpose === 'delivery').length,
                            visitors.filter(v => v.purpose === 'event').length,
                            visitors.filter(v => v.purpose === 'other').length
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            // Violations Chart Options
            const violationsOptions = {
                title: {
                    text: 'Parking Violations Analysis',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Visitors with 0', 'Visitors with 1', 'Visitors with 2+'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: ['ABC Corp', 'XYZ Inc', 'Tech Solutions', 'Global Services', 'Acme Co', 'Innovate LLC']
                },
                yAxis: {
                    type: 'value',
                    name: 'Visitors'
                },
                series: [
                    {
                        name: 'Visitors with 0',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            visitors.filter(v => v.organization === 'ABC Corp' && v.violations === 0).length,
                            visitors.filter(v => v.organization === 'XYZ Inc' && v.violations === 0).length,
                            visitors.filter(v => v.organization === 'Tech Solutions' && v.violations === 0).length,
                            visitors.filter(v => v.organization === 'Global Services' && v.violations === 0).length,
                            visitors.filter(v => v.organization === 'Acme Co' && v.violations === 0).length,
                            visitors.filter(v => v.organization === 'Innovate LLC' && v.violations === 0).length
                        ],
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Visitors with 1',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            visitors.filter(v => v.organization === 'ABC Corp' && v.violations === 1).length,
                            visitors.filter(v => v.organization === 'XYZ Inc' && v.violations === 1).length,
                            visitors.filter(v => v.organization === 'Tech Solutions' && v.violations === 1).length,
                            visitors.filter(v => v.organization === 'Global Services' && v.violations === 1).length,
                            visitors.filter(v => v.organization === 'Acme Co' && v.violations === 1).length,
                            visitors.filter(v => v.organization === 'Innovate LLC' && v.violations === 1).length
                        ],
                        itemStyle: { color: '#F59E0B' }
                    },
                    {
                        name: 'Visitors with 2+',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            visitors.filter(v => v.organization === 'ABC Corp' && v.violations >= 2).length,
                            visitors.filter(v => v.organization === 'XYZ Inc' && v.violations >= 2).length,
                            visitors.filter(v => v.organization === 'Tech Solutions' && v.violations >= 2).length,
                            visitors.filter(v => v.organization === 'Global Services' && v.violations >= 2).length,
                            visitors.filter(v => v.organization === 'Acme Co' && v.violations >= 2).length,
                            visitors.filter(v => v.organization === 'Innovate LLC' && v.violations >= 2).length
                        ],
                        itemStyle: { color: '#EF4444' }
                    }
                ]
            };

            orgChart.setOption(orgOptions);
            purposeChart.setOption(purposeOptions);
            violationsChart.setOption(violationsOptions);

            return () => {
                orgChart.dispose();
                purposeChart.dispose();
                violationsChart.dispose();
            };
        };

        initCharts();
    }, [visitors]);

    const updateVisitorStatus = (id: string, status: 'active' | 'banned' | 'expired') => {
        setVisitors(prev =>
            prev.map(visitor =>
                visitor.id === id ? { ...visitor, status } : visitor
            )
        );
        setSelectedVisitor(null);
    };

    const organizations = [...new Set(visitors.map(visitor => visitor.organization))];
    const purposes = [...new Set(visitors.map(visitor => visitor.purpose))];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="banned">Banned</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.organization}
                            onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
                        >
                            <option value="all">All Organizations</option>
                            {organizations.map(org => (
                                <option key={org} value={org}>{org}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.purpose}
                            onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
                        >
                            <option value="all">All Purposes</option>
                            {purposes.map(purpose => (
                                <option key={purpose} value={purpose}>{purpose.charAt(0).toUpperCase() + purpose.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, ID, email, or license plate"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Visitors</h3>
                        <span className="text-2xl font-bold text-blue-600">{visitors.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredVisitors.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Visitors</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {visitors.filter(v => v.status === 'active').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {visitors.filter(v => v.status === 'banned').length} banned
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Avg. Visits</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {(visitors.reduce((sum, visitor) => sum + visitor.totalVisits, 0) / visitors.length).toFixed(1)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {visitors.filter(v => v.totalVisits === 1).length} first-time visitors
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Violations</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {visitors.reduce((sum, visitor) => sum + visitor.violations, 0)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {visitors.filter(v => v.violations > 0).length} visitors with violations
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="organizationChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="purposeChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="violationsChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Visitors Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Visitor Records ({filteredVisitors.length})
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            + Add New Visitor
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVisitors.slice(0, 10).map(visitor => (
                                <tr key={visitor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {visitor.visitorId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                                        <div className="text-sm text-gray-500">{visitor.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {visitor.organization}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {visitor.purpose}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {visitor.licensePlate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {visitor.totalVisits}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {visitor.violations}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${visitor.status === 'active' ? 'bg-green-100 text-green-800' :
                                                visitor.status === 'banned' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {visitor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedVisitor(visitor)}
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
                {filteredVisitors.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredVisitors.length} visitors. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Visitor Detail Modal */}
            {selectedVisitor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedVisitor.name} - {selectedVisitor.visitorId}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedVisitor(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Visitor Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Visitor ID:</span>
                                        <span className="font-medium">{selectedVisitor.visitorId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedVisitor.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedVisitor.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{selectedVisitor.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Visit Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Organization:</span>
                                        <span className="font-medium">{selectedVisitor.organization}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Purpose:</span>
                                        <span className="font-medium capitalize">{selectedVisitor.purpose}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedVisitor.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedVisitor.status === 'banned' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedVisitor.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Parking Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono font-medium">{selectedVisitor.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Visits:</span>
                                        <span className="font-medium">{selectedVisitor.totalVisits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Visit Date:</span>
                                        <span className="font-medium">{selectedVisitor.lastVisitDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Violations</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Violations:</span>
                                        <span className={`font-medium ${selectedVisitor.violations > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {selectedVisitor.violations}
                                        </span>
                                    </div>
                                    {selectedVisitor.violations > 0 && (
                                        <div className="bg-red-50 p-3 rounded-md">
                                            <h5 className="font-medium text-red-800 mb-1">Violation History</h5>
                                            <ul className="text-sm text-red-700 list-disc pl-5">
                                                {Array.from({ length: selectedVisitor.violations }, (_, i) => (
                                                    <li key={i}>Violation on {new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="flex flex-wrap gap-3">
                                {selectedVisitor.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateVisitorStatus(selectedVisitor.id, 'active')}
                                    >
                                        Activate Visitor
                                    </button>
                                )}
                                {selectedVisitor.status !== 'banned' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateVisitorStatus(selectedVisitor.id, 'banned')}
                                    >
                                        Ban Visitor
                                    </button>
                                )}
                                {selectedVisitor.status !== 'expired' && (
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => updateVisitorStatus(selectedVisitor.id, 'expired')}
                                    >
                                        Mark as Expired
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => {
                                        // Navigate to edit page or show edit form
                                    }}
                                >
                                    Edit Visitor Details
                                </button>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                    View Visit History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};