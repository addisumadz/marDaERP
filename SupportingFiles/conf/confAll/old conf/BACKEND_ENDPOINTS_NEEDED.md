# Backend Endpoints Required for Bank Payment Import

## Overview
The CSV bank payment import feature requires the following backend endpoints to be implemented in your Spring Boot application.

## Required Endpoints

### 1. Bulk Update Bank Payments
**Endpoint:** `PUT /api/billing-readings/bulk-update-bank-payments`

**Description:** Updates multiple BillingReading records with bank payment information.

**Request Body:**
```json
{
  "updates": [
    {
      "id": 123,
      "updates": {
        "tekilalaYetekefele": 150.00,
        "tekilalaBankYetekefele": 100.00,
        "isPaidThroughBank": true,
        "isDerashPaid": true,
        "moneyCollectedDate": "2025-09-28T15:30:00.000Z",
        "bankPaidConfirmationCode": "TT252558XTL5",
        "bankPaidAgentId": "116347"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "updatedCount": 1,
  "message": "Successfully updated 1 payment records"
}
```

### 2. Single Update Bank Payment (Alternative)
**Endpoint:** `PUT /api/billing-readings/{id}/bank-payment`

**Description:** Updates a single BillingReading record with bank payment information.

**Path Parameters:**
- `id`: The ID of the BillingReading record

**Request Body:**
```json
{
  "tekilalaYetekefele": 150.00,
  "tekilalaBankYetekefele": 100.00,
  "isPaidThroughBank": true,
  "isDerashPaid": true,
  "moneyCollectedDate": "2025-09-28T15:30:00.000Z",
  "bankPaidConfirmationCode": "TT252558XTL5",
  "bankPaidAgentId": "116347"
}
```

## Field Mappings

The CSV import maps the following fields from CSV to BillingReading entity:

| CSV Field | BillingReading Field | Description |
|-----------|---------------------|-------------|
| `paid_amount` | `tekilalaBankYetekefele` | Amount paid through bank |
| `paid_amount` + `kecreditYetekefele` | `tekilalaYetekefele` | Total amount payable |
| `paid_date` | `moneyCollectedDate` | Date when payment was collected |
| `agent_confirmation_code` | `bankPaidConfirmationCode` | Bank confirmation code |
| `agent_name` | `bankPaidAgentId` | Bank agent ID |
| - | `isPaidThroughBank` | Set to `true` |
| - | `isDerashPaid` | Set to `true` |

## Validation Rules

The backend should validate:

1. **Record exists**: The BillingReading record with the given ID must exist
2. **Not already paid**: The record should not already have `isDerashPaid` or `isPaidThroughBank` set to true
3. **Valid amounts**: Payment amounts should be positive numbers
4. **Valid date**: `moneyCollectedDate` should be a valid date
5. **Required fields**: All required fields should be present

## Error Handling

The endpoints should return appropriate HTTP status codes:

- `200 OK`: Successful update
- `400 Bad Request`: Invalid request data or validation errors
- `404 Not Found`: BillingReading record not found
- `409 Conflict`: Record already paid through bank
- `500 Internal Server Error`: Server error

## Example Controller Implementation

```java
@RestController
@RequestMapping("/api/billing-readings")
public class BillingReadingController {

    @Autowired
    private BillingReadingService billingReadingService;

    @PutMapping("/bulk-update-bank-payments")
    public ResponseEntity<?> bulkUpdateBankPayments(@RequestBody BulkUpdateRequest request) {
        try {
            int updatedCount = billingReadingService.bulkUpdateBankPayments(request.getUpdates());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "updatedCount", updatedCount,
                "message", "Successfully updated " + updatedCount + " payment records"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/bank-payment")
    public ResponseEntity<?> updateBankPayment(@PathVariable Long id, @RequestBody BankPaymentUpdate update) {
        try {
            BillingReading updated = billingReadingService.updateBankPayment(id, update);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
```

## Notes

1. The frontend expects the bulk update endpoint to handle multiple records in a single request for better performance.
2. Make sure to handle transactions properly to ensure data consistency.
3. Consider adding audit logging for payment updates.
4. The `bankPaidAgentId` field should match the bank codes used in your billing banks system.
