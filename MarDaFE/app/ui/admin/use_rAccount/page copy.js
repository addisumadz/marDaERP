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
import PasswordIcon from '@mui/icons-material/VpnKey';
import Breadcrumb from '../../../ui/components/Breadcrumbs/Breadcrumb';
import { userService } from '../../../lib/userService'; // Adjust the import path as needed
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MaterialReactTable,
  useMaterialReactTable
} from "material-react-table";

// Validation logic
const validateUser = (user, isEditMode) => {
  const errors = {};
  if (!user.username) errors.username = 'Username is required';
  if (!user.name) errors.name = 'Name is required';
  if (!user.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(user.email)) errors.email = 'Email is invalid';
  if (!isEditMode) {
    if (!user.password) errors.password = 'Password is required';
    if (user.password !== user.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  }
  if (!user.roles || user.roles.length === 0) errors.roles = 'At least one role is required';
  return errors;
};

const User = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [status, setStatus] = useState('active');
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [assignRoleUser, setAssignRoleUser] = useState(null);
  const [changePasswordUser, setChangePasswordUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch users and roles
  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers(status);
      setFetchedUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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

  const handleAssignRole = async () => {
    if (!assignRoleUser || selectedRoles.length === 0) return;

    try {
      await userService.assignRoles(assignRoleUser.id, selectedRoles);
      fetchUsers();
      closeAssignRoleModal();
      toast.success('Roles assigned successfully!');
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles.');
    }
  };

  const handleChangePassword = async () => {
    if (!changePasswordUser || !password || password !== confirmPassword) {
      toast.error('Passwords do not match or are empty.');
      return;
    }

    try {
      await userService.updatePassword(changePasswordUser.id, password);
      closeChangePasswordModal();
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password.');
    }
  };

  const openAssignRoleModal = (user) => {
    setAssignRoleUser(user);
    setSelectedRoles(user.roles.map(role => role.name));
    setIsAssignRoleModalOpen(true);
  };

  const closeAssignRoleModal = () => {
    setIsAssignRoleModalOpen(false);
    setAssignRoleUser(null);
    setSelectedRoles([]);
  };

  const openChangePasswordModal = (user) => {
    setChangePasswordUser(user);
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setChangePasswordUser(null);
    setPassword('');
    setConfirmPassword('');
  };

  const openModal = (user = {}) => {
    if (user.id) {
      // Editing an existing user
      setEditMode(true);
      setCurrentUser(user);
     
      setSelectedRoles(user.roles.map(role => role.name)); // Set roles for edit mode
      console.log(user.roles)
    } else {
      // Adding a new user
      setEditMode(false);
      setCurrentUser({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: []
      });
      setSelectedRoles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
    setSelectedRoles([]);
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    const userToSubmit = { ...currentUser, roles: selectedRoles };
    const errors = validateUser(userToSubmit, editMode);
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (editMode) {
        await userService.updateUser(currentUser.id, userToSubmit); // Update existing user
        toast.success('User updated successfully!');
      } else {
        await userService.createUser(userToSubmit); // Add new user
        // toast.success('User created successfully!');
      }
      fetchUsers(); // Refresh users
      closeModal(); // Close the modal
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user.');
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
        <Tooltip title="Assign Role">
          <IconButton onClick={() => openAssignRoleModal(row.original)} sx={{ color: 'blue' }}>
            <LockIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change Password">
          <IconButton onClick={() => openChangePasswordModal(row.original)} sx={{ color: 'purple' }}>
            <PasswordIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deactivate">
          <IconButton color="error" onClick={() => openDeactivateConfirmModal(row)}>
            <DeleteIcon />
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

      {/* User Modal */}
      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>{editMode ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="Username"
            value={currentUser.username}
            onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            fullWidth
            required
          />
          <TextField
            label="Name"
            value={currentUser.name}
            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            fullWidth
            required
          />
          <TextField
            label="Email"
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            fullWidth
            required
          />
          {!editMode && (
            <>
              <TextField
                label="Password"
                type="password"
                value={currentUser.password}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                fullWidth
                required
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={currentUser.confirmPassword}
                onChange={(e) => setCurrentUser({ ...currentUser, confirmPassword: e.target.value })}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                fullWidth
                required
              />
            </>
          )}

          {/* Role selection */}
          <FormControl fullWidth required>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
              error={!!validationErrors.roles}
            >
              {roles.map(role => (
                <MenuItem key={role.id} value={role.name}>
                  <Checkbox checked={selectedRoles.indexOf(role.name) > -1} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
            {validationErrors.roles && <span style={{ color: 'red' }}>{validationErrors.roles}</span>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit}>{editMode ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Role Modal */}
      <Dialog open={isAssignRoleModalOpen} onClose={closeAssignRoleModal}>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
            >
              {roles.map(role => (
                <MenuItem key={role.id} value={role.name}>
                  <Checkbox checked={selectedRoles.indexOf(role.name) > -1} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignRoleModal}>Cancel</Button>
          <Button onClick={handleAssignRole}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isChangePasswordModalOpen} onClose={closeChangePasswordModal}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeChangePasswordModal}>Cancel</Button>
          <Button onClick={handleChangePassword}>Change</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default User;
