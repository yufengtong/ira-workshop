package com.southern.fund.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.southern.fund.entity.CompanyStrategy;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface CompanyStrategyMapper extends BaseMapper<CompanyStrategy> {
    
    @Select("SELECT * FROM company_strategy WHERE company_code = #{companyCode} AND deleted = 0 LIMIT 1")
    CompanyStrategy selectByCompanyCode(@Param("companyCode") String companyCode);
}
