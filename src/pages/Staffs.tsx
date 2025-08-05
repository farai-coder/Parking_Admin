import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface Staff {
    id: string;
    staffId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    role: 'admin' | 'security' | 'reception' | 'maintenance' | 'other';
    status: 'active' | 'on_leave' | 'terminated';
    hireDate: Date;
    licensePlate: string;
    violations: number;
    lastAccessDate: Date;
}

export const StaffDashboard: React.FC = () => {
    // Mock staff data
    const generateMockStaff = (): Staff[] => {
        const departments = ['Security', 'Administration', 'Facilities', 'IT', 'HR', 'Operations'];
        const positions = ['Manager', 'Supervisor', 'Officer', 'Technician', 'Assistant', 'Specialist'];
        const roles: ('admin' | 'security' | 'reception' | 'maintenance' | 'other')[] = ['admin', 'security', 'reception', 'maintenance', 'other'];

        return Array.from({ length: 30 }, (_, i) => ({
            id: `staff-${1000 + i}`,
            staffId: `S${20230000 + i}`,
            name: `Staff Member ${i + 1}`,
            email: `staff${i + 1}@company.com`,
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            department: departments[Math.floor(Math.random() * departments.length)],
            position: positions[Math.floor(Math.random() * positions.length)],
            role: roles[Math.floor(Math.random() * roles.length)],
            status: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'on_leave' : 'terminated') : 'active',
            hireDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 3) * 24 * 60 * 60 * 1000),
            licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`,
            violations: Math.floor(Math.random() * 2),
            lastAccessDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }));
    };

    const [staff, setStaff] = useState<Staff[]>(generateMockStaff());
    const [filteredStaff, setFilteredStaff] = useState<Staff[]>(staff);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        department: 'all',
        role: 'all',
        search: ''
    });

    // Apply filters
    useEffect(() => {
        let result = [...staff];

        if (filters.status !== 'all') {
            result = result.filter(member => member.status === filters.status);
        }

        if (filters.department !== 'all') {
            result = result.filter(member => member.department === filters.department);
        }

        if (filters.role !== 'all') {
            result = result.filter(member => member.role === filters.role);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(member =>
                member.name.toLowerCase().includes(searchTerm) ||
                member.staffId.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm) ||
                member.licensePlate.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredStaff(result);
    }, [filters, staff]);

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Department Distribution Chart
            const deptChart = echarts.init(document.getElementById('departmentChart'));

            // Role Distribution Chart
            const roleChart = echarts.init(document.getElementById('roleChart'));

            // Staff Status Chart
            const statusChart = echarts.init(document.getElementById('statusChart'));

            // Department Chart Options
            const deptOptions = {
                title: {
                    text: 'Staff by Department',
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
                        name: 'Departments',
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
                            { value: staff.filter(s => s.department === 'Security').length, name: 'Security', itemStyle: { color: '#3B82F6' } },
                            { value: staff.filter(s => s.department === 'Administration').length, name: 'Administration', itemStyle: { color: '#10B981' } },
                            { value: staff.filter(s => s.department === 'Facilities').length, name: 'Facilities', itemStyle: { color: '#F59E0B' } },
                            { value: staff.filter(s => s.department === 'IT').length, name: 'IT', itemStyle: { color: '#8B5CF6' } },
                            { value: staff.filter(s => s.department === 'HR').length, name: 'HR', itemStyle: { color: '#EC4899' } },
                            { value: staff.filter(s => s.department === 'Operations').length, name: 'Operations', itemStyle: { color: '#EF4444' } }
                        ]
                    }
                ]
            };

            // Role Chart Options
            const roleOptions = {
                title: {
                    text: 'Staff by Role',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c} staff'
                },
                xAxis: {
                    type: 'category',
                    data: ['Admin', 'Security', 'Reception', 'Maintenance', 'Other']
                },
                yAxis: {
                    type: 'value',
                    name: 'Staff'
                },
                series: [
                    {
                        name: 'Staff',
                        type: 'bar',
                        data: [
                            staff.filter(s => s.role === 'admin').length,
                            staff.filter(s => s.role === 'security').length,
                            staff.filter(s => s.role === 'reception').length,
                            staff.filter(s => s.role === 'maintenance').length,
                            staff.filter(s => s.role === 'other').length
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            // Status Chart Options
            const statusOptions = {
                title: {
                    text: 'Staff Status Overview',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Active', 'On Leave', 'Terminated'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: ['Security', 'Administration', 'Facilities', 'IT', 'HR', 'Operations']
                },
                yAxis: {
                    type: 'value',
                    name: 'Staff'
                },
                series: [
                    {
                        name: 'Active',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            staff.filter(s => s.department === 'Security' && s.status === 'active').length,
                            staff.filter(s => s.department === 'Administration' && s.status === 'active').length,
                            staff.filter(s => s.department === 'Facilities' && s.status === 'active').length,
                            staff.filter(s => s.department === 'IT' && s.status === 'active').length,
                            staff.filter(s => s.department === 'HR' && s.status === 'active').length,
                            staff.filter(s => s.department === 'Operations' && s.status === 'active').length
                        ],
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'On Leave',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            staff.filter(s => s.department === 'Security' && s.status === 'on_leave').length,
                            staff.filter(s => s.department === 'Administration' && s.status === 'on_leave').length,
                            staff.filter(s => s.department === 'Facilities' && s.status === 'on_leave').length,
                            staff.filter(s => s.department === 'IT' && s.status === 'on_leave').length,
                            staff.filter(s => s.department === 'HR' && s.status === 'on_leave').length,
                            staff.filter(s => s.department === 'Operations' && s.status === 'on_leave').length
                        ],
                        itemStyle: { color: '#F59E0B' }
                    },
                    {
                        name: 'Terminated',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            staff.filter(s => s.department === 'Security' && s.status === 'terminated').length,
                            staff.filter(s => s.department === 'Administration' && s.status === 'terminated').length,
                            staff.filter(s => s.department === 'Facilities' && s.status === 'terminated').length,
                            staff.filter(s => s.department === 'IT' && s.status === 'terminated').length,
                            staff.filter(s => s.department === 'HR' && s.status === 'terminated').length,
                            staff.filter(s => s.department === 'Operations' && s.status === 'terminated').length
                        ],
                        itemStyle: { color: '#EF4444' }
                    }
                ]
            };

            deptChart.setOption(deptOptions);
            roleChart.setOption(roleOptions);
            statusChart.setOption(statusOptions);

            return () => {
                deptChart.dispose();
                roleChart.dispose();
                statusChart.dispose();
            };
        };

        initCharts();
    }, [staff]);

    const updateStaffStatus = (id: string, status: 'active' | 'on_leave' | 'terminated') => {
        setStaff(prev =>
            prev.map(staff =>
                staff.id === id ? { ...staff, status } : staff
            )
        );
        setSelectedStaff(null);
    };

    const departments = [...new Set(staff.map(member => member.department))];
    const roles = [...new Set(staff.map(member => member.role))];

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
                            <option value="on_leave">On Leave</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option value="all">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
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
                        <h3 className="text-lg font-semibold text-gray-800">Total Staff</h3>
                        <span className="text-2xl font-bold text-blue-600">{staff.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredStaff.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Staff</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {staff.filter(s => s.status === 'active').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {staff.filter(s => s.status === 'on_leave').length} on leave
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Avg. Tenure</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {(
                                staff.reduce((sum, member) => {
                                    const tenure = (Date.now() - member.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                                    return sum + tenure;
                                }, 0) / staff.length
                            ).toFixed(1)} yrs
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {staff.filter(s => {
                            const tenure = (Date.now() - s.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                            return tenure < 1;
                        }).length} new hires
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Violations</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {staff.reduce((sum, member) => sum + member.violations, 0)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {staff.filter(s => s.violations > 0).length} staff with violations
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="departmentChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="roleChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="statusChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Staff Records ({filteredStaff.length})
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            + Add New Staff
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStaff.slice(0, 10).map(member => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {member.staffId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {member.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {member.position}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {member.licensePlate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {member.hireDate.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {member.violations}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${member.status === 'active' ? 'bg-green-100 text-green-800' :
                                                member.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {member.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedStaff(member)}
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
                {filteredStaff.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredStaff.length} staff members. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Staff Detail Modal */}
            {selectedStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedStaff.name} - {selectedStaff.staffId}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedStaff(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Staff Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Staff ID:</span>
                                        <span className="font-medium">{selectedStaff.staffId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedStaff.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedStaff.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{selectedStaff.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Employment Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Department:</span>
                                        <span className="font-medium">{selectedStaff.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Position:</span>
                                        <span className="font-medium">{selectedStaff.position}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Role:</span>
                                        <span className="font-medium capitalize">{selectedStaff.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedStaff.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedStaff.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedStaff.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Parking Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono font-medium">{selectedStaff.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Access:</span>
                                        <span className="font-medium">{selectedStaff.lastAccessDate.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Hire Date:</span>
                                        <span className="font-medium">{selectedStaff.hireDate.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tenure:</span>
                                        <span className="font-medium">
                                            {((Date.now() - selectedStaff.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} years
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Violations</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Violations:</span>
                                        <span className={`font-medium ${selectedStaff.violations > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {selectedStaff.violations}
                                        </span>
                                    </div>
                                    {selectedStaff.violations > 0 && (
                                        <div className="bg-red-50 p-3 rounded-md">
                                            <h5 className="font-medium text-red-800 mb-1">Violation History</h5>
                                            <ul className="text-sm text-red-700 list-disc pl-5">
                                                {Array.from({ length: selectedStaff.violations }, (_, i) => (
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
                                {selectedStaff.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateStaffStatus(selectedStaff.id, 'active')}
                                    >
                                        Activate Staff
                                    </button>
                                )}
                                {selectedStaff.status !== 'on_leave' && (
                                    <button
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                        onClick={() => updateStaffStatus(selectedStaff.id, 'on_leave')}
                                    >
                                        Place On Leave
                                    </button>
                                )}
                                {selectedStaff.status !== 'terminated' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateStaffStatus(selectedStaff.id, 'terminated')}
                                    >
                                        Terminate Staff
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => {
                                        // Navigate to edit page or show edit form
                                    }}
                                >
                                    Edit Staff Details
                                </button>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                    View Access History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};