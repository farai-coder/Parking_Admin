import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface SystemUser {
    id: string;
    username: string;
    name: string;
    email: string;
    department: string;
    role: 'admin' | 'manager' | 'operator' | 'auditor' | 'support' | 'valet';
    status: 'active' | 'suspended' | 'pending_activation';
    lastLogin: Date;
    loginCount: number;
    createdAt: Date;
    permissions: string[];
    twoFactorEnabled: boolean;
    lastIpAddress: string;
    failedAttempts: number;
    shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
    parkingZone?: string[];
}

interface LoginLog {
    id: string;
    userId: string;
    timestamp: Date;
    ipAddress: string;
    device: string;
    location: string;
    status: 'success' | 'failed';
    action?: string;
    duration?: number; // in minutes
}

export const ParkingSystemUsersDashboard: React.FC = () => {
    // Mock system user data for parking management
    const generateMockUsers = (): SystemUser[] => {
        const departments = ['Parking Operations', 'Security', 'Customer Service', 'Maintenance', 'Administration'];
        const roles: ('admin' | 'manager' | 'operator' | 'auditor' | 'support' | 'valet')[] =
            ['admin', 'manager', 'operator', 'auditor', 'support', 'valet'];
        const permissions = [
            'parking_management', 'payment_processing',
            'violation_issuance', 'reservation_management',
            'reporting', 'system_configuration',
            'access_control', 'equipment_maintenance'
        ];
        const parkingZones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Valet', 'VIP', 'Disabled'];

        return Array.from({ length: 30 }, (_, i) => {
            const userPermissions: string[] = [];
            const permissionCount = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < permissionCount; j++) {
                const randomPerm = permissions[Math.floor(Math.random() * permissions.length)];
                if (!userPermissions.includes(randomPerm)) {
                    userPermissions.push(randomPerm);
                }
            }

            const shifts: ('morning' | 'afternoon' | 'night' | 'flexible')[] = ['morning', 'afternoon', 'night', 'flexible'];
            const assignedZones: string[] = [];
            const zoneCount = Math.floor(Math.random() * 3) + 1;
            for (let z = 0; z < zoneCount; z++) {
                const randomZone = parkingZones[Math.floor(Math.random() * parkingZones.length)];
                if (!assignedZones.includes(randomZone)) {
                    assignedZones.push(randomZone);
                }
            }

            return {
                id: `parking-user-${1000 + i}`,
                username: `parking${i + 1}`,
                name: `Parking Staff ${i + 1}`,
                email: `parking.staff${i + 1}@company.com`,
                department: departments[Math.floor(Math.random() * departments.length)],
                role: roles[Math.floor(Math.random() * roles.length)],
                status: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'suspended' : 'pending_activation') : 'active',
                lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                loginCount: Math.floor(Math.random() * 100),
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 3) * 24 * 60 * 60 * 1000),
                permissions: userPermissions,
                twoFactorEnabled: Math.random() > 0.7,
                lastIpAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                failedAttempts: Math.floor(Math.random() * 3),
                shift: shifts[Math.floor(Math.random() * shifts.length)],
                parkingZone: assignedZones
            };
        });
    };

    // Generate mock login logs
    const generateMockLoginLogs = (users: SystemUser[]): LoginLog[] => {
        const logs: LoginLog[] = [];
        const devices = ['Windows PC', 'MacBook Pro', 'iPhone', 'Android Phone', 'iPad', 'Linux Workstation'];
        const actions = ['login', 'logout', 'session_renewal', 'password_change', 'system_access'];

        users.forEach(user => {
            // Generate between 5-20 logs per user
            const logCount = Math.floor(Math.random() * 15) + 5;

            for (let i = 0; i < logCount; i++) {
                const daysAgo = Math.floor(Math.random() * 90); // logs from last 90 days
                const hoursAgo = Math.floor(Math.random() * 24);
                const minutesAgo = Math.floor(Math.random() * 60);

                const timestamp = new Date();
                timestamp.setDate(timestamp.getDate() - daysAgo);
                timestamp.setHours(timestamp.getHours() - hoursAgo);
                timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

                const status: 'success' | 'failed' = Math.random() > 0.9 ? 'failed' : 'success';
                const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

                logs.push({
                    id: `log-${user.id}-${i}`,
                    userId: user.id,
                    timestamp,
                    ipAddress,
                    device: devices[Math.floor(Math.random() * devices.length)],
                    location: `${['New York', 'Chicago', 'Los Angeles', 'Miami', 'Dallas'][Math.floor(Math.random() * 5)]}, US`,
                    status,
                    action: actions[Math.floor(Math.random() * actions.length)],
                    duration: status === 'success' ? Math.floor(Math.random() * 480) : undefined // 0-8 hours
                });
            }
        });

        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    const [users, setUsers] = useState<SystemUser[]>(generateMockUsers());
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>(generateMockLoginLogs(generateMockUsers()));
    const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>(users);
    const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
    const [showLogs, setShowLogs] = useState(false);
    const [userLogs, setUserLogs] = useState<LoginLog[]>([]);
    const [filters, setFilters] = useState({
        status: 'all',
        department: 'all',
        role: 'all',
        shift: 'all',
        search: ''
    });

    // Apply filters
    useEffect(() => {
        let result = [...users];

        if (filters.status !== 'all') {
            result = result.filter(user => user.status === filters.status);
        }

        if (filters.department !== 'all') {
            result = result.filter(user => user.department === filters.department);
        }

        if (filters.role !== 'all') {
            result = result.filter(user => user.role === filters.role);
        }

        if (filters.shift !== 'all') {
            result = result.filter(user => user.shift === filters.shift);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredUsers(result);
    }, [filters, users]);

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Department Distribution Chart
            const deptChart = echarts.init(document.getElementById('userDepartmentChart'));

            // Role Distribution Chart
            const roleChart = echarts.init(document.getElementById('userRoleChart'));

            // User Status Chart
            const statusChart = echarts.init(document.getElementById('userStatusChart'));

            // Login Activity Chart
            const loginActivityChart = echarts.init(document.getElementById('loginActivityChart'));

            // Department Chart Options
            const deptOptions = {
                title: {
                    text: 'Parking Staff by Department',
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
                            { value: users.filter(u => u.department === 'Parking Operations').length, name: 'Operations', itemStyle: { color: '#3B82F6' } },
                            { value: users.filter(u => u.department === 'Security').length, name: 'Security', itemStyle: { color: '#10B981' } },
                            { value: users.filter(u => u.department === 'Customer Service').length, name: 'Customer Service', itemStyle: { color: '#F59E0B' } },
                            { value: users.filter(u => u.department === 'Maintenance').length, name: 'Maintenance', itemStyle: { color: '#8B5CF6' } },
                            { value: users.filter(u => u.department === 'Administration').length, name: 'Administration', itemStyle: { color: '#EC4899' } }
                        ]
                    }
                ]
            };

            // Role Chart Options
            const roleOptions = {
                title: {
                    text: 'Parking Staff by Role',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c} staff'
                },
                xAxis: {
                    type: 'category',
                    data: ['Admin', 'Manager', 'Operator', 'Auditor', 'Support', 'Valet']
                },
                yAxis: {
                    type: 'value',
                    name: 'Staff Count'
                },
                series: [
                    {
                        name: 'Staff',
                        type: 'bar',
                        data: [
                            users.filter(u => u.role === 'admin').length,
                            users.filter(u => u.role === 'manager').length,
                            users.filter(u => u.role === 'operator').length,
                            users.filter(u => u.role === 'auditor').length,
                            users.filter(u => u.role === 'support').length,
                            users.filter(u => u.role === 'valet').length
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444'];
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
                    data: ['Active', 'Suspended', 'Pending'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: ['Parking Operations', 'Security', 'Customer Service', 'Maintenance', 'Administration']
                },
                yAxis: {
                    type: 'value',
                    name: 'Staff Count'
                },
                series: [
                    {
                        name: 'Active',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            users.filter(u => u.department === 'Parking Operations' && u.status === 'active').length,
                            users.filter(u => u.department === 'Security' && u.status === 'active').length,
                            users.filter(u => u.department === 'Customer Service' && u.status === 'active').length,
                            users.filter(u => u.department === 'Maintenance' && u.status === 'active').length,
                            users.filter(u => u.department === 'Administration' && u.status === 'active').length
                        ],
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Suspended',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            users.filter(u => u.department === 'Parking Operations' && u.status === 'suspended').length,
                            users.filter(u => u.department === 'Security' && u.status === 'suspended').length,
                            users.filter(u => u.department === 'Customer Service' && u.status === 'suspended').length,
                            users.filter(u => u.department === 'Maintenance' && u.status === 'suspended').length,
                            users.filter(u => u.department === 'Administration' && u.status === 'suspended').length
                        ],
                        itemStyle: { color: '#EF4444' }
                    },
                    {
                        name: 'Pending',
                        type: 'bar',
                        stack: 'total',
                        data: [
                            users.filter(u => u.department === 'Parking Operations' && u.status === 'pending_activation').length,
                            users.filter(u => u.department === 'Security' && u.status === 'pending_activation').length,
                            users.filter(u => u.department === 'Customer Service' && u.status === 'pending_activation').length,
                            users.filter(u => u.department === 'Maintenance' && u.status === 'pending_activation').length,
                            users.filter(u => u.department === 'Administration' && u.status === 'pending_activation').length
                        ],
                        itemStyle: { color: '#F59E0B' }
                    }
                ]
            };

            // Login Activity Chart Options
            const loginActivityOptions = {
                title: {
                    text: 'Recent Login Activity (Last 30 Days)',
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
                    data: ['Successful Logins', 'Failed Attempts'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: Array.from({ length: 30 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (29 - i));
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    })
                },
                yAxis: {
                    type: 'value',
                    name: 'Login Count'
                },
                series: [
                    {
                        name: 'Successful Logins',
                        type: 'bar',
                        stack: 'total',
                        data: Array.from({ length: 30 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            return loginLogs.filter(log =>
                                log.timestamp.toDateString() === date.toDateString() &&
                                log.status === 'success'
                            ).length;
                        }),
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Failed Attempts',
                        type: 'bar',
                        stack: 'total',
                        data: Array.from({ length: 30 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            return loginLogs.filter(log =>
                                log.timestamp.toDateString() === date.toDateString() &&
                                log.status === 'failed'
                            ).length;
                        }),
                        itemStyle: { color: '#EF4444' }
                    }
                ]
            };

            deptChart.setOption(deptOptions);
            roleChart.setOption(roleOptions);
            statusChart.setOption(statusOptions);
            loginActivityChart.setOption(loginActivityOptions);

            return () => {
                deptChart.dispose();
                roleChart.dispose();
                statusChart.dispose();
                loginActivityChart.dispose();
            };
        };

        initCharts();
    }, [users, loginLogs]);

    const updateUserStatus = (id: string, status: 'active' | 'suspended' | 'pending_activation') => {
        setUsers(prev =>
            prev.map(user =>
                user.id === id ? { ...user, status } : user
            )
        );
        setSelectedUser(null);
    };

    const resetPassword = (id: string) => {
        alert(`Password reset initiated for parking staff ${id}`);
        setSelectedUser(null);
    };

    const viewLoginHistory = (userId: string) => {
        setUserLogs(loginLogs.filter(log => log.userId === userId));
        setShowLogs(true);
    };

    const departments = [...new Set(users.map(user => user.department))];
    const roles = [...new Set(users.map(user => user.role))];
    const shifts = ['morning', 'afternoon', 'night', 'flexible'];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                            <option value="pending_activation">Pending Activation</option>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.shift}
                            onChange={(e) => setFilters({ ...filters, shift: e.target.value as any })}
                        >
                            <option value="all">All Shifts</option>
                            {shifts.map(shift => (
                                <option key={shift} value={shift}>{shift.charAt(0).toUpperCase() + shift.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, username, or email"
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
                        <span className="text-2xl font-bold text-blue-600">{users.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredUsers.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Staff</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.status === 'active').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {users.filter(u => u.status === 'pending_activation').length} pending
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">On Duty Now</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {Math.floor(users.filter(u => u.status === 'active').length * 0.3)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Based on shift schedules
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Today's Logins</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {loginLogs.filter(log =>
                                log.timestamp.toDateString() === new Date().toDateString() &&
                                log.status === 'success'
                            ).length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {loginLogs.filter(log =>
                            log.timestamp.toDateString() === new Date().toDateString() &&
                            log.status === 'failed'
                        ).length} failed attempts
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="userDepartmentChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="userRoleChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="userStatusChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Login Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div id="loginActivityChart" style={{ height: '350px' }}></div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Parking Staff ({filteredUsers.length})
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.slice(0, 10).map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {user.shift}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.lastLogin.toLocaleDateString()}
                                        <div className="text-xs text-gray-500">{user.lastIpAddress}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {user.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedUser(user)}
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
                {filteredUsers.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredUsers.length} staff members. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedUser.name} - {selectedUser.username}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {selectedUser.department} • {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                            </p>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Staff Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Username:</span>
                                        <span className="font-medium">{selectedUser.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedUser.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Account Created:</span>
                                        <span className="font-medium">{selectedUser.createdAt.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Work Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Department:</span>
                                        <span className="font-medium">{selectedUser.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Role:</span>
                                        <span className="font-medium capitalize">{selectedUser.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shift:</span>
                                        <span className="font-medium capitalize">{selectedUser.shift}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {selectedUser.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Assigned Parking Zones</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.parkingZone && selectedUser.parkingZone.length > 0 ? (
                                        selectedUser.parkingZone.map(zone => (
                                            <span key={zone} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                Zone {zone}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">No specific zones assigned</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Login Activity</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Login:</span>
                                        <span className="font-medium">{selectedUser.lastLogin.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last IP Address:</span>
                                        <span className="font-mono font-medium">{selectedUser.lastIpAddress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Logins:</span>
                                        <span className="font-medium">{selectedUser.loginCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Failed Attempts:</span>
                                        <span className={`font-medium ${selectedUser.failedAttempts > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {selectedUser.failedAttempts}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.permissions.length > 0 ? (
                                            selectedUser.permissions.map(perm => (
                                                <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                                    {perm.replace('_', ' ')}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No special permissions assigned</span>
                                        )}
                                    </div>
                                    {selectedUser.failedAttempts > 0 && (
                                        <div className="bg-red-50 p-3 rounded-md">
                                            <h5 className="font-medium text-red-800 mb-1">Security Notice</h5>
                                            <p className="text-sm text-red-700">
                                                This account has {selectedUser.failedAttempts} failed login attempt(s).
                                                {selectedUser.failedAttempts > 2 && ' Consider resetting the password or contacting the staff member.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="flex flex-wrap gap-3">
                                {selectedUser.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateUserStatus(selectedUser.id, 'active')}
                                    >
                                        Activate Staff
                                    </button>
                                )}
                                {selectedUser.status !== 'suspended' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateUserStatus(selectedUser.id, 'suspended')}
                                    >
                                        Suspend Staff
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={() => resetPassword(selectedUser.id)}
                                >
                                    Reset Password
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => {
                                        // Navigate to edit page or show edit form
                                    }}
                                >
                                    Edit Staff Details
                                </button>
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                    onClick={() => viewLoginHistory(selectedUser.id)}
                                >
                                    View Login History
                                </button>
                                {selectedUser.twoFactorEnabled ? (
                                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                                        Disable 2FA
                                    </button>
                                ) : (
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                        Enable 2FA
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Login History Modal */}
            {showLogs && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Login History for {selectedUser?.name}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowLogs(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing last {userLogs.length} login activities
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {userLogs.slice(0, 20).map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.timestamp.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                    {log.ipAddress}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.device}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                    {log.action?.replace('_', ' ')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.duration ? `${log.duration} min` : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {userLogs.length > 20 && (
                                <div className="mt-4 text-center text-sm text-gray-500">
                                    Showing 20 of {userLogs.length} login records
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 flex justify-end">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                onClick={() => setShowLogs(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};