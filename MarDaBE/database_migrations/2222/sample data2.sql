-- ====================================================================
-- 1. SEED MAINTENANCE TYPES (if not already present)
-- ====================================================================
INSERT INTO custom_maintenance_type (type_code, type_name, type_name_am, description, display_order, is_active)
VALUES
  ('PIPE_LEAKAGE',      'Pipe Leakage Repair',               'የቧንቧ ፍሳሽ ጥገና',          'Repair of leaking HDPE / GI pipes and fittings', 1, 1),
  ('METER_REPLACE',     'Water Meter Replacement / Repair',  'የውሃ ቆጣሪ ቅያሬ / ጥገና',     'Replacement of broken, stuck, or aged water meter', 2, 1),
  ('GATE_VALVE',        'Gate Valve & Fitting Repair',       'የጌት ቫልቭ እና ማገናኛ ጥገና',  'Servicing and replacing worn-out valves and nipples', 3, 1),
  ('LINE_BURST',        'Main Line Breakdown Repair',        'የዋና መስመር መቆራረጥ ጥገና',   'Urgent line burst repair, reconnection and replacement', 4, 1),
  ('OTHER_MAINTENANCE', 'General / Other Maintenance',       'አጠቃላይ / ሌሎች ጥገናዎች',    'Other miscellaneous customer site water maintenance', 5, 1)
ON DUPLICATE KEY UPDATE type_name = VALUES(type_name);

-- ====================================================================
-- 2. NEW LINE CONNECTION COMMON MATERIALS (custom_common_material)
-- ====================================================================
DELETE FROM custom_common_material WHERE inv_item_id IS NOT NULL;

INSERT INTO custom_common_material (
  inv_item_id, material_code, material_name, material_name_am, unit_of_measure, 
  default_unit_price, display_order, is_active
)
SELECT 
  i.id, i.item_code, i.item_name, i.item_name_am, u.unit_name, 
  i.default_unit_cost, 1, 1
FROM inv_item i JOIN inv_unit_of_measure u ON u.id = i.unit_of_measure_id
WHERE i.item_code = 'MTR-00001';

INSERT INTO custom_common_material (
  inv_item_id, material_code, material_name, material_name_am, unit_of_measure, 
  default_unit_price, display_order, is_active
)
SELECT 
  i.id, i.item_code, i.item_name, i.item_name_am, u.unit_name, 
  i.default_unit_cost, 2, 1
FROM inv_item i JOIN inv_unit_of_measure u ON u.id = i.unit_of_measure_id
WHERE i.item_code = 'VALV-00001';

INSERT INTO custom_common_material (
  inv_item_id, material_code, material_name, material_name_am, unit_of_measure, 
  default_unit_price, display_order, is_active
)
SELECT 
  i.id, i.item_code, i.item_name, i.item_name_am, u.unit_name, 
  i.default_unit_cost, 3, 1
FROM inv_item i JOIN inv_unit_of_measure u ON u.id = i.unit_of_measure_id
WHERE i.item_code = 'FIT-00002';

INSERT INTO custom_common_material (
  inv_item_id, material_code, material_name, material_name_am, unit_of_measure, 
  default_unit_price, display_order, is_active
)
SELECT 
  i.id, i.item_code, i.item_name, i.item_name_am, 'ሜትር', 
  78.00, 4, 1
FROM inv_item i WHERE i.item_code = 'PIPE-00001';

INSERT INTO custom_common_material (
  inv_item_id, material_code, material_name, material_name_am, unit_of_measure, 
  default_unit_price, display_order, is_active
)
SELECT 
  i.id, i.item_code, i.item_name, i.item_name_am, u.unit_name, 
  i.default_unit_cost, 5, 1
FROM inv_item i JOIN inv_unit_of_measure u ON u.id = i.unit_of_measure_id
WHERE i.item_code = 'FIT-00001';

INSERT INTO custom_common_material (
  inv_item_id, material_code, material_name, material_name_am, unit_of_measure, 
  default_unit_price, display_order, is_active
)
SELECT 
  i.id, i.item_code, i.item_name, i.item_name_am, u.unit_name, 
  i.default_unit_cost, 6, 1
FROM inv_item i JOIN inv_unit_of_measure u ON u.id = i.unit_of_measure_id
WHERE i.item_code = 'TOOL-00001';

-- ====================================================================
-- 3. MAINTENANCE COMMON MATERIALS (custom_maintenance_common_material)
-- ====================================================================
DELETE FROM custom_maintenance_common_material WHERE inv_item_id IS NOT NULL;

-- 3.1 PIPE_LEAKAGE (የቧንቧ ፍሳሽ ጥገና)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'ሜትር', 78.00, 1, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'PIPE_LEAKAGE' AND i.item_code = 'PIPE-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 2, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'PIPE_LEAKAGE' AND i.item_code = 'FIT-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 3, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'PIPE_LEAKAGE' AND i.item_code = 'FIT-00002';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 4, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'PIPE_LEAKAGE' AND i.item_code = 'TOOL-00001';

-- 3.2 METER_REPLACE (የውሃ ቆጣሪ ቅያሬ / ጥገና)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 1, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'METER_REPLACE' AND i.item_code = 'MTR-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 2, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'METER_REPLACE' AND i.item_code = 'VALV-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 3, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'METER_REPLACE' AND i.item_code = 'FIT-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 4, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'METER_REPLACE' AND i.item_code = 'TOOL-00001';

-- 3.3 GATE_VALVE (የጌት ቫልቭ እና ማገናኛ ጥገና)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 1, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'GATE_VALVE' AND i.item_code = 'VALV-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 2, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'GATE_VALVE' AND i.item_code = 'FIT-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 3, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'GATE_VALVE' AND i.item_code = 'TOOL-00001';

-- 3.4 LINE_BURST (የዋና መስመር መቆራረጥ ጥገና)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 1, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'LINE_BURST' AND i.item_code = 'PIPE-00002';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'ሜትር', 78.00, 2, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'LINE_BURST' AND i.item_code = 'PIPE-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 3, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'LINE_BURST' AND i.item_code = 'FIT-00002';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 4, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'LINE_BURST' AND i.item_code = 'TOOL-00001';

-- 3.5 OTHER_MAINTENANCE (አጠቃላይ / ሌሎች ጥገናዎች)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 1, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'OTHER_MAINTENANCE' AND i.item_code = 'MTR-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'ሜትር', 78.00, 2, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'OTHER_MAINTENANCE' AND i.item_code = 'PIPE-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 3, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'OTHER_MAINTENANCE' AND i.item_code = 'VALV-00001';

INSERT INTO custom_maintenance_common_material (maintenance_type_id, inv_item_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order, is_active)
SELECT t.id, i.id, i.item_code, i.item_name, i.item_name_am, 'በቁጥር', i.default_unit_cost, 4, 1
FROM custom_maintenance_type t, inv_item i WHERE t.type_code = 'OTHER_MAINTENANCE' AND i.item_code = 'TOOL-00001';
