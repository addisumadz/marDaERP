"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
  TextField,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import Breadcrumb from '../../../ui/components/Breadcrumbs/Breadcrumb';
import { userService } from '../../../lib/userService'; // Adjust the import path as needed
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MaterialReactTable,
  useMaterialReactTable
} from "material-react-table";

// Define validateUser function
const validateUser = (user, isEditMode) => {
  const errors = {};

  // Basic validation example
  if (!user.username) {
    errors.username = 'Username is required';
  }
  if (!user.name) {
    errors.name = 'Name is required';
  }
  if (!user.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(user.email)) {
    errors.email = 'Email is invalid';
  }
  if (!isEditMode) {
    if (!user.password) {
      errors.password = 'Password is required';
    }
    if (user.password !== user.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }
  if (!user.role) {
    errors.role = 'Role is required';
  }

  return errors;
};

const User = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [status, setStatus] = useState('active');
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordModalErrors, setPasswordModalErrors] = useState({});

  // Fetch users
  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers(status);
      setFetchedUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const roles = await userService.getAllRoles();
      setRoles(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [status]);

  const handleCreateUser = async () => {
    const userWithRole = {
      ...currentUser,
      role: selectedRole, // Single role
      registeredDate: new Date().toISOString().split('T')[0],
    };

    const newValidationErrors = validateUser(userWithRole, editMode);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }

    try {
      const response = await userService.createUser(userWithRole);
      if (response.error) {
        setValidationErrors({
          ...validationErrors,
          username: response.error.includes('Username') ? response.error : validationErrors.username,
          email: response.error.includes('Email') ? response.error : validationErrors.email,
        });
      } else {
        fetchUsers(); // Refetch users
        closeModal();
        toast.success('User added successfully!'); // Success message
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditUser = async () => {
    // Ensure role is a single string
    const userWithRole = {
      ...currentUser,
      role: selectedRole, // Single role
    };
  
    const newValidationErrors = validateUser(userWithRole, editMode);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
  
    try {
      const response = await userService.updateUser(userWithRole);
      if (response.error) {
        console.error('Update error:', response.error); // Log full error response
        throw new Error(response.error); // Throw error to be caught below
      } else {
        fetchUsers(); // Refetch users
        closeModal();
        toast.success('User updated successfully!'); // Success message
      }
    } catch (error) {
      console.error('Error updating user:', error); // Log full error
      toast.error('Failed to update user.'); // Display error message
    }
  };

  const openModal = (user = {}) => {
    if (user.id) {
      setCurrentUser(user);
      setSelectedRole(user.role || ''); // Set the selected role from user
      setEditMode(true);
    } else {
      setCurrentUser({ username: '', name: '', email: '', password: '', confirmPassword: '' });
      setSelectedRole(''); // No role selected
      setEditMode(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setValidationErrors({});
    setIsModalOpen(false);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleInputChange = (e) => {
    setCurrentUser({
      ...currentUser,
      [e.target.name]: e.target.value,
    });
  };

  const openDeactivateConfirmModal = async (row) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userService.deactivateUser(row.original.id);
        fetchUsers(); // Refetch users
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    }
  };

  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordModalErrors({});
  };

  const handlePasswordChange = async () => {
    const errors = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    }
    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordModalErrors(errors);
      return;
    }

    try {
      await userService.updatePassword(currentUser.id, newPassword);
      toast.success('Password updated successfully!');
      closePasswordModal();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password.');
    }
  };

  const table = useMaterialReactTable({
    columns: useMemo(() => [
      { accessorKey: 'username', header: 'Username' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'registeredDate', header: 'Registered Date' },
      { 
        accessorKey: 'roles', 
        header: 'Roles',
        // This will format the roles as a comma-separated list
        Cell: ({ cell }) => cell.getValue().map(role => role.name).join(', ')
      },
    ], []),
    data: fetchedUsers,
    getRowId: (row) => row.id,
    enableEditing: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => openModal(row.original)} sx={{ color: 'green' }}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deactivate">
          <IconButton color="error" onClick={() => openDeactivateConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change Password">
          <IconButton onClick={() => { setCurrentUser(row.original); openPasswordModal(); }}>
            <LockIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <Breadcrumb pageName="Manage Users" />
      <Button onClick={() => openModal()}>Add User</Button>
      <MaterialReactTable table={table} />

      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>{editMode ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TextField
            label="Username"
            name="username"
            value={currentUser.username || ''}
            onChange={handleInputChange}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            required
          />
          <TextField
            label="Name"
            name="name"
            value={currentUser.name || ''}
            onChange={handleInputChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            required
          />
          <TextField
            label="Email"
            name="email"
            value={currentUser.email || ''}
            onChange={handleInputChange}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            required
          />
          {!editMode && (
            <>
              <TextField
                label="Password"
                type="password"
                name="password"
                value={currentUser.password || ''}
                onChange={handleInputChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                required
              />
              <TextField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={currentUser.confirmPassword || ''}
                onChange={handleInputChange}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                required
              />
            </>
          )}
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  <Checkbox checked={selectedRole === role.name} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={editMode ? handleEditUser : handleCreateUser}>
            {editMode ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onClose={closePasswordModal}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!passwordModalErrors.newPassword}
            helperText={passwordModalErrors.newPassword}
            required
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={!!passwordModalErrors.confirmNewPassword}
            helperText={passwordModalErrors.confirmNewPassword}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordModal}>Cancel</Button>
          <Button onClick={handlePasswordChange}>Change Password</Button>
        </DialogActions>
      </Dialog>
      
      <ToastContainer />
    </>
  );
};

export default User;
