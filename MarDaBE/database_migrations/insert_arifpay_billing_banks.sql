-- ============================================================================
-- ArifPay Supported Payment Channels & Banks for 'billing_banks' Table
-- Gateway Code: 'Arifpay'
-- ============================================================================

INSERT INTO `billing_banks` 
(`gateway_code`, `bank_code`, `bank_name`, `bank_color`, `total_yetekefele_report`, `total_tekefay_report`, `deleted`)
VALUES
('Arifpay', 'TELEBIRR',     'Telebirr',                        'teal',            0.0, 0.0, 'active'),
('Arifpay', 'CBE',          'CBE Birr',                        'purple',          0.0, 0.0, 'active'),
('Arifpay', 'BOA',          'Bank of Abyssinia',               'gold',            0.0, 0.0, 'active'),
('Arifpay', 'AWASH',        'Awash Bank',                      'deepskyblue',     0.0, 0.0, 'active'),
('Arifpay', 'MPESA',        'M-Pesa',                          'crimson',         0.0, 0.0, 'active'),
('Arifpay', 'DASHEN',       'Dashen Bank',                     'navy',            0.0, 0.0, 'active'),
('Arifpay', 'AMHARA',       'Amhara Bank',                     'dodgerblue',      0.0, 0.0, 'active'),
('Arifpay', 'WEGAGEN',      'Wegagen Bank',                    'salmon',          0.0, 0.0, 'active'),
('Arifpay', 'COOPAY',       'Coopay (Coop Bank of Oromia)',    'darkgreen',       0.0, 0.0, 'active'),
('Arifpay', 'KAAFI_EBIRR',  'Kaafi E-Birr',                    'darkcyan',        0.0, 0.0, 'active'),
('Arifpay', 'NIB_EBIRR',    'Nib Bank E-Birr',                 'orange',          0.0, 0.0, 'active'),
('Arifpay', 'AHADU_EBIRR',  'Ahadu Bank E-Birr',               'chocolate',       0.0, 0.0, 'active'),
('Arifpay', 'ZAMZAM',       'Zamzam Bank',                     'mediumseagreen',  0.0, 0.0, 'active'),
('Arifpay', 'KACHA',        'Kacha Digital',                   'darkviolet',      0.0, 0.0, 'active'),
('Arifpay', 'YAYA',         'Yaya Wallet',                     'mediumslateblue', 0.0, 0.0, 'active'),
('Arifpay', 'BINGET',       'Binget',                          'coral',           0.0, 0.0, 'active'),
('Arifpay', 'CARD',         'Debit / Credit Card',             'slategray',       0.0, 0.0, 'active'),
('Arifpay', 'ARIFPAY',      'ArifPay (General)',               'royalblue',       0.0, 0.0, 'active');

