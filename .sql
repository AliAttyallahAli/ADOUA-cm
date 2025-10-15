-- Script de création de la base de données ADOUAS-MC
-- Micro Crédit Management System

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'chef_operation', 'caissier', 'agent')),
    phone TEXT,
    photo TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Côte d\'Ivoire',
    date_of_birth DATE,
    cin TEXT UNIQUE NOT NULL,
    profession TEXT,
    photo TEXT,
    wallet_address TEXT UNIQUE NOT NULL,
    credit_score INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des wallets
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    client_id INTEGER,
    address TEXT UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'XOF',
    type TEXT NOT NULL CHECK (type IN ('main', 'user', 'client')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    CHECK ((user_id IS NOT NULL AND client_id IS NULL) OR (user_id IS NULL AND client_id IS NOT NULL))
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    from_wallet TEXT NOT NULL,
    to_wallet TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    type TEXT NOT NULL CHECK (type IN ('transfert', 'pret', 'remboursement', 'depot', 'retrait', 'credit', 'interet')),
    category TEXT,
    description TEXT,
    interest_rate DECIMAL(5,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    validated_by INTEGER,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    validated_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (validated_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (from_wallet) REFERENCES wallets(address),
    FOREIGN KEY (to_wallet) REFERENCES wallets(address)
);

-- Table des prêts
CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    loan_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate BETWEEN 1 AND 20),
    duration INTEGER NOT NULL CHECK (duration > 0), -- en mois
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    remaining_amount DECIMAL(15,2) NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'defaulted', 'cancelled')),
    purpose TEXT,
    collateral TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_payment_date DATE,
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Table des remboursements
CREATE TABLE IF NOT EXISTS loan_repayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    payment_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    transaction_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    user_id INTEGER,
    type TEXT NOT NULL CHECK (type IN ('carte_visa', 'contrat_pret', 'piece_identite', 'justificatif_domicile', 'autre')),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    description TEXT,
    is_verified BOOLEAN DEFAULT 0,
    verified_by INTEGER,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    table_name TEXT,
    record_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger', 'success')),
    is_read BOOLEAN DEFAULT 0,
    related_entity TEXT,
    related_id INTEGER,
    action_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    data_type TEXT DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_public BOOLEAN DEFAULT 0,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des taux d'intérêt
CREATE TABLE IF NOT EXISTS interest_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_type TEXT NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    min_duration INTEGER NOT NULL,
    max_duration INTEGER NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des frais de transaction
CREATE TABLE IF NOT EXISTS transaction_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_type TEXT NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2),
    fee_type TEXT CHECK (fee_type IN ('fixed', 'percentage')),
    fee_value DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_wallet ON clients(wallet_address);
CREATE INDEX IF NOT EXISTS idx_clients_cin ON clients(cin);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_client ON wallets(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet ON transactions(from_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet ON transactions(to_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_loans_client ON loans(client_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_number ON loans(loan_number);
CREATE INDEX IF NOT EXISTS idx_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_repayments_status ON loan_repayments(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Triggers pour mettre à jour les timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_clients_timestamp 
AFTER UPDATE ON clients
BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_wallets_timestamp 
AFTER UPDATE ON wallets
BEGIN
    UPDATE wallets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_loans_timestamp 
AFTER UPDATE ON loans
BEGIN
    UPDATE loans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_repayments_timestamp 
AFTER UPDATE ON loan_repayments
BEGIN
    UPDATE loan_repayments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Données initiales
-- Admin principal
INSERT OR IGNORE INTO users (id, name, email, password, role, phone) 
VALUES (
    1, 
    'Admin Principal', 
    'admin@adouas-mc.com', 
    '$2a$10$8K1p/a0dRTlR0d.6G0Lw.OU6c7zY7QzW8QJZ8qL8qL8qL8qL8qL8q', -- admin123
    'admin', 
    '+225 07 07 07 07 07'
);

-- Wallet principal
INSERT OR IGNORE INTO wallets (id, user_id, address, balance, type) 
VALUES (
    1, 
    1, 
    'ADOUAS_MAIN_WALLET', 
    1000000000.00, 
    'main'
);

-- Paramètres système
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description, data_type, is_public) VALUES
('app_name', 'ADOUAS-MC', 'Nom de l''application', 'string', 1),
('app_version', '1.0.0', 'Version de l''application', 'string', 1),
('company_name', 'ADOUAS Micro Crédit', 'Nom de l''entreprise', 'string', 1),
('company_address', 'Abidjan, Côte d''Ivoire', 'Adresse de l''entreprise', 'string', 1),
('company_phone', '+225 27 20 21 22 23', 'Téléphone de l''entreprise', 'string', 1),
('company_email', 'contact@adouas-mc.com', 'Email de contact', 'string', 1),
('default_currency', 'XOF', 'Devise par défaut', 'string', 1),
('max_loan_amount', '5000000', 'Montant maximum de prêt', 'number', 0),
('min_loan_amount', '10000', 'Montant minimum de prêt', 'number', 0),
('default_interest_rate', '10', 'Taux d''intérêt par défaut', 'number', 0),
('transaction_fee_rate', '1', 'Frais de transaction (%)', 'number', 0);

-- Taux d'intérêt par défaut
INSERT OR IGNORE INTO interest_rates (loan_type, min_amount, max_amount, min_duration, max_duration, interest_rate) VALUES
('micro', 10000, 100000, 3, 12, 5.0),
('standard', 100001, 500000, 6, 24, 8.5),
('business', 500001, 2000000, 12, 36, 12.0),
('enterprise', 2000001, 5000000, 24, 60, 15.0);

-- Frais de transaction par défaut
INSERT OR IGNORE INTO transaction_fees (transaction_type, min_amount, max_amount, fee_type, fee_value) VALUES
('transfert', 0, 100000, 'fixed', 100),
('transfert', 100001, 1000000, 'percentage', 0.5),
('transfert', 1000001, NULL, 'percentage', 0.2),
('retrait', 0, NULL, 'percentage', 1.0),
('depot', 0, NULL, 'fixed', 0);

-- Vue pour les statistiques des clients
CREATE VIEW IF NOT EXISTS client_stats AS
SELECT 
    c.id,
    c.name,
    c.wallet_address,
    w.balance,
    (SELECT COUNT(*) FROM loans l WHERE l.client_id = c.id) as total_loans,
    (SELECT COUNT(*) FROM loans l WHERE l.client_id = c.id AND l.status = 'active') as active_loans,
    (SELECT COALESCE(SUM(l.remaining_amount), 0) FROM loans l WHERE l.client_id = c.id AND l.status = 'active') as total_debt,
    (SELECT COUNT(*) FROM transactions t JOIN wallets w ON t.from_wallet = w.address WHERE w.client_id = c.id) as total_transactions
FROM clients c
LEFT JOIN wallets w ON c.id = w.client_id;

-- Vue pour les statistiques des prêts
CREATE VIEW IF NOT EXISTS loan_stats AS
SELECT 
    l.id,
    l.loan_number,
    c.name as client_name,
    l.amount,
    l.interest_rate,
    l.total_amount,
    l.paid_amount,
    l.remaining_amount,
    l.status,
    l.start_date,
    l.end_date,
    (SELECT COUNT(*) FROM loan_repayments lr WHERE lr.loan_id = l.id AND lr.status = 'paid') as paid_installments,
    (SELECT COUNT(*) FROM loan_repayments lr WHERE lr.loan_id = l.id) as total_installments
FROM loans l
JOIN clients c ON l.client_id = c.id;

-- Vue pour les transactions détaillées
CREATE VIEW IF NOT EXISTS transaction_details AS
SELECT 
    t.*,
    fw.client_id as from_client_id,
    fc.name as from_client_name,
    tw.client_id as to_client_id,
    tc.name as to_client_name,
    uc.name as created_by_name,
    uv.name as validated_by_name
FROM transactions t
LEFT JOIN wallets fw ON t.from_wallet = fw.address
LEFT JOIN clients fc ON fw.client_id = fc.id
LEFT JOIN wallets tw ON t.to_wallet = tw.address
LEFT JOIN clients tc ON tw.client_id = tc.id
LEFT JOIN users uc ON t.created_by = uc.id
LEFT JOIN users uv ON t.validated_by = uv.id;