import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface Student {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    licensePlate: string;
    department: string;
    year: number;
    status: 'active' | 'suspended' | 'graduated';
    lastParkingDate: Date;
    totalReservations: number;
    violations: number;
}

export const StudentsDashboard: React.FC = () => {
    // Mock students data
    const generateMockStudents = (): Student[] => {
        const departments = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Medicine'];
        const statuses: ('active' | 'suspended' | 'graduated')[] = ['active', 'suspended', 'graduated'];

        return Array.from({ length: 50 }, (_, i) => ({
            id: `stu-${1000 + i}`,
            studentId: `S${20230000 + i}`,
            name: `Student ${i + 1}`,
            email: `student${i + 1}@university.edu`,
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`,
            department: departments[Math.floor(Math.random() * departments.length)],
            year: Math.floor(1 + Math.random() * 4),
            status: statuses[Math.floor(Math.random() * 3)],
            lastParkingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            totalReservations: Math.floor(Math.random() * 50),
            violations: Math.floor(Math.random() * 5)
        }));
    };

    const [students, setStudents] = useState<Student[]>(generateMockStudents());
    const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        department: 'all',
        year: 'all',
        search: ''
    });

    // Apply filters
    useEffect(() => {
        let result = [...students];

        if (filters.status !== 'all') {
            result = result.filter(student => student.status === filters.status);
        }

        if (filters.department !== 'all') {
            result = result.filter(student => student.department === filters.department);
        }

        if (filters.year !== 'all') {
            result = result.filter(student => student.year === parseInt(filters.year));
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.studentId.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.licensePlate.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredStudents(result);
    }, [filters, students]);

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Department Distribution Chart
            const deptChart = echarts.init(document.getElementById('departmentChart'));

            // Year Distribution Chart
            const yearChart = echarts.init(document.getElementById('yearChart'));

            // Violations Analysis Chart
            const violationsChart = echarts.init(document.getElementById('violationsChart'));

            // Department Chart Options
            const deptOptions = {
                title: {
                    text: 'Students by Department',
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
                            { value: students.filter(s => s.department === 'Computer Science').length, name: 'Computer Science', itemStyle: { color: '#3B82F6' } },
                            { value: students.filter(s => s.department === 'Engineering').length, name: 'Engineering', itemStyle: { color: '#10B981' } },
                            { value: students.filter(s => s.department === 'Business').length, name: 'Business', itemStyle: { color: '#F59E0B' } },
                            { value: students.filter(s => s.department === 'Arts').length, name: 'Arts', itemStyle: { color: '#8B5CF6' } },
                            { value: students.filter(s => s.department === 'Science').length, name: 'Science', itemStyle: { color: '#EC4899' } },
                            { value: students.filter(s => s.department === 'Medicine').length, name: 'Medicine', itemStyle: { color: '#EF4444' } }
                        ]
                    }
                ]
            };

            // Year Chart Options
            const yearOptions = {
                title: {
                    text: 'Students by Year',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c} students'
                },
                xAxis: {
                    type: 'category',
                    data: ['Year 1', 'Year 2', 'Year 3', 'Year 4']
                },
                yAxis: {
                    type: 'value',
                    name: 'Students'
                },
                series: [
                    {
                        name: 'Students',
                        type: 'bar',
                        data: [
                            students.filter(s => s.year === 1).length,
                            students.filter(s => s.year === 2).length,
                            students.filter(s => s.year === 3).length,
                            students.filter(s => s.year === 4).length
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
                    data: ['Students with 0', 'Students with 1-2', 'Students with 3+'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Medicine']
                },
                yAxis: {
                    type: 'value',
                    name: 'Students'
                },
                series: [
                    {
                        name: 'Students with 0',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            students.filter(s => s.department === 'Computer Science' && s.violations === 0).length,
                            students.filter(s => s.department === 'Engineering' && s.violations === 0).length,
                            students.filter(s => s.department === 'Business' && s.violations === 0).length,
                            students.filter(s => s.department === 'Arts' && s.violations === 0).length,
                            students.filter(s => s.department === 'Science' && s.violations === 0).length,
                            students.filter(s => s.department === 'Medicine' && s.violations === 0).length
                        ],
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Students with 1-2',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            students.filter(s => s.department === 'Computer Science' && s.violations >= 1 && s.violations <= 2).length,
                            students.filter(s => s.department === 'Engineering' && s.violations >= 1 && s.violations <= 2).length,
                            students.filter(s => s.department === 'Business' && s.violations >= 1 && s.violations <= 2).length,
                            students.filter(s => s.department === 'Arts' && s.violations >= 1 && s.violations <= 2).length,
                            students.filter(s => s.department === 'Science' && s.violations >= 1 && s.violations <= 2).length,
                            students.filter(s => s.department === 'Medicine' && s.violations >= 1 && s.violations <= 2).length
                        ],
                        itemStyle: { color: '#F59E0B' }
                    },
                    {
                        name: 'Students with 3+',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            students.filter(s => s.department === 'Computer Science' && s.violations >= 3).length,
                            students.filter(s => s.department === 'Engineering' && s.violations >= 3).length,
                            students.filter(s => s.department === 'Business' && s.violations >= 3).length,
                            students.filter(s => s.department === 'Arts' && s.violations >= 3).length,
                            students.filter(s => s.department === 'Science' && s.violations >= 3).length,
                            students.filter(s => s.department === 'Medicine' && s.violations >= 3).length
                        ],
                        itemStyle: { color: '#EF4444' }
                    }
                ]
            };

            deptChart.setOption(deptOptions);
            yearChart.setOption(yearOptions);
            violationsChart.setOption(violationsOptions);

            return () => {
                deptChart.dispose();
                yearChart.dispose();
                violationsChart.dispose();
            };
        };

        initCharts();
    }, [students]);

    const updateStudentStatus = (id: string, status: 'active' | 'suspended' | 'graduated') => {
        setStudents(prev =>
            prev.map(student =>
                student.id === id ? { ...student, status } : student
            )
        );
        setSelectedStudent(null);
    };

    const departments = [...new Set(students.map(student => student.department))];

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
                            <option value="suspended">Suspended</option>
                            <option value="graduated">Graduated</option>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="all">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
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
                        <h3 className="text-lg font-semibold text-gray-800">Total Students</h3>
                        <span className="text-2xl font-bold text-blue-600">{students.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredStudents.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Students</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {students.filter(s => s.status === 'active').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {students.filter(s => s.status === 'suspended').length} suspended
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Avg. Reservations</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {(students.reduce((sum, student) => sum + student.totalReservations, 0) / students.length).toFixed(1)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {students.filter(s => s.totalReservations === 0).length} with no reservations
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Violations</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {students.reduce((sum, student) => sum + student.violations, 0)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {students.filter(s => s.violations > 0).length} students with violations
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="departmentChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="yearChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="violationsChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Student Records ({filteredStudents.length})
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            + Add New Student
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservations</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.slice(0, 10).map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.studentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        Year {student.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {student.licensePlate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.totalReservations}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.violations}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                student.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedStudent(student)}
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
                {filteredStudents.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredStudents.length} students. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedStudent.name} - {selectedStudent.studentId}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedStudent(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Student ID:</span>
                                        <span className="font-medium">{selectedStudent.studentId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedStudent.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedStudent.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{selectedStudent.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Academic Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Department:</span>
                                        <span className="font-medium">{selectedStudent.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Year:</span>
                                        <span className="font-medium">Year {selectedStudent.year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedStudent.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedStudent.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Parking Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono font-medium">{selectedStudent.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Reservations:</span>
                                        <span className="font-medium">{selectedStudent.totalReservations}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Parking Date:</span>
                                        <span className="font-medium">{selectedStudent.lastParkingDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Violations</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Violations:</span>
                                        <span className={`font-medium ${selectedStudent.violations > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {selectedStudent.violations}
                                        </span>
                                    </div>
                                    {selectedStudent.violations > 0 && (
                                        <div className="bg-red-50 p-3 rounded-md">
                                            <h5 className="font-medium text-red-800 mb-1">Violation History</h5>
                                            <ul className="text-sm text-red-700 list-disc pl-5">
                                                {Array.from({ length: selectedStudent.violations }, (_, i) => (
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
                                {selectedStudent.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateStudentStatus(selectedStudent.id, 'active')}
                                    >
                                        Activate Account
                                    </button>
                                )}
                                {selectedStudent.status !== 'suspended' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateStudentStatus(selectedStudent.id, 'suspended')}
                                    >
                                        Suspend Account
                                    </button>
                                )}
                                {selectedStudent.status !== 'graduated' && (
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => updateStudentStatus(selectedStudent.id, 'graduated')}
                                    >
                                        Mark as Graduated
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => {
                                        // Navigate to edit page or show edit form
                                    }}
                                >
                                    Edit Student Details
                                </button>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                    View Parking History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};