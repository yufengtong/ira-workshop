package com.southern.fund.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.southern.fund.entity.FundIndustry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FundIndustryMapper extends BaseMapper<FundIndustry> {
    
    @Select("SELECT * FROM fund_industry WHERE level = #{level} AND deleted = 0 ORDER BY sort_order")
    List<FundIndustry> selectByLevel(Integer level);
}
