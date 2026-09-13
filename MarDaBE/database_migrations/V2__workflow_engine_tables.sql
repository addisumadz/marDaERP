-- =====================================================
-- V2__workflow_engine_tables.sql
-- Dynamic Role Assignment & Approval Workflow Engine
-- =====================================================

-- 1. Multi-role support: junction table for user ↔ role (many-to-many)
-- Keeps existing user_account.role_id as primary role for backward compatibility
CREATE TABLE IF NOT EXISTS user_account_role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_account_id INT NOT NULL,
    user_role_id INT NOT NULL,
    branch_id INT,
    assigned_by VARCHAR(100),
    assigned_at DATETIME DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY uk_user_role_branch (user_account_id, user_role_id, branch_id),
    FOREIGN KEY (user_account_id) REFERENCES user_account(id),
    FOREIGN KEY (user_role_id) REFERENCES user_role(id)
);

-- 2. Workflow templates: defines a named workflow for a document type
CREATE TABLE IF NOT EXISTS wf_workflow_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_code VARCHAR(50) NOT NULL UNIQUE,
    template_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 3. Workflow steps: ordered approval steps within a template
CREATE TABLE IF NOT EXISTS wf_workflow_step (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    step_order INT NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    step_name_am VARCHAR(200),
    approver_role_code VARCHAR(20) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    auto_approve_below DECIMAL(15,2),
    sla_hours INT DEFAULT 48,
    can_reject BOOLEAN DEFAULT TRUE,
    notify_on_arrival BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (template_id) REFERENCES wf_workflow_template(id) ON DELETE CASCADE
);

-- 4. Workflow instances: tracks progress of a specific document through its workflow
CREATE TABLE IF NOT EXISTS wf_workflow_instance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_id BIGINT NOT NULL,
    document_number VARCHAR(50),
    current_step_id INT,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    initiated_by VARCHAR(100),
    initiated_at DATETIME DEFAULT NOW(),
    completed_at DATETIME,
    total_amount DECIMAL(15,2),
    branch_id INT,
    FOREIGN KEY (template_id) REFERENCES wf_workflow_template(id),
    FOREIGN KEY (current_step_id) REFERENCES wf_workflow_step(id),
    INDEX idx_wfi_doc (document_type, document_id),
    INDEX idx_wfi_status (status)
);

-- 5. Workflow actions: audit trail of every approve/reject/return action
CREATE TABLE IF NOT EXISTS wf_workflow_action (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    instance_id BIGINT NOT NULL,
    step_id INT NOT NULL,
    action VARCHAR(20) NOT NULL,
    acted_by VARCHAR(100) NOT NULL,
    acted_at DATETIME DEFAULT NOW(),
    comments VARCHAR(500),
    FOREIGN KEY (instance_id) REFERENCES wf_workflow_instance(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES wf_workflow_step(id)
);

-- =====================================================
-- DEFAULT SEED DATA: Pre-configured workflow templates
-- =====================================================

-- PR Approval: Requester → Dept. Manager → Finance → Purchase Officer
INSERT INTO wf_workflow_template (template_code, template_name, document_type, description, created_by) VALUES
('PR_APPROVAL', 'Purchase Requisition Approval', 'PURCHASE_REQUISITION', 'Standard 3-step approval for purchase requisitions', 'system');

SET @pr_tmpl_id = LAST_INSERT_ID();

INSERT INTO wf_workflow_step (template_id, step_order, step_name, step_name_am, approver_role_code, is_required, min_amount, sla_hours) VALUES
(@pr_tmpl_id, 1, 'Department Manager Approval', 'የክፍል ሃላፊ ፈቃድ', 'INV_MANAGER', TRUE, NULL, 24),
(@pr_tmpl_id, 2, 'Finance Manager Approval', 'የፋይናንስ ሃላፊ ፈቃድ', 'FNC', TRUE, NULL, 48),
(@pr_tmpl_id, 3, 'Purchase Officer Review', 'የግዥ ባለሙያ ግምገማ', 'INV_PURCHASER', TRUE, NULL, 24);

-- PO Approval: Finance → General Manager
INSERT INTO wf_workflow_template (template_code, template_name, document_type, description, created_by) VALUES
('PO_APPROVAL', 'Purchase Order Approval', 'PURCHASE_ORDER', 'Finance and GM approval for purchase orders', 'system');

SET @po_tmpl_id = LAST_INSERT_ID();

INSERT INTO wf_workflow_step (template_id, step_order, step_name, step_name_am, approver_role_code, is_required, min_amount, sla_hours) VALUES
(@po_tmpl_id, 1, 'Finance Manager Approval', 'የፋይናንስ ሃላፊ ፈቃድ', 'FNC', TRUE, NULL, 48),
(@po_tmpl_id, 2, 'General Manager Approval', 'ዋና ስራ አስኪያጅ ፈቃድ', 'billzgjt', FALSE, 50000, 48);

-- Stock Transfer Approval: Source Manager → Destination Manager
INSERT INTO wf_workflow_template (template_code, template_name, document_type, description, created_by) VALUES
('TRANSFER_APPROVAL', 'Stock Transfer Approval', 'STOCK_TRANSFER', 'Manager approval for inter-store transfers', 'system');

SET @tr_tmpl_id = LAST_INSERT_ID();

INSERT INTO wf_workflow_step (template_id, step_order, step_name, step_name_am, approver_role_code, is_required, sla_hours) VALUES
(@tr_tmpl_id, 1, 'Store Manager Approval', 'የመጋዘን ሃላፊ ፈቃድ', 'INV_MANAGER', TRUE, 24);

-- Stock Adjustment Approval: Store Manager → Finance
INSERT INTO wf_workflow_template (template_code, template_name, document_type, description, created_by) VALUES
('ADJUSTMENT_APPROVAL', 'Stock Adjustment Approval', 'STOCK_ADJUSTMENT', 'Manager and finance approval for adjustments', 'system');

SET @adj_tmpl_id = LAST_INSERT_ID();

INSERT INTO wf_workflow_step (template_id, step_order, step_name, step_name_am, approver_role_code, is_required, sla_hours) VALUES
(@adj_tmpl_id, 1, 'Store Manager Approval', 'የመጋዘን ሃላፊ ፈቃድ', 'INV_MANAGER', TRUE, 24),
(@adj_tmpl_id, 2, 'Finance Approval', 'የፋይናንስ ፈቃድ', 'FNC', TRUE, 48);

-- Issue Voucher Approval: Department Manager
INSERT INTO wf_workflow_template (template_code, template_name, document_type, description, created_by) VALUES
('ISSUE_APPROVAL', 'Issue Voucher Approval', 'ISSUE_VOUCHER', 'Manager approval for material issues', 'system');

SET @iss_tmpl_id = LAST_INSERT_ID();

INSERT INTO wf_workflow_step (template_id, step_order, step_name, step_name_am, approver_role_code, is_required, sla_hours) VALUES
(@iss_tmpl_id, 1, 'Department Manager Approval', 'የክፍል ሃላፊ ፈቃድ', 'INV_MANAGER', TRUE, 24);
