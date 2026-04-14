package com.southern.fund.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.southern.fund.entity.FundProduct;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FundProductMapper extends BaseMapper<FundProduct> {
    
    @Select("SELECT * FROM fund_product WHERE company_code = #{companyCode} AND deleted = 0")
    List<FundProduct> selectByCompanyCode(@Param("companyCode") String companyCode);
    
    @Select("SELECT * FROM fund_product WHERE industry_code = #{industryCode} AND deleted = 0")
    List<FundProduct> selectByIndustryCode(@Param("industryCode") String industryCode);
    
    @Select("SELECT * FROM fund_product WHERE status = #{status} AND deleted = 0")
    List<FundProduct> selectByStatus(@Param("status") String status);
    
    @Select("SELECT COUNT(*) FROM fund_product WHERE company_code = #{companyCode} AND status = #{status} AND deleted = 0")
    Integer countByCompanyAndStatus(@Param("companyCode") String companyCode, @Param("status") String status);
}
