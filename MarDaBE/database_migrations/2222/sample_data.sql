-- ========================================================
-- 1. UNITS OF MEASURE (UOM)
-- ========================================================
INSERT INTO inv_unit_of_measure (unit_code, unit_name, unit_name_am, is_active, deleted, created_by)
VALUES 
  ('PCS',  'Pieces',       'ብዛት',    1, 'No', 'admin'),
  ('MTR',  'Meters',       'ሜትር',    1, 'No', 'admin'),
  ('ROLL', 'Rolls',        'ሮል',     1, 'No', 'admin'),
  ('KG',   'Kilograms',    'ኪ.ግ',    1, 'No', 'admin'),
  ('LTR',  'Liters',       'ሊትር',    1, 'No', 'admin'),
  ('BAG',  'Bags',         'ከረጢት',  1, 'No', 'admin'),
  ('DRUM', 'Drums',        'በርሜል',  1, 'No', 'admin'),
  ('ACT',  'Activity/Job', 'ተግባር',   1, 'No', 'admin')
ON DUPLICATE KEY UPDATE unit_name = VALUES(unit_name);

-- ========================================================
-- 2. ITEM CATEGORIES
-- ========================================================
INSERT INTO inv_item_category (category_code, category_name, category_name_am, description, item_type, tracking_type, is_active, deleted, created_by)
VALUES
  ('MTR',  'Water Meters',              'የውሃ ቆጣሪዎች',             'Residential and industrial water meters',         'STOCK',     'SERIAL', 1, 'No', 'admin'),
  ('PIPE', 'Pipes & Conduits',          'ቧንቧዎች',                  'HDPE, uPVC, and GI pipeline materials',           'STOCK',     'NONE',   1, 'No', 'admin'),
  ('FIT',  'Pipe Fittings & Adapters',  'የቧንቧ ማገናኛ እቃዎች',      'Compression fittings, saddles, and adapters',     'STOCK',     'NONE',   1, 'No', 'admin'),
  ('VALV', 'Valves & Flow Controls',    'ቫልቮችና መቆጣጠሪያዎች',       'Gate valves, ball valves, and air release valves', 'STOCK',     'NONE',   1, 'No', 'admin'),
  ('CHEM', 'Water Treatment Chemicals', 'የውሃ ማከሚያ ኬሚካሎች',       'Disinfection chlorine, alum, and lab reagents',    'STOCK',     'EXPIRY', 1, 'No', 'admin'),
  ('TOOL', 'Tools & Jointing Supplies', 'የስራ መሳሪያዎችና ማሸጊያዎች', 'Teflon tape, gaskets, wrenches, and toolkits',    'STOCK',     'NONE',   1, 'No', 'admin'),
  ('SRV',  'Utility Services',          'የውሃ አገልግሎቶች',           'Connection fees, meter testing, and lab services','SERVICE',   'NONE',   1, 'No', 'admin')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- ========================================================
-- 3. ITEM GROUPS
-- ========================================================
-- Groups for MTR
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'DOM-MTR', 'Domestic / Residential Meters', 'የመኖሪያ ቤት ቆጣሪ', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'MTR'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'IND-MTR', 'Commercial & Industrial Meters', 'የንግድና ኢንዱስትሪ ቆጣሪ', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'MTR'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- Groups for PIPE
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'HDPE-P', 'HDPE Pressure Pipes', 'HDPE ቧንቧዎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'PIPE'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'uPVC-P', 'uPVC Pressure Pipes', 'uPVC ቧንቧዎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'PIPE'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'GI-P', 'Galvanized Iron Pipes', 'የብረት ቧንቧዎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'PIPE'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- Groups for FIT
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'COMP-F', 'HDPE Compression Fittings', 'የኮምፕረሽን ማገናኛዎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'FIT'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'GI-F', 'Galvanized Iron Fittings', 'የብረት ማገናኛዎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'FIT'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'SADDLE', 'Clamp Saddles', 'ክላምፕ ሳድሎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'FIT'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- Groups for VALV
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'BALL-V', 'Brass Ball Valves', 'ቦል ቫልቭ', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'VALV'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'GATE-V', 'Gate & Sluice Valves', 'ጌት ቫልቭ', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'VALV'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- Groups for CHEM
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'DISINF', 'Chlorine Disinfectants', 'የውሃ ማከሚያ ክሎሪን', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'CHEM'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'COAG', 'Coagulants & Flocculants', 'ኮአጉላንትና አሉም', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'CHEM'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- Groups for TOOL
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'SEAL', 'Sealants & Gaskets', 'የማሸጊያ እቃዎች', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'TOOL'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- Groups for SRV
INSERT INTO inv_item_group (category_id, group_code, group_name, group_name_am, is_active, deleted, created_by)
SELECT id, 'CUST-SRV', 'Customer Connection & Lab Services', 'የደንበኞችና ላቦራቶሪ አገልግሎት', 1, 'No', 'admin' FROM inv_item_category WHERE category_code = 'SRV'
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

-- ========================================================
-- 4. ITEMS MASTER
-- ========================================================
-- Water Meter Items (Note: is_water_meter = 1)
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'MTR-00001', '1/2" Multi-jet Dry Dial Water Meter', '1/2" ባለደረቅ የውሃ ቆጣሪ', 'Class B domestic brass meter',
  c.id, g.id, u.id, 50, 200, 'SERIAL', 'BOTH', 3200.00, 1, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'DOM-MTR'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'MTR'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'MTR-00002', '3/4" Multi-jet Water Meter', '3/4" የውሃ ቆጣሪ', 'Class B residential water meter',
  c.id, g.id, u.id, 20, 50, 'SERIAL', 'BOTH', 4500.00, 1, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'DOM-MTR'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'MTR'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'MTR-00003', '2" Industrial Flanged Bulk Water Meter', '2" የኢንዱስትሪ ፍላንጅ ቆጣሪ', 'Woltman turbine bulk meter',
  c.id, g.id, u.id, 5, 10, 'SERIAL', 'BOTH', 24500.00, 1, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'IND-MTR'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'MTR'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- Pipes
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'PIPE-00001', 'HDPE Pipe OD 25mm PN16 (Roll)', 'HDPE ቧንቧ 25ሚሜ PN16 ሮል', 'Service connection pipe 100m roll',
  c.id, g.id, u.id, 10, 50, 'NONE', 'BOTH', 7800.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'HDPE-P'
JOIN inv_unit_of_measure u ON u.unit_code = 'ROLL'
WHERE c.category_code = 'PIPE'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'PIPE-00002', 'uPVC Pressure Pipe 2" PN10 (6m)', 'uPVC ቧንቧ 2 ኢንች PN10 6 ሜትር', 'Main distribution pipe',
  c.id, g.id, u.id, 100, 300, 'NONE', 'BOTH', 1450.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'uPVC-P'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'PIPE'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- Fittings
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'FIT-00001', 'HDPE Male Adaptor 25mm x 3/4"', 'HDPE ወንድ አስማሚ 25ሚሜ x 3/4"', 'Compression male adaptor for meter connection',
  c.id, g.id, u.id, 200, 500, 'NONE', 'BOTH', 185.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'COMP-F'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'FIT'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'FIT-00002', 'Clamp Saddle 63mm x 3/4"', 'ክላምፕ ሳድል 63ሚሜ x 3/4"', 'Tapping saddle for service connection',
  c.id, g.id, u.id, 50, 150, 'NONE', 'BOTH', 420.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'SADDLE'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'FIT'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- Valves
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'VALV-00001', 'Brass Lockable Ball Valve 1/2"', 'ቆጣሪ መቆለፊያ ቦል ቫልቭ 1/2"', 'Lockable valve installed before water meter',
  c.id, g.id, u.id, 100, 300, 'NONE', 'BOTH', 550.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'BALL-V'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'VALV'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- Chemicals (Expiry Tracking)
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'CHEM-00001', 'Calcium Hypochlorite 65% Chlorine (45kg)', 'ክሎሪን ዱቄት 65% (45ኪ.ግ)', 'Disinfectant powder for reservoir treatment',
  c.id, g.id, u.id, 15, 40, 'EXPIRY', 'COMPANY_USE', 18500.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'DISINF'
JOIN inv_unit_of_measure u ON u.unit_code = 'DRUM'
WHERE c.category_code = 'CHEM'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'CHEM-00002', 'Aluminum Sulphate (Alum) Powder 50kg', 'የውሃ ማርጊያ አሉም 50ኪ.ግ', 'Coagulant for water clarification',
  c.id, g.id, u.id, 20, 50, 'EXPIRY', 'COMPANY_USE', 6200.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'COAG'
JOIN inv_unit_of_measure u ON u.unit_code = 'BAG'
WHERE c.category_code = 'CHEM'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- Tools & Consumables
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'TOOL-00001', 'Teflon Thread Seal Tape 19mm', 'ቴፍሎን የማሸጊያ ቴፕ 19ሚሜ', 'Thread sealant for pipe connections',
  c.id, g.id, u.id, 300, 1000, 'NONE', 'BOTH', 45.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'SEAL'
JOIN inv_unit_of_measure u ON u.unit_code = 'PCS'
WHERE c.category_code = 'TOOL'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- Services
INSERT INTO inv_item (
  item_code, item_name, item_name_am, description, category_id, item_group_id, 
  unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, 
  default_unit_cost, is_water_meter, is_active, deleted, created_by
)
SELECT 
  'SRV-00001', 'New Customer Water Line Installation Labor', 'አዲስ የውሃ መስመር ዝርጋታ የጉልበት ክፍያ', 'Standard connection fee for residential customer',
  c.id, g.id, u.id, 0, 0, 'NONE', 'FOR_SALE', 1500.00, 0, 1, 'No', 'admin'
FROM inv_item_category c
JOIN inv_item_group g ON g.group_code = 'CUST-SRV'
JOIN inv_unit_of_measure u ON u.unit_code = 'ACT'
WHERE c.category_code = 'SRV'
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);
