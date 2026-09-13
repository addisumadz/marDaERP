✅ **IMPORTANT: Backend Port Updated!**

Your backend runs on port **8082** (not 8080).

I've updated all the configuration files to use the correct port:

- ✅ `mobile_src_config.js` → Port changed to 8082
- ✅ `START_HERE.md` → Documentation updated
- ✅ `MANUAL_SETUP_STEPS.md` → Documentation updated

---

## Quick Reference

**Your Backend URL:**
```
http://YOUR_IP:8082/Billing_Inventory/billing
```

**Example:**
```
http://192.168.1.100:8082/Billing_Inventory/billing
```

**After you get your IP address (run `ipconfig`), update:**
- File: `src\constants\config.js`
- Line 5: Change IP only (port is already 8082)

---

## Test Backend

Before running the mobile app, verify backend is accessible:

```
http://localhost:8082/Billing_Inventory/billing/haddress1
```

Should return JSON data with address list.

---

You're all set! Continue with the setup steps in **START_HERE.md**
