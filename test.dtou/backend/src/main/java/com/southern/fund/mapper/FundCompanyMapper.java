package com.southern.fund.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.southern.fund.entity.FundCompany;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FundCompanyMapper extends BaseMapper<FundCompany> {
    
    @Select("SELECT * FROM fund_company WHERE deleted = 0 ORDER BY total_asset DESC")
    List<FundCompany> selectAllActive();
}
