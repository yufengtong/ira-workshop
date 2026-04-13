from jinja2 import Template
from datetime import datetime


SCRIPT_TEMPLATE = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API测试脚本 - {{ interface_name }}
生成时间: {{ generated_time }}
项目: {{ project_name }}
"""

import requests
import json

# 配置
BASE_URL = "{{ base_url }}"
HEADERS = {{ headers }}


def {{ function_name }}():
    """
    {{ description }}
    """
    url = f"{BASE_URL}{{ path }}"
    
    print(f"请求URL: {url}")
    print(f"请求方法: {{ method }}")
    print(f"请求头: {json.dumps(HEADERS, indent=2, ensure_ascii=False)}")
    {% if request_body %}
    print(f"请求体: {json.dumps({{ request_body }}, indent=2, ensure_ascii=False)}")
    {% endif %}
    {% if request_params %}
    print(f"请求参数: {json.dumps({{ request_params }}, indent=2, ensure_ascii=False)}")
    {% endif %}
    
    # 发送请求
    response = requests.{{ method.lower() }}(
        url=url,
        headers=HEADERS,
        {% if request_body %}json={{ request_body }},{% endif %}
        {% if request_params %}params={{ request_params }},{% endif %}
        timeout=30
    )
    
    # 打印响应
    print(f"\n状态码: {response.status_code}")
    print(f"响应头: {dict(response.headers)}")
    try:
        print(f"响应体(JSON): {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"响应体: {response.text}")
    
    # 断言
    assert response.status_code == {{ expected_status }}, f"期望状态码 {{ expected_status }}, 实际 {response.status_code}"
    {% if expected_response %}
    # 响应数据断言
    response_data = response.json()
    expected_data = {{ expected_response }}
    {% for key in expected_response.keys() %}
    assert response_data.get("{{ key }}") == expected_data.get("{{ key }}"), f"字段 '{{ key }}' 不匹配"
    {% endfor %}{% endif %}
    
    print("\\n✓ 测试通过")
    return response


if __name__ == "__main__":
    {{ function_name }}()
'''


def generate_script(project, interface, test_case):
    """生成Python requests脚本"""
    template = Template(SCRIPT_TEMPLATE)
    
    function_name = f"test_{test_case.name.replace(' ', '_').lower()}"
    
    code = template.render(
        interface_name=interface.name,
        generated_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        project_name=project.name,
        base_url=project.base_url,
        headers=interface.headers or {},
        function_name=function_name,
        description=test_case.description or test_case.name,
        path=interface.path,
        method=interface.method,
        request_body=test_case.request_body,
        request_params=test_case.request_params,
        expected_status=test_case.expected_status,
        expected_response=test_case.expected_response
    )
    
    return code


def save_script_file(project_name, test_case_name, code):
    """保存脚本文件到generated_tests目录"""
    filename = f"script_{project_name.lower()}_{test_case_name.lower().replace(' ', '_')}.py"
    filepath = f"generated_tests/{filename}"
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)
    
    return filepath, filename
