# Asset Types Management System

## Overview
The Asset Types Management system provides a complete CRUD (Create, Read, Update, Delete) interface for managing asset types in the laboratory quality control system. This system is only accessible to users with admin role.

## Features

### 1. Main Asset Types Page (`/asset-types/main`)
- **View all asset types** in a responsive table format
- **Search functionality** to filter asset types by name
- **Status indicators** showing active/deleted status
- **Quick actions** for edit and delete operations
- **Associated asset display** showing which asset each type belongs to

### 2. Create Asset Type (`/asset-types/create`)
- **Form validation** for required fields
- **Asset selection** dropdown with all available assets
- **Real-time error handling** and user feedback
- **Responsive design** for mobile and desktop

### 3. Edit Asset Type (`/asset-types/edit/{id}`)
- **Pre-populated form** with existing data
- **Same validation** as create form
- **Update functionality** with success/error handling

### 4. Delete Asset Type
- **Confirmation dialog** before deletion
- **Soft delete support** (is_deleted flag)
- **Cascade protection** for related records

## Database Schema

### AssetTypes Table
```sql
- id (Primary Key)
- asset_id (Foreign Key to assets table)
- asset_type_name (String)
- is_deleted (Boolean, default: false)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Relationships

### AssetType Model Relationships
- **belongsTo Asset**: Each asset type belongs to one asset
- **hasMany ControlType**: Each asset type can have multiple control types

### Asset Model Relationships
- **hasOne AssetType**: Each asset has one asset type

## Access Control

### Admin Middleware
All asset type management routes are protected by the `AdminMiddleware` which ensures:
- User is authenticated
- User has `admin` role
- Returns 403 Forbidden for unauthorized access

## Routes

| Method | Route | Controller Method | Description |
|--------|-------|-------------------|-------------|
| GET | `/asset-types/main` | `AssetTypesMain` | Display all asset types |
| GET | `/asset-types/create` | `AssetTypesCreate` | Show create form |
| POST | `/asset-types/store` | `AssetTypesStore` | Store new asset type |
| GET | `/asset-types/edit/{id}` | `AssetTypesEdit` | Show edit form |
| POST | `/asset-types/update/{id}` | `AssetTypesUpdate` | Update asset type |
| DELETE | `/asset-types/{id}` | `AssetTypesDestroy` | Delete asset type |

## Frontend Components

### Pages
1. **`main.tsx`** - Main listing page with table and search
2. **`create.tsx`** - Create new asset type form
3. **`edit.tsx`** - Edit existing asset type form

### Features
- **Material-UI components** for consistent design
- **Responsive layout** for mobile and desktop
- **Form validation** with real-time feedback
- **Search and filter** functionality
- **Confirmation dialogs** for destructive actions
- **Loading states** and error handling

## Usage Instructions

### For Administrators

1. **Access the System**
   - Login with admin credentials
   - Navigate to "Asset Types" in the sidebar menu

2. **View Asset Types**
   - All asset types are displayed in a table
   - Use the search bar to filter by name
   - Click "Reset" to clear search filters

3. **Create New Asset Type**
   - Click "Add Asset Type" button
   - Select an associated asset from the dropdown
   - Enter a descriptive name for the asset type
   - Click "Create Asset Type" to save

4. **Edit Asset Type**
   - Click the edit icon (pencil) next to any asset type
   - Modify the asset type name or associated asset
   - Click "Update Asset Type" to save changes

5. **Delete Asset Type**
   - Click the delete icon (trash) next to any asset type
   - Confirm deletion in the dialog
   - Asset type will be marked as deleted

### Navigation
The Asset Types management is accessible through:
- **Sidebar Menu**: "Asset Types" under the Management section
- **Direct URL**: `/asset-types/main`

## Error Handling

### Validation Errors
- **Client-side validation** for immediate feedback
- **Server-side validation** for data integrity
- **Error messages** displayed inline with form fields

### Access Control
- **403 Forbidden** for non-admin users
- **Authentication required** for all routes

## Future Enhancements

### Potential Improvements
1. **Bulk operations** for multiple asset types
2. **Advanced filtering** by asset, status, date range
3. **Export functionality** for asset type data
4. **Audit trail** for tracking changes
5. **Soft delete recovery** functionality

### Integration Points
- **Control Types**: Asset types can be extended to manage control types
- **Asset Management**: Integration with asset creation/editing
- **Reporting**: Asset type analytics and reporting

## Technical Notes

### Dependencies
- **Laravel 10+** for backend
- **Inertia.js** for SPA-like experience
- **React 18+** for frontend
- **Material-UI** for UI components
- **TypeScript** for type safety

### File Structure
```
app/
├── Http/Controllers/WebController.php (Asset Type methods)
├── Models/AssetType.php
└── Http/Middleware/AdminMiddleware.php

resources/js/pages/asset-types/
├── main.tsx
├── create.tsx
└── edit.tsx

routes/web.php (Asset Type routes)
```

### Security Considerations
- **CSRF protection** on all forms
- **Input validation** and sanitization
- **Role-based access control**
- **SQL injection prevention** through Eloquent ORM 