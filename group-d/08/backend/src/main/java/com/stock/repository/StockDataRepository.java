package com.stock.repository;

import com.stock.model.StockData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockDataRepository extends JpaRepository<StockData, Long> {
    
    List<StockData> findByCodeOrderByTimestampDesc(String code);
    
    List<StockData> findByTimestampAfterOrderByCode(LocalDateTime timestamp);
    
    List<StockData> findByCodeAndTimestampAfterOrderByTimestampDesc(String code, LocalDateTime timestamp);
}
