package com.southern.fund.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.southern.fund.entity.ProductStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductStatusMapper extends BaseMapper<ProductStatus> {
    
    @Select("SELECT * FROM product_status WHERE ts_code = #{tsCode} AND deleted = 0 ORDER BY create_time DESC LIMIT 1")
    ProductStatus selectLatestByTsCode(@Param("tsCode") String tsCode);
    
    @Select("SELECT * FROM product_status WHERE status = #{status} AND deleted = 0")
    List<ProductStatus> selectByStatus(@Param("status") String status);
}
