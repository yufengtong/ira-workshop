package com.southern.fund.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.southern.fund.dto.IndustryDistributionDTO;
import com.southern.fund.entity.FundIndustry;

import java.util.List;

public interface FundIndustryService extends IService<FundIndustry> {
    
    List<FundIndustry> getIndustriesByLevel(Integer level);
    
    List<IndustryDistributionDTO> getIndustryDistribution();
}
