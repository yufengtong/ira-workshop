-- ============================================
-- 南方基金产品布局战略系统 - 数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS fund_strategy 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE fund_strategy;

-- 基金公司表
CREATE TABLE IF NOT EXISTS fund_company (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_code VARCHAR(50) NOT NULL UNIQUE COMMENT '公司代码',
    company_name VARCHAR(200) NOT NULL COMMENT '公司名称',
    short_name VARCHAR(100) COMMENT '公司简称',
    establish_date VARCHAR(20) COMMENT '成立日期',
    total_asset DECIMAL(20, 4) DEFAULT 0 COMMENT '管理总资产(亿元)',
    product_count INT DEFAULT 0 COMMENT '产品数量',
    strategy_type VARCHAR(50) COMMENT '战略类型',
    strategy_desc TEXT COMMENT '战略描述',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_code (company_code),
    INDEX idx_total_asset (total_asset)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='基金公司信息表';

-- 基金产品表
CREATE TABLE IF NOT EXISTS fund_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ts_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'TS代码',
    name VARCHAR(200) NOT NULL COMMENT '基金名称',
    short_name VARCHAR(100) COMMENT '基金简称',
    company_code VARCHAR(50) NOT NULL COMMENT '公司代码',
    company_name VARCHAR(200) COMMENT '公司名称',
    fund_type VARCHAR(50) COMMENT '基金类型',
    invest_type VARCHAR(100) COMMENT '投资类型',
    industry_code VARCHAR(50) COMMENT '行业代码',
    industry_name VARCHAR(100) COMMENT '行业名称',
    status VARCHAR(50) COMMENT '产品状态',
    asset DECIMAL(20, 4) DEFAULT 0 COMMENT '资产规模(亿元)',
    establish_date VARCHAR(20) COMMENT '成立日期',
    issue_date VARCHAR(20) COMMENT '发行日期',
    due_date VARCHAR(20) COMMENT '到期日期',
    list_date VARCHAR(20) COMMENT '上市日期',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ts_code (ts_code),
    INDEX idx_company_code (company_code),
    INDEX idx_industry_code (industry_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='基金产品信息表';

-- 行业分类表
CREATE TABLE IF NOT EXISTS fund_industry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    industry_code VARCHAR(50) NOT NULL UNIQUE COMMENT '行业代码',
    industry_name VARCHAR(100) NOT NULL COMMENT '行业名称',
    parent_code VARCHAR(50) COMMENT '父级代码',
    level INT DEFAULT 1 COMMENT '层级',
    description TEXT COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_industry_code (industry_code),
    INDEX idx_parent_code (parent_code),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='基金行业分类表';

-- 产品状态表
CREATE TABLE IF NOT EXISTS product_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ts_code VARCHAR(50) NOT NULL COMMENT 'TS代码',
    status VARCHAR(50) COMMENT '状态',
    status_desc VARCHAR(200) COMMENT '状态描述',
    report_date VARCHAR(20) COMMENT '上报日期',
    approve_date VARCHAR(20) COMMENT '获批日期',
    issue_date VARCHAR(20) COMMENT '发行日期',
    end_date VARCHAR(20) COMMENT '结束日期',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ts_code (ts_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品状态表';

-- 公司战略分析表
CREATE TABLE IF NOT EXISTS company_strategy (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_code VARCHAR(50) NOT NULL UNIQUE COMMENT '公司代码',
    strategy_type VARCHAR(50) COMMENT '战略类型',
    strategy_name VARCHAR(100) COMMENT '战略名称',
    concentration_score DECIMAL(5, 2) DEFAULT 0 COMMENT '集中度评分',
    diversification_score DECIMAL(5, 2) DEFAULT 0 COMMENT '多元化评分',
    innovation_score DECIMAL(5, 2) DEFAULT 0 COMMENT '创新度评分',
    analysis_desc TEXT COMMENT '分析描述',
    strength_industries TEXT COMMENT '优势行业',
    weakness_industries TEXT COMMENT '劣势行业',
    opportunities TEXT COMMENT '机会领域',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_code (company_code),
    INDEX idx_strategy_type (strategy_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司战略分析表';

-- 插入示例数据 - 头部基金公司
INSERT INTO fund_company (company_code, company_name, short_name, establish_date, total_asset, product_count, strategy_type, strategy_desc) VALUES
('80000228', '易方达基金管理有限公司', '易方达基金', '2001-04-17', 16750.52, 326, 'balanced', '均衡布局，覆盖主流投资领域'),
('80000229', '华夏基金管理有限公司', '华夏基金', '1998-04-09', 14235.88, 298, 'focused', '聚焦核心能力圈，深耕优势领域'),
('80000231', '嘉实基金管理有限公司', '嘉实基金', '1999-03-25', 12890.45, 267, 'balanced', '均衡配置，稳健发展'),
('80000232', '南方基金管理股份有限公司', '南方基金', '1998-03-06', 11856.33, 245, 'balanced', '全产品线布局，综合金融服务'),
('80000233', '广发基金管理有限公司', '广发基金', '2003-08-05', 10568.92, 223, 'aggressive', '积极扩张，快速布局新兴领域'),
('80000234', '博时基金管理有限公司', '博时基金', '1998-07-13', 9876.54, 198, 'conservative', '稳健经营，注重风险控制'),
('80000235', '汇添富基金管理股份有限公司', '汇添富基金', '2005-02-03', 9234.67, 187, 'focused', '精选个股，深度研究'),
('80000236', '富国基金管理有限公司', '富国基金', '1999-04-13', 8567.89, 176, 'balanced', '均衡配置，长期价值投资'),
('80000237', '招商基金管理有限公司', '招商基金', '2002-12-27', 7890.12, 165, 'balanced', '稳健发展，客户至上'),
('80000238', '工银瑞信基金管理有限公司', '工银瑞信基金', '2005-06-21', 7234.56, 154, 'conservative', '银行系稳健风格，风险控制优先');

-- 插入示例行业数据
INSERT INTO fund_industry (industry_code, industry_name, parent_code, level, description, sort_order) VALUES
('I01', '股票型', '', 1, '主要投资于股票市场', 1),
('I02', '债券型', '', 1, '主要投资于债券市场', 2),
('I03', '混合型', '', 1, '股票和债券混合投资', 3),
('I04', '货币型', '', 1, '投资于货币市场工具', 4),
('I05', '指数型', '', 1, '跟踪特定指数表现', 5),
('I06', 'QDII', '', 1, '投资境外市场', 6),
('I07', 'FOF', '', 1, '投资基金的基金', 7),
('I08', 'REITs', '', 1, '不动产投资信托', 8),
('I09', '商品型', '', 1, '投资大宗商品', 9),
('I10', '养老目标', '', 1, '养老目标基金', 10);

-- 插入示例产品数据
INSERT INTO fund_product (ts_code, name, short_name, company_code, company_name, fund_type, invest_type, industry_code, industry_name, status, asset, establish_date) VALUES
('110022.OF', '易方达消费行业股票', '易方达消费行业', '80000228', '易方达基金', '股票型', '行业股票', 'I01', '股票型', '运作中', 285.67, '2010-08-20'),
('110011.OF', '易方达中小盘混合', '易方达中小盘', '80000228', '易方达基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 198.45, '2008-06-19'),
('110003.OF', '易方达上证50指数A', '易方达上证50A', '80000228', '易方达基金', '指数型', '被动指数', 'I05', '指数型', '运作中', 156.78, '2004-03-22'),
('110007.OF', '易方达稳健收益债券A', '易方达稳健收益A', '80000228', '易方达基金', '债券型', '混合债券', 'I02', '债券型', '运作中', 89.34, '2005-09-19'),
('000009.OF', '易方达天天理财货币A', '易方达天天理财A', '80000228', '易方达基金', '货币型', '货币市场', 'I04', '货币型', '运作中', 245.89, '2013-03-04'),
('000001.OF', '华夏成长混合', '华夏成长', '80000229', '华夏基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 67.89, '2001-12-18'),
('000011.OF', '华夏大盘精选混合', '华夏大盘精选', '80000229', '华夏基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 45.67, '2004-08-11'),
('000051.OF', '华夏沪深300指数A', '华夏沪深300A', '80000229', '华夏基金', '指数型', '被动指数', 'I05', '指数型', '运作中', 178.90, '2009-07-10'),
('000061.OF', '华夏盛世精选混合', '华夏盛世精选', '80000229', '华夏基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 34.56, '2009-12-11'),
('070002.OF', '嘉实增长混合', '嘉实增长', '80000231', '嘉实基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 56.78, '2003-07-09'),
('070003.OF', '嘉实稳健混合', '嘉实稳健', '80000231', '嘉实基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 43.21, '2003-07-09'),
('070010.OF', '嘉实主题混合', '嘉实主题', '80000231', '嘉实基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 78.90, '2006-07-21'),
('202001.OF', '南方稳健成长混合', '南方稳健成长', '80000232', '南方基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 89.12, '2001-09-28'),
('202003.OF', '南方绩优成长混合A', '南方绩优成长A', '80000232', '南方基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 67.34, '2006-11-16'),
('202007.OF', '南方隆元产业主题混合', '南方隆元', '80000232', '南方基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 45.67, '2007-11-09'),
('202009.OF', '南方盛元红利混合', '南方盛元红利', '80000232', '南方基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 34.56, '2008-03-21'),
('270002.OF', '广发稳健增长混合A', '广发稳健增长A', '80000233', '广发基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 123.45, '2004-07-26'),
('270005.OF', '广发聚丰混合A', '广发聚丰A', '80000233', '广发基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 98.76, '2005-12-23'),
('270006.OF', '广发策略优选混合', '广发策略优选', '80000233', '广发基金', '混合型', '偏股混合', 'I03', '混合型', '运作中', 76.54, '2006-05-17'),
('050002.OF', '博时沪深300指数A', '博时沪深300A', '80000234', '博时基金', '指数型', '被动指数', 'I05', '指数型', '运作中', 87.65, '2003-08-26');

-- 插入示例战略分析数据
INSERT INTO company_strategy (company_code, strategy_type, strategy_name, concentration_score, diversification_score, innovation_score, analysis_desc, strength_industries, weakness_industries, opportunities) VALUES
('80000228', 'balanced', '均衡型', 65.50, 78.30, 72.80, '易方达基金采用均衡布局战略，在股票、债券、货币等多个领域均有较强布局，产品线完整，市场份额领先。', '混合型,股票型,指数型', 'QDII,REITs', '养老目标,FOF'),
('80000229', 'focused', '聚焦型', 82.40, 45.60, 68.50, '华夏基金聚焦核心能力圈，在混合型和指数型产品领域优势明显，深耕细作，形成差异化竞争优势。', '混合型,指数型', '债券型,货币型', 'QDII,商品型'),
('80000231', 'balanced', '均衡型', 70.20, 72.50, 65.30, '嘉实基金均衡配置各类资产，注重长期价值投资，在混合型基金领域有较强的品牌影响力。', '混合型,股票型', '指数型,QDII', 'FOF,养老目标'),
('80000232', 'balanced', '均衡型', 68.80, 75.20, 70.50, '南方基金作为老牌基金公司，产品线布局均衡，在各个细分领域均有涉足，综合实力较强。', '混合型,债券型', 'QDII,商品型', 'REITs,养老目标'),
('80000233', 'aggressive', '激进型', 55.30, 85.60, 88.20, '广发基金积极扩张，快速布局新兴领域，创新产品较多，在市场热点把握上较为敏锐。', '混合型,股票型', '货币型,债券型', 'REITs,商品型,养老目标'),
('80000234', 'conservative', '保守型', 75.60, 52.30, 45.80, '博时基金稳健经营，注重风险控制，在指数型和债券型产品上有传统优势，风格相对保守。', '指数型,债券型', '股票型,QDII', 'FOF,养老目标'),
('80000235', 'focused', '聚焦型', 88.50, 38.70, 75.60, '汇添富基金精选个股，深度研究，在主动权益类产品上表现突出，形成鲜明的投资特色。', '股票型,混合型', '指数型,债券型', 'QDII,FOF'),
('80000236', 'balanced', '均衡型', 72.30, 68.90, 62.40, '富国基金均衡配置，坚持长期价值投资理念，在多个资产类别上都有稳定的表现。', '混合型,债券型', 'QDII,商品型', '养老目标,REITs'),
('80000237', 'balanced', '均衡型', 69.50, 71.20, 58.90, '招商基金稳健发展，客户服务体系完善，产品布局较为均衡，注重客户体验。', '混合型,货币型', 'QDII,商品型', 'FOF,养老目标'),
('80000238', 'conservative', '保守型', 78.20, 48.50, 42.30, '工银瑞信基金作为银行系基金公司，风格稳健，风险控制严格，在固收类产品上有传统优势。', '债券型,货币型', '股票型,QDII', '养老目标,FOF');
