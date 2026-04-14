package com.southern.fund.service;

public interface DataSyncService {
    
    void syncCompanies();
    
    void syncProducts();
    
    void syncIndustries();
    
    void syncAll();
}
