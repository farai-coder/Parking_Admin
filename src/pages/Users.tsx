import React, { useState, useEffect } from 'react';

interface AdminUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    gender: string;
    phone_number: string;
    license_plate: string;
    role: string;
    status: string;
}

export const ParkingSystemUsersDashboard: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });

    // Form state for new admin
    const [newAdmin, setNewAdmin] = useState({
        email: '',
        name: '',
        surname: '',
        gender: 'male',
        phone_number: '',
        license_plate: '',
        role: 'admin'
    });

    // Fetch admin users from API
    const fetchAdminUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/users/admins', {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch admin users');
            }

            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching admin users:', error);
        }
    };

    // Apply filters
    useEffect(() => {
        let result = [...users];

        if (filters.status !== 'all') {
            result = result.filter(user => user.status === filters.status);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.surname.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredUsers(result);
    }, [filters, users]);

    // Fetch data on component mount
    useEffect(() => {
        fetchAdminUsers();
    }, []);

    // Handle input changes for new admin form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Create new admin user
    const createAdminUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/users/', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAdmin)
            });

            if (!response.ok) {
                throw new Error('Failed to create admin user');
            }

            // Refresh admin list
            fetchAdminUsers();
            setShowAddModal(false);

            // Reset form
            setNewAdmin({
                email: '',
                name: '',
                surname: '',
                gender: 'male',
                phone_number: '',
                license_plate: '',
                role: 'admin'
            });
        } catch (error) {
            console.error('Error creating admin user:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, surname, or email"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Admin Users ({filteredUsers.length})
                        </h3>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setShowAddModal(true)}
                        >
                            + Add New Admin
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.slice(0, 10).map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name} {user.surname}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.phone_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.license_plate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredUsers.length} admin users. Use filters to refine your search.
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
                                    {selectedUser.name} {selectedUser.surname}
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
                                {selectedUser.email}
                            </p>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Admin Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedUser.name} {selectedUser.surname}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-medium capitalize">{selectedUser.gender}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Contact Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{selectedUser.phone_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-medium">{selectedUser.license_plate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {selectedUser.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Add New Admin
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newAdmin.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newAdmin.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                                    <input
                                        type="text"
                                        name="surname"
                                        value={newAdmin.surname}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={newAdmin.gender}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={newAdmin.phone_number}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                <input
                                    type="text"
                                    name="license_plate"
                                    value={newAdmin.license_plate}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={createAdminUser}
                            >
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};