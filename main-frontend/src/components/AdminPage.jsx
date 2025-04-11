import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import './AdminPage.css';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const API_URL = 'http://localhost:8080';

    useEffect(() => {
        fetch(`${API_URL}/api/users`)
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const handleDeleteUser = (userId) => {
        fetch(`${API_URL}/api/users/${userId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    setUsers(users.filter(user => user.id !== userId));
                } else {
                    console.error('Failed to delete user');
                }
            })
            .catch(error => console.error('Error deleting user:', error));
    };

    const filteredUsers = users.filter(user => {
        const matchesSearchTerm = searchTerm === '' ||
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
        const userRole = user.role || ''; // Default to empty string if role is missing
    
        const matchesRole = selectedRole === 'All' || userRole.toLowerCase() === selectedRole.toLowerCase();
    
        return matchesSearchTerm && matchesRole;
    });
    console.log("Filtered Users:", filteredUsers); // Add this line
    return (
        <div className="admin-container">
            <h2>Admin Dashboard</h2>
            <p>Welcome to the Admin Dashboard. You can manage users, posts, etc.</p>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="role-select"
                >
                    <option value="All">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="agronomist">Agronomist</option>
                    <option value="farmer">Farmer</option>
                </select>
            </div>
            <UserList users={filteredUsers} onDelete={handleDeleteUser} />        </div>
    );
};

export default AdminPage;