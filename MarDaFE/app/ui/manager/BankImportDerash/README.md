# Bank Import - Derash Page

This page provides a dedicated interface for importing bank payment data from the Derash API system. It mirrors the functionality of the "Import Bank Payments" button from the billList page but provides a standalone, step-by-step workflow.

## Features

### 1. **Step-by-Step Workflow**
- **Step 1**: Select date range and fetch CSV data from Derash API
- **Step 2**: Process the fetched CSV data to categorize payments
- **Step 3**: Apply new payments to update bills in the database

### 2. **Real-time Feedback**
- Success/error notifications for each step
- Loading indicators during API calls
- Clear status messages and validation

### 3. **Results Display**
- **New Payments**: Ready to be applied (shown in detailed table)
- **Already Paid**: Previously processed payments
- **Not Found**: Bill IDs not found in system
- **Duplicates**: Duplicate entries in CSV

### 4. **Data Table**
- Interactive table showing new payments with:
  - Invoice Number
  - Customer Name
  - Payment Period (Kifya Wer)
  - Amount Due vs Paid Amount
  - Agent/Bank information
  - Confirmation Code
  - Payment Date

## Usage Instructions

### Step 1: Fetch Payment Data
1. Select **From Date** and **To Date** (Gregorian format: YYYY-MM-DD)
2. Click **"Fetch CSV"** button
3. Wait for success confirmation

### Step 2: Process CSV Data
1. After successful fetch, click **"Process CSV"** button
2. Review the processing results summary
3. Check the categorized payment counts

### Step 3: Apply New Payments
1. If new payments are found, click **"Apply X Payments"** button
2. Confirm the bulk update operation
3. Bills will be marked as paid through bank

### Reset/Start Over
- Use **"Reset / Start Over"** button to clear all data and start fresh

## Technical Implementation

### Backend Integration
- Uses existing Derash API endpoints:
  - `POST /api/card_managenment/bank-payments/fetch`
  - `POST /api/card_managenment/bank-payments/process`
  - `PUT /api/card_managenment/bulk-update-bank-payments`

### CSV Format Support
- Supports new extended CSV format:
  ```csv
  bill_data_file_id,bill_id,bill_reason,customer_id,customer_name,paid_amount,paid_date,agent_name,agent_confirmation_code
  ```

### Field Mapping
- **billingCustomerInfo.accountNumber** ↔ CSV `customer_id`
- **billingInvoiceNumbers** ↔ CSV `bill_id`
- **bankPaidAgentId** ↔ CSV `agent_name`

### Lookup Strategy
1. First tries to find bills by `bill_id` (invoice number)
2. Falls back to `customer_id` (account number) if not found
3. Categorizes results appropriately

## Navigation

The page is accessible via:
- **Sidebar Menu**: Manager section → "Bank Import - Derash"
- **Direct URL**: `/ui/manager/BankImportDerash`

## Permissions

Requires manager-level permissions to access the bank payment import functionality.

## Error Handling

- **Validation**: Ensures date range is selected before fetch
- **API Errors**: Displays specific error messages from backend
- **File Not Found**: Clear message if CSV needs to be fetched first
- **Network Issues**: Graceful error handling with user feedback

## Differences from billList Implementation

1. **Dedicated Interface**: Standalone page vs modal popup
2. **Step-by-Step Flow**: Guided workflow vs single action
3. **Enhanced Feedback**: More detailed status and progress indicators
4. **Better Visibility**: Full-screen table views for results
5. **Reset Capability**: Easy way to start over without page refresh

This page provides a more user-friendly and comprehensive interface for bank payment imports compared to the modal-based approach in the billList page.
